/* DOCENAR • КВАНТ — разборы по шагам, часть II: атом */
(function () {
  'use strict';
  var QB = window.QB, P = QB.P, G = QB.G, C = G.C, n = G.n;
  function bg(w) { return G.rect(0, 0, w || 900, 400, C.paper, { rx: 0 }); }

  /* траектория α-частицы в поле ядра (численно), кэш по параметрам */
  var TC = {};
  function track(b, d, cx, cy, x0) {
    var key = [b, d, cx, cy].join(); if (TC[key]) return TC[key];
    var x = x0, y = cy + b, vx = 1, vy = 0, pts = [[x, y]], K = d / 2;
    for (var i = 0; i < 1600; i++) { var rx = x - cx, ry = y - cy, r = Math.hypot(rx, ry), a = K / (r * r), st = Math.min(1.2, Math.max(.04, r / 15)); vx += a * rx / r * st; vy += a * ry / r * st; x += vx * st; y += vy * st; if (i % 2 === 0) pts.push([x, y]); if (x < -20 || x > 920 || y < -20 || y > 420) break; }
    return (TC[key] = pts);
  }
  function lvl(nn, top, bot) { return bot - (bot - top) * (1 - 1 / (nn * nn)); }

  /* ===== Модуль 6: опыт Резерфорда ===== */
  QB.steps.ruth6 = {
    title: 'Опыт Резерфорда по шагам', intro: 'Меняйте заряд ядра фольги и энергию α-частиц — траектории пересчитываются.',
    rvb: '0 0 900 400', params: [{ k: 'Z', label: 'Заряд ядра фольги <i>Z</i>', min: 13, max: 92, step: 1, value: 79, fmt: function (v) { return v + ' (' + P.EL[v] + ')'; } }, { k: 'E', label: 'Энергия α-частиц', min: 3, max: 9, step: .5, value: 5, unit: 'МэВ', dec: 1 }],
    readout: function (S) { return '<span>наименьшее сближение при лобовом ударе: <b>' + n(P.closestApproach(2, S.Z, S.E), 1) + ' фм</b> (1 фм = 10<sup>−15</sup> м)</span><span>радиус атома ≈ <b>100 000 фм</b></span>'; },
    steps: [
      { label: 'Установка', text: 'Источник в свинцовом ящике даёт узкий пучок α-частиц. На пути — золотая фольга тоньше микрометра. Вокруг — экран: каждый удар даёт вспышку.' },
      { label: 'Ожидание: «пудинг»', text: 'По модели Томсона заряд размазан по всему атому. Поле внутри слабое — частицы должны пролететь <b>почти прямо</b>.' },
      { label: 'Что увидели', text: 'Почти все и правда летят прямо. Но <b>некоторые отскакивают назад</b>! Значит, где-то есть очень сильное поле в крошечной области.' },
      { label: 'Ядро', text: 'Весь положительный заряд и почти вся масса — в <b>ядре</b>. Чем ближе частица пролетает к ядру, тем сильнее её отбрасывает.' },
      { label: 'Как близко?', text: 'При лобовом ударе частица тормозится и останавливается там, где вся её энергия перешла в энергию отталкивания: $E = \\frac{kq_1q_2}{d}$. Ядро не больше этого расстояния.' },
      { label: 'Шкала размеров', text: 'Увеличьте энергию α-частиц: насколько ближе они подойдут к ядру? Размер атома при этом не меняется.' },
      { label: 'Загадка', text: 'Но по законам электродинамики вращающийся электрон должен излучать и <b>упасть на ядро</b> за 10<sup>−8</sup> с. Почему атомы живут? Ответ — на следующем занятии.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), j, d = 7 * (S.Z / 79) * (5 / S.E);
      if (c.i === 0) {
        s += G.rect(40, 160, 110, 80, '#55686E', { rx: 8 }) + G.rect(110, 190, 40, 20, C.night, { rx: 0 }) + G.circ(100, 200, 9, '#F2C36B') + G.f(95, 270, 'источник α', { s: 17, a: 'middle', w: 600 });
        s += G.rect(450, 100, 8, 200, '#E0B44A', { rx: 2 }) + G.f(454, 88, 'фольга', { s: 17, a: 'middle', w: 600 });
        s += '<circle cx="454" cy="200" r="190" fill="none" stroke="#5CC1B8" stroke-width="10" stroke-opacity=".35"/>' + G.f(740, 60, 'экран', { s: 17, f: C.teal, w: 600 });
        s += G.line(150, 200, 450, 200, G.seg(k, 0, .3), C.amb, 6);
        var rr = P.rng(3);
        for (j = 0; j < 40; j++) { var a = j < 36 ? (rr() - .5) * .25 : (j === 39 ? Math.PI * .85 : (rr() - .5) * 2.2); var o = G.seg(k, .3 + j * .015, .35 + j * .015); s += G.circ(454 + 190 * Math.cos(a), 200 + 190 * Math.sin(a), 5, j >= 36 ? C.ter : '#F2C36B', { op: o }); }
      }
      if (c.i === 1 || c.i === 2 || c.i === 3) {
        var th = c.i === 1, cx = 470, cy = 200;
        if (th) s += G.circ(cx, cy, 150, '#F6D3C8', { s: C.ter, sw: 2, op: .9 }) + [[-60, -50], [40, -80], [70, 40], [-30, 70], [-90, 20], [0, 0], [90, -20]].map(function (q) { return G.circ(cx + q[0], cy + q[1], 9, '#5C7C86'); }).join('') + G.f(cx, 380, '«пудинг»: заряд размазан', { s: 18, a: 'middle', w: 600 });
        else s += G.circ(cx, cy, 150, 'none', { s: '#9FB2B4', d: '6 6' }) + G.circ(cx, cy, 6, C.ter) + G.f(cx, 380, c.i === 3 ? 'ядро: крошечное и тяжёлое (размер увеличен)' : 'опыт: редкие — назад', { s: 18, a: 'middle', w: 600 });
        var bs = c.i === 3 ? [-60, -30, -14, -6, -2, 3, 8, 18, 40, 80] : [-150, -110, -80, -50, -25, -1.5, 20, 45, 90, 130];
        bs.forEach(function (b, j2) {
          var pts = th ? (function () { var a = [], x; for (x = 40; x <= 880; x += 20) { var dy = Math.abs(x - cx) < 150 ? Math.sin((x - cx + 150) / 300 * Math.PI) * (b > 0 ? 3 : -3) : 0; a.push([x, cy + b + dy]); } return a; })() : track(b, d * (c.i === 3 ? 1.5 : 1), cx, cy, 40);
          var col2 = th ? '#C9A23A' : (function () { var q = pts[pts.length - 1], q2 = pts[Math.max(0, pts.length - 5)], ang = Math.abs(Math.atan2(q[1] - q2[1], q[0] - q2[0])) * 180 / Math.PI; return ang > 90 ? C.ter : ang > 10 ? C.amb : '#9FB2B4'; })();
          s += G.path(G.poly(pts, G.seg(k, j2 * .04, .55 + j2 * .04)), col2, 3);
        });
        if (c.i === 2) s += G.g(G.tag(200, 40, 'почти все — прямо', '#5C7C86', { s: 17 }) + G.tag(700, 40, 'единицы — назад!', C.ter, { s: 17 }), G.seg(k, .7, 1));
        if (c.i === 3) s += G.g(G.tag(200, 40, 'ближе к ядру → сильнее отклонение', C.ink, { s: 16 }), G.seg(k, .7, 1));
      }
      if (c.i === 4) {
        var cx2 = 760, dmin = P.closestApproach(2, S.Z, S.E), sc = 520 / 80, stopX = cx2 - Math.min(560, dmin * sc) - 12;
        var ph = G.ease(k) * 2, x = ph < 1 ? 60 + (stopX - 60) * Math.sin(ph * Math.PI / 2) : stopX - (stopX - 60) * (ph - 1) * (ph - 1);
        s += G.circ(cx2, 160, 26, C.ter) + G.f(cx2, 168, '+' + S.Z, { s: 18, a: 'middle', f: '#fff', w: 700 }) + G.circ(x, 160, 14, '#F2C36B', { s: C.ambd }) + G.f(x, 166, 'α', { s: 16, a: 'middle', w: 700 });
        s += G.g(G.line(stopX, 210, cx2, 210, 1, C.vio, 3) + G.line(stopX, 200, stopX, 220, 1, C.vio, 3) + G.line(cx2, 200, cx2, 220, 1, C.vio, 3) + G.f((stopX + cx2) / 2, 240, 'd = ' + n(dmin, 1) + ' фм', { s: 20, a: 'middle', f: C.viod, w: 700 }), G.seg(k, .4, .6));
        var dist = Math.max(1, cx2 - x - 12) / sc, Ek = Math.max(0, S.E * (1 - dmin / dist)), Ep = S.E - Ek;
        s += G.f(60, 300, 'кинетическая', { s: 17, f: C.ink2 }) + G.rect(200, 284, 600 * Ek / S.E, 24, C.amb, { rx: 5 }) + G.f(60, 345, 'отталкивания', { s: 17, f: C.ink2 }) + G.rect(200, 329, 600 * Ep / S.E, 24, C.vio, { rx: 5 });
        s += G.f(810, 302, n(Ek, 1), { s: 17, a: 'end', w: 700 }) + G.f(810, 347, n(Ep, 1) + ' МэВ', { s: 17, a: 'end', w: 700 });
      }
      if (c.i === 5) {
        var closest = P.closestApproach(2, S.Z, S.E), X = function (v) { return 100 + (Math.log10(v) + 15) / 6 * 680; };
        s += G.f(450, 40, 'Одна шкала: каждый шаг увеличивает длину в 10 раз', { s: 21, a: 'middle', w: 600 });
        s += G.line(100, 220, 780, 220, k, C.ink, 3);
        for (j = -15; j <= -9; j++) { var x = X(Math.pow(10, j)); s += G.line(x, 210, x, 230, 1, C.ink, 2) + G.f(x, 260, '10^{' + j + '}', { s: 18, a: 'middle' }); }
        s += G.f(830, 225, 'м', { s: 20 });
        [[5e-15, 'ядро: порядок размера', 105, C.vio], [1e-10, 'атом', 105, C.teal], [closest * 1e-15, 'd = ' + n(closest, 1) + ' фм', 335, C.ter]].forEach(function (q) { var x = X(q[0]); s += G.circ(x, 220, 8, q[3]) + G.line(x, 220, x, q[2] + (q[2] < 220 ? 15 : -25), 1, q[3], 2) + G.f(x, q[2], q[1], { s: 17, a: 'middle', f: q[3], w: 600 }); });
        s += G.f(450, 390, 'd — предел сближения α-частицы, а не измеренный радиус ядра', { s: 18, a: 'middle' });
      }
      if (c.i === 6) {
        var cx3 = 450, cy3 = 210, turns = 4.5, f = G.ease(k), pts = [];
        for (j = 0; j <= 400 * f; j++) { var t2 = j / 400, r2 = 160 * (1 - t2) + 8, a2 = t2 * turns * 2 * Math.PI; pts.push([cx3 + r2 * Math.cos(a2), cy3 + r2 * Math.sin(a2) * .6]); }
        s += G.circ(cx3, cy3, 10, C.ter) + G.path(G.poly(pts.length > 1 ? pts : [[cx3 + 168, cy3], [cx3 + 168, cy3]]), C.vio, 2.5, { d: '4 4' });
        var last = pts[pts.length - 1] || [cx3 + 168, cy3]; s += G.electron(last[0], last[1], 11);
        for (j = 0; j < 4; j++) { var pj = pts[Math.floor(pts.length * (j + 1) / 5)]; if (pj) s += G.photon(pj[0] + 30, pj[1] - 30, '#C9A23A', -.8, 26); }
        s += G.g(G.tag(450, 370, 'по классике атом погиб бы за 10^{−8} с — а он живёт', C.ter, { s: 18 }), G.seg(k, .8, 1));
      }
      return s;
    }
  };

  /* ===== Модуль 7: постулаты Бора ===== */
  QB.steps.bohr7 = {
    title: 'Атом водорода по Бору', intro: 'Ползунок — номер уровня, на который попадает электрон.',
    rvb: '0 0 900 400', params: [{ k: 'n', label: 'Уровень <i>n</i>', min: 2, max: 5, step: 1, value: 3 }],
    readout: function (S) { var t = P.transition(S.n, 1), t2 = S.n > 2 ? P.transition(S.n, 2) : null; return '<span>E<sub>' + S.n + '</sub> = <b>' + n(P.bohrE(S.n)) + ' эВ</b></span><span>1 → ' + S.n + ': нужно <b>' + n(t.E) + ' эВ</b></span><span>ионизация с уровня ' + S.n + ': <b>' + n(-P.bohrE(S.n)) + ' эВ</b></span>' + (t2 ? '<span>' + S.n + ' → 2: λ = <b>' + n(t2.lambda, 0) + ' нм</b></span>' : ''); },
    steps: [
      { label: 'Разрешённые энергии', text: 'Выберите n. Энергия связи электрона уменьшается по модулю при приближении к границе ионизации.' },
      { label: 'Основное состояние', text: 'Нижняя ступень, $E_1 = −13,6$ эВ, — основное состояние. Минус значит: электрон связан. Чтобы освободить его, нужно 13,6 эВ — <b>энергия ионизации</b>.' },
      { label: 'Поглощение', text: 'Атом поглощает фотон, только если его энергия <b>точно равна</b> расстоянию между ступенями. Тогда электрон «прыгает» вверх.' },
      { label: 'Испускание', text: 'Наверху атом задерживается ~10<sup>−8</sup> с и прыгает вниз, выпуская фотон: $hν = E_k − E_n$. Отсюда отдельные цветные линии.' },
      { label: 'Не та порция', text: 'Фотон с энергией 8 эВ атому водорода «не подходит»: до ближайшей ступени нужно 10,2 эВ. Он просто пролетает мимо.' },
      { label: 'Орбита или облако', text: 'Бор рисовал орбиты. Сегодня знаем: траектории у электрона нет, есть <b>облако вероятности</b>. Но энергии ступеней Бор нашёл верно.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), j, top = 40, bot = 360, X1 = 380, X2 = 760;
      function ladder(o, hl) { var r = G.line(X1, top, X2, top, 1, C.ter, 2, '6 5') + G.f(X2 + 8, top + 5, '0 (свободен)', { s: 15, f: C.ter }); for (var m = 1; m <= 6; m++) { var y = lvl(m, top, bot), oo = o == null ? 1 : G.seg(o, (m - 1) * .12, (m - 1) * .12 + .2); r += G.g(G.line(X1, y, X2, y, 1, m === hl ? C.teal : C.vio, m === 1 ? 4 : 2.5) + (m <= 4 ? G.f(X1 - 10, y + 6, 'n=' + m, { s: 15, a: 'end', w: 600 }) : '') + (m <= 3 ? G.f(X2 + 8, y + 6, n(P.bohrE(m)) + ' эВ', { s: 15, f: C.ink2 }) : ''), oo); } return r; }
      if (c.i === 0) {
        s += G.f(450, 35, 'Стационарные уровни водорода', { s: 23, a: 'middle', w: 600 });
        var Y = function (e) { return 70 - e / 13.6 * 265; };
        for (j = 1; j <= 5; j++) { var en = -13.6 / (j * j), y = Y(en), sel = j === S.n; s += G.line(150, y, 590, y, G.seg(k, (j - 1) * .12, .35 + (j - 1) * .12), sel ? C.amb : C.vio, sel ? 5 : 2) + G.line(590, y, 615, 340 - j * 48, 1, C.ink2, 1) + G.f(625, 346 - j * 48, 'n = ' + j + ': ' + n(en, 2) + ' эВ', { s: 17, w: sel ? 700 : 400 }); }
        s += G.line(150, 70, 590, 70, 1, C.ink2, 2, '6 4') + G.f(150, 55, 'E = 0: свободный электрон', { s: 17 });
        s += G.electron(350, Y(-13.6 / (S.n * S.n)), 10);
        s += G.arrow(100, 335, 100, 70, 1, C.ink, 2) + G.f(65, 48, 'E, эВ', { s: 18 });
        s += G.f(450, 390, 'На выбранном уровне атом не излучает; между уровнями нет стационарных состояний', { s: 17, a: 'middle' });
      }
      if (c.i === 1) {
        s += ladder(null, 1); var y1 = lvl(1, top, bot);
        s += G.electron(570, y1 - 14, 12);
        s += G.arrow(470, y1, 470, top, G.seg(k, .3, .8), C.amb, 5) + G.g(G.f(460, (y1 + top) / 2, '13,6 эВ', { s: 22, a: 'end', w: 700, f: C.ambd }), G.seg(k, .6, .9));
        s += G.g(G.tag(180, 120, 'основное состояние', C.teal, { s: 18 }) + G.f(180, 160, 'атом может быть в нём', { s: 16, a: 'middle', f: C.ink2 }) + G.f(180, 182, 'сколько угодно долго', { s: 16, a: 'middle', f: C.ink2 }), G.seg(k, 0, .3));
      }
      if (c.i === 2) {
        s += ladder(null, S.n); var ya = lvl(1, top, bot), yb = lvl(S.n, top, bot), t = P.transition(1, S.n), ph = G.seg(k, 0, .45), jump = G.seg(k, .45, .8);
        if (k < .45) s += G.wave(40 + 360 * ph - 130, ya - 20, 40 + 360 * ph, ya - 20, 5, 12, t.color ? P.rgb(t.lambda) : C.vio, 4);
        s += G.electron(570, ya - 14 - (ya - yb) * jump, 12);
        s += G.g(G.arrow(520, ya, 520, yb, 1, C.teal, 4) + G.f(510, (ya + yb) / 2, n(t.E) + ' эВ', { s: 20, a: 'end', w: 700, f: C.teal }), G.seg(k, .45, .7));
        s += G.f(60, 380, 'фотон ' + n(t.E) + ' эВ (λ = ' + n(t.lambda, 0) + ' нм, ' + t.region + ')', { s: 17, f: C.ink2 });
      }
      if (c.i === 3) {
        s += ladder(null, S.n); var low = S.n > 2 ? 2 : 1, yu = lvl(S.n, top, bot), yd = lvl(low, top, bot), t3 = P.transition(S.n, low), fall = G.seg(k, 0, .35), fly = G.seg(k, .35, 1), colr = t3.color ? P.rgb(t3.lambda) : C.vio;
        s += G.electron(570, yu - 14 + (yd - yu) * fall, 12);
        s += G.g(G.arrow(520, yu, 520, yd, 1, C.amb, 4) + G.f(510, (yu + yd) / 2, n(t3.E) + ' эВ', { s: 20, a: 'end', w: 700, f: C.ambd }), G.seg(k, .1, .35));
        if (k > .35) s += G.wave(560 - 520 * fly, yd - 50, 560 - 520 * fly + 120, yd - 50, 5, 12, colr, 4);
        s += G.g(G.rect(40, 350, 300, 30, '#0B161B', { rx: 4 }) + (t3.color ? G.rect(40 + (t3.lambda - 380) / 400 * 300 - 3, 350, 6, 30, colr, { rx: 0 }) : '') + G.f(190, 340, t3.color ? 'линия ' + n(t3.lambda, 0) + ' нм — ' + t3.color : n(t3.lambda, 0) + ' нм — ' + t3.region + ', глазу не видна', { s: 16, a: 'middle', w: 600 }), G.seg(k, .8, 1));
      }
      if (c.i === 4) {
        s += ladder(null); var y1b = lvl(1, top, bot), y2b = lvl(2, top, bot), yh = y1b - (y1b - y2b) * 8 / 10.2;
        s += G.line(X1, yh, X2, yh, 1, C.ter, 2.5, '4 6') + G.f(X1 + 6, yh - 8, 'сюда нельзя: 8 эВ', { s: 16, f: C.ter, w: 600 });
        s += G.wave(20 + 860 * G.ease(k) - 130, y1b - 30, 20 + 860 * G.ease(k), y1b - 30, 5, 12, C.vio, 4) + G.electron(570, y1b - 14, 12);
        s += G.g(G.tag(180, 130, 'фотон 8 эВ пролетел мимо', C.ter, { s: 18 }), G.seg(k, .8, 1));
      }
      if (c.i === 5) {
        var r = 14 * S.n * S.n, ang = c.time * 2 / Math.pow(S.n, 1.5);
        s += G.f(220, 40, 'Бор, 1913: орбита', { s: 20, a: 'middle', w: 700 }) + G.f(670, 40, 'сегодня: облако', { s: 20, a: 'middle', w: 700 });
        s += G.circ(220, 220, r, 'none', { s: C.amb, sw: 2, d: '5 5' }) + G.circ(220, 220, 6, C.ter) + G.electron(220 + r * Math.cos(ang), 220 + r * Math.sin(ang), 10);
        var rr = P.rng(S.n * 11); for (j = 0; j < 420; j++) { var a3 = rr() * 6.283, rad = r * 1.3 * Math.pow(rr(), .7); s += G.circ(670 + rad * Math.cos(a3), 220 + rad * Math.sin(a3), 1.8, C.vio, { op: .55 * G.seg(k, 0, .8) }); }
        s += G.circ(670, 220, 6, C.ter) + G.line(450, 60, 450, 380, 1, C.line, 2, '6 6');
        s += G.f(450, 390, 'энергия уровня одна и та же: ' + n(P.bohrE(S.n)) + ' эВ', { s: 17, a: 'middle', f: C.ink2 });
      }
      return s;
    }
  };

  /* ===== Модуль 8: спектры ===== */
  var EL = { H: [656.3, 486.1, 434.0, 410.2], He: [667.8, 587.6, 501.6, 492.2, 471.3, 447.1], Na: [589.0, 589.6] };
  QB.steps.spec8 = {
    title: 'Спектры по шагам', intro: 'Ползунки — начальный и конечный уровни перехода в атоме водорода.',
    rvb: '0 0 900 400', params: [{ k: 'from', label: 'С уровня', min: 2, max: 6, step: 1, value: 3 }, { k: 'to', label: 'На уровень', min: 1, max: 5, step: 1, value: 2 }],
    readout: function (S) { if (S.from <= S.to) return '<span>Для испускания начальный уровень должен быть выше конечного.</span>'; var t = P.transition(S.from, S.to); return '<span>E = <b>' + n(t.E) + ' эВ</b></span><span>λ = <b>' + n(t.lambda, 1) + ' нм</b></span><span>серия <b>' + t.series + '</b></span><span><b>' + t.region + (t.color ? ', ' + t.color : '') + '</b></span>'; },
    steps: [
      { label: 'Переход → линия', text: 'Каждый переход вниз даёт фотон строго определённой длины волны. На экране спектроскопа это <b>одна тонкая линия</b>.' },
      { label: 'Серия Бальмера', text: 'Переходы на 2-й уровень дают четыре видимые линии водорода: красную, голубую, синюю, фиолетовую.' },
      { label: 'Невидимые линии', text: 'Переходы на 1-й уровень — далёкий ультрафиолет (серия Лаймана), на 3-й — инфракрасные (Пашен). Глаз их не видит, приборы видят.' },
      { label: 'Испускание и поглощение', text: 'Холодный газ на пути белого света <b>вырезает</b> из радуги ровно те линии, которые сам излучает. Места совпадают.' },
      { label: 'Отпечатки', text: 'У каждого элемента свой набор линий — как отпечаток пальца. Сравниваем — узнаём вещество.' },
      { label: 'Совпадение линий', text: 'Проследите каждую линию между двумя спектрами. Для идентификации вещества сравнивают весь набор линий.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), j, top = 40, bot = 360, LX1 = 50, LX2 = 330;
      var sx = function (l) { return 400 + (l - 380) / 400 * 460; };
      function strip(y, hgt, mode, lines, o) { var r = '', l; if (mode === 'ab') for (l = 380; l < 780; l += 4) r += '<rect x="' + sx(l).toFixed(1) + '" y="' + y + '" width="5" height="' + hgt + '" fill="' + P.rgb(l) + '"/>'; else r += G.rect(400, y, 460, hgt, '#0B161B', { rx: 0 }); (lines || []).forEach(function (q) { if (q[0] >= 380 && q[0] <= 780) r += G.rect(sx(q[0]) - 2.5, y, 5, hgt, mode === 'ab' ? '#0B161B' : P.rgb(q[0]), { rx: 0, op: q[1] == null ? 1 : q[1] }); }); return G.g(r + G.rect(400, y, 460, hgt, 'none', { rx: 0, s: '#5C7C86', sw: 1.5 }), o); }
      function ticks(y) { return [400, 500, 600, 700].map(function (v) { return G.f(sx(v), y, v + ' нм', { s: 14, a: 'middle', f: C.ink2 }); }).join(''); }
      function lev(o) { var r = ''; for (var m = 1; m <= 6; m++) { var y = lvl(m, top, bot); r += G.line(LX1, y, LX2, y, 1, C.vio, m === 1 ? 4 : 2) + (m <= 4 ? G.f(LX2 + 8, y + 5, 'n=' + m, { s: 14, f: C.ink2 }) : ''); } return G.g(r, o); }
      if (c.i === 0) {
        s += lev(1) + strip(120, 70, 'em', [], 1) + ticks(215);
        if (S.from > S.to) {
          var t = P.transition(S.from, S.to), y1 = lvl(S.from, top, bot), y2 = lvl(S.to, top, bot), colr = t.color ? P.rgb(t.lambda) : C.vio;
          s += G.arrow(190, y1, 190, y2, G.seg(k, 0, .3), C.amb, 4);
          var f = G.seg(k, .3, .75); if (k > .3 && k < .8) s += G.wave(200 + 300 * f, (y1 + y2) / 2, 200 + 300 * f + 90, (y1 + y2) / 2, 4, 10, colr, 4);
          if (t.color) s += G.g(G.rect(sx(t.lambda) - 3, 120, 6, 70, colr, { rx: 0 }) + G.f(sx(t.lambda), 112, n(t.lambda, 0) + ' нм', { s: 16, a: 'middle', w: 700 }), G.seg(k, .75, 1));
          else s += G.g(G.tag(630, 290, n(t.lambda, 0) + ' нм — ' + t.region + ', за краем полосы', C.vio, { s: 16 }), G.seg(k, .75, 1));
        } else s += G.f(450, 320, 'выберите переход сверху вниз', { s: 20, a: 'middle', f: C.ter });
      }
      if (c.i === 1) {
        s += lev(1) + strip(120, 70, 'em', [], 1) + ticks(215);
        [3, 4, 5, 6].forEach(function (m, j2) { var t = P.transition(m, 2), o = G.seg(k, j2 * .22, j2 * .22 + .25), x = 120 + j2 * 50; s += G.arrow(x, lvl(m, top, bot), x, lvl(2, top, bot), o, P.rgb(t.lambda), 4) + G.g(G.rect(sx(t.lambda) - 3, 120, 6, 70, P.rgb(t.lambda), { rx: 0 }) + G.f(sx(t.lambda), 112, n(t.lambda, 0), { s: 15, a: 'middle', w: 700 }), o); });
        s += G.g(G.f(630, 290, 'все переходы — на уровень 2', { s: 18, a: 'middle', w: 600 }), G.seg(k, .85, 1));
      }
      if (c.i === 2) {
        var Lx = function (l) { return 60 + (Math.log10(l) - 2) / (Math.log10(2000) - 2) * 780; };
        s += G.rect(Lx(100), 150, Lx(380) - Lx(100), 70, '#E4E0F2', { rx: 0 }) + G.rect(Lx(780), 150, Lx(2000) - Lx(780), 70, '#F2E2DA', { rx: 0 });
        for (var l = 380; l < 780; l += 4) s += '<rect x="' + Lx(l).toFixed(1) + '" y="150" width="3" height="70" fill="' + P.rgb(l) + '"/>';
        s += G.f((Lx(100) + Lx(380)) / 2, 140, 'ультрафиолет', { s: 17, a: 'middle', w: 600, f: C.viod }) + G.f((Lx(380) + Lx(780)) / 2, 140, 'видимый', { s: 17, a: 'middle', w: 600 }) + G.f((Lx(780) + Lx(2000)) / 2, 140, 'инфракрасный', { s: 17, a: 'middle', w: 600, f: C.ter });
        [[1, C.viod, 'Лайман (на n=1)'], [2, C.ink, 'Бальмер (на n=2)'], [3, C.ter, 'Пашен (на n=3)']].forEach(function (q, j2) { var o = G.seg(k, j2 * .3, j2 * .3 + .3); for (var m = q[0] + 1; m <= 7; m++) { var t = P.transition(m, q[0]); s += G.g(G.rect(Lx(t.lambda) - 2, 150, 4, 70, q[1], { rx: 0 }), o); } s += G.g(G.f(Lx(P.transition(q[0] + 1, q[0]).lambda), 250 + j2 * 30, q[2], { s: 16, a: 'middle', f: q[1], w: 700 }), o); });
        [100, 200, 500, 1000, 2000].forEach(function (v) { s += G.f(Lx(v), 350, v + ' нм', { s: 14, a: 'middle', f: C.ink2 }); });
      }
      if (c.i === 3) {
        var lines = EL.H.map(function (l) { return [l]; });
        s += G.f(60, 90, 'газ светится сам', { s: 18, w: 600 }) + strip(60, 60, 'em', lines, G.seg(k, 0, .4)) + G.f(60, 250, 'белый свет через холодный газ', { s: 18, w: 600 }) + strip(220, 60, 'ab', lines, G.seg(k, .35, .75)) + ticks(310);
        EL.H.forEach(function (l) { s += G.line(sx(l), 128, sx(l), 214, G.seg(k, .7, 1), C.ink2, 1.5, '3 4'); });
        s += G.g(G.tag(630, 360, 'те же места — те же переходы', C.teal, { s: 18 }), G.seg(k, .8, 1));
      }
      if (c.i === 4) {
        var rows = [['Водород', EL.H], ['Гелий', EL.He], ['Натрий', EL.Na], ['Неизвестный газ', EL.He]];
        rows.forEach(function (q, j2) { var y = 40 + j2 * 80, o = G.seg(k, j2 * .18, j2 * .18 + .25), hit = j2 === 1 && k > .85; s += G.g(G.f(380, y + 34, q[0], { s: 18, a: 'end', w: j2 === 3 || hit ? 700 : 500, f: hit ? C.teal : C.ink }) + strip(y, 50, 'em', q[1].map(function (l) { return [l]; }), 1) + (hit ? G.rect(395, y - 5, 470, 60, 'none', { rx: 8, s: C.teal, sw: 3 }) : ''), o); });
        s += G.g(G.f(380, 380, '→ гелий', { s: 22, a: 'end', w: 700, f: C.teal }), G.seg(k, .85, 1));
      }
      if (c.i === 5) {
        var X = function (l) { return 120 + (l - 380) / 400 * 670; }, tr = P.transition(Math.max(S.from, S.to), Math.min(S.from, S.to));
        s += G.f(450, 35, 'Один атом: одни и те же длины волн', { s: 22, a: 'middle', w: 600 });
        s += G.rect(120, 95, 670, 62, C.night);
        for (j = 380; j < 780; j += 4) s += G.rect(X(j), 230, 8, 62, P.rgb(j), { rx: 0 });
        [410.2, 434, 486.1, 656.3].forEach(function (l) { var x = X(l); s += G.rect(x - 3, 95, 6, 62, P.rgb(l), { rx: 0 }) + G.rect(x - 3, 230, 6, 62, C.night, { rx: 0 }) + G.line(x, 160, x, 225, k, C.ink2, 1, '4 4') + G.f(x, 320, n(l, 0), { s: 16, a: 'middle' }); });
        s += G.f(120, 80, 'Испускание: горячий разреженный газ', { s: 18 }) + G.f(120, 215, 'Поглощение: белый свет через холодный газ', { s: 18 });
        s += G.f(790, 350, 'λ, нм', { s: 18, a: 'end' });
        s += G.f(450, 390, S.from === S.to ? 'Одинаковые уровни: перехода нет' : 'Выбранный переход: ' + n(tr.lambda, 1) + ' нм', { s: 20, a: 'middle', w: 600 });
      }
      return s;
    }
  };

  /* ===== Модуль 9: лазер ===== */
  QB.steps.laser9 = {
    title: 'Как работает лазер', intro: 'Ползунок — мощность накачки: сколько атомов «подкачано» наверх.',
    rvb: '0 0 900 400', params: [{ k: 'pump', label: 'Накачка', min: 0, max: 100, step: 5, value: 70, unit: '%' }],
    readout: function (S) { var up = Math.round(S.pump * .8), dn = 100 - up; return '<span>наверху: <b>' + up + ' %</b> атомов</span><span>внизу: <b>' + dn + ' %</b></span><span>инверсия: <b>' + (up > dn ? 'есть — свет усиливается' : 'нет — свет поглощается') + '</b></span>'; },
    steps: [
      { label: 'Три процесса', text: 'Атом может <b>поглотить</b> фотон, <b>сам излучить</b> (в случайную сторону) — или излучить <b>вынужденно</b>: пролетающий фотон «сталкивает» его вниз, и вылетает точная копия.' },
      { label: 'Инверсия', text: 'Чтобы свет усиливался, наверху должно быть <b>больше</b> атомов, чем внизу. Само так не бывает — нужна накачка. Подвигайте ползунок.' },
      { label: 'Усиление или поглощение', text: 'Уменьшите накачку: почему пакет перестаёт расти? Усиление требует избытка возбуждённых атомов.' },
      { label: 'Зеркала', text: 'Два зеркала гоняют свет туда-обратно — лавина растёт на каждом проходе. Через полупрозрачное зеркало выходит луч.' },
      { label: 'Лампа и лазер', text: 'Лампа: много цветов, во все стороны, вразнобой. Лазер: один цвет, одно направление, волны «в ногу».' },
      { label: 'Осторожно!', text: 'Глаз собирает параллельный луч в крошечную точку на сетчатке. Даже слабая указка опасна: <b>не направляйте лазер в глаза</b>.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), j, RED = '#E8503A';
      function atom(x, y, up, r) { r = r || 13; return G.line(x - 20, y + 14, x + 20, y + 14, 1, C.ink2, 2) + G.line(x - 20, y - 14, x + 20, y - 14, 1, C.ink2, 2) + G.circ(x, up ? y - 14 : y + 14, 8, up ? '#B7AEE0' : '#5C7C86', { s: C.ink, sw: 1.2 }); }
      if (c.i === 0) {
        var titles = ['Поглощение', 'Спонтанное', 'Вынужденное'];
        titles.forEach(function (tt, j2) {
          var x = 150 + j2 * 300, o = G.seg(k, 0, .15); s += G.g(G.f(x, 50, tt, { s: 21, a: 'middle', w: 700 }), o) + G.line(x + 150, 70, x + 150, 360, 1, C.line, 2, '6 6');
          var a = G.seg(k, .15 + j2 * .05, .55 + j2 * .05), b = G.seg(k, .55, 1);
          if (j2 === 0) { s += atom(x, 200, a >= 1); if (a < 1) s += G.wave(x - 130 + 110 * a - 60, 200, x - 130 + 110 * a, 200, 3, 9, RED, 4); }
          if (j2 === 1) { s += atom(x, 200, a < .5); if (a >= .5) { var f = (a - .5) * 2; s += G.wave(x + 10 + 60 * f * .7, 190 - 60 * f, x + 10 + 60 * f * .7 + 40, 190 - 60 * f - 40, 3, 8, RED, 4); } }
          if (j2 === 2) { s += atom(x, 200, a < .5); var px = x - 130 + 220 * a; s += G.wave(px - 60, 170, px, 170, 3, 9, RED, 4); if (a >= .5) s += G.wave(px - 60, 230, px, 230, 3, 9, RED, 4); }
          s += G.g(G.f(x, 320, ['фотон исчез, атом наверху', 'вылетел в случайную сторону', 'было 1 — стало 2 одинаковых'][j2], { s: 16, a: 'middle', f: C.ink2 }), b);
        });
      }
      if (c.i === 1) {
        var up = S.pump * .8, dn = 100 - up, inv = up > dn;
        s += G.f(250, 50, 'сколько атомов где', { s: 20, a: 'middle', w: 700 });
        s += G.rect(120, 110, 360 * G.seg(k, 0, .5) * up / 100, 60, '#B7AEE0', { rx: 8 }) + G.f(110, 148, 'наверху', { s: 18, a: 'end' }) + G.rect(120, 220, 360 * G.seg(k, 0, .5) * dn / 100, 60, '#5C7C86', { rx: 8 }) + G.f(110, 258, 'внизу', { s: 18, a: 'end' });
        s += G.f(130 + 360 * up / 100, 148, Math.round(up) + ' %', { s: 18, w: 700 }) + G.f(130 + 360 * dn / 100, 258, Math.round(dn) + ' %', { s: 18, w: 700 });
        s += G.g(G.tag(700, 190, inv ? 'инверсия есть: свет усиливается' : 'инверсии нет: свет поглощается', inv ? C.teal : C.ter, { s: 19 }), G.seg(k, .5, .8));
        for (j = 0; j < 20; j++) s += atom(560 + (j % 10) * 32, 290 + Math.floor(j / 10) * 50, j / 20 < up / 100, 10);
      }
      if (c.i === 2) {
        var excited = S.pump * .8 / 100, inv = excited > .5, front = 100 + 680 * G.ease(k);
        s += G.f(450, 35, inv ? 'Инверсия: вынужденное излучение преобладает' : 'Без инверсии: поглощение преобладает', { s: 21, a: 'middle', w: 600 });
        for (j = 0; j < 8; j++) { var x = 150 + j * 85, wasUp = (j + .5) / 8 < excited, passed = front > x; s += atom(x, 210, passed && inv ? false : wasUp); s += G.f(x, 275, passed && wasUp && inv ? '↓ E' : wasUp ? 'E₂' : 'E₁', { s: 17, a: 'middle' }); }
        var count = inv ? 1 + Math.floor(8 * excited * G.ease(k)) : Math.max(0, 1 - Math.floor(G.ease(k) * 2));
        for (j = 0; j < count; j++) s += G.wave(front - 50, 100 + j * 12, front, 100 + j * 12, 3, 4, RED, 2.5);
        s += G.arrow(70, 315, 800, 315, k, C.ink2, 2);
        s += G.f(450, 365, 'Накачка ' + S.pump + ' % · возбуждённых ' + n(excited * 100, 0) + ' % · фотонов в пакете: ' + count, { s: 20, a: 'middle', w: 600 });
        s += G.f(450, 395, 'Схематический пакет; не расчёт мощности реального лазера', { s: 16, a: 'middle', f: C.ink2 });
      }
      if (c.i === 3) {
        var ok = S.pump * .8 > 50;
        s += G.rect(120, 110, 660, 180, '#E9EEF0', { rx: 14, s: '#9FB2B4' }) + G.rect(100, 90, 14, 220, '#D9E3E3', { rx: 0, s: C.ink2 }) + G.rect(786, 90, 14, 220, '#D9E3E3', { rx: 0, s: C.ink2, op: .6 });
        s += G.f(107, 335, 'зеркало', { s: 15, a: 'middle' }) + G.f(793, 335, 'полупрозрачное', { s: 15, a: 'middle' });
        var nph = ok ? Math.round(3 + 20 * G.ease(k)) : 2;
        for (j = 0; j < nph; j++) { var ph = ((c.time * .5) + j / nph) % 2, x = ph < 1 ? 130 + 640 * ph : 770 - 640 * (ph - 1); s += G.wave(x - 26, 130 + (j * 37) % 150, x + 26, 130 + (j * 37) % 150, 3, 6, RED, 3); }
        if (ok) s += G.rect(800, 186, 100, 28 * G.ease(k), RED, { rx: 0, op: .85 });
        s += G.tag(450, 370, ok ? 'генерация: из правого зеркала выходит луч' : 'мало накачки — луча нет', ok ? C.teal : C.ter, { s: 18 });
      }
      if (c.i === 4) {
        var rr = P.rng(9);
        s += G.circ(180, 200, 30, '#F2C36B') + G.f(180, 395, 'лампа', { s: 20, a: 'middle', w: 700 });
        for (j = 0; j < 14; j++) { var a = rr() * 6.283, l = 380 + rr() * 380; s += G.wave(180 + 40 * Math.cos(a), 200 + 40 * Math.sin(a), 180 + (40 + 140 * G.ease(k)) * Math.cos(a), 200 + (40 + 140 * G.ease(k)) * Math.sin(a), 3, 5, P.rgb(l), 2.5); }
        s += G.rect(470, 180, 70, 40, '#3B4A50', { rx: 6 }) + G.f(505, 160, 'лазер', { s: 20, a: 'middle', w: 700 });
        for (j = 0; j < 4; j++) s += G.wave(545, 188 + j * 8, 545 + 340 * G.ease(k), 188 + j * 8, 10 * G.ease(k) + .1, 4, RED, 2.5);
        s += G.g(G.f(180, 30, 'много цветов, во все стороны', { s: 16, a: 'middle', f: C.ink2 }) + G.f(700, 260, 'один цвет, одно направление', { s: 16, a: 'middle', f: C.ink2 }), G.seg(k, .6, 1));
      }
      if (c.i === 5) {
        s += '<ellipse cx="560" cy="200" rx="170" ry="150" fill="#FFF4EE" stroke="#C98D7E" stroke-width="3"/>' + '<ellipse cx="410" cy="200" rx="18" ry="62" fill="#CFE4F0" stroke="#7FA7C0" stroke-width="2"/>' + G.f(410, 120, 'хрусталик', { s: 15, a: 'middle', f: C.ink2 }) + G.f(725, 120, 'сетчатка', { s: 15, a: 'middle', f: C.ink2 });
        var f = G.seg(k, 0, .6);
        for (j = 0; j < 5; j++) { var y = 168 + j * 16; s += G.line(60, y, 410, y, f > 0 ? Math.min(1, f * 1.6) : 0, RED, 3); if (f > .6) s += G.line(410, y, 410 + (720 - 410) * 1, 200, (f - .6) / .4, RED, 3); }
        s += G.g(G.circ(722, 200, 6, '#FFEC6E', { s: RED, sw: 3 }) + G.tag(720, 300, 'вся мощность — в точку!', C.ter, { s: 18 }), G.seg(k, .7, 1));
        s += G.g(G.tag(200, 60, 'не направляйте лазер в глаза', C.ter, { s: 18 }), G.seg(k, .8, 1));
      }
      return s;
    }
  };
})();
