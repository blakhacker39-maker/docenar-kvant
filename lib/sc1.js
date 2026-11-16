/* DOCENAR • КВАНТ — разборы по шагам, часть I: фотоны и действия света */
(function () {
  'use strict';
  var QB = window.QB, P = QB.P, G = QB.G, C = G.C, n = G.n;

  /* ===== общий живой фотоэлемент (левая панель) ===== */
  function cell(S, c, o) {
    o = o || {};
    var p = P.photo(S.lambda, S.A, S.I), col = P.rgb(S.lambda), vis = S.lambda >= 380 && S.lambda <= 780, t = c.time, s = '', j;
    var U = o.U || 0, reach = p.emits && U < p.Emax;
    s += G.rect(0, 0, 600, 400, C.soft, { rx: 0 }) + G.rect(0, 352, 600, 48, '#E6E0D2', { rx: 0 });
    // лампа
    s += G.rect(22, 34, 64, 40, '#3B4A50', { rx: 8 }) + G.circ(86, 54, 14, col, { op: S.I ? .9 : .15 });
    s += G.f(54, 26, 'источник', { s: 15, f: C.ink2, a: 'middle' });
    // пучок
    if (S.I > 0) s += '<polygon points="92,44 100,64 176,290 176,130" fill="' + col + '" opacity="' + (.08 + .32 * S.I / 100).toFixed(2) + '"/>';
    // колба
    s += '<ellipse cx="330" cy="210" rx="225" ry="122" fill="#DCEBEA" fill-opacity=".55" stroke="#8FB7B5" stroke-width="2.5"/>';
    s += '<path d="M150 128Q240 92 330 90" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>';
    s += G.rect(158, 130, 20, 160, '#8C9EA2', { rx: 4 }) + G.rect(160, 132, 6, 156, '#C8D4D5', { rx: 2 });
    s += G.rect(486, 150, 10, 120, '#8C9EA2', { rx: 3 });
    s += G.f(168, 316, 'катод', { s: 16, a: 'middle', w: 600 }) + G.f(491, 140, 'анод', { s: 16, a: 'middle', w: 600 });
    // провода и прибор
    s += G.path('M168 290V370H300M360 370H491V270', C.ink, 3);
    var ang = reach ? -50 + 100 * Math.min(1, (p.rate / 100) * (U ? Math.max(.2, 1 - U / p.Emax) : 1)) : -50;
    s += G.circ(330, 370, 26, '#fff', { s: C.ink, sw: 3 }) + '<line x1="330" y1="380" x2="' + (330 + 22 * Math.sin(ang * Math.PI / 180)).toFixed(1) + '" y2="' + (380 - 22 * Math.cos(ang * Math.PI / 180)).toFixed(1) + '" stroke="' + C.ter + '" stroke-width="3.5" stroke-linecap="round"/>' ;
    if (U) s += G.f(240, 392, 'на анод подано −' + n(U) + ' В', { s: 15, f: C.vio, a: 'middle' });
    // фотоны
    var nP = Math.round(S.I / 7);
    for (j = 0; j < nP; j++) { var f = ((t * .9) + j / nP) % 1, y0 = 140 + (j * 37) % 140; s += G.g(G.photon(96 + (164 - 96) * f, 56 + (y0 - 56) * f, col, 1.25, 30), f < .08 ? f / .08 : 1); }
    // электроны
    if (p.emits) {
      var nE = Math.round(S.I / 8), v = .35 + .5 * Math.sqrt(p.Emax);
      for (j = 0; j < nE; j++) {
        var g = ((t * v * .55) + j / nE) % 1, yy = 150 + (j * 53) % 125, x = 182 + 300 * g;
        if (U > 0) { var stop = Math.min(1, (p.Emax * (0.55 + .45 * ((j * 31) % 10) / 10)) / U); if (stop < 1) { var ph = (g * 2) % 2; x = 182 + 300 * stop * (ph < 1 ? Math.sin(ph * Math.PI / 2) : Math.sin((2 - ph) * Math.PI / 2)); } }
        s += G.electron(x, yy, 8);
      }
    }
    var st = !S.I ? 'Света нет — электронов нет' : !p.energetic ? 'Фотону не хватает энергии — электронов нет' : reach ? 'Электроны летят к аноду — ток есть' : 'Электроны вылетают, но поле их возвращает';
    s += G.tag(330, 26, st, reach ? C.teal : C.ter, { s: 16 });
    if (!vis) s += G.f(22, 100, 'УФ: глазу невидим,', { s: 14, f: C.vio }) + G.f(22, 118, 'цвет условный', { s: 14, f: C.vio });
    return s;
  }
  QB.G.cell = cell;
  var PH = [
    { k: 'lambda', label: 'Длина волны λ', min: 200, max: 700, step: 5, value: 400, unit: 'нм' },
    { k: 'I', label: 'Яркость (интенсивность)', min: 0, max: 100, step: 5, value: 40, unit: '%' },
    { k: 'A', label: 'Работа выхода <i>A</i>', min: 1.5, max: 5.5, step: .05, value: 2.3, unit: 'эВ', dec: 2 }];
  function ro(S) { var p = P.photo(S.lambda, S.A, S.I); return '<span>E<sub>ф</sub> = <b>' + n(p.Ef) + ' эВ</b></span><span>A = <b>' + n(S.A) + ' эВ</b></span><span>E<sub>max</sub> = <b>' + (p.emits ? n(p.Emax) + ' эВ' : 'электронов нет') + '</b></span><span>λ<sub>кр</sub> = <b>' + n(p.lambdaCr, 0) + ' нм</b></span>'; }

  /* спектральная линейка */
  function ruler(x, y, w, lam, k) {
    var s = '', l, X = function (v) { return x + (v - 200) / 500 * w; };
    for (l = 200; l < 700; l += 5) s += '<rect x="' + X(l).toFixed(1) + '" y="' + y + '" width="' + (w / 100 + .6).toFixed(1) + '" height="18" fill="' + P.rgb(l) + '"' + (l < 380 ? ' opacity=".45"' : '') + '/>';
    [200, 300, 400, 500, 600, 700].forEach(function (v) { s += G.f(X(v), y + 38, v, { s: 14, a: 'middle', f: C.ink2 }); });
    s += G.f(X(290), y - 8, 'ультрафиолет', { s: 13, a: 'middle', f: C.ink2 }) + G.f(X(540), y - 8, 'видимый свет', { s: 13, a: 'middle', f: C.ink2 });
    s += '<path d="M' + X(lam).toFixed(1) + ' ' + (y - 2) + 'l-9 -14h18z" fill="' + C.ink + '"/>';
    return G.g(s, k);
  }

  /* ===== Модуль 1: фотоэффект ===== */
  QB.steps.photo1 = {
    title: 'Фотоэффект по шагам', intro: 'Слева — опыт, он работает всё время. Справа — что происходит внутри, шаг за шагом. Ползунки меняют обе картинки.',
    params: PH, left: function (S, c) { return cell(S, c); }, leftTitle: 'вакуумный фотоэлемент', readout: ro,
    steps: [
      { label: 'Установка', set: { lambda: 400, I: 40, A: 2.3 }, text: 'Свет падает на металлическую пластину — <b>катод</b>. Вылетевшие электроны летят к <b>аноду</b>, и прибор показывает ток. Воздух из колбы откачан, чтобы электроны ни с чем не сталкивались.' },
      { label: 'Порция света', text: 'Свет поглощается <b>порциями — фотонами</b>. Энергия одного фотона зависит только от длины волны: $E_ф = hc/λ$. Сдвиньте λ влево — порция станет крупнее.' },
      { label: 'Барьер', text: 'Электрон заперт в металле, как мяч в яме. Чтобы вылететь, ему нужна энергия не меньше <b>работы выхода</b> $A$. Её даёт <i>один</i> фотон — целиком.' },
      { label: 'Баланс', text: 'Энергия фотона делится: $A$ уходит на выход, остаток уносит электрон. Это <b>уравнение Эйнштейна</b>: $E_ф = A + E_{max}$.' },
      { label: 'Ярче ≠ сильнее', text: 'Ярче свет — <b>больше фотонов</b>, поэтому больше электронов. Но каждый фотон тот же, и энергия каждого электрона та же. Попробуйте при 600 нм: яркость не поможет.' },
      { label: 'Красная граница', text: 'Есть длина волны, длиннее которой электронов нет совсем: $λ_{кр} = hc/A$. Левее границы (меньше частота — длиннее волна) на графике пусто: там электронов нет, и показывать нечего.' },
      { label: 'Проверка законов', text: 'Изменяйте по одному параметру. Какая зависимость изменится при замене катода?' }
    ],
    right: function (S, c) {
      var p = P.photo(S.lambda, S.A, S.I), col = P.rgb(S.lambda), k = c.k, s = G.rect(0, 0, 600, 400, C.paper, { rx: 0 }), j;
      if (c.i === 0) {
        s += G.g('<ellipse cx="300" cy="190" rx="230" ry="125" fill="none" stroke="' + C.ink + '" stroke-width="3"/>', G.seg(k, 0, .3));
        s += G.g(G.rect(140, 110, 22, 160, '#8C9EA2', { rx: 4 }) + G.rect(438, 125, 12, 130, '#8C9EA2', { rx: 3 }), G.seg(k, .2, .45));
        s += G.path(G.poly([[151, 270], [151, 350], [270, 350]], G.seg(k, .4, .6)), C.ink, 3) + G.path(G.poly([[330, 350], [444, 350], [444, 255]], G.seg(k, .45, .65)), C.ink, 3);
        s += G.g(G.circ(300, 350, 26, '#fff', { s: C.ink, sw: 3 }) + G.f(300, 357, 'G', { s: 22, a: 'middle', w: 700 }), G.seg(k, .55, .7));
        for (j = 0; j < 3; j++) s += G.wave(30 + j * 10, 40 + j * 20, 138, 140 + j * 30, 4, 7, col, 3, G.seg(k, .6, .85));
        s += G.tag(150, 92, 'катод', C.ink, { op: G.seg(k, .7, .85) }) + G.tag(444, 108, 'анод', C.ink, { op: G.seg(k, .75, .9) }) + G.tag(60, 30, 'свет', col === 'rgb(150,140,200)' ? C.vio : C.ink, { op: G.seg(k, .7, .85) }) + G.tag(300, 300, 'прибор: есть ли ток', C.ink, { op: G.seg(k, .85, 1), s: 15 });
        if (p.emits) for (j = 0; j < 3; j++) s += G.g(G.electron(170 + 250 * G.seg(k, .85 + j * .03, 1), 150 + j * 40, 9), G.seg(k, .85, .9));
      }
      if (c.i === 1) {
        var L = 120 + 80 * (S.lambda - 200) / 500;
        s += G.f(30, 46, 'Один фотон', { s: 20, w: 700 });
        var tr = -140 + 520 * G.ease(k);
        s += G.wave(tr - 170, 160, tr, 160, 170 / (L / 3.2), 30, col, 5);
        s += G.g(G.line(tr - 170, 205, tr - 170 + L, 205, 1, C.ink2, 2) + G.line(tr - 170, 198, tr - 170, 212, 1, C.ink2, 2) + G.line(tr - 170 + L, 198, tr - 170 + L, 212, 1, C.ink2, 2) + G.f(tr - 170 + L / 2, 230, 'λ', { s: 20, a: 'middle', i: 1 }), G.seg(k, .7, 1));
        s += G.g(G.f(570, 60, 'λ = ' + S.lambda + ' нм', { s: 22, a: 'end', w: 600 }), G.seg(k, .3, .6));
        s += G.g(G.tag(300, 262, 'E = hc/λ = ' + n(p.Ef) + ' эВ', C.teal, { s: 22 }), G.seg(k, .5, .8));
        s += ruler(60, 318, 480, S.lambda, G.seg(k, .6, 1));
      }
      if (c.i === 2) {
        var base = 340, sc = Math.min(60, 270 / Math.max(p.Ef, S.A)), top = base - S.A * sc, ok = p.energetic, EX = 190;
        s += G.rect(40, 70, 300, base - 70 + 30, '#E3E8E8', { rx: 0 }) + G.f(190, 392, 'внутри металла', { s: 17, a: 'middle', f: C.ink2, w: 600 }) + G.f(470, 392, 'снаружи', { s: 17, a: 'middle', f: C.ink2, w: 600 });
        s += G.line(40, base, 340, base, 1, C.ink, 3) + G.f(212, base - 10, 'электрон в металле', { s: 15, f: C.ink2 });
        s += G.line(40, top, 580, top, 1, C.vio, 3, '9 7') + G.f(585, top + 26, 'порог выхода', { s: 17, a: 'end', f: C.viod, w: 700 }) + G.f(585, top + 48, 'A = ' + n(S.A) + ' эВ', { s: 17, a: 'end', f: C.viod, w: 700 });
        s += G.g(G.line(355, base, 355, top, 1, C.vio, 2) + G.line(348, base, 362, base, 1, C.vio, 2) + G.line(348, top, 362, top, 1, C.vio, 2) + G.f(368, (base + top) / 2 + 6, 'A', { s: 20, f: C.vio, i: 1, m: 1 }), G.seg(k, 0, .15));
        var up = G.seg(k, .1, .5), hh = p.Ef * sc * up, phc = col === 'rgb(150,140,200)' ? C.vio : col;
        s += G.arrow(EX, base, EX, base - hh, up > 0 ? 1 : 0, phc, 7);
        s += G.g(G.f(EX - 16, base - p.Ef * sc / 2, 'фотон: +' + n(p.Ef) + ' эВ', { s: 18, a: 'end', w: 700, f: C.ink }), G.seg(k, .3, .5));
        var fly = G.seg(k, .55, .95), ex = EX, ey = base - hh;
        if (k >= .55) { if (ok) { ex = EX + 330 * fly; ey = base - p.Ef * sc; } else { ex = EX; ey = base - p.Ef * sc * (1 - fly); } }
        if (ok) s += G.g(G.line(EX + 16, top, EX + 16, base - p.Ef * sc, 1, C.amb, 4) + G.f(EX + 26, (top + base - p.Ef * sc) / 2 + 6, 'остаток ' + n(p.Ef - S.A) + ' эВ', { s: 17, f: C.ambd, w: 700 }), G.seg(k, .5, .7));
        s += G.electron(ex, ey, 13);
        s += G.g(G.tag(300, 36, ok ? 'Энергии хватает — электрон вылетел' : 'Не хватает ' + n(S.A - p.Ef) + ' эВ — электрон падает обратно', ok ? C.teal : C.ter, { s: 18 }), G.seg(k, .85, 1));
      }
      if (c.i === 3) {
        var sc2 = 470 / Math.max(p.Ef, S.A), x = 60, g1 = G.seg(k, 0, .3), g2 = G.seg(k, .3, .65), W1 = p.Ef * sc2;
        s += G.f(x, 52, 'Энергия одного фотона', { s: 18, f: C.ink2, w: 600 });
        s += G.rect(x, 64, W1 * g1, 52, col, { rx: 8 }) + G.g(G.f(x + W1 / 2, 98, 'E_ф = ' + n(p.Ef) + ' эВ', { s: 22, a: 'middle', f: '#fff', w: 700 }), G.seg(k, .2, .3));
        s += G.f(x, 168, 'Куда она уходит', { s: 18, f: C.ink2, w: 600, op: g2 });
        var y2 = 64 + 116 * g2;
        if (p.energetic) {
          var wA = S.A * sc2, wE = (p.Ef - S.A) * sc2, gap = 14 * G.seg(k, .55, .7);
          s += G.g(G.rect(x, y2, wA, 52, C.vio, { rx: 8 }) + G.rect(x + wA + gap, y2, wE, 52, C.amb, { rx: 8 }), g2 > 0 ? 1 : 0);
          s += G.g(G.f(x + wA / 2, y2 + 34, 'A = ' + n(S.A), { s: 21, a: 'middle', f: '#fff', w: 700 }), G.seg(k, .6, .75));
          s += G.g(wE > 110 ? G.f(x + wA + gap + wE / 2, y2 + 34, 'E_{max} = ' + n(p.Ef - S.A), { s: 21, a: 'middle', f: '#2b1a00', w: 700 }) : G.f(x + wA + gap + wE / 2, y2 + 82, 'E_{max} = ' + n(p.Ef - S.A), { s: 20, a: 'middle', f: C.ambd, w: 700 }), G.seg(k, .65, .8));
          s += G.g(G.f(x + wA / 2, y2 + 76, 'на выход из металла', { s: 15, a: 'middle', f: C.viod }), G.seg(k, .7, .85));
          s += G.g(G.tag(300, 330, 'E_ф = A + E_{max}', C.teal, { s: 26 }) + G.f(300, 378, n(p.Ef) + ' = ' + n(S.A) + ' + ' + n(p.Ef - S.A) + ' эВ', { s: 20, a: 'middle', w: 600 }), G.seg(k, .8, 1));
        } else {
          s += G.rect(x, y2, S.A * sc2, 52, 'none', { rx: 8, s: C.vio, sw: 3, d: '9 7', op: g2 }) + G.rect(x, y2, W1, 52, col, { rx: 8, op: g2 * .8 });
          s += G.g(G.f(x + S.A * sc2, y2 - 10, 'нужно A = ' + n(S.A), { s: 18, a: 'end', f: C.viod, w: 600 }), G.seg(k, .5, .7));
          s += G.g(G.tag(300, 330, 'Не хватает ' + n(S.A - p.Ef) + ' эВ', C.ter, { s: 24 }) + G.f(300, 378, 'остатка нет — электрон не вылетает', { s: 19, a: 'middle', f: C.ter }), G.seg(k, .7, 1));
        }
      }
      if (c.i === 4) {
        [[150, 1, 'Яркость I'], [450, 2, 'Яркость 2I']].forEach(function (q) {
          var cx = q[0], m = q[1], show = G.seg(k, 0, .15), N = 3 * m;
          s += G.f(cx, 36, q[2], { s: 21, a: 'middle', w: 700, op: show });
          s += G.rect(cx - 115, 262, 230, 20, '#8C9EA2', { rx: 4, op: show }) + G.f(cx, 300, 'металл', { s: 14, a: 'middle', f: C.ink2, op: show });
          for (j = 0; j < N; j++) {
            var xx = cx - 95 + j * (190 / (N - 1)), f = G.seg(k, .1 + j * .015, .45 + j * .015);
            s += G.g(G.photon(xx, 60 + 190 * f, col, Math.PI / 2, 36), show * (1 - G.seg(k, .5, .58)));
            if (p.emits) { var e = G.seg(k, .55, .9), ey = 250 - 110 * e; s += G.g(G.electron(xx, ey, 10) + G.arrow(xx, ey - 13, xx, ey - 15 - 30 * Math.sqrt(p.Emax), e > .05 ? 1 : 0, C.ambd, 3), G.seg(k, .55, .6)); }
          }
          s += G.g(G.f(cx, 330, 'фотонов: ' + N, { s: 19, a: 'middle' }) + G.f(cx, 356, 'электронов: ' + (p.emits ? N : 0), { s: 19, a: 'middle', w: 700, f: p.emits ? C.teal : C.ter }) + G.f(cx, 384, p.emits ? 'E_{max} = ' + n(p.Emax) + ' эВ' : 'электронов нет', { s: 19, a: 'middle' }), G.seg(k, .8, 1));
        });
        s += G.line(300, 20, 300, 390, 1, C.line, 2, '6 6');
      }
      if (c.i === 5) {
        var X0 = 70, Y0 = 290, W = 470, H = 220, nu0 = 4, nu1 = 15, emax = 5;
        var X = function (v) { return X0 + (v - nu0) / (nu1 - nu0) * W; }, Y = function (e) { return Y0 - e / emax * H; };
        s += G.axes(X0, Y0, W + 20, H + 20, 'ν, ×10^{14} Гц', 'E_{max}, эВ', G.seg(k, 0, .2));
        [4, 6, 8, 10, 12, 14].forEach(function (v) { s += G.f(X(v), Y0 + 22, v, { s: 14, a: 'middle', f: C.ink2, op: G.seg(k, .1, .25) }); });
        for (var l = 700; l > 200; l -= 5) { var nu = 2997.92458 / l; if (nu >= nu0 && nu <= nu1) s += '<rect x="' + X(nu).toFixed(1) + '" y="' + (Y0 + 30) + '" width="5" height="12" fill="' + P.rgb(l) + '" opacity="' + G.seg(k, .1, .3).toFixed(2) + '"/>'; }
        var ncr = p.nuCr / 1e14;
        if (ncr < nu1) {
          s += G.line(X(ncr), Y0, X(ncr), Y0 - H, G.seg(k, .25, .45), C.ter, 2.5, '7 6') + G.g(G.f(Math.min(X(ncr) + 10, 380), Y0 - H + 24, 'граница: λ_{кр} = ' + n(p.lambdaCr, 0) + ' нм', { s: 18, f: C.ter, w: 700 }), G.seg(k, .35, .55));
          s += G.line(X(ncr), Y0, X(nu1), Y(Math.min(emax, (nu1 - ncr) * 1e14 * P.C.h_eVs)), G.seg(k, .45, .8), C.teal, 4);
          s += G.g(G.rect(X0 + 2, Y0 - H, X(ncr) - X0 - 4, H, C.ter, { rx: 0, op: .07 }) + '<text transform="translate(' + ((X0 + X(ncr)) / 2 + 6).toFixed(1) + ' ' + (Y0 - 20) + ') rotate(-90)" font-family="Golos Text,sans-serif" font-size="16" fill="' + C.ter + '">электронов нет</text>', G.seg(k, .5, .7));
        }
        var nu2 = p.nu / 1e14;
        if (nu2 >= nu0 && nu2 <= nu1) s += G.g(p.emits ? G.circ(X(nu2), Y(p.Emax), 9, C.amb, { s: C.ink }) : G.path('M' + (X(nu2) - 8) + ' ' + (Y0 - 8) + 'l16 16m0 -16l-16 16', C.ter, 4), G.seg(k, .8, 1));
      }
      if (c.i === 6) {
        var rows = [
          { title: 'Ток насыщения', xl: 'I, %', yl: 'ток, отн. ед.', x0: 0, x1: 100, y0: 0, y1: 1, xd: 0, series: [{ pts: [[0, 0], [100, p.energetic ? 1 : 0]] }], mark: [S.I, p.emits ? S.I / 100 : 0] },
          { title: 'Энергия электронов', xl: 'ν, 10¹⁴ Гц', yl: 'Emax, эВ', x0: 2, x1: 16, y0: 0, y1: 7, xd: 0, series: [{ pts: [[p.nuCr / 1e14, 0], [16, 16e14 * P.C.h_eVs - S.A]] }], mark: p.emits ? [p.nu / 1e14, p.Emax] : null }
        ];
        rows.forEach(function (q, j2) { s += G.g(G.graph(70, 160 + j2 * 180, 440, 100, q), G.seg(k, j2 * .4, j2 * .4 + .4)); });

      }
      return s;
    }
  };

  /* ===== Модуль 2: свет по порциям ===== */
  function bodyCol(T) { var f = G.clamp((T - 700) / 4300); var r = 255, g = Math.round(40 + 215 * Math.pow(f, .6)), b = Math.round(20 + 220 * Math.pow(f, 1.6)); if (T < 1000) { var d = (T - 700) / 300; r = Math.round(90 + 165 * d); g = Math.round(20 + 30 * d); b = 15; } return 'rgb(' + r + ',' + g + ',' + b + ')'; }
  QB.steps.photon2 = {
    title: 'Порции света по шагам', intro: 'Двигайте длину волны и мощность источника — схема пересчитывается сразу.',
    rvb: '0 0 900 400', params: [{ k: 'lambda', label: 'Длина волны λ', min: 200, max: 1200, step: 10, value: 550, unit: 'нм' }, { k: 'Pm', label: 'Мощность источника', min: 1, max: 100, step: 1, value: 5, unit: 'мВт' }],
    readout: function (S) { var E = P.photonE(S.lambda); return '<span>E = <b>' + n(E) + ' эВ</b></span><span>ν = <b>' + QB.sci(P.freq(S.lambda)) + ' Гц</b></span><span>фотонов в секунду: <b>' + QB.sci(P.photonFlux(S.Pm / 1000, S.lambda), 1) + '</b></span><span>' + P.region(S.lambda) + '</span>'; },
    steps: [
      { label: 'Раскалённое тело', text: 'Нагреваем металлический брусок. Сначала он тёмно-красный, потом жёлтый, потом почти белый. Почему цвет зависит от температуры, классическая физика объяснить не смогла.' },
      { label: 'Порции Планка', text: 'Планк предположил: энергия излучается <b>ступеньками</b>, а не плавно. Высота ступеньки $E = hν$. Чем выше частота, тем выше ступенька — и тем реже горячему телу «по карману» такой квант.' },
      { label: 'Энергия фотона', text: 'Порция света — <b>фотон</b>: $E = hc/λ$. Короткая волна — крупная порция. Сравните фотоны разных цветов и найдите на шкале свой.' },
      { label: 'Мощность = число × энергия', text: 'Мощность источника — это число фотонов в секунду, умноженное на энергию каждого: $P = N·E$. При той же мощности красный свет — это <b>больше мелких</b> порций, синий — <b>меньше крупных</b>.' },
      { label: 'Баланс импульса', text: 'Сравните изменение импульса фотона и импульс, полученный пластиной. Направление учитывается знаком.' }
    ],
    right: function (S, c) {
      var k = c.k, s = G.rect(0, 0, 900, 400, C.paper, { rx: 0 }), E = P.photonE(S.lambda), col = P.rgb(S.lambda), j;
      if (c.i === 0) {
        var T = 700 + 4300 * G.seg(k, 0, 1), bc = bodyCol(T);
        s += G.rect(0, 0, 900, 400, C.night, { rx: 0 });
        s += '<defs><radialGradient id="glw"><stop offset="0" stop-color="' + bc + '" stop-opacity=".9"/><stop offset="1" stop-color="' + bc + '" stop-opacity="0"/></radialGradient></defs>';
        s += G.circ(300, 190, 150, 'url(#glw)') + G.rect(180, 150, 240, 80, bc, { rx: 14, s: '#3a2a20', sw: 2 });
        s += G.f(300, 290, 'T ≈ ' + Math.round(T / 100) * 100 + ' К', { s: 30, a: 'middle', w: 700, f: '#fff' });
        var th = [[800, 'тёмно-красный'], [1500, 'оранжевый'], [2500, 'жёлтый'], [5000, 'почти белый']];
        th.forEach(function (q, j2) { var o = T >= q[0] - 10 ? 1 : .25; s += G.g(G.rect(560, 60 + j2 * 72, 50, 50, bodyCol(q[0]), { rx: 10 }) + G.f(626, 84 + j2 * 72, q[0] + ' К', { s: 20, w: 700, f: '#fff' }) + G.f(626, 106 + j2 * 72, q[1], { s: 17, f: '#C9D6D4' }), o); });
        s += G.f(300, 360, 'горячее → ярче и «белее»', { s: 20, a: 'middle', f: '#C9D6D4' });
      }
      if (c.i === 1) {
        var hs = 22 + 60 * (P.photonE(S.lambda) / 6.2), nst = Math.max(2, Math.min(9, Math.floor(260 / hs)));
        s += G.f(220, 44, 'Классика: плавно', { s: 21, a: 'middle', w: 700 }) + G.f(660, 44, 'Планк: ступенями hν', { s: 21, a: 'middle', w: 700 });
        s += G.path('M70 330L370 ' + (330 - 260), C.ink2, 4) + G.path('M70 340H370', C.line, 2);
        var bx = 70 + 300 * G.ease(k), by = 330 - 260 * G.ease(k);
        s += G.circ(bx, by - 13, 13, C.teal);
        var d = 'M510 330', x0 = 510, w = 300 / nst;
        for (j = 0; j < nst; j++) d += 'H' + (x0 + w * (j + 1)).toFixed(1) + 'V' + (330 - hs * (j + 1)).toFixed(1);
        s += G.path(d, C.ink, 4);
        var st = Math.min(nst - 1, Math.floor(k * nst)), sx = x0 + w * (st + .5), sy = 330 - hs * st;
        s += G.circ(sx, sy - 13, 13, C.amb);
        s += G.line(870, 330, 870, 330 - hs, 1, col, 4) + G.f(860, 330 - hs / 2, 'hν', { s: 22, a: 'end', i: 1, m: 1, f: C.ink });
        s += G.f(660, 380, 'высота ступени: ' + n(E) + ' эВ (λ = ' + S.lambda + ' нм)', { s: 18, a: 'middle', f: C.ink2 });
      }
      if (c.i === 2) {
        var L = 40 + 140 * (S.lambda - 200) / 1000;
        s += G.wave(40, 110, 40 + Math.min(420, 4 * L) * G.ease(k), 110, Math.min(420, 4 * L) / L * G.ease(k) || 1, 34, col, 5);
        s += G.g(G.tag(640, 110, 'E = hc/λ = ' + n(E) + ' эВ', C.teal, { s: 24 }), G.seg(k, .4, .7));
        var cmp = [[700, 'красный'], [530, 'зелёный'], [400, 'фиолетовый'], [250, 'ультрафиолет']];
        cmp.forEach(function (q, j2) { var e2 = P.photonE(q[0]), y = 200 + j2 * 40, o = G.seg(k, .5 + j2 * .1, .7 + j2 * .1); s += G.g(G.f(240, y + 22, q[1] + ', ' + q[0] + ' нм', { s: 17, a: 'end' }) + G.rect(255, y, e2 * 85, 30, P.rgb(q[0]), { rx: 6 }) + G.f(262 + e2 * 85, y + 22, n(e2) + ' эВ', { s: 17, w: 600 }), o); });
        s += G.g(G.rect(255, 200 + 4 * 40, E * 85, 30, col, { rx: 6, s: C.ink, sw: 3 }) + G.f(240, 200 + 4 * 40 + 22, 'ваш: ' + S.lambda + ' нм', { s: 17, a: 'end', w: 700 }) + G.f(262 + E * 85, 200 + 4 * 40 + 22, n(E) + ' эВ', { s: 17, w: 700 }), G.seg(k, .9, 1));
      }
      if (c.i === 3) {
        [[200, 650, 'красный 650 нм'], [680, 450, 'синий 450 нм']].forEach(function (q) {
          var cx = q[0], l2 = q[1], e2 = P.photonE(l2), N2 = Math.round(10 * 1.91 / e2), r = 6 + 5 * e2;
          s += G.f(cx, 40, q[2], { s: 21, a: 'middle', w: 700 }) + G.f(cx, 66, 'мощность одна и та же', { s: 16, a: 'middle', f: C.ink2 });
          s += G.rect(cx - 170, 100, 340, 120, '#F2EFE6', { rx: 60 });
          for (j = 0; j < N2; j++) { var f = ((c.time * .35) + j / N2) % 1; s += G.circ(cx - 150 + 300 * f, 160 + 30 * Math.sin(j * 2.3), r, P.rgb(l2), { s: C.ink, sw: 1 }); }
          s += G.f(cx, 260, 'фотонов за то же время: ' + N2, { s: 19, a: 'middle', w: 700 }) + G.f(cx, 288, 'энергия каждого: ' + n(e2) + ' эВ', { s: 18, a: 'middle', f: C.ink2 });
        });
        s += G.g(G.tag(450, 350, 'P = N · E    →    N = P / E', C.teal, { s: 24 }), G.seg(k, .3, .7));
      }
      if (c.i === 4) {
        var mom = P.photonMomentum(S.lambda), col = P.rgb(S.lambda);
        [false, true].forEach(function (mirror, j2) {
          var y = 115 + j2 * 175, f = G.seg(k, j2 * .25, .65 + j2 * .25);
          s += G.rect(470, y - 52, 18, 104, mirror ? '#CCD9D9' : C.ink, { s: C.ink2 });
          s += G.photon(100 + 320 * Math.min(1, f * 2), y - 15, col, 0, 45);
          s += G.arrow(120, y + 30, 430, y + 30, Math.min(1, f * 2), C.teal, 3, 'p →');
          if (mirror) s += G.arrow(430, y - 40, 120, y - 40, G.clamp((f - .5) * 2), C.vio, 3, '← −p');
          s += G.arrow(510, y, 510 + (mirror ? 240 : 120), y, f, C.ter, 4);
          s += G.f(570, y + 55, mirror ? 'пластина: Δp = 2p' : 'пластина: Δp = p', { s: 20, w: 600 });
          s += G.f(60, y - 75, mirror ? 'Отражение' : 'Поглощение', { s: 20, w: 600 });
        });
        s += G.f(450, 392, 'p = h/λ = ' + n(mom / 1e-27, 3) + ' · 10⁻²⁷ кг·м/с; стрелки — направление импульса', { s: 17, a: 'middle' });
      }
      return s;
    }
  };

  /* ===== Модуль 3: задерживающее напряжение ===== */
  QB.steps.stop3 = {
    title: 'Как остановить электрон', intro: 'Новая ручка — напряжение на аноде со знаком «минус». Найдите, при каком напряжении ток пропадает.',
    params: PH.concat([{ k: 'U', label: 'Тормозящее напряжение <i>U</i>', min: 0, max: 4, step: .05, value: 0, unit: 'В', dec: 2 }]),
    left: function (S, c) { return cell(S, c, { U: S.U }); }, leftTitle: 'фотоэлемент с тормозящим полем', readout: function (S) { var p = P.photo(S.lambda, S.A, S.I); return ro(S) + '<span>U<sub>з</sub> = <b>' + (p.emits ? n(p.Uz) + ' В' : '—') + '</b></span><span>ток: <b>' + (p.emits && S.U < p.Emax ? 'есть' : 'нет') + '</b></span>'; },
    steps: [
      { label: 'Поле тормозит', set: { U: 1.2 }, text: 'Подаём на анод «минус». Поле между пластинами толкает электрон <b>назад</b>. Медленные разворачиваются, быстрые ещё долетают.' },
      { label: 'Энергия в поле', text: 'Точка поворота — пересечение полной энергии электрона с потенциальной энергией. Проверьте случай U > Uз.' },
      { label: 'Ток гаснет', set: { U: 0 }, text: 'Увеличиваем напряжение — ток падает. При $U = U_з$ не долетает даже самый быстрый электрон: $eU_з = E_{max}$.' },
      { label: 'Яркость не мешает', text: 'Ярче свет — больше ток, но гаснет он при <b>том же</b> напряжении: самые быстрые электроны остались такими же.' },
      { label: 'Частота решает', text: 'А вот частота сдвигает точку гашения: $U_з = \\frac{h}{e}ν − \\frac{A}{e}$ — прямая линия.' }
    ],
    right: function (S, c) {
      var p = P.photo(S.lambda, S.A, S.I), k = c.k, s = G.rect(0, 0, 600, 400, C.paper, { rx: 0 }), j;
      if (c.i === 0) {
        s += G.rect(70, 70, 26, 230, '#8C9EA2', { rx: 4 }) + G.rect(500, 70, 26, 230, '#8C9EA2', { rx: 4 });
        s += G.f(83, 330, '+', { s: 34, a: 'middle', f: C.ter, w: 700 }) + G.f(513, 330, '−', { s: 40, a: 'middle', f: C.teal, w: 700 }) + G.f(83, 56, 'катод', { s: 18, a: 'middle', w: 600 }) + G.f(513, 56, 'анод', { s: 18, a: 'middle', w: 600 });
        for (j = 0; j < 5; j++) s += G.arrow(120, 95 + j * 45, 480, 95 + j * 45, G.seg(k, 0, .3), C.vio, 2, j === 2 ? 'E →; сила на электрон ←' : '', { s: 16, dy: -10 });
        var es = [.2, .45, .7, 1];
        es.forEach(function (fr, j2) { if (!p.emits) return; var E0 = p.Emax * fr, stop = S.U > 0 ? Math.min(1, E0 / S.U) : 1.2, ph = G.seg(k, .3, 1) * 2, x; if (stop >= 1) x = 100 + 400 * Math.min(1, ph); else x = 100 + 400 * stop * Math.sin(Math.min(ph, 2) * Math.PI / 2); s += G.electron(x, 115 + j2 * 50, 11); });
        s += G.g(G.tag(300, 370, p.emits ? (S.U < p.Emax ? 'самые быстрые ещё долетают' : 'никто не долетает — тока нет') : 'электронов нет', S.U < p.Emax && p.emits ? C.teal : C.ter, { s: 17 }), G.seg(k, .8, 1));
      }
      if (c.i === 1) {
        var E = p.emits ? p.Emax : 0, U = S.U, ymax = Math.max(1, U, E) * 1.15;
        s += G.graph(85, 310, 430, 220, { x0: 0, x1: 1, y0: 0, y1: ymax, xl: 'x/d: катод → анод', yl: 'энергия, эВ', series: [{ pts: [[0, 0], [1, U]], col: C.vio }, { pts: [[0, E], [1, E]], col: C.teal, d: '6 4' }], k: G.seg(k, 0, .7) });
        var turn = U > 0 ? Math.min(1, E / U) : 1, xx = 85 + 430 * turn * G.seg(k, .4, 1);
        if (p.emits) s += G.electron(xx, 310 - U * (xx - 85) / 430 / ymax * 220, 10);
        s += G.f(85, 35, 'Фиолетовая: eU(x) · пунктир: Emax', { s: 17 });
        s += G.f(300, 395, !p.emits ? 'Фотоэлектронов нет' : U > E ? 'Поворот при x/d = ' + n(turn, 2) : 'Электрон достигает анода', { s: 18, a: 'middle', w: 600 });
      }
      if (c.i === 2) {
        var X0 = 70, Y0 = 320, W = 480, H = 230, Um = 4;
        var X = function (u) { return X0 + u / Um * W; }, I0 = p.emits ? S.I / 100 : 0;
        var Y = function (u) { if (!p.emits) return Y0; var r = G.clamp(1 - Math.pow(u / p.Emax, 1.5)); return Y0 - H * I0 * r; };
        s += G.axes(X0, Y0, W + 20, H + 20, 'U тормозящее, В', 'ток', G.seg(k, 0, .2));
        [0, 1, 2, 3, 4].forEach(function (v) { s += G.f(X(v), Y0 + 24, v, { s: 15, a: 'middle', f: C.ink2 }); });
        var pts = []; for (var u = 0; u <= Um; u += .05) pts.push([X(u), Y(u)]);
        s += G.path(G.poly(pts, G.seg(k, .2, .8)), C.teal, 4);
        if (p.emits && p.Emax < Um) s += G.g(G.line(X(p.Emax), Y0, X(p.Emax), Y0 - H, 1, C.ter, 2.5, '7 6') + G.f(Math.min(X(p.Emax) + 8, 480), Y0 - H + 20, 'U_з = ' + n(p.Uz) + ' В', { s: 19, f: C.ter, w: 700 }), G.seg(k, .7, 1));
        s += G.circ(X(S.U), Y(S.U), 9, C.amb, { s: C.ink });
      }
      if (c.i === 3) {
        var X0b = 70, Y0b = 320, Wb = 480, Hb = 230;
        var Xb = function (u) { return X0b + u / 4 * Wb; };
        s += G.axes(X0b, Y0b, Wb + 20, Hb + 20, 'U тормозящее, В', 'ток', 1);
        [[S.I, C.teal, 'яркость ' + S.I + ' %'], [Math.min(100, S.I * 2) || 0, C.amb, 'ярче вдвое']].forEach(function (q, j2) {
          var I0 = p.emits ? q[0] / 100 : 0, pts = [];
          for (var u = 0; u <= 4; u += .05) pts.push([Xb(u), Y0b - Hb * I0 * (p.emits ? G.clamp(1 - Math.pow(u / p.Emax, 1.5)) : 0)]);
          s += G.path(G.poly(pts, G.seg(k, j2 * .35, j2 * .35 + .5)), q[1], 4) + G.g(G.f(330, 110 + j2 * 28, '— ' + q[2], { s: 18, f: q[1], w: 700 }), G.seg(k, j2 * .35 + .3, j2 * .35 + .5));
        });
        if (p.emits) s += G.g(G.line(Xb(p.Emax), Y0b, Xb(p.Emax), Y0b - Hb, 1, C.ter, 2.5, '7 6') + G.f(Math.min(Xb(p.Emax) + 8, 450), Y0b - Hb + 20, 'гаснут вместе', { s: 18, f: C.ter, w: 700 }), G.seg(k, .8, 1));
      }
      if (c.i === 4) {
        var X0c = 70, Y0c = 320, Wc = 480, Hc = 240, nmin = 4, nmax = 15, umax = 5;
        var Xc = function (v) { return X0c + (v - nmin) / (nmax - nmin) * Wc; }, Yc = function (u) { return Y0c - u / umax * Hc; };
        s += G.axes(X0c, Y0c, Wc + 20, Hc + 20, 'ν, ×10^{14} Гц', 'U_з, В', 1);
        [4, 6, 8, 10, 12, 14].forEach(function (v) { s += G.f(Xc(v), Y0c + 24, v, { s: 15, a: 'middle', f: C.ink2 }); });
        var ncr = p.nuCr / 1e14;
        if (ncr < nmax) s += G.line(Xc(Math.max(nmin, ncr)), Yc(Math.max(0, (nmin - ncr) * 1e14 * P.C.h_eVs)), Xc(nmax), Yc(Math.min(umax, (nmax - ncr) * 1e14 * P.C.h_eVs)), G.seg(k, 0, .5), C.teal, 4);
        if (ncr > nmin && ncr < nmax) s += G.g(G.circ(Xc(ncr), Y0c, 7, '#fff', { s: C.ter, sw: 3 }) + G.f(Xc(ncr), Y0c - 14, 'ν_{кр}', { s: 18, a: 'middle', f: C.ter }), G.seg(k, .4, .6));
        var nu = p.nu / 1e14; if (p.emits && nu <= nmax) s += G.g(G.circ(Xc(nu), Yc(p.Uz), 9, C.amb, { s: C.ink }), G.seg(k, .5, .7));
        s += G.g(G.tag(330, 60, 'наклон h/e — один для всех металлов', C.teal, { s: 18 }), G.seg(k, .7, 1));
      }
      return s;
    }
  };

  /* ===== Модуль 4: измеряем h; фотореле ===== */
  var SAMP = [2.1, 2.9, 4.3], LAMS = [250, 300, 350, 400, 450, 500];
  QB.steps.planck4 = {
    title: 'Постоянная Планка из опыта', intro: 'Выберите образец катода — схема покажет, как из точек получается прямая и что из неё можно прочитать.',
    rvb: '0 0 900 400', params: [{ k: 'smp', label: 'Образец катода', min: 0, max: 2, step: 1, value: 0, fmt: function (v) { return '№ ' + (v + 1); } }],
    readout: function (S) { return '<span>Наклон прямой = <b>h/e ≈ 4,14·10<sup>−15</sup> В·с</b></span><span>работа выхода образца: <b>' + n(SAMP[S.smp]) + ' эВ</b> (в опыте её ещё предстоит найти)</span>'; },
    steps: [
      { label: 'Схема измерения', text: 'Светим на катод светом известной длины волны и <b>увеличиваем тормозящее напряжение</b>, пока ток не исчезнет. Записываем $U_з$. Меняем светофильтр — повторяем.' },
      { label: 'Точки', text: 'Каждый светофильтр даёт одну точку $(ν; U_з)$. Длинные волны точки не дают: там нет фотоэффекта.' },
      { label: 'Прямая', text: 'Точки ложатся на прямую. Её проводят «между» точками — у измерений есть погрешность.' },
      { label: 'Наклон = h/e', text: 'Наклон прямой: $\\frac{ΔU}{Δν} = \\frac{h}{e}$. Умножаем на заряд электрона — получаем постоянную Планка.' },
      { label: 'Три металла', text: 'Для трёх разных катодов прямые <b>параллельны</b>: наклон $h/e$ общий. Сдвиг каждой прямой — её работа выхода.' },
      { label: 'Цепь фотореле', text: 'Смените катод при той же длине волны. Катушка переключает контакт только при наличии фототока; схема идеализирована.' }
    ],
    right: function (S, c) {
      var k = c.k, s = G.rect(0, 0, 900, 400, C.paper, { rx: 0 }), A = SAMP[S.smp], j;
      var X0 = 90, Y0 = 330, W = 560, H = 270, nmin = 4, nmax = 15, umax = 4;
      var X = function (v) { return X0 + (v - nmin) / (nmax - nmin) * W; }, Y = function (u) { return Y0 - (u + .5) / (umax + .5) * H; };
      function axes(o) { var r = G.axes(X0, Y(-.5), W + 20, H + 10, 'ν, ×10^{14} Гц', 'U_з, В', o); [4, 6, 8, 10, 12, 14].forEach(function (v) { r += G.f(X(v), Y(-.5) + 22, v, { s: 15, a: 'middle', f: C.ink2, op: o }); }); [0, 1, 2, 3, 4].forEach(function (u) { r += G.f(X0 - 10, Y(u) + 5, u, { s: 15, a: 'end', f: C.ink2, op: o }) + G.line(X0, Y(u), X0 + W, Y(u), 1, '#ECEFEA', 1); }); return r; }
      function pts(A2) { return LAMS.map(function (l) { var p = P.photo(l, A2, 50); return p.emits ? [p.nu / 1e14, p.Uz + (((l * 7) % 5) - 2) * .015] : null; }).filter(Boolean); }
      if (c.i === 0) {
        var Uk = 2.6 * G.seg(k, .2, .9), p = P.photo(350, A, 50), cur = p.emits ? G.clamp(1 - Uk / p.Emax) : 0;
        s += G.rect(40, 150, 90, 70, '#3B4A50', { rx: 10 }) + G.circ(130, 185, 16, P.rgb(350), { op: .9 }) + G.f(85, 140, 'лампа', { s: 16, a: 'middle' });
        s += G.rect(170, 160, 16, 50, P.rgb(350), { rx: 3, op: .8 }) + G.f(178, 236, 'фильтр', { s: 15, a: 'middle', f: C.ink2 });
        for (j = 0; j < 3; j++) s += G.photon(220 + j * 40, 185, P.rgb(350), 0, 26);
        s += '<ellipse cx="420" cy="185" rx="110" ry="80" fill="#DCEBEA" stroke="#8FB7B5" stroke-width="2.5"/>' + G.rect(340, 135, 14, 100, '#8C9EA2', { rx: 3 }) + G.rect(492, 145, 8, 80, '#8C9EA2', { rx: 2 });
        s += G.path('M347 235V330H560V200H620', C.ink, 3) + G.path('M496 225V290', C.ink, 3);
        s += G.circ(700, 140, 50, '#fff', { s: C.ink, sw: 3 }) + G.f(700, 116, 'вольтметр', { s: 14, a: 'middle', f: C.ink2 }) + G.f(700, 152, n(Uk) + ' В', { s: 24, a: 'middle', w: 700 });
        s += G.circ(700, 290, 50, '#fff', { s: C.ink, sw: 3 }) + G.f(700, 266, 'ток', { s: 14, a: 'middle', f: C.ink2 });
        var ang = -60 + 120 * cur; s += '<line x1="700" y1="305" x2="' + (700 + 36 * Math.sin(ang * Math.PI / 180)).toFixed(1) + '" y2="' + (305 - 36 * Math.cos(ang * Math.PI / 180)).toFixed(1) + '" stroke="' + C.ter + '" stroke-width="4" stroke-linecap="round"/>';
        s += G.g(G.tag(450, 380, cur > 0 ? 'увеличиваем U…' : 'ток исчез: записываем U_з = ' + n(p.Uz) + ' В', cur > 0 ? C.ink : C.teal, { s: 18 }), G.seg(k, .3, .5));
      }
      if (c.i >= 1 && c.i <= 3) {
        s += axes(1);
        var pp = pts(A);
        pp.forEach(function (q, j2) { s += G.g(G.circ(X(q[0]), Y(q[1]), 8, C.teal, { s: C.ink }), c.i > 1 ? 1 : G.seg(k, j2 * .12, j2 * .12 + .15)); });
        if (c.i === 1) s += G.g(G.f(X(5.2), Y(3.6), '600–700 нм: точек нет', { s: 17, f: C.ter }), G.seg(k, .8, 1));
        var ncr = A / P.C.h_eVs / 1e14, ln = function (v) { return (v - ncr) * 1e14 * P.C.h_eVs; };
        if (c.i >= 2) s += G.line(X(Math.max(nmin, ncr - .4)), Y(ln(Math.max(nmin, ncr - .4))), X(nmax), Y(Math.min(umax, ln(nmax))), c.i > 2 ? 1 : G.seg(k, 0, .7), C.ink, 3, '10 6');
        if (c.i === 3) {
          var n1 = Math.max(ncr + .5, 8), n2 = n1 + 3;
          s += G.line(X(n1), Y(ln(n1)), X(n2), Y(ln(n1)), G.seg(k, 0, .3), C.amb, 4) + G.line(X(n2), Y(ln(n1)), X(n2), Y(ln(n2)), G.seg(k, .3, .6), C.vio, 4);
          s += G.g(G.f((X(n1) + X(n2)) / 2, Y(ln(n1)) + 26, 'Δν = 3·10^{14} Гц', { s: 18, a: 'middle', f: C.ambd, w: 700 }), G.seg(k, .2, .4)) + G.g(G.f(X(n2) + 12, (Y(ln(n1)) + Y(ln(n2))) / 2, 'ΔU = ' + n(ln(n2) - ln(n1)) + ' В', { s: 18, f: C.viod, w: 700 }), G.seg(k, .5, .7));
          s += G.g(G.tag(640, 60, 'h = e·ΔU/Δν ≈ 6,6·10^{−34} Дж·с', C.teal, { s: 18 }), G.seg(k, .75, 1));
        }
      }
      if (c.i === 4) {
        s += axes(1);
        [[2.1, C.teal], [2.9, C.vio], [4.3, C.ter]].forEach(function (q, j2) {
          var ncr = q[0] / P.C.h_eVs / 1e14, ln = function (v) { return (v - ncr) * 1e14 * P.C.h_eVs; }, o = G.seg(k, j2 * .28, j2 * .28 + .35);
          s += G.line(X(ncr), Y(0), X(nmax), Y(Math.min(umax, ln(nmax))), o, q[1], 4) + G.g(G.circ(X(ncr), Y(0), 7, '#fff', { s: q[1], sw: 3 }) + G.f(X(ncr), Y(0) + 26 + j2 * 0, 'A=' + n(q[0], 1), { s: 15, a: 'middle', f: q[1], w: 700 }), o);
        });
        s += G.g(G.tag(710, 60, 'прямые параллельны', C.teal, { s: 20 }), G.seg(k, .85, 1));
      }
      if (c.i === 5) {
        var A = [2.1, 2.9, 4.3][S.smp], lit = P.photo(400, A, 50).emits, o = G.seg(k, 0, 1);
        s += G.f(450, 35, 'Фотореле: свет управляет отдельной цепью нагрузки', { s: 21, a: 'middle', w: 600 });
        s += '<ellipse cx="200" cy="150" rx="110" ry="70" fill="#DCEBEA" stroke="#087F78" stroke-width="2"/>';
        s += G.path('M150 110V190M250 120V180M150 190V310H460V180H250', C.ink, 3);
        s += G.wave(25, 60, 145, 120, 6, 5, P.rgb(400), 3, o) + G.f(35, 42, 'λ = 400 нм', { s: 17 });
        s += G.rect(195, 300, 48, 20, C.paper) + G.line(205, 290, 205, 330, 1, C.ink, 3) + G.line(230, 299, 230, 321, 1, C.ink, 3);
        s += G.circ(300, 310, 28, C.paper, { s: C.ink }) + G.f(300, 317, 'A', { a: 'middle', s: 22 });
        s += G.path('M430 180v-15q30 -20 60 0v15q-30 20 -60 0v-15q30 -20 60 0', lit ? C.teal : C.ink2, 4);
        s += G.line(490, 180, 600, 180, 1, C.ink2, 2, '5 5');
        s += G.path('M600 180V90H800V310H600V230', C.ink, 3);
        s += G.line(600, 230, lit ? 600 : 645, 180, o, lit ? C.teal : C.ter, 4);
        s += G.circ(800, 200, 35, lit ? '#FFE9A8' : C.soft, { s: C.ink });
        s += G.path('M780 180l40 40m0 -40l-40 40', C.ink2, 2);
        s += G.rect(680, 80, 40, 20, C.paper) + G.line(687, 68, 687, 112, 1, C.ink, 3) + G.line(710, 77, 710, 103, 1, C.ink, 3);
        s += G.f(460, 130, 'катушка', { s: 17, a: 'middle' }) + G.f(640, 255, 'контакт', { s: 17 }) + G.f(800, 265, 'лампа', { s: 17, a: 'middle' });
        s += G.f(450, 380, 'A = ' + n(A, 1) + ' эВ: ' + (lit ? 'фототок есть → контакт замкнут' : 'энергии фотона мало → контакт разомкнут'), { s: 20, a: 'middle', w: 600 });
      }
      return s;
    }
  };

  /* ===== Модуль 5: давление света, дуализм ===== */
  QB.steps.press5 = {
    title: 'Свет толкает. Волна и частица', intro: 'Поверхность и яркость меняются ползунками.',
    rvb: '0 0 900 400', params: [{ k: 'I', label: 'Интенсивность света', min: 100, max: 3000, step: 10, value: 1360, unit: 'Вт/м²' }, { k: 'rho', label: 'Отражение ρ (0 — чёрная, 1 — зеркало)', min: 0, max: 1, step: .05, value: 0, dec: 2 }],
    readout: function (S) { var pr = P.lightPressure(S.I, S.rho); return '<span>давление: <b>' + n(pr * 1e6) + ' мкПа</b></span><span>сила на парус 100 м²: <b>' + n(pr * 100 * 1e3, 2) + ' мН</b></span><span>меньше атмосферного в <b>' + QB.sci(101325 / pr, 1).replace(/<[^>]+>/g, '') + '</b> раз</span>'; },
    steps: [
      { label: 'Поглощение', set: { rho: 0 }, text: 'Фотон врезается в чёрную пластину и <b>застревает</b>. Его импульс $p$ переходит пластине — она получает толчок.' },
      { label: 'Отражение', set: { rho: 1 }, text: 'От зеркала фотон <b>отскакивает</b>: был импульс $p$, стал $−p$. Изменение — $2p$, и толчок вдвое сильнее. Как мяч, отскочивший от стены.' },
      { label: 'Поток фотонов', text: 'Фотонов в секунду — огромное число, толчки сливаются в постоянное давление: $p = \\frac{I}{c}(1 + ρ)$. Подвигайте ρ и I.' },
      { label: 'Солнечный парус', set: { rho: 1 }, text: 'Сила крошечная, но в космосе нет трения: парус разгоняется <b>месяцами</b> — без топлива.' },
      { label: 'По одному фотону', text: 'Пустим свет через две щели по одному фотону. Каждый — <b>одна точка</b>, как частица. Но точки ложатся <b>полосами</b> — как от волны.' },
      { label: 'Два наблюдения', text: 'Полосы проверяют распределение попаданий, а давление — переданный импульс. Один результат не заменяет другой.' }
    ],
    right: function (S, c) {
      var k = c.k, s = G.rect(0, 0, 900, 400, C.paper, { rx: 0 }), j, pr = P.lightPressure(S.I, S.rho);
      if (c.i === 0 || c.i === 1) {
        var mir = c.i === 1, ph = G.seg(k, 0, .5), back = G.seg(k, .5, .9), plateX = 520 + (mir ? 70 : 35) * G.seg(k, .45, 1);
        s += G.rect(plateX, 90, 24, 220, mir ? '#D9E3E3' : '#2E3F46', { rx: 4, s: '#6F858B' });
        if (k < .5) s += G.wave(80 + 420 * ph - 120, 200, 80 + 420 * ph, 200, 4, 18, '#C9A23A', 5) + G.arrow(80 + 420 * ph - 120, 150, 80 + 420 * ph - 30, 150, 1, C.amb, 4, 'p', { s: 22 });
        else if (mir) s += G.wave(500 - 400 * back + 120, 200, 500 - 400 * back, 200, 4, 18, C.vio, 5) + G.arrow(500 - 400 * back + 120, 150, 500 - 400 * back + 30, 150, 1, C.vio, 4, '−p', { s: 22 });
        s += G.g(G.arrow(plateX + 30, 330, plateX + 30 + (mir ? 160 : 80), 330, 1, C.ter, 6) + G.f(plateX + 30 + (mir ? 170 : 90), 338, mir ? '2p' : 'p', { s: 26, w: 700, f: C.ter, i: 1, m: 1 }), G.seg(k, .55, .8));
        s += G.g(G.tag(260, 60, mir ? 'зеркало: толчок 2p' : 'чёрная пластина: толчок p', mir ? C.vio : C.ink, { s: 20 }), G.seg(k, .8, 1));
      }
      if (c.i === 2) {
        var cnt = Math.round(4 + S.I / 200);
        s += G.rect(600, 70, 24, 260, S.rho > .5 ? '#D9E3E3' : '#2E3F46', { rx: 4, s: '#6F858B' });
        for (j = 0; j < cnt; j++) { var f = ((c.time * .6) + j / cnt) % 1, y = 90 + (j * 53) % 220, refl = (j % 20) / 20 < S.rho; if (f < .6) s += G.photon(60 + 900 * f, y, '#C9A23A', 0, 26); else if (refl) s += G.photon(600 - 900 * (f - .6), y, C.vio, Math.PI, 26); }
        var len = 30 + 220 * pr / P.lightPressure(3000, 1);
        s += G.arrow(640, 200, 640 + len, 200, 1, C.ter, 7) + G.f(650, 175, 'давление', { s: 18, f: C.ter, w: 700 });
        s += G.tag(300, 370, 'p = I/c · (1 + ρ) = ' + n(pr * 1e6) + ' мкПа', C.teal, { s: 20 });
      }
      if (c.i === 3) {
        var days = Math.round(365 * G.seg(k, 0, 1)), a = P.lightPressure(1360, S.rho) * 100 / 5, v = a * days * 86400 / 1000;
        s += G.circ(90, 90, 46, '#F2C36B') + G.f(90, 160, 'Солнце', { s: 16, a: 'middle', f: C.ink2 });
        var sx = 260 + 420 * G.seg(k, 0, 1);
        for (j = 0; j < 6; j++) s += G.photon(160 + ((c.time * 120 + j * 60) % (sx - 170)), 150 + j * 18, '#C9A23A', 0, 22);
        s += G.path('M' + sx + ' 110Q' + (sx + 40) + ' 200 ' + sx + ' 290', '#9FB2B4', 5, { fill: '#E6EDEC' }) + G.rect(sx + 10, 190, 26, 20, C.ink2, { rx: 4 });
        s += G.f(450, 350, 'прошло дней: ' + days + '   скорость: ' + n(v, 1) + ' км/с', { s: 22, a: 'middle', w: 700 });
        s += G.f(450, 380, 'парус 100 м², аппарат 5 кг, у орбиты Земли', { s: 16, a: 'middle', f: C.ink2 });
      }
      if (c.i === 4) {
        s += G.rect(40, 150, 50, 100, '#3B4A50', { rx: 8 }) + G.rect(240, 60, 12, 280, C.ink, { rx: 0 }) + G.rect(240, 170, 12, 20, C.paper, { rx: 0 }) + G.rect(240, 210, 12, 20, C.paper, { rx: 0 });
        s += G.rect(600, 40, 20, 320, '#E6E0D2', { rx: 4 });
        var N = Math.round(1 + 1400 * Math.pow(G.seg(k, 0, 1), 2)), rr = P.rng(5), hist = new Array(32).fill(0);
        for (j = 0; j < N; j++) { var y, t; do { y = 40 + 320 * rr(); var u = (y - 200) / 160; t = Math.pow(Math.cos(9 * u), 2) * Math.exp(-u * u * 1.6); } while (rr() > t); s += G.circ(604 + 12 * rr(), y, 1.6, C.ink); hist[Math.floor((y - 40) / 10)]++; }
        var mx = Math.max.apply(null, hist) || 1; hist.forEach(function (v, i2) { s += G.rect(640, 40 + i2 * 10, 220 * v / mx, 8, C.teal, { rx: 2 }); });
        s += G.f(450, 30, 'фотонов: ' + N, { s: 20, a: 'middle', w: 700 }) + G.f(750, 385, 'сколько попало', { s: 15, a: 'middle', f: C.ink2 });
        var f2 = (c.time * .8) % 1; s += G.circ(90 + 510 * f2, 200 + (f2 > .3 ? (f2 - .3) * 80 * Math.sin(c.time * 7) : 0), 5, C.amb);
      }
      if (c.i === 5) {
        var pts = []; for (j = 0; j <= 80; j++) { var x = -2 + j / 20; pts.push([x, Math.pow(Math.cos(x * 3), 2) * Math.exp(-x * x / 3)]); }
        s += G.graph(80, 285, 340, 200, { x0: -2, x1: 2, y0: 0, y1: 1, xl: 'положение на экране, отн. ед.', yl: 'частота попаданий', series: [{ pts: pts }], k: k });
        s += G.f(250, 38, 'Две щели: распределение', { s: 20, a: 'middle', w: 600 });
        s += G.rect(610, 100, 18, 180, S.rho > .5 ? '#CCD9D9' : C.ink, { s: C.ink2 });
        s += G.photon(500 + 90 * G.ease(k), 170, C.amb, 0, 42) + G.arrow(645, 190, 645 + 140 * (1 + S.rho) / 2, 190, k, C.ter, 4);
        s += G.f(680, 60, 'Пластина: передача импульса', { s: 19, a: 'middle', w: 600 });
        s += G.f(650, 325, 'p = ' + n(P.lightPressure(S.I, S.rho) * 1e6, 2) + ' мкПа', { s: 22, a: 'middle', w: 600 });
        s += G.f(450, 390, 'Разные измерения проверяют разные свойства света', { s: 20, a: 'middle', w: 600 });
      }
      return s;
    }
  };

})();
