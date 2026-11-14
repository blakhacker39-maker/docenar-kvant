/* DOCENAR • КВАНТ — модели частей III и IV: ядро, энергия связи, реакции, распад, дозы, цепная реакция, синтез, треки, выбор модели, итоговый кейс */
(function () {
  'use strict';
  var QB = window.QB, h = QB.h, s = QB.s, P = QB.P, L = QB.L, num = QB.num, nuc = function (A, Z, X) { return QB.nuc(A, Z, X); };
  var FONT = 'Golos Text,Segoe UI,sans-serif';
  function T(svg, x, y, t, a) { a = a || {}; a.x = x; a.y = y; a.fill = a.fill || '#C9D6D4'; a['font-size'] = a['font-size'] || 15; a['font-family'] = FONT; return s('text', a, svg, t); }
  function clear(g) { while (g.firstChild) g.removeChild(g.firstChild); }
  function api(S, sl, upd) { return { set: function (o) { for (var k in o) if (k in S) { S[k] = o[k]; if (sl[k]) sl[k].set(o[k]); } upd(); }, get: function () { return S; } }; }
  function cluster(g, cx, cy, Z, N, r) { // условное изображение ядра
    var A = Z + N, n = Math.min(A, 260), zs = 0, i, a, rr, isP;
    for (i = n - 1; i >= 0; i--) { a = i * 2.39996; rr = r * 1.05 * Math.sqrt(i); isP = Math.round((i + 1) * Z / A) > Math.round(i * Z / A); s('circle', { cx: (cx + Math.cos(a) * rr).toFixed(1), cy: (cy + Math.sin(a) * rr).toFixed(1), r: r, fill: isP ? '#F2A65A' : '#5CC1B8', stroke: '#14232B', 'stroke-width': .8 }, g); }
  }
  function light(host, ratio) { var left = h('div'), ctrl = h('div', { class: 'ctrl' }); host.appendChild(h('div', { class: 'lab' }, [left, ctrl])); return { left: left, ctrl: ctrl }; }

  /* ============ СОСТАВ ЯДРА ============ */
  QB.sims.nucleus = function (host) {
    var S = { Z: 6, N: 6 }, ui = L.layout(host), svg = ui.svg, sl = {}, g = s('g', {}, svg);
    var big = h('div', { style: 'position:absolute;right:4%;top:8%;font-size:2.6rem;color:#fff' }), nm = h('div', { style: 'position:absolute;right:4%;top:36%;text-align:right;font-size:.9rem;color:#C9D6D4;max-width:40%' });
    ui.scene.appendChild(big); ui.scene.appendChild(nm);
    T(svg, 30, 420, '● протон', { fill: '#F2A65A', 'font-size': 14 }); T(svg, 130, 420, '● нейтрон', { fill: '#5CC1B8', 'font-size': 14 }); ui.cap('');
    sl.Z = L.slider(ui.ctrl, { label: 'Число протонов <i>Z</i>', min: 1, max: 92, step: 1, value: 6, on: function (v) { S.Z = v; upd(); } });
    sl.N = L.slider(ui.ctrl, { label: 'Число нейтронов <i>N</i>', min: 0, max: 146, step: 1, value: 6, on: function (v) { S.N = v; upd(); } });
    var ro = L.ro(ui.ctrl, [['el', 'Элемент'], ['A', 'Массовое число <i>A</i> = <i>Z</i> + <i>N</i>'], ['q', 'Заряд ядра'], ['e', 'Электронов в нейтральном атоме']]);
    var row = h('div', { class: 'row' }); ui.ctrl.appendChild(h('div', { style: 'font-size:.86rem;font-weight:500', text: 'Изотопы для сравнения' })); ui.ctrl.appendChild(row);
    [[1, 0, 'протий'], [1, 1, 'дейтерий'], [1, 2, 'тритий'], [6, 6, 'C-12'], [6, 8, 'C-14'], [92, 143, 'U-235'], [92, 146, 'U-238']].forEach(function (p) { L.btn(row, p[2], function () { S.Z = p[0]; S.N = p[1]; sl.Z.set(p[0]); sl.N.set(p[1]); upd(); }, 'sm'); });
    function upd() {
      clear(g); cluster(g, 250, 215, S.Z, S.N, S.Z + S.N > 120 ? 6.2 : S.Z + S.N > 40 ? 8 : 12);
      big.innerHTML = nuc(S.Z + S.N, S.Z, P.EL[S.Z]); nm.innerHTML = P.ELN[S.Z] + '-' + (S.Z + S.N) + '<br>Элемент определяется числом протонов. Нейтроны меняют массу, но не химические свойства.';
      ro('el', P.ELN[S.Z] + ' (' + P.EL[S.Z] + ')'); ro('A', String(S.Z + S.N)); ro('q', '+' + S.Z + '<i>e</i>'); ro('e', String(S.Z));
      ui.say(P.ELN[S.Z] + '-' + (S.Z + S.N) + ': протонов ' + S.Z + ', нейтронов ' + S.N + '.');
    }
    upd(); return api(S, sl, upd);
  };

  /* ============ ДЕФЕКТ МАСС ============ */
  QB.sims.massdefect = function (host) {
    var list = P.NUC.filter(function (n) { return n.A > 1; }), S = { i: 3 }, ui = light(host), box = h('div', { class: 'card flat', style: 'margin:0' }), sel = h('select', { class: 'inp', 'aria-label': 'Нуклид' }, list.map(function (n, i) { return h('option', { value: i, text: P.ELN[n.Z] + '-' + n.A + ' (' + n.sym + ')' }); }));
    ui.left.appendChild(box); ui.ctrl.appendChild(h('label', {}, [h('div', { style: 'font-size:.86rem;font-weight:500;margin-bottom:.25em', text: 'Выберите нуклид' }), sel]));
    sel.onchange = function () { S.i = +sel.value; upd(); };
    var ro = L.ro(ui.ctrl, [['dm', 'Дефект масс Δ<i>m</i>'], ['E', 'Энергия связи'], ['EA', 'Удельная энергия связи'], ['pc', 'Доля «исчезнувшей» массы']]);
    ui.ctrl.appendChild(h('p', { class: 'note', html: 'Массы — атомные (AME2020). В расчёте берём массу атома водорода <i>m</i><sub>H</sub> вместо массы протона: тогда электроны слева и справа сокращаются. 1 а.е.м. ↔ 931,5 МэВ.' }));
    function upd() {
      var n = list[S.i], N = n.A - n.Z, b = P.binding(n.Z, n.A, n.M), parts = n.Z * P.C.mH + N * P.C.mn; sel.value = S.i;
      box.innerHTML = '';
      box.appendChild(h('div', { class: 'eq', raw: nuc(n.A, n.Z, n.sym) + '<span style="font-size:.9rem;color:#4A5A60">' + n.Z + ' протонов и ' + N + ' нейтронов</span>' }));
      box.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, [
        h('tr', {}, [h('td', { html: n.Z + ' · <i>m</i><sub>H</sub> = ' + n.Z + ' · 1,007825' }), h('td', { text: num(n.Z * P.C.mH, 6) + ' а.е.м.' })]),
        h('tr', {}, [h('td', { html: N + ' · <i>m</i><sub>n</sub> = ' + N + ' · 1,008665' }), h('td', { text: num(N * P.C.mn, 6) + ' а.е.м.' })]),
        h('tr', {}, [h('td', { html: '<b>Частицы по отдельности</b>' }), h('td', { html: '<b>' + num(parts, 6) + ' а.е.м.</b>' })]),
        h('tr', {}, [h('td', { html: '<b>Масса атома</b> (таблица)' }), h('td', { html: '<b>' + num(n.M, 6) + ' а.е.м.</b>' })]),
        h('tr', {}, [h('td', { html: 'Δ<i>m</i> = разность' }), h('td', { html: '<b style="color:#8A5A10">' + num(b.dm, 6) + ' а.е.м.</b>' })])
      ])));
      var w = 100 * n.M / parts, sv = '<svg viewBox="0 0 600 120" role="img" aria-label="Сравнение масс: частицы по отдельности тяжелее собранного ядра" style="width:100%;height:auto;margin-top:.6rem"><text x="0" y="14" font-family="' + FONT + '" font-size="13" fill="#4A5A60">частицы по отдельности</text><rect x="0" y="20" width="560" height="26" rx="4" fill="#7364A8"/><text x="0" y="72" font-family="' + FONT + '" font-size="13" fill="#4A5A60">собранный атом — легче на ' + num(100 - w, 2) + ' % (разница на рисунке увеличена в 10 раз)</text><rect x="0" y="78" width="' + (560 - 5600 * (100 - w) / 100).toFixed(0) + '" height="26" rx="4" fill="#087F78"/><rect x="' + (560 - 5600 * (100 - w) / 100).toFixed(0) + '" y="78" width="' + (5600 * (100 - w) / 100).toFixed(0) + '" height="26" fill="none" stroke="#D8922C" stroke-dasharray="4 3"/></svg>';
      box.appendChild(h('div', { raw: sv }));
      ro('dm', num(b.dm, 5) + ' а.е.м.'); ro('E', num(b.E, 1) + ' МэВ'); ro('EA', num(b.perA, 2) + ' МэВ/нуклон'); ro('pc', num(100 - w, 2) + ' %');
    }
    upd(); return { set: function (o) { if (o.sym) { var k = list.findIndex(function (n) { return n.sym === o.sym && n.A === o.A; }); if (k >= 0) S.i = k; } upd(); }, get: function () { return list[S.i]; } };
  };

  /* ============ УДЕЛЬНАЯ ЭНЕРГИЯ СВЯЗИ ============ */
  QB.sims.bindcurve = function (host) {
    var list = P.NUC.filter(function (n) { return n.A > 1; }), S = { i: 12 }, ui = light(host);
    var pl = L.plot(ui.left, { x0: 0, x1: 240, y0: 0, y1: 9.2, w: 660, h: 400, xt: [0, 40, 80, 120, 160, 200, 240], yt: [0, 2, 4, 6, 8], xl: 'массовое число A', yl: 'Eсв / A, МэВ на нуклон', alt: 'График удельной энергии связи от массового числа' });
    var curve = [], A; for (A = 16; A <= 240; A += 2) curve.push([A, P.semf(A)]);
    var sel = h('select', { class: 'inp', 'aria-label': 'Нуклид' }, list.map(function (n, i) { return h('option', { value: i, text: P.ELN[n.Z] + '-' + n.A }); }));
    ui.ctrl.appendChild(h('label', {}, [h('div', { style: 'font-size:.86rem;font-weight:500;margin-bottom:.25em', text: 'Отметить ядро на графике' }), sel])); sel.onchange = function () { S.i = +sel.value; upd(); };
    var ro = L.ro(ui.ctrl, [['EA', 'Удельная энергия связи'], ['E', 'Полная энергия связи'], ['gain', 'До максимума (Ni-62) не хватает'], ['way', 'Выгодный путь']]);
    ui.ctrl.appendChild(h('p', { class: 'note', html: 'Точки — расчёт по табличным массам. Плавная линия для <i>A</i> ≥ 16 — полуэмпирическая формула, она сглаживает индивидуальные особенности ядер.' }));
    function upd() {
      pl.clear(); sel.value = S.i; pl.path(curve, { stroke: '#9FB2B4', 'stroke-width': 2 });
      var best = P.binding(28, 62, P.nuclide('Ni', 62).M).perA;
      list.forEach(function (n, i) { var b = P.binding(n.Z, n.A, n.M); pl.dot(n.A, b.perA, { r: i === S.i ? 8 : 4, fill: i === S.i ? '#D8922C' : '#087F78' }); if (i === S.i || ['He4', 'Fe56', 'U235'].indexOf(n.sym + n.A) >= 0) pl.text(n.A + 5, b.perA - .25, n.sym + '-' + n.A, { 'font-weight': i === S.i ? 700 : 400 }); });
      pl.text(18, 1.2, 'синтез лёгких →', { fill: '#55478A', style: 'font-weight:600' }); pl.text(232, 6.6, '← деление тяжёлых', { fill: '#96402E', 'text-anchor': 'end', style: 'font-weight:600' });
      var n = list[S.i], b = P.binding(n.Z, n.A, n.M);
      ro('EA', num(b.perA, 2) + ' МэВ'); ro('E', num(b.E, 1) + ' МэВ'); ro('gain', num(Math.max(0, best - b.perA), 2) + ' МэВ на нуклон'); ro('way', n.A < 50 ? 'синтез (слияние)' : n.A > 70 ? 'деление' : 'вершина: энергию не извлечь');
    }
    upd(); return { set: function (o) { if (o.sym) { var k = list.findIndex(function (n) { return n.sym === o.sym && n.A === o.A; }); if (k >= 0) S.i = k; } upd(); }, get: function () { return list[S.i]; } };
  };

  /* ============ КОНСТРУКТОР ЯДЕРНЫХ РЕАКЦИЙ ============ */
  var RX = [
    { t: 'Первая искусственная ядерная реакция (Э. Резерфорд, 1919)', l: [[14, 7, 'N'], [4, 2, 'He']], r: [[17, 8, 'O'], null], x: [1, 1] },
    { t: 'Открытие нейтрона (Дж. Чедвик, 1932)', l: [[9, 4, 'Be'], [4, 2, 'He']], r: [[12, 6, 'C'], null], x: [1, 0] },
    { t: 'Искусственная радиоактивность (И. и Ф. Жолио-Кюри, 1934)', l: [[27, 13, 'Al'], [4, 2, 'He']], r: [[30, 15, 'P'], null], x: [1, 0] },
    { t: 'Расщепление лития ускоренными протонами (Кокрофт и Уолтон, 1932)', l: [[7, 3, 'Li'], [1, 1, 'H']], r: [[4, 2, 'He'], null], x: [4, 2] },
    { t: 'Реакция синтеза дейтерия и трития', l: [[2, 1, 'H'], [3, 1, 'H']], r: [[4, 2, 'He'], null], x: [1, 0] },
    { t: 'Один из каналов деления урана-235', l: [[235, 92, 'U'], [1, 0, 'n']], r: [[141, 56, 'Ba'], null, [1, 0, 'n'], [1, 0, 'n'], [1, 0, 'n']], x: [92, 36] }
  ];
  QB.sims.reaction = function (host, opts, ctx) {
    var S = { i: 0, A: 1, Z: 0 }, box = h('div', { class: 'card flat' }), fb = h('div', { 'aria-live': 'polite' }), sl = {}, ctrl = h('div', { class: 'ctrl', style: 'max-width:520px' });
    var sel = h('select', { class: 'inp', style: 'max-width:100%', 'aria-label': 'Реакция' }, RX.map(function (r, i) { return h('option', { value: i, text: (i + 1) + '. ' + r.t }); })); sel.onchange = function () { S.i = +sel.value; fb.innerHTML = ''; upd(); };
    host.appendChild(sel); host.appendChild(box); host.appendChild(ctrl);
    sl.A = L.slider(ctrl, { label: 'Массовое число неизвестной частицы <i>A</i>', min: 0, max: 100, step: 1, value: 1, on: function (v) { S.A = v; fb.innerHTML = ''; upd(); } });
    sl.Z = L.slider(ctrl, { label: 'Зарядовое число <i>Z</i>', min: -1, max: 40, step: 1, value: 0, on: function (v) { S.Z = v; fb.innerHTML = ''; upd(); } });
    L.btn(ctrl, 'Проверить законы сохранения', check, 'pri'); host.appendChild(fb);
    function name(A, Z) { return A === 1 && Z === 0 ? 'n' : A === 0 && Z === -1 ? 'e' : A === 1 && Z === 1 ? 'p' : Z >= 1 && Z < P.EL.length ? P.EL[Z] : '?'; }
    function side(arr) { return arr.map(function (p) { return p ? nuc(p[0], p[1], p[2]) : '<span style="background:#FBF0DC;border:2px dashed #D8922C;border-radius:8px;padding:.1em .35em">' + nuc(S.A, S.Z, 'X') + '</span>'; }).join(' + '); }
    function sums(arr) { var a = 0, z = 0; arr.forEach(function (p) { a += p ? p[0] : S.A; z += p ? p[1] : S.Z; }); return [a, z]; }
    function upd() {
      var r = RX[S.i], sL = sums(r.l), sR = sums(r.r); sel.value = S.i; box.innerHTML = '';
      box.appendChild(h('div', { class: 'eq', raw: side(r.l) + ' → ' + side(r.r) }));
      box.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, [h('tr', {}, [h('th', { text: '' }), h('th', { text: 'слева' }), h('th', { text: 'справа' })]),
        h('tr', {}, [h('td', { text: 'Сумма массовых чисел A' }), h('td', { text: sL[0] }), h('td', { text: sR[0] + (sL[0] === sR[0] ? ' ✓' : ' ✗') })]),
        h('tr', {}, [h('td', { text: 'Сумма зарядовых чисел Z' }), h('td', { text: sL[1] }), h('td', { text: sR[1] + (sL[1] === sR[1] ? ' ✓' : ' ✗') })])])));
    }
    function check() {
      var r = RX[S.i], ok = S.A === r.x[0] && S.Z === r.x[1]; fb.innerHTML = '';
      fb.appendChild(h('div', { class: 'fb ' + (ok ? 'ok' : 'no'), html: ok ? '<b class="tag">✓ Оба закона сохранения выполнены</b>Неизвестная частица: ' + nuc(S.A, S.Z, name(S.A, S.Z)) + (name(S.A, S.Z) === 'n' ? ' — нейтрон' : name(S.A, S.Z) === 'p' ? ' — протон (ядро водорода)' : ' — ' + P.ELN[S.Z]) + '.' : '<b class="tag">✗ Суммы слева и справа не совпадают</b>Сравните строки таблицы: сначала подберите <i>A</i>, затем <i>Z</i>.' }));
      if (ok) { ctx.st.rx = ctx.st.rx || {}; ctx.st.rx[S.i] = 1; ctx.save(); if (Object.keys(ctx.st.rx).length >= 4) ctx.badge('control'); }
    }
    upd(); return { set: function (o) { for (var k in o) if (k in S) { S[k] = o[k]; if (sl[k]) sl[k].set(o[k]); } fb.innerHTML = ''; upd(); if (o.check) check(); }, get: function () { return S; } };
  };

  /* ============ ЦЕПОЧКА РАСПАДОВ ============ */
  QB.sims.decaychain = function (host) {
    var START = [[92, 238], [90, 232], [88, 226], [6, 14], [27, 60], [53, 131]], S = { Z: 92, A: 238 }, path = [], ui = light(host);
    var pl = L.plot(ui.left, { x0: 120, x1: 148, y0: 78, y1: 94, w: 660, h: 400, xt: [120, 124, 128, 132, 136, 140, 144, 148], yt: [78, 80, 82, 84, 86, 88, 90, 92, 94], xl: 'число нейтронов N', yl: 'число протонов Z', alt: 'Диаграмма: число протонов и нейтронов в цепочке распадов' });
    var cur = h('div', { class: 'eq' }), chain = h('div', { style: 'font-size:.95rem;line-height:2.1' }), info = h('div', { 'aria-live': 'polite' });
    var sel = h('select', { class: 'inp', 'aria-label': 'Исходное ядро' }, START.map(function (n, i) { return h('option', { value: i, text: P.ELN[n[0]] + '-' + n[1] }); })); sel.onchange = function () { start(START[+sel.value]); };
    ui.ctrl.appendChild(h('label', {}, [h('div', { style: 'font-size:.86rem;font-weight:500;margin-bottom:.25em', text: 'Исходное ядро' }), sel])); ui.ctrl.appendChild(cur);
    var row = h('div', { class: 'row' }); ui.ctrl.appendChild(row);
    L.btn(row, 'α-распад', function () { step('alpha'); }, 'amb sm'); L.btn(row, 'β<sup>−</sup>-распад', function () { step('beta'); }, 'sm'); L.btn(row, 'γ-излучение', function () { step('gamma'); }, 'sm'); L.btn(row, 'Шаг назад', function () { if (path.length > 1) { path.pop(); var p = path[path.length - 1]; S.Z = p.Z; S.A = p.A; upd(); } }, 'sm ghost');
    L.btn(ui.ctrl, 'Показать реальный ряд урана-238', function () { start([92, 238]); sel.value = 0; 'abbaaaaabbabba'.split('').forEach(function (c) { step(c === 'a' ? 'alpha' : 'beta'); }); }, 'sm');
    ui.ctrl.appendChild(info); host.appendChild(h('div', { class: 'card flat', style: 'margin-top:1rem' }, [h('h4', { text: 'Цепочка превращений' }), chain]));
    function start(n) { S.Z = n[0]; S.A = n[1]; path = [{ Z: S.Z, A: S.A, k: null }]; info.innerHTML = ''; upd(); }
    function step(k) {
      var n = P.decayStep(S.Z, S.A, k); if (n.Z < 1 || n.A - n.Z < 0 || n.A < 1) { info.innerHTML = ''; info.appendChild(h('div', { class: 'fb no', text: 'Такого превращения быть не может: не хватает нуклонов.' })); return; }
      S.Z = n.Z; S.A = n.A; path.push({ Z: n.Z, A: n.A, k: k }); upd();
    }
    function upd() {
      var na = path.filter(function (p) { return p.k === 'alpha'; }).length, nb = path.filter(function (p) { return p.k === 'beta'; }).length;
      cur.innerHTML = 'Сейчас: ' + nuc(S.A, S.Z, P.EL[S.Z]) + ' <span style="font-size:.9rem;color:#4A5A60">' + P.ELN[S.Z] + '-' + S.A + '</span>';
      chain.innerHTML = path.map(function (p, i) { return (i ? ' <span style="color:' + (p.k === 'alpha' ? '#8A5A10' : p.k === 'beta' ? '#55478A' : '#4A5A60') + '">—' + (p.k === 'alpha' ? 'α' : p.k === 'beta' ? 'β' : 'γ') + '→</span> ' : '') + nuc(p.A, p.Z, P.EL[p.Z]); }).join('') + '<div style="margin-top:.5em;color:#4A5A60">α-распадов: ' + na + ' · β-распадов: ' + nb + ' · изменение A: ' + (path[0].A - S.A) + ' = 4 · ' + na + '; изменение Z: ' + (S.Z - path[0].Z) + ' = −2 · ' + na + ' + ' + nb + '</div>';
      pl.clear(); var on = path.every(function (p) { var N = p.A - p.Z; return N >= 120 && N <= 148 && p.Z >= 78 && p.Z <= 94; });
      if (on) { pl.path(path.map(function (p) { return [p.A - p.Z, p.Z]; }), { stroke: '#7364A8', 'stroke-width': 2 }); path.forEach(function (p, i) { pl.dot(p.A - p.Z, p.Z, { r: i === path.length - 1 ? 7 : 4, fill: i === 0 ? '#087F78' : i === path.length - 1 ? '#D8922C' : '#7364A8' }); }); pl.text(p0().A - p0().Z - .4, p0().Z + .6, P.EL[p0().Z] + '-' + p0().A, { 'text-anchor': 'end' }); pl.text(S.A - S.Z + .5, S.Z - .7, P.EL[S.Z] + '-' + S.A, {}); }
      else pl.text(134, 86, 'Это ядро вне поля диаграммы — смотрите цепочку ниже', { 'text-anchor': 'middle' });
      if (S.Z === 82 && S.A === 206) { info.innerHTML = ''; info.appendChild(h('div', { class: 'fb ok', html: 'Свинец-206 — стабильное ядро, конец ряда урана-238.' })); }
    }
    function p0() { return path[0]; }
    start(START[0]); return { set: function (o) { if (o.start) { start(o.start); sel.value = START.findIndex(function (n) { return n[0] === o.start[0] && n[1] === o.start[1]; }); } if (o.steps) o.steps.split('').forEach(function (c) { step(c === 'a' ? 'alpha' : c === 'b' ? 'beta' : 'gamma'); }); }, get: function () { return S; } };
  };

  /* ============ ЗАКОН РАДИОАКТИВНОГО РАСПАДА ============ */
  var ISO = [['Иод-131', 8.02, 'сут'], ['Радон-222', 3.82, 'сут'], ['Кобальт-60', 5.27, 'лет'], ['Стронций-90', 28.8, 'лет'], ['Цезий-137', 30.1, 'лет'], ['Углерод-14', 5730, 'лет']];
  QB.sims.decaylaw = function (host) {
    var S = { iso: 0, x: 1, N0: 1000 }, ui = light(host), sl = {};
    var pl = L.plot(ui.left, { x0: 0, x1: 6, y0: 0, y1: 100, w: 660, h: 400, xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 12.5, 25, 50, 100], xl: 'время в периодах полураспада, t / T½', yl: 'осталось ядер, %', alt: 'Кривая радиоактивного распада' });
    var curve = []; for (var x = 0; x <= 6.001; x += .05) curve.push([x, 100 * Math.pow(2, -x)]);
    var sel = h('select', { class: 'inp', 'aria-label': 'Изотоп' }, ISO.map(function (n, i) { return h('option', { value: i, text: n[0] + ' — T½ = ' + String(n[1]).replace('.', ',') + ' ' + n[2] }); })); sel.onchange = function () { S.iso = +sel.value; upd(); };
    ui.ctrl.appendChild(h('label', {}, [h('div', { style: 'font-size:.86rem;font-weight:500;margin-bottom:.25em', text: 'Изотоп' }), sel]));
    sl.x = L.slider(ui.ctrl, { label: 'Прошло времени', min: 0, max: 6, step: 0.05, value: 1, fmt: function (v) { return num(v * ISO[S.iso][1], v * ISO[S.iso][1] < 100 ? 1 : 0) + ' ' + ISO[S.iso][2]; }, on: function (v) { S.x = v; upd(); } });
    sl.N0 = L.slider(ui.ctrl, { label: 'Начальное число ядер <i>N</i><sub>0</sub>', min: 100, max: 10000, step: 100, value: 1000, on: function (v) { S.N0 = v; upd(); } });
    var ro = L.ro(ui.ctrl, [['n', 'Прошло периодов'], ['N', 'Осталось (ожидаемо)'], ['d', 'Распалось'], ['f', 'Доля оставшихся']]);
    function upd() {
      sel.value = S.iso; sl.x.set(S.x); pl.clear(); pl.path(curve); var f = Math.pow(2, -S.x);
      pl.path([[S.x, 0], [S.x, 100 * f], [0, 100 * f]], { stroke: '#D8922C', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }); pl.dot(S.x, 100 * f);
      [1, 2, 3].forEach(function (k) { pl.dot(k, 100 * Math.pow(2, -k), { r: 3, fill: '#087F78' }); });
      ro('n', num(S.x, 2)); ro('N', num(P.decayN(S.N0, S.x, 1), 0)); ro('d', num(S.N0 - P.decayN(S.N0, S.x, 1), 0)); ro('f', num(100 * f, 1) + ' %');
    }
    upd(); return api(S, sl, upd);
  };

  /* ============ СЛУЧАЙНОСТЬ РАСПАДА ============ */
  QB.sims.dice = function (host, opts, ctx) {
    var S = { N0: 100, fixed: true }, ui = light(host), cells = [], hist = [], stepN = 0, rnd, seed = 1, timer = null, track = -1, trackAt = null;
    var c = h('canvas', { width: 640, height: 640, 'aria-hidden': 'true', style: 'width:100%;max-width:340px;border-radius:12px;background:#14232B;display:block' }), g = c.getContext('2d'), plBox = h('div');
    ui.left.appendChild(h('div', { class: 'two', style: 'align-items:center' }, [c, plBox]));
    var pl = L.plot(plBox, { x0: 0, x1: 5, y0: 0, y1: 100, w: 420, h: 340, xt: [0, 1, 2, 3, 4, 5], yt: [0, 25, 50, 75, 100], xl: 't / T½', yl: 'осталось, %', alt: 'Опыт и ожидаемая кривая распада' });
    var segN = L.seg(ui.ctrl, 'Сколько ядер в образце', [[16, '16'], [100, '100'], [400, '400'], [2500, '2500']], 100, function (v) { S.N0 = v; reset(); });
    var segS = L.seg(ui.ctrl, 'Случайность', [[true, 'повторить тот же опыт'], [false, 'новый случайный опыт']], true, function (v) { S.fixed = v; reset(); });
    var row = h('div', { class: 'row' }); ui.ctrl.appendChild(row);
    L.btn(row, 'Шаг: ¼ периода', step, 'amb sm'); var auto = L.btn(row, '▶ Авто', function () { if (timer) stop(); else { auto.innerHTML = '❚❚ Пауза'; timer = setInterval(step, 450); } }, 'sm'); L.btn(row, 'Сначала', reset, 'sm ghost');
    var ro = L.ro(ui.ctrl, [['t', 'Прошло периодов'], ['N', 'Осталось в опыте'], ['E', 'Ожидалось по закону'], ['one', 'Отмеченное ядро']]);
    ui.ctrl.appendChild(h('p', { class: 'note', html: 'Каждое ядро на каждом шаге распадается с вероятностью 1 − 2<sup>−¼</sup> ≈ 15,9 % — независимо от того, сколько оно уже «прожило». Одно ядро обведено: следите за ним в разных опытах.' }));
    function stop() { clearInterval(timer); timer = null; auto.innerHTML = '▶ Авто'; }
    function reset() { stop(); if (!S.fixed) seed = (Date.now() % 100000) + 1; rnd = P.rng(S.fixed ? 12345 : seed); cells = new Array(S.N0).fill(true); hist = [S.N0]; stepN = 0; track = Math.floor(S.N0 / 2); trackAt = null; segN.set(S.N0); segS.set(S.fixed); draw(); }
    function step() {
      if (stepN >= 20) { stop(); return; } var p = P.decayProb(.25, 1); stepN++;
      for (var i = 0; i < cells.length; i++) if (cells[i] && rnd() < p) { cells[i] = false; if (i === track) trackAt = stepN / 4; }
      hist.push(cells.filter(Boolean).length); draw();
    }
    function draw() {
      var n = Math.ceil(Math.sqrt(S.N0)), cs = 640 / n; g.clearRect(0, 0, 640, 640);
      cells.forEach(function (al, i) { var x = (i % n + .5) * cs, y = (Math.floor(i / n) + .5) * cs; g.beginPath(); g.arc(x, y, cs * .36, 0, 6.3); g.fillStyle = al ? '#F2C36B' : '#2B424B'; g.fill(); if (i === track) { g.strokeStyle = '#fff'; g.lineWidth = Math.max(2, cs * .09); g.stroke(); } });
      pl.clear(); var e = []; for (var x = 0; x <= 5.001; x += .05) e.push([x, 100 * Math.pow(2, -x)]); pl.path(e, { stroke: '#9FB2B4', 'stroke-dasharray': '6 4' });
      pl.path(hist.map(function (v, i) { return [i / 4, 100 * v / S.N0]; }), { stroke: '#D8922C' }); hist.forEach(function (v, i) { pl.dot(i / 4, 100 * v / S.N0, { r: 3 }); });
      pl.text(4.9, 92, '- - ожидание для большого числа ядер', { 'text-anchor': 'end' }); pl.text(4.9, 82, '— этот опыт', { 'text-anchor': 'end', fill: '#8A5A10' });
      var now = hist[hist.length - 1], ex = P.decayN(S.N0, stepN / 4, 1);
      ro('t', num(stepN / 4, 2)); ro('N', now + ' из ' + S.N0); ro('E', num(ex, 1)); ro('one', trackAt ? 'распалось на t = ' + num(trackAt, 2) + ' T½' : 'ещё цело');
      if (stepN === 8) { ctx.st.runs = (ctx.st.runs || 0) + 1; ctx.save(); if (ctx.st.runs >= 3) ctx.badge('control'); }
    }
    reset(); return { set: function (o) { if (o.N0) S.N0 = o.N0; if ('fixed' in o) S.fixed = o.fixed; if (o.N0 || 'fixed' in o || o.reset) reset(); for (var i = 0; i < (o.steps || 0); i++) step(); }, get: function () { return { hist: hist, track: trackAt }; } };
  };

  /* ============ ВРЕМЯ, РАССТОЯНИЕ, ЭКРАН ============ */
  QB.sims.dose = function (host) {
    var S = { r: 1, t: 10, n: 0 }, ui = L.layout(host), svg = ui.svg, sl = {}, g = s('g', {}, svg);
    T(svg, 70, 330, 'источник', { 'text-anchor': 'middle', 'font-size': 13 }); ui.cap('Точечный источник гамма-излучения в воздухе. Единицы условные.');
    sl.r = L.slider(ui.ctrl, { label: 'Расстояние до источника', min: 0.5, max: 8, step: 0.5, dec: 1, value: 1, unit: 'м', on: function (v) { S.r = v; upd(); } });
    sl.t = L.slider(ui.ctrl, { label: 'Время рядом с источником', min: 1, max: 60, step: 1, value: 10, unit: 'мин', on: function (v) { S.t = v; upd(); } });
    sl.n = L.slider(ui.ctrl, { label: 'Экран: число слоёв половинного ослабления', min: 0, max: 5, step: 1, value: 0, on: function (v) { S.n = v; upd(); } });
    var ro = L.ro(ui.ctrl, [['rate', 'Мощность дозы (отн. ед.)'], ['dose', 'Накопленная доза (отн. ед.)'], ['k', 'Во сколько раз меньше исходной']]);
    ui.ctrl.appendChild(h('p', { class: 'note', html: 'За 1 принята мощность дозы на расстоянии 1 м без экрана. Исходная ситуация для сравнения: 1 м, 10 минут, без экрана — 10 отн. ед.' }));
    function upd() {
      clear(g); var rate = P.invSquare(S.r, 1) * Math.pow(2, -S.n), x = 70 + S.r * 85, i;
      for (i = 0; i < 16; i++) { var a = i / 16 * 6.283; s('line', { x1: 70 + 22 * Math.cos(a), y1: 225 + 22 * Math.sin(a), x2: 70 + 700 * Math.cos(a), y2: 225 + 700 * Math.sin(a), stroke: '#B7AEE0', 'stroke-opacity': .35 }, g); }
      [1, 2, 4, 8].forEach(function (r) { s('circle', { cx: 70, cy: 225, r: r * 85, fill: 'none', stroke: '#5C7C86', 'stroke-dasharray': '3 6' }, g); T(g, 70 + r * 85, 440, r + ' м', { 'text-anchor': 'middle', 'font-size': 12 }); });
      s('circle', { cx: 70, cy: 225, r: 16, fill: '#F2C36B', stroke: '#14232B' }, g); T(g, 70, 231, '☢', { 'text-anchor': 'middle', fill: '#14232B', 'font-size': 18 });
      for (i = 0; i < S.n; i++) s('rect', { x: x - 34 - i * 11, y: 150, width: 8, height: 150, fill: '#9FB2B4' }, g);
      s('circle', { cx: x, cy: 195, r: 14, fill: '#5CC1B8' }, g); s('rect', { x: x - 13, y: 212, width: 26, height: 60, rx: 9, fill: '#5CC1B8' }, g);
      s('rect', { x: x - 26, y: 120, width: 52, height: 12, fill: '#14232B', stroke: '#C9D6D4' }, g); s('rect', { x: x - 26, y: 120, width: 52 * Math.min(1, rate / 4), height: 12, fill: rate > 1 ? '#F0A994' : '#F2C36B' }, g); T(g, x, 112, 'дозиметр', { 'text-anchor': 'middle', 'font-size': 12 });
      ro('rate', num(rate, 3)); ro('dose', num(rate * S.t, 2)); ro('k', rate * S.t >= 10 ? 'не меньше' : num(10 / (rate * S.t), 1)); ui.say('Мощность дозы ' + num(rate, 3) + ', доза ' + num(rate * S.t, 2) + ' относительных единиц.');
    }
    upd(); return api(S, sl, upd);
  };

  /* ============ ЦЕПНАЯ РЕАКЦИЯ ============ */
  QB.sims.chainreact = function (host) {
    var S = { k: 1, g: 10 }, ui = light(host), sl = {};
    var pl = L.plot(ui.left, { x0: 0, x1: 20, y0: 0, y1: 400, w: 660, h: 400, xt: [0, 5, 10, 15, 20], yt: [0, 100, 200, 300, 400], xl: 'номер поколения нейтронов', yl: 'число делений в поколении', alt: 'Число делений по поколениям' });
    sl.k = L.slider(ui.ctrl, { label: 'Коэффициент размножения нейтронов <i>k</i>', min: 0.7, max: 1.3, step: 0.01, dec: 2, value: 1, on: function (v) { S.k = v; upd(); } });
    sl.g = L.slider(ui.ctrl, { label: 'Показать поколение №', min: 0, max: 20, step: 1, value: 10, on: function (v) { S.g = v; upd(); } });
    var ro = L.ro(ui.ctrl, [['mode', 'Режим'], ['n', 'Делений в выбранном поколении'], ['x', 'Изменение за 20 поколений']]);
    ui.ctrl.appendChild(h('p', { class: 'note', html: 'В первом поколении 100 делений. <i>k</i> — среднее число нейтронов от одного деления, которые вызовут новое деление. Остальные нейтроны поглощаются без деления или вылетают наружу. В реакторе <i>k</i> удерживают равным 1 регулирующими стержнями.' }));
    function upd() {
      pl.clear(); var pts = [], i; for (i = 0; i <= 20; i++) pts.push([i, Math.min(400, P.chain(100, S.k, i))]);
      pl.path([[0, 100], [20, 100]], { stroke: '#9FB2B4', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }); pl.path(pts, { stroke: S.k > 1.004 ? '#B6533E' : S.k < .996 ? '#7364A8' : '#087F78' });
      pts.forEach(function (p) { pl.dot(p[0], p[1], { r: 3 }); }); var v = P.chain(100, S.k, S.g); pl.dot(S.g, Math.min(400, v), { r: 7 });
      ro('mode', S.k > 1.004 ? 'надкритический: реакция нарастает' : S.k < .996 ? 'подкритический: реакция затухает' : 'критический: реакция самоподдерживается', S.k > 1.004); ro('n', num(v, 0)); ro('x', '× ' + num(Math.pow(S.k, 20), 2));
    }
    upd(); return api(S, sl, upd);
  };

  /* ============ ЭНЕРГИЯ РЕАКЦИЙ: ДЕЛЕНИЕ И СИНТЕЗ ============ */
  var mN = function (sym, A) { return sym === 'n' ? P.C.mn : P.nuclide(sym, A).M; };
  var QRX = [
    { t: 'Синтез: дейтерий + тритий', l: [['H', 2, 1], ['H', 3, 1]], r: [['He', 4, 2], ['n', 1, 0]], kind: 'синтез' },
    { t: 'Синтез: дейтерий + дейтерий', l: [['H', 2, 1], ['H', 2, 1]], r: [['He', 3, 2], ['n', 1, 0]], kind: 'синтез' },
    { t: 'Синтез в звёздах (итог протон-протонного цикла)', l: [['H', 1, 1], ['H', 1, 1], ['H', 1, 1], ['H', 1, 1]], r: [['He', 4, 2]], kind: 'синтез', note: 'Показан суммарный итог; позитроны и нейтрино в записи опущены, энергия посчитана по атомным массам.' },
    { t: 'Деление: уран-235 + нейтрон', l: [['U', 235, 92], ['n', 1, 0]], r: [['Ba', 141, 56], ['Kr', 92, 36], ['n', 1, 0], ['n', 1, 0], ['n', 1, 0]], kind: 'деление' }
  ];
  QB.sims.fusion = function (host) {
    var S = { i: 0 }, ui = light(host), box = h('div', { class: 'card flat', style: 'margin:0' }); ui.left.appendChild(box);
    var sel = h('select', { class: 'inp', style: 'max-width:100%', 'aria-label': 'Реакция' }, QRX.map(function (r, i) { return h('option', { value: i, text: r.t }); })); sel.onchange = function () { S.i = +sel.value; upd(); };
    ui.ctrl.appendChild(h('label', {}, [h('div', { style: 'font-size:.86rem;font-weight:500;margin-bottom:.25em', text: 'Реакция' }), sel]));
    var ro = L.ro(ui.ctrl, [['dm', 'Убыль массы'], ['Q', 'Энергия одной реакции'], ['QA', 'На один нуклон топлива'], ['kg', 'На 1 кг топлива'], ['coal', 'Сколько это тонн угля']]);
    ui.ctrl.appendChild(h('p', { class: 'note', html: 'Теплота сгорания каменного угля принята 2,9·10<sup>7</sup> Дж/кг. Расчёт — по закону взаимосвязи массы и энергии; о том, как устроены установки, модель ничего не говорит.' }));
    function upd() {
      var r = QRX[S.i], f = function (p) { return p[0] === 'n' ? nuc(1, 0, 'n') : nuc(p[1], p[2], p[0]); }, mL = 0, mR = 0, Af = 0; sel.value = S.i;
      r.l.forEach(function (p) { mL += mN(p[0], p[1]); Af += p[1]; }); r.r.forEach(function (p) { mR += mN(p[0], p[1]); });
      var Q = (mL - mR) * P.C.u_MeV, perKg = Q * 1.602176634e-13 * 6.02214076e23 / (mL * 1e-3);
      box.innerHTML = ''; box.appendChild(h('div', { class: 'eq', raw: r.l.map(f).join(' + ') + ' → ' + r.r.map(f).join(' + ') }));
      box.appendChild(h('div', { class: 'tw' }, h('table', { class: 't' }, [h('tr', {}, [h('td', { text: 'Масса до реакции' }), h('td', { text: num(mL, 6) + ' а.е.м.' })]), h('tr', {}, [h('td', { text: 'Масса после реакции' }), h('td', { text: num(mR, 6) + ' а.е.м.' })]), h('tr', {}, [h('td', { html: '<b>Убыль массы Δ<i>m</i></b>' }), h('td', { html: '<b>' + num(mL - mR, 6) + ' а.е.м.</b>' })]), h('tr', {}, [h('td', { html: '<b><i>Q</i> = Δ<i>m</i> · 931,5 МэВ</b>' }), h('td', { html: '<b style="color:#8A5A10">' + num(Q, 1) + ' МэВ</b>' })])])));
      var w = Q / Af / 7 * 560; box.appendChild(h('div', { raw: '<svg viewBox="0 0 600 70" role="img" aria-label="Энергия на один нуклон" style="width:100%;height:auto;margin-top:.6rem"><text x="0" y="14" font-family="' + FONT + '" font-size="13" fill="#4A5A60">энергия на один нуклон топлива, МэВ (шкала до 7)</text><rect x="0" y="22" width="560" height="26" rx="4" fill="#E6EAE4"/><rect x="0" y="22" width="' + w.toFixed(0) + '" height="26" rx="4" fill="' + (r.kind === 'синтез' ? '#7364A8' : '#B6533E') + '"/><text x="' + (w + 8).toFixed(0) + '" y="40" font-family="' + FONT + '" font-size="14" fill="#1E2E35">' + num(Q / Af, 2) + '</text></svg>' }));
      if (r.note) box.appendChild(h('p', { class: 'note', text: r.note }));
      ro('dm', num(mL - mR, 5) + ' а.е.м.'); ro('Q', num(Q, 1) + ' МэВ'); ro('QA', num(Q / Af, 2) + ' МэВ'); ro('kg', QB.sci(perKg, 1) + ' Дж'); ro('coal', num(perKg / 2.9e7 / 1000, 0) + ' т');
    }
    upd(); return { set: function (o) { if ('i' in o) S.i = o.i; upd(); }, get: function () { return S; } };
  };

  /* ============ ТРЕКИ В МАГНИТНОМ ПОЛЕ ============ */
  var PART = { 'e-': ['электрон', -1, 1.2, '#F2C36B'], 'e+': ['позитрон', 1, 1.2, '#5CC1B8'], p: ['протон', 1, 3, '#F0A994'], a: ['α-частица', 2, 5, '#B7AEE0'], n: ['нейтрон', 0, 1, '#9FB2B4'], g: ['γ-квант', 0, 1, '#9FB2B4'] };
  QB.sims.tracks = function (host) {
    var S = { part: 'e-', p: 30, B: 1 }, ui = L.layout(host), svg = ui.svg, sl = {}, g = s('g', {}, svg), SC = 800; // 800 px = 1 м
    for (var x = 60; x < 800; x += 60) for (var y = 40; y < 450; y += 60) { s('path', { d: 'M' + (x - 4) + ' ' + (y - 4) + 'l8 8m0 -8l-8 8', stroke: '#3A5560', 'stroke-width': 1.5 }, svg); }
    T(svg, 790, 22, '× — поле направлено от нас', { 'text-anchor': 'end', 'font-size': 12 }); s('path', { d: 'M40 420h200', stroke: '#C9D6D4', 'stroke-width': 2 }, svg); T(svg, 140, 440, '25 см', { 'text-anchor': 'middle', 'font-size': 12 }); ui.cap('');
    var seg = L.seg(ui.ctrl, 'Частица', [['e-', 'e<sup>−</sup>'], ['e+', 'e<sup>+</sup>'], ['p', 'p'], ['a', 'α'], ['n', 'n'], ['g', 'γ']], 'e-', function (v) { S.part = v; upd(); });
    sl.p = L.slider(ui.ctrl, { label: 'Импульс частицы', min: 5, max: 300, step: 5, value: 30, unit: 'МэВ/<i>c</i>', on: function (v) { S.p = v; upd(); } });
    sl.B = L.slider(ui.ctrl, { label: 'Индукция магнитного поля <i>B</i>', min: 0.1, max: 2, step: 0.1, dec: 1, value: 1, unit: 'Тл', on: function (v) { S.B = v; upd(); } });
    var ro = L.ro(ui.ctrl, [['q', 'Заряд'], ['r', 'Радиус трека'], ['dir', 'Куда отклоняется'], ['tr', 'След в камере']]);
    function upd() {
      clear(g); seg.set(S.part); var pt = PART[S.part], q = pt[1];
      s('path', { d: 'M0 225h60', stroke: pt[3], 'stroke-width': pt[2] }, g);
      if (!q) { s('path', { d: 'M60 225H800', stroke: pt[3], 'stroke-width': 1.5, 'stroke-dasharray': '3 9' }, g); ro('q', '0'); ro('r', '—'); ro('dir', 'не отклоняется'); ro('tr', 'следа не оставляет (пунктир условный)', true); ui.say(pt[0] + ' не отклоняется и не оставляет следа.'); return; }
      var r = P.trackRadius(S.p, q, S.B), R = r * SC, up = q > 0, cy = 225 + (up ? -R : R), d = 'M60 225', a;
      for (a = 0; a <= Math.min(Math.PI * 1.9, 1400 / R); a += .02) { var px = 60 + R * Math.sin(a), py = cy + (up ? 1 : -1) * R * Math.cos(a); d += 'L' + px.toFixed(1) + ' ' + py.toFixed(1); if (px > 820 || py < -20 || py > 470) break; }
      s('path', { d: d, fill: 'none', stroke: pt[3], 'stroke-width': pt[2], 'stroke-linecap': 'round' }, g);
      ro('q', (q > 0 ? '+' : '−') + Math.abs(q) + '<i>e</i>'); ro('r', r >= 1 ? num(r, 2) + ' м' : num(r * 100, 1) + ' см'); ro('dir', up ? 'вверх по рисунку' : 'вниз по рисунку'); ro('tr', S.part === 'a' ? 'короткий, жирный' : S.part === 'p' ? 'плотный' : 'тонкий');
      ui.say(pt[0] + ': радиус трека ' + num(r * 100, 1) + ' сантиметра, отклоняется ' + (up ? 'вверх' : 'вниз') + '.');
    }
    upd(); return api(S, sl, upd);
  };

  /* ============ КАКАЯ МОДЕЛЬ ПОМОЖЕТ? ============ */
  var MODELS = ['Волновая модель света', 'Фотонная (квантовая) модель света', 'Модель атома Бора', 'Протонно-нейтронная модель ядра', 'Статистический закон распада'];
  var CASES = [
    ['Радужные разводы на мыльной плёнке', 0, 'Это интерференция — сложение волн. Фотонная модель здесь не нужна: энергия отдельных порций роли не играет.'],
    ['Свет выбивает электроны только начиная с определённой частоты', 1, 'Порог по частоте объясняется только порциями $E = hν$: волна «накопила» бы энергию при любой частоте.'],
    ['Разреженный водород светится отдельными линиями, а не сплошной радугой', 2, 'Линии — это переходы между дискретными уровнями: $hν = E_k − E_n$. Для водорода модель Бора даёт верные длины волн.'],
    ['Атомы хлора бывают с массой 35 и 37, но химически неразличимы', 3, 'Изотопы: одинаковое число протонов, разное — нейтронов.'],
    ['Через 8 суток активность препарата иода-131 упала вдвое', 4, 'Закон распада описывает большой ансамбль ядер: за период полураспада распадается половина.'],
    ['Солнечный парус разгоняет космический аппарат без топлива', 1, 'Фотоны несут импульс $p = h/λ$ и передают его парусу. (Волновая теория тоже предсказывает давление света, но расчёт через импульс фотонов проще.)'],
    ['Невозможно предсказать, когда распадётся данное ядро радона', 4, 'Распад отдельного ядра случаен; закон даёт только вероятность.'],
    ['Свет огибает край препятствия и даёт полосы на экране', 0, 'Дифракция — волновое явление.'],
    ['Масса ядра гелия меньше суммы масс двух протонов и двух нейтронов', 3, 'Дефект масс и энергия связи — понятия модели ядра из нуклонов.'],
    ['Газ поглощает из белого света ровно те длины волн, которые сам излучает', 2, 'Атом поглощает фотон только с энергией, равной разности уровней, — отсюда совпадение линий испускания и поглощения.']
  ];
  QB.sims.models = function (host, opts, ctx) {
    var st = ctx.st.models = ctx.st.models || {}, box = h('div'), sum = h('div', { class: 'card', 'aria-live': 'polite' });
    host.appendChild(box); host.appendChild(sum);
    CASES.forEach(function (c, i) {
      var fb = h('div'), sel = h('select', { class: 'inp', 'aria-label': 'Модель для: ' + c[0] }, [h('option', { value: '', text: '— какая модель объясняет? —' })].concat(MODELS.map(function (m, j) { return h('option', { value: j, text: m }); })));
      if (st[i] != null) sel.value = st[i];
      function ev() { fb.innerHTML = ''; if (sel.value === '') return; st[i] = +sel.value; ctx.save(); var ok = +sel.value === c[1]; fb.appendChild(h('div', { class: 'fb ' + (ok ? 'ok' : 'no'), html: (ok ? '✓ ' : '✗ Подумайте ещё: какое свойство явления здесь главное? ') + (ok ? c[2] : '') })); total(); }
      sel.onchange = ev; box.appendChild(h('div', { class: 'q', style: 'padding:.7rem .9rem;margin-bottom:.6rem' }, [h('div', { class: 'mrow' }, [h('b', { text: (i + 1) + '. ' + c[0] }), sel]), fb])); if (st[i] != null) ev();
    });
    function total() { var n = 0; CASES.forEach(function (c, i) { if (st[i] === c[1]) n++; }); sum.innerHTML = '<b>Верно подобрано моделей: ' + n + ' из ' + CASES.length + '.</b> ' + (n === CASES.length ? 'Обратите внимание: ни одна модель не объяснила всё. У каждой — своя область.' : ''); if (n === CASES.length) ctx.badge('control'); }
    total(); return { set: function () { }, get: function () { return st; } };
  };

  /* ============ ИТОГОВОЕ ИССЛЕДОВАНИЕ ============ */
  QB.sims.caseStudy = function (host, opts, ctx) {
    var st = ctx.st.cs = ctx.st.cs || {}, box = h('div'); host.appendChild(box);
    function stage(n, title, body, ask, checkFn, okText, noText) {
      var fb = h('div', { 'aria-live': 'polite' }), inp = ask(), card = h('div', { class: 'card' }, [h('h4', { text: 'Улика ' + n }), h('h3', { text: title })].concat(body).concat([h('div', { class: 'row' }, [inp, h('button', { class: 'btn pri', text: 'Проверить', onclick: go })]), fb]));
      function go() { var v = inp.value; fb.innerHTML = ''; if (String(v).trim() === '') { fb.appendChild(h('div', { class: 'fb info', text: 'Сначала дайте ответ.' })); return; } var ok = checkFn(v); st[n] = ok; ctx.save(); fb.appendChild(h('div', { class: 'fb ' + (ok ? 'ok' : 'no'), html: ok ? '✓ ' + okText : '✗ ' + noText })); done(); }
      box.appendChild(card);
    }
    var bars = function (lines, label) { var o = '<text x="0" y="14" font-family="' + FONT + '" font-size="13" fill="#4A5A60">' + label + '</text><rect x="0" y="20" width="600" height="34" fill="#0B161B" rx="4"/>'; lines.forEach(function (l) { o += '<rect x="' + ((l - 380) / 400 * 600 - 1.5).toFixed(1) + '" y="20" width="3" height="34" fill="' + P.rgb(l) + '"/>'; }); return '<svg viewBox="0 0 600 60" role="img" aria-label="' + label + ': линии ' + lines.join(', ') + ' нм" style="width:100%;height:auto;margin-bottom:.4rem">' + o + '</svg>'; };
    stage(1, 'Что светится в трубке?', [h('p', { html: 'В запаснике кабинета физики нашли газоразрядную трубку без подписи. Спектроскоп показал три яркие линии: 656 нм, 486 нм и 434 нм. Сравните со спектрами из справочника.' }),
      h('div', { raw: bars([656, 486, 434], 'Неизвестная трубка') + bars([656.3, 486.1, 434.0, 410.2], 'Образец А') + bars([667.8, 587.6, 501.6, 471.3, 447.1], 'Образец Б') + bars([589.0, 589.6], 'Образец В') })],
      function () { return h('select', { class: 'inp', 'aria-label': 'Какой образец совпадает' }, [h('option', { value: '', text: '— совпадает с образцом —' }), h('option', { value: 'A', text: 'А' }), h('option', { value: 'B', text: 'Б' }), h('option', { value: 'V', text: 'В' })]); },
      function (v) { return v === 'A'; }, 'Образец А — водород (серия Бальмера). Линия 410 нм у трубки тоже есть, но она слабая и на границе видимости. Спектр — «отпечаток пальца» атома.', 'Сравнивайте положение <i>всех</i> линий, а не одной.');
    stage(2, 'Сработает ли датчик?', [h('p', { html: 'Рядом лежал вакуумный фотоэлемент с паспортом: работа выхода катода 2,14 эВ. Найдите максимальную кинетическую энергию электронов, которые выбьет из него синяя линия водорода 486 нм. Используйте $hc = 1240$ эВ·нм. Если фотоэффекта нет, введите 0.' })],
      function () { return h('input', { class: 'inp', inputmode: 'decimal', 'aria-label': 'Максимальная энергия, эВ', placeholder: 'эВ' }); },
      function (v) { return P.checkNum(v, 1240 / 486 - 2.14, .05).ok; }, '$E_ф = 1240/486 ≈ 2,55$ эВ; $E_{max} ≈ 2,55 − 2,14 = 0,41$ эВ. А красная линия 656 нм (1,89 эВ) этот катод не возьмёт.', 'Сначала энергия фотона $hc/λ$, затем вычтите работу выхода.');
    stage(3, 'Сколько лет прибору?', [h('p', { html: 'На шкале прибора — светящаяся краска с тритием (период полураспада 12,3 года). Измерение показало: активность краски составляет 12,5 % от паспортной. Сколько лет назад изготовлен прибор?' })],
      function () { return h('input', { class: 'inp', inputmode: 'decimal', 'aria-label': 'Возраст, лет', placeholder: 'лет' }); },
      function (v) { return P.checkNum(v, 36.9, .03).ok; }, '12,5 % = 1/8 = (1/2)³ — прошло три периода полураспада: 3 · 12,3 ≈ 37 лет.', 'Какой степенью одной второй является 12,5 %?');
    var fin = h('div', { class: 'card amber' }); box.appendChild(fin);
    function done() { var n = [1, 2, 3].filter(function (k) { return st[k]; }).length; fin.innerHTML = '<h4>Заключение эксперта</h4><p>Улик разобрано: <b>' + n + ' из 3</b>. ' + (n === 3 ? 'Теперь оформите заключение на шаге «Перенос»: какая модель понадобилась для каждой улики и чего каждая из них объяснить не может.' : 'Разберите все три улики — каждая требует своей модели.') + '</p>'; if (n === 3) ctx.badge('control'); }
    done(); return { set: function () { }, get: function () { return st; } };
  };
})();
