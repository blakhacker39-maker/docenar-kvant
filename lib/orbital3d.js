/* DOCENAR • КВАНТ — 3D-облако электрона атома водорода (three.js, загружается по требованию) */
(function () {
  'use strict';
  var QB = window.QB, h = QB.h, P = QB.P;
  /* ψ(r, θ) в атомных единицах (боровский радиус = 1); угловые части без нормировки — нужна лишь форма |ψ|² и знак */
  var ORB = {
    '1s': { R: 7, f: function (r) { return Math.exp(-r); }, ang: function () { return 1; }, n: 1, l: 0, note: 'Шар: электрон вероятнее всего у ядра, облако без «дыр».' },
    '2s': { R: 16, f: function (r) { return (2 - r) * Math.exp(-r / 2); }, ang: function () { return 1; }, n: 2, l: 0, note: 'Два слоя: внутри сфера одного знака, снаружи — другого. Между ними — сфера, где электрона нет (узел).' },
    '2p': { R: 16, f: function (r) { return r * Math.exp(-r / 2); }, ang: function (c) { return c; }, n: 2, l: 1, note: 'Гантель вдоль оси: две доли разного знака, в плоскости между ними электрона нет.' },
    '3d': { R: 26, f: function (r) { return r * r * Math.exp(-r / 3); }, ang: function (c) { return 3 * c * c - 1; }, n: 3, l: 2, note: 'Гантель с «бубликом»: две доли и кольцо противоположного знака.' }
  };
  function sample(key, N) {
    var o = ORB[key], rr = P.rng(key.charCodeAt(0) * 31 + key.charCodeAt(1)), pts = [], sgn = [], max = 0, i, t;
    for (i = 0; i < 4000; i++) { var x = (rr() * 2 - 1) * o.R, y = (rr() * 2 - 1) * o.R, z = (rr() * 2 - 1) * o.R, r = Math.hypot(x, y, z) || 1e-6, v = o.f(r) * o.ang(z / r); max = Math.max(max, v * v); }
    for (t = 0; pts.length < N * 3 && t < N * 400; t++) {
      var x2 = (rr() * 2 - 1) * o.R, y2 = (rr() * 2 - 1) * o.R, z2 = (rr() * 2 - 1) * o.R, r2 = Math.hypot(x2, y2, z2) || 1e-6, psi = o.f(r2) * o.ang(z2 / r2);
      if (rr() * max * 1.05 < psi * psi) { pts.push(x2 / o.R, z2 / o.R, y2 / o.R); sgn.push(psi >= 0 ? 1 : -1); }
    }
    var rs = []; for (i = 0; i < pts.length; i += 3) rs.push(Math.hypot(pts[i], pts[i + 1], pts[i + 2]));
    rs.sort(function (a, b) { return a - b; }); var r97 = rs[Math.floor(rs.length * .97)] || 1, k = 1.05 / r97;
    for (i = 0; i < pts.length; i++) pts[i] *= k;
    return { pts: pts, sgn: sgn };
  }
  function loadThree(base, cb) {
    if (window.THREE) return cb();
    var s = document.createElement('script'); s.src = base + 'lib/three.min.js'; s.onload = function () { cb(); }; s.onerror = function () { cb(new Error('three.js не загрузился')); }; document.head.appendChild(s);
  }
  QB.mountOrbital3D = function (host) {
    var card = h('section', { class: 'card orb3d', 'aria-label': 'Трёхмерное электронное облако' });
    var stage = h('div', { class: 'orb-stage', role: 'img', 'aria-label': 'Облако вероятности электрона атома водорода. Вращайте мышью или пальцем.' });
    var note = h('p', { class: 'note', 'aria-live': 'polite' }), cur = '1s', api = null;
    var seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Состояние электрона' }, Object.keys(ORB).map(function (k) { return h('button', { type: 'button', 'aria-pressed': String(k === cur), text: k, onclick: function () { cur = k; [].forEach.call(seg.children, function (b) { b.setAttribute('aria-pressed', String(b.textContent === k)); }); show(); } }); }));
    var start = h('button', { class: 'btn pri', type: 'button', text: 'Запустить 3D-модель', onclick: run });
    card.appendChild(h('h3', { text: '3D: облако электрона вместо орбиты' }));
    card.appendChild(h('p', { html: 'Каждая точка — место, где электрон мог бы обнаружиться при измерении. Где точек гуще, там вероятность больше. Цвет — знак волновой функции: <b style="color:#087F78">бирюзовый</b> «+», <b style="color:#B66A00">янтарный</b> «−». Вращайте модель мышью или пальцем.' }));
    card.appendChild(h('div', { class: 'row', style: 'margin-bottom:.7rem' }, [seg, start]));
    card.appendChild(stage); card.appendChild(note);
    card.appendChild(h('p', { class: 'note', html: 'Форма облаков рассчитана по решению уравнения Шрёдингера для водорода (масштаб условный, размер облака приведён к окну). Модель Бора дала те же энергии уровней, но такой картины не даёт: орбит у электрона нет.' }));
    host.appendChild(card);
    function show() { var o = ORB[cur]; note.textContent = cur + ' (n = ' + o.n + ', l = ' + o.l + ', энергия ' + QB.num(P.bohrE(o.n)) + ' эВ). ' + o.note; if (api) api.set(cur); }
    show();
    function run() {
      start.disabled = true; start.textContent = 'Загружаю…';
      loadThree(QB.base, function (err) {
        if (err || !window.THREE) { start.textContent = 'Не удалось загрузить 3D'; return; }
        try { api = build(stage); start.remove(); api.set(cur); }
        catch (e) { console.error('3D:', e); stage.appendChild(h('p', { class: 'warn', text: 'Браузер не поддерживает WebGL — 3D-модель недоступна. Плоская схема выше показывает то же облако в разрезе.' })); start.textContent = 'Недоступно'; }
      });
    }
  };
  function build(stage) {
    var T = window.THREE, W = stage.clientWidth || 600, H = Math.round(Math.min(460, W * .75));
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(W, H);
    stage.appendChild(renderer.domElement);
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(40, W / H, .1, 50); cam.position.set(0, .4, 3.4); cam.lookAt(0, 0, 0);
    var group = new T.Group(); scene.add(group);
    var nucleus = new T.Mesh(new T.SphereGeometry(.035, 16, 12), new T.MeshBasicMaterial({ color: 0xB6533E })); group.add(nucleus);
    var axisMat = new T.LineBasicMaterial({ color: 0x9FB2B4 }), ag = new T.BufferGeometry(); ag.setAttribute('position', new T.Float32BufferAttribute([0, -1.15, 0, 0, 1.15, 0], 3)); group.add(new T.Line(ag, axisMat));
    var cloud = null, rotX = .35, rotY = 0, drag = null, raf = 0, vis = true, auto = !QB.reduced;
    function set(key) {
      if (cloud) { group.remove(cloud); cloud.geometry.dispose(); cloud.material.dispose(); }
      var d = sample(key, 9000), col = [], i, cp = new T.Color(0x087F78), cn = new T.Color(0xD8922C);
      for (i = 0; i < d.sgn.length; i++) { var c = d.sgn[i] > 0 ? cp : cn; col.push(c.r, c.g, c.b); }
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(d.pts, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
      cloud = new T.Points(g, new T.PointsMaterial({ size: .016, vertexColors: true, transparent: true, opacity: .75, depthWrite: false })); group.add(cloud); draw();
    }
    function draw() { group.rotation.x = rotX; group.rotation.y = rotY; renderer.render(scene, cam); }
    function loop() { raf = 0; if (auto && !drag) rotY += .004; draw(); if (vis && !document.hidden && auto) raf = requestAnimationFrame(loop); }
    function kick() { if (!raf && vis && !document.hidden && auto) raf = requestAnimationFrame(loop); }
    var el = renderer.domElement; el.style.touchAction = 'none'; el.style.cursor = 'grab'; el.tabIndex = 0;
    el.addEventListener('pointerdown', function (e) { drag = [e.clientX, e.clientY]; el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; });
    el.addEventListener('pointermove', function (e) { if (!drag) return; rotY += (e.clientX - drag[0]) * .01; rotX = Math.max(-1.4, Math.min(1.4, rotX + (e.clientY - drag[1]) * .01)); drag = [e.clientX, e.clientY]; draw(); });
    el.addEventListener('pointerup', function () { drag = null; el.style.cursor = 'grab'; });
    el.addEventListener('keydown', function (e) { var d = { ArrowLeft: [0, -.15], ArrowRight: [0, .15], ArrowUp: [-.15, 0], ArrowDown: [.15, 0] }[e.key]; if (d) { e.preventDefault(); rotX += d[0]; rotY += d[1]; draw(); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; kick(); }).observe(el);
    document.addEventListener('visibilitychange', kick);
    window.addEventListener('resize', function () { var w = stage.clientWidth || W, hh = Math.round(Math.min(460, w * .75)); renderer.setSize(w, hh); cam.aspect = w / hh; cam.updateProjectionMatrix(); draw(); });
    kick();
    return { set: set };
  }
})();
