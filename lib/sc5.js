/* DOCENAR • КВАНТ — живые опыты (левая панель разборов по шагам). Работают непрерывно и слушают те же ползунки. */
(function () {
  'use strict';
  var QB = window.QB, P = QB.P, G = QB.G, C = G.C, n = G.n;
  var PR = '#F2A65A', NE = '#5CC1B8', RED = '#E8503A';
  function L(id, title, fn) { if (QB.steps[id]) { QB.steps[id].left = fn; QB.steps[id].leftTitle = title; } }
  var bg = function () { return G.bgSoft(600, 400) + G.rect(0, 352, 600, 48, '#E6E0D2', { rx: 0 }); };
  var dark = function () { return G.rect(0, 0, 600, 400, C.night, { rx: 0 }); };
  var W = '#E9F0EE';
  function lamp(x, y, col, on) { return G.rect(x, y, 70, 44, '#3B4A50', { rx: 9 }) + G.circ(x + 70, y + 22, 15, col, { op: on ? .95 : .2 }); }
  function meter(cx, cy, val, label, col) { var a = (-60 + 120 * G.clamp(val)) * Math.PI / 180; return G.circ(cx, cy, 34, '#fff', { s: C.ink, sw: 3 }) + '<line x1="' + cx + '" y1="' + (cy + 12) + '" x2="' + (cx + 28 * Math.sin(a)).toFixed(1) + '" y2="' + (cy + 12 - 28 * Math.cos(a)).toFixed(1) + '" stroke="' + (col || C.ter) + '" stroke-width="3.5" stroke-linecap="round"/>' + G.f(cx, cy + 54, label, { s: 14, a: 'middle', f: C.ink2 }); }
  function display(x, y, w, txt, sub) { return G.rect(x, y, w, 46, '#10221F', { rx: 8 }) + G.f(x + w / 2, y + 31, txt, { s: 22, a: 'middle', f: '#7CF0C5', w: 700 }) + (sub ? G.f(x + w / 2, y + 64, sub, { s: 14, a: 'middle', f: C.ink2 }) : ''); }

  /* 2. Фотоны: лампа и счётчик фотонов */
  L('photon2', 'источник и счётчик фотонов', function (S, c) {
    var E = P.photonE(S.lambda), col = P.rgb(S.lambda), rate = P.photonFlux(S.Pm / 1000, S.lambda), vis = rate / 2e16 * 10, s = bg(), j;
    s += lamp(30, 170, col, 1) + G.f(65, 160, 'лазер ' + S.Pm + ' мВт', { s: 15, a: 'middle' });
    var N = Math.max(2, Math.min(18, Math.round(vis))), sz = 14 + 22 * Math.min(1, E / 6);
    for (j = 0; j < N; j++) { var f = ((c.time * .5) + j / N) % 1; s += G.photon(115 + 330 * f, 192 + (j % 3 - 1) * 10, col, 0, sz); }
    s += G.rect(460, 140, 90, 110, '#55686E', { rx: 10 }) + G.circ(505, 195, 26, '#2B424B', { s: '#9FB2B4' }) + G.f(505, 270, 'датчик', { s: 15, a: 'middle' });
    s += display(80, 300, 440, QB.sci(rate, 2).replace('<sup>', '^{').replace('</sup>', '}') + ' фотонов/с');
    s += G.f(300, 60, 'один фотон: ' + n(E) + ' эВ', { s: 22, a: 'middle', w: 700 }) + G.f(300, 88, S.lambda < 380 ? 'ультрафиолет — невидим' : S.lambda > 780 ? 'инфракрасный — невидим' : 'видимый свет', { s: 16, a: 'middle', f: C.ink2 });
    return s;
  });

  /* 4. Измерение h: фотоэлемент с выбранным катодом */
  var SAMP = [2.1, 2.9, 4.3], LAMS = [250, 300, 350, 400, 450, 500];
  L('planck4', 'фотоэлемент с неизвестным катодом', function (S, c) {
    var lam = LAMS[Math.floor(c.time / 3) % LAMS.length], A = SAMP[S.smp], p = P.photo(lam, A, 50), ph = (c.time % 3) / 3, U = p.emits ? Math.min(p.Emax, p.Emax * Math.min(1, ph * 1.4)) : 0;
    var s = G.cell({ lambda: lam, I: 50, A: A }, c, { U: U });
    s += G.rect(400, 300, 190, 56, '#fff', { rx: 10, s: C.ink2 }) + G.f(495, 322, 'λ = ' + lam + ' нм', { s: 16, a: 'middle', w: 600 }) + G.f(495, 346, p.emits ? (ph > .72 ? 'U_з = ' + n(p.Uz) + ' В' : 'ищем U_з…') : 'фотоэффекта нет', { s: 16, a: 'middle', w: 700, f: p.emits ? C.teal : C.ter });
    return s;
  });

  /* 5. Давление света: крылышко на нити (опыт Лебедева) */
  L('press5', 'крылышко на тонкой нити (как у Лебедева)', function (S, c) {
    var pr = P.lightPressure(S.I, S.rho), ang = 4 + 26 * pr / P.lightPressure(3000, 1), s = dark(), j;
    s += '<ellipse cx="380" cy="200" rx="180" ry="170" fill="#22404A" stroke="#5C7C86" stroke-width="2"/>' + G.f(380, 392, 'откачанный сосуд', { s: 14, a: 'middle', f: '#9FB2B4' });
    s += G.line(380, 40, 380, 180, 1, '#C9D6D4', 1.5);
    var a = ang * Math.PI / 180, cx = 380, cy = 200, half = 110;
    var x1 = cx - half * Math.cos(a), y1 = cy - half * Math.sin(a) * .25, x2 = cx + half * Math.cos(a), y2 = cy + half * Math.sin(a) * .25;
    s += G.line(x1, y1, x2, y2, 1, '#C9D6D4', 3) + G.rect(x1 - 18, y1 - 34, 36, 68, S.rho > .5 ? '#D9E3E3' : '#11191C', { rx: 3, s: '#9FB2B4' }) + G.rect(x2 - 18, y2 - 34, 36, 68, '#55686E', { rx: 3, s: '#9FB2B4' });
    var cnt = Math.round(3 + S.I / 300);
    for (j = 0; j < cnt; j++) { var f = ((c.time * .7) + j / cnt) % 1; s += G.photon(30 + (x1 - 50) * f, y1 - 20 + (j % 4) * 13, '#FFE9A8', 0, 22); }
    s += G.f(40, 60, 'свет ' + S.I + ' Вт/м²', { s: 16, f: '#FFE9A8', w: 600 }) + G.f(40, 84, S.rho > .5 ? 'зеркальное крылышко' : 'чёрное крылышко', { s: 15, f: '#C9D6D4' });
    s += G.f(40, 340, 'поворот ≈ ' + n(ang, 0) + '° (увеличено)', { s: 16, f: '#F2C36B', w: 600 });
    return s;
  });

  /* 6. Резерфорд: вспышки на экране */
  L('ruth6', 'экран вокруг фольги: каждая вспышка — α-частица', function (S, c) {
    var s = dark(), d = 7 * (S.Z / 79) * (5 / S.E), ev = G.events(c.time, 26, 1.6, 6), cx = 300, cy = 200, R = 165, hits = 0, back = 0;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="#5CC1B8" stroke-width="12" stroke-opacity=".25"/>';
    s += G.rect(20, 185, 60, 30, '#55686E', { rx: 5 }) + G.line(80, 200, cx - 4, 200, 1, '#F2C36B', 3, '4 6') + G.rect(cx - 3, 120, 6, 160, '#E0B44A', { rx: 1 });
    ev.forEach(function (e) {
      var b = Math.abs(e.r() - .5) * 2 * 60 + .3, th = 2 * Math.atan(d / (2 * b)), sg = e.r() < .5 ? -1 : 1, a = sg * th;
      var x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), o = Math.max(0, 1 - e.age / 1.6);
      s += G.circ(x, y, 7 * o + 2, th > Math.PI / 2 ? '#F0A994' : '#FFE9A8', { op: o }); hits++; if (th > Math.PI / 2) back++;
    });
    s += G.f(300, 30, 'Z = ' + S.Z + ' (' + P.EL[S.Z] + '), ' + n(S.E, 1) + ' МэВ', { s: 17, a: 'middle', f: '#fff', w: 600 }) + G.f(300, 388, 'розовые вспышки — частицы, отброшенные назад', { s: 14, a: 'middle', f: '#F0A994' });
    return s;
  });

  /* 7. Бор: разрядная трубка и атом */
  L('bohr7', 'разрядная трубка с водородом', function (S, c) {
    var s = dark(), j, top = 210, bot = 370, lv = function (m) { return bot - (bot - top) * (1 - 1 / (m * m)); };
    var cyc = c.time % 2.4, up = cyc < 1.2, f = up ? cyc / 1.2 : (cyc - 1.2) / 1.2, nn = S.n, t = P.transition(nn, nn > 2 ? 2 : 1), col = t.color ? P.rgb(t.lambda) : '#B7AEE0';
    s += G.rect(60, 60, 480, 56, '#2B424B', { rx: 28, s: '#9CC3C4' }) + G.rect(80, 74, 440, 28, '#F06AA8', { rx: 14, op: .55 + .25 * Math.sin(c.time * 6) }) + G.rect(40, 70, 26, 36, '#8FA3A8', { rx: 3 }) + G.rect(534, 70, 26, 36, '#8FA3A8', { rx: 3 });
    s += G.f(300, 146, 'разряд возбуждает атомы → они светятся', { s: 15, a: 'middle', f: '#C9D6D4' });
    for (j = 1; j <= 5; j++) s += G.line(330, lv(j), 560, lv(j), 1, '#B7AEE0', j === 1 ? 3 : 1.5) + (j <= 3 ? G.f(325, lv(j) + 5, 'n=' + j, { s: 13, a: 'end', f: '#C9D6D4' }) : '');
    var low = nn > 2 ? 2 : 1, ey = up ? lv(low) - (lv(low) - lv(nn)) * Math.min(1, f * 2) : lv(nn) + (lv(low) - lv(nn)) * Math.min(1, f * 2);
    s += G.electron(445, ey - 9, 9);
    if (!up && f > .5) s += G.wave(460, lv(low) - 30, 460 + 120 * (f - .5) * 2, lv(low) - 60, 4, 6, col, 3);
    s += G.rect(40, 200, 230, 40, '#0B161B', { rx: 4 }); [656.3, 486.1, 434, 410.2].forEach(function (l) { s += G.rect(40 + (l - 380) / 400 * 230 - 2, 200, 4, 40, P.rgb(l), { rx: 0, op: Math.abs(l - t.lambda) < 1 ? 1 : .45 }); });
    s += G.f(155, 260, 'спектр трубки', { s: 14, a: 'middle', f: '#C9D6D4' }) + G.f(155, 300, nn + ' → ' + low + ': ' + n(t.lambda, 0) + ' нм', { s: 18, a: 'middle', f: '#fff', w: 700 });
    return s;
  });

  /* 8. Спектроскоп */
  L('spec8', 'спектроскоп: трубка → призма → экран', function (S, c) {
    var s = dark(), j, ok = S.from > S.to, t = ok ? P.transition(S.from, S.to) : null;
    s += G.rect(20, 160, 110, 40, '#2B424B', { rx: 20, s: '#9CC3C4' }) + G.rect(30, 168, 90, 24, '#F06AA8', { rx: 12, op: .7 }) + G.f(75, 228, 'водород', { s: 14, a: 'middle', f: '#C9D6D4' });
    s += G.line(130, 180, 230, 180, 1, '#fff', 4) + '<path d="M260 110L320 250H200Z" fill="#9CC9C4" fill-opacity=".5" stroke="#EAF6F4" stroke-width="2"/>';
    var lines = [656.3, 486.1, 434, 410.2]; if (t && lines.indexOf(Math.round(t.lambda * 10) / 10) < 0 && t.color) lines.push(t.lambda);
    lines.forEach(function (l, i2) { var y = 120 + (l - 380) / 400 * 200, hl = t && Math.abs(l - t.lambda) < 1.5; s += G.line(290, 182, 520, y, 1, P.rgb(l), hl ? 4 : 2) + G.rect(520, y - 3, 50, 6, P.rgb(l), { rx: 1, op: hl ? 1 : .55 }); if (hl) s += G.f(512, y + 5, n(l, 0) + ' нм', { s: 15, a: 'end', f: '#fff', w: 700 }); });
    s += G.rect(516, 100, 58, 240, 'none', { rx: 4, s: '#5C7C86' }) + G.f(545, 360, 'экран', { s: 14, a: 'middle', f: '#C9D6D4' });
    s += G.f(300, 40, t ? (t.color ? 'выбранная линия: ' + n(t.lambda, 0) + ' нм' : n(t.lambda, 0) + ' нм — ' + t.region + ', на экране не видна') : 'выберите переход сверху вниз', { s: 17, a: 'middle', f: '#fff', w: 600 });
    s += G.photon(160 + ((c.time * 60) % 60), 180, '#fff', 0, 22);
    return s;
  });

  /* 9. Лазер на стене */
  L('laser9', 'лазер и пятно на стене', function (S, c) {
    var s = dark(), on = S.pump * .8 > 52, pw = on ? (S.pump - 65) / 35 : 0, j, rr = P.rng(Math.floor(c.time * 4));
    s += G.rect(30, 180, 120, 50, '#3B4A50', { rx: 8 }) + G.rect(150, 196, 14, 18, '#55686E', { rx: 2 }) + G.f(90, 260, 'накачка ' + S.pump + ' %', { s: 15, a: 'middle', f: '#C9D6D4' });
    s += G.rect(30, 172, 120 * S.pump / 100, 6, '#B7AEE0', { rx: 3 });
    s += G.rect(540, 60, 40, 300, '#3A5560', { rx: 4 }) + G.f(560, 380, 'стена', { s: 14, a: 'middle', f: '#C9D6D4' });
    if (on) { s += G.line(164, 205, 540, 205, 1, RED, 2 + 2 * pw) + '<circle cx="540" cy="205" r="' + (8 + 6 * pw).toFixed(1) + '" fill="#FFB1A3"/>' + G.circ(540, 205, 4, '#fff'); for (j = 0; j < 14; j++) s += G.circ(170 + rr() * 360, 195 + rr() * 20, 1.5, '#FFD0C8', { op: rr() }); }
    else s += G.f(350, 205, 'генерации нет — луча нет', { s: 18, a: 'middle', f: '#F0A994', w: 600 });
    s += G.f(300, 40, on ? 'лазер работает: узкий луч, одно пятно' : 'добавьте накачку', { s: 18, a: 'middle', f: '#fff', w: 600 });
    return s;
  });

  var NUCS = P.NUC.filter(function (q) { return q.A > 1; });

  /* 10. Масс-спектрометр: изотопы разделяются по массе */
  L('nuc10', 'масс-спектрометр: ионы отклоняются по массе', function (S, c) {
    var s = bg(), A = S.Z + S.N, j, X0 = 60, Y0 = 330;
    s += G.rect(30, 310, 60, 40, '#55686E', { rx: 6 }) + G.f(60, 370, 'ионы', { s: 14, a: 'middle' });
    s += G.rect(100, 40, 480, 280, '#E9EEF0', { rx: 14, s: C.ink2 }) + G.f(340, 30, 'магнитное поле', { s: 14, a: 'middle', f: C.ink2 }) + G.rect(100, 320, 480, 10, C.ink, { rx: 2 });
    var iso = [A - 1, A, A + 1].filter(function (a) { return a >= S.Z && a > 0; });
    iso.forEach(function (a, j2) {
      var R = 60 + a * (170 / Math.max(10, A + 2)), main = a === A, col = main ? C.teal : '#9FB2B4', ph = (c.time * .35 + j2 * .3) % 1, pts = [];
      for (var t2 = 0; t2 <= Math.PI; t2 += .05) pts.push([100 + R - R * Math.cos(t2), 320 - R * Math.sin(t2) * .85]);
      s += G.path(G.poly(pts), col, main ? 3 : 1.5, { d: main ? null : '5 5' });
      var k = Math.floor(ph * (pts.length - 1)); s += G.circ(pts[k][0], pts[k][1], main ? 8 : 6, main ? PR : '#C9D2CF', { s: C.ink, sw: 1 });
      s += G.rect(100 + 2 * R - 6, 316, 12, 16, col, { rx: 2 }) + G.f(100 + 2 * R, 352, (main ? '' : '') + a, { s: main ? 18 : 14, a: 'middle', w: main ? 700 : 400, f: col });
    });
    s += G.f(340, 74, P.ELN[S.Z] + '-' + A + ': тяжелее → шире дуга', { s: 17, a: 'middle', w: 700 });
    return s;
  });

  /* 11. Весы: сборка ядра и вспышка */
  L('def11', 'сборка ядра: нуклоны → ядро + γ', function (S, c) {
    var q = NUCS[S.i], N = q.A - q.Z, b = P.binding(q.Z, q.A, q.M), s = bg(), cyc = c.time % 4, f = Math.min(1, cyc / 2), cnt = Math.min(q.A, 20), rr = P.rng(q.A * 3), j;
    for (j = 0; j < cnt; j++) { var a = rr() * 6.283, d = 160 * (1 - f), ang = j * 2.39996, rin = 9 * Math.sqrt(j); s += G.circ(300 + Math.cos(a) * d + Math.cos(ang) * rin * f, 170 + Math.sin(a) * d * .7 + Math.sin(ang) * rin * f, 9, j < cnt * q.Z / q.A ? PR : NE, { s: C.ink, sw: .8 }); }
    if (cyc > 2 && cyc < 3.4) { var g = (cyc - 2) / 1.4; s += G.circ(300, 170, 40 * (1 - g) + 6, '#FFF0B8', { op: 1 - g }) + G.wave(320, 160, 320 + 240 * g, 160 - 100 * g, 4, 7, C.vio, 3.5); }
    var m1 = q.Z * P.C.mH + N * P.C.mn, cur = cyc < 2 ? m1 : q.M;
    s += display(130, 300, 340, n(cur, 6) + ' а.е.м.', cyc < 2 ? 'масса частей' : 'масса ядра (атома): легче на ' + n(b.dm, 4));
    s += G.f(300, 36, P.ELN[q.Z] + '-' + q.A + ': уходит ' + n(b.E, 1) + ' МэВ', { s: 19, a: 'middle', w: 700 });
    return s;
  });

  /* 12. Выбранное ядро: делится, сливается или стоит */
  L('curve12', 'что выгодно этому ядру', function (S, c) {
    var q = NUCS[S.i], b = P.binding(q.Z, q.A, q.M), s = bg(), cyc = (c.time % 3) / 3, Z = Math.min(q.Z, 14), N = Math.min(q.A - q.Z, 16), mode = q.A < 50 ? 'fus' : q.A > 70 ? 'fis' : 'top';
    if (mode === 'fis') { var sp = Math.max(0, (cyc - .3) / .7); s += sp ? G.nuc(300 - 110 * sp, 170, Math.ceil(Z / 2), Math.ceil(N / 2), 8) + G.nuc(300 + 110 * sp, 170, Math.floor(Z / 2), Math.floor(N / 2), 8) : G.nuc(300, 170, Z, N, 8); }
    else if (mode === 'fus') { var cl = Math.min(1, cyc / .6); s += cl < 1 ? G.nuc(300 - 120 * (1 - cl), 170, Math.max(1, Math.ceil(Z / 2)), Math.ceil(N / 2), 9) + G.nuc(300 + 120 * (1 - cl), 170, Math.max(1, Math.floor(Z / 2)), Math.floor(N / 2), 9) : G.nuc(300, 170, Z, N, 9) + G.circ(300, 170, 50 * (1 - (cyc - .6) / .4), '#FFF0B8', { op: .8 * (1 - (cyc - .6) / .4) }); }
    else s += G.nuc(300, 170, Z, N, 8) + G.circ(300, 170, 70 + 6 * Math.sin(c.time * 3), 'none', { s: C.amb, sw: 3, d: '6 6' });
    s += G.tag(300, 310, mode === 'fis' ? 'тяжёлое: выгодно делиться' : mode === 'fus' ? 'лёгкое: выгодно сливаться' : 'вершина: энергию не получить', mode === 'top' ? C.ambd : mode === 'fis' ? C.ter : C.vio, { s: 19 });
    s += G.f(300, 40, P.ELN[q.Z] + '-' + q.A + ': ' + n(b.perA, 2) + ' МэВ на нуклон', { s: 19, a: 'middle', w: 700 });
    return s;
  });

  /* 13. Пучок на мишень */
  var RXL = [['α', 'N', 'p'], ['α', 'Be', 'n'], ['p', 'Li', 'α α'], ['α', 'Al', 'n']];
  L('react13', 'пучок частиц бьёт в мишень', function (S, c) {
    var s = dark(), rx = RXL[S.r], ev = G.events(c.time, 3, 1.2, S.r + 3), j;
    s += G.rect(20, 175, 110, 50, '#55686E', { rx: 8 }) + G.f(75, 248, 'пучок ' + rx[0], { s: 15, a: 'middle', f: '#C9D6D4' });
    for (j = 0; j < 6; j++) s += G.circ(140 + ((c.time * 260 + j * 40) % 240), 200, 5, '#F2C36B');
    s += G.rect(380, 120, 20, 160, '#8C9EA2', { rx: 3 }) + G.f(390, 300, 'мишень ' + rx[1], { s: 15, a: 'middle', f: '#C9D6D4' });
    ev.forEach(function (e) { var a = (e.r() - .5) * 2.4, d = 30 + e.age * 260, o = 1 - e.age / 1.2; s += G.circ(390 + d * Math.cos(a), 200 + d * Math.sin(a), 6, '#5CC1B8', { op: o }) + G.circ(390, 200, 18 * (1 - e.age / .3), '#FFF0B8', { op: Math.max(0, 1 - e.age / .3) }); });
    s += G.rect(520, 60, 60, 280, '#2B424B', { rx: 8 }) + G.f(550, 360, 'детектор', { s: 14, a: 'middle', f: '#C9D6D4' });
    s += G.f(300, 40, 'вылетают: ' + rx[2] + '; в мишени появляется новый элемент', { s: 16, a: 'middle', f: '#fff', w: 600 });
    return s;
  });

  /* 14. Камера Вильсона */
  L('decay14', 'камера Вильсона с препаратом', function (S, c) {
    var s = dark(), ev = G.events(c.time, 5, 1.5, 14);
    s += G.circ(300, 200, 170, '#1C313A', { s: '#5C7C86', sw: 2 }) + G.circ(300, 200, 8, '#F2C36B');
    ev.forEach(function (e) {
      var kind = e.r(), a = e.r() * 6.283, o = Math.max(0, 1 - e.age / 1.5), grow = Math.min(1, e.age / .15);
      if (kind < .45) s += G.line(300, 200, 300 + 60 * grow * Math.cos(a), 200 + 60 * grow * Math.sin(a), 1, '#F0A994', 7).replace('/>', ' opacity="' + o.toFixed(2) + '"/>');
      else if (kind < .9) { var pts = [], x = 300, y = 200; for (var k2 = 0; k2 < 30 * grow; k2++) { a += (e.r() - .5) * .5; x += 5 * Math.cos(a); y += 5 * Math.sin(a); pts.push([x, y]); } if (pts.length > 1) s += G.path(G.poly([[300, 200]].concat(pts)), '#F2C36B', 1.5, { op: o }); }
    });
    s += G.f(300, 30, 'толстые короткие — α, тонкие извилистые — β', { s: 16, a: 'middle', f: '#fff', w: 600 }) + G.f(300, 392, 'γ-кванты следа почти не оставляют', { s: 14, a: 'middle', f: '#B7AEE0' });
    return s;
  });

  /* 15. Распад в реальном времени + счётчик */
  var ISO = [['Иод-131', 8.02, 'сут'], ['Цезий-137', 30.1, 'лет'], ['Углерод-14', 5730, 'лет'], ['Радон-222', 3.82, 'сут']];
  L('law15', 'образец и счётчик: активность падает', function (S, c) {
    var iso = ISO[S.iso], per = (c.time % 12) / 3, s = bg(), rr = P.rng(15), j, alive = 0;
    for (j = 0; j < 100; j++) { var life = -Math.log(1 - rr()) / Math.LN2; var ok = life > per; if (ok) alive++; s += G.circ(50 + (j % 10) * 22, 70 + Math.floor(j / 10) * 22, 8, ok ? '#F2C36B' : '#D8DED8', { s: ok ? C.ambd : '#B8C2BE', sw: 1 }); }
    s += G.f(150, 310, 'осталось: ' + alive + ' из 100', { s: 19, a: 'middle', w: 700 });
    var clicks = G.events(c.time, 6 * Math.pow(2, -per), 2, 15);
    s += G.rect(330, 70, 230, 150, '#E8E1D0', { rx: 14, s: C.ink2 }) + G.f(445, 100, 'счётчик', { s: 16, a: 'middle', w: 600 });
    clicks.forEach(function (e) { s += G.rect(345 + (2 - e.age) / 2 * 200, 130, 4, 60, C.ter, { rx: 1, op: 1 - e.age / 2 }); });
    s += display(330, 250, 230, 'прошло ' + n(per * iso[1], iso[1] > 100 ? 0 : 1) + ' ' + iso[2], n(per, 2) + ' T½ · ' + iso[0]);
    return s;
  });

  /* 16. Счётчик Гейгера */
  var NS = [16, 100, 400, 2500];
  L('stat16', 'счётчик Гейгера: щелчки случайны', function (S, c) {
    var N = NS[S.ni], rate = Math.min(40, 1 + N / 70), ev = G.events(c.time, rate, 3, 16), s = bg(), win = Math.floor(c.time), counts = [], j;
    s += G.rect(40, 50, 520, 110, '#E8E1D0', { rx: 14, s: C.ink2 }) + G.f(60, 78, 'щелчки за последние 3 с', { s: 15, f: C.ink2 });
    ev.forEach(function (e) { s += G.rect(60 + (3 - e.age) / 3 * 480, 92, 3, 54, C.ter, { rx: 1 }); });
    for (j = 0; j < 8; j++) { var cnt = G.events(win - j, rate, 1, 16).length; counts.push(cnt); }
    var mx = Math.max.apply(null, counts) || 1;
    counts.reverse().forEach(function (v, i2) { s += G.rect(60 + i2 * 62, 330 - 130 * v / mx, 44, 130 * v / mx, C.teal, { rx: 4 }) + G.f(82 + i2 * 62, 350, v, { s: 15, a: 'middle', w: 600 }); });
    s += G.f(300, 190, 'число щелчков в каждую секунду — разное', { s: 16, a: 'middle', w: 600 }) + G.f(300, 385, 'образец: ' + N + ' ядер (частота условная)', { s: 14, a: 'middle', f: C.ink2 });
    return s;
  });

  /* 17. Дозиметр у источника */
  L('dose17', 'дозиметр у источника', function (S, c) {
    var s = bg(), rate = Math.pow(2, -S.sh) / (S.r * S.r), x = 130 + S.r * 55, j, ev = G.events(c.time, Math.min(30, 8 * rate + .3), 1, 17), dose = rate * ((c.time * 4) % (S.t + .001));
    s += G.circ(70, 210, 18, '#F2C36B', { s: C.ink }) + G.f(70, 216, '☢', { s: 16, a: 'middle' });
    for (j = 0; j < S.sh; j++) s += G.rect(x - 40 - j * 10, 140, 7, 140, '#9FB2B4', { rx: 2 });
    ev.forEach(function (e) { var f = Math.min(1, e.age * 2); s += G.photon(90 + (x - 100) * f, 210 + (e.r() - .5) * 60 * f, C.vio, 0, 16); });
    s += G.circ(x, 170, 15, '#5CC1B8') + G.rect(x - 14, 187, 28, 64, '#5CC1B8', { rx: 10 }) + G.rect(x - 22, 120, 44, 24, '#10221F', { rx: 4 });
    s += display(330, 300, 250, n(dose, 2) + ' отн. ед.', 'накоплено за ' + Math.round((c.time * 4) % (S.t + .001)) + ' из ' + S.t + ' мин');
    s += G.f(300, 40, n(S.r, 1) + ' м · ' + S.sh + ' слоёв экрана · мощность ' + n(rate, 3), { s: 16, a: 'middle', w: 600 });
    return s;
  });

  /* 18. Активная зона: нейтроны и деления */
  L('fis18', 'активная зона: нейтроны и деления', function (S, c) {
    var s = dark(), rate = Math.max(.3, 10 * Math.pow(S.k, (c.time % 10) * 3)), ev = G.events(c.time, Math.min(60, rate), 1, 18), j;
    s += G.rect(40, 40, 520, 300, '#1C313A', { rx: 16, s: '#5C7C86' });
    for (j = 0; j < 30; j++) s += G.circ(80 + (j % 6) * 90, 80 + Math.floor(j / 6) * 60, 9, '#E0A12E', { op: .5 });
    ev.forEach(function (e) { var x = 80 + Math.floor(e.r() * 6) * 90, y = 80 + Math.floor(e.r() * 5) * 60, o = 1 - e.age; s += G.circ(x, y, 22 * (1 - o) + 6, '#FFF0B8', { op: o * .8 }); for (var k2 = 0; k2 < 2; k2++) { var a = e.r() * 6.283; s += G.circ(x + 70 * e.age * Math.cos(a), y + 70 * e.age * Math.sin(a), 4, NE, { op: o }); } });
    s += G.f(300, 372, S.k > 1.004 ? 'k > 1: делений всё больше (сброс каждые 10 с)' : S.k < .996 ? 'k < 1: реакция гаснет' : 'k = 1: ровная мощность', { s: 16, a: 'middle', f: S.k > 1.004 ? '#F0A994' : '#fff', w: 600 });
    s += G.f(300, 26, 'делений в секунду ≈ ' + n(Math.min(60, rate), 0) + (rate > 60 ? '+' : ''), { s: 17, a: 'middle', f: '#F2C36B', w: 700 });
    return s;
  });

  /* 19. Плазма: тепловое движение и слияния */
  L('fus19', 'горячая плазма дейтерия и трития', function (S, c) {
    var s = dark(), v = Math.sqrt(S.T / 15), rr = P.rng(19), j, fus = S.T < 10 ? 0 : Math.min(25, Math.pow((S.T - 8) / 15, 1.5) * 4), ev = G.events(c.time, fus, .6, 19);
    s += G.rect(30, 50, 540, 290, '#2B1F2A', { rx: 16, s: '#7E5A6E' });
    for (j = 0; j < 40; j++) { var x0 = 40 + rr() * 520, y0 = 60 + rr() * 270, vx = (rr() - .5) * 2, vy = (rr() - .5) * 2, t = c.time * 60 * v; var x = 40 + Math.abs(((x0 - 40 + vx * t) % 1040 + 1040) % 1040 - 520), y = 60 + Math.abs(((y0 - 60 + vy * t) % 540 + 540) % 540 - 270); s += G.circ(x, y, 5, j % 2 ? PR : NE, { op: .9 }); }
    ev.forEach(function (e) { var x = 80 + e.r() * 440, y = 90 + e.r() * 210, o = 1 - e.age / .6; s += G.circ(x, y, 28 * (1 - o) + 5, '#FFF0B8', { op: o }); });
    s += G.f(300, 30, 'T = ' + S.T + ' млн К', { s: 19, a: 'middle', f: '#fff', w: 700 }) + G.f(300, 372, S.T < 10 ? 'слишком холодно: слияний нет' : 'вспышки — слияния ядер', { s: 16, a: 'middle', f: '#F2C36B', w: 600 });
    return s;
  });

  /* 20. Камера с полем: треки выбранной частицы + космические */
  var PT = [['электрон', -1, '#F2C36B'], ['позитрон', 1, '#5CC1B8'], ['протон', 1, PR], ['α', 2, '#B7AEE0']];
  L('part20', 'пузырьковая камера в магнитном поле', function (S, c) {
    var s = dark(), q = PT[S.pt], R = P.trackRadius(S.p, q[1], S.B) * 1200, ev = G.events(c.time, 2.5, 1.4, 20);
    s += G.rect(20, 20, 560, 360, '#1C313A', { rx: 14, s: '#5C7C86' });
    ev.forEach(function (e) {
      var o = 1 - e.age / 1.4, grow = Math.min(1, e.age * 2.5), y0 = 60 + e.r() * 280, up = q[1] > 0, cy = y0 + (up ? -R : R), pts = [];
      for (var a = 0; a <= Math.min(5.5, 560 / R) * grow; a += .03) { var px = 40 + R * Math.sin(a), py = cy + (up ? 1 : -1) * R * Math.cos(a); if (px > 575 || py < 25 || py > 375) break; pts.push([px, py]); }
      if (pts.length > 1) s += G.path(G.poly(pts), q[2], S.pt === 3 ? 4 : 2, { op: o });
    });
    s += G.f(300, 396, q[0] + ', ' + S.p + ' МэВ/c, ' + n(S.B, 1) + ' Тл', { s: 14, a: 'middle', f: '#C9D6D4' });
    return s;
  });

  /* 21. Экран с двумя щелями: фотоны по одному */
  L('model21', 'две щели: фотоны копятся на экране', function (S, c) {
    var s = dark(), rate = Math.pow(10, S.lg) / 4, total = Math.min(Math.pow(10, S.lg), rate * (c.time % 8)), N = Math.min(2500, Math.round(total)), rr = P.rng(21), j;
    s += G.rect(40, 40, 520, 300, '#0B161B', { rx: 8 });
    for (j = 0; j < N; j++) { var x, t; do { x = rr(); var u = (x - .5) * 2; t = Math.pow(Math.cos(9 * u), 2) * Math.exp(-u * u * 1.4); } while (rr() > t); s += G.circ(50 + x * 500, 50 + rr() * 280, 1.6, '#FFE9A8'); }
    s += G.f(300, 372, 'на экране ' + Math.round(total).toLocaleString('ru') + ' фотонов (повтор каждые 8 с)', { s: 16, a: 'middle', f: '#fff', w: 600 });
    return s;
  });

  /* 22. Стол исследователя */
  L('case22', 'стол исследователя: три улики', function (S, c) {
    var s = bg(), j, glow = .6 + .3 * Math.sin(c.time * 5);
    s += G.rect(30, 70, 200, 36, '#2B424B', { rx: 18, s: '#9CC3C4' }) + G.rect(40, 77, 180, 22, '#F06AA8', { rx: 11, op: glow }) + G.f(130, 130, '1: трубка', { s: 16, a: 'middle', w: 600 });
    s += G.rect(30, 150, 200, 34, '#0B161B', { rx: 4 }); [656, 486, 434].forEach(function (l) { s += G.rect(30 + (l - 380) / 400 * 200 - 2, 150, 4, 34, P.rgb(l), { rx: 0 }); });
    var p = P.photo(486, 2.14, 60); s += '<ellipse cx="400" cy="110" rx="90" ry="58" fill="#DCEBEA" stroke="#8FB7B5" stroke-width="2"/>' + G.rect(340, 75, 10, 70, '#8C9EA2', { rx: 2 }) + G.rect(450, 82, 6, 56, '#8C9EA2', { rx: 2 });
    for (j = 0; j < 3; j++) s += G.electron(360 + ((c.time * 80 + j * 30) % 90), 95 + j * 15, 6);
    s += G.f(400, 196, '2: фотоэлемент, ток есть', { s: 16, a: 'middle', w: 600 });
    s += G.circ(300, 300, 62, '#1C313A', { s: '#C9D6D4', sw: 2 }); for (j = 0; j < 12; j++) { var a = j * Math.PI / 6; s += G.circ(300 + 48 * Math.cos(a), 300 + 48 * Math.sin(a), 4, '#B6F28A', { op: .25 + .2 * Math.sin(c.time * 2 + j) }); }
    s += G.line(300, 300, 300 + 40 * Math.cos(c.time * .3), 300 + 40 * Math.sin(c.time * .3), 1, '#B6F28A', 3) + G.f(420, 300, '3: шкала с тритием,', { s: 16, w: 600 }) + G.f(420, 322, 'светится слабо', { s: 16, w: 600 });
    return s;
  });

})();
