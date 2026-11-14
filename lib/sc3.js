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
      { label: 'Зачем нейтроны', text: 'Нейтроны добавляют притяжение без отталкивания. Чем тяжелее ядро, тем больше в нём нейтронов «про запас».' }
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
        [[6, 6, 'углерод-12'], [26, 30, 'железо-56'], [92, 146, 'уран-238']].forEach(function (q, j2) { var y = 80 + j2 * 105, o = G.seg(k, j2 * .25, j2 * .25 + .35); s += G.g(G.f(170, y + 22, q[2], { s: 19, a: 'end', w: 600 }) + G.rect(190, y, q[0] * 2.6, 22, PR, { rx: 4 }) + G.rect(190, y + 28, q[1] * 2.6, 22, NE, { rx: 4 }) + G.f(198 + q[0] * 2.6, y + 17, 'p: ' + q[0], { s: 15 }) + G.f(198 + q[1] * 2.6, y + 45, 'n: ' + q[1], { s: 15 }) + G.f(880, y + 34, 'N/Z = ' + n(q[1] / q[0], 2), { s: 18, a: 'end', w: 700 }), o); });
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
      { label: 'Дефект масс', text: 'Разность масс — <b>дефект масс</b>: $Δm = Z·m_p + N·m_n − M_я$. Она мала — доли процента, — поэтому на рисунке увеличена.' },
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
        var W = 700, d = (parts - q.M) / parts, mag = 10;
        s += G.f(100, 80, 'нуклоны по отдельности: ' + n(parts, 6) + ' а.е.м.', { s: 18, w: 600 }) + G.rect(100, 92, W * G.seg(k, 0, .4), 44, C.vio, { rx: 6 });
        s += G.f(100, 200, 'ядро (атом): ' + n(q.M, 6) + ' а.е.м.', { s: 18, w: 600, op: G.seg(k, .3, .5) }) + G.rect(100, 212, W * (1 - d * mag) * G.seg(k, .3, .7), 44, C.teal, { rx: 6 });
        s += G.g(G.rect(100 + W * (1 - d * mag), 212, W * d * mag, 44, 'none', { rx: 6, s: C.amb, sw: 3, d: '7 5' }) + G.f(100 + W * (1 - d * mag / 2), 290, 'Δm = ' + n(b.dm, 5) + ' а.е.м.', { s: 20, a: 'middle', w: 700, f: C.ambd }), G.seg(k, .7, .9));
        s += G.g(G.f(450, 360, 'это ' + n(100 * d, 2) + ' % массы (на рисунке разница увеличена в 10 раз)', { s: 16, a: 'middle', f: C.ink2 }), G.seg(k, .85, 1));
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
      { label: 'На один нуклон', text: 'Сравнивать ядра по полной энергии связи нечестно: у урана просто больше нуклонов. Делим на число нуклонов — получаем <b>удельную энергию связи</b>.' },
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
        var A = q.A, cnt = Math.min(A, 60), w = 700 / cnt, g = G.seg(k, .3, .8);
        s += G.f(100, 80, 'энергия связи ' + P.ELN[q.Z] + '-' + q.A + ': ' + n(b.E, 1) + ' МэВ', { s: 20, w: 700 }) + G.rect(100, 100, 700 * G.seg(k, 0, .3), 50, C.vio, { rx: 6 });
        for (j = 0; j < cnt; j++) s += G.rect(100 + j * w + 1, 200 + 20 * g * (j % 2), w - 2, 50, C.teal, { rx: 3, op: g });
        s += G.g(G.tag(450, 330, n(b.E, 1) + ' МэВ ÷ ' + q.A + ' = ' + n(b.perA, 2) + ' МэВ на нуклон', C.teal, { s: 22 }), G.seg(k, .8, 1));
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
      { label: 'Нейтрон — ключ', text: 'Заряженную частицу ядро отталкивает — её нужно сильно разгонять. Нейтрон без заряда входит в ядро свободно.' }
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
        s += nuc(700, 120, 6, 6, 10) + nuc(700, 300, 6, 6, 10);
        var f2 = G.seg(k, 0, .8), turn = 520;
        var px = 120 + (turn - 120) * Math.min(1, f2 * 1.6); if (f2 > .62) px = turn - (turn - 120) * (f2 - .62) / .38;
        s += G.circ(px, 120, 12, PR, { s: C.ink }) + G.f(60, 128, 'протон', { s: 17, w: 600 });
        s += G.circ(120 + 560 * f2, 300, 12, NE, { s: C.ink }) + G.f(60, 308, 'нейтрон', { s: 17, w: 600 });
        s += G.g(G.f(450, 80, 'оттолкнулся', { s: 18, a: 'middle', f: C.ter, w: 700 }) + G.f(450, 260, 'вошёл свободно', { s: 18, a: 'middle', f: C.teal, w: 700 }), G.seg(k, .7, 1));
      }
      return s;
    }
  };

  /* ===== Модуль 14: виды распада ===== */
  QB.steps.decay14 = {
    title: 'Три луча и правила смещения', intro: 'Пошаговый разбор: что вылетает и что становится с ядром.',
    rvb: '0 0 900 400', params: [],
    steps: [
      { label: 'Три луча', text: 'Пучок излучения радия в магнитном поле расщепляется на три. Одни частицы заряжены «+», другие «−», третьи не заряжены.' },
      { label: 'Пробивная сила', text: 'α останавливает лист бумаги, β — несколько миллиметров алюминия, γ ослабляет только толстый свинец или бетон.' },
      { label: 'α-распад', text: 'Ядро выбрасывает «кусок» из 2 протонов и 2 нейтронов: $A − 4$, $Z − 2$. Элемент сдвигается на две клетки назад.' },
      { label: 'β-распад', text: 'Внутри ядра нейтрон превращается в протон и вылетает электрон: $A$ тот же, $Z + 1$. Электрона в ядре не было — он родился.' },
      { label: 'γ-излучение', text: 'Возбуждённое ядро «спускается» на уровень ниже и испускает γ-квант. Состав ядра не меняется.' },
      { label: 'Цепочка', text: 'Уран-238 после 8 α- и 6 β-распадов становится стабильным свинцом-206.' }
    ],
    right: function (S, c) {
      var k = c.k, s = bg(), j;
      if (c.i === 0) {
        s += G.rect(60, 300, 100, 70, '#55686E', { rx: 8 }) + G.circ(110, 330, 9, '#F2C36B') + G.f(110, 392, 'радий', { s: 16, a: 'middle', w: 600 });
        for (var x = 220; x < 880; x += 70) for (var y = 40; y < 290; y += 60) s += '<path d="M' + (x - 5) + ' ' + (y - 5) + 'l10 10m0-10l-10 10" stroke="#C9D2CF" stroke-width="2"/>';
        s += G.f(880, 30, '× — поле «от нас»', { s: 14, a: 'end', f: C.ink2 });
        var f = G.seg(k, .1, .9);
        s += G.path(G.poly([[110, 300], [110, 300 - 270 * f]]), C.vio, 3, { d: '3 7' }) + G.g(G.f(124, 50, 'γ', { s: 26, f: C.vio, w: 700, i: 1 }) + G.f(124, 74, 'без заряда', { s: 15, f: C.viod }), G.seg(k, .8, 1));
        var pa = []; for (j = 0; j <= 40; j++) { var t = j / 40; pa.push([110 + 260 * t * t, 300 - 270 * t]); } s += G.path(G.poly(pa, f), C.ter, 6) + G.g(G.f(380, 50, 'α: +2e, тяжёлые', { s: 18, f: C.ter, w: 700 }), G.seg(k, .8, 1));
        var pb = []; for (j = 0; j <= 40; j++) { var t2 = j / 40; pb.push([110 - 90 * Math.sin(t2 * 1.4), 300 - 150 * t2]); } s += G.path(G.poly(pb, f), C.amb, 2.5) + G.g(G.f(20, 130, 'β: −e, лёгкие', { s: 18, f: C.ambd, w: 700 }), G.seg(k, .8, 1));
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
    rvb: '0 0 900 400', params: [{ k: 'iso', label: 'Изотоп', min: 0, max: ISO.length - 1, step: 1, value: 0, fmt: function (v) { return ISO[v][0] + ', T½ = ' + String(ISO[v][1]).replace('.', ',') + ' ' + ISO[v][2]; } }],
    steps: [
      { label: 'Половина за период', text: 'Возьмём 64 ядра. За один период полураспада распадается <b>половина</b> — 32.' },
      { label: 'Половина от оставшихся', text: 'За следующий период — половина <b>от оставшихся</b>: 16. Потом 8, 4… До нуля дело не доходит.' },
      { label: 'Кривая', text: 'На графике это плавная кривая: $N = N_0·2^{−t/T_{½}}$.' },
      { label: 'Ловушка', text: 'Частая ошибка — думать, что за два периода распадётся всё (прямая линия). На деле останется четверть.' },
      { label: 'Датирование', text: 'Пока дерево живо, углерода-14 в нём постоянная доля. После — только убывает. Измерили долю → узнали возраст.' }
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
        var frac = 100 * Math.pow(2, -3 * G.seg(k, .1, .9)), age = -Math.log2(frac / 100) * 5730;
        s += G.rect(100, 120, 170, 160, '#B48A5A', { rx: 12, s: '#7A5530', sw: 3 }) + '<circle cx="185" cy="200" r="60" fill="none" stroke="#7A5530" stroke-width="2"/><circle cx="185" cy="200" r="35" fill="none" stroke="#7A5530" stroke-width="2"/>' + G.f(185, 310, 'образец древесины', { s: 17, a: 'middle', f: C.ink2 });
        s += G.rect(360, 140, 440, 50, '#ECEFEA', { rx: 10 }) + G.rect(360, 140, 440 * frac / 100, 50, C.teal, { rx: 10 }) + G.f(370, 125, 'доля углерода-14 от исходной', { s: 17, f: C.ink2 }) + G.f(812, 176, n(frac, 1) + ' %', { s: 24, w: 700, f: C.teal });
        s += G.f(580, 260, 'возраст ≈ ' + Math.round(age / 10) * 10 + ' лет', { s: 30, a: 'middle', w: 700 });
        s += G.f(580, 300, 'T½(¹⁴C) = 5730 лет', { s: 17, a: 'middle', f: C.ink2 });
      }
      return s;
    }
  };
})();
