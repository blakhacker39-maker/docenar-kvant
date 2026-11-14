/* DOCENAR • КВАНТ — модели частей I и II: фотон, постоянная Планка, давление света, две щели, Резерфорд, Бор, спектры, лазер */
(function () {
  'use strict';
  var QB = window.QB, h = QB.h, s = QB.s, P = QB.P, L = QB.L, num = QB.num;
  var FONT = 'Golos Text,Segoe UI,sans-serif';
  function T(svg, x, y, t, a) { a = a || {}; a.x = x; a.y = y; a.fill = a.fill || '#C9D6D4'; a['font-size'] = a['font-size'] || 15; a['font-family'] = FONT; return s('text', a, svg, t); }
  function api(S, sl, upd, extra) { return { set: function (o) { for (var k in o) { if (extra && extra[k]) { extra[k](o[k]); continue; } if (k in S) { S[k] = o[k]; if (sl[k]) sl[k].set(o[k]); } } upd(); }, get: function () { return S; } }; }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }

  /* ============ ФОТОН: длина волны → частота → энергия ============ */
  QB.sims.photon = function (host, opts) {
    var S = { lambda: 550, Pm: 5 }, ui = L.layout(host), svg = ui.svg, sl = {};
    var x0 = 60, x1 = 740, lx = function (l) { return x0 + (Math.log10(l) - 2) / (Math.log10(1500) - 2) * (x1 - x0); };
    for (var l = 100; l < 1500; l += 4) s('rect', { x: lx(l), y: 300, width: lx(l + 4) - lx(l) + .6, height: 46, fill: P.rgb(l), opacity: l < 380 || l > 780 ? .35 : 1 }, svg);
    s('rect', { x: x0, y: 300, width: x1 - x0, height: 46, fill: 'none', stroke: '#5C7C86' }, svg);
    [100, 200, 380, 550, 780, 1000, 1500].forEach(function (v) { s('line', { x1: lx(v), x2: lx(v), y1: 346, y2: 354, stroke: '#C9D6D4' }, svg); T(svg, lx(v), 372, v, { 'text-anchor': 'middle', 'font-size': 13 }); });
    T(svg, 400, 398, 'длина волны, нм (шкала логарифмическая)', { 'text-anchor': 'middle', 'font-size': 13 });
    T(svg, lx(190), 290, 'ультрафиолет', { 'text-anchor': 'middle', 'font-size': 13 }); T(svg, lx(550), 290, 'видимый свет', { 'text-anchor': 'middle', 'font-size': 13, fill: '#fff' }); T(svg, lx(1080), 290, 'инфракрасный', { 'text-anchor': 'middle', 'font-size': 13 });
    var mark = s('path', { fill: '#fff', stroke: '#14232B' }, svg), wv = s('path', { fill: 'none', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg);
    var big = T(svg, 400, 60, '', { 'text-anchor': 'middle', 'font-size': 26, fill: '#fff', 'font-weight': 600 }), sub = T(svg, 400, 88, '', { 'text-anchor': 'middle' });
    ui.cap('Вне видимого диапазона цвет условный.');
    sl.lambda = L.slider(ui.ctrl, { label: 'Длина волны λ', min: 100, max: 1500, step: 5, value: S.lambda, unit: 'нм', on: function (v) { S.lambda = v; upd(); } });
    sl.Pm = L.slider(ui.ctrl, { label: 'Мощность источника', min: 1, max: 100, step: 1, value: S.Pm, unit: 'мВт', on: function (v) { S.Pm = v; upd(); } });
    var ro = L.ro(ui.ctrl, [['nu', 'Частота ν'], ['E', 'Энергия фотона'], ['EJ', 'Она же в джоулях'], ['reg', 'Область спектра'], ['N', 'Фотонов в секунду'], ['p', 'Импульс фотона']]);
    function upd() {
      var E = P.photonE(S.lambda), nu = P.freq(S.lambda), col = P.rgb(S.lambda), x = lx(S.lambda), d = '', k = S.lambda / 14;
      mark.setAttribute('d', 'M' + x + ' 298l-9 -16h18z');
      for (var px = 80; px <= 720; px += 2) d += (px === 80 ? 'M' : 'L') + px + ' ' + (190 + 46 * Math.sin((px - 80) / k * 2 * Math.PI) * Math.sin(Math.PI * (px - 80) / 640)).toFixed(1);
      wv.setAttribute('d', d); wv.setAttribute('stroke', col);
      big.textContent = 'E = ' + num(E) + ' эВ'; sub.textContent = P.region(S.lambda) + (P.colorName(S.lambda) ? ' · ' + P.colorName(S.lambda) : '');
      ro('nu', QB.sci(nu) + ' Гц'); ro('E', num(E) + ' эВ'); ro('EJ', QB.sci(E * P.C.e) + ' Дж'); ro('reg', P.region(S.lambda)); ro('N', QB.sci(P.photonFlux(S.Pm / 1000, S.lambda), 1)); ro('p', QB.sci(P.photonMomentum(S.lambda), 1) + ' кг·м/с');
      ui.say('Длина волны ' + S.lambda + ' нм, ' + P.region(S.lambda) + ', энергия фотона ' + num(E) + ' эВ.');
    }
    upd(); return api(S, sl, upd);
  };

  /* ============ ИЗМЕРЯЕМ ПОСТОЯННУЮ ПЛАНКА ============ */
  QB.sims.planck = function (host, opts, ctx) {
    var SAMPLES = [2.10, 2.90, 4.30], S = { sample: 0, lambda: 300 }, pts = [[], [], []], fit = null, sl = {}, rnd = P.rng(2026);
    var left = h('div'), ctrl = h('div', { class: 'ctrl' }); host.appendChild(h('div', { class: 'lab' }, [left, ctrl]));
    var pl = L.plot(left, { x0: 0, x1: 16, y0: -5, y1: 4, w: 640, h: 400, xt: [0, 2, 4, 6, 8, 10, 12, 14, 16], yt: [-4, -2, 0, 2, 4], xl: 'частота ν, ×10¹⁴ Гц', yl: 'Uз, В', alt: 'График зависимости задерживающего напряжения от частоты' });
    var info = h('div', { 'aria-live': 'polite' }), tb = h('tbody');
    var seg = L.seg(ctrl, 'Образец катода (работа выхода неизвестна)', [[0, '№ 1'], [1, '№ 2'], [2, '№ 3']], 0, function (v) { S.sample = v; fit = null; draw(); });
    sl.lambda = L.slider(ctrl, { label: 'Длина волны света', min: 180, max: 620, step: 10, value: S.lambda, unit: 'нм', on: function (v) { S.lambda = v; } });
    var row = h('div', { class: 'row' }); ctrl.appendChild(row);
    L.btn(row, 'Измерить <i>U</i><sub>з</sub>', measure, 'amb sm'); L.btn(row, 'Провести прямую', doFit, 'sm'); L.btn(row, 'Сбросить', function () { pts[S.sample] = []; fit = null; draw(); }, 'sm ghost');
    ctrl.appendChild(info);
    ctrl.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, [h('thead', {}, h('tr', {}, ['λ, нм', 'ν, 10¹⁴ Гц', 'Uз, В'].map(function (t) { return h('th', { text: t }); }))), tb])));
    function say(cls, html) { info.innerHTML = ''; info.appendChild(h('div', { class: 'fb ' + cls, html: html })); }
    function measure() {
      var p = P.photo(S.lambda, SAMPLES[S.sample], 50), nu = p.nu / 1e14;
      if (!p.emits) { say('no', 'При λ = ' + S.lambda + ' нм тока нет даже без задерживающего напряжения: фотоэффекта нет. Точку на график поставить нельзя — возьмите свет с меньшей длиной волны.'); return; }
      if (pts[S.sample].some(function (q) { return q.l === S.lambda; })) { say('info', 'Эта длина волны уже измерена. Возьмите другую — прямой нужны разные точки.'); return; }
      pts[S.sample].push({ l: S.lambda, nu: nu, U: Math.round((p.Uz + (rnd() - .5) * 0.06) * 100) / 100 }); fit = null;
      say('info', 'Записано: при λ = ' + S.lambda + ' нм ток исчезает при <i>U</i><sub>з</sub> ≈ ' + num(pts[S.sample][pts[S.sample].length - 1].U) + ' В (прибор измеряет с погрешностью около 0,03 В).'); draw();
    }
    function doFit() {
      var a = pts[S.sample]; if (a.length < 3) { say('info', 'Для прямой нужно не меньше трёх точек на разных частотах.'); return; }
      var n = a.length, sx = 0, sy = 0, sxx = 0, sxy = 0; a.forEach(function (q) { sx += q.nu; sy += q.U; sxx += q.nu * q.nu; sxy += q.nu * q.U; });
      var k = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - k * sx) / n; fit = { k: k, b: b };
      var hexp = k * 1e-14 * P.C.e, dev = (hexp / P.C.h - 1) * 100;
      say('ok', '<b class="tag">Прямая проведена</b>Наклон: ' + num(k, 3) + ' В на 10¹⁴ Гц → <i>h</i> = <i>e</i>·наклон ≈ ' + QB.sci(hexp) + ' Дж·с (отличие от табличного ' + num(dev, 1) + ' %).<br>Пересечение с осью частот: ν<sub>кр</sub> ≈ ' + num(-b / k, 1) + '·10¹⁴ Гц. Продолжение прямой до ν = 0 даёт −<i>A</i>/<i>e</i>: работа выхода ≈ ' + num(-b) + ' эВ.');
      if (n >= 4) ctx.badge('control'); draw();
    }
    function draw() {
      pl.clear(); tb.innerHTML = ''; seg.set(S.sample);
      pl.path([[0, 0], [16, 0]], { stroke: '#1E2E35', 'stroke-width': 1 });
      var cols = ['#087F78', '#7364A8', '#B6533E'];
      pts.forEach(function (a, i) { a.forEach(function (q) { pl.dot(q.nu, q.U, { fill: cols[i], r: i === S.sample ? 6 : 4, opacity: i === S.sample ? 1 : .45 }); }); });
      if (fit) { pl.path([[0, fit.b], [16, fit.k * 16 + fit.b]], { stroke: cols[S.sample], 'stroke-dasharray': '6 4' }); pl.dot(-fit.b / fit.k, 0, { fill: '#fff', r: 5 }); pl.text(-fit.b / fit.k, 0.5, 'ν кр', { 'text-anchor': 'middle' }); pl.text(0.3, fit.b - .25, '−A/e', {}); }
      pts[S.sample].forEach(function (q) { tb.appendChild(h('tr', {}, [h('td', { text: q.l }), h('td', { text: num(q.nu) }), h('td', { text: num(q.U) })])); });
      if (!pts[S.sample].length) tb.appendChild(h('tr', {}, h('td', { colspan: 3, style: 'color:#4A5A60', text: 'Измерений пока нет.' })));
    }
    draw();
    return { set: function (o) { if ('sample' in o) S.sample = o.sample; if ('lambda' in o) { S.lambda = o.lambda; sl.lambda.set(o.lambda); } if (o.measure) measure(); if (o.series) { o.series.forEach(function (l) { S.lambda = l; measure(); }); sl.lambda.set(S.lambda); } if (o.fit) doFit(); if (o.reset) { pts = [[], [], []]; fit = null; info.innerHTML = ''; } draw(); }, get: function () { return S; } };
  };

  /* ============ ДАВЛЕНИЕ СВЕТА ============ */
  QB.sims.pressure = function (host) {
    var S = { I: 1361, rho: 0, area: 100 }, ui = L.layout(host), svg = ui.svg, sl = {}, g = ui.canvas(), ph = [], acc = 0, rnd = P.rng(3), push = 0;
    L.defs(svg, '<linearGradient id="lp-m" x1="0" x2="1"><stop offset="0" stop-color="#E9F0EE"/><stop offset="1" stop-color="#7F979B"/></linearGradient>');
    var sail = s('rect', { x: 600, y: 70, width: 16, height: 310, rx: 4, fill: 'url(#lp-m)' }, svg);
    var arr = s('path', { stroke: '#D8922C', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, svg);
    var lab = T(svg, 700, 215, '', { 'text-anchor': 'middle', fill: '#F2C36B', 'font-size': 14 }), kind = T(svg, 608, 410, '', { 'text-anchor': 'middle', 'font-size': 14 });
    T(svg, 40, 40, 'свет', { fill: '#fff' }); ui.cap('Сила показана стрелкой условно: она на много порядков меньше привычных сил.');
    sl.I = L.slider(ui.ctrl, { label: 'Интенсивность света <i>I</i>', min: 100, max: 3000, step: 1, value: S.I, unit: 'Вт/м²', on: function (v) { S.I = v; upd(); } });
    sl.rho = L.slider(ui.ctrl, { label: 'Коэффициент отражения ρ', min: 0, max: 1, step: 0.05, dec: 2, value: S.rho, on: function (v) { S.rho = v; upd(); } });
    sl.area = L.slider(ui.ctrl, { label: 'Площадь поверхности <i>S</i>', min: 1, max: 1000, step: 1, value: S.area, unit: 'м²', on: function (v) { S.area = v; upd(); } });
    var ro = L.ro(ui.ctrl, [['p', 'Давление света'], ['F', 'Сила на поверхность'], ['cmp', 'Во сколько раз меньше атмосферного'], ['k', 'Импульс от одного фотона']]);
    ui.ctrl.appendChild(h('p', { class: 'note', html: '1361 Вт/м² — интенсивность солнечного света у орбиты Земли (солнечная постоянная).' }));
    function upd() {
      var p = P.lightPressure(S.I, S.rho), F = p * S.area;
      ro('p', num(p * 1e6, 2) + ' мкПа'); ro('F', F >= 1e-3 ? num(F * 1e3, 2) + ' мН' : num(F * 1e6, 1) + ' мкН'); ro('cmp', QB.sci(101325 / p, 1)); ro('k', S.rho === 0 ? '<i>p</i> (поглощён)' : S.rho === 1 ? '2<i>p</i> (отражён)' : 'от <i>p</i> до 2<i>p</i>');
      var len = 20 + 70 * p / P.lightPressure(3000, 1); arr.setAttribute('d', 'M624 225h' + len.toFixed(0) + 'm0 0l-12 -9m12 9l-12 9');
      lab.textContent = 'F'; lab.setAttribute('x', 634 + len); kind.textContent = S.rho === 0 ? 'чёрная поверхность: поглощает' : S.rho === 1 ? 'зеркало: отражает' : 'частично отражает';
      sail.setAttribute('fill', S.rho < .3 ? '#2E3F46' : 'url(#lp-m)'); sail.setAttribute('stroke', '#9CB0B3');
      ui.say('Давление ' + num(p * 1e6, 2) + ' микропаскаля.'); anim.kick();
    }
    var anim = L.loop(ui.scene, function (dt) {
      acc += dt * S.I / 90; while (acc > 1) { acc--; ph.push({ x: 20, y: 85 + rnd() * 280, d: 1 }); }
      g.clearRect(0, 0, 800, 450);
      if (!dt) { for (var i = 0; i < 14; i++) pd(60 + i * 38, 90 + (i * 67) % 270, 1); return; }
      for (var j = ph.length - 1; j >= 0; j--) {
        var o = ph[j]; o.x += o.d * 330 * dt;
        if (o.d > 0 && o.x >= 596) { if (rnd() < S.rho) { o.d = -1; o.x = 596; } else { ph.splice(j, 1); continue; } }
        if (o.x < 0) { ph.splice(j, 1); continue; }
        pd(o.x, o.y, o.d);
      }
    });
    function pd(x, y, d) { g.strokeStyle = d > 0 ? '#FFE9A8' : '#B7AEE0'; g.lineWidth = 2.2; g.beginPath(); for (var k = -10; k <= 10; k += 2) { var a = Math.sin(k * 1.1) * 4; k === -10 ? g.moveTo(x + k, y + a) : g.lineTo(x + k, y + a); } g.stroke(); g.beginPath(); g.moveTo(x + d * 14, y); g.lineTo(x + d * 8, y - 4); g.lineTo(x + d * 8, y + 4); g.fillStyle = g.strokeStyle; g.fill(); }
    upd(); return api(S, sl, upd);
  };

  /* ============ ДВЕ ЩЕЛИ: фотоны по одному ============ */
  QB.sims.slits = function (host) {
    var S = { which: false, n: 0 }, box = h('div', { class: 'scene', style: 'aspect-ratio:16/7' }), c = h('canvas', { width: 1600, height: 700, 'aria-hidden': 'true' }), g = c.getContext('2d'), bins = new Array(160).fill(0), rnd = P.rng(42);
    box.appendChild(c); g.scale(2, 2); host.appendChild(box);
    var row = h('div', { class: 'row', style: 'margin:.6rem 0' }), cnt = h('b', { 'aria-live': 'polite' }); host.appendChild(row);
    function I(x) { var u = (x - 400) / 400, env = Math.pow(Math.sin(6 * u + 1e-9) / (6 * u + 1e-9), 2); return S.which ? env : env * Math.pow(Math.cos(22 * u), 2); }
    function add(n) {
      for (var i = 0; i < n; i++) { var x, t = 0; do { x = rnd() * 800; t++; } while (rnd() > I(x) && t < 400); S.n++; bins[Math.floor(x / 5)]++; g.fillStyle = 'rgba(255,233,168,.85)'; g.fillRect(x, 14 + rnd() * 180, 1.6, 1.6); }
      g.fillStyle = '#14232B'; g.fillRect(0, 205, 800, 145); var mx = Math.max.apply(null, bins) || 1; g.fillStyle = '#5CC1B8';
      bins.forEach(function (b, i) { g.fillRect(i * 5, 345 - b / mx * 130, 4, b / mx * 130); });
      cnt.textContent = 'Зарегистрировано фотонов: ' + S.n;
    }
    function reset() { S.n = 0; bins.fill(0); g.fillStyle = '#14232B'; g.fillRect(0, 0, 800, 350); add(0); }
    L.btn(row, '+1 фотон', function () { add(1); }, 'sm amb'); L.btn(row, '+100', function () { add(100); }, 'sm'); L.btn(row, '+3000', function () { add(3000); }, 'sm'); L.btn(row, 'Сначала', reset, 'sm ghost');
    var w = L.btn(row, 'Следить, через какую щель прошёл фотон: нет', function () { S.which = !S.which; w.innerHTML = 'Следить, через какую щель прошёл фотон: ' + (S.which ? 'да' : 'нет'); w.setAttribute('aria-pressed', String(S.which)); reset(); }, 'sm'); row.appendChild(cnt);
    host.appendChild(h('p', { class: 'note', html: 'Вверху — экран с точками попаданий, внизу — гистограмма. Каждая вспышка — один целый фотон (частица), но места вспышек подчиняются волновой картине. Модель качественная: расстояния между полосами условны.' }));
    reset(); return { set: function (o) { if (o.reset) reset(); if (o.add) add(o.add); }, get: function () { return S; } };
  };

  /* ============ ОПЫТ РЕЗЕРФОРДА ============ */
  QB.sims.rutherford = function (host) {
    var S = { model: 'nuc', Z: 79, E: 5 }, ui = L.layout(host), svg = ui.svg, g = ui.canvas(), sl = {}, rnd = P.rng(79), st = { n: 0, a10: 0, a90: 0 }, live = [];
    var CX = 470, CY = 225, R = 150;
    var atom = s('circle', { cx: CX, cy: CY, r: R, fill: '#D8922C', 'fill-opacity': 0, stroke: '#5C7C86', 'stroke-dasharray': '4 5' }, svg), nuc = s('circle', { cx: CX, cy: CY, r: 5, fill: '#F2C36B' }, svg);
    s('rect', { x: 20, y: 185, width: 46, height: 80, rx: 6, fill: '#3A5560', stroke: '#9CB0B3' }, svg); T(svg, 43, 290, 'источник', { 'text-anchor': 'middle', 'font-size': 12 }); T(svg, 43, 305, 'α-частиц', { 'text-anchor': 'middle', 'font-size': 12 });
    s('path', { d: 'M760 30A300 300 0 0 1 760 420', fill: 'none', stroke: '#5CC1B8', 'stroke-width': 5, 'stroke-opacity': .5 }, svg); T(svg, 742, 24, 'экран', { 'text-anchor': 'end', 'font-size': 12 });
    var lab = T(svg, CX, CY + R + 22, '', { 'text-anchor': 'middle', 'font-size': 13 }); ui.cap('Один атом фольги крупным планом. Масштаб ядра сильно увеличен.');
    L.seg(ui.ctrl, 'Модель атома', [['nuc', 'ядерная (Резерфорд)'], ['th', '«пудинг» (Томсон)']], 'nuc', function (v) { S.model = v; reset(); });
    sl.Z = L.slider(ui.ctrl, { label: 'Заряд ядра фольги <i>Z</i>', min: 13, max: 92, step: 1, value: S.Z, fmt: function (v) { return v + ' (' + P.EL[v] + ')'; }, on: function (v) { S.Z = v; reset(); } });
    sl.E = L.slider(ui.ctrl, { label: 'Энергия α-частиц', min: 3, max: 9, step: 0.5, dec: 1, value: S.E, unit: 'МэВ', on: function (v) { S.E = v; reset(); } });
    var row = h('div', { class: 'row' }); ui.ctrl.appendChild(row);
    L.btn(row, 'Пуск: 1', function () { fire(1, true); }, 'amb sm'); L.btn(row, 'Пуск: 200', function () { fire(200, false); }, 'sm'); L.btn(row, 'Сначала', reset, 'sm ghost');
    var ro = L.ro(ui.ctrl, [['n', 'Выпущено частиц'], ['a10', 'Отклонились больше чем на 10°'], ['a90', 'Отброшены назад (больше 90°)'], ['d', 'Наименьшее сближение при лобовом ударе']]);
    function dpx() { return 7 * (S.Z / 79) * (5 / S.E); }
    function track(b) { // интегрирование движения в кулоновском поле (условные единицы)
      var d = dpx(), x = 70, y = CY + b, vx = 1, vy = 0, pts = [[x, y]], K = d / 2, dt = 1.2;
      for (var i = 0; i < 900; i++) {
        var rx = x - CX, ry = y - CY, r = Math.hypot(rx, ry), a = 0;
        if (S.model === 'nuc') a = K / (r * r); else if (r < R) a = 0.2 * K * r / (R * R * R); // размазанный заряд: поле слабое, вне атома его нет
        var step = Math.min(dt, Math.max(.05, r / 12)); vx += a * rx / r * step; vy += a * ry / r * step; x += vx * step; y += vy * step; pts.push([x, y]);
        if (x < 0 || x > 800 || y < 0 || y > 450) break;
      }
      return { pts: pts, ang: Math.abs(Math.atan2(vy, vx)) * 180 / Math.PI };
    }
    function drawTrack(t, alpha) { g.strokeStyle = t.ang > 90 ? 'rgba(240,169,148,' + alpha + ')' : t.ang > 10 ? 'rgba(242,195,107,' + alpha + ')' : 'rgba(201,214,212,' + alpha * .6 + ')'; g.lineWidth = 1.4; g.beginPath(); t.pts.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); g.stroke(); }
    function fire(n, animate) {
      for (var i = 0; i < n; i++) { var b = (rnd() * 2 - 1) * 140; if (Math.abs(b) < .5) b = .5; var t = track(b); st.n++; if (t.ang > 10) st.a10++; if (t.ang > 90) st.a90++; if (animate && !QB.reduced) live.push({ t: t, i: 0 }); else drawTrack(t, n > 1 ? .5 : .95); }
      show(); anim.kick();
    }
    function show() { ro('n', String(st.n)); ro('a10', st.a10 + (st.n ? ' (' + num(100 * st.a10 / st.n, 1) + ' %)' : '')); ro('a90', st.a90 + (st.n ? ' (' + num(100 * st.a90 / st.n, 1) + ' %)' : '')); ro('d', S.model === 'nuc' ? num(P.closestApproach(2, S.Z, S.E), 1) + ' фм' : '—'); ui.say('Выпущено ' + st.n + ', отброшено назад ' + st.a90 + '.'); }
    function reset() { st = { n: 0, a10: 0, a90: 0 }; live = []; g.clearRect(0, 0, 800, 450); atom.setAttribute('fill-opacity', S.model === 'th' ? .16 : 0); nuc.setAttribute('visibility', S.model === 'th' ? 'hidden' : 'visible'); lab.textContent = S.model === 'th' ? 'положительный заряд размазан по всему атому' : 'весь положительный заряд — в крошечном ядре'; show(); }
    var anim = L.loop(ui.scene, function (dt) {
      for (var j = live.length - 1; j >= 0; j--) { var o = live[j], n = Math.min(o.t.pts.length - 1, o.i + 14); g.strokeStyle = '#FFE9A8'; g.lineWidth = 2; g.beginPath(); g.moveTo(o.t.pts[o.i][0], o.t.pts[o.i][1]); for (var k = o.i + 1; k <= n; k++) g.lineTo(o.t.pts[k][0], o.t.pts[k][1]); g.stroke(); o.i = n; if (n >= o.t.pts.length - 1) live.splice(j, 1); }
    });
    reset();
    return { set: function (o) { if (o.model) { S.model = o.model; } if (o.Z) { S.Z = o.Z; sl.Z.set(o.Z); } if (o.E) { S.E = o.E; sl.E.set(o.E); } if (o.model || o.Z || o.E || o.reset) reset(); if (o.fire) fire(o.fire, o.fire === 1); }, get: function () { return st; } };
  };

  /* ============ АТОМ ВОДОРОДА ПО БОРУ ============ */
  function levelY(n, top, bot) { return bot - (bot - top) * (1 - 1 / (n * n)); }
  QB.sims.bohr = function (host) {
    var S = { n: 1, cloud: false }, ui = L.layout(host), svg = ui.svg, sl = {}, CX = 250, CY = 225, k = 8.4;
    L.defs(svg, '<radialGradient id="bh-c"><stop offset="0" stop-color="#B7AEE0" stop-opacity=".9"/><stop offset=".5" stop-color="#7364A8" stop-opacity=".35"/><stop offset="1" stop-color="#7364A8" stop-opacity="0"/></radialGradient>');
    var orb = s('g', {}, svg), cloud = s('circle', { cx: CX, cy: CY, fill: 'url(#bh-c)' }, svg), e = s('circle', { r: 7, fill: '#F2C36B' }, svg); s('circle', { cx: CX, cy: CY, r: 4, fill: '#F0A994' }, svg);
    for (var n = 1; n <= 5; n++) s('circle', { cx: CX, cy: CY, r: k * n * n, fill: 'none', stroke: '#5C7C86', 'stroke-dasharray': '3 5', 'data-n': n }, orb);
    var lv = s('g', {}, svg), mk = s('circle', { r: 7, fill: '#F2C36B' }, svg);
    for (n = 1; n <= 6; n++) { var y = levelY(n, 60, 400); s('line', { x1: 540, x2: 720, y1: y, y2: y, stroke: '#B7AEE0', 'stroke-width': 2 }, lv); if (n < 5) T(svg, 728, y + 5, 'n = ' + n, { 'font-size': 13 }); if (n < 4) T(svg, 532, y + 5, num(P.bohrE(n)) + ' эВ', { 'font-size': 13, 'text-anchor': 'end' }); }
    s('line', { x1: 540, x2: 720, y1: 60, y2: 60, stroke: '#F0A994', 'stroke-dasharray': '5 4' }, lv); T(svg, 728, 52, 'E = 0, ионизация', { 'font-size': 12, 'text-anchor': 'end', fill: '#F0A994' });
    var note = T(svg, CX, 435, '', { 'text-anchor': 'middle', 'font-size': 13 });
    sl.n = L.slider(ui.ctrl, { label: 'Номер стационарного состояния <i>n</i>', min: 1, max: 5, step: 1, value: 1, on: function (v) { S.n = v; upd(); } });
    var seg = L.seg(ui.ctrl, 'Как изображать электрон', [[false, 'орбита (модель Бора, 1913)'], [true, 'облако (современное описание)']], false, function (v) { S.cloud = v; upd(); });
    var ro = L.ro(ui.ctrl, [['E', 'Энергия <i>E<sub>n</sub></i>'], ['r', 'Радиус орбиты по Бору'], ['ion', 'Нужно для ионизации'], ['st', 'Состояние']]);
    var ang = 0;
    function upd() {
      var E = P.bohrE(S.n), r = k * S.n * S.n;
      ro('E', num(E) + ' эВ'); ro('r', num(P.bohrR(S.n), 3) + ' нм'); ro('ion', num(-E) + ' эВ'); ro('st', S.n === 1 ? 'основное' : 'возбуждённое');
      [].forEach.call(orb.children, function (c) { var on = +c.getAttribute('data-n') === S.n; c.setAttribute('stroke', on ? '#F2C36B' : '#5C7C86'); c.setAttribute('stroke-width', on ? 2 : 1); c.setAttribute('visibility', S.cloud ? 'hidden' : 'visible'); });
      cloud.setAttribute('r', r * 1.5 + 12); cloud.setAttribute('visibility', S.cloud ? 'visible' : 'hidden'); e.setAttribute('visibility', S.cloud ? 'hidden' : 'visible');
      mk.setAttribute('cx', 630); mk.setAttribute('cy', levelY(S.n, 60, 400)); seg.set(S.cloud);
      note.textContent = S.cloud ? 'Траектории нет: облако показывает, где электрон вероятнее обнаружить' : 'Орбита — образ модели 1913 года, а не наблюдаемая траектория';
      place(); ui.say('Уровень ' + S.n + ', энергия ' + num(E) + ' эВ.');
    }
    function place() { var r = k * S.n * S.n; e.setAttribute('cx', CX + r * Math.cos(ang)); e.setAttribute('cy', CY + r * Math.sin(ang)); }
    L.loop(ui.scene, function (dt) { ang += dt * 2.2 / Math.pow(S.n, 1.5); place(); });
    upd(); return api(S, sl, upd);
  };

  /* ============ ПЕРЕХОДЫ И СПЕКТРЫ ============ */
  QB.sims.spectrum = function (host) {
    var S = { from: 3, to: 2, view: 'em' }, ui = L.layout(host), svg = ui.svg, sl = {};
    var X1 = 60, X2 = 330, top = 50, bot = 300, lx = function (l) { return 400 + (l - 380) / 400 * 360; };
    for (var n = 1; n <= 6; n++) { var y = levelY(n, top, bot); s('line', { x1: X1, x2: X2, y1: y, y2: y, stroke: '#B7AEE0', 'stroke-width': 2 }, svg); if (n < 5) T(svg, X2 + 8, y + 5, 'n=' + n, { 'font-size': 13 }); }
    T(svg, X1, 30, 'уровни энергии атома водорода', { 'font-size': 13 });
    var arr = s('path', { fill: 'none', 'stroke-width': 4, 'stroke-linecap': 'round' }, svg), wav = s('path', { fill: 'none', 'stroke-width': 2.5 }, svg);
    var bar = s('g', {}, svg), info = T(svg, 580, 330, '', { 'text-anchor': 'middle', 'font-size': 14, fill: '#fff' }), info2 = T(svg, 580, 352, '', { 'text-anchor': 'middle', 'font-size': 13 });
    T(svg, 400, 150, 'спектр в видимой области, 380–780 нм', { 'font-size': 13 });
    sl.from = L.slider(ui.ctrl, { label: 'Начальный уровень <i>n</i>', min: 1, max: 6, step: 1, value: 3, on: function (v) { S.from = v; upd(); } });
    sl.to = L.slider(ui.ctrl, { label: 'Конечный уровень <i>n</i>', min: 1, max: 6, step: 1, value: 2, on: function (v) { S.to = v; upd(); } });
    var seg = L.seg(ui.ctrl, 'Что показывает полоса спектра', [['em', 'спектр испускания'], ['ab', 'спектр поглощения']], 'em', function (v) { S.view = v; upd(); });
    var ro = L.ro(ui.ctrl, [['proc', 'Процесс'], ['E', 'Энергия фотона'], ['lam', 'Длина волны'], ['nu', 'Частота'], ['ser', 'Серия'], ['reg', 'Область']]);
    function upd() {
      clear(bar); seg.set(S.view);
      var i, lam, ab = S.view === 'ab';
      if (ab) for (lam = 380; lam < 780; lam += 2) s('rect', { x: lx(lam), y: 165, width: 2.2, height: 90, fill: P.rgb(lam) }, bar); else s('rect', { x: 400, y: 165, width: 360, height: 90, fill: '#0B161B' }, bar);
      for (i = 3; i <= 6; i++) { lam = P.transition(i, 2).lambda; s('rect', { x: lx(lam) - 1.5, y: 165, width: 3, height: 90, fill: ab ? '#0B161B' : P.rgb(lam), opacity: ab ? 1 : .45 }, bar); }
      s('rect', { x: 400, y: 165, width: 360, height: 90, fill: 'none', stroke: '#5C7C86' }, bar);
      [400, 500, 600, 700].forEach(function (v) { T(bar, lx(v), 272, v, { 'text-anchor': 'middle', 'font-size': 12 }); });
      if (S.from === S.to) { arr.setAttribute('d', ''); wav.setAttribute('d', ''); ['E', 'lam', 'nu', 'ser', 'reg'].forEach(function (k) { ro(k, '—'); }); ro('proc', 'перехода нет'); info.textContent = 'Выберите разные уровни'; info2.textContent = ''; return; }
      var t = P.transition(S.from, S.to), y1 = levelY(S.from, top, bot), y2 = levelY(S.to, top, bot), d = y2 > y1 ? 1 : -1, col = t.color ? P.rgb(t.lambda) : '#C9D6D4';
      arr.setAttribute('d', 'M195 ' + y1 + 'V' + (y2 - d * 3) + 'm0 0l-8 ' + (-d * 13) + 'm8 ' + (d * 13) + 'l8 ' + (-d * 13)); arr.setAttribute('stroke', t.absorption ? '#B7AEE0' : '#F2C36B');
      var w = '', ym = (y1 + y2) / 2; for (i = 0; i <= 60; i++) w += (i ? 'L' : 'M') + (t.absorption ? 60 + i * 2 : 210 + i * 2) + ' ' + (ym + 8 * Math.sin(i / 2.2)).toFixed(1); wav.setAttribute('d', w); wav.setAttribute('stroke', col);
      ro('proc', t.absorption ? 'поглощение фотона' : 'испускание фотона'); ro('E', num(t.E) + ' эВ'); ro('lam', num(t.lambda, t.lambda < 1000 ? 1 : 0) + ' нм'); ro('nu', QB.sci(t.nu) + ' Гц'); ro('ser', t.series); ro('reg', t.region + (t.color ? ', ' + t.color : ''));
      if (t.color) { s('rect', { x: lx(t.lambda) - 3, y: 158, width: 6, height: 104, fill: ab ? '#000' : col, stroke: '#fff', 'stroke-width': 1 }, bar); info.textContent = 'Линия ' + num(t.lambda, 1) + ' нм — ' + t.color; info2.textContent = ab ? 'в спектре поглощения — тёмная на том же месте' : 'в спектре испускания — яркая'; }
      else { info.textContent = 'Линия ' + num(t.lambda, 0) + ' нм — ' + t.region; info2.textContent = 'глазу не видна, на полосе её нет ' + (t.lambda < 380 ? '(левее края)' : '(правее края)'); }
      ui.say((t.absorption ? 'Поглощение' : 'Испускание') + ', энергия ' + num(t.E) + ' эВ, длина волны ' + num(t.lambda, 0) + ' нм, ' + t.region + '.');
    }
    upd(); return api(S, sl, upd);
  };

  /* ============ ЛАЗЕР ============ */
  QB.sims.laser = function (host) {
    var S = { pump: 0, mirrors: true }, ui = L.layout(host), svg = ui.svg, g = ui.canvas(), sl = {}, rnd = P.rng(60), atoms = [], ph = [], out = 0, outRate = 0, tAcc = 0, neAvg = 0, naxAvg = 0;
    s('rect', { x: 150, y: 150, width: 460, height: 150, rx: 12, fill: '#22404A', stroke: '#5C7C86' }, svg);
    var m1 = s('rect', { x: 132, y: 135, width: 10, height: 180, fill: '#E9F0EE' }, svg), m2 = s('rect', { x: 618, y: 135, width: 10, height: 180, fill: '#E9F0EE', opacity: .55 }, svg);
    var lamp = s('rect', { x: 170, y: 92, width: 420, height: 22, rx: 11, fill: '#7364A8' }, svg); T(svg, 380, 82, 'лампа накачки', { 'text-anchor': 'middle', 'font-size': 13 });
    T(svg, 137, 336, 'зеркало', { 'text-anchor': 'middle', 'font-size': 12 }); T(svg, 623, 336, 'полупрозрачное', { 'text-anchor': 'middle', 'font-size': 12 }); T(svg, 623, 351, 'зеркало', { 'text-anchor': 'middle', 'font-size': 12 });
    T(svg, 380, 322, 'активная среда', { 'text-anchor': 'middle', 'font-size': 13 });
    var beam = s('rect', { x: 630, y: 213, width: 170, height: 24, fill: '#F0563F', opacity: 0 }, svg), bl = T(svg, 715, 200, '', { 'text-anchor': 'middle', 'font-size': 13, fill: '#F0A994' });
    for (var i = 0; i < 14; i++) for (var j = 0; j < 4; j++) atoms.push({ x: 180 + i * 31, y: 172 + j * 35, ex: false });
    ui.cap('Атомы и фотоны показаны условно.');
    sl.pump = L.slider(ui.ctrl, { label: 'Мощность накачки', min: 0, max: 100, step: 5, value: 0, unit: '%', on: function (v) { S.pump = v; upd(); } });
    var seg = L.seg(ui.ctrl, 'Зеркала резонатора', [[true, 'установлены'], [false, 'убраны']], true, function (v) { S.mirrors = v; upd(); });
    var ro = L.ro(ui.ctrl, [['ex', 'Возбуждённых атомов'], ['inv', 'Инверсная населённость'], ['n', 'Фотонов вдоль оси'], ['out', 'Выходной пучок']]);
    function upd() { lamp.setAttribute('opacity', .25 + .75 * S.pump / 100); m1.setAttribute('visibility', S.mirrors ? 'visible' : 'hidden'); m2.setAttribute('visibility', S.mirrors ? 'visible' : 'hidden'); seg.set(S.mirrors); anim.kick(); }
    var anim = L.loop(ui.scene, function (dt) {
      var k, a, o, ne = 0;
      if (!dt) { atoms.forEach(function (a, i) { a.ex = (i * 7) % 100 < S.pump * .8; }); }
      for (k = 0; k < atoms.length; k++) { a = atoms[k]; if (!a.ex && rnd() < S.pump / 100 * 2.4 * dt) a.ex = true; else if (a.ex && rnd() < 0.8 * dt) { a.ex = false; var an = rnd() * 6.283; ph.push({ x: a.x, y: a.y, vx: Math.cos(an), vy: Math.sin(an), ax: Math.abs(Math.sin(an)) < .12 }); } }
      for (k = ph.length - 1; k >= 0; k--) {
        o = ph[k]; var px = o.x; o.x += o.vx * 420 * dt; o.y += o.vy * 420 * dt;
        if (o.ax) { o.vy = 0; for (var q = 0; q < atoms.length; q++) { a = atoms[q]; if (Math.abs(a.y - o.y) < 18 && (a.x - px) * (a.x - o.x) <= 0) { if (a.ex && rnd() < .45 && ph.length < 260) { a.ex = false; ph.push({ x: o.x, y: a.y + (rnd() - .5) * 8, vx: o.vx > 0 ? 1 : -1, vy: 0, ax: true }); } else if (!a.ex && rnd() < .45) { a.ex = true; ph.splice(k, 1); o = null; break; } } } if (!o) continue;
          if (S.mirrors) { if (o.x < 145) { o.x = 145; o.vx = 1; } if (o.x > 615) { if (rnd() < .25) { out++; ph.splice(k, 1); continue; } o.x = 615; o.vx = -1; } } }
        if (o.x < 100 || o.x > 660 || o.y < 120 || o.y > 330) { ph.splice(k, 1); }
      }
      tAcc += dt; if (tAcc > .5) { outRate = outRate * .5 + out / tAcc * .5; out = 0; tAcc = 0; }
      atoms.forEach(function (a) { if (a.ex) ne++; });
      var nax = ph.filter(function (p) { return p.ax; }).length; neAvg += (ne - neAvg) * Math.min(1, dt * 1.5 || 1); naxAvg += (nax - naxAvg) * Math.min(1, dt * 1.5 || 1); var on = S.mirrors && naxAvg > 18;
      g.clearRect(0, 0, 800, 450);
      atoms.forEach(function (a) { g.beginPath(); g.arc(a.x, a.y, a.ex ? 7 : 5, 0, 6.3); g.fillStyle = a.ex ? '#B7AEE0' : '#3A5560'; g.fill(); if (a.ex) { g.strokeStyle = '#E8E3FA'; g.lineWidth = 1.5; g.stroke(); } });
      ph.forEach(function (p) { g.fillStyle = p.ax ? '#FF7A5C' : '#F2C36B'; g.fillRect(p.x - (p.ax ? 7 : 2), p.y - 1.5, p.ax ? 14 : 4, 3); });
      beam.setAttribute('opacity', on ? Math.min(.95, naxAvg / 70) : 0); bl.textContent = on ? 'лазерный пучок' : '';
      ro('ex', Math.round(neAvg) + ' из ' + atoms.length); ro('inv', neAvg > atoms.length / 2 ? 'есть' : 'нет', neAvg <= atoms.length / 2); ro('n', String(Math.round(naxAvg))); ro('out', on ? 'есть генерация' : 'нет', !on);
    });
    upd(); return api(S, sl, upd);
  };
})();
