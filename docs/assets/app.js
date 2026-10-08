/* Révision AMF — application (cours, quiz, examens blancs, banque, résultats).
   Données : window.AMF_META, window.AMF_Q (data/questions.js), window.AMF_COURS (data/cours.js).
   La progression est enregistrée dans le navigateur (localStorage) et peut être exportée. */
(function () {
  "use strict";

  const META = window.AMF_META, QS = window.AMF_Q, COURS = window.AMF_COURS;
  const $app = document.getElementById("app");
  const $modal = document.getElementById("modal-root");
  if (!META || !QS || !COURS) {
    $app.innerHTML = '<p class="empty">Les fichiers de données (data/questions.js, data/cours.js) sont introuvables.</p>';
    return;
  }

  // ---------- Référentiel ----------
  const LET = ["A", "B", "C"];
  const EXAM = { n: 120, A: 33, C: 87, minA: 27, minC: 70, dur: 2 * 3600 };
  const SHORT = {
    1: "Cadre institutionnel", 2: "Déontologie et conformité", 3: "Sécurité financière", 4: "Abus de marché",
    5: "Commercialisation et démarchage", 6: "Relations avec les clients", 7: "Instruments financiers",
    8: "Gestion collective et finance durable", 9: "Fonctionnement des marchés", 10: "Post-marché",
    11: "Émissions et opérations sur titres", 12: "Comptabilité et fiscalité",
  };
  const FLAG = {
    err: ["Erreur de la base", "err"], abs: ["Réponse absente de la base", "err"], obs: ["Réponse dépassée", "obs"],
    ver: ["À vérifier", "ver"], dis: ["Formulation discutable", "ver"], pie: ["Piège", "warn"], ctx: ["Contexte", "ctx"],
  };
  const ANNEX_DESC = {
    A: "Les 64 questions de la base dont la réponse est fausse, absente, dépassée ou piégeuse.",
    B: "Tous les moyens mnémotechniques des leçons, à relire la veille.",
    C: "Délais, seuils, montants et pourcentages, thème par thème.",
    D: "Ce qui a changé dans la réglementation depuis la base (2021 → 2026).",
  };
  const THEMES = META.themes;
  const SUBS = META.subs;
  const SUB = Object.fromEntries(SUBS.map((s) => [s.s, s]));
  const BY_ID = new Map(QS.map((q) => [q.i, q]));
  const BY_SUB = {};
  const BY_THEME = {};
  QS.forEach((q) => { (BY_SUB[q.s] = BY_SUB[q.s] || []).push(q); (BY_THEME[q.t] = BY_THEME[q.t] || []).push(q); });
  const TW = {};
  SUBS.forEach((s) => { const w = (TW[s.t] = TW[s.t] || { A: 0, C: 0 }); w[s.k] += s.n; });

  // ---------- Stockage ----------
  // Deux copies de la progression : le navigateur (localStorage) pour un affichage immédiat et, quand la
  // page est ouverte dans Claude, le compte de la personne (capacité db, documents privés sous
  // data/users/<id>/) : statistiques et réglages, session en cours, et un document par session terminée.
  // Le stockage du navigateur peut être effacé à la fermeture de l'artefact ; le compte, lui, suit la
  // personne dans n'importe quel navigateur où elle ouvre le lien en étant connectée.
  const KEY = "amf.v1";
  const num = (x) => (Number.isFinite(x) ? x : 0);
  function normalize(d) {
    d = d && typeof d === "object" ? d : {};
    return {
      v: 1,
      q: d.q && typeof d.q === "object" && !Array.isArray(d.q) ? d.q : {},
      hist: Array.isArray(d.hist) ? d.hist.filter((h) => h && h.id && Array.isArray(h.items)) : [],
      run: d.run && Array.isArray(d.run.items) ? d.run : null,
      prefs: d.prefs && typeof d.prefs === "object" ? d.prefs : {},
      ts: num(d.ts), runTs: num(d.runTs), resetAt: num(d.resetAt),
    };
  }
  function load() { let d = null; try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* stockage indisponible */ } return normalize(d); }
  function writeLocal() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } }
  let S = load();
  // Texte canonique (clés triées) : deux contenus identiques donnent le même texte, quel que soit l'ordre des clés.
  const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === "object" && !Array.isArray(x)
    ? Object.keys(x).sort().reduce((o, key) => { o[key] = x[key]; return o; }, {}) : x));
  const statsJson = () => canon({ q: S.q, prefs: S.prefs, resetAt: S.resetAt });
  const runJson = () => canon(S.run);
  const local = { s: statsJson(), r: runJson() };
  function save() {
    if (S.hist.length > 150) S.hist = S.hist.slice(-150);
    const sj = statsJson(), rj = runJson();
    if (sj !== local.s) { local.s = sj; S.ts = Date.now(); }
    if (rj !== local.r) { local.r = rj; S.runTs = Date.now(); }
    writeLocal();
    scheduleRemote(false);
  }

  // ---------- Copie sur le compte Claude ----------
  let R = null, sync = "wait", busy = false, again = false, retried = false, syncTimer = null, lastPull = 0;
  const SYNC = {
    wait: "Connexion à ton compte…",
    account: "Ta progression est enregistrée sur ton compte Claude : ouvre ce lien dans n'importe quel navigateur ou appareil où tu es connecté pour la retrouver.",
    local: "Ta progression est enregistrée dans ce navigateur uniquement. Exporte-la pour la sauvegarder ou la transférer sur un autre appareil.",
  };
  function setSync(m) {
    sync = m;
    document.querySelectorAll("[data-sync]").forEach((el) => { el.textContent = SYNC[m]; });
  }
  const clone = (x) => JSON.parse(JSON.stringify(x));
  // Une session terminée = un document ; ses réponses sont gardées sous forme de texte compact.
  function encodeHist(h) {
    const o = {};
    Object.keys(h).forEach((k) => { if (k !== "items") o[k] = h[k]; });
    o.it = h.items.map(([u, a, m]) => u + "." + a + "." + m).join(",");
    return o;
  }
  function decodeHist(d) {
    const h = {};
    Object.keys(d).forEach((k) => { if (k !== "it") h[k] = d[k]; });
    h.items = String(d.it || "").split(",").filter(Boolean).map((x) => { const p = x.split("."); return [p[0], +p[1], +p[2]]; });
    return h;
  }
  function scheduleRemote(now) {
    if (!R) return;
    clearTimeout(syncTimer);
    if (now) flush(); else syncTimer = setTimeout(flush, 700);
  }
  async function flush() {
    if (!R) return;
    if (busy) { again = true; return; }
    busy = true;
    try {
      const sj = statsJson();
      if (sj !== R.s) { await R.stats.set(Object.assign({ v: 1, ts: S.ts }, JSON.parse(sj))); R.s = sj; }
      const rj = runJson();
      if (rj !== R.r) { await R.run.set({ v: 1, ts: S.runTs, run: JSON.parse(rj) }); R.r = rj; }
      const ids = new Set(S.hist.map((h) => h.id));
      for (const h of S.hist.slice()) if (!R.known.has(h.id)) { await R.hist.doc(h.id).set(encodeHist(h)); R.known.add(h.id); }
      for (const id of [...R.known]) if (!ids.has(id)) { await R.hist.doc(id).delete(); R.known.delete(id); }
      retried = false;
    } catch (e) {
      const code = e && e.code;
      if ((code === "unavailable" || code === "resource_exhausted") && !retried) { retried = true; setTimeout(flush, 1500 + Math.random() * 1500); }
      else { R = null; setSync("local"); }
    } finally {
      busy = false;
      if (again) { again = false; flush(); }
    }
  }
  // Relit le compte et fusionne : réponse la plus récente par question, union des sessions terminées,
  // session en cours et réglages les plus récents ; un « Tout effacer » fait ailleurs s'applique ici aussi.
  async function pull(refs) {
    const [ss, rs, hs] = await Promise.all([refs.stats.get(), refs.run.get(), refs.hist.limit(1000).get()]);
    let changed = false;
    const rd = ss.exists ? clone(ss.data()) : null;
    const remoteReset = rd ? num(rd.resetAt) : 0;
    if (remoteReset > S.resetAt) {
      S.resetAt = remoteReset;
      Object.keys(S.q).forEach((u) => { if (num(S.q[u][3]) < remoteReset) delete S.q[u]; });
      S.hist = S.hist.filter((h) => num(h.end) >= remoteReset);
      if (S.runTs < remoteReset) S.run = null;
      changed = true;
    }
    if (rd) {
      Object.entries(rd.q || {}).forEach(([u, v]) => {
        if (!BY_ID.has(u) || !Array.isArray(v) || num(v[3]) < S.resetAt) return;
        const cur = S.q[u];
        if (!cur || num(v[3]) > num(cur[3])) { S.q[u] = v; changed = true; }
      });
      if (num(rd.ts) > S.ts && rd.prefs && typeof rd.prefs === "object") { S.prefs = rd.prefs; changed = true; }
      S.ts = Math.max(S.ts, num(rd.ts));
    }
    const rr = rs.exists ? clone(rs.data()) : null;
    if (rr && num(rr.ts) > S.runTs && num(rr.ts) >= S.resetAt) {
      S.run = rr.run && Array.isArray(rr.run.items) ? rr.run : null;
      S.runTs = num(rr.ts);
      changed = true;
    }
    const known = new Set(), have = new Set(S.hist.map((h) => h.id));
    hs.docs.forEach((d) => {
      known.add(d.id);
      const h = decodeHist(clone(d.data()));
      if (!have.has(h.id) && h.items.length && num(h.end) >= S.resetAt) { S.hist.push(h); have.add(h.id); changed = true; }
    });
    if (changed) {
      S.hist.sort((a, b) => a.date - b.date);
      if (S.hist.length > 150) S.hist = S.hist.slice(-150);
      local.s = statsJson(); local.r = runJson();
      writeLocal();
    }
    return {
      known,
      s: rd ? canon({ q: rd.q || {}, prefs: rd.prefs || {}, resetAt: num(rd.resetAt) }) : null,
      r: rr ? canon(rr.run && Array.isArray(rr.run.items) ? rr.run : null) : null,
      changed,
    };
  }
  function refreshView() {
    if (location.hash === "#banque" || $modal.innerHTML) return; // ne pas perdre une saisie en cours
    route(true);
  }
  async function connect() {
    const c = window.claude;
    if (!c || typeof c.use !== "function") { setSync("local"); return; }
    let db = null, user = null, uid = null;
    try { [db, user] = await Promise.all([c.use("db"), c.use("user")]); uid = user ? await user.id() : null; } catch (e) { /* capacité absente */ }
    if (!db || !uid) { setSync("local"); return; }
    try {
      const base = "data/users/" + uid;
      const refs = { stats: db.doc(base + "/stats"), run: db.doc(base + "/run"), hist: db.doc(base + "/hist").collection("items") };
      const got = await pull(refs);
      R = Object.assign(refs, { known: got.known, s: got.s, r: got.r });
      lastPull = Date.now();
      setSync("account");
      if (got.changed) refreshView();
      scheduleRemote(true); // envoie ce que ce navigateur avait en plus (première ouverture, hors ligne…)
    } catch (e) { R = null; setSync("local"); }
  }
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "hidden") { scheduleRemote(true); return; }
    if (!R || busy || Date.now() - lastPull < 15000) return;
    lastPull = Date.now();
    try {
      const got = await pull(R);
      R.known = got.known;
      if (got.s) R.s = got.s;
      if (got.r) R.r = got.r;
      if (got.changed) refreshView();
      scheduleRemote(true);
    } catch (e) { /* nouvel essai au prochain retour sur la page */ }
  });
  window.addEventListener("pagehide", () => scheduleRemote(true));
  const st = (u) => S.q[u];
  const isOk = (u) => !!(S.q[u] && S.q[u][2] === 1);
  const isKo = (u) => !!(S.q[u] && S.q[u][2] === 0);
  function rec(u, ok) {
    const s = S.q[u] || [0, 0, 0, 0];
    s[0]++; if (ok) s[1]++; s[2] = ok ? 1 : 0; s[3] = Date.now();
    S.q[u] = s;
  }

  // ---------- Outils ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const escBr = (s) => esc(s).replace(/\n/g, "<br>");
  const nf = (n) => Number(n).toLocaleString("fr-FR");
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sample = (a, n) => shuffle(a).slice(0, n);
  function fmtDate(t) {
    try { return new Date(t).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return new Date(t).toISOString().slice(0, 16).replace("T", " "); }
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : String(m)) + ":" + String(s).padStart(2, "0");
  }
  const meter = (v, cls) => `<div class="meter ${cls || (v >= 80 ? "ok" : "")}"><i style="width:${Math.max(0, Math.min(100, v))}%"></i></div>`;
  const catBadge = (k) => `<span class="cat cat-${k}" title="Catégorie ${k}">${k}</span>`;
  const weight = (t) => { const w = TW[t]; return [w.A ? `${w.A} A` : "", w.C ? `${w.C} C` : ""].filter(Boolean).join(" + "); };
  const themeMastery = (t) => { const l = BY_THEME[t]; return pct(l.filter((q) => isOk(q.i)).length, l.length); };
  const stCls = (u) => (isOk(u) ? "s-ok" : isKo(u) ? "s-ko" : "");
  const flagTag = (q) => (q.f ? `<span class="tag t-${FLAG[q.f][1]}">${FLAG[q.f][0]}</span>` : "");
  const REF_RE = /(les deux|aucune|toutes les|tous les|ci-dessus|précédent|réponses? [abc]\b|\b[abc] et [abc]\b|ni l'une|ni l'un|l'une et l'autre|les trois|les 3\b|\b1 et 2\b|\b2 et 3\b)/i;
  const canShuffle = (q) => !q.c.some((c) => REF_RE.test(c));

  // ---------- Thème jour / nuit ----------
  const $toggle = document.querySelector(".theme-toggle");
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function isDark() { const t = document.documentElement.getAttribute("data-theme"); return t ? t === "dark" : !!(mq && mq.matches); }
  function syncTheme() {
    const d = isDark();
    $toggle.classList.toggle("is-dark", d);
    $toggle.setAttribute("aria-label", d ? "Passer en mode jour" : "Passer en mode nuit");
  }
  function toggleTheme() {
    const next = isDark() ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("amf.theme", next); } catch (e) { /* stockage indisponible */ }
    syncTheme();
  }
  if (mq && mq.addEventListener) mq.addEventListener("change", syncTheme);
  syncTheme();

  // ---------- Fenêtres modales ----------
  function openModal(html) {
    $modal.innerHTML = `<div class="overlay" data-action="close-modal-bg"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
    const f = $modal.querySelector("[autofocus], .modal button");
    if (f) f.focus();
  }
  function closeModal() { $modal.innerHTML = ""; }
  let onConfirm = null;
  function confirmBox(title, text, yes, fn, danger) {
    onConfirm = fn;
    openModal(`<div class="modal-head"><h3>${title}</h3></div><p>${text}</p>
      <div class="row" style="justify-content:flex-end"><button class="btn" data-action="close-modal">Annuler</button>
      <button class="btn ${danger ? "danger" : "primary"}" data-action="confirm-yes" autofocus>${yes}</button></div>`);
  }
  function showQuestion(u) {
    const q = BY_ID.get(u);
    if (!q) return;
    openModal(`<div class="modal-head"><span class="qmeta"><span class="mono">Q${esc(q.i)}</span> · §${q.s} ${catBadge(q.k)} ${flagTag(q)}</span>
      <button class="icon-btn" data-action="close-modal" aria-label="Fermer">✕</button></div>
      <p class="qtext">${escBr(q.q)}</p>
      <div class="reveal-box">${choicesList(q, null, false)}</div>
      <div class="row"><button class="btn primary" data-action="reveal" autofocus>Afficher la réponse</button></div>`);
  }
  function choicesList(q, chosen, show) {
    return `<div class="ritem" style="border:0;padding:0"><ol>${q.c.map((c, i) => {
      const cls = show && i === q.a ? "good" : show && i === chosen ? "bad" : "";
      return `<li class="${cls}"><span class="l">${LET[i]}</span><span>${escBr(c)}</span></li>`;
    }).join("")}</ol></div>`;
  }
  function explainHtml(q, letterOf, chosen) {
    let h = '<div class="explain">';
    if (chosen !== undefined && chosen !== null) {
      h += chosen === q.a ? '<p class="verdict ok">Bonne réponse</p>'
        : chosen < 0 ? '<p class="verdict ko">Sans réponse</p>' : '<p class="verdict ko">Mauvaise réponse</p>';
    }
    h += `<p><b>Réponse attendue : ${letterOf(q.a)}</b> — ${escBr(q.c[q.a])}</p>`;
    if (q.b) h += `<p class="small muted">La base Excel indique ${q.b === "?" ? "aucune réponse" : "« " + q.b + " »"} : réponse corrigée (voir l'annexe A).</p>`;
    if (q.j) h += `<p><b>Source :</b> ${esc(q.j)}</p>`;
    if (q.f) h += `<p class="alert ${q.f === "err" || q.f === "abs" ? "err" : ""}">${flagTag(q)} ${esc(q.n)}</p>`;
    h += `<p><a href="#" data-action="lesson" data-l="${q.l}" data-sub="${q.s}">Revoir la leçon §${q.s} — ${esc(SUB[q.s].label)}</a></p></div>`;
    return h;
  }

  // ---------- Routeur ----------
  let timer = null, pendingScroll = null;
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function setNav(h) {
    const top = h.startsWith("cours") || h.startsWith("annexe") || h === "guide" ? "cours"
      : h === "session" ? (S.run && S.run.kind === "exam" ? "examen" : "quiz")
      : h.startsWith("bilan-") ? ((S.hist.find((x) => "bilan-" + x.id === h) || {}).kind === "exam" ? "examen" : "resultats") : h;
    document.querySelectorAll(".nav a").forEach((a) => {
      if (a.dataset.nav === top) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }
  function route(keep) {
    stopTimer();
    if (!keep) closeModal();
    document.body.classList.remove("in-session");
    const h = location.hash.replace(/^#/, "") || "accueil";
    let m;
    if (h === "cours") viewCourses();
    else if ((m = h.match(/^cours-(\d\d)$/))) viewLesson(m[1]);
    else if ((m = h.match(/^annexe-([A-D])$/))) viewDoc("annexe", m[1]);
    else if (h === "guide") viewDoc("guide");
    else if (h === "quiz") viewQuiz();
    else if (h === "examen") viewExam();
    else if (h === "session") viewSession();
    else if ((m = h.match(/^bilan-([a-z0-9]+)$/))) viewBilan(m[1]);
    else if (h === "banque") viewBank();
    else if (h === "resultats") viewResults();
    else viewHome();
    setNav(h);
    if (pendingScroll) {
      const el = document.getElementById(pendingScroll);
      pendingScroll = null;
      if (el) { el.scrollIntoView(); return; }
    }
    if (!keep) window.scrollTo(0, 0);
  }
  function go(h) { if (location.hash === "#" + h) route(); else location.hash = h; }
  window.addEventListener("hashchange", () => route());

  // ---------- Accueil ----------
  function runBanner() {
    const r = S.run;
    if (!r) return "";
    const done = r.items.filter((it) => it.a >= 0).length;
    const left = r.endsAt ? ` · ${fmtDur((r.endsAt - Date.now()) / 1000)} restantes` : "";
    return `<div class="banner"><p><b>Session en cours :</b> ${esc(r.label)} — ${done}/${r.items.length} réponses${left}</p>
      <div class="row"><button class="btn primary small" data-action="resume">Reprendre</button>
      <button class="btn small danger" data-action="abandon">Abandonner</button></div></div>`;
  }
  function viewHome() {
    const ko = QS.filter((q) => isKo(q.i)).length;
    const seen = QS.filter((q) => st(q.i)).length;
    const exams = S.hist.filter((h) => h.kind === "exam");
    const last = exams.slice(-3).reverse();
    $app.innerHTML = `<div class="page">
      ${runBanner()}
      <section class="hero">
        <div class="page-head">
          <span class="eyebrow">Certification AMF · examen général</span>
          <h1>Prépare l'examen avec les ${nf(QS.length)} questions de ta base</h1>
          <p class="lead">Les leçons des 12 thèmes, des quiz ciblés et des examens blancs tirés au hasard à chaque fois, en respectant la grille de l'AMF.</p>
        </div>
        <div class="format">
          <div><span class="big">120</span><span class="lbl">questions à 3 choix</span></div>
          <div><span class="big">2 h</span><span class="lbl">au maximum</span></div>
          <div><span class="big">27<small>/33</small></span><span class="lbl">catégorie A (réglementaire)</span></div>
          <div><span class="big">70<small>/87</small></span><span class="lbl">catégorie C (culture financière)</span></div>
        </div>
      </section>
      <section class="grid-3">
        <div class="panel"><span class="eyebrow">Examen blanc</span><h3>120 questions, conditions réelles</h3>
          <p>Tirage aléatoire par sous-thème selon la grille, chronomètre de 2 h, correction à la fin avec le seuil de 80 % en A et en C.</p>
          <div class="row"><a class="btn primary" href="#examen">Préparer un examen blanc</a></div></div>
        <div class="panel"><span class="eyebrow">Quiz</span><h3>S'entraîner par thème</h3>
          <p>Choisis les thèmes, le nombre de questions et le mode : correction immédiate avec explication, ou à la fin.</p>
          <div class="row"><button class="btn" data-action="quick-quiz">Quiz rapide (20)</button><a class="btn ghost" href="#quiz">Configurer</a></div></div>
        <div class="panel"><span class="eyebrow">À revoir</span><h3>${ko ? nf(ko) + " question" + (ko > 1 ? "s" : "") + " ratée" + (ko > 1 ? "s" : "") : "Aucune erreur en attente"}</h3>
          <p>${ko ? "Les questions dont ta dernière réponse était fausse. Repasse-les jusqu'à les réussir." : "Les questions que tu rates s'ajoutent ici automatiquement."}</p>
          <div class="row"><button class="btn" data-action="review-ko" ${ko ? "" : "disabled"}>Réviser mes erreurs</button></div></div>
      </section>
      <section class="section">
        <div class="row" style="justify-content:space-between"><h2>Progression par thème</h2>
          <span class="muted small">${nf(seen)} questions travaillées sur ${nf(QS.length)}</span></div>
        <div class="themes-list">${THEMES.map((t) => {
          const m = themeMastery(t.n);
          return `<div class="theme-row home"><span class="n">${t.n}</span>
            <a class="t" href="#cours-${t.id}" style="text-decoration:none;color:inherit">${esc(SHORT[t.n])}<small>${weight(t.n)} à l'examen · ${BY_THEME[t.n].length} questions</small></a>
            <span class="m">${meter(m)}<span class="num">${m} %</span></span>
            <span class="w"><a class="btn small ghost" href="#cours-${t.id}">Leçon</a></span>
            <span class="act"><button class="btn small" data-action="quiz-theme" data-t="${t.n}">Quiz</button></span></div>`;
        }).join("")}</div>
        <p class="footer-note">Maîtrise = part des questions du thème dont ta dernière réponse est juste.</p>
        <p class="footer-note" data-sync>${SYNC[sync]}</p>
      </section>
      ${last.length ? `<section class="section"><h2>Derniers examens blancs</h2>${histTable(last)}</section>` : ""}
    </div>`;
  }

  // ---------- Cours ----------
  function viewCourses() {
    $app.innerHTML = `<div class="page">
      <div class="page-head"><span class="eyebrow">Manuel de révision</span><h1>Cours</h1>
        <p>Les 12 thèmes de la grille, dans l'ordre. Chaque leçon se termine par une fiche flash et renvoie, sous-thème par sous-thème, aux questions de la base.</p></div>
      <div class="themes-list">${THEMES.map((t) => {
        const m = themeMastery(t.n);
        return `<a class="theme-row" href="#cours-${t.id}"><span class="n">${t.n}</span>
          <span class="t">${esc(t.title)}<small>${BY_THEME[t.n].length} questions dans la base</small></span>
          <span class="w">${TW[t.n].A ? catBadge("A") + " " + TW[t.n].A : ""} ${TW[t.n].C ? catBadge("C") + " " + TW[t.n].C : ""}</span>
          <span class="m">${meter(m)}<span class="num">${m} %</span></span><span class="act"></span></a>`;
      }).join("")}</div>
      <section class="section"><h2>Annexes</h2><div class="annex-grid">
        ${COURS.annexes.map((a) => `<a class="panel annex-card" href="#annexe-${a.id}"><span class="eyebrow">Annexe ${a.id}</span><h3>${esc(a.title)}</h3><p class="small">${ANNEX_DESC[a.id] || ""}</p></a>`).join("")}
        <a class="panel annex-card" href="#guide"><span class="eyebrow">Guide</span><h3>Méthode et limites du manuel</h3><p class="small">Format de l'examen, ce qui a été vérifié, méthode de révision, réflexes de QCM.</p></a>
      </div></section></div>`;
  }
  function tocHtml(toc) { return toc.map((e) => `<a href="#" data-action="scrollto" data-id="${e.id}">${esc(e.t)}</a>`).join(""); }
  function viewLesson(id) {
    const i = COURS.lessons.findIndex((l) => l.id === id);
    if (i < 0) return viewCourses();
    const l = COURS.lessons[i], prev = COURS.lessons[i - 1], next = COURS.lessons[i + 1];
    const m = themeMastery(l.n);
    $app.innerHTML = `<div class="lesson-layout">
      <aside class="toc"><span class="eyebrow">Thème ${l.n}</span>${tocHtml(l.toc)}</aside>
      <div>
        <div class="lesson-head"><span class="eyebrow">Thème ${l.n} · ${weight(l.n)} à l'examen · ${BY_THEME[l.n].length} questions dans la base</span>
          <h1>${esc(l.title)}</h1>
          <div class="row"><button class="btn primary" data-action="quiz-theme" data-t="${l.n}">Quiz sur ce thème</button>
          <span class="muted small">Maîtrise : ${m} %</span></div></div>
        <details class="toc-mobile"><summary>Sommaire de la leçon</summary><nav>${tocHtml(l.toc)}</nav></details>
        <article class="prose">${l.html}</article>
        <nav class="lesson-nav">${prev ? `<a class="btn" href="#cours-${prev.id}">← Thème ${prev.n}</a>` : "<span></span>"}
          ${next ? `<a class="btn" href="#cours-${next.id}">Thème ${next.n} →</a>` : `<a class="btn" href="#annexe-A">Annexes →</a>`}</nav>
      </div></div>`;
    fillIds($app);
    if (pendingScroll && pendingScroll.startsWith("sub:")) {
      const sub = pendingScroll.slice(4);
      const e = l.toc.find((x) => x.t.startsWith(sub + " "));
      pendingScroll = e ? e.id : null;
    }
  }
  function viewDoc(kind, id) {
    let doc, title, eyebrow;
    if (kind === "guide") { doc = COURS.guide; title = "Méthode et limites du manuel"; eyebrow = "Guide"; }
    else {
      doc = COURS.annexes.find((a) => a.id === id);
      if (!doc) return viewCourses();
      title = doc.title; eyebrow = "Annexe " + id;
    }
    const idx = COURS.annexes.findIndex((a) => a.id === id);
    const prev = COURS.annexes[idx - 1], next = COURS.annexes[idx + 1];
    $app.innerHTML = `<div class="lesson-layout">
      <aside class="toc"><span class="eyebrow">${eyebrow}</span>${tocHtml(doc.toc)}</aside>
      <div><div class="lesson-head"><span class="eyebrow">${eyebrow}</span><h1>${esc(title)}</h1></div>
        ${doc.toc.length > 2 ? `<details class="toc-mobile"><summary>Sommaire</summary><nav>${tocHtml(doc.toc)}</nav></details>` : ""}
        <article class="prose">${doc.html}</article>
        <nav class="lesson-nav">${kind === "annexe" && prev ? `<a class="btn" href="#annexe-${prev.id}">← Annexe ${prev.id}</a>` : `<a class="btn" href="#cours">← Cours</a>`}
          ${kind === "annexe" && next ? `<a class="btn" href="#annexe-${next.id}">Annexe ${next.id} →</a>` : "<span></span>"}</nav>
      </div></div>`;
  }
  function fillIds(root) {
    root.querySelectorAll(".ids").forEach((box) => {
      const sub = box.dataset.sub, s = SUB[sub], list = BY_SUB[sub] || [];
      const ok = list.filter((q) => isOk(q.i)).length;
      box.innerHTML = `<div class="ids-head"><b>Questions de la base · §${sub}</b>
        <span>${list.length} questions · ${s.n} à l'examen en catégorie ${s.k} · ${ok} maîtrisées</span></div>
        <div class="row"><button class="btn small primary" data-action="quiz-sub" data-sub="${sub}" data-n="10">Quiz de 10 questions</button>
        <button class="btn small" data-action="quiz-sub" data-sub="${sub}" data-n="all">Toutes (${list.length})</button>
        <button class="btn small ghost" data-action="bank-sub" data-sub="${sub}">Voir dans la banque</button></div>
        <details><summary>Numéros des questions (vert : réussie, rouge : ratée, point : note de l'annexe A)</summary>
        <div class="ids-list">${list.map((q) => `<a href="#" class="qref ${stCls(q.i)} ${q.f ? "flag" : ""}" data-q="${q.i}">${q.i}</a>`).join("")}</div></details>`;
    });
  }

  // ---------- Création des sessions ----------
  function startRun(kind, qs, o) {
    const make = () => {
      S.run = {
        id: Date.now().toString(36), kind, label: o.label, mode: o.mode, started: Date.now(),
        endsAt: o.timed ? Date.now() + EXAM.dur * 1000 : 0, cur: 0,
        items: qs.map((q) => ({ u: q.i, o: o.shuffle && canShuffle(q) ? shuffle([0, 1, 2]) : [0, 1, 2], a: -1, m: 0, r: 0 })),
      };
      save();
      go("session");
    };
    if (S.run) confirmBox("Remplacer la session en cours ?", `« ${esc(S.run.label)} » n'est pas terminée. Elle sera abandonnée sans être comptée.`, "Remplacer", make, true);
    else make();
  }
  function quizFrom(qs, n, label, extra) {
    const p = quizPrefs();
    const pick = n === "all" ? shuffle(qs) : sample(qs, Math.min(n, qs.length));
    if (!pick.length) return;
    startRun("quiz", pick, Object.assign({ label, mode: p.mode, shuffle: p.shuffle }, extra || {}));
  }
  function buildExam(o) {
    let items = [];
    SUBS.forEach((s) => {
      const pool = BY_SUB[s.s].filter((q) => !(o.noObs && q.f === "obs"));
      items = items.concat(sample(pool, s.n));
    });
    if (o.order === "mix") items = shuffle(items);
    return items;
  }

  // ---------- Quiz : configuration ----------
  function quizPrefs() {
    const d = { themes: THEMES.map((t) => t.n), subs: [], n: 20, pool: "all", cat: "all", mode: "learn", shuffle: true };
    S.prefs.quiz = Object.assign(d, S.prefs.quiz || {});
    return S.prefs.quiz;
  }
  const POOLS = [["all", "Toutes"], ["new", "Jamais vues"], ["todo", "Non maîtrisées"], ["ko", "Ratées"], ["flag", "À risque (annexe A)"], ["recent", "Récentes (n° ≥ 2553)"]];
  function poolFilter(kind) {
    return { all: () => true, new: (q) => !st(q.i), todo: (q) => !isOk(q.i), ko: (q) => isKo(q.i), flag: (q) => !!q.f, recent: (q) => q.o === 1 }[kind] || (() => true);
  }
  function quizPool(p) {
    const th = new Set(p.themes), bySub = {};
    (p.subs || []).forEach((s) => { const t = SUB[s] && SUB[s].t; if (t && th.has(t)) (bySub[t] = bySub[t] || new Set()).add(s); });
    const pf = poolFilter(p.pool);
    return QS.filter((q) => th.has(q.t) && (!bySub[q.t] || bySub[q.t].has(q.s)) && (p.cat === "all" || q.k === p.cat) && pf(q));
  }
  function quizLabel(p) {
    const parts = [];
    if (p.themes.length === THEMES.length) parts.push("tous les thèmes");
    else if (p.themes.length === 1) parts.push("thème " + p.themes[0]);
    else parts.push(p.themes.length + " thèmes");
    const subs = (p.subs || []).filter((s) => p.themes.includes(SUB[s].t));
    if (subs.length) parts.push(subs.length === 1 ? "§" + subs[0] : subs.length + " sous-thèmes");
    if (p.cat !== "all") parts.push("catégorie " + p.cat);
    if (p.pool !== "all") parts.push(POOLS.find((x) => x[0] === p.pool)[1].toLowerCase());
    return "Quiz · " + parts.join(" · ");
  }
  const seg = (name, val, opts) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button type="button" data-action="pref" data-k="${name}" data-v="${v}" aria-pressed="${String(v) === String(val)}">${l}</button>`).join("")}</div>`;
  function viewQuiz() {
    const p = quizPrefs();
    const pool = quizPool(p);
    const n = p.n === "all" ? pool.length : Math.min(p.n, pool.length);
    const selThemes = THEMES.filter((t) => p.themes.includes(t.n));
    $app.innerHTML = `<div class="page">
      ${runBanner()}
      <div class="page-head"><span class="eyebrow">Entraînement</span><h1>Quiz</h1>
        <p>Les questions sont tirées au hasard dans la base fusionnée à chaque nouveau quiz.</p></div>
      <div class="config">
        <div class="config-main">
          <div class="field"><div class="row" style="justify-content:space-between"><span class="label">Thèmes</span>
            <span class="row"><button class="btn small ghost" data-action="themes-all">Tous</button><button class="btn small ghost" data-action="themes-none">Aucun</button></span></div>
            <div class="chips">${THEMES.map((t) => `<button type="button" class="chip" data-action="toggle-theme" data-t="${t.n}" aria-pressed="${p.themes.includes(t.n)}"><span class="num">${t.n}</span>${esc(SHORT[t.n])}</button>`).join("")}</div>
          </div>
          ${selThemes.length ? `<details class="more" ${p.subs.length ? "open" : ""}><summary>Affiner par sous-thème${p.subs.length ? ` (${p.subs.length} choisi${p.subs.length > 1 ? "s" : ""})` : ""}</summary>
            ${selThemes.map((t) => `<div class="sub-group"><h4>Thème ${t.n} — ${esc(SHORT[t.n])}</h4><div class="chips">${SUBS.filter((s) => s.t === t.n).map((s) => `<button type="button" class="chip" data-action="toggle-sub" data-s="${s.s}" aria-pressed="${p.subs.includes(s.s)}"><span class="num">§${s.s}</span>${esc(s.label)} <span class="num">${s.bank}</span></button>`).join("")}</div></div>`).join("")}
            <p class="footer-note">Sans sous-thème choisi, tout le thème est pris en compte.</p></details>` : ""}
          <div class="field"><span class="label">Nombre de questions</span>${seg("n", p.n, [[10, "10"], [20, "20"], [40, "40"], [60, "60"], [120, "120"], ["all", "Toutes"]])}</div>
          <div class="field"><span class="label">Questions à inclure</span>${seg("pool", p.pool, POOLS)}</div>
          <div class="field"><span class="label">Catégorie</span>${seg("cat", p.cat, [["all", "A et C"], ["A", "A seulement"], ["C", "C seulement"]])}</div>
          <div class="field"><span class="label">Correction</span>${seg("mode", p.mode, [["learn", "Après chaque question"], ["test", "À la fin"]])}</div>
          <label class="check"><input type="checkbox" data-action="pref-check" data-k="shuffle" ${p.shuffle ? "checked" : ""}> Mélanger l'ordre des réponses (sauf quand une réponse renvoie aux autres)</label>
        </div>
        <aside class="config-side panel">
          <span class="eyebrow">Ton quiz</span>
          <span class="summary-count">${nf(n)}</span>
          <p class="small">question${n > 1 ? "s" : ""} tirée${n > 1 ? "s" : ""} au hasard parmi <b>${nf(pool.length)}</b> correspondant à tes critères.</p>
          <button class="btn primary" data-action="start-quiz" ${n ? "" : "disabled"}>Générer le quiz</button>
          <p class="footer-note">${p.mode === "learn" ? "Correction et explication juste après chaque réponse." : "Correction complète à la fin, comme à l'examen."}</p>
        </aside>
      </div></div>`;
  }

  // ---------- Examen blanc : configuration ----------
  function examPrefs() {
    S.prefs.exam = Object.assign({ order: "theme", shuffle: true, timed: true, noObs: false }, S.prefs.exam || {});
    return S.prefs.exam;
  }
  function viewExam() {
    const p = examPrefs();
    const rows = THEMES.map((t) => `<tr><td>${t.n}. ${esc(SHORT[t.n])}</td><td class="r">${TW[t.n].A || "–"}</td><td class="r">${TW[t.n].C || "–"}</td><td class="r">${TW[t.n].A + TW[t.n].C}</td></tr>`).join("");
    $app.innerHTML = `<div class="page">
      ${runBanner()}
      <div class="page-head"><span class="eyebrow">Conditions réelles</span><h1>Examen blanc</h1>
        <p>120 questions tirées au hasard dans la base, sous-thème par sous-thème, selon la répartition de la grille de l'AMF. Chaque nouvel examen est un nouveau tirage.</p></div>
      <div class="config">
        <div class="config-main">
          <div class="table-scroll"><table class="dist"><thead><tr><th>Thème</th><th class="r">Cat. A</th><th class="r">Cat. C</th><th class="r">Total</th></tr></thead>
            <tbody>${rows}</tbody><tfoot><tr><td>Total</td><td class="r">33</td><td class="r">87</td><td class="r">120</td></tr></tfoot></table></div>
          <details class="more"><summary>Détail par sous-thème</summary><div class="table-scroll"><table class="dist"><thead><tr><th>Sous-thème</th><th class="r">Cat.</th><th class="r">À l'examen</th><th class="r">Dans la base</th></tr></thead>
            <tbody>${SUBS.map((s) => `<tr><td>§${s.s} ${esc(s.label)}</td><td class="r">${s.k}</td><td class="r">${s.n}</td><td class="r">${s.bank}</td></tr>`).join("")}</tbody></table></div></details>
          <div class="field"><span class="label">Ordre des questions</span>${seg("e-order", p.order, [["theme", "Dans l'ordre des thèmes"], ["mix", "Mélangées"]])}</div>
          <label class="check"><input type="checkbox" data-action="pref-check" data-k="e-shuffle" ${p.shuffle ? "checked" : ""}> Mélanger l'ordre des réponses</label>
          <label class="check"><input type="checkbox" data-action="pref-check" data-k="e-timed" ${p.timed ? "checked" : ""}> Chronomètre de 2 heures (correction automatique à la fin du temps)</label>
          <label class="check"><input type="checkbox" data-action="pref-check" data-k="e-noObs" ${p.noObs ? "checked" : ""}> Exclure les 43 questions à réponse dépassée par la réglementation</label>
        </div>
        <aside class="config-side panel">
          <span class="eyebrow">Pour réussir</span>
          <div class="scores" style="grid-template-columns:1fr 1fr">
            <div class="score"><span class="lbl">Catégorie ${catBadge("A")}</span><span class="val">27<small>/33</small></span></div>
            <div class="score"><span class="lbl">Catégorie ${catBadge("C")}</span><span class="val">70<small>/87</small></span></div>
          </div>
          <p class="small">80 % de bonnes réponses dans <b>chaque</b> catégorie, sans compensation entre A et C.</p>
          <button class="btn primary" data-action="start-exam">Commencer l'examen blanc</button>
          <p class="footer-note">Le chronomètre continue si tu quittes la page : la session reprend où tu l'as laissée.</p>
        </aside>
      </div></div>`;
  }

  // ---------- Session ----------
  let gridOpen = false, finishAsk = false;
  function letterIn(it) { return (orig) => LET[it.o.indexOf(orig)]; }
  function viewSession() {
    const r = S.run;
    if (!r) { location.hash = "accueil"; return; }
    if (r.endsAt && Date.now() >= r.endsAt) { finish(true); return; }
    document.body.classList.add("in-session");
    r.cur = Math.max(0, Math.min(r.cur || 0, r.items.length - 1));
    const it = r.items[r.cur], q = BY_ID.get(it.u);
    const learn = r.mode === "learn", reveal = learn && it.a >= 0;
    const done = r.items.filter((x) => x.a >= 0).length;
    const n = r.items.length, last = r.cur === n - 1;
    const exam = r.kind === "exam";
    const meta = exam ? `<span class="mono">Question ${r.cur + 1}</span>`
      : `<span class="mono">Q${esc(q.i)}</span> · <span>§${q.s} ${esc(SUB[q.s].label)}</span> ${catBadge(q.k)}`;
    const choices = it.o.map((orig, d) => {
      let cls = "", res = "";
      if (reveal) {
        if (orig === q.a) { cls = "is-ok"; res = "Bonne réponse"; }
        else if (orig === it.a) { cls = "is-ko"; res = "Ta réponse"; }
      }
      return `<button type="button" class="choice ${cls}" data-action="answer" data-d="${d}" aria-pressed="${!reveal && it.a === orig}" ${reveal ? "disabled" : ""}>
        <span class="l">${LET[d]}</span><span class="txt">${escBr(q.c[orig])}</span><span class="res">${res}</span></button>`;
    }).join("");
    const unanswered = n - done;
    $app.innerHTML = `<div class="session">
      <div class="sbar"><span class="title">${esc(r.label)}</span><span class="pos">${r.cur + 1} / ${n}</span><span class="grow"></span>
        ${r.endsAt ? `<span class="timer" id="timer" title="Temps restant">${fmtDur((r.endsAt - Date.now()) / 1000)}</span>` : ""}
        <button class="btn small" data-action="toggle-grid" aria-expanded="${gridOpen}">Grille</button>
        <button class="btn small" data-action="finish-ask">Terminer</button>
        <button class="btn small ghost" data-action="leave">Quitter</button></div>
      <div class="progress" aria-hidden="true"><i style="width:${pct(done, n)}%"></i></div>
      ${finishAsk ? `<div class="banner"><p>${unanswered ? `<b>${unanswered} question${unanswered > 1 ? "s" : ""} sans réponse</b> (comptée${unanswered > 1 ? "s" : ""} fausse${unanswered > 1 ? "s" : ""}). ` : ""}Terminer et voir la correction ?</p>
        <div class="row"><button class="btn small" data-action="finish-cancel">Continuer</button><button class="btn small primary" data-action="finish">Terminer et corriger</button></div></div>` : ""}
      ${gridOpen ? `<div class="panel"><div class="navgrid">${r.items.map((x, i) => {
        let c = x.a >= 0 ? "answered" : "";
        if (learn && x.a >= 0) c = x.a === BY_ID.get(x.u).a ? "g-ok" : "g-ko";
        return `<button type="button" class="${c} ${x.m ? "marked" : ""} ${i === r.cur ? "current" : ""}" data-action="goto" data-i="${i}">${i + 1}</button>`;
      }).join("")}</div>
        <div class="legend"><span><i style="background:var(--accent-soft)"></i>répondue</span><span><i style="background:var(--mark);border-color:var(--mark)"></i>marquée</span><span><i></i>sans réponse</span>
        <span class="num">${done}/${n} réponses · ${r.items.filter((x) => x.m).length} marquées</span></div></div>` : ""}
      <article class="qcard">
        <div class="qmeta">${meta}</div>
        <p class="qtext">${escBr(q.q)}</p>
        <div class="choices" role="group" aria-label="Réponses">${choices}</div>
        ${reveal ? explainHtml(q, letterIn(it), it.a) : ""}
      </article>
      <div class="snav">
        <button class="btn" data-action="prev" ${r.cur ? "" : "disabled"}>← Précédente</button>
        <div class="mid">${learn ? "" : `<button class="btn ${it.m ? "mark-on" : ""}" data-action="mark" aria-pressed="${!!it.m}">${it.m ? "Marquée" : "Marquer pour revoir"}</button>`}</div>
        ${last ? `<button class="btn primary" data-action="finish-ask">Terminer</button>` : `<button class="btn primary" data-action="next">Suivante →</button>`}
      </div>
      <p class="keys"><kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> ou <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> répondre · <kbd>←</kbd> <kbd>→</kbd> naviguer${learn ? "" : " · <kbd>M</kbd> marquer"}</p>
    </div>`;
    if (r.endsAt) {
      timer = setInterval(() => {
        const left = (r.endsAt - Date.now()) / 1000;
        const el = document.getElementById("timer");
        if (left <= 0) { stopTimer(); finish(true); return; }
        if (el) { el.textContent = fmtDur(left); el.classList.toggle("low", left < 600); }
      }, 1000);
      const el = document.getElementById("timer");
      if (el) el.classList.toggle("low", (r.endsAt - Date.now()) / 1000 < 600);
    }
  }
  function rerenderSession(top) {
    stopTimer();
    viewSession();
    if (top) window.scrollTo(0, 0);
  }
  function answer(d) {
    const r = S.run; if (!r) return;
    const it = r.items[r.cur], q = BY_ID.get(it.u);
    if (r.mode === "learn" && it.a >= 0) return;
    it.a = it.o[d];
    if (r.mode === "learn") { rec(q.i, it.a === q.a); it.r = 1; }
    save();
    rerenderSession(false);
  }
  function move(delta) {
    const r = S.run; if (!r) return;
    const c = r.cur + delta;
    if (c < 0 || c >= r.items.length) return;
    r.cur = c; finishAsk = false; save(); rerenderSession(true);
  }
  function finish(timeout) {
    const r = S.run; if (!r) return;
    stopTimer();
    let ok = 0; const A = [0, 0], C = [0, 0];
    r.items.forEach((it) => {
      const q = BY_ID.get(it.u), good = it.a === q.a;
      if (good) ok++;
      const b = q.k === "A" ? A : C; b[1]++; if (good) b[0]++;
      if (r.mode === "learn") { if (!it.r && it.a >= 0) rec(q.i, good); }
      else if (it.a >= 0 || r.kind === "exam") rec(q.i, good);
    });
    const end = Date.now();
    const h = {
      id: r.id, kind: r.kind, label: r.label, mode: r.mode, date: r.started, end,
      dur: Math.round(((r.endsAt ? Math.min(end, r.endsAt) : end) - r.started) / 1000),
      n: r.items.length, ok, A, C, timeout: !!timeout,
      pass: r.kind === "exam" ? A[0] >= EXAM.minA && C[0] >= EXAM.minC : null,
      items: r.items.map((it) => [it.u, it.a, it.m ? 1 : 0]),
    };
    S.hist.push(h); S.run = null; finishAsk = false; gridOpen = false;
    save();
    reviewFilter = "ko";
    go("bilan-" + h.id);
  }

  // ---------- Bilan ----------
  let reviewFilter = "ko";
  function viewBilan(id) {
    const h = S.hist.find((x) => x.id === id);
    if (!h) { $app.innerHTML = '<div class="page"><p class="empty">Résultat introuvable sur cet appareil.</p></div>'; return; }
    const items = h.items.map(([u, a, m]) => ({ q: BY_ID.get(u), a, m })).filter((x) => x.q);
    const exam = h.kind === "exam";
    const wrong = items.filter((x) => x.a !== x.q.a);
    const reasons = [];
    if (exam && h.A[0] < EXAM.minA) reasons.push(`catégorie A : ${h.A[0]}/33, il en faut 27`);
    if (exam && h.C[0] < EXAM.minC) reasons.push(`catégorie C : ${h.C[0]}/87, il en faut 70`);
    const byTheme = {};
    items.forEach((x) => { const b = (byTheme[x.q.t] = byTheme[x.q.t] || [0, 0]); b[1]++; if (x.a === x.q.a) b[0]++; });
    const scoreBox = (k, b, min) => {
      const p = pct(b[0], b[1]);
      const need = exam ? min : Math.ceil(b[1] * 0.8);
      return `<div class="score"><span class="lbl"><span>Catégorie ${catBadge(k)}</span><span class="num">${p} %</span></span>
        <span class="val">${b[0]}<small>/${b[1]}</small></span>
        <div class="meter ${b[0] >= need ? "ok" : "ko"}"><i style="width:${p}%"></i><span class="seuil" style="left:80%"></span></div>
        <span class="note">${b[1] ? `Seuil : ${need}/${b[1]} (80 %)` : "Aucune question"}</span></div>`;
    };
    const list = reviewFilter === "all" ? items : reviewFilter === "marked" ? items.filter((x) => x.m) : wrong;
    const head = exam
      ? `<div class="verdict-box ${h.pass ? "pass" : "fail"}"><span class="eyebrow">Examen blanc · ${fmtDate(h.date)}${h.timeout ? " · temps écoulé" : ""}</span>
          <h1>${h.pass ? "Examen blanc réussi" : "Examen blanc échoué"}</h1>
          ${reasons.length ? `<p>${reasons.join(" ; ")}.</p>` : `<p>Tu dépasses 80 % dans les deux catégories. Vise au moins 90 % pour garder de la marge le jour J.</p>`}
          <div class="scores">${scoreBox("A", h.A, EXAM.minA)}${scoreBox("C", h.C, EXAM.minC)}
            <div class="score"><span class="lbl"><span>Total</span><span class="num">${pct(h.ok, h.n)} %</span></span><span class="val">${h.ok}<small>/${h.n}</small></span><span class="note">Durée : ${fmtDur(h.dur)}</span></div></div></div>`
      : `<div class="verdict-box ${pct(h.ok, h.n) >= 80 ? "pass" : "fail"}"><span class="eyebrow">${esc(h.label)} · ${fmtDate(h.date)}</span>
          <h1>${h.ok}/${h.n} bonnes réponses · ${pct(h.ok, h.n)} %</h1>
          <div class="scores">${h.A[1] ? scoreBox("A", h.A) : ""}${h.C[1] ? scoreBox("C", h.C) : ""}
            <div class="score"><span class="lbl"><span>Durée</span></span><span class="val">${fmtDur(h.dur)}</span><span class="note">${items.filter((x) => x.a < 0).length} sans réponse</span></div></div></div>`;
    $app.innerHTML = `<div class="page">
      ${head}
      <div class="row">${wrong.length ? `<button class="btn primary" data-action="redo-wrong" data-id="${h.id}">Réviser ces ${wrong.length} erreurs en quiz</button>` : ""}
        <button class="btn" data-action="${exam ? "start-exam" : "start-quiz"}">${exam ? "Nouvel examen blanc" : "Nouveau quiz avec les mêmes réglages"}</button>
        <a class="btn ghost" href="#resultats">Tous mes résultats</a></div>
      <section class="section"><h2>Par thème</h2>
        <div class="table-scroll"><table class="tbl"><thead><tr><th>Thème</th><th class="r">Bonnes</th><th class="r">%</th><th style="width:30%"></th></tr></thead><tbody>
        ${Object.keys(byTheme).sort((a, b) => a - b).map((t) => { const b = byTheme[t], p = pct(b[0], b[1]); return `<tr><td>${t}. ${esc(SHORT[t])}</td><td class="r">${b[0]}/${b[1]}</td><td class="r">${p} %</td><td>${meter(p, p >= 80 ? "ok" : "ko")}</td></tr>`; }).join("")}
        </tbody></table></div></section>
      <section class="section"><div class="row" style="justify-content:space-between"><h2>Correction</h2>
        ${seg("review", reviewFilter, [["ko", `Erreurs (${wrong.length})`], ["marked", `Marquées (${items.filter((x) => x.m).length})`], ["all", `Toutes (${items.length})`]])}</div>
        <div class="review">${list.length ? list.map((x) => reviewItem(x, items.indexOf(x) + 1)).join("") : '<p class="empty">Rien à afficher ici.</p>'}</div></section>
    </div>`;
  }
  function reviewItem(x, num) {
    const q = x.q, good = x.a === q.a;
    return `<div class="ritem ${good ? "ok" : "ko"}">
      <div class="qmeta"><span class="mono">${num}.</span> <a href="#" class="qref mono" data-q="${q.i}">Q${esc(q.i)}</a> · §${q.s} ${esc(SUB[q.s].label)} ${catBadge(q.k)} ${x.m ? '<span class="tag" style="color:var(--mark)">marquée</span>' : ""}</div>
      <p class="q">${escBr(q.q)}</p>
      <ol>${q.c.map((c, i) => `<li class="${i === q.a ? "good" : i === x.a ? "bad" : ""}"><span class="l">${LET[i]}</span><span>${escBr(c)}${i === x.a && i !== q.a ? " <b>(ta réponse)</b>" : ""}${i === q.a ? " <b>(bonne réponse)</b>" : ""}</span></li>`).join("")}</ol>
      ${x.a < 0 ? '<p class="small muted">Sans réponse.</p>' : ""}
      <div class="why">${q.j ? `<p><b>Source :</b> ${esc(q.j)}</p>` : ""}${q.f ? `<p>${flagTag(q)} ${esc(q.n)}</p>` : ""}
        <p><a href="#" data-action="lesson" data-l="${q.l}" data-sub="${q.s}">Revoir la leçon §${q.s}</a></p></div></div>`;
  }

  // ---------- Banque ----------
  const bank = { q: "", t: "", s: "", k: "", f: "", page: 0 };
  const PER = 25;
  let HAY = null;
  function bankList() {
    if (!HAY) HAY = new Map(QS.map((q) => [q.i, norm([q.i, q.q, q.c.join(" "), q.j, q.n || ""].join(" "))]));
    const raw = bank.q.trim();
    const idq = raw.match(/^q?(\d{1,4}[ab]?)$/i);
    const terms = norm(raw).split(/\s+/).filter(Boolean);
    const pf = bank.f ? poolFilter(bank.f) : () => true;
    return QS.filter((q) => {
      if (bank.t && q.t !== +bank.t) return false;
      if (bank.s && q.s !== bank.s) return false;
      if (bank.k && q.k !== bank.k) return false;
      if (!pf(q)) return false;
      if (idq) return q.i === idq[1].toLowerCase() || HAY.get(q.i).includes(norm(raw));
      return terms.every((w) => HAY.get(q.i).includes(w));
    });
  }
  function hl(html) {
    const terms = bank.q.trim().split(/\s+/).filter((w) => w.length >= 3 && !/^(amp|quot|#39)$/i.test(w));
    if (!terms.length || /^q?\d+[ab]?$/i.test(bank.q.trim())) return html;
    const re = new RegExp("(" + terms.map((w) => esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi");
    return html.replace(re, "<mark>$1</mark>");
  }
  function viewBank() {
    const subs = SUBS.filter((s) => !bank.t || s.t === +bank.t);
    $app.innerHTML = `<div class="page">
      <div class="page-head"><span class="eyebrow">Base fusionnée</span><h1>Banque de questions</h1>
        <p>Les ${nf(QS.length)} questions avec leur réponse, leur source et les notes du manuel. Ouvre une question pour voir la correction.</p></div>
      <div class="filters">
        <input class="input search" type="search" id="bank-q" placeholder="Rechercher un mot, un numéro (ex. 2670)…" value="${esc(bank.q)}" aria-label="Rechercher">
        <select class="input" data-bank="t" aria-label="Thème"><option value="">Tous les thèmes</option>${THEMES.map((t) => `<option value="${t.n}" ${+bank.t === t.n ? "selected" : ""}>${t.n}. ${esc(SHORT[t.n])}</option>`).join("")}</select>
        <select class="input" data-bank="s" aria-label="Sous-thème"><option value="">Tous les sous-thèmes</option>${subs.map((s) => `<option value="${s.s}" ${bank.s === s.s ? "selected" : ""}>§${s.s} ${esc(s.label)}</option>`).join("")}</select>
        <select class="input" data-bank="k" aria-label="Catégorie"><option value="">Catégories A et C</option><option value="A" ${bank.k === "A" ? "selected" : ""}>Catégorie A</option><option value="C" ${bank.k === "C" ? "selected" : ""}>Catégorie C</option></select>
        <select class="input" data-bank="f" aria-label="Sélection">${POOLS.map(([v, l]) => `<option value="${v === "all" ? "" : v}" ${bank.f === (v === "all" ? "" : v) ? "selected" : ""}>${v === "all" ? "Toutes les questions" : l}</option>`).join("")}</select>
      </div>
      <div id="bank-res"></div></div>`;
    renderBankResults();
    const inp = document.getElementById("bank-q");
    let t = null;
    inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { bank.q = inp.value; bank.page = 0; renderBankResults(); }, 180); });
  }
  function renderBankResults() {
    const res = bankList();
    const pages = Math.max(1, Math.ceil(res.length / PER));
    bank.page = Math.min(bank.page, pages - 1);
    const slice = res.slice(bank.page * PER, bank.page * PER + PER);
    const pager = pages > 1 ? `<div class="pager"><button class="btn small" data-action="bank-page" data-p="${bank.page - 1}" ${bank.page ? "" : "disabled"}>←</button>
      <span class="num small">Page ${bank.page + 1} / ${pages}</span><button class="btn small" data-action="bank-page" data-p="${bank.page + 1}" ${bank.page < pages - 1 ? "" : "disabled"}>→</button></div>` : "";
    document.getElementById("bank-res").innerHTML = `<div class="section">
      <div class="row" style="justify-content:space-between"><span class="muted">${nf(res.length)} question${res.length > 1 ? "s" : ""}</span>
        ${res.length ? `<button class="btn small primary" data-action="bank-quiz">Quiz sur cette sélection (${Math.min(20, res.length)} au hasard)</button>` : ""}</div>
      <div class="bank-list">${slice.map((q) => {
        const s = st(q.i);
        return `<details class="bitem"><summary><span class="id">Q${esc(q.i)}</span><span class="q">${hl(escBr(q.q))}</span>
          <span class="meta">§${q.s} ${esc(SUB[q.s].label)} ${catBadge(q.k)} ${flagTag(q)} ${q.o ? '<span class="tag">récente</span>' : ""}
          ${s ? `<span><span class="dot ${s[2] ? "ok" : "ko"}"></span> ${s[1]}/${s[0]} juste${s[1] > 1 ? "s" : ""}</span>` : ""}</span></summary>
          <div class="body">${choicesList(q, null, true)}${explainHtml(q, (i) => LET[i])}</div></details>`;
      }).join("") || '<p class="empty">Aucune question ne correspond.</p>'}</div>${pager}</div>`;
  }

  // ---------- Résultats ----------
  function histTable(list) {
    return `<div class="table-scroll"><table class="tbl"><thead><tr><th>Date</th><th>Session</th><th class="r">Score</th><th class="r">A</th><th class="r">C</th><th>Résultat</th></tr></thead><tbody>
      ${list.map((h) => `<tr class="click" data-action="open-bilan" data-id="${h.id}"><td class="num">${fmtDate(h.date)}</td><td>${esc(h.label)}</td>
        <td class="r">${h.ok}/${h.n}</td><td class="r">${h.A[1] ? h.A[0] + "/" + h.A[1] : "–"}</td><td class="r">${h.C[1] ? h.C[0] + "/" + h.C[1] : "–"}</td>
        <td>${h.kind === "exam" ? (h.pass ? '<span class="tag t-ok">réussi</span>' : '<span class="tag t-err">échoué</span>') : `<span class="num">${pct(h.ok, h.n)} %</span>`}</td></tr>`).join("")}
      </tbody></table></div>`;
  }
  function examChart(ex) {
    const W = 640, H = 220, L = 38, R = 12, T = 12, B = 28, w = W - L - R, h = H - T - B;
    const x = (i) => L + (ex.length === 1 ? w / 2 : (i * w) / (ex.length - 1));
    const y = (v) => T + h - (v / 100) * h;
    const line = (k) => ex.map((e, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(pct(e[k][0], e[k][1])).toFixed(1)}`).join("");
    let g = "";
    [0, 50, 80, 100].forEach((v) => { g += `<line class="${v === 80 ? "seuil" : "grid"}" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`; });
    ex.forEach((e, i) => { if (ex.length <= 12 || i % Math.ceil(ex.length / 12) === 0) g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${i + 1}</text>`; });
    const pts = (k, c) => ex.map((e, i) => `<circle class="${c}" cx="${x(i)}" cy="${y(pct(e[k][0], e[k][1]))}" r="3.5"/>`).join("");
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scores des examens blancs en catégories A et C">${g}
      <path class="la" d="${line("A")}"/><path class="lc" d="${line("C")}"/>${pts("A", "pa")}${pts("C", "pc")}</svg>
      <div class="legend"><span><i style="background:var(--cat-a);border-color:var(--cat-a)"></i>Catégorie A (%)</span><span><i style="background:var(--cat-c);border-color:var(--cat-c)"></i>Catégorie C (%)</span><span>Pointillés : seuil de 80 %</span></div>`;
  }
  let subSort = "grille";
  function viewResults() {
    const all = Object.values(S.q);
    const seen = QS.filter((q) => st(q.i)).length, mastered = QS.filter((q) => isOk(q.i)).length;
    const tot = all.reduce((a, s) => a + s[0], 0), good = all.reduce((a, s) => a + s[1], 0);
    const exams = S.hist.filter((h) => h.kind === "exam");
    let rows = SUBS.map((s) => {
      const l = BY_SUB[s.s], sn = l.filter((q) => st(q.i)).length, ok = l.filter((q) => isOk(q.i)).length;
      return { s, sn, ok, p: pct(ok, l.length) };
    });
    if (subSort === "faibles") rows = rows.slice().sort((a, b) => a.p - b.p || b.s.n - a.s.n);
    $app.innerHTML = `<div class="page">
      <div class="page-head"><span class="eyebrow">Suivi</span><h1>Résultats</h1>
        <p data-sync>${SYNC[sync]}</p></div>
      <div class="kpis">
        <div class="kpi"><span class="v">${nf(seen)}<small> / ${nf(QS.length)}</small></span><span class="l">questions travaillées</span></div>
        <div class="kpi"><span class="v">${nf(mastered)}</span><span class="l">maîtrisées (dernière réponse juste)</span></div>
        <div class="kpi"><span class="v">${pct(good, tot)} %</span><span class="l">de bonnes réponses (${nf(tot)} réponses)</span></div>
        <div class="kpi"><span class="v">${exams.length}</span><span class="l">examens blancs, dont ${exams.filter((e) => e.pass).length} réussis</span></div>
      </div>
      ${exams.length ? `<section class="section"><h2>Évolution aux examens blancs</h2><div class="panel">${examChart(exams.slice(-30))}</div></section>` : ""}
      <section class="section"><div class="row" style="justify-content:space-between"><h2>Maîtrise par sous-thème</h2>
        ${seg("subsort", subSort, [["grille", "Ordre de la grille"], ["faibles", "Points faibles d'abord"]])}</div>
        <div class="table-scroll"><table class="tbl"><thead><tr><th>Sous-thème</th><th class="r">Cat.</th><th class="r">À l'examen</th><th class="r">Vues</th><th class="r">Maîtrise</th><th></th><th></th></tr></thead><tbody>
        ${rows.map(({ s, sn, p }) => `<tr><td>§${s.s} ${esc(s.label)}</td><td class="r">${s.k}</td><td class="r">${s.n}</td><td class="r">${sn}/${s.bank}</td><td class="r">${p} %</td><td>${meter(p)}</td>
          <td><button class="btn small" data-action="quiz-sub" data-sub="${s.s}" data-n="10">Quiz</button></td></tr>`).join("")}
        </tbody></table></div></section>
      <section class="section"><h2>Historique</h2>${S.hist.length ? histTable(S.hist.slice().reverse()) : '<p class="empty">Aucune session terminée pour l\'instant.</p>'}</section>
      <section class="section"><h2>Sauvegarde</h2>
        <div class="row"><button class="btn" data-action="export">Exporter ma progression</button><button class="btn" data-action="import">Importer une sauvegarde</button>
        <button class="btn danger" data-action="reset">Tout effacer</button></div></section>
    </div>`;
  }
  function exportBox() {
    const data = JSON.stringify({ v: 1, exported: new Date().toISOString(), q: S.q, hist: S.hist });
    openModal(`<div class="modal-head"><h3>Exporter ma progression</h3><button class="icon-btn" data-action="close-modal" aria-label="Fermer">✕</button></div>
      <p class="small">Copie ce texte et garde-le (note, e-mail, fichier). Tu pourras le réimporter ici ou sur un autre appareil.</p>
      <textarea class="input" id="exp-data" readonly>${esc(data)}</textarea>
      <div class="row"><button class="btn primary" data-action="copy-export" autofocus>Copier</button><span class="small muted" id="copy-msg"></span></div>`);
  }
  function importBox() {
    openModal(`<div class="modal-head"><h3>Importer une sauvegarde</h3><button class="icon-btn" data-action="close-modal" aria-label="Fermer">✕</button></div>
      <p class="small">Colle le texte exporté ou choisis un fichier. Les données sont fusionnées avec ta progression actuelle.</p>
      <textarea class="input" id="imp-data" placeholder='{"v":1, …}'></textarea>
      <input type="file" id="imp-file" accept=".json,.txt,application/json,text/plain">
      <div class="row"><button class="btn primary" data-action="do-import">Importer</button><span class="small" id="imp-msg"></span></div>`);
    document.getElementById("imp-file").addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = () => { document.getElementById("imp-data").value = String(rd.result || ""); };
      rd.readAsText(f);
    });
  }
  function doImport() {
    const msg = document.getElementById("imp-msg");
    let d;
    try { d = normalize(JSON.parse(document.getElementById("imp-data").value)); }
    catch (e) { msg.textContent = "Texte illisible : vérifie que tu as tout copié."; msg.style.color = "var(--ko)"; return; }
    let nq = 0, nh = 0;
    Object.entries(d.q).forEach(([u, s]) => {
      if (!BY_ID.has(u) || !Array.isArray(s) || s.length < 4) return;
      const cur = S.q[u];
      if (!cur || (s[3] || 0) > (cur[3] || 0)) { S.q[u] = s; nq++; }
    });
    const ids = new Set(S.hist.map((h) => h.id));
    d.hist.forEach((h) => { if (!ids.has(h.id)) { S.hist.push(h); nh++; } });
    S.hist.sort((a, b) => a.date - b.date);
    save();
    closeModal();
    route();
    openModal(`<div class="modal-head"><h3>Import terminé</h3></div><p>${nq} questions et ${nh} sessions ajoutées ou mises à jour.</p>
      <div class="row" style="justify-content:flex-end"><button class="btn primary" data-action="close-modal" autofocus>OK</button></div>`);
  }

  // ---------- Actions ----------
  const A = {
    theme: toggleTheme,
    "close-modal": closeModal,
    "close-modal-bg": (el, e) => { if (e.target === el) closeModal(); },
    "confirm-yes": () => { const f = onConfirm; onConfirm = null; closeModal(); if (f) f(); },
    reveal: () => {
      const box = $modal.querySelector(".reveal-box"), u = $modal.querySelector(".qmeta .mono").textContent.slice(1);
      const q = BY_ID.get(u);
      box.innerHTML = choicesList(q, null, true) + explainHtml(q, (i) => LET[i]);
      const b = $modal.querySelector("[data-action=reveal]"); if (b) b.remove();
    },
    scrollto: (el) => { const t = document.getElementById(el.dataset.id); if (t) t.scrollIntoView({ behavior: "smooth" }); const d = el.closest("details"); if (d) d.open = false; },
    lesson: (el) => { pendingScroll = "sub:" + el.dataset.sub; closeModal(); go("cours-" + el.dataset.l); },
    resume: () => go("session"),
    abandon: () => confirmBox("Abandonner la session ?", "Les réponses de cette session ne seront pas comptées.", "Abandonner", () => { S.run = null; save(); route(); }, true),
    leave: () => { stopTimer(); go("accueil"); },
    "quick-quiz": () => { const p = quizPrefs(); quizFrom(QS, 20, "Quiz rapide · tous les thèmes", { mode: p.mode }); },
    "review-ko": () => quizFrom(QS.filter((q) => isKo(q.i)), 20, "Révision des erreurs", { mode: "learn" }),
    "quiz-theme": (el) => quizFrom(BY_THEME[+el.dataset.t], 20, `Quiz · thème ${el.dataset.t}`),
    "quiz-sub": (el) => { const n = el.dataset.n === "all" ? "all" : +el.dataset.n; quizFrom(BY_SUB[el.dataset.sub], n, `Quiz · §${el.dataset.sub}`); },
    "bank-sub": (el) => { Object.assign(bank, { q: "", t: String(SUB[el.dataset.sub].t), s: el.dataset.sub, k: "", f: "", page: 0 }); go("banque"); },
    "toggle-theme": (el) => {
      const p = quizPrefs(), t = +el.dataset.t;
      p.themes = p.themes.includes(t) ? p.themes.filter((x) => x !== t) : p.themes.concat(t).sort((a, b) => a - b);
      save(); viewQuiz();
    },
    "toggle-sub": (el) => { const p = quizPrefs(), s = el.dataset.s; p.subs = p.subs.includes(s) ? p.subs.filter((x) => x !== s) : p.subs.concat(s); save(); viewQuiz(); },
    "themes-all": () => { quizPrefs().themes = THEMES.map((t) => t.n); save(); viewQuiz(); },
    "themes-none": () => { const p = quizPrefs(); p.themes = []; p.subs = []; save(); viewQuiz(); },
    pref: (el) => {
      const k = el.dataset.k, v = el.dataset.v;
      if (k === "review") { reviewFilter = v; const m = location.hash.match(/bilan-([a-z0-9]+)/); if (m) viewBilan(m[1]); return; }
      if (k === "subsort") { subSort = v; viewResults(); return; }
      if (k.startsWith("e-")) { examPrefs()[k.slice(2)] = v; save(); viewExam(); return; }
      const p = quizPrefs();
      p[k] = k === "n" && v !== "all" ? +v : v;
      save(); viewQuiz();
    },
    "start-quiz": () => {
      const p = quizPrefs(), pool = quizPool(p);
      quizFrom(pool, p.n, quizLabel(p));
    },
    "start-exam": () => {
      const p = examPrefs();
      startRun("exam", buildExam(p), { label: "Examen blanc", mode: "test", shuffle: p.shuffle, timed: p.timed });
    },
    answer: (el) => answer(+el.dataset.d),
    next: () => move(1),
    prev: () => move(-1),
    goto: (el) => { S.run.cur = +el.dataset.i; finishAsk = false; save(); rerenderSession(true); },
    mark: () => { const it = S.run.items[S.run.cur]; it.m = it.m ? 0 : 1; save(); rerenderSession(false); },
    "toggle-grid": () => { gridOpen = !gridOpen; rerenderSession(false); },
    "finish-ask": () => { finishAsk = true; rerenderSession(true); },
    "finish-cancel": () => { finishAsk = false; rerenderSession(false); },
    finish: () => finish(false),
    "redo-wrong": (el) => {
      const h = S.hist.find((x) => x.id === el.dataset.id);
      const qs = h.items.map(([u, a]) => ({ q: BY_ID.get(u), a })).filter((x) => x.q && x.a !== x.q.a).map((x) => x.q);
      quizFrom(qs, "all", "Révision des erreurs · " + h.label, { mode: "learn" });
    },
    "open-bilan": (el) => { reviewFilter = "ko"; go("bilan-" + el.dataset.id); },
    "bank-page": (el) => { bank.page = +el.dataset.p; renderBankResults(); document.getElementById("bank-res").scrollIntoView(); },
    "bank-quiz": () => quizFrom(bankList(), 20, "Quiz · sélection de la banque"),
    export: exportBox,
    "copy-export": () => {
      const ta = document.getElementById("exp-data"), msg = document.getElementById("copy-msg");
      const fallback = () => { ta.focus(); ta.select(); msg.textContent = "Texte sélectionné : copie-le avec Ctrl+C ou un appui long."; };
      try {
        navigator.clipboard.writeText(ta.value).then(() => { msg.textContent = "Copié dans le presse-papiers."; }, fallback);
      } catch (e) { fallback(); }
    },
    import: importBox,
    "do-import": doImport,
    reset: () => confirmBox("Tout effacer ?", `Ta progression, ton historique et la session en cours seront supprimés ${R ? "de ton compte, dans tous tes navigateurs" : "de ce navigateur"}. Pense à exporter avant.`, "Tout effacer", () => {
      const now = Date.now();
      S = normalize({ resetAt: now, runTs: now });
      save(); route();
    }, true),
  };
  document.addEventListener("click", (e) => {
    const q = e.target.closest("a.qref");
    if (q) { e.preventDefault(); showQuestion(q.dataset.q); return; }
    const el = e.target.closest("[data-action]");
    if (!el || !A[el.dataset.action]) return;
    if (el.tagName === "A" || el.tagName === "TR") e.preventDefault();
    if (el.type === "checkbox") return;
    A[el.dataset.action](el, e);
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.matches("[data-action=pref-check]")) {
      const k = el.dataset.k;
      if (k.startsWith("e-")) { examPrefs()[k.slice(2)] = el.checked; save(); }
      else { quizPrefs()[k] = el.checked; save(); viewQuiz(); }
    } else if (el.matches("[data-bank]")) {
      bank[el.dataset.bank] = el.value;
      if (el.dataset.bank === "t") { bank.s = ""; bank.page = 0; viewBank(); return; }
      bank.page = 0; renderBankResults();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $modal.innerHTML) { closeModal(); return; }
    if ($modal.innerHTML || !S.run || location.hash !== "#session") return;
    if (e.target.closest("input, textarea, select") || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    const idx = { 1: 0, 2: 1, 3: 2, a: 0, b: 1, c: 2 }[k];
    if (idx !== undefined) { e.preventDefault(); answer(idx); }
    else if (e.key === "ArrowRight") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); move(-1); }
    else if (k === "m" && S.run.mode !== "learn") A.mark();
    else if (e.key === "Enter" && !e.target.closest("button")) { e.preventDefault(); move(1); }
  });

  route();
  connect();
})();
