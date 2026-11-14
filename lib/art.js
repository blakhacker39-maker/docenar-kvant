/* DOCENAR • КВАНТ — иллюстрации и схемы (SVG, нарисованы кодом; подписи набраны программно) */
(function () {
  'use strict';
  var QB = window.QB, P = QB.P;
  var F = 'font-family="Golos Text,Segoe UI,Arial,sans-serif"';
  var INK = '#1E2E35', TEAL = '#087F78', AMB = '#D8922C', VIO = '#7364A8', TER = '#B6533E', PAPER = '#F6F3EB', NIGHT = '#14232B';
  QB.art = { F: F };
  function t(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" ' + F + ' font-size="' + (o.s || 15) + '" fill="' + (o.f || INK) + '"' + (o.a ? ' text-anchor="' + o.a + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + (o.i ? ' font-style="italic" font-family="PT Serif,Georgia,serif"' : '') + '>' + s + '</text>'; }
  function wave(x1, y1, x2, y2, n, amp, col, w) {
    var d = '', L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, N = n * 16;
    for (var i = 0; i <= N; i++) { var f = i / N, env = Math.sin(Math.PI * f), a = Math.sin(f * n * 2 * Math.PI) * amp * env, x = x1 + ux * L * f - uy * a, y = y1 + uy * L * f + ux * a; d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }
    return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 2.5) + '" stroke-linecap="round"/>';
  }
  function arrow(x1, y1, x2, y2, col, w) {
    var a = Math.atan2(y2 - y1, x2 - x1), s = 9;
    return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + 'M' + x2 + ' ' + y2 + 'L' + (x2 - s * Math.cos(a - .45)).toFixed(1) + ' ' + (y2 - s * Math.sin(a - .45)).toFixed(1) + 'M' + x2 + ' ' + y2 + 'L' + (x2 - s * Math.cos(a + .45)).toFixed(1) + ' ' + (y2 - s * Math.sin(a + .45)).toFixed(1) + '" stroke="' + (col || INK) + '" stroke-width="' + (w || 2) + '" fill="none" stroke-linecap="round"/>';
  }
  function svg(w, h, body, bg) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '"><rect width="' + w + '" height="' + h + '" fill="' + (bg || '#FFFEFA') + '"/>' + body + '</svg>'; }
  QB.art.t = t; QB.art.wave = wave; QB.art.arrow = arrow; QB.art.svg = svg;
  function fig(id, alt, cap, fn) { QB.figs[id] = { alt: alt, cap: cap, svg: fn }; }
  QB.art.fig = fig;

  /* ---------- A01. Обложка ---------- */
  QB.art.cover = function () {
    var b = '<defs><linearGradient id="cv-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEDEA" stop-opacity=".95"/><stop offset=".55" stop-color="#9CC9C4" stop-opacity=".55"/><stop offset="1" stop-color="#4E8F8C" stop-opacity=".75"/></linearGradient>' +
      '<linearGradient id="cv-beam" gradientUnits="userSpaceOnUse" x1="610" y1="502" x2="812" y2="438"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".55" stop-color="#FFF7E0" stop-opacity=".9"/><stop offset="1" stop-color="#FFFDF6"/></linearGradient>' +
      '<radialGradient id="cv-cloud"><stop offset="0" stop-color="#7364A8" stop-opacity=".75"/><stop offset=".45" stop-color="#7364A8" stop-opacity=".28"/><stop offset="1" stop-color="#7364A8" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="cv-night" cx=".65" cy=".45" r=".8"><stop offset="0" stop-color="#22404A"/><stop offset="1" stop-color="#14232B"/></radialGradient>' +
      '<filter id="cv-soft"><feGaussianBlur stdDeviation="7"/></filter><filter id="cv-grain"><feTurbulence baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .15  0 0 0 0 .18  0 0 0 .07 0"/></filter>' +
      '<clipPath id="cv-clip"><path d="M800 0H1600V900H700Q770 640 735 430T800 0Z"/></clipPath></defs>';
    b += '<rect width="1600" height="900" fill="' + PAPER + '"/>';
    b += '<g clip-path="url(#cv-clip)"><rect x="540" width="1060" height="900" fill="url(#cv-night)"/>';
    // энергетические уровни (декоративные)
    var i, lv = function (n) { return 400 - 290 * (1 - 1 / (n * n)); };
    for (i = 1; i <= 6; i++) b += '<line x1="1150" x2="1540" y1="' + lv(i).toFixed(0) + '" y2="' + lv(i).toFixed(0) + '" stroke="#B7AEE0" stroke-width="' + (i === 1 ? 3 : 1.8) + '" stroke-opacity="' + (1 - i * .1) + '"/>';
    b += '<path d="M1250 ' + (lv(1) - 4) + 'V' + (lv(3) + 6) + 'm0 0l-7 14m7-14l7 14" stroke="' + AMB + '" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M1440 ' + (lv(4) + 3) + 'V' + (lv(2) - 6) + 'm0 0l-6-12m6 12l6-12" stroke="#fff" stroke-opacity=".8" stroke-width="3" fill="none" stroke-linecap="round"/>';
    // облако вероятности и ядро
    var cx = 1080, cy = 700;
    b += '<circle cx="' + cx + '" cy="' + cy + '" r="160" fill="url(#cv-cloud)"/><circle cx="' + cx + '" cy="' + cy + '" r="60" fill="url(#cv-cloud)"/>';
    var r = P.rng(11); for (i = 0; i < 300; i++) { var a = r() * 6.283, rr = 150 * Math.pow(r(), 1.7); b += '<circle cx="' + (cx + Math.cos(a) * rr).toFixed(1) + '" cy="' + (cy + Math.sin(a) * rr).toFixed(1) + '" r="' + (1 + r() * 1.6).toFixed(1) + '" fill="#E8E3FA" fill-opacity="' + (0.25 + r() * .5).toFixed(2) + '"/>'; }
    for (i = 0; i < 19; i++) { var a2 = i * 2.4, r2 = 5.2 * Math.sqrt(i); b += '<circle cx="' + (cx + Math.cos(a2) * r2).toFixed(1) + '" cy="' + (cy + Math.sin(a2) * r2).toFixed(1) + '" r="6.5" fill="' + (i % 2 ? '#F2C36B' : '#5CC1B8') + '" stroke="#14232B" stroke-width="1"/>'; }
    // спектральная полоса
    b += '<rect x="1290" y="770" width="280" height="70" rx="8" fill="#0B161B" stroke="#3A5560"/>';
    [[410.2, 2], [434.0, 3], [486.1, 4], [656.3, 6]].forEach(function (l) { var x = 1290 + (l[0] - 380) / 320 * 280; b += '<rect x="' + (x - l[1] / 2).toFixed(1) + '" y="774" width="' + l[1] + '" height="62" fill="' + P.rgb(l[0]) + '"/><rect x="' + (x - 7).toFixed(1) + '" y="774" width="14" height="62" fill="' + P.rgb(l[0]) + '" opacity=".3" filter="url(#cv-soft)"/>'; });
    b += '</g>';
    // луч, призма, веер
    b += '<path d="M610 502L812 438" stroke="url(#cv-beam)" stroke-width="16" stroke-linecap="round"/><path d="M610 502L812 438" stroke="url(#cv-beam)" stroke-width="5" stroke-linecap="round"/>';
    for (i = 0; i < 26; i++) { var lam = 400 + i * 11.5, y2 = 330 + i * 15.5; b += '<path d="M940 ' + (428 + i * 1.2).toFixed(1) + 'L1620 ' + y2.toFixed(0) + '" stroke="' + P.rgb(lam) + '" stroke-width="9" stroke-opacity=".8"/>'; }
    b += '<path d="M880 200L1010 560H750Z" fill="url(#cv-glass)" stroke="#EAF6F4" stroke-width="3" stroke-linejoin="round"/><path d="M880 216L776 548" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/><path d="M812 438L940 440" stroke="#fff" stroke-opacity=".55" stroke-width="7"/>';
    for (i = 0; i < 3; i++) { var f = 0.62 + i * 0.14; b += '<circle cx="' + (400 + 412 * f).toFixed(0) + '" cy="' + (568 - 130 * f).toFixed(0) + '" r="8" fill="#fff" stroke="' + AMB + '" stroke-width="3"/>'; }
    b += '<rect width="1600" height="900" filter="url(#cv-grain)" opacity=".6"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-label="Обложка: луч света проходит через стеклянную призму и раскладывается в спектр; за ним — энергетические уровни, облако вероятности и ядро как слои моделей материи">' + b + '</svg>';
  };

  /* ---------- миниатюры модулей ---------- */
  QB.art.thumb = function (m) {
    var r = P.rng(m.n * 97 + 3), b = '<rect width="320" height="160" fill="' + NIGHT + '"/>', i, col = [AMB, '#B7AEE0', '#5CC1B8', '#F2C36B'][m.part - 1];
    if (m.part === 1) { for (i = 0; i < 5; i++) { var lam = 400 + ((m.n * 61 + i * 47) % 280); b += wave(-10, 30 + i * 26, 210 + r() * 60, 30 + i * 26 + (r() - .5) * 20, 5 + i, 6, P.rgb(lam), 2); } b += '<rect x="262" y="14" width="14" height="132" rx="3" fill="#C9D6D4"/>'; }
    else if (m.part === 2) { for (i = 1; i < 7; i++) b += '<line x1="30" x2="200" y1="' + (150 - 128 * (1 - 1 / (i * i))) + '" y2="' + (150 - 128 * (1 - 1 / (i * i))) + '" stroke="#B7AEE0" stroke-width="2" stroke-opacity="' + (1 - i * .1) + '"/>'; b += '<rect x="222" y="20" width="84" height="120" rx="6" fill="#0B161B"/>'; [656, 486, 434, 410].forEach(function (l, j) { if ((m.n + j) % 4 !== 3) b += '<rect x="226" y="' + (26 + (l - 400) / 270 * 104).toFixed(0) + '" width="76" height="3" fill="' + P.rgb(l) + '"/>'; }); }
    else if (m.part === 3) { var n = 6 + (m.n - 9) * 5; for (i = 0; i < n; i++) { var a = i * 2.4, rr = 7.4 * Math.sqrt(i); b += '<circle cx="' + (110 + Math.cos(a) * rr).toFixed(1) + '" cy="' + (80 + Math.sin(a) * rr).toFixed(1) + '" r="7" fill="' + (i % 2 ? '#F2C36B' : '#5CC1B8') + '" stroke="' + NIGHT + '"/>'; } for (i = 0; i < 3; i++) b += wave(190, 50 + i * 30, 310, 30 + i * 45, 4, 5, '#B7AEE0', 1.6); }
    else { var pts = []; for (i = 0; i < 9; i++) pts.push([30 + r() * 220, 20 + r() * 120]); pts.forEach(function (p, j) { var q = pts[(j * 3 + 1) % 9]; b += '<line x1="' + p[0].toFixed(0) + '" y1="' + p[1].toFixed(0) + '" x2="' + q[0].toFixed(0) + '" y2="' + q[1].toFixed(0) + '" stroke="#5C7C86"/>'; }); pts.forEach(function (p, j) { b += '<circle cx="' + p[0].toFixed(0) + '" cy="' + p[1].toFixed(0) + '" r="6" fill="' + [AMB, '#B7AEE0', '#5CC1B8'][j % 3] + '"/>'; }); }
    b += '<text x="304" y="150" text-anchor="end" font-family="Playfair Display,Georgia,serif" font-weight="700" font-size="54" fill="' + col + '" fill-opacity=".9">' + m.n + '</text>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + b + '</svg>';
  };

  /* ---------- A02. Свет и поверхность ---------- */
  fig('a02', 'Луч света падает на металлическую пластину; у самой поверхности показаны вылетающие электроны и вопрос: что решает — яркость или цвет?', 'Граница света и вещества. Изображение условное: фотоны и электроны не видны глазу и нарисованы значками.', function () {
    var b = '<defs><linearGradient id="a2m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE6E4"/><stop offset=".5" stop-color="#9FB2B4"/><stop offset="1" stop-color="#6F858B"/></linearGradient><linearGradient id="a2b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9A7F5" stop-opacity=".0"/><stop offset="1" stop-color="#B9A7F5" stop-opacity=".55"/></linearGradient></defs>';
    b += '<rect width="900" height="600" fill="' + NIGHT + '"/><polygon points="40,0 300,0 620,372 360,372" fill="url(#a2b)"/>';
    for (var i = 0; i < 5; i++) b += wave(110 + i * 50, 20 + i * 8, 400 + i * 45, 360, 7, 7, '#D9D0FF', 2.2);
    b += '<rect x="120" y="372" width="700" height="150" rx="10" fill="url(#a2m)"/><rect x="120" y="372" width="700" height="8" fill="#fff" opacity=".5"/>';
    [[470, 300, 520, 180], [540, 320, 640, 230], [420, 310, 400, 190]].forEach(function (e) { b += arrow(e[0], e[1], e[2], e[3], '#F2C36B', 2.5) + '<circle cx="' + e[0] + '" cy="' + e[1] + '" r="9" fill="#F2C36B"/><rect x="' + (e[0] - 4) + '" y="' + (e[1] - 1.2) + '" width="8" height="2.4" fill="' + NIGHT + '"/>'; });
    b += t(140, 560, 'металл', { f: '#DDE6E4', s: 17 }) + t(60, 70, 'свет', { f: '#fff', s: 20 }) + t(560, 170, 'электроны', { f: '#F2C36B', s: 18 });
    b += t(650, 60, 'Что важнее:', { f: '#fff', s: 20, w: 600 }) + t(650, 90, 'яркость или цвет?', { f: '#fff', s: 20, w: 600 });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">' + b + '</svg>';
  });

  /* ---------- A05. Яркость ≠ энергия фотона ---------- */
  fig('a05', 'Два пучка света одной частоты: в тусклом мало фотонов, в ярком много, но энергия каждого фотона одинакова', 'Яркость ≠ энергия фотона. При одной и той же частоте яркий пучок — это больше фотонов в секунду, а не «более сильные» фотоны.', function () {
    var b = '', r = P.rng(5), i;
    function panel(x, n, title, sub) {
      var o = '<rect x="' + x + '" y="30" width="370" height="330" rx="14" fill="' + NIGHT + '"/>';
      for (var k = 0; k < n; k++) { var px = x + 30 + r() * 290, py = 70 + r() * 250; o += wave(px, py, px + 34, py, 3, 5, P.rgb(450), 2); }
      return o + t(x + 185, 392, title, { a: 'middle', w: 600, s: 17 }) + t(x + 185, 416, sub, { a: 'middle', s: 14, f: '#4A5A60' });
    }
    b += panel(20, 9, 'Тусклый свет', 'фотонов мало') + panel(410, 34, 'Яркий свет той же частоты', 'фотонов много');
    b += t(400, 452, 'Энергия одного фотона одинакова:  E = hν', { a: 'middle', s: 18, w: 600, f: '#06605B' });
    return svg(800, 470, b);
  });
})();
