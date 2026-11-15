/* DOCENAR • КВАНТ — страница модуля: шаги занятия, задания, обратная связь */
(function () {
  'use strict';
  var QB = window.QB, h = QB.h, P = QB.P;

  function figure(id, cap) {
    var f = QB.figs[id]; if (!f) return null;
    var fig = h('figure', { class: 'fig' });
    fig.innerHTML = f.svg();
    var svg = fig.querySelector('svg');
    if (svg) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', f.alt); }
    fig.appendChild(h('figcaption', { html: cap || f.cap }));
    return fig;
  }
  QB.figure = figure;
  function list(items, cls, tag) { return h(tag || 'ul', { class: cls }, items.map(function (t) { return h('li', { html: t }); })); }
  function shuffle(arr, seedStr) {
    var s = 0, i; for (i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) | 0;
    var r = P.rng(s), a = arr.slice();
    for (i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ================= задания ================= */
  function renderQ(q, idx, mid, onChange) {
    var st = QB.store.mod(mid).quiz, rec = st[q.id] = st[q.id] || { first: null, tries: 0, ok: null };
    var fb = h('div', { 'aria-live': 'polite' }), body = h('div'), get, mark = function () { };
    var name = mid + '-' + q.id;
    function invalidate() { fb.innerHTML = ''; mark(null); if (rec.ok !== null) { rec.ok = null; QB.store.save(); onChange(); } }

    if (q.type === 'single' || q.type === 'multi') {
      var inputs = [];
      body = h('div', {}, q.o.map(function (o, i) {
        var inp = h('input', { type: q.type === 'single' ? 'radio' : 'checkbox', name: name, value: i, onchange: invalidate });
        inputs.push(inp); return h('label', { class: 'opt' }, [inp, h('span', { html: o })]);
      }));
      get = function () { var v = inputs.filter(function (x) { return x.checked; }).map(function (x) { return +x.value; }); return v.length ? v : null; };
      mark = function (ok) { inputs.forEach(function (x) { x.parentNode.classList.remove('good', 'bad'); if (ok !== null && x.checked) x.parentNode.classList.add(ok ? 'good' : 'bad'); }); };
      q._check = function (v) {
        var a = [].concat(q.a).sort().join(), ok = v.slice().sort().join() === a, msg = '';
        if (!ok && q.type === 'single' && q.err && q.err[v[0]]) msg = q.err[v[0]];
        if (!ok && q.type === 'multi') { var miss = [].concat(q.a).filter(function (x) { return v.indexOf(x) < 0; }).length, extra = v.filter(function (x) { return [].concat(q.a).indexOf(x) < 0; }).length; msg = (extra ? 'Среди выбранных есть лишние утверждения. ' : '') + (miss ? 'Отмечены не все верные утверждения.' : ''); }
        return { ok: ok, msg: msg };
      };
      q._key = [].concat(q.a).map(function (i) { return q.o[i]; }).join('; ');
    } else if (q.type === 'num' || q.type === 'short') {
      var inp = h('input', { class: 'inp', type: 'text', inputmode: q.type === 'num' ? 'decimal' : 'text', 'aria-label': 'Ответ', autocomplete: 'off', oninput: invalidate, onkeydown: function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } } });
      body = h('div', { class: 'row' }, [inp, q.unit ? h('span', { html: q.unit }) : null, q.type === 'num' ? h('small', { style: 'color:#4A5A60', text: 'можно с запятой или точкой' }) : null]);
      get = function () { return inp.value.trim() ? inp.value : null; };
      q._check = q.type === 'num' ? function (v) {
        var r = P.checkNum(v, q.a, q.tol), msg = '';
        if (r.bad) msg = 'Введите число, например 0,8 или 3.1e-19. Единицу измерения писать не нужно — она указана рядом с полем.';
        else if (r.power10) msg = 'Цифры верные, но порядок величины другой. Проверьте перевод единиц (приставки нано-, мега-, электронвольты ↔ джоули).';
        else if (r.sign) msg = 'Модуль верный, проверьте знак.';
        return { ok: r.ok, msg: msg };
      } : function (v) { var n = P.norm(v); return { ok: q.a.some(function (a) { return P.norm(a) === n; }), msg: '' }; };
      q._key = q.type === 'num' ? QB.num(q.a, q.dec == null ? 2 : q.dec) + (q.unit ? ' ' + q.unit : '') : q.a[0];
    } else if (q.type === 'match') {
      var opts = shuffle(q.right.map(function (r, i) { return i; }), q.id), sels = [];
      body = h('div', {}, q.left.map(function (l, i) {
        var s = h('select', { class: 'inp', 'aria-label': 'Соответствие для: ' + l.replace(/[$\\{}]/g, ''), onchange: invalidate }, [h('option', { value: '', text: '— выберите —' })].concat(opts.map(function (j) { return h('option', { value: j, text: q.right[j].replace(/[$]/g, '') }); })));
        sels.push(s); return h('div', { class: 'mrow' }, [h('span', { html: l }), s]);
      }));
      get = function () { var v = sels.map(function (s) { return s.value === '' ? null : +s.value; }); return v.indexOf(null) >= 0 ? null : v; };
      q._check = function (v) { var bad = 0; v.forEach(function (x, i) { if (x !== q.a[i]) bad++; }); return { ok: !bad, msg: bad ? 'Неверных пар: ' + bad + ' из ' + v.length + '.' : '' }; };
      q._key = q.left.map(function (l, i) { return l + ' → ' + q.right[q.a[i]]; }).join('; ');
    } else if (q.type === 'order') {
      var cur = shuffle(q.items.map(function (_, i) { return i; }), q.id);
      if (cur.every(function (x, i) { return x === i; })) cur.reverse();
      var ol = h('ol', { class: 'ord' });
      var draw = function (focus) {
        ol.innerHTML = '';
        cur.forEach(function (it, pos) {
          var up = h('button', { class: 'btn sm ghost', type: 'button', 'aria-label': 'Поднять выше', text: '↑', disabled: pos === 0, onclick: function () { mv(pos, -1); } });
          var dn = h('button', { class: 'btn sm ghost', type: 'button', 'aria-label': 'Опустить ниже', text: '↓', disabled: pos === cur.length - 1, onclick: function () { mv(pos, 1); } });
          ol.appendChild(h('li', {}, [h('b', { text: (pos + 1) + '.' }), h('span', { html: q.items[it] }), up, dn]));
        });
        if (focus) { var b = ol.children[focus[0]].querySelectorAll('button')[focus[1]]; if (b && !b.disabled) b.focus(); }
      };
      var mv = function (p, d) { var t = cur[p]; cur[p] = cur[p + d]; cur[p + d] = t; invalidate(); draw([p + d, d < 0 ? 0 : 1]); };
      draw(); body = ol;
      get = function () { return cur.slice(); };
      q._check = function (v) { var ok = v.every(function (x, i) { return x === i; }); var first = v.findIndex(function (x, i) { return x !== i; }); return { ok: ok, msg: ok ? '' : 'Первое расхождение — на месте № ' + (first + 1) + '.' }; };
      q._key = q.items.join(' → ');
    }

    function check() {
      var v = get();
      if (v == null) { fb.innerHTML = ''; fb.appendChild(h('div', { class: 'fb info', text: 'Ответ пока пустой — он не засчитывается как попытка. Выберите или введите ответ.' })); return; }
      var r = q._check(v);
      if (rec.first === null) { rec.first = r.ok; rec.firstAt = Date.now(); }
      rec.tries++; rec.ok = r.ok; QB.store.save(); mark(r.ok);
      fb.innerHTML = '';
      var box = h('div', { class: 'fb ' + (r.ok ? 'ok' : 'no') }, [
        h('b', { class: 'tag', text: r.ok ? '✓ Верно' : '✗ Пока неверно' }),
        r.ok ? h('div', { html: q.why }) : h('div', { html: (r.msg ? r.msg + ' ' : '') + (q.hint ? 'Подсказка: ' + q.hint : '') })
      ]);
      if (!r.ok && rec.tries >= 2) box.appendChild(h('details', { class: 'rev', style: 'margin-top:.5em' }, [h('summary', { text: 'Показать разбор' }), h('div', { html: 'Верный ответ: ' + q._key + '. ' + q.why })]));
      if (!r.ok && q.back) box.appendChild(h('div', { style: 'margin-top:.4em' }, h('a', { href: '#' + q.back, text: q.back === 'lab' ? 'Вернуться к исследованию →' : q.back === 'example' ? 'Вернуться к разобранному примеру →' : 'Вернуться к теории →' })));
      fb.appendChild(box); onChange();
    }
    var el = h('div', { class: 'q', id: 'q-' + q.id }, [
      h('fieldset', {}, [h('legend', {}, [h('span', { class: 'qn', text: 'Задание ' + (idx + 1) + ' · ' + ({ single: 'один ответ', multi: 'несколько ответов', num: 'числовой ответ', short: 'краткий ответ', match: 'соответствие', order: 'последовательность' })[q.type] }), h('span', { html: q.q })]),
        q.fig ? figure(q.fig) : null, body]),
      h('div', { class: 'row', style: 'margin-top:.7em' }, [h('button', { class: 'btn pri', type: 'button', text: 'Проверить', onclick: check })]),
      fb,
      h('div', { class: 'fb teach-only', style: 'margin-top:.6em', html: '<b>Ключ:</b> ' + q._key + '. ' + q.why })
    ]);
    return el;
  }
  QB.renderQ = renderQ;

  /* ================= шаги ================= */
  var B = {};
  B.hook = function (m, st) {
    var k = m.hook, wrap = h('div');
    wrap.appendChild(h('div', { class: 'two' }, [
      h('div', {}, [
        h('div', { class: 'kicker', text: 'Занятие ' + m.n + ' из ' + QB.TOC.list.length + ' · ' + m.program.split(' · ')[0] }),
        h('h2', { class: 'like-h1', text: m.title }), h('p', { class: 'hero-q', html: m.question }),
        h('details', { class: 'rev story-more' }, [h('summary', { text: 'Как это открыли' }), h('div', {}, k.text.map(function (t) { return h('p', { html: t }); }))])
      ]),
      figure(k.fig, k.cap)
    ]));
    if (k.predict) {
      var pr = k.predict, saved = st.predict || {}, opts = [];
      var box = h('div', { class: 'card amber' }, [h('h4', { text: 'Сначала прогноз' }), h('p', { html: '<b>' + pr.q + '</b>' })]);
      var info = h('div', { 'aria-live': 'polite' });
      pr.o.forEach(function (o, i) { var inp = h('input', { type: 'radio', name: 'pred', value: i, checked: saved.first === i, disabled: saved.first != null }); opts.push(inp); box.appendChild(h('label', { class: 'opt' }, [inp, h('span', { html: o })])); });
      var why = h('textarea', { class: 'inp', placeholder: 'Почему вы так думаете? Одной-двумя фразами (необязательно).', 'aria-label': 'Обоснование прогноза', disabled: saved.first != null }); why.value = saved.why || '';
      var btn = h('button', { class: 'btn amb', text: 'Зафиксировать прогноз', disabled: saved.first != null, onclick: function () {
        var c = opts.filter(function (x) { return x.checked; })[0];
        if (!c) { info.innerHTML = ''; info.appendChild(h('div', { class: 'fb info', text: 'Выберите вариант — любой. Ошибиться здесь не страшно: важен ваш исходный взгляд.' })); return; }
        st.predict = { first: +c.value, why: why.value, at: Date.now() }; QB.store.save(); QB.badge(m.id, 'predict'); done();
      } });
      var done = function () { opts.forEach(function (x) { x.disabled = true; }); why.disabled = true; btn.disabled = true; info.innerHTML = ''; info.appendChild(h('div', { class: 'fb info', html: 'Прогноз сохранён и больше не меняется. Верен ли он, покажет исследование — к прогнозу мы вернёмся на шаге <a href="#lab">«Исследование»</a>.' })); };
      box.appendChild(why); box.appendChild(h('div', { class: 'row', style: 'margin-top:.6em' }, btn)); box.appendChild(info);
      if (saved.first != null) done();
      wrap.appendChild(box);
    }
    wrap.appendChild(h('div', { class: 'two rev' }, [
      h('div', { class: 'card flat' }, [h('h4', { text: 'Цель и задачи' }), h('p', { html: m.goal }), list(m.tasks)]),
      h('div', { class: 'card flat teal' }, [h('h4', { text: 'После занятия я' }), list(m.results, 'res'),
        h('p', { class: 'note', html: '<b>Нужно помнить:</b> ' + m.prior.join('; ') + '. Время: ' + (m.time || '1 учебное занятие') + '.' })])
    ]));
    return wrap;
  };
  function block(b, m) {
    var d = h('section', { class: b.card ? 'card ' + b.card : '', style: 'margin-bottom:1.4rem' });
    if (b.h) d.appendChild(h('h2', { html: b.h }));
    var text = h('div');
    // части блока выводятся в том порядке, в каком записаны в содержании модуля
    Object.keys(b).forEach(function (k) {
      if (k === 'p' || k === 'p2') b[k].forEach(function (t) { text.appendChild(h('p', { html: t })); });
      else if (k === 'list') text.appendChild(list(b.list));
      else if (k === 'formula') [].concat(b.formula[0] instanceof Array ? b.formula : [b.formula]).forEach(function (f) { text.appendChild(h('div', { class: 'formula', role: 'math' }, [h('span', { html: '$' + f[0] + '$' }), f[1] ? h('small', { html: f[1] }) : null])); });
      else if (k === 'warn') text.appendChild(h('p', { class: 'warn', html: '<b>Частая ошибка.</b> ' + b.warn }));
      else if (k === 'note') text.appendChild(h('p', { class: 'note', html: b.note }));
      else if (k === 'more') text.appendChild(h('details', { class: 'rev' }, [h('summary', { text: b.more[0] }), h('div', { html: b.more[1] })]));
    });
    if (b.fig) d.appendChild(h('div', { class: 'two' + (b.rev ? ' rev' : '') }, b.rev ? [figure(b.fig, b.cap), text] : [text, figure(b.fig, b.cap)]));
    else d.appendChild(text);
    if (b.sim) { var host = h('div'); d.appendChild(host); QB.mountSim(host, b.sim, b.opts, m.id); }
    return d;
  }
  B.theory = function (m) {
    var w = h('div');
    if (m.scene && QB.steps[m.scene]) {
      var host = h('div'); w.appendChild(host); QB.mountSteps(host, m.scene, m.id);
      if (m.extra3d === 'orbital' && QB.mountOrbital3D) { var h3 = h('div'); w.appendChild(h3); QB.mountOrbital3D(h3); }
      var fs = [];
      m.theory.forEach(function (b) { if (b.formula) [].concat(b.formula[0] instanceof Array ? b.formula : [b.formula]).forEach(function (f) { fs.push(f); }); });
      if (fs.length) w.appendChild(h('div', { class: 'card teal key' }, [h('h4', { text: 'Главные формулы' }), h('div', { class: 'kf' }, fs.map(function (f) { return h('div', { class: 'formula', role: 'math' }, [h('span', { html: '$' + f[0] + '$' }), f[1] ? h('small', { html: f[1] }) : null]); }))]));
      var warns = m.theory.filter(function (b) { return b.warn; });
      if (warns.length) w.appendChild(h('div', { class: 'card amber' }, [h('h4', { text: 'Не перепутайте' })].concat(warns.map(function (b) { return h('p', { style: 'margin:.3em 0', html: b.warn }); }))));
      var more = h('details', { class: 'rev more-text' }, [h('summary', { text: 'Читать теорию подробнее (текст для повторения и печати)' })]);
      var inner = h('div'); m.theory.forEach(function (b) { inner.appendChild(block(b, m)); }); more.appendChild(inner); w.appendChild(more);
      return w;
    }
    m.theory.forEach(function (b) { w.appendChild(block(b, m)); }); return w;
  };
  B.example = function (m) {
    var w = h('div');
    [].concat(m.example).forEach(function (e) {
      var c = h('div', { class: 'card' }, [h('h2', { html: e.title }), h('p', { html: e.task }), e.given ? h('p', { class: 'note', html: '<b>Дано:</b> ' + e.given }) : null,
        h('p', { style: 'font-size:.86rem;color:#4A5A60', text: 'Раскрывайте шаги по одному: сначала попробуйте сделать шаг сами.' })]);
      e.steps.forEach(function (s, i) { c.appendChild(h('details', { class: 'rev' }, [h('summary', { html: 'Шаг ' + (i + 1) + '. ' + s[0] }), h('div', { html: s[1] })])); });
      c.appendChild(h('details', { class: 'rev' }, [h('summary', { text: 'Ответ и проверка смысла' }), h('div', { html: e.answer })]));
      w.appendChild(c);
    });
    return w;
  };
  QB.mountSim = function (host, name, opts, mid) {
    var fn = QB.sims[name];
    if (!fn) { host.appendChild(h('p', { class: 'warn', text: 'Модель «' + name + '» не загрузилась. Текст и задания доступны без неё.' })); return null; }
    try { return fn(host, opts || {}, { mid: mid, st: QB.store.mod(mid).lab, save: QB.store.save, badge: function (k) { QB.badge(mid, k); } }); }
    catch (e) { console.error(e); host.appendChild(h('p', { class: 'warn', text: 'Модель не удалось запустить (' + e.message + '). Текст и задания доступны без неё.' })); return null; }
  };
  B.lab = function (m, st) {
    var L = m.lab, w = h('div'), host = h('div'), api;
    w.appendChild(h('h2', { html: L.title || 'Исследование' }));
    w.appendChild(h('p', { html: L.intro }));
    var player = h('div', { class: 'player', hidden: true }), tasks = h('div');
    if (L.explain && L.explain.length) {
      var seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Способ изучения' });
      var bR = h('button', { 'aria-pressed': 'true', text: 'Читаю и исследую', onclick: function () { mode(0); } }), bW = h('button', { 'aria-pressed': 'false', text: 'Смотрю объяснение', onclick: function () { mode(1); } });
      seg.appendChild(bR); seg.appendChild(bW); w.appendChild(h('div', { style: 'margin:0 0 1rem' }, seg));
      var i = 0, timer = null, txt = h('p', { 'aria-live': 'polite' }), dots = h('span', { class: 'dots', 'aria-hidden': 'true' }, L.explain.map(function () { return h('i'); }));
      var play = h('button', { class: 'btn sm', text: '▶ Авто', 'aria-label': 'Автоматический показ', onclick: function () { timer ? stop() : start(); } });
      var show = function (k) { i = Math.max(0, Math.min(L.explain.length - 1, k)); var s = L.explain[i]; txt.innerHTML = '<b>' + (i + 1) + '/' + L.explain.length + '.</b> ' + QB.fmt(s[1]); if (api && api.set) { QB._demo = true; try { api.set(s[0]); } finally { QB._demo = false; } } [].forEach.call(dots.children, function (d, j) { d.className = j <= i ? 'on' : ''; }); };
      var stop = function () { clearInterval(timer); timer = null; play.textContent = '▶ Авто'; };
      var start = function () { play.textContent = '❚❚ Пауза'; timer = setInterval(function () { if (i >= L.explain.length - 1) stop(); else show(i + 1); }, 7000); };
      player.appendChild(h('button', { class: 'btn sm', text: '← Назад', onclick: function () { stop(); show(i - 1); } }));
      player.appendChild(play); player.appendChild(h('button', { class: 'btn sm pri', text: 'Дальше →', onclick: function () { stop(); show(i + 1); } }));
      player.appendChild(dots); player.appendChild(txt);
      var mode = function (v) { bR.setAttribute('aria-pressed', String(!v)); bW.setAttribute('aria-pressed', String(!!v)); player.hidden = !v; tasks.hidden = !!v; if (v) show(0); else stop(); };
      document.addEventListener('visibilitychange', function () { if (document.hidden && timer) stop(); });
    }
    w.appendChild(player); w.appendChild(host);
    api = QB.mountSim(host, L.sim, L.opts, m.id);
    tasks.appendChild(h('div', { class: 'card amber', style: 'margin-top:1.1rem' }, [h('h4', { text: 'Задания исследования' }), list(L.tasks, 'tasks', 'ol')]));
    w.appendChild(tasks);
    w.appendChild(h('details', { class: 'card flat violet model-limits' }, [h('summary', { text: 'Что модель упрощает' }), list(L.limits)]));
    var pr = m.hook.predict;
    if (pr) {
      var back = h('div', { class: 'card amber' }); w.appendChild(back);
      var draw = function () {
        back.innerHTML = ''; back.appendChild(h('h4', { text: 'Вернёмся к прогнозу' }));
        var s = st.predict;
        if (!s || s.first == null) { back.appendChild(h('p', { html: 'Вы ещё не сделали прогноз. <a href="#hook">Сделайте его на первом шаге</a> — так будет видно, что изменилось в вашем понимании.' })); return; }
        back.appendChild(h('p', { html: '<b>' + pr.q + '</b><br>Ваш первый прогноз: «' + pr.o[s.first] + '»' + (s.why ? ' — «' + QB.esc(s.why) + '»' : '') + '.' }));
        var inputs = [];
        pr.o.forEach(function (o, i) { var x = h('input', { type: 'radio', name: 'pred2', value: i, checked: s.final === i }); inputs.push(x); back.appendChild(h('label', { class: 'opt' }, [x, h('span', { html: o })])); });
        var out = h('div', { 'aria-live': 'polite' });
        back.appendChild(h('div', { class: 'row', style: 'margin-top:.6em' }, h('button', { class: 'btn amb', text: 'Ответ после исследования', onclick: function () {
          var c = inputs.filter(function (x) { return x.checked; })[0]; if (!c) return;
          s.final = +c.value; QB.store.save(); var ok = s.final === pr.a; out.innerHTML = '';
          out.appendChild(h('div', { class: 'fb ' + (ok ? 'ok' : 'no'), html: (ok ? '<b class="tag">✓ Это согласуется с опытом.</b>' : '<b class="tag">✗ Опыт показывает другое.</b>') + pr.why + (s.first !== pr.a && ok ? '<br><i>Ваш первый прогноз был другим — и это самая полезная часть занятия: вы изменили представление на основании данных.</i>' : '') }));
          if (ok && s.first !== pr.a) QB.badge(m.id, 'fix');
        } })));
        back.appendChild(out);
      };
      draw(); w._refresh = draw;
    }
    return w;
  };
  B.quiz = function (m, st, markDone) {
    var w = h('div'), sum = h('div', { class: 'card', 'aria-live': 'polite' });
    w.appendChild(h('h2', { text: 'Проверка' }));
    w.appendChild(h('p', { html: 'В модуле ' + m.quiz.length + ' заданий. Засчитывается <b>первая попытка</b>; повторные попытки — тренировка, они не меняют первый результат. Пустой ответ попыткой не считается.' }));
    function upd() {
      var q = QB.store.mod(m.id).quiz, first = 0, now = 0, tried = 0;
      m.quiz.forEach(function (x) { var r = q[x.id] || {}; if (r.first != null) tried++; if (r.first) first++; if (r.ok) now++; });
      var n = m.quiz.length, pct = first / n, C = 2 * Math.PI * 34;
      sum.innerHTML = '';
      sum.appendChild(h('div', { class: 'score' }, [
        h('div', { raw: '<svg class="ring" viewBox="0 0 84 84" role="img" aria-label="С первой попытки верно ' + first + ' из ' + n + '"><circle cx="42" cy="42" r="34" fill="none" stroke="#D8DED8" stroke-width="8"/><circle cx="42" cy="42" r="34" fill="none" stroke="#087F78" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (C * pct) + ' ' + C + '" transform="rotate(-90 42 42)"/><text x="42" y="48" text-anchor="middle" font-size="20" font-weight="700" fill="#1E2E35">' + first + '/' + n + '</text></svg>' }),
        h('div', {}, [h('b', { text: 'С первой попытки: ' + first + ' из ' + n }), h('div', { style: 'font-size:.86rem;color:#4A5A60', text: 'Отвечено: ' + tried + ' из ' + n + ' · верно сейчас (с учётом тренировочных повторов): ' + now })])
      ]));
      if (tried === n) {
        markDone(); if (first >= 5) QB.badge(m.id, 'quiz');
        var weak = m.quiz.filter(function (x) { return !q[x.id].first; });
        sum.appendChild(h('p', { style: 'margin:.8em 0 0', html: !weak.length ? 'Все задания выполнены с первой попытки. Переходите к <a href="#transfer">заданию на перенос</a>.' : 'Что повторить: ' + weak.map(function (x) { return '<a href="#q-' + x.id + '">задание ' + (m.quiz.indexOf(x) + 1) + '</a>'; }).join(', ') + '. Откройте разбор, затем вернитесь к ' + (weak.some(function (x) { return x.back === 'lab'; }) ? '<a href="#lab">исследованию</a>' : '<a href="#theory">теории</a>') + ' и проверьте себя на <a href="#transfer">переносе</a>.' }));
      }
    }
    m.quiz.forEach(function (q, i) { w.appendChild(renderQ(q, i, m.id, upd)); });
    w.appendChild(sum); upd();
    w.appendChild(h('div', { class: 'row noprint' }, h('button', { class: 'btn ghost sm', text: 'Сбросить ответы этого модуля', onclick: function () { if (confirm('Сбросить ответы и первую попытку в этом модуле?')) { QB.store.mod(m.id).quiz = {}; QB.store.save(); location.reload(); } } })));
    return w;
  };
  B.transfer = function (m, st, markDone) {
    var t = m.transfer, w = h('div');
    w.appendChild(h('h2', { text: 'Перенос: новая ситуация' }));
    w.appendChild(h('div', { class: 'card amber' }, [h('p', { html: t.q }), t.fig ? figure(t.fig) : null]));
    var ta = h('textarea', { class: 'inp', 'aria-label': 'Ваше объяснение', placeholder: 'Напишите объяснение: вывод → на какие условия и какую физическую связь вы опираетесь.' }); ta.value = (st.transfer || {}).text || '';
    ta.addEventListener('input', function () { st.transfer = st.transfer || {}; st.transfer.text = ta.value; QB.store.save(); });
    w.appendChild(ta);
    var rub = h('div', { hidden: true });
    rub.appendChild(h('div', { class: 'card flat teal' }, [h('h4', { text: 'Опорный ответ' }), h('p', { html: t.sample }),
      h('h4', { text: 'Рубрика 0–2' }), h('div', { class: 'tw' }, h('table', { class: 't rub' }, [
        h('tr', {}, [h('td', { text: '0' }), h('td', { text: 'Вывода нет или он неверный.' })]),
        h('tr', {}, [h('td', { text: '1' }), h('td', { html: 'Вывод верный, но обоснование неполное: ' + (t.r1 || 'не названы условия или физическая связь.') })]),
        h('tr', {}, [h('td', { text: '2' }), h('td', { html: 'Верный вывод с условиями и физической связью: ' + (t.r2 || '') })])])),
      h('p', { class: 'note', text: 'Автоматически открытый ответ не оценивается: по ключевым словам нельзя честно судить о рассуждении. Оцените себя по рубрике или покажите ответ преподавателю.' })]));
    var self = h('div', { class: 'row' }, [h('span', { text: 'Моя оценка по рубрике:' })].concat([0, 1, 2].map(function (v) {
      return h('button', { class: 'btn sm', 'aria-pressed': String((st.transfer || {}).self === v), text: String(v), onclick: function (e) { st.transfer = st.transfer || {}; st.transfer.self = v; QB.store.save(); [].forEach.call(self.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', 'false'); }); e.target.setAttribute('aria-pressed', 'true'); markDone(); if (v === 2) QB.badge(m.id, 'transfer'); } });
    })));
    rub.appendChild(self);
    w.appendChild(h('div', { class: 'row', style: 'margin:.7em 0 1em' }, h('button', { class: 'btn pri', text: 'Сравнить с опорным ответом', onclick: function () {
      if (ta.value.trim().length < 15) { QB.toast('Сначала запишите своё объяснение — хотя бы одну фразу.'); return; } rub.hidden = false; } })));
    w.appendChild(rub);
    var sa = h('div', { class: 'card flat' }, [h('h4', { text: 'Самооценка по результатам занятия' })]);
    st.self = st.self || {};
    m.results.forEach(function (r, i) {
      var row = h('div', { class: 'mrow' }, [h('span', { html: r }), h('div', { class: 'seg', role: 'group', 'aria-label': 'Самооценка' }, ['пока нет', 'с опорой', 'уверенно'].map(function (lab, v) {
        return h('button', { 'aria-pressed': String(st.self[i] === v), text: lab, onclick: function (e) { st.self[i] = v; QB.store.save(); [].forEach.call(e.target.parentNode.children, function (b) { b.setAttribute('aria-pressed', 'false'); }); e.target.setAttribute('aria-pressed', 'true'); } });
      }))]);
      sa.appendChild(row);
    });
    w.appendChild(sa);
    return w;
  };
  B.sum = function (m) {
    var w = h('div'), all = QB.store.all(), bm = all.bm.indexOf(m.id) >= 0;
    w.appendChild(h('h2', { text: 'Итог модуля' }));
    w.appendChild(h('div', { class: 'card teal' }, [h('h4', { text: 'Главное' }), list(m.summary)]));
    var dl = h('dl', { class: 'gl' }); m.glossary.forEach(function (g) { dl.appendChild(h('dt', { html: g[0] })); dl.appendChild(h('dd', { html: g[1] })); });
    w.appendChild(h('div', { class: 'two' }, [
      h('div', { class: 'card flat' }, [h('h4', { text: 'Словарь модуля' }), dl]),
      h('div', {}, [
        h('div', { class: 'card flat' }, [h('h4', { text: 'Связи с другими предметами и жизнью' }), list(m.links)]),
        h('div', { class: 'card flat' }, [h('h4', { text: 'Дополнительно' }), h('ul', {}, (m.extra || []).map(function (e) { return h('li', {}, e[1] ? [h('a', { href: e[1], target: '_blank', rel: 'noopener', html: e[0] }), h('small', { text: ' (внешний ресурс, нужен интернет)' })] : [h('span', { html: e[0] })]); })),
          h('p', { class: 'note', html: '<b>Источники:</b> ' + m.sources.join('; ') + '.' })])
      ])
    ]));
    var bmb = h('button', { class: 'btn', 'aria-pressed': String(bm), text: bm ? '★ В закладках' : '☆ В закладки', onclick: function () { var i = all.bm.indexOf(m.id); if (i >= 0) all.bm.splice(i, 1); else all.bm.push(m.id); QB.store.save(); bmb.textContent = i >= 0 ? '☆ В закладки' : '★ В закладках'; bmb.setAttribute('aria-pressed', String(i < 0)); } });
    w.appendChild(h('div', { class: 'row noprint', style: 'margin-bottom:1.2rem' }, [bmb, h('button', { class: 'btn', text: 'Печать модуля', onclick: function () { QB.printAll(); } })]));
    m.quiz.forEach(function (q) { if (!q._key) renderQ(q, 0, m.id, function () { }); });
    var T = m.teacher, key = h('table', { class: 't' }, [h('tr', {}, [h('th', { text: '№' }), h('th', { text: 'Ключ' })])].concat(m.quiz.map(function (q, i) { return h('tr', {}, [h('td', { text: i + 1 }), h('td', { html: q._key || '' })]); })));
    w.appendChild(h('div', { class: 'card teach-only' }, [h('h4', { text: 'Преподавателю' }), list(T.notes), h('p', { html: '<b>Примерный хронометраж:</b> ' + T.timing }), h('p', { html: '<b>Смена деятельности:</b> ' + (T.offscreen || 'после исследования — обсуждение в парах без экрана и запись вывода в тетрадь; задание на перенос можно выполнять на бумаге.') }),
      h('h4', { text: 'Ключи к проверке' }), h('div', { class: 'tw' }, key)]));
    var nx = QB.next(m.id, 1);
    if (nx) w.appendChild(h('a', { class: 'card', style: 'display:block;text-decoration:none;color:inherit', href: nx.id + '.html' }, [h('div', { class: 'kicker', text: 'Дальше · модуль ' + nx.n }), h('h3', { text: nx.title }), h('p', { style: 'margin:0', html: nx.question })]));
    return w;
  };

  /* ================= сборка страницы ================= */
  QB.renderModule = function (id) {
    var m = QB.mods[id], st = QB.store.mod(id), cur = null, built = {};
    document.title = m.n + '. ' + m.title + ' — DOCENAR • КВАНТ';
    QB.topbar('Часть ' + ['I', 'II', 'III', 'IV'][m.part - 1] + ' · модуль ' + m.n + ' · ' + m.title);
    var rail = h('nav', { class: 'rail', 'aria-label': 'Шаги занятия' }), stage = h('main', { class: 'stage', id: 'main', tabindex: '-1' }), secs = {}, btns = {};
    stage.appendChild(h('h1', { class: 'sr-h1', text: m.n + '. ' + m.title }));
    QB.STEPS.forEach(function (s, i) {
      btns[s[0]] = h('button', { type: 'button', onclick: function () { location.hash = s[0]; } }, [h('span', { class: 'k', text: i + 1 }), h('span', { class: 'l', text: s[1] })]);
      rail.appendChild(btns[s[0]]);
      secs[s[0]] = h('section', { class: 'step', id: 'step-' + s[0], hidden: true, 'aria-label': s[1] }); stage.appendChild(secs[s[0]]);
    });
    rail.appendChild(h('div', { class: 'meta', html: m.program + '<br>Прогресс хранится только в этом браузере.' }));
    var prev = h('a', { class: 'btn', href: '#' }), next = h('a', { class: 'btn pri', href: '#' });
    stage.appendChild(h('div', { class: 'pager' }, [prev, next]));
    document.body.appendChild(h('div', { class: 'wrap mod' }, [rail, stage]));
    QB.footer();
    function mark(key) { if (!st.steps[key]) { st.steps[key] = 1; QB.store.save(); } btns[key].classList.add('done'); }
    function build(key) { if (built[key]) return; built[key] = 1; secs[key].appendChild(B[key](m, st, function () { mark(key); })); }
    QB.printAll = function () { QB.STEPS.forEach(function (s) { build(s[0]); }); setTimeout(function () { window.print(); }, 50); };
    window.addEventListener('beforeprint', function () { QB.STEPS.forEach(function (s) { build(s[0]); }); });
    function go() {
      var raw = location.hash.slice(1), key = raw, target = null;
      if (raw.indexOf('q-') === 0) { key = 'quiz'; target = raw; }
      if (!B[key]) key = cur || (QB.store.all().last && QB.store.all().last.m === id ? QB.store.all().last.s : 'hook') || 'hook';
      if (!B[key]) key = 'hook';
      build(key);
      QB.STEPS.forEach(function (s) { secs[s[0]].hidden = s[0] !== key; btns[s[0]].removeAttribute('aria-current'); if (st.steps[s[0]]) btns[s[0]].classList.add('done'); });
      btns[key].setAttribute('aria-current', 'step');
      if (rail.scrollWidth > rail.clientWidth) { var bl = btns[key].offsetLeft - rail.offsetLeft; rail.scrollLeft = Math.max(0, bl - rail.clientWidth / 3); }
      if (cur !== null && cur !== key && window.gsap && !QB.reduced) gsap.fromTo(secs[key], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .32, ease: 'power2.out', clearProps: 'transform,opacity' });
      var i = QB.STEPS.findIndex(function (s) { return s[0] === key; }), p = QB.STEPS[i - 1], n = QB.STEPS[i + 1], pm = QB.next(id, -1), nm = QB.next(id, 1);
      prev.textContent = p ? '← ' + p[1] : pm ? '← Модуль ' + pm.n : '← Оглавление'; prev.href = p ? '#' + p[0] : pm ? pm.id + '.html#sum' : '../index.html#map';
      next.textContent = n ? n[1] + ' →' : nm ? 'Модуль ' + nm.n + ' →' : 'К оглавлению →'; next.href = n ? '#' + n[0] : nm ? nm.id + '.html' : '../index.html#map';
      if (key !== 'quiz' && key !== 'transfer' && !(key === 'hook' && m.hook.predict && !(st.predict && st.predict.first != null))) mark(key);
      if (key === 'hook' && st.predict && st.predict.first != null) mark(key);
      if (key === 'lab' && secs.lab.firstChild && secs.lab.firstChild._refresh) secs.lab.firstChild._refresh();
      QB.store.all().last = { m: id, s: key, at: Date.now() }; QB.store.save();
      if (cur !== null || target) { var el = target && document.getElementById(target); (el || stage).scrollIntoView({ block: 'start' }); if (!el) window.scrollTo(0, 0); }
      cur = key; document.dispatchEvent(new CustomEvent('qb:step', { detail: key }));
    }
    window.addEventListener('hashchange', go); go();
    document.addEventListener('keydown', function (e) {
      if (e.altKey && e.key === 'ArrowRight') next.click(); if (e.altKey && e.key === 'ArrowLeft') prev.click();
    });
  };
})();
