/* DOCENAR • КВАНТ — ядро: хранилище, формулы, панель, поиск, словарь */
(function () {
  'use strict';
  var QB = window.QB = window.QB || {};
  QB.base = window.QB_BASE || '';
  QB.mods = {}; QB.sims = {}; QB.figs = {};
  QB.module = function (m) { QB.mods[m.id] = m; };
  QB.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- DOM ---------- */
  var h = QB.h = function (tag, attrs, kids) {
    var el = document.createElement(tag), k;
    for (k in attrs || {}) {
      if (attrs[k] == null || attrs[k] === false) continue;
      if (k === 'html') el.innerHTML = QB.fmt(attrs[k]);
      else if (k === 'raw') el.innerHTML = attrs[k];
      else if (k === 'text') el.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else el.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    (Array.isArray(kids) ? kids : kids == null ? [] : [kids]).forEach(function (c) { if (c != null && c !== false) el.appendChild(typeof c === 'object' ? c : document.createTextNode(c)); });
    return el;
  };
  var NS = 'http://www.w3.org/2000/svg';
  QB.sceneZoom = function (panels, label) {
    var zoom = h('button', { class: 'btn sm ghost scene-zoom', type: 'button', text: 'Крупнее', 'aria-label': label, 'aria-pressed': 'false',
      onclick: function () {
        var on = zoom.getAttribute('aria-pressed') !== 'true';
        zoom.setAttribute('aria-pressed', String(on));
        panels.forEach(function (panel) {
          panel.classList.toggle('scene-zoomed', on);
          panel.tabIndex = on ? 0 : -1;
          if (!on) panel.scrollLeft = 0;
        });
      } });
    return zoom;
  };
  QB.s = function (tag, attrs, parent, text) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs || {}) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    if (text != null) el.textContent = text;
    if (parent) parent.appendChild(el);
    return el;
  };
  QB.esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- формулы: $E_ф = hc/λ$, $2^{-t/T}$, $\frac{hc}{λ}$ ---------- */
  function formula(src) {
    var s = QB.esc(src);
    s = s.replace(/_\{([^{}]*)\}/g, '<sub>$1</sub>').replace(/\^\{([^{}]*)\}/g, '<sup>$1</sup>');
    s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '<span class="frac"><span>$1</span><span>$2</span></span>');
    s = s.replace(/\\sqrt\{([^{}]*)\}/g, '<span class="sq">√<span>$1</span></span>');
    s = s.replace(/_(\d+|[A-Za-zА-Яа-яёЁ½αβγνλ]+)/g, '<sub>$1</sub>').replace(/\^([\-−+]?[A-Za-z0-9]+)/g, '<sup>$1</sup>');
    s = s.replace(/(^|[^A-Za-z&#;])(\d+(?:[.,]\d+)?)/g, '$1<span class="n">$2</span>');
    s = s.replace(/([А-Яа-яёЁ]+)/g, '<span class="u">$1</span>');
    return '<span class="f">' + s + '</span>';
  }
  QB.nuc = function (A, Z, X) { return '<span class="nuc"><span class="ix"><span>' + A + '</span><span>' + String(Z).replace('-', '−') + '</span></span>' + X + '</span>'; };
  QB.fmt = function (str) { return String(str == null ? '' : str).replace(/\{(\d+),(-?\d+),([^{}]+)\}/g, function (_, A, Z, X) { return QB.nuc(A, Z, X); }).replace(/\$([^$]+)\$/g, function (_, f) { return formula(f); }); };
  QB.num = function (v, d) { if (v == null || isNaN(v)) return '—'; return v.toFixed(d == null ? 2 : d).replace('.', ',').replace('-', '−'); };
  QB.sci = function (v, d) { if (!v) return '0'; var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e); return QB.num(m, d == null ? 2 : d) + '·10<sup>' + String(e).replace('-', '−') + '</sup>'; };

  /* ---------- локальное хранилище ---------- */
  var KEY = 'docenar-kvant-v1', mem = null;
  function load() {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { mem = null; }
    if (!mem || typeof mem !== 'object') mem = {};
    mem.mods = mem.mods || {}; mem.bm = mem.bm || []; mem.prefs = mem.prefs || {}; mem.log = mem.log || [];
    return mem;
  }
  QB.store = {
    all: load,
    mod: function (id) { var d = load(); return d.mods[id] = d.mods[id] || { steps: {}, quiz: {}, lab: {}, badges: {} }; },
    save: function () { try { localStorage.setItem(KEY, JSON.stringify(mem)); QB.store.ok = true; } catch (e) { QB.store.ok = false; } },
    wipe: function () { try { localStorage.removeItem(KEY); } catch (e) { } mem = null; },
    export: function () {
      var blob = new Blob([JSON.stringify({ app: 'DOCENAR • КВАНТ', exported: new Date().toISOString(), note: 'Локальные данные одного браузера. Имён и контактов не содержит.', data: load() }, null, 2)], { type: 'application/json' });
      var a = h('a', { href: URL.createObjectURL(blob), download: 'kvant-progress.json' }); document.body.appendChild(a); a.click(); a.remove();
    },
    import: function (text) { var o = JSON.parse(text); if (!o || !o.data || !o.data.mods) throw new Error('Это не файл прогресса учебника'); mem = o.data; QB.store.save(); }
  };
  QB.STEPS = [['hook', 'Вопрос'], ['theory', 'Теория'], ['example', 'Пример'], ['lab', 'Исследование'], ['quiz', 'Проверка'], ['transfer', 'Перенос'], ['sum', 'Итог']];
  QB.progress = function (id) { var st = (load().mods[id] || {}).steps || {}, n = 0; QB.STEPS.forEach(function (s) { if (st[s[0]]) n++; }); return n / QB.STEPS.length; };
  QB.BADGES = { predict: ['Прогноз до опыта', 'Сделан и сохранён первый прогноз'], control: ['Контроль переменных', 'Сравнены опыты, где менялась одна величина'], fix: ['Исправленное заблуждение', 'Первый ответ был неверным, итоговый — верный и объяснён'], quiz: ['Точная проверка', 'Не менее 5 заданий верно с первой попытки'], transfer: ['Перенос', 'Модель применена к новой ситуации'] };
  QB.badge = function (mid, key) { if (QB._demo) return; var m = QB.store.mod(mid); if (!m.badges[key]) { m.badges[key] = 1; QB.store.save(); QB.toast('Отмечен приём: ' + QB.BADGES[key][0]); } };
  QB.toast = function (text) {
    var t = h('div', { role: 'status', style: 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#1E2E35;color:#fff;padding:.6em 1.1em;border-radius:999px;font-size:.86rem;z-index:80;max-width:90vw', text: text });
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3200);
  };

  /* ---------- режимы ---------- */
  function applyPrefs() {
    var p = load().prefs, c = document.documentElement.classList;
    c.toggle('proj', !!p.proj); c.toggle('teach', !!p.teach); c.toggle('acad', !!p.acad);
  }
  QB.pref = function (k, v) { load().prefs[k] = v; QB.store.save(); applyPrefs(); document.dispatchEvent(new CustomEvent('qb:prefs')); };

  /* ---------- диалог ---------- */
  QB.dialog = function (title, body) {
    var last = document.activeElement;
    var box = h('div', { role: 'dialog', 'aria-modal': 'true', 'aria-label': title, tabindex: '-1' }, [
      h('div', { style: 'display:flex;justify-content:space-between;gap:1rem;align-items:start' }, [h('h2', { text: title }), h('button', { class: 'btn sm', text: 'Закрыть', onclick: close })]), body]);
    var wrap = h('div', { class: 'dlg', onclick: function (e) { if (e.target === wrap) close(); } }, box);
    function close() { wrap.remove(); document.removeEventListener('keydown', esc); if (last && last.focus) last.focus(); }
    function esc(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', esc); document.body.appendChild(wrap); box.focus();
    return close;
  };

  /* ---------- поиск ---------- */
  QB.search = function (q) {
    q = QB.P.norm(q); if (q.length < 2) return [];
    var words = q.split(' '), out = [];
    (QB.INDEX || []).forEach(function (r) {
      var t = r.n || (r.n = QB.P.norm(r.t + ' ' + (r.d || ''))), sc = 0;
      for (var i = 0; i < words.length; i++) { var p = t.indexOf(words[i]); if (p < 0) return; sc += (p === 0 ? 3 : 1) + (r.k === 'g' ? 2 : r.k === 'm' ? 3 : 0); }
      out.push({ r: r, sc: sc });
    });
    out.sort(function (a, b) { return b.sc - a.sc; });
    return out.slice(0, 14).map(function (o) { return o.r; });
  };
  var KIND = { m: 'Модуль', g: 'Словарь', f: 'Формула', t: 'Теория', q: 'Задание', l: 'Модель' };
  function searchBox() {
    var res = h('div', { class: 'sres', hidden: true, role: 'listbox' });
    var inp = h('input', { type: 'search', placeholder: 'Поиск: понятие, формула, тема', 'aria-label': 'Поиск по учебнику', autocomplete: 'off',
      oninput: function () {
        var list = QB.search(inp.value); res.innerHTML = '';
        if (inp.value.trim().length < 2) { res.hidden = true; return; }
        res.hidden = false;
        if (!list.length) { res.appendChild(h('a', { text: 'Ничего не найдено. Попробуйте другое слово, например «фотон» или «полураспад».' })); return; }
        list.forEach(function (r) {
          res.appendChild(h('a', { href: QB.base + 'modules/' + r.m + '.html#' + (r.s || 'hook'), role: 'option' }, [
            h('span', { html: r.t }), h('small', { text: KIND[r.k] + ' · ' + QB.TOC.byId[r.m].n + '. ' + QB.TOC.byId[r.m].title + (r.d ? ' — ' + r.d.slice(0, 90) : '') })]));
        });
      },
      onkeydown: function (e) { if (e.key === 'Escape') { res.hidden = true; inp.value = ''; } if (e.key === 'ArrowDown' && res.firstChild) { e.preventDefault(); res.firstChild.focus(); } }
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) res.hidden = true; });
    var box = h('div', { class: 'search', role: 'search' }, [inp, res]);
    return box;
  }

  /* ---------- словарь и данные ---------- */
  QB.openGlossary = function () {
    var list = (QB.INDEX || []).filter(function (r) { return r.k === 'g'; }).sort(function (a, b) { return a.t.localeCompare(b.t, 'ru'); });
    var dl = h('dl', { class: 'gl' });
    var f = h('input', { class: 'inp', style: 'width:100%', type: 'search', placeholder: 'Фильтр по словарю', 'aria-label': 'Фильтр по словарю', oninput: draw });
    function draw() {
      var q = QB.P.norm(f.value); dl.innerHTML = '';
      list.forEach(function (r) {
        if (q && QB.P.norm(r.t + ' ' + r.d).indexOf(q) < 0) return;
        dl.appendChild(h('dt', {}, [h('span', { html: r.t }), ' ', h('a', { href: QB.base + 'modules/' + r.m + '.html#sum', style: 'font-weight:400;font-size:.78rem', text: 'модуль ' + QB.TOC.byId[r.m].n })]));
        dl.appendChild(h('dd', { html: r.d }));
      });
    }
    draw(); QB.dialog('Словарь учебника', h('div', {}, [f, dl]));
  };
  QB.openData = function () {
    var file = h('input', { type: 'file', accept: 'application/json', class: 'sr', onchange: function () {
      var r = new FileReader(); r.onload = function () { try { QB.store.import(r.result); location.reload(); } catch (e) { QB.toast('Не удалось прочитать файл: ' + e.message); } }; r.readAsText(file.files[0]);
    } });
    QB.dialog('Мои данные', h('div', {}, [
      h('p', { text: 'Учебник не требует регистрации и ничего не отправляет в интернет. Прогресс, ответы и закладки хранятся только в этом браузере на этом устройстве (localStorage). Если очистить данные браузера или открыть учебник на другом компьютере, прогресс не перенесётся — для этого есть экспорт в файл.' }),
      QB.store.ok === false ? h('p', { class: 'warn', text: 'Браузер запретил локальное хранение: прогресс сохранится только до закрытия вкладки.' }) : null,
      h('div', { class: 'row' }, [
        h('button', { class: 'btn', text: 'Экспортировать в файл', onclick: QB.store.export }),
        h('button', { class: 'btn', text: 'Загрузить из файла', onclick: function () { file.click(); } }), file,
        h('button', { class: 'btn', style: 'border-color:#B6533E;color:#96402E', text: 'Удалить все данные', onclick: function () { if (confirm('Удалить прогресс, ответы и закладки с этого устройства? Действие нельзя отменить.')) { QB.store.wipe(); location.reload(); } } })
      ]),
      h('p', { class: 'note', style: 'margin-top:1em', text: 'Не вписывайте в поля ответов фамилии, телефоны и другие личные сведения: они не нужны для работы учебника.' })
    ]));
  };

  /* ---------- верхняя панель ---------- */
  QB.MARK = '<svg viewBox="40 26 176 204" aria-hidden="true"><path fill="currentColor" d="M54 40H114A88 88 0 0 1 147.68 46.7L136.96 72.57A60 60 0 0 0 114 68H82V188H114A60 60 0 0 0 169.43 105.04L195.3 94.32A88 88 0 0 1 114 216H54Z"/><circle fill="var(--teal)" cx="166.33" cy="75.67" r="15"/></svg>';
  QB.topbar = function (crumb) {
    applyPrefs();
    var p = load().prefs;
    function tgl(key, label, title, confirmText) {
      var b = h('button', { class: 'btn sm ghost', 'aria-pressed': String(!!p[key]), title: title, text: label, onclick: function () {
        var v = !load().prefs[key];
        if (v && confirmText && !confirm(confirmText)) return;
        QB.pref(key, v); b.setAttribute('aria-pressed', String(v));
      } });
      return b;
    }
    var bar = h('header', { class: 'top' }, h('div', { class: 'top-in' }, [
      h('a', { class: 'skip', href: '#main', text: 'К содержанию' }),
      h('a', { class: 'brand', href: QB.base + 'index.html', 'aria-label': 'DOCENAR • КВАНТ — на обложку' }, [h('i', { html: QB.MARK }), 'DOCENAR • КВАНТ']),
      h('span', { class: 'crumb', text: crumb || '' }),
      h('button', { class: 'btn sm menu-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'qb-tools', text: 'Меню', onclick: function (e) {
        var top = e.currentTarget.closest('.top'), open = !top.classList.contains('open');
        top.classList.toggle('open', open); e.currentTarget.setAttribute('aria-expanded', String(open)); e.currentTarget.textContent = open ? 'Закрыть' : 'Меню';
        if (open && window.gsap && !QB.reduced) gsap.fromTo(top.querySelectorAll('.search,.tools > *'), { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: .22, stagger: .025, ease: 'power2.out', clearProps: 'transform,opacity' });
      } }),
      searchBox(),
      h('nav', { class: 'tools', id: 'qb-tools', 'aria-label': 'Инструменты' }, [
        h('a', { class: 'btn sm ghost', href: QB.base + 'index.html#map', text: 'Оглавление' }),
        h('button', { class: 'btn sm ghost', text: 'Словарь', onclick: QB.openGlossary }),
        tgl('proj', 'Проектор', 'Крупный режим для показа на экране'),
        tgl('acad', 'Без сюжета', 'Академический режим: скрыть журнал исследователя'),
        tgl('teach', 'Преподаватель', 'Показать ключи и методические комментарии', 'Открыть ключи к заданиям и методические комментарии? Это локальный режим показа, а не защищённый кабинет: он доступен любому, кто нажмёт эту кнопку.'),
        h('button', { class: 'btn sm ghost', text: 'Данные', onclick: QB.openData })
      ])
    ]));
    document.body.insertBefore(bar, document.body.firstChild);
  };
  QB.footer = function () {
    document.body.appendChild(h('footer', { class: 'foot' }, h('div', { class: 'wrap' }, [
      h('p', { html: '<b>DOCENAR • КВАНТ. От света к устройству материи.</b> Интерактивный учебник по квантовой физике для XI класса (базовый уровень). Автор: Слепенчук Илья Олегович, преподаватель физики, УО «Гомельский государственный автомеханический колледж», Гомель, 2026.' }),
      h('p', { html: 'Модели в учебнике — учебные упрощения; у каждой указаны границы применимости. Движущиеся частицы на экране — условные обозначения, а не изображение реальных объектов в масштабе. <a href="' + QB.base + 'about.html">О проекте, источники и лицензии</a> · <a href="' + QB.base + 'teacher.html">Преподавателю</a>' })
    ])));
  };
  QB.next = function (id, d) { var i = QB.TOC.list.findIndex(function (m) { return m.id === id; }); return QB.TOC.list[i + d] || null; };
})();
