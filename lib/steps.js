/* DOCENAR • КВАНТ — «Разбор по шагам»: живой опыт + схема, которая строится анимацией по шагам */
(function () {
  'use strict';
  var QB = window.QB, h = QB.h;
  QB.steps = QB.steps || {};

  /* ---------- графические примитивы (строки SVG) ---------- */
  var G = QB.G = {};
  var FONT = 'Golos Text,Segoe UI,Arial,sans-serif', MATH = 'PT Serif,Georgia,serif';
  G.C = { ink: '#1E2E35', ink2: '#4A5A60', teal: '#087F78', amb: '#D8922C', ambd: '#8A5A10', vio: '#7364A8', viod: '#55478A', ter: '#B6533E', line: '#D8DED8', paper: '#FFFEFA', soft: '#F1EEE5', e: '#E0A12E', night: '#14232B' };
  G.clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  G.ease = function (k) { k = G.clamp(k); return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
  G.seg = function (k, a, b) { return G.ease((k - a) / (b - a)); };
  G.n = function (v, d) { return QB.num(v, d); };
  function op(o) { return o == null || o >= 1 ? '' : ' opacity="' + G.clamp(o).toFixed(3) + '"'; }
  G.g = function (inner, o, tr) { if (o != null && o <= 0.001) return ''; return '<g' + op(o) + (tr ? ' transform="' + tr + '"' : '') + '>' + inner + '</g>'; };
  G.line = function (x1, y1, x2, y2, p, col, w, dash) {
    p = p == null ? 1 : G.clamp(p); if (p <= 0) return '';
    return '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + (x1 + (x2 - x1) * p).toFixed(1) + '" y2="' + (y1 + (y2 - y1) * p).toFixed(1) + '" stroke="' + (col || G.C.ink) + '" stroke-width="' + (w || 2.5) + '" stroke-linecap="round"' + (dash ? ' stroke-dasharray="' + dash + '"' : '') + '/>';
  };
  G.arrow = function (x1, y1, x2, y2, p, col, w, label, lo) {
    p = p == null ? 1 : G.clamp(p); if (p <= 0) return '';
    col = col || G.C.ink; w = w || 3.5;
    var X = x1 + (x2 - x1) * p, Y = y1 + (y2 - y1) * p, a = Math.atan2(Y - y1, X - x1), s = 9 + w * 1.6, len = Math.hypot(X - x1, Y - y1);
    if (len < 2) return '';
    var o = '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + (X - Math.cos(a) * s * .6).toFixed(1) + '" y2="' + (Y - Math.sin(a) * s * .6).toFixed(1) + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    o += '<path d="M' + X.toFixed(1) + ' ' + Y.toFixed(1) + 'L' + (X - s * Math.cos(a - .42)).toFixed(1) + ' ' + (Y - s * Math.sin(a - .42)).toFixed(1) + 'L' + (X - s * Math.cos(a + .42)).toFixed(1) + ' ' + (Y - s * Math.sin(a + .42)).toFixed(1) + 'Z" fill="' + col + '"/>';
    if (label && p > .6) { lo = lo || {}; o += G.f((x1 + X) / 2 + (lo.dx || 0), (y1 + Y) / 2 + (lo.dy == null ? -12 : lo.dy), label, { s: lo.s || 20, f: col, a: lo.a || 'middle', op: (p - .6) / .4 }); }
    return o;
  };
  /* текст с индексами: E_ф, E_{max}, λ_{кр}, 10^{14} */
  G.f = function (x, y, src, o) {
    o = o || {}; var s = o.s || 18, out = '', re = /([_^])(\{[^}]*\}|[A-Za-zА-Яа-яёЁ0-9½]+)/g, last = 0, m, shift = 0;
    var esc = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    src = String(src);
    while ((m = re.exec(src))) {
      if (m.index > last) { out += '<tspan' + (shift ? ' dy="' + (-shift) + '"' : '') + '>' + esc(src.slice(last, m.index)) + '</tspan>'; shift = 0; }
      var t = m[2].replace(/^\{|\}$/g, ''), d = m[1] === '_' ? s * .28 : -s * .38;
      out += '<tspan dy="' + (d - shift).toFixed(1) + '" font-size="' + (s * .68).toFixed(1) + '">' + esc(t) + '</tspan>'; shift = d; last = re.lastIndex;
    }
    if (last < src.length) out += '<tspan' + (shift ? ' dy="' + (-shift).toFixed(1) + '"' : '') + '>' + esc(src.slice(last)) + '</tspan>';
    return '<text x="' + (+x).toFixed(1) + '" y="' + (+y).toFixed(1) + '" font-family="' + (o.m ? MATH : FONT) + '" font-size="' + s + '" fill="' + (o.f || G.C.ink) + '"' + (o.a ? ' text-anchor="' + o.a + '"' : '') + (o.w ? ' font-weight="' + o.w + '"' : '') + (o.i ? ' font-style="italic"' : '') + op(o.op) + '>' + out + '</text>';
  };
  G.t = G.f;
  G.rect = function (x, y, w, hh, fill, o) { o = o || {}; if (w < 0) { x += w; w = -w; } return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(0, w).toFixed(1) + '" height="' + Math.max(0, hh).toFixed(1) + '" rx="' + (o.rx == null ? 6 : o.rx) + '" fill="' + (fill || 'none') + '"' + (o.s ? ' stroke="' + o.s + '" stroke-width="' + (o.sw || 2) + '"' : '') + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + op(o.op) + '/>'; };
  G.circ = function (x, y, r, fill, o) { o = o || {}; return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + Math.max(0, r).toFixed(1) + '" fill="' + (fill || 'none') + '"' + (o.s ? ' stroke="' + o.s + '" stroke-width="' + (o.sw || 2) + '"' : '') + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + op(o.op) + '/>'; };
  G.path = function (d, col, w, o) { o = o || {}; return '<path d="' + d + '" fill="' + (o.fill || 'none') + '" stroke="' + (col || G.C.ink) + '" stroke-width="' + (w || 2.5) + '" stroke-linecap="round" stroke-linejoin="round"' + (o.d ? ' stroke-dasharray="' + o.d + '"' : '') + op(o.op) + '/>'; };
  G.poly = function (pts, p) { p = p == null ? 1 : G.clamp(p); var n = Math.max(2, Math.round(pts.length * p)); return pts.slice(0, n).map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(''); };
  /* синусоида-«пакет»: фотон */
  G.wave = function (x1, y1, x2, y2, n, amp, col, w, p) {
    p = p == null ? 1 : G.clamp(p); if (p <= 0) return '';
    var L = Math.hypot(x2 - x1, y2 - y1); if (!(L > 1) || !(n > 0)) return '';
    var ux = (x2 - x1) / L, uy = (y2 - y1) / L, N = Math.max(8, Math.round(n * 14 * p)), d = '';
    for (var i = 0; i <= N; i++) { var f = i / N * p, a = Math.sin(f * n * 2 * Math.PI) * amp; d += (i ? 'L' : 'M') + (x1 + ux * L * f - uy * a).toFixed(1) + ' ' + (y1 + uy * L * f + ux * a).toFixed(1); }
    return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (w || 3) + '" stroke-linecap="round"/>';
  };
  G.photon = function (x, y, col, ang, len) { len = len || 34; ang = ang || 0; var c = Math.cos(ang), s = Math.sin(ang); return G.wave(x - c * len / 2, y - s * len / 2, x + c * len / 2, y + s * len / 2, 3, 6, col, 3); };
  G.electron = function (x, y, r) { r = r || 9; return G.circ(x, y, r, '#F2C36B', { s: G.C.ambd, sw: 1.5 }) + '<rect x="' + (x - r * .5).toFixed(1) + '" y="' + (y - 1.2).toFixed(1) + '" width="' + r.toFixed(1) + '" height="2.4" fill="' + G.C.ambd + '"/>'; };
  G.tag = function (x, y, txt, col, o) { o = o || {}; var s = o.s || 16, w = o.w || (String(txt).length * s * .55 + 22); return G.g(G.rect(x - (o.a === 'start' ? 0 : w / 2), y - s * .95, w, s * 1.6, o.fill || '#fff', { rx: s * .8, s: col || G.C.ink, sw: 2 }) + G.f(x + (o.a === 'start' ? w / 2 : 0), y + s * .25, txt, { s: s, f: col || G.C.ink, a: 'middle', w: 600 }), o.op); };
  /* ось + шкала */
  G.axes = function (x0, y0, w, hh, xl, yl, p) {
    p = p == null ? 1 : p;
    return G.arrow(x0, y0, x0 + w, y0, p, G.C.ink, 2.2) + G.arrow(x0, y0, x0, y0 - hh, p, G.C.ink, 2.2) + G.f(x0 + w, y0 + 42, xl, { a: 'end', s: 17, f: G.C.ink2, op: p }) + G.f(x0 - 8, y0 - hh - 10, yl, { s: 17, f: G.C.ink2, op: p });
  };
  /* полоса энергии (горизонтальная) */
  G.bar = function (x, y, w, hh, col, p, label, val) {
    p = p == null ? 1 : G.clamp(p);
    return G.rect(x, y, w * p, hh, col, { rx: 5 }) + (label ? G.f(x, y - 8, label, { s: 16, f: G.C.ink2, op: p }) : '') + (val ? G.f(x + w * p + 8, y + hh * .72, val, { s: 18, w: 600, op: p }) : '');
  };

  /* поток случайных событий без хранения состояния: события с частотой rate за последние W секунд */
  G.events = function (t, rate, W, salt) {
    var out = [], m0 = Math.max(0, Math.floor((t - W) * rate)), m1 = Math.floor(t * rate);
    if (rate <= 0) return out;
    for (var m = m0; m <= m1 && out.length < 400; m++) { var tm = m / rate; if (tm > t || tm < t - W) continue; var r = QB.P.rng((m * 7919 + (salt || 1) * 104729) >>> 0); out.push({ age: t - tm, r: r, id: m }); }
    return out;
  };
  G.bgSoft = function (w, h) { return G.rect(0, 0, w || 600, h || 400, G.C.soft, { rx: 0 }); };

  // Axes use data coordinates; the marker shares the curve's scale.
  G.graph = function (x, y, w, hh, o) {
    var X = function (v) { return x + (v - o.x0) / (o.x1 - o.x0) * w; };
    var Y = function (v) { return y - (v - o.y0) / (o.y1 - o.y0) * hh; };
    var out = '';
    for (var j = 0; j <= 4; j++) {
      var vx = o.x0 + (o.x1 - o.x0) * j / 4, vy = o.y0 + (o.y1 - o.y0) * j / 4;
      out += G.line(X(vx), y, X(vx), y - hh, 1, G.C.line, 1);
      out += G.line(x, Y(vy), x + w, Y(vy), 1, G.C.line, 1);
      out += G.f(X(vx), y + 23, G.n(vx, o.xd == null ? 1 : o.xd), { s: 15, a: 'middle' });
      out += G.f(x - 10, Y(vy) + 5, G.n(vy, o.yd == null ? 1 : o.yd), { s: 15, a: 'end' });
    }
    out += G.line(x, y, x + w, y, 1, G.C.ink, 2) + G.line(x, y, x, y - hh, 1, G.C.ink, 2);
    out += G.f(x, y - hh - 20, o.yl, { s: 18, w: 600 }) + G.f(x + w, y + 48, o.xl, { s: 17, a: 'end' });
    (o.series || []).forEach(function (q) { out += G.path(G.poly(q.pts.map(function (p) { return [X(p[0]), Y(p[1])]; }), o.k == null ? 1 : o.k), q.col || G.C.teal, 3, { d: q.d }); });
    if (o.mark) out += G.line(X(o.mark[0]), y, X(o.mark[0]), Y(o.mark[1]), 1, G.C.ambd, 1.5, '4 4') + G.circ(X(o.mark[0]), Y(o.mark[1]), 7, G.C.amb, { s: G.C.ink });
    return out;
  };

  /* ---------- монтаж сцены ---------- */
  QB.mountSteps = function (host, id, mid) {
    var D = QB.steps[id];
    if (!D) { host.appendChild(h('p', { class: 'warn', text: 'Схема «' + id + '» не загрузилась. Текст ниже доступен.' })); return null; }
    var S = {}, i = 0, k = QB.reduced ? 1 : 0, playing = false, raf = 0, last = 0, time = QB.reduced ? 1.3 : 0, vis = true, sl = {}, lastL = '', lastR = '';
    (D.params || []).forEach(function (p) { S[p.k] = p.value; });
    var tabs = h('div', { class: 'ss-tabs', role: 'tablist', 'aria-label': 'Шаги разбора' });
    var vbw = function (vb) { var q = String(vb || '0 0 600 400').split(/\s+/).map(Number); return q[2] / q[3]; };
    var Lbox = D.left ? h('div', { class: 'ss-panel' }) : null, Rbox = h('div', { class: 'ss-panel' });
    var Lh = h('div', { class: 'ss-ph' }), Rh = h('div', { class: 'ss-ph' });
    var Lsvg = D.left ? QB.s('svg', { viewBox: D.lvb || '0 0 600 400', 'aria-hidden': 'true' }) : null, Rsvg = QB.s('svg', { viewBox: D.rvb || '0 0 600 400', role: 'img' });
    if (Lbox) { Lbox.appendChild(Lh); Lbox.appendChild(Lsvg); }
    Rsvg.style.setProperty('--mw', Math.round(vbw(D.rvb) * 400 * .93) + 'px'); if (Lsvg) Lsvg.style.setProperty('--mw', Math.round(vbw(D.lvb) * 400 * .93) + 'px');
    Rbox.appendChild(Rh); Rbox.appendChild(Rsvg);
    var txt = h('div', { class: 'ss-text', 'aria-live': 'polite' }), ro = h('div', { class: 'ss-ro' });
    var ctrls = h('div', { class: 'ss-ctrl' });
    (D.params || []).forEach(function (p) {
      var id2 = 'ss' + Math.random().toString(36).slice(2, 8), out = h('output', { for: id2 }), inp = h('input', { type: 'range', id: id2, min: p.min, max: p.max, step: p.step || 1, value: p.value });
      var show = function () { out.innerHTML = (p.fmt ? p.fmt(S[p.k]) : QB.num(S[p.k], p.dec || 0)) + (p.unit ? ' ' + p.unit : ''); };
      inp.addEventListener('input', function () { S[p.k] = +inp.value; show(); render(); });
      show(); sl[p.k] = { inp: inp, show: show };
      ctrls.appendChild(h('div', { class: 'sl' }, [h('label', { for: id2 }, [h('span', { html: p.label }), out]), inp]));
    });
    var play = h('button', { class: 'btn sm amb', type: 'button', onclick: function () { playing ? pause() : start(); } });
    var again = h('button', { class: 'btn sm', type: 'button', text: '↺ Сначала', onclick: function () { k = 0; start(); } });
    var prev = h('button', { class: 'btn sm', type: 'button', text: '← Шаг', onclick: function () { go(i - 1); } });
    var next = h('button', { class: 'btn sm pri', type: 'button', text: 'Шаг →', onclick: function () { go(i + 1); } });
    var tl = h('input', { type: 'range', min: 0, max: 1000, value: 0, 'aria-label': 'Время шага', class: 'ss-time', oninput: function () { pause(); k = tl.value / 1000; render(); } });
    var bar = h('div', { class: 'ss-bar' }, [prev, play, again, h('label', { class: 'ss-tl' }, [h('span', { text: 'Время' }), tl]), next]);
    D.steps.forEach(function (s, j) {
      tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': 'false', html: '<b>' + (j + 1) + '</b> ' + s.label, onclick: function () { go(j); },
        onkeydown: function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); tabs.children[i].focus(); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); tabs.children[i].focus(); } } }));
    });
    var wrap = h('div', { class: 'ss' + (D.left ? '' : ' one') }, [
      D.title ? h('div', { class: 'ss-head' }, [h('h3', { html: D.title })]) : null,
      tabs, h('p', { class: 'ss-pan', text: 'Схему можно листать вбок →' }), h('div', { class: 'ss-grid', style: D.left ? 'grid-template-columns:' + vbw(D.lvb).toFixed(3) + 'fr ' + vbw(D.rvb).toFixed(3) + 'fr' : null }, [Lbox, Rbox].filter(Boolean)), txt, bar, ctrls, ro,
      QB.reduced ? h('p', { class: 'note', text: 'Анимация отключена настройками устройства: схема показана сразу целиком, положение можно менять ползунком «Время».' }) : null]);
    host.appendChild(wrap);

    function on(j) { return j < i ? 1 : j === i ? k : 0; }
    function render() {
      var c = { i: i, k: k, on: on, time: time, S: S, step: D.steps[i] };
      var r = D.right(S, c); if (r !== lastR) { Rsvg.innerHTML = r; lastR = r; }
      if (D.left) { var l = D.left(S, c); if (l !== lastL) { Lsvg.innerHTML = l; lastL = l; } }
      tl.value = Math.round(k * 1000);
      if (D.readout) ro.innerHTML = D.readout(S, c);
    }
    function head() {
      var s = D.steps[i];
      Lh.textContent = 'Опыт' + (D.leftTitle ? ': ' + D.leftTitle : '');
      Rh.innerHTML = 'Разбор · шаг ' + (i + 1) + ' из ' + D.steps.length;
      txt.innerHTML = QB.fmt(s.text);
      Rsvg.setAttribute('aria-label', s.label + '. ' + String(s.alt || s.text).replace(/<[^>]+>|\$/g, ''));
      [].forEach.call(tabs.children, function (b, j) { b.setAttribute('aria-selected', String(j === i)); b.classList.toggle('done', j < i); b.tabIndex = j === i ? 0 : -1; });
      prev.disabled = i === 0; next.disabled = i === D.steps.length - 1;
      (D.params || []).forEach(function (p) { var el = sl[p.k].inp.closest('.sl'); el.hidden = !!(p.steps && p.steps.indexOf(i) < 0); });
    }
    function go(j) {
      if (j < 0 || j >= D.steps.length) return;
      i = j; k = QB.reduced ? 1 : 0; head();
      if (window.gsap && !QB.reduced) { gsap.fromTo(Rsvg, { opacity: .15, x: 14 }, { opacity: 1, x: 0, duration: .3, ease: 'power2.out', clearProps: 'transform' }); gsap.fromTo(txt, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .3, ease: 'power2.out', clearProps: 'transform' }); }
      if (D.steps[i].set) { var o = D.steps[i].set; for (var key in o) { S[key] = o[key]; if (sl[key]) { sl[key].inp.value = o[key]; sl[key].show(); } } }
      if (QB.reduced) { pause(); render(); } else start();
    }
    function label() { play.textContent = playing ? '❚❚ Пауза' : k >= 1 ? '▶ Ещё раз' : '▶ Запустить'; }
    function start() { if (QB.reduced) { k = 1; render(); return; } if (k >= 1) k = 0; playing = true; label(); kick(); }
    function pause() { playing = false; label(); }
    function kick() { if (!QB.reduced && !raf && vis && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }
    function tick(now) {
      raf = 0; var dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; time += dt;
      if (playing) { k += dt / (D.steps[i].dur || D.dur || 3); if (k >= 1) { k = 1; playing = false; label(); } }
      render();
      if (vis && !document.hidden && (playing || (D.left && D.live !== false && !QB.reduced) || D.loop)) raf = requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) kick(); }).observe(wrap);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });
    document.addEventListener('qb:step', function () { setTimeout(kick, 30); });
    label(); head(); go(0);
    return { go: go, set: function (o) { for (var key in o) { S[key] = o[key]; if (sl[key]) { sl[key].inp.value = o[key]; sl[key].show(); } } render(); }, get: function () { return { i: i, k: k, S: S }; } };
  };
})();
