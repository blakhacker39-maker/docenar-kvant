/* DOCENAR • КВАНТ — лабораторные помощники и модель фотоэффекта */
(function () {
  'use strict';
  var QB = window.QB, h = QB.h, s = QB.s, P = QB.P, L = QB.L = {};
  var uid = 0;

  L.layout = function (host, light, vb) {
    var scene = h('div', { class: 'scene' + (light ? ' light' : '') }), ctrl = h('div', { class: 'ctrl' });
    var svg = s('svg', { viewBox: vb || '0 0 800 450', preserveAspectRatio: 'xMidYMid meet', 'aria-hidden': 'true' }, scene);
    var desc = h('p', { class: 'sr', 'aria-live': 'polite' });
    var under = h('div', { style: 'margin-top:1rem' });
    host.appendChild(h('p', { class: 'lab-pan', text: 'Схему можно листать вбок →' }));
    host.appendChild(h('div', { class: 'lab' }, [h('div', {}, [scene, desc]), ctrl])); host.appendChild(under);
    return { scene: scene, svg: svg, ctrl: ctrl, under: under, say: function (t) { desc.textContent = t; },
      cap: function (t) { scene.appendChild(h('div', { class: 'cap', text: t })); },
      canvas: function () { var c = h('canvas', { width: 1600, height: 900, 'aria-hidden': 'true' }); scene.appendChild(c); var x = c.getContext('2d'); x.scale(2, 2); return x; } };
  };
  L.slider = function (parent, o) {
    var id = 'sl' + (++uid), out = h('output', { for: id }), dec = o.dec == null ? 0 : o.dec;
    var inp = h('input', { type: 'range', id: id, min: o.min, max: o.max, step: o.step || 1, value: o.value });
    function show() { out.innerHTML = (o.fmt ? o.fmt(+inp.value) : QB.num(+inp.value, dec)) + (o.unit ? ' ' + o.unit : ''); }
    inp.addEventListener('input', function () { show(); o.on(+inp.value); });
    parent.appendChild(h('div', { class: 'sl' }, [h('label', { for: id }, [h('span', { html: o.label }), out]), inp])); show();
    return { get: function () { return +inp.value; }, set: function (v) { inp.value = v; show(); }, el: inp };
  };
  L.ro = function (parent, items) {
    var box = h('div', { class: 'ro' }), map = {}, last = {};
    items.forEach(function (it) { var b = h('b'), d = h('div', {}, [h('span', { html: it[1] }), b]); map[it[0]] = [d, b]; box.appendChild(d); });
    parent.appendChild(box);
    return function (key, html, off) {
      var m = map[key]; if (!m) return; if (last[key] !== html) { m[1].innerHTML = html; if (last[key] !== undefined && !QB.reduced) { m[0].classList.add('flash'); setTimeout(function () { m[0].classList.remove('flash'); }, 700); } last[key] = html; }
      m[0].classList.toggle('off', !!off);
    };
  };
  L.seg = function (parent, label, opts, value, on) {
    var box = h('div', { class: 'seg', role: 'group', 'aria-label': label }), btns = [];
    opts.forEach(function (o) { var b = h('button', { type: 'button', 'aria-pressed': String(o[0] === value), html: o[1], onclick: function () { set(o[0]); on(o[0]); } }); b._v = o[0]; btns.push(b); box.appendChild(b); });
    function set(v) { btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b._v === v)); }); }
    parent.appendChild(h('div', {}, [h('div', { style: 'font-size:.86rem;font-weight:500;margin-bottom:.25em', html: label }), box]));
    return { set: set };
  };
  L.btn = function (parent, text, on, cls) { var b = h('button', { class: 'btn ' + (cls || ''), type: 'button', html: text, onclick: on }); parent.appendChild(b); return b; };
  /* график в координатах данных */
  L.plot = function (parent, o) {
    var W = o.w || 520, H = o.h || 300, pl = o.pl || 52, pb = 40, pt = 14, pr = 16;
    var svg = parent.namespaceURI === 'http://www.w3.org/2000/svg' ? s('g', { transform: o.tr || '' }, parent) : s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'plot', role: 'img', 'aria-label': o.alt || 'График', style: 'width:100%;height:auto;display:block;background:#FFFEFA;border:1px solid #D8DED8;border-radius:12px' }, parent);
    svg.classList.add('plot');
    var X = function (x) { return pl + (x - o.x0) / (o.x1 - o.x0) * (W - pl - pr); }, Y = function (y) { return H - pb - (y - o.y0) / (o.y1 - o.y0) * (H - pb - pt); };
    (o.xt || []).forEach(function (t) { s('line', { x1: X(t), x2: X(t), y1: pt, y2: H - pb, stroke: '#E6EAE4' }, svg); s('text', { x: X(t), y: H - pb + 15, 'text-anchor': 'middle' }, svg, String(t).replace('.', ',')); });
    (o.yt || []).forEach(function (t) { s('line', { x1: pl, x2: W - pr, y1: Y(t), y2: Y(t), stroke: '#E6EAE4' }, svg); s('text', { x: pl - 7, y: Y(t) + 4, 'text-anchor': 'end' }, svg, String(t).replace('.', ',')); });
    s('path', { d: 'M' + pl + ' ' + pt + 'V' + (H - pb) + 'H' + (W - pr), fill: 'none', stroke: '#1E2E35', 'stroke-width': 1.5 }, svg);
    s('text', { x: (pl + W - pr) / 2, y: H - 6, 'text-anchor': 'middle', style: 'font-weight:600' }, svg, o.xl || '');
    s('text', { x: 13, y: (pt + H - pb) / 2, 'text-anchor': 'middle', transform: 'rotate(-90 13 ' + (pt + H - pb) / 2 + ')', style: 'font-weight:600' }, svg, o.yl || '');
    var layer = s('g', {}, svg);
    return { X: X, Y: Y, svg: svg, layer: layer, clear: function () { while (layer.firstChild) layer.removeChild(layer.firstChild); },
      path: function (pts, a) { a = a || {}; a.d = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(''); a.fill = a.fill || 'none'; a.stroke = a.stroke || '#087F78'; a['stroke-width'] = a['stroke-width'] || 2.5; return s('path', a, layer); },
      dot: function (x, y, a) { a = a || {}; a.cx = X(x); a.cy = Y(y); a.r = a.r || 6; a.fill = a.fill || '#D8922C'; a.stroke = a.stroke || '#1E2E35'; return s('circle', a, layer); },
      text: function (x, y, t, a) { a = a || {}; a.x = X(x); a.y = Y(y); return s('text', a, layer, t); },
      vline: function (x, a) { a = a || {}; a.x1 = a.x2 = X(x); a.y1 = pt; a.y2 = H - pb; a.stroke = a.stroke || '#B6533E'; a['stroke-dasharray'] = '5 4'; return s('line', a, layer); } };
  };
  /* цикл анимации: работает только когда сцена видна и вкладка активна */
  L.loop = function (el, fn) {
    var vis = false, raf = 0, last = 0, T = 0;
    function tick(now) { raf = 0; var dt = Math.max(0, Math.min(0.05, (now - last) / 1000 || 0)); last = now; T += dt; fn(dt, T); run(); }
    function run() { if (!raf && vis && !document.hidden && !QB.reduced) { raf = requestAnimationFrame(tick); } }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; last = performance.now(); run(); }).observe(el); else vis = true;
    document.addEventListener('visibilitychange', function () { last = performance.now(); run(); });
    document.addEventListener('qb:step', function () { last = performance.now(); setTimeout(run, 30); });
    fn(0, 0); run();
    return { kick: function () { if (QB.reduced || !vis) fn(0, T); } };
  };
  L.defs = function (svg, html) { var d = s('defs', {}, svg); d.innerHTML = html; return d; };

  /* ====================== ФОТОЭФФЕКТ ====================== */
  QB.sims.photoeffect = function (host, opts, ctx) {
    var S = { lambda: opts.lambda || 400, I: opts.I == null ? 40 : opts.I, A: opts.A || 2.30, U: 0 };
    var ui = L.layout(host), svg = ui.svg;
    L.defs(svg, '<linearGradient id="pe-met" x1="0" x2="1"><stop offset="0" stop-color="#8FA3A8"/><stop offset=".5" stop-color="#D9E3E3"/><stop offset="1" stop-color="#6F858B"/></linearGradient>' +
      '<radialGradient id="pe-glass" cx=".35" cy=".3"><stop offset="0" stop-color="#5C8C92" stop-opacity=".28"/><stop offset="1" stop-color="#2B4A52" stop-opacity=".1"/></radialGradient>');
    // колба, электроды, цепь
    s('ellipse', { cx: 430, cy: 205, rx: 290, ry: 150, fill: 'url(#pe-glass)', stroke: '#9CC3C4', 'stroke-opacity': .6, 'stroke-width': 2 }, svg);
    s('path', { d: 'M200 120 Q300 70 430 62', fill: 'none', stroke: '#fff', 'stroke-opacity': .25, 'stroke-width': 5, 'stroke-linecap': 'round' }, svg);
    var beam = s('polygon', { points: '40,0 170,0 262,120 262,300', opacity: .2 }, svg);
    s('rect', { x: 236, y: 110, width: 26, height: 200, rx: 4, fill: 'url(#pe-met)' }, svg);
    s('rect', { x: 600, y: 130, width: 12, height: 160, rx: 3, fill: 'url(#pe-met)' }, svg);
    s('path', { d: 'M249 310V400H380M480 400H606V290', fill: 'none', stroke: '#C9D6D4', 'stroke-width': 2.5 }, svg);
    s('circle', { cx: 430, cy: 400, r: 26, fill: '#14232B', stroke: '#C9D6D4', 'stroke-width': 2.5 }, svg);
    var needle = s('line', { x1: 430, y1: 412, x2: 430, y2: 384, stroke: '#D8922C', 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);
    s('path', { d: 'M380 400h24M456 400h24', stroke: '#C9D6D4', 'stroke-width': 2.5 }, svg);
    var T = function (x, y, t, a) { a = a || {}; a.x = x; a.y = y; a.fill = a.fill || '#C9D6D4'; a['font-size'] = a['font-size'] || 18; a['font-family'] = 'Golos Text,Segoe UI,sans-serif'; return s('text', a, svg, t); };
    T(170, 96, 'катод', { 'text-anchor': 'end' }); T(626, 122, 'анод'); T(430, 442, 'гальванометр', { 'text-anchor': 'middle', 'font-size': 16 });
    T(64, 52, 'свет', { fill: '#fff' });
    var uvLab = T(64, 72, '', { 'font-size': 16, fill: '#B9B2DA' }), status = T(430, 36, '', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 600 });
    var pol = opts.uz ? T(430, 372, '', { 'text-anchor': 'middle', 'font-size': 16 }) : null;
    var g = ui.canvas(); ui.cap('Частицы показаны условно, не в масштабе.');
    var ph = [], el = [], acc = 0, accE = 0, rnd = P.rng(7);

    // управление
    var sl = {};
    sl.lambda = L.slider(ui.ctrl, { label: 'Длина волны λ', min: 200, max: 700, step: 5, value: S.lambda, unit: 'нм', on: function (v) { S.lambda = v; upd(); } });
    sl.I = L.slider(ui.ctrl, { label: 'Интенсивность света (условная)', min: 0, max: 100, step: 5, value: S.I, unit: '%', on: function (v) { S.I = v; upd(); } });
    sl.A = L.slider(ui.ctrl, { label: 'Работа выхода поверхности <i>A</i>', min: 1.5, max: 5.5, step: 0.05, dec: 2, value: S.A, unit: 'эВ', on: function (v) { S.A = v; upd(); } });
    if (opts.uz) sl.U = L.slider(ui.ctrl, { label: 'Задерживающее напряжение <i>U</i>', min: 0, max: 4, step: 0.05, dec: 2, value: 0, unit: 'В', on: function (v) { S.U = v; upd(); } });
    var ro = L.ro(ui.ctrl, [['Ef', 'Энергия фотона <i>E</i><sub>ф</sub>'], ['em', 'Электроны вылетают?'], ['Emax', 'Макс. энергия <i>E</i><sub>max</sub>'], ['lcr', 'Красная граница λ<sub>кр</sub>'], ['rate', 'Поток электронов (усл.)']].concat(opts.uz ? [['Uz', 'Запирающее <i>U</i><sub>з</sub>'], ['cur', 'Ток в цепи']] : []));
    // диаграмма баланса энергии
    var bal = s('svg', { viewBox: '0 0 300 118', role: 'img', style: 'width:100%;height:auto;background:#FFFEFA;border:1px solid #D8DED8;border-radius:10px' }, ui.ctrl);
    var balG = s('g', {}, bal);
    // график
    var plotBox = h('div', { class: 'two' }), plotL = h('div'), tblBox = h('div');
    plotBox.appendChild(plotL); plotBox.appendChild(tblBox); ui.under.appendChild(plotBox);
    var pl = L.plot(plotL, { x0: 4, x1: 15, y0: 0, y1: 5, xt: [4, 6, 8, 10, 12, 14], yt: [0, 1, 2, 3, 4, 5], xl: 'частота света ν, ×10¹⁴ Гц', yl: 'E max, эВ', alt: 'График зависимости максимальной энергии фотоэлектронов от частоты' });
    plotL.appendChild(h('p', { class: 'note', style: 'margin-top:.5em', html: 'Линия начинается на пороге: левее красной границы электронов нет, поэтому и точек на графике нет. Наклон линии одинаков для любой поверхности — это постоянная Планка.' }));

    // таблица наблюдений
    var rows = ctx.st.rows = ctx.st.rows || [], tb = h('tbody'), cmp = h('div', { 'aria-live': 'polite' });
    tblBox.appendChild(h('h4', { text: 'Журнал наблюдений' }));
    tblBox.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, [h('thead', {}, h('tr', {}, ['', 'λ, нм', 'I, %', 'A, эВ', 'Eф, эВ', 'Электроны', 'Emax, эВ'].map(function (t) { return h('th', { text: t }); }))), tb])));
    var rowBtns = h('div', { class: 'row', style: 'margin:.6em 0' });
    L.btn(rowBtns, 'Записать опыт', function () { if (rows.length >= 8) rows.shift(); rows.push({ l: S.lambda, I: S.I, A: S.A }); ctx.save(); drawRows(); }, 'amb sm');
    L.btn(rowBtns, 'Сравнить отмеченные', compare, 'sm');
    L.btn(rowBtns, 'Очистить', function () { rows.length = 0; ctx.save(); drawRows(); cmp.innerHTML = ''; }, 'sm ghost');
    tblBox.appendChild(rowBtns); tblBox.appendChild(cmp);
    function drawRows() {
      tb.innerHTML = '';
      if (!rows.length) tb.appendChild(h('tr', {}, h('td', { colspan: 7, style: 'color:#4A5A60', text: 'Пока пусто. Установите параметры и нажмите «Записать опыт».' })));
      rows.forEach(function (r, i) {
        var p = P.photo(r.l, r.A, r.I), cb = h('input', { type: 'checkbox', 'aria-label': 'Выбрать опыт ' + (i + 1) }); cb.checked = !!r.c; cb.onchange = function () { r.c = cb.checked; };
        tb.appendChild(h('tr', {}, [h('td', {}, cb), h('td', { text: r.l }), h('td', { text: r.I }), h('td', { text: QB.num(r.A) }), h('td', { text: QB.num(p.Ef) }), h('td', { text: p.emits ? 'есть' : 'нет' }), h('td', { text: p.emits ? QB.num(p.Emax) : '—' })]));
      });
    }
    function compare() {
      var c = rows.filter(function (r) { return r.c; }); cmp.innerHTML = '';
      if (c.length !== 2) { cmp.appendChild(h('div', { class: 'fb info', text: 'Отметьте галочками ровно два опыта.' })); return; }
      var d = []; if (c[0].l !== c[1].l) d.push('длина волны'); if (c[0].I !== c[1].I) d.push('интенсивность'); if (c[0].A !== c[1].A) d.push('работа выхода');
      var a = P.photo(c[0].l, c[0].A, c[0].I), b = P.photo(c[1].l, c[1].A, c[1].I), fE = function (p) { return p.emits ? QB.num(p.Emax) + ' эВ' : 'электронов нет'; };
      if (d.length === 1) { cmp.appendChild(h('div', { class: 'fb ok', html: '<b class="tag">✓ Корректное сравнение</b>Менялась только одна величина — <b>' + d[0] + '</b>. Максимальная энергия: ' + fE(a) + ' → ' + fE(b) + '. Поток электронов: ' + a.rate + ' → ' + b.rate + ' усл. ед. Сформулируйте вывод своими словами.' })); ctx.badge('control'); }
      else cmp.appendChild(h('div', { class: 'fb no', html: '<b class="tag">✗ Вывод сделать нельзя</b>' + (d.length ? 'Между опытами изменились сразу ' + d.length + ' величины (' + d.join(', ') + '). Непонятно, какая из них дала эффект.' : 'Опыты одинаковы.') + ' Выберите пару, где отличается только одна величина.' }));
    }

    function upd() {
      var p = P.photo(S.lambda, S.A, S.I), col = P.rgb(S.lambda), vis = S.lambda >= 380 && S.lambda <= 780;
      beam.setAttribute('fill', col); beam.setAttribute('opacity', 0.08 + 0.45 * S.I / 100);
      uvLab.textContent = vis ? '' : 'УФ: глазу невидим,'; if (!vis) { uvLab.textContent = 'УФ — невидим, показан условно'; }
      ro('Ef', QB.num(p.Ef) + ' эВ'); ro('em', p.emits ? 'да' : 'нет', !p.emits);
      ro('Emax', p.emits ? QB.num(p.Emax) + ' эВ' : 'электронов нет', !p.emits); ro('lcr', QB.num(p.lambdaCr, 0) + ' нм'); ro('rate', String(p.rate), !p.emits);
      var reach = p.emits && (!opts.uz || S.U < p.Emax);
      if (opts.uz) { ro('Uz', p.emits ? QB.num(p.Uz) + ' В' : '—', !p.emits); ro('cur', reach ? 'есть' : 'нет', !reach); pol.textContent = S.U > 0 ? 'на аноде «−», на катоде «+»: поле тормозит электроны' : ''; }
      status.textContent = !S.I ? 'Света нет — фотоэффекта нет' : !p.energetic ? 'Энергии фотона не хватает: электроны не вылетают' : reach ? 'Электроны достигают анода — ток есть' : 'Электроны вылетают, но поле возвращает их: тока нет';
      status.setAttribute('fill', reach ? '#F2C36B' : '#F0A994');
      needle.setAttribute('transform', 'rotate(' + (reach ? -40 + 0.8 * S.I * (opts.uz ? Math.max(.15, 1 - S.U / p.Emax) : 1) : -40) + ' 430 412)');
      // баланс энергии
      while (balG.firstChild) balG.removeChild(balG.firstChild);
      var k = 250 / 6.5, x0 = 25, t = function (x, y, tx, a) { a = a || {}; a.x = x; a.y = y; a['font-size'] = 13; a.fill = a.fill || '#1E2E35'; a['font-family'] = 'Golos Text,sans-serif'; s('text', a, balG, tx); };
      t(x0, 14, 'Баланс энергии одного фотона', { 'font-weight': 600 });
      s('rect', { x: x0, y: 24, width: p.Ef * k, height: 22, fill: col, stroke: '#1E2E35', rx: 3 }, balG); t(x0 + p.Ef * k + 5, 39, 'Eф = ' + QB.num(p.Ef) + ' эВ');
      if (p.energetic) {
        s('rect', { x: x0, y: 58, width: S.A * k, height: 22, fill: '#7364A8', rx: 3 }, balG); s('rect', { x: x0 + S.A * k, y: 58, width: Math.max(1, (p.Ef - S.A) * k), height: 22, fill: '#D8922C', rx: 3 }, balG);
        t(x0, 96, 'A = ' + QB.num(S.A) + ' эВ — на выход', { fill: '#55478A' }); t(x0 + 150, 96, 'Emax = ' + QB.num(p.Ef - S.A) + ' эВ', { fill: '#8A5A10' });
        t(x0, 112, 'Eф = A + Emax');
      } else {
        s('rect', { x: x0, y: 58, width: S.A * k, height: 22, fill: 'none', stroke: '#7364A8', 'stroke-dasharray': '4 3', rx: 3 }, balG); s('rect', { x: x0, y: 58, width: p.Ef * k, height: 22, fill: '#7364A8', opacity: .45, rx: 3 }, balG);
        t(x0, 96, 'Нужно A = ' + QB.num(S.A) + ' эВ, не хватает ' + QB.num(S.A - p.Ef) + ' эВ', { fill: '#96402E' }); t(x0, 112, 'Электрон не выходит при любой яркости');
      }
      bal.setAttribute('aria-label', 'Баланс энергии: фотон ' + QB.num(p.Ef) + ' эВ, работа выхода ' + QB.num(S.A) + ' эВ, ' + (p.energetic ? 'остаток ' + QB.num(p.Ef - S.A) + ' эВ' : 'энергии не хватает'));
      // график
      pl.clear(); var nu0 = p.nuCr / 1e14;
      if (nu0 < 15) { pl.path([[nu0, 0], [15, (15 - nu0) * 1e14 * P.C.h_eVs]]); pl.vline(nu0); pl.text(nu0, 4.8, 'ν кр', { 'text-anchor': 'middle', fill: '#96402E' }); }
      var nu = p.nu / 1e14; if (p.emits) pl.dot(nu, p.Emax); else s('path', { d: 'M' + (pl.X(nu) - 6) + ' ' + (pl.Y(0) - 6) + 'l12 12m0-12l-12 12', stroke: '#B6533E', 'stroke-width': 3 }, pl.layer);
      ui.say('Длина волны ' + S.lambda + ' нм, интенсивность ' + S.I + ' %, работа выхода ' + QB.num(S.A) + ' эВ. ' + status.textContent + '.');
      anim.kick();
    }
    var anim = L.loop(ui.scene, function (dt) {
      var p = P.photo(S.lambda, S.A, S.I), col = P.rgb(S.lambda), i, o;
      acc += dt * S.I * 0.22; while (acc > 1) { acc--; var yy = 125 + rnd() * 170; ph.push({ t: 0, y: yy, x0: 70 + rnd() * 70 }); }
      g.clearRect(0, 0, 800, 450);
      if (!dt) { // статичный кадр
        for (i = 0; i < S.I / 8; i++) { var f = (i + .5) / (S.I / 8); dot(g, 105 + (262 - 105) * f, 20 + (140 + 150 * ((i * 37) % 10) / 10 - 20) * f, col); }
        if (p.emits) for (i = 0; i < S.I / 10; i++) {
          var reach = opts.uz && S.U > 0 ? Math.min(1, p.Emax / S.U) : 1;
          eDot(g, 264 + reach * (16 + i * 30 % 300), 140 + (i * 53) % 150);
        }
        return;
      }
      for (i = ph.length - 1; i >= 0; i--) {
        o = ph[i]; o.t += dt * 1.6; var x = o.x0 + (262 - o.x0) * o.t, y = 20 + (o.y - 20) * o.t;
        if (o.t >= 1) { ph.splice(i, 1); if (p.emits && rnd() < 0.6) el.push({ x: 264, y: o.y, e: p.Emax * Math.sqrt(rnd()), vy: (rnd() - .5) * 40, back: false }); continue; }
        dot(g, x, y, col);
      }
      for (i = el.length - 1; i >= 0; i--) {
        o = el[i]; var E = o.e, stop = opts.uz && S.U > 0 ? 264 + 336 * Math.min(1.2, E / S.U) : 9e9, v = 70 + 150 * Math.sqrt(E);
        if (!o.back && o.x >= stop && stop < 600) o.back = true;
        o.x += (o.back ? -1 : 1) * v * dt * (opts.uz && S.U > 0 ? Math.max(.25, 1 - (o.x - 264) / (stop - 264 + 1) * .7) : 1); o.y += o.vy * dt;
        if (o.x >= 600 || o.x < 262 || o.y < 70 || o.y > 340) { el.splice(i, 1); continue; }
        eDot(g, o.x, o.y);
      }
      if (el.length > 160) el.splice(0, el.length - 160);
    });
    function dot(g, x, y, col) { g.strokeStyle = col; g.lineWidth = 2.2; g.beginPath(); for (var k = -8; k <= 8; k += 2) { var px = x + k * .55, py = y + k * .95 + Math.sin(k * 1.3) * 3.2; k === -8 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); }
    function eDot(g, x, y) { g.fillStyle = '#F2C36B'; g.beginPath(); g.arc(x, y, 4, 0, 6.3); g.fill(); g.fillStyle = '#14232B'; g.fillRect(x - 2, y - .6, 4, 1.2); }
    drawRows(); upd();
    return { set: function (o) { for (var k in o) if (k in S) { S[k] = o[k]; if (sl[k]) sl[k].set(o[k]); } upd(); }, get: function () { return S; } };
  };
})();
