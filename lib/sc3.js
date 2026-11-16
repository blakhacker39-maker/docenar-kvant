/* DOCENAR • КВАНТ — разборы по шагам, часть III (1): ядро, энергия связи, реакции, распад */
(function () {
  'use strict';
  var QB = window.QB, P = QB.P, G = QB.G, C = G.C, n = G.n;
  var PR = '#F2A65A', NE = '#5CC1B8';
  function bg() { return G.rect(0, 0, 900, 400, C.paper, { rx: 0 }); }
  /* ядро из шариков */
  function nuc(cx, cy, Z, N, r, o) {
    var A = Z + N, s = '', i; r = r || 10;
    for (i = A - 1; i >= 0; i--) { var a = i * 2.39996, rr = r * 1.05 * Math.sqrt(i), isP = Math.round((i + 1) * Z / A) > Math.round(i * Z / A); s += G.circ(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, r, isP ? PR : NE, { s: C.ink, sw: .8 }); }
    return G.g(s, o);
  }
  QB.G.nuc = nuc;
  /* запись ядра в SVG */
  function note(x, y, A, Z, X, s, col) { s = s || 40; col = col || C.ink; return G.f(x - 4, y - s * .45, String(A), { s: s * .5, a: 'end', f: col, w: 600 }) + G.f(x - 4, y + s * .12, String(Z), { s: s * .5, a: 'end', f: col, w: 600 }) + G.f(x, y, X, { s: s, f: col, w: 700, m: 1 }); }
  QB.G.note = note;
  var NUCS = P.NUC.filter(function (q) { return q.A > 1; });
  var nucParam = { k: 'i', label: 'Ядро', min: 0, max: NUCS.length - 1, step: 1, value: 3, fmt: function (v) { var q = NUCS[v]; return P.ELN[q.Z] + '-' + q.A; } };

  /* ===== Модуль 10: состав ядра ===== */
  QB.steps.nuc10 = {
    title: 'Из чего сложено ядро', intro: 'Набирайте протоны и нейтроны ползунками.',
    rvb: '0 0 900 400', params: [{ k: 'Z', label: 'Протонов <i>Z</i>', min: 1, max: 30, step: 1, value: 6 }, { k: 'N', label: 'Нейтронов <i>N</i>', min: 0, max: 40, step: 1, value: 6 }],
    readout: function (S) { return '<span>элемент: <b>' + P.ELN[S.Z] + ' (' + P.EL[S.Z] + ')</b></span><span>A = Z + N = <b>' + (S.Z + S.N) + '</b></span><span>заряд ядра: <b>+' + S.Z + 'e</b></span>'; },
    steps: [
      { label: 'Внутрь атома', text: 'Атом почти пуст: в центре крошечное ядро, вокруг — электронное облако. Приблизимся к ядру.' },
      { label: 'Нуклоны', text: 'Ядро сложено из <b>протонов</b> (заряд $+e$) и <b>нейтронов</b> (без заряда). Вместе — нуклоны. Число протонов $Z$ определяет, какой это элемент.' },
      { label: 'Запись ядра', text: 'Вверху — <b>массовое число</b> $A = Z + N$ (сколько всего нуклонов), внизу — <b>зарядовое</b> $Z$ (сколько протонов).' },
      { label: 'Изотопы', text: 'Одинаковое $Z$, разное $N$ — <b>изотопы</b> одного элемента. Химически они почти одинаковы: электронов столько же.' },
      { label: 'Что держит ядро', text: 'Протоны отталкиваются. Держат ядро <b>ядерные силы</b>: огромные, но только «вплотную» — на расстояниях ~10<sup>−15</sup> м.' },
      { label: 'Карта изотопов', text: 'Меняйте N при постоянном Z, затем Z при постоянном N. В каком случае меняется химический элемент?' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), j, A = S.Z + S.N;
      if (c.i === 0) {
        var z = G.ease(k), R = 160 + 1600 * z * z, rr = P.rng(4);
        for (j = 0; j < 260; j++) { var a = rr() * 6.283, d = 160 * Math.pow(rr(), .7) * (R / 160); var x = 450 + d * Math.cos(a), y = 200 + d * Math.sin(a) * .9; if (x > 0 && x < 900 && y > 0 && y < 400) s += G.circ(x, y, 2, C.vio, { op: .4 * (1 - z) }); }
        s += nuc(450, 200, S.Z, S.N, 2 + 12 * z);
        s += G.g(G.f(450, 380, 'атом ~ 10^{−10} м', { s: 20, a: 'middle', w: 600 }), 1 - G.seg(k, .3, .5)) + G.g(G.f(450, 380, 'ядро ~ 10^{−15} м', { s: 20, a: 'middle', w: 600 }), G.seg(k, .6, .9));
      }
      if (c.i === 1) {
        s += nuc(300, 200, S.Z, S.N, Math.max(8, 16 - A / 6), G.seg(k, 0, .4));
        s += G.g(G.circ(600, 140, 16, PR, { s: C.ink }) + G.f(630, 148, 'протон: ' + S.Z, { s: 22, w: 700 }) + G.f(630, 172, 'заряд +e', { s: 16, f: C.ink2 }) + G.circ(600, 240, 16, NE, { s: C.ink }) + G.f(630, 248, 'нейтрон: ' + S.N, { s: 22, w: 700 }) + G.f(630, 272, 'без заряда', { s: 16, f: C.ink2 }), G.seg(k, .4, .7));
        s += G.g(G.tag(300, 370, 'Z = ' + S.Z + ' → ' + P.ELN[S.Z], C.teal, { s: 20 }), G.seg(k, .7, 1));
      }
      if (c.i === 2) {
        s += note(450, 230, A, S.Z, P.EL[S.Z], 120);
        s += G.g(G.arrow(260, 110, 380, 150, 1, C.amb, 3) + G.f(250, 100, 'A = Z + N = ' + A, { s: 22, a: 'end', w: 700, f: C.ambd }) + G.f(250, 126, 'всего нуклонов', { s: 16, a: 'end', f: C.ink2 }), G.seg(k, .2, .5));
        s += G.g(G.arrow(260, 300, 380, 260, 1, C.teal, 3) + G.f(250, 300, 'Z = ' + S.Z, { s: 22, a: 'end', w: 700, f: C.teal }) + G.f(250, 326, 'протонов (заряд)', { s: 16, a: 'end', f: C.ink2 }), G.seg(k, .5, .8));
        s += G.g(G.f(640, 360, 'нейтронов N = A − Z = ' + S.N, { s: 20, a: 'middle', w: 600 }), G.seg(k, .8, 1));
      }
      if (c.i === 3) {
        [[0, 'протий'], [1, 'дейтерий'], [2, 'тритий']].forEach(function (q, j2) { var x = 160 + j2 * 290, o = G.seg(k, j2 * .25, j2 * .25 + .3); s += G.g(nuc(x, 170, 1, q[0], 26) + note(x + 30, 320, 1 + q[0], 1, 'H', 52) + G.f(x, 370, q[1], { s: 20, a: 'middle', w: 600 }), o); });
        s += G.g(G.tag(450, 40, 'у всех Z = 1 — это водород', C.teal, { s: 19 }), G.seg(k, .8, 1));
      }
      if (c.i === 4) {
        var X0 = 90, Y0 = 220, W = 740, rx = function (r) { return X0 + r / 6 * W; };
        s += G.line(X0, Y0, X0 + W + 10, Y0, 1, C.ink, 2) + G.f(X0 + W, Y0 + 28, 'расстояние, фм', { s: 16, a: 'end', f: C.ink2 }) + G.f(X0, 40, 'сила между двумя протонами', { s: 18, w: 600 });
        var pc = [], pn = [];
        for (var r = .6; r <= 6; r += .05) { pc.push([rx(r), Y0 - 60 / (r * r) * 1.2]); pn.push([rx(r), Y0 + Math.min(170, 2400 * Math.exp(-r * 2.2))]); }
        s += G.path(G.poly(pc, G.seg(k, 0, .45)), C.ter, 4) + G.g(G.f(rx(3.2), Y0 - 30, 'отталкивание (электрическое)', { s: 17, f: C.ter, w: 600 }), G.seg(k, .3, .5));
        s += G.path(G.poly(pn, G.seg(k, .45, .9)), C.teal, 4) + G.g(G.f(rx(1.6), Y0 + 150, 'ядерное притяжение: огромное, но короткое', { s: 17, f: C.teal, w: 600 }), G.seg(k, .75, .95));
        s += G.g(G.line(rx(2), 60, rx(2), 390, 1, C.ink2, 1.5, '5 5') + G.f(rx(2) + 6, 76, '~2 фм', { s: 15, f: C.ink2 }), G.seg(k, .85, 1));
      }
      if (c.i === 5) {
        var z0 = Math.max(1, S.Z - 2), n0 = Math.max(0, S.N - 2);
        s += G.f(450, 35, 'Карта состава: по горизонтали N, по вертикали Z', { s: 22, a: 'middle', w: 600 });
        for (var zz = 0; zz < 5; zz++) for (var nn = 0; nn < 5; nn++) { var Z = z0 + zz, N = n0 + nn, x = 90 + nn * 95, y = 305 - zz * 55, selected = Z === S.Z && N === S.N; s += G.rect(x, y, 84, 45, selected ? '#F2C36B' : Z === S.Z ? '#DCEBEA' : C.soft, { s: selected ? C.ambd : C.line }) + G.f(x + 42, y + 29, (Z + N) + P.EL[Z], { s: 18, a: 'middle', w: selected ? 700 : 400 }); }
        s += G.arrow(85, 360, 565, 360, k, C.ink, 2) + G.f(575, 366, 'N', { s: 20 });
        s += G.arrow(70, 350, 70, 70, k, C.ink, 2) + G.f(50, 55, 'Z', { s: 20 });
        s += nuc(725, 180, S.Z, S.N, 8) + G.f(725, 300, 'Z = ' + S.Z + ' · N = ' + S.N, { s: 23, a: 'middle', w: 600 });
        s += G.f(450, 395, 'Одна строка — изотопы. Карта состава не утверждает устойчивость ядер.', { s: 18, a: 'middle' });
      }
      return s;
    }
  };

  /* ===== Модуль 11: дефект масс ===== */
  QB.steps.def11 = {
    title: 'Куда пропадает масса', intro: 'Выберите ядро — пересчитается всё.',
    rvb: '0 0 900 400', params: [nucParam],
    readout: function (S) { var q = NUCS[S.i], b = P.binding(q.Z, q.A, q.M); return '<span>Δm = <b>' + n(b.dm, 5) + ' а.е.м.</b></span><span>E<sub>св</sub> = <b>' + n(b.E, 1) + ' МэВ</b></span><span>на нуклон: <b>' + n(b.perA, 2) + ' МэВ</b></span>'; },
    steps: [
      { label: 'Взвешиваем', text: 'Кладём на весы отдельные протоны и нейтроны — и собранное из них ядро. Собранное <b>легче</b>!' },
      { label: 'Дефект масс', text: 'Выберите другой нуклид. Сравните разность масс с энергией, необходимой для разделения на составляющие.' },
      { label: 'Куда ушла масса', text: 'Когда нуклоны слипаются в ядро, вылетает гамма-квант. Он и уносит энергию $E = Δm·c^2$ — «пропавшую» массу.' },
      { label: 'Энергия связи', text: 'Чтобы разобрать ядро обратно, эту энергию нужно <b>вернуть</b>. Её называют энергией связи.' },
      { label: 'Считаем', text: 'По таблице масс атомов: $Δm = Z·m_H + N·m_n − M_{атома}$, затем $E_{св} = Δm · 931,5$ МэВ.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), q = NUCS[S.i], N = q.A - q.Z, b = P.binding(q.Z, q.A, q.M), parts = q.Z * P.C.mH + N * P.C.mn, j;
      var small = Math.max(5, Math.min(14, 60 / Math.sqrt(q.A)));
      if (c.i === 0) {
        var tilt = 6 * G.seg(k, .4, 1), rad = tilt * Math.PI / 180;
        s += G.line(450, 90, 450, 330, 1, C.ink, 6) + '<path d="M390 330h120l20 30h-160z" fill="' + C.ink + '"/>';
        var lx = 450 - 260 * Math.cos(rad), ly = 100 + 260 * Math.sin(rad), rx = 450 + 260 * Math.cos(rad), ry = 100 - 260 * Math.sin(rad);
        s += G.line(lx, ly, rx, ry, 1, C.ink, 6) + G.circ(450, 100, 10, C.amb, { s: C.ink });
        s += G.line(lx, ly, lx - 60, ly + 90, 1, C.ink2, 1.5) + G.line(lx, ly, lx + 60, ly + 90, 1, C.ink2, 1.5) + G.path('M' + (lx - 80) + ' ' + (ly + 90) + 'h160q-10 34-80 34t-80-34z', C.ink, 2, { fill: '#E7F0EE' });
        s += G.line(rx, ry, rx - 60, ry + 90, 1, C.ink2, 1.5) + G.line(rx, ry, rx + 60, ry + 90, 1, C.ink2, 1.5) + G.path('M' + (rx - 80) + ' ' + (ry + 90) + 'h160q-10 34-80 34t-80-34z', C.ink, 2, { fill: '#E7F0EE' });
        var cnt = Math.min(q.A, 16); for (j = 0; j < cnt; j++) s += G.circ(lx - 64 + (j % 8) * 18, ly + 80 - Math.floor(j / 8) * 18, 8, j < cnt * q.Z / q.A ? PR : NE, { s: C.ink, sw: .8 });
        s += nuc(rx, ry + 70, Math.min(q.Z, 8), Math.min(N, 8), 7);
        s += G.f(lx, ly + 160, 'по отдельности', { s: 18, a: 'middle', w: 600 }) + G.f(rx, ry + 160, 'ядро ' + P.EL[q.Z] + '-' + q.A, { s: 18, a: 'middle', w: 600 });
        s += G.g(G.tag(450, 40, 'части тяжелее целого!', C.ter, { s: 20 }), G.seg(k, .8, 1));
      }
      if (c.i === 1) {
        var q = NUCS[S.i], b = P.binding(q.Z, q.A, q.M), parts = q.Z * P.C.mH + (q.A - q.Z) * P.C.mn;
        s += G.f(450, 35, 'Разность масс измеряет энергию связи', { s: 23, a: 'middle', w: 600 });
        s += G.line(110, 110, 700, 110, k, C.vio, 4) + G.line(110, 300, 700, 300, k, C.teal, 4);
        s += G.f(110, 85, 'Свободные атомы H и нейтроны: ' + n(parts, 6) + ' а.е.м.', { s: 20 });
        s += G.f(110, 335, 'Собранный атом: ' + n(q.M, 6) + ' а.е.м.', { s: 20 });
        s += G.arrow(745, 115, 745, 295, G.seg(k, .3, 1), C.ter, 4);
        s += G.f(420, 195, 'Δm = ' + n(b.dm, 6) + ' а.е.м.', { s: 27, a: 'middle', w: 600 });
        s += G.f(420, 240, 'Eсв = ' + n(b.E, 2) + ' МэВ', { s: 27, a: 'middle', w: 600, f: C.teal });
        s += G.f(450, 390, 'Разрыв увеличен; электронные массы сокращаются с обеих сторон', { s: 18, a: 'middle' });
      }
      if (c.i === 2 || c.i === 3) {
        var rev = c.i === 3, f = G.seg(k, 0, .6), cl = rev ? 1 - f : f, cntN = Math.min(q.A, 20), rr = P.rng(q.A);
        for (j = 0; j < cntN; j++) { var a = rr() * 6.283, dist = 170 * (1 - cl) + 0, ang = j * 2.39996, rin = 11 * Math.sqrt(j); var x = 360 + (Math.cos(a) * dist) * (1 - cl) + Math.cos(ang) * rin * cl + Math.cos(a) * 0, y = 200 + (Math.sin(a) * dist) * (1 - cl) * .8 + Math.sin(ang) * rin * cl; s += G.circ(x, y, 10, j < cntN * q.Z / q.A ? PR : NE, { s: C.ink, sw: .8 }); }
        var g = G.seg(k, .6, 1);
        if (!rev) s += G.g(G.wave(400 + 400 * g, 150, 400 + 400 * g + 80, 150 - 40, 4, 8, C.vio, 4) + G.f(640, 90, 'γ уносит ' + n(b.E, 1) + ' МэВ', { s: 20, a: 'middle', w: 700, f: C.viod }), g > 0 ? 1 : 0);
        else s += G.g(G.arrow(760, 120, 520, 180, 1, C.amb, 6) + G.f(640, 90, 'нужно вложить ' + n(b.E, 1) + ' МэВ', { s: 20, a: 'middle', w: 700, f: C.ambd }), G.seg(k, 0, .3));
        s += G.g(G.tag(450, 370, rev ? 'энергия связи = энергия, чтобы разобрать ядро' : 'E = Δm·c^{2}: масса ушла вместе с излучением', C.teal, { s: 18 }), G.seg(k, .8, 1));
      }
      if (c.i === 4) {
        var rows = [[q.Z + ' × m_H = ' + q.Z + ' × 1,007825', n(q.Z * P.C.mH, 6)], [N + ' × m_n = ' + N + ' × 1,008665', n(N * P.C.mn, 6)], ['− масса атома', '− ' + n(q.M, 6)], ['= Δm', n(b.dm, 6) + ' а.е.м.'], ['× 931,5 МэВ', '= ' + n(b.E, 2) + ' МэВ']];
        rows.forEach(function (r, j2) { var y = 70 + j2 * 62, o = G.seg(k, j2 * .18, j2 * .18 + .2); s += G.g(G.f(120, y, r[0], { s: 22, w: j2 >= 3 ? 700 : 400, f: j2 === 4 ? C.teal : C.ink }) + G.f(800, y, r[1], { s: 22, a: 'end', w: 700, f: j2 === 4 ? C.teal : C.ink }) + (j2 === 2 ? G.line(120, y + 16, 800, y + 16, 1, C.ink, 2) : ''), o); });
      }
      return s;
    }
  };

  /* ===== Модуль 12: кривая удельной энергии связи ===== */
  QB.steps.curve12 = {
    title: 'Самые прочные ядра', intro: 'Выберите ядро — оно подсветится на кривой.',
    rvb: '0 0 900 400', params: [nucParam],
    readout: function (S) { var q = NUCS[S.i], b = P.binding(q.Z, q.A, q.M); return '<span>' + P.ELN[q.Z] + '-' + q.A + ': <b>' + n(b.perA, 2) + ' МэВ на нуклон</b></span><span>выгодно: <b>' + (q.A < 50 ? 'синтез' : q.A > 70 ? 'деление' : 'ничего — вершина') + '</b></span>'; },
    steps: [
      { label: 'На один нуклон', text: 'Полная энергия зависит и от размера ядра. Для сравнения прочности используйте энергию на один нуклон.' },
      { label: 'Кривая', text: 'Нанесём удельную энергию связи всех ядер на график. Получится холм.' },
      { label: 'Вершина', text: 'Наверху — железо и никель: самые прочные ядра (~8,8 МэВ на нуклон).' },
      { label: 'Деление', text: 'Уран делится на два средних ядра — нуклоны «поднимаются» по склону на ~0,9 МэВ каждый. Всего ~200 МэВ.' },
      { label: 'Синтез', text: 'Лёгкие ядра сливаются — подъём ещё круче: до 3,5 МэВ на нуклон.' },
      { label: 'Железо — пепел', text: 'Звёзды «сжигают» лёгкие ядра всё тяжелее и тяжелее — до железа. Дальше энергии не получить.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), q = NUCS[S.i], b = P.binding(q.Z, q.A, q.M), j;
      var X0 = 80, Y0 = 350, W = 760, H = 290, X = function (a) { return X0 + a / 240 * W; }, Y = function (e) { return Y0 - e / 9.4 * H; };
      function axes(o) { var r = G.axes(X0, Y0, W + 20, H + 20, 'массовое число A', 'МэВ на нуклон', o); [0, 60, 120, 180, 240].forEach(function (v) { r += G.f(X(v), Y0 + 22, v, { s: 14, a: 'middle', f: C.ink2, op: o }); }); [2, 4, 6, 8].forEach(function (v) { r += G.f(X0 - 8, Y(v) + 5, v, { s: 14, a: 'end', f: C.ink2, op: o }) + G.line(X0, Y(v), X0 + W, Y(v), 1, '#ECEFEA', 1); }); return r; }
      var curve = []; for (var a = 2; a <= 240; a += 2) curve.push([X(a), Y(a < 16 ? Math.min(7.1, 8.2 * (1 - Math.exp(-a / 4.2))) : P.semf(a))]);
      function dots(o, hl) { return NUCS.map(function (q2, j2) { var b2 = P.binding(q2.Z, q2.A, q2.M); return G.circ(X(q2.A), Y(b2.perA), j2 === hl ? 9 : 5, j2 === hl ? C.amb : C.teal, { s: C.ink, sw: 1, op: o }); }).join(''); }
      if (c.i === 0) {
        var q = NUCS[S.i], b = P.binding(q.Z, q.A, q.M), refs = [q, NUCS.filter(function (v) { return v.A === 56; })[0] || NUCS[0]];
        s += G.f(450, 35, 'Одинаковая шкала — разные вопросы', { s: 23, a: 'middle', w: 600 });
        refs.forEach(function (v, j2) { var bb = P.binding(v.Z, v.A, v.M), y = 110 + j2 * 150; s += G.f(80, y - 20, P.EL[v.Z] + '-' + v.A + ' · ' + v.A + ' нуклонов', { s: 20, w: 600 }) + G.rect(80, y, 300 * bb.perA / 9 * G.ease(k), 30, j2 ? C.vio : C.teal) + G.f(80, y + 62, n(bb.perA, 2) + ' МэВ на нуклон', { s: 20 }); s += nuc(560, y + 10, Math.min(v.Z, 20), Math.min(v.A - v.Z, 24), 7) + G.f(680, y + 12, 'Eсв = ' + n(bb.E, 1), { s: 20, w: 600 }) + G.f(680, y + 42, 'МэВ всего', { s: 18 }); });
        s += G.line(80, 345, 380, 345, 1, C.ink, 2); [0, 3, 6, 9].forEach(function (v) { s += G.f(80 + v / 9 * 300, 370, v, { s: 16, a: 'middle' }); });
        s += G.f(650, 390, 'Состав кластеров показан условно', { s: 16, a: 'middle', f: C.ink2 });
      }
      if (c.i >= 1) { s += axes(1) + G.path(G.poly(curve, c.i === 1 ? G.seg(k, 0, .8) : 1), '#9FB2B4', 3) + dots(c.i === 1 ? G.seg(k, .5, 1) : 1, S.i); }
      if (c.i === 2) s += G.g(G.circ(X(58), Y(8.79), 26, 'none', { s: C.amb, sw: 4 }) + G.tag(X(58) + 20, Y(8.79) - 40, 'Fe, Ni — вершина', C.ambd, { s: 18, a: 'start' }), G.seg(k, .2, .6));
      if (c.i === 3) { var u = P.binding(92, 235, P.nuclide('U', 235).M).perA; s += G.arrow(X(235), Y(u), X(120), Y(8.5), G.seg(k, 0, .6), C.ter, 5) + G.g(G.f(X(180), Y(8.5) - 30, '+0,9 МэВ на нуклон', { s: 19, f: C.ter, w: 700 }) + G.tag(X(150), Y(4), 'деление урана: ≈ 200 МэВ', C.ter, { s: 19 }), G.seg(k, .5, 1)); }
      if (c.i === 4) { s += G.arrow(X(3), Y(2), X(4), Y(7.07), G.seg(k, 0, .6), C.vio, 5) + G.g(G.f(X(12), Y(4.5), '+3,5 МэВ на нуклон!', { s: 19, f: C.viod, w: 700 }) + G.tag(X(120), Y(3), 'синтез D + T → He: 17,6 МэВ', C.vio, { s: 19 }), G.seg(k, .5, 1)); }
      if (c.i === 5) { var chain = [[4, 'He'], [12, 'C'], [16, 'O'], [28, 'Si'], [56, 'Fe']]; chain.forEach(function (q2, j2) { var o = G.seg(k, j2 * .18, j2 * .18 + .2), yy = q2[0] === 4 ? 7.07 : q2[0] === 56 ? 8.79 : P.semf(q2[0]); s += G.g(G.circ(X(q2[0]), Y(yy), 12, '#F2C36B', { s: C.ink }) + G.f(X(q2[0]), Y(yy) - 18, q2[1], { s: 17, a: 'middle', w: 700 }), o); if (j2) { var p2 = chain[j2 - 1], y2 = p2[0] === 4 ? 7.07 : P.semf(p2[0]); s += G.line(X(p2[0]), Y(y2), X(q2[0]), Y(yy), o, C.amb, 3); } }); s += G.g(G.tag(X(150), Y(5), 'на железе звезда «догорает»', C.ambd, { s: 19 }), G.seg(k, .85, 1)); }
      return s;
    }
  };

  /* ===== Модуль 13: ядерные реакции ===== */
  var RX = [
    { l: [[14, 7, 'N'], [4, 2, 'He']], r: [[17, 8, 'O'], [1, 1, 'p']], t: 'Резерфорд, 1919' },
    { l: [[9, 4, 'Be'], [4, 2, 'He']], r: [[12, 6, 'C'], [1, 0, 'n']], t: 'Чедвик, 1932: открыт нейтрон' },
    { l: [[7, 3, 'Li'], [1, 1, 'p']], r: [[4, 2, 'He'], [4, 2, 'He']], t: 'Кокрофт и Уолтон, 1932' },
    { l: [[27, 13, 'Al'], [4, 2, 'He']], r: [[30, 15, 'P'], [1, 0, 'n']], t: 'Жолио-Кюри, 1934' }];
  QB.steps.react13 = {
    title: 'Ядерная реакция по шагам', intro: 'Ползунок — какая историческая реакция.',
    rvb: '0 0 900 400', params: [{ k: 'r', label: 'Реакция', min: 0, max: RX.length - 1, step: 1, value: 0, fmt: function (v) { return RX[v].t; } }],
    steps: [
      { label: 'Снаряд и мишень', text: 'Быстрая частица врезается в ядро. Ядро перестраивается — получается <b>другое ядро</b> и вылетает частица. Элемент превратился в другой!' },
      { label: 'Считаем нуклоны', text: 'Верхние числа — нуклоны. Их сумма до и после <b>одинакова</b>: нуклоны не появляются из ниоткуда.' },
      { label: 'Считаем заряды', text: 'Нижние числа — заряды. Их сумма тоже <b>сохраняется</b>.' },
      { label: 'Ищем неизвестное', text: 'Если одна частица неизвестна — две суммы дают её $A$ и $Z$. По $Z$ узнаём, что это.' },
      { label: 'Кулоновский барьер', text: 'Нейтрон не испытывает электрического отталкивания. Вероятность реакции всё равно зависит от ядра и энергии нейтрона.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), R = RX[S.r], j;
      function eq(y, hlTop, hlBot, unk, o) {
        var items = R.l.concat([null]).concat(R.r), x = 90, r = '';
        items.forEach(function (q, j2) {
          if (!q) { r += G.f(x + 10, y, '→', { s: 44, a: 'middle', w: 700 }); x += 80; return; }
          var isU = unk && j2 === items.length - 1;
          if (j2 && items[j2 - 1]) { r += G.f(x - 20, y, '+', { s: 36, a: 'middle' }); }
          r += isU ? G.rect(x, y - 60, 90, 80, '#FBF0DC', { rx: 10, s: C.amb, sw: 3, d: '6 4' }) + G.f(x + 45, y - 4, '?', { s: 44, a: 'middle', w: 700, f: C.ambd }) : note(x + 46, y, q[0], q[1], q[2], 52, C.ink);
          if (hlTop) r += G.rect(x + 2, y - 52, 40, 26, 'none', { rx: 6, s: C.amb, sw: 3 });
          if (hlBot) r += G.rect(x + 2, y - 20, 40, 26, 'none', { rx: 6, s: C.teal, sw: 3 });
          x += 150;
        });
        return G.g(r, o);
      }
      var sa = function (arr, ix) { return arr.reduce(function (t, q) { return t + q[ix]; }, 0); };
      if (c.i === 0) {
        var f = G.seg(k, 0, .45), g = G.seg(k, .45, 1), mt = R.l[0], pj = R.l[1], p1 = R.r[0], p2 = R.r[1];
        if (k < .45) s += nuc(120 + 280 * f, 200, Math.min(pj[1], 4), pj[0] - pj[1], 10) + nuc(450, 200, Math.min(mt[1], 10), Math.min(mt[0] - mt[1], 12), 9);
        else s += nuc(450 + 120 * g, 200 - 40 * g, Math.min(p1[1], 10), Math.min(p1[0] - p1[1], 12), 9) + nuc(450 + 360 * g, 200 + 120 * g, p2[1], p2[0] - p2[1], 10);
        s += G.g(G.f(450, 370, R.t, { s: 19, a: 'middle', f: C.ink2 }), G.seg(k, .6, 1)) + eq(80, false, false, false, G.seg(k, .7, 1));
      }
      if (c.i === 1 || c.i === 2) {
        s += eq(160, c.i === 1, c.i === 2, false, 1);
        var ix = c.i === 1 ? 0 : 1, L = sa(R.l, ix), Rr = sa(R.r, ix), col = c.i === 1 ? C.ambd : C.teal;
        s += G.g(G.f(450, 270, (c.i === 1 ? 'нуклоны: ' : 'заряды: ') + R.l.map(function (q) { return q[ix]; }).join(' + ') + ' = ' + L, { s: 26, a: 'middle', w: 700, f: col }), G.seg(k, .2, .5)) + G.g(G.f(450, 320, R.r.map(function (q) { return q[ix]; }).join(' + ') + ' = ' + Rr + '  ✓', { s: 26, a: 'middle', w: 700, f: col }), G.seg(k, .5, .8));
      }
      if (c.i === 3) {
        var last = R.r[R.r.length - 1], Au = sa(R.l, 0) - R.r[0][0], Zu = sa(R.l, 1) - R.r[0][1], spin = G.seg(k, .2, .8);
        s += eq(140, false, false, true, 1);
        s += G.f(450, 250, 'A = ' + sa(R.l, 0) + ' − ' + R.r[0][0] + ' = ' + (spin > .5 ? Au : Math.floor(spin * 40) % 10), { s: 24, a: 'middle', w: 700, f: C.ambd }) + G.f(450, 290, 'Z = ' + sa(R.l, 1) + ' − ' + R.r[0][1] + ' = ' + (spin > .7 ? Zu : Math.floor(spin * 60) % 10), { s: 24, a: 'middle', w: 700, f: C.teal });
        s += G.g(G.tag(450, 350, 'неизвестная частица: ' + (Zu === 0 ? 'нейтрон' : Zu === 1 && Au === 1 ? 'протон' : P.ELN[Zu] + '-' + Au), C.teal, { s: 20 }), G.seg(k, .85, 1));
      }
      if (c.i === 4) {
        s += G.f(450, 35, 'Заряд меняет путь к ядру', { s: 23, a: 'middle', w: 600 });
        var pts = []; for (j = 0; j <= 60; j++) { var r = .5 + j / 12; pts.push([r, 1 / r]); }
        s += G.graph(100, 300, 380, 210, { x0: .5, x1: 5.5, y0: 0, y1: 2, xl: 'расстояние r, отн. ед.', yl: 'кулоновская энергия, отн. ед.', series: [{ pts: pts, col: C.ter }, { pts: [[.5, 0], [5.5, 0]], col: C.teal }], k: k });
        s += nuc(720, 160, 7, 7, 10) + G.arrow(550, 100, 660, 130, k, C.ter, 3) + G.arrow(650, 110, 570, 60, G.seg(k, .5, 1), C.ter, 3);
        s += G.circ(560 + 110 * G.ease(k), 235, 9, NE, { s: C.ink }) + G.arrow(540, 235, 700, 180, k, C.teal, 3);
        s += G.f(720, 295, 'нейтрон: q = 0', { s: 20, a: 'middle', w: 600 });
        s += G.f(450, 390, 'Нет кулоновского барьера ≠ обязательный захват нейтрона', { s: 19, a: 'middle', w: 600 });
      }
      return s;
    }
  };

  /* ===== Модуль 14: виды распада ===== */
  QB.steps.decay14 = {
    title: 'Три луча и правила смещения', intro: 'Пошаговый разбор: что вылетает и что становится с ядром.',
    rvb: '0 0 900 400', params: [],
    steps: [
      { label: 'Разделение в поле', text: 'Для частиц, летящих вправо, определите направление силы. Нейтральное γ-излучение магнитным полем не отклоняется.' },
      { label: 'Пробивная сила', text: 'α останавливает лист бумаги, β — несколько миллиметров алюминия, γ ослабляет только толстый свинец или бетон.' },
      { label: 'α-распад', text: 'Ядро выбрасывает «кусок» из 2 протонов и 2 нейтронов: $A − 4$, $Z − 2$. Элемент сдвигается на две клетки назад.' },
      { label: 'β-распад', text: 'Внутри ядра нейтрон превращается в протон и вылетает электрон: $A$ тот же, $Z + 1$. Электрона в ядре не было — он родился.' },
      { label: 'γ-излучение', text: 'Возбуждённое ядро «спускается» на уровень ниже и испускает γ-квант. Состав ядра не меняется.' },
      { label: 'Цепочка', text: 'Уран-238 после 8 α- и 6 β-распадов становится стабильным свинцом-206.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), j;
      if (c.i === 0) {
        s += G.f(450, 35, 'Магнитное поле разделяет излучения по заряду', { s: 22, a: 'middle', w: 600 });
        s += G.rect(35, 165, 100, 90, '#55686E', { s: C.ink }) + G.circ(85, 210, 15, C.amb) + G.rect(120, 200, 45, 20, C.night);
        s += G.rect(230, 70, 440, 270, '#E5EFED', { s: C.line });
        for (var yy = 100; yy < 330; yy += 60) for (var xx = 260; xx < 660; xx += 70) s += G.circ(xx, yy, 3, C.ink2);
        s += G.f(450, 65, 'B направлено к наблюдателю: •', { s: 17, a: 'middle' });
        s += G.rect(790, 70, 12, 270, '#9FB2B4') + G.f(795, 365, 'экран', { s: 18, a: 'middle' });
        s += G.path('M165 210H250Q530 210 790 300', C.amb, 4, { op: k });
        s += G.path('M165 210H250Q360 210 420 90', C.vio, 3, { op: k });
        s += G.line(165, 210, 790, 210, k, C.teal, 3);
        s += G.f(700, 285, 'α: +2e', { s: 20, f: C.ambd }) + G.f(420, 90, 'β⁻: −e', { s: 20, f: C.viod }) + G.f(700, 195, 'γ: 0', { s: 20, f: C.teal });
        s += G.f(450, 395, 'Радиусы условны: зависят также от импульса частиц', { s: 18, a: 'middle' });
      }
      if (c.i === 1) {
        var walls = [[300, 'бумага', '#F3EBD6', 8], [520, 'алюминий', '#C9D2D6', 20], [740, 'свинец', '#55686E', 50]];
        walls.forEach(function (w) { s += G.rect(w[0], 60, w[3], 280, w[2], { rx: 3, s: C.ink2 }) + G.f(w[0] + w[3] / 2, 362, w[1], { s: 16, a: 'middle', w: 600 }); });
        var f2 = G.seg(k, 0, 1);
        s += G.line(60, 110, Math.min(300, 60 + 820 * f2), 110, 1, C.ter, 8) + G.f(40, 116, 'α', { s: 24, a: 'end', f: C.ter, w: 700, i: 1 });
        s += G.line(60, 200, Math.min(520, 60 + 820 * f2), 200, 1, C.amb, 4) + G.f(40, 206, 'β', { s: 24, a: 'end', f: C.ambd, w: 700, i: 1 });
        s += G.line(60, 290, Math.min(740, 60 + 820 * f2), 290, 1, C.vio, 4, '3 6') + (f2 > .83 ? G.line(790, 290, 60 + 820 * f2, 290, 1, C.vio, 2, '3 8') : '') + G.f(40, 296, 'γ', { s: 24, a: 'end', f: C.vio, w: 700, i: 1 });
        s += G.g(G.f(860, 280, 'ослаб', { s: 15, a: 'end', f: C.viod }), G.seg(k, .9, 1));
      }
      if (c.i === 2 || c.i === 3 || c.i === 4) {
        var data = c.i === 2 ? [238, 92, 'U', 234, 90, 'Th', 'α'] : c.i === 3 ? [234, 90, 'Th', 234, 91, 'Pa', 'β'] : [60, 28, 'Ni*', 60, 28, 'Ni', 'γ'];
        var f3 = G.seg(k, .1, .6);
        s += nuc(200, 190, c.i === 4 ? 10 : 12, c.i === 4 ? 12 : 16, 9);
        if (c.i === 2) s += nuc(200 + 260 * f3, 190 - 60 * f3, 2, 2, 10);
        if (c.i === 3) { s += G.g(G.circ(200, 190, 14, 'none', { s: C.amb, sw: 4 }), 1 - f3); s += G.electron(200 + 260 * f3, 190 - 70 * f3, 11) + G.g(G.f(200 + 260 * f3, 160 - 70 * f3, 'e^{−}', { s: 18, a: 'middle', w: 700 }), f3); s += G.g(G.f(200 + 230 * f3, 250 + 40 * f3, 'антинейтрино', { s: 14, f: C.ink2 }), f3); }
        if (c.i === 4) s += G.wave(220, 180, 220 + 300 * f3, 180 - 60 * f3, 6, 10, C.vio, 4);
        s += note(560, 120, data[0], data[1], data[2], 60) + G.f(650, 105, '→', { s: 36 }) + G.g(note(760, 120, data[3], data[4], data[5], 60, C.teal), G.seg(k, .55, .8));
        var dA = data[3] - data[0], dZ = data[4] - data[1];
        s += G.g(G.f(660, 250, 'A: ' + (dA ? dA : 'без изменений'), { s: 24, a: 'middle', w: 700, f: C.ambd }) + G.f(660, 295, 'Z: ' + (dZ > 0 ? '+' + dZ : dZ ? dZ : 'без изменений'), { s: 24, a: 'middle', w: 700, f: C.teal }), G.seg(k, .7, 1));
      }
      if (c.i === 5) {
        var X0 = 100, Y0 = 350, Xn = function (nn) { return X0 + (nn - 122) / 26 * 720; }, Yz = function (z) { return Y0 - (z - 80) / 14 * 300; };
        s += G.axes(X0, Y0, 740, 320, 'нейтронов N', 'протонов Z', 1);
        var st = { Z: 92, A: 238 }, path = [[st.A - st.Z, st.Z]];
        'abbaaaaabbabba'.split('').forEach(function (ch) { st = P.decayStep(st.Z, st.A, ch === 'a' ? 'alpha' : 'beta'); path.push([st.A - st.Z, st.Z]); });
        var shown = Math.max(1, Math.round(path.length * G.seg(k, 0, .95)));
        for (j = 1; j < shown; j++) s += G.line(Xn(path[j - 1][0]), Yz(path[j - 1][1]), Xn(path[j][0]), Yz(path[j][1]), 1, path[j][1] < path[j - 1][1] ? C.ter : C.amb, 3);
        path.slice(0, shown).forEach(function (q, j2) { s += G.circ(Xn(q[0]), Yz(q[1]), j2 === 0 || j2 === path.length - 1 ? 9 : 5, j2 === 0 ? C.vio : j2 === path.length - 1 ? C.teal : '#fff', { s: C.ink }); });
        s += G.f(Xn(146) + 12, Yz(92) + 6, 'U-238', { s: 17, w: 700, f: C.viod }) + G.g(G.f(Xn(124) + 14, Yz(82) + 6, 'Pb-206', { s: 17, w: 700, f: C.teal }), G.seg(k, .9, 1));
        s += G.f(860, 290, '— α: −2 по Z и N', { s: 16, a: 'end', f: C.ter, w: 600 }) + G.f(860, 314, '— β: +1 Z, −1 N', { s: 16, a: 'end', f: C.ambd, w: 600 });
      }
      return s;
    }
  };

  /* ===== Модуль 15: закон распада ===== */
  var ISO = [['Иод-131', 8.02, 'сут'], ['Цезий-137', 30.1, 'лет'], ['Углерод-14', 5730, 'лет'], ['Радон-222', 3.82, 'сут']];
  QB.steps.law15 = {
    title: 'Закон радиоактивного распада', intro: 'Выберите изотоп — шкала времени станет его собственной.',
    rvb: '0 0 900 400', params: [{ k: 'iso', label: 'Изотоп', min: 0, max: ISO.length - 1, step: 1, value: 0, fmt: function (v) { return ISO[v][0] + ', T½ = ' + String(ISO[v][1]).replace('.', ',') + ' ' + ISO[v][2]; }, steps: [0, 1, 2, 3] }, { k: 'frac', label: 'Оставшаяся доля ¹⁴C', min: 3.125, max: 100, step: 0.125, value: 12.5, unit: '%', dec: 3, steps: [4] }],
    steps: [
      { label: 'Половина за период', text: 'Возьмём 64 ядра. За один период полураспада распадается <b>половина</b> — 32.' },
      { label: 'Половина от оставшихся', text: 'За следующий период — половина <b>от оставшихся</b>: 16. Потом 8, 4… До нуля дело не доходит.' },
      { label: 'Кривая', text: 'На графике это плавная кривая: $N = N_0·2^{−t/T_{½}}$.' },
      { label: 'Ловушка', text: 'Частая ошибка — думать, что за два периода распадётся всё (прямая линия). На деле останется четверть.' },
      { label: 'Датирование по ¹⁴C', text: 'Меняйте измеренную долю. Эта модель предполагает известную исходную долю и отсутствие обмена углеродом после гибели организма.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), j, iso = ISO[S.iso];
      if (c.i === 0 || c.i === 1) {
        var periods = c.i === 0 ? G.seg(k, .2, .8) : 1 + 2 * G.seg(k, .1, .9), alive = Math.round(64 * Math.pow(2, -Math.floor(periods + 1e-6))), rr = P.rng(15), order = [];
        for (j = 0; j < 64; j++) order.push([rr(), j]); order.sort(function (a, b) { return a[0] - b[0]; });
        var dead = {}; order.slice(0, 64 - alive).forEach(function (q) { dead[q[1]] = 1; });
        for (j = 0; j < 64; j++) s += G.circ(80 + (j % 8) * 40, 70 + Math.floor(j / 8) * 38, 14, dead[j] ? '#D8DED8' : '#F2C36B', { s: dead[j] ? '#B8C2BE' : C.ambd, sw: 1.5 });
        var per = Math.floor(periods + 1e-6);
        s += G.f(640, 120, 'прошло периодов: ' + per, { s: 24, a: 'middle', w: 700 }) + G.f(640, 170, 'осталось ядер: ' + alive, { s: 30, a: 'middle', w: 700, f: C.ambd }) + G.f(640, 215, '= ' + n(100 * alive / 64, 1) + ' %', { s: 22, a: 'middle', f: C.ink2 });
        s += G.f(640, 290, 'время: ' + n(per * iso[1], iso[1] > 100 ? 0 : 1) + ' ' + iso[2], { s: 20, a: 'middle' });
      }
      var X0 = 90, Y0 = 340, W = 740, H = 280, Xp = function (v) { return X0 + v / 5 * W; }, Yp = function (p) { return Y0 - p / 100 * H; };
      function axes() { var r = G.axes(X0, Y0, W + 20, H + 20, 't, в периодах', 'осталось, %', 1); [0, 1, 2, 3, 4, 5].forEach(function (v) { r += G.f(Xp(v), Y0 + 22, v ? v + ' T½' : '0', { s: 14, a: 'middle', f: C.ink2 }); }); [25, 50, 100].forEach(function (p) { r += G.f(X0 - 8, Yp(p) + 5, p, { s: 14, a: 'end', f: C.ink2 }); }); return r; }
      var curve = []; for (var v = 0; v <= 5.001; v += .05) curve.push([Xp(v), Yp(100 * Math.pow(2, -v))]);
      if (c.i === 2) {
        s += axes() + G.path(G.poly(curve, G.seg(k, 0, .8)), C.teal, 4);
        [1, 2, 3].forEach(function (p, j2) { var o = G.seg(k, .3 + j2 * .2, .45 + j2 * .2), yv = 100 * Math.pow(2, -p); s += G.g(G.line(Xp(p), Y0, Xp(p), Yp(yv), 1, C.ink2, 1.5, '4 4') + G.line(X0, Yp(yv), Xp(p), Yp(yv), 1, C.ink2, 1.5, '4 4') + G.circ(Xp(p), Yp(yv), 8, C.amb, { s: C.ink }) + G.f(Xp(p) + 12, Yp(yv) - 10, n(yv, 1) + ' %', { s: 18, w: 700 }), o); });
        s += G.g(G.f(860, 60, iso[0] + ': 1 T½ = ' + String(iso[1]).replace('.', ',') + ' ' + iso[2], { s: 18, a: 'end', w: 600 }), G.seg(k, .8, 1));
      }
      if (c.i === 3) {
        s += axes() + G.path(G.poly(curve), C.teal, 4);
        s += G.line(Xp(0), Yp(100), Xp(2), Yp(0), G.seg(k, 0, .4), C.ter, 3, '9 6') + G.g(G.f(Xp(1.1), Yp(55), 'неверно: «за 2 T½ — всё»', { s: 18, f: C.ter, w: 700 }), G.seg(k, .3, .5));
        s += G.g(G.circ(Xp(2), Yp(25), 10, C.amb, { s: C.ink }) + G.tag(Xp(2) + 140, Yp(25) - 40, 'на деле: осталось 25 %', C.teal, { s: 19 }), G.seg(k, .6, .9));
      }
      if (c.i === 4) {
        var frac = S.frac == null ? 12.5 : S.frac, age = -Math.log2(frac / 100) * 5730, pts = [];
        for (j = 0; j <= 100; j++) { var t = j * 300; pts.push([t / 1000, 100 * Math.pow(2, -t / 5730)]); }
        s += G.graph(100, 310, 680, 220, { x0: 0, x1: 30, y0: 0, y1: 100, xd: 1, yd: 0, xl: 'возраст, тыс. лет', yl: 'доля ¹⁴C, % от исходной', series: [{ pts: pts }], mark: [age / 1000, frac], k: k });
        s += G.f(450, 35, 'Углерод-14 · T½ = 5730 лет', { s: 22, a: 'middle', w: 600 });
        s += G.f(450, 390, n(frac, 1) + ' % → ' + n(age, 0) + ' лет; без поправки на изменение исходной доли', { s: 18, a: 'middle' });
      }
      return s;
    }
  };
})();
