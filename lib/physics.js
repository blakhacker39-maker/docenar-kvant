/* DOCENAR • КВАНТ — математические модели. Не зависят от отображения; тестируются в tests/run.mjs */
(function (root, factory) {
  var P = factory();
  if (typeof module === 'object' && module.exports) module.exports = P;
  else (root.QB = root.QB || {}).P = P;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var C = {
    h: 6.62607015e-34,      // Дж·с (точное значение СИ 2019)
    c: 299792458,           // м/с (точное)
    e: 1.602176634e-19,     // Кл (точное)
    hc_eVnm: 1239.841984,   // эВ·нм
    h_eVs: 4.135667696e-15, // эВ·с
    u_MeV: 931.49410242,    // МэВ на 1 а.е.м. (CODATA 2018)
    mH: 1.00782503190,      // масса атома водорода-1, а.е.м. (AME2020)
    mn: 1.00866491590,      // масса нейтрона, а.е.м.
    me: 0.000548579909,     // масса электрона, а.е.м.
    Ry: 13.605693           // эВ, энергия ионизации водорода в модели Бора
  };

  /* ---------- свет и фотоны ---------- */
  function photonE(lambdaNm) { return C.hc_eVnm / lambdaNm; }           // эВ
  function freq(lambdaNm) { return C.c / (lambdaNm * 1e-9); }           // Гц
  function lambdaFromE(E) { return C.hc_eVnm / E; }                     // нм
  function region(lambdaNm) {
    if (lambdaNm < 0.01) return 'гамма-излучение';
    if (lambdaNm < 10) return 'рентгеновское излучение';
    if (lambdaNm < 380) return 'ультрафиолет';
    if (lambdaNm <= 780) return 'видимый свет';
    if (lambdaNm < 1e6) return 'инфракрасное излучение';
    return 'радиоволны';
  }
  function colorName(l) {
    if (l < 380 || l > 780) return null;
    return l < 450 ? 'фиолетовый' : l < 485 ? 'синий' : l < 500 ? 'голубой' : l < 565 ? 'зелёный' : l < 590 ? 'жёлтый' : l < 625 ? 'оранжевый' : 'красный';
  }
  /* приближённый цвет для экрана; вне видимого диапазона — нейтральный серо-фиолетовый/бордовый (условность) */
  function rgb(l) {
    var r = 0, g = 0, b = 0, f = 1;
    if (l < 380) return 'rgb(150,140,200)';
    if (l > 780) return 'rgb(150,90,90)';
    if (l < 440) { r = -(l - 440) / 60; b = 1; }
    else if (l < 490) { g = (l - 440) / 50; b = 1; }
    else if (l < 510) { g = 1; b = -(l - 510) / 20; }
    else if (l < 580) { r = (l - 510) / 70; g = 1; }
    else if (l < 645) { r = 1; g = -(l - 645) / 65; }
    else { r = 1; }
    if (l < 420) f = 0.45 + 0.55 * (l - 380) / 40; else if (l > 700) f = 0.45 + 0.55 * (780 - l) / 80;
    function ch(v) { return Math.round(255 * Math.pow(v * f, 0.8)); }
    return 'rgb(' + ch(r) + ',' + ch(g) + ',' + ch(b) + ')';
  }
  /* Фотоэффект: lambda нм, A эВ, I — условная интенсивность 0..100 % */
  function photo(lambdaNm, A, I) {
    var Ef = photonE(lambdaNm), energetic = Ef >= A, emits = energetic && I > 0;
    return {
      Ef: Ef, nu: freq(lambdaNm), energetic: energetic, emits: emits,
      Emax: emits ? Ef - A : null,          // при отсутствии эмиссии энергии «нет», а не ноль
      Uz: emits ? Ef - A : null,            // В, модуль задерживающего напряжения
      lambdaCr: C.hc_eVnm / A, nuCr: A / C.h_eVs,
      rate: emits ? I : 0                   // условное число фотоэлектронов ~ потоку фотонов
    };
  }
  function photonFlux(P_W, lambdaNm) { return P_W / (photonE(lambdaNm) * C.e); }   // фотонов в секунду
  function lightPressure(I_Wm2, rho) { return I_Wm2 / C.c * (1 + rho); }           // Па, нормальное падение
  function photonMomentum(lambdaNm) { return C.h / (lambdaNm * 1e-9); }            // кг·м/с

  /* ---------- атом ---------- */
  function bohrE(n, Z) { Z = Z || 1; return -C.Ry * Z * Z / (n * n); }
  function bohrR(n) { return 0.0529177 * n * n; }  // нм
  function transition(nFrom, nTo) {
    var dE = bohrE(nFrom) - bohrE(nTo), abs = dE < 0, E = Math.abs(dE), lam = lambdaFromE(E);
    var low = Math.min(nFrom, nTo);
    return { E: E, lambda: lam, nu: E / C.h_eVs, absorption: abs, region: region(lam), color: colorName(lam),
      series: low === 1 ? 'Лаймана' : low === 2 ? 'Бальмера' : low === 3 ? 'Пашена' : low === 4 ? 'Брэккета' : 'n = ' + low };
  }

  /* ---------- ядро ---------- */
  var EL = 'n H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr'.split(' ');
  var ELN = 'нейтрон водород гелий литий бериллий бор углерод азот кислород фтор неон натрий магний алюминий кремний фосфор сера хлор аргон калий кальций скандий титан ванадий хром марганец железо кобальт никель медь цинк галлий германий мышьяк селен бром криптон рубидий стронций иттрий цирконий ниобий молибден технеций рутений родий палладий серебро кадмий индий олово сурьма теллур иод ксенон цезий барий лантан церий празеодим неодим прометий самарий европий гадолиний тербий диспрозий гольмий эрбий тулий иттербий лютеций гафний тантал вольфрам рений осмий иридий платина золото ртуть таллий свинец висмут полоний астат радон франций радий актиний торий протактиний уран нептуний плутоний америций кюрий берклий калифорний эйнштейний фермий менделевий нобелий лоуренсий'.split(' ');
  /* атомные массы, а.е.м. (AME2020, округление до 6 знаков) */
  var NUC = [
    ['H', 1, 1, 1.007825], ['H', 1, 2, 2.014102], ['H', 1, 3, 3.016049], ['He', 2, 3, 3.016029], ['He', 2, 4, 4.002603],
    ['Li', 3, 6, 6.015123], ['Li', 3, 7, 7.016003], ['Be', 4, 9, 9.012183], ['C', 6, 12, 12.000000], ['N', 7, 14, 14.003074],
    ['O', 8, 16, 15.994915], ['Al', 13, 27, 26.981539], ['Fe', 26, 56, 55.934936], ['Ni', 28, 62, 61.928345],
    ['Kr', 36, 92, 91.926156], ['Ba', 56, 141, 140.914411], ['Pb', 82, 208, 207.976652], ['U', 92, 235, 235.043930], ['U', 92, 238, 238.050788]
  ].map(function (r) { return { sym: r[0], Z: r[1], A: r[2], M: r[3] }; });
  function nuclide(sym, A) { for (var i = 0; i < NUC.length; i++) if (NUC[i].sym === sym && NUC[i].A === A) return NUC[i]; return null; }
  /* Дефект масс через атомные массы: электроны Z атомов водорода и атома сокращаются (энергией связи электронов пренебрегаем) */
  function massDefect(Z, A, M) { return Z * C.mH + (A - Z) * C.mn - M; }
  function binding(Z, A, M) { var dm = massDefect(Z, A, M), E = dm * C.u_MeV; return { dm: dm, E: E, perA: E / A }; }
  /* полуэмпирическая формула Вейцзеккера — только для плавной кривой на графике */
  function semf(A) {
    var Z = Math.round(A / (1.98 + 0.0155 * Math.pow(A, 2 / 3)));
    var E = 15.75 * A - 17.8 * Math.pow(A, 2 / 3) - 0.711 * Z * (Z - 1) / Math.pow(A, 1 / 3) - 23.7 * Math.pow(A - 2 * Z, 2) / A;
    return E / A;
  }
  /* Q реакции по атомным массам: left/right — массивы масс (для нейтрона — mn) */
  function reactionQ(left, right) {
    var s = 0; left.forEach(function (m) { s += m; }); right.forEach(function (m) { s -= m; });
    return s * C.u_MeV;
  }
  function decayStep(Z, A, kind) {
    if (kind === 'alpha') return { Z: Z - 2, A: A - 4 };
    if (kind === 'beta') return { Z: Z + 1, A: A };
    return { Z: Z, A: A };
  }
  function decayN(N0, t, T) { return N0 * Math.pow(2, -t / T); }
  function decayProb(dt, T) { return 1 - Math.pow(2, -dt / T); }
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function simulateDecay(N0, T, dt, steps, seed) {
    var r = rng(seed), p = decayProb(dt, T), n = N0, out = [N0];
    for (var s = 0; s < steps; s++) { var d = 0; for (var i = 0; i < n; i++) if (r() < p) d++; n -= d; out.push(n); }
    return out;
  }
  function chain(N0, k, g) { return N0 * Math.pow(k, g); }
  /* Резерфорд: угол рассеяния по прицельному параметру b; d — расстояние наибольшего сближения при лобовом ударе */
  function ruthAngle(b, d) { return 2 * Math.atan(d / (2 * b)) * 180 / Math.PI; }
  function closestApproach(Z1, Z2, E_MeV) { return 1.44 * Z1 * Z2 / E_MeV; }   // фм
  /* радиус трека в магнитном поле: p в МэВ/c, q в e, B в Тл → м */
  function trackRadius(p, q, B) { return p / (299.792458 * Math.abs(q) * B); }
  function invSquare(r, r0) { return (r0 * r0) / (r * r); }

  /* ---------- разбор и проверка числового ответа ---------- */
  function parseNum(s) {
    if (typeof s === 'number') return s;
    if (s == null) return NaN;
    s = String(s).trim().replace(/\s+/g, '').replace(/,/g, '.').replace(/−|–/g, '-').replace(/[·×x\*]10\^?\(?(-?\d+)\)?/i, 'e$1');
    if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return NaN;
    return parseFloat(s);
  }
  function checkNum(input, answer, tol) {
    var v = parseNum(input); tol = tol == null ? 0.02 : tol;
    if (isNaN(v)) return { ok: false, empty: String(input == null ? '' : input).trim() === '', bad: true };
    var ok = answer === 0 ? Math.abs(v) <= tol : Math.abs(v - answer) <= Math.abs(answer) * tol + 1e-12;
    var pow = !ok && answer !== 0 && v !== 0 && Math.abs(Math.log10(Math.abs(v / answer)) - Math.round(Math.log10(Math.abs(v / answer)))) < 0.01 && Math.round(Math.log10(Math.abs(v / answer))) !== 0;
    return { ok: ok, value: v, power10: pow, sign: !ok && Math.abs(v + answer) <= Math.abs(answer) * tol };
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[\s\-–—.,;:!?"«»()]+/g, ' ').trim(); }

  return { C: C, photonE: photonE, freq: freq, lambdaFromE: lambdaFromE, region: region, colorName: colorName, rgb: rgb, photo: photo,
    photonFlux: photonFlux, lightPressure: lightPressure, photonMomentum: photonMomentum, bohrE: bohrE, bohrR: bohrR, transition: transition,
    EL: EL, ELN: ELN, NUC: NUC, nuclide: nuclide, massDefect: massDefect, binding: binding, semf: semf, reactionQ: reactionQ, decayStep: decayStep,
    decayN: decayN, decayProb: decayProb, rng: rng, simulateDecay: simulateDecay, chain: chain, ruthAngle: ruthAngle, closestApproach: closestApproach,
    trackRadius: trackRadius, invSquare: invSquare, parseNum: parseNum, checkNum: checkNum, norm: norm };
});
