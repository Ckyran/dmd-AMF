/* Lots de révision AMF — lots de 120 questions avec leur bonne réponse, selon la nomenclature de l'examen.
   Données : window.AMF_META, window.AMF_Q, window.AMF_LOTS (data/lots-data.js, série de référence).
   Les lots révisés et les questions « à revoir » sont enregistrés dans le navigateur (localStorage). */
(function () {
  "use strict";

  const META = window.AMF_META, QS = window.AMF_Q, REF = window.AMF_LOTS;
  const $app = document.getElementById("app");
  if (!META || !QS || !REF) {
    $app.innerHTML = '<p class="empty">Le fichier de données (data/lots-data.js) est introuvable.</p>';
    return;
  }

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
  const NB = META.nb;
  const SUBS = META.subs;
  const SUB = Object.fromEntries(SUBS.map((s) => [s.s, s]));
  const BY_ID = new Map(QS.map((q) => [q.i, q]));
  const TW = {};
  SUBS.forEach((s) => { const w = (TW[s.t] = TW[s.t] || { A: 0, C: 0 }); w[s.k] += s.n; });

  // ---------- Outils ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const escBr = (s) => esc(s).replace(/\n/g, "<br>");
  const nf = (n) => Number(n).toLocaleString("fr-FR");
  const catBadge = (k) => `<span class="cat cat-${k}" title="Catégorie ${k}">${k}</span>`;
  const weight = (w) => [w.A ? `${w.A} A` : "", w.C ? `${w.C} C` : ""].filter(Boolean).join(" + ");
  const STAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';

  // ---------- Stockage ----------
  const KEY = "amf.lots.v1";
  function load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY)); } catch (e) { /* stockage indisponible */ }
    d = d && typeof d === "object" ? d : {};
    return {
      seed: Number.isInteger(d.seed) ? d.seed : null,
      done: d.done && typeof d.done === "object" ? d.done : {},
      stars: Array.isArray(d.stars) ? d.stars.filter((u) => BY_ID.has(u)) : [],
      hide: !!d.hide, filter: d.filter || "all", last: Number.isInteger(d.last) ? d.last : 1,
    };
  }
  let S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* stockage indisponible */ } }
  // « v2 » : lots recalculés sans les questions à réponse dépassée, les anciennes coches ne s'y appliquent plus
  const seriesKey = () => "v2:" + (S.seed == null ? "ref" : String(S.seed));
  const doneList = () => (S.done[seriesKey()] = S.done[seriesKey()] || []);
  const isDone = (n) => doneList().includes(n);
  const isStar = (u) => S.stars.includes(u);

  // ---------- Séries de lots ----------
  // Même principe que outils/construire_lots.py : mélange par sous-thème puis distribution en tourniquet.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function buildSeries(seed) {
    if (seed == null) return REF;
    const rnd = mulberry32(seed);
    const lots = Array.from({ length: NB }, () => []);
    const bySub = {};
    QS.forEach((q) => (bySub[q.s] = bySub[q.s] || []).push(q.i));
    SUBS.forEach((s) => {
      const ids = bySub[s.s].slice().sort((a, b) => parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b));
      for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
      for (let k = 0; k < NB; k++) for (let j = 0; j < s.n; j++) lots[k].push(ids[(k * s.n + j) % ids.length]);
    });
    return lots;
  }
  let LOTS, FIRST, FRESH;
  function computeSeries() {
    LOTS = buildSeries(S.seed);
    FIRST = new Map(); FRESH = [];
    LOTS.forEach((lot, k) => {
      let f = 0;
      lot.forEach((u) => { if (!FIRST.has(u)) { FIRST.set(u, k); f++; } });
      FRESH.push(f);
    });
  }
  computeSeries();

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

  // ---------- Routeur ----------
  function route() {
    const h = location.hash.replace(/^#/, "") || "lots";
    let m, nav = "lots";
    if ((m = h.match(/^lot-(\d+)$/)) && +m[1] >= 1 && +m[1] <= NB) { viewLot(+m[1]); nav = "lot"; }
    else if (h === "lot") { location.replace("#lot-" + S.last); return; }
    else if (h === "revoir") { viewStars(); nav = "revoir"; }
    else viewLots();
    document.querySelectorAll(".nav a").forEach((a) => {
      if (a.dataset.nav === nav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.querySelector('.nav a[data-nav="lot"] span').textContent = "Lot " + S.last;
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // ---------- Liste des lots ----------
  function card(k) {
    const n = k + 1, f = FRESH[k];
    return `<a class="lot-card ${isDone(n) ? "done" : ""} ${S.last === n ? "last" : ""}" href="#lot-${n}">
      ${isDone(n) ? '<span class="done-tag">révisé</span>' : ""}
      <span class="no">Lot ${n}</span>
      <span class="fr">${f === 120 ? "<b>120 nouvelles</b>" : `<b>${f} nouvelle${f > 1 ? "s" : ""}</b> · ${120 - f} déjà vues`}</span>
      <div class="meter ${f === 120 ? "ok" : ""}"><i style="width:${(100 * f) / 120}%"></i></div></a>`;
  }
  function viewLots() {
    const groups = [[], [], []];
    FRESH.forEach((f, k) => groups[f === 120 ? 0 : f >= 60 ? 1 : 2].push(k));
    const range = (g) => (g.length ? `Lots ${g[0] + 1} à ${g[g.length - 1] + 1}` : "");
    const done = doneList().length;
    const head = [
      [groups[0], "aucune question en commun d'un lot à l'autre"],
      [groups[1], "surtout des questions nouvelles, avec quelques questions déjà vues"],
      [groups[2], "surtout de la révision : ils font sortir les dernières questions jamais vues"],
    ];
    $app.innerHTML = `<div class="page">
      <div class="page-head"><span class="eyebrow">Base fusionnée · ${nf(QS.length)} questions retenues</span><h1>Lots de 120 questions</h1>
        <p>Chaque lot respecte la nomenclature de l'examen : 120 questions réparties sous-thème par sous-thème selon la grille, dont 33 en catégorie A et 87 en catégorie C. Chaque question est affichée directement avec sa bonne réponse.</p>
        ${META.ecartees ? `<p class="small-note">Les ${META.ecartees} questions dont la réponse est dépassée par la réglementation (DICI, ICO et PSAN, CIP, minibons, PERP, TTF…) ne figurent dans aucun lot.</p>` : ""}</div>
      <div class="strip">
        <div><span class="big">${NB}</span><span class="lbl">lots pour couvrir toutes les questions retenues</span></div>
        <div><span class="big">${groups[0].length}</span><span class="lbl">lots sans aucune répétition</span></div>
        <div><span class="big">33 + 87</span><span class="lbl">questions A + C par lot</span></div>
        <div><span class="big">${done}<small class="muted" style="font-size:14px">/${NB}</small></span><span class="lbl">lots révisés</span></div>
      </div>
      <div class="series"><p>${S.seed == null ? "<b>Série de référence</b> : la même que dans le fichier Excel du dépôt (donnees/lots)." : `<b>Série aléatoire n° ${S.seed}</b> : un autre découpage de la base, avec les mêmes règles.`}</p>
        <div class="row"><button class="btn small" data-action="new-series">Nouvelle série aléatoire</button>
        ${S.seed == null ? "" : '<button class="btn small ghost" data-action="ref-series">Revenir à la série de référence</button>'}</div></div>
      ${head.map(([g, txt]) => g.length ? `<section class="section"><div class="group-head"><h2>${range(g)}</h2><span>${txt}</span></div>
        <div class="lot-grid">${g.map(card).join("")}</div></section>` : "").join("")}
      <details class="more"><summary>Répartition d'un lot par thème et sous-thème</summary>
        <div class="table-scroll"><table class="dist"><thead><tr><th>Thème / sous-thème</th><th class="r">Cat.</th><th class="r">Par lot</th><th class="r">Dans la base</th></tr></thead><tbody>
        ${Object.keys(TW).map((t) => `<tr><td><b>${t}. ${esc(SHORT[t])}</b></td><td class="r">${TW[t].A && TW[t].C ? "A+C" : TW[t].A ? "A" : "C"}</td><td class="r"><b>${TW[t].A + TW[t].C}</b></td><td></td></tr>` +
          SUBS.filter((s) => s.t === +t && SUBS.filter((x) => x.t === +t).length > 1).map((s) => `<tr><td>§${s.s} ${esc(s.label)}</td><td class="r">${s.k}</td><td class="r">${s.n}</td><td class="r">${s.bank}</td></tr>`).join("")).join("")}
        </tbody><tfoot><tr><td>Total</td><td class="r">33 A + 87 C</td><td class="r">120</td><td class="r">${nf(QS.length)}</td></tr></tfoot></table></div></details>
    </div>`;
  }

  // ---------- Un lot ----------
  function qaItem(q, num, k) {
    const seenAt = k != null && FIRST.get(q.i) < k ? FIRST.get(q.i) + 1 : 0;
    const flag = q.f ? FLAG[q.f] : null;
    return `<article class="qa" data-u="${esc(q.i)}">
      <span class="no">${num}</span>
      <div class="body">
        <p class="q">${escBr(q.q)}</p>
        ${q.g ? '<p class="neg">Question négative : la réponse est l\'élément qui ne convient pas.</p>' : ""}
        <div class="ans" data-action="reveal"><span class="lbl">Bonne réponse</span><span class="txt">${escBr(q.r)}</span>
          ${q.c ? `<ul class="ctx">${q.c.map((c) => `<li>${escBr(c)}</li>`).join("")}</ul>` : ""}</div>
        ${flag ? `<p class="note ${flag[1] === "err" ? "err" : ""}"><span class="tag t-${flag[1]}">${flag[0]}</span> ${esc(q.n)}</p>` : ""}
        <div class="meta"><span class="mono">Q${esc(q.i)}</span><span>§${q.s}</span>${catBadge(q.k)}${seenAt ? `<span>déjà sortie au lot ${seenAt}</span>` : ""}</div>
      </div>
      <button class="star" type="button" data-action="star" aria-pressed="${isStar(q.i)}" aria-label="${isStar(q.i) ? "Retirer des questions à revoir" : "Ajouter aux questions à revoir"}" title="À revoir">${STAR}</button>
    </article>`;
  }
  function seg(val, opts) {
    return `<div class="seg" role="group" aria-label="Filtrer">${opts.map(([v, l]) => `<button type="button" data-action="filter" data-v="${v}" aria-pressed="${v === val}">${l}</button>`).join("")}</div>`;
  }
  function viewLot(n) {
    const k = n - 1, lot = LOTS[k];
    S.last = n; save();
    const items = lot.map((u, i) => ({ q: BY_ID.get(u), num: i + 1 }));
    const fresh = FRESH[k];
    let filter = S.filter;
    if (filter === "new" && fresh === 120) filter = "all";
    const keep = (x) => filter === "all" || (filter === "new" ? FIRST.get(x.q.i) === k : x.q.k === filter);
    const opts = [["all", "Tout (120)"], ["A", "Cat. A (33)"], ["C", "Cat. C (87)"]];
    if (fresh < 120) opts.push(["new", `Nouvelles (${fresh})`]);
    let body = "";
    Object.keys(TW).forEach((t) => {
      const subs = SUBS.filter((s) => s.t === +t);
      let secBody = "";
      subs.forEach((s) => {
        const xs = items.filter((x) => x.q.s === s.s && keep(x));
        if (!xs.length) return;
        if (subs.length > 1) secBody += `<div class="sub-head">§${s.s} ${esc(s.label)} ${catBadge(s.k)} <span class="num">${s.n} question${s.n > 1 ? "s" : ""}</span></div>`;
        secBody += `<div class="qa-list">${xs.map((x) => qaItem(x.q, x.num, k)).join("")}</div>`;
      });
      if (secBody) body += `<section class="th-sec"><h2>Thème ${t} — ${esc(SHORT[t])} <small>${weight(TW[t])}</small></h2>${secBody}</section>`;
    });
    $app.innerHTML = `<div class="page">
      <div class="toolbar">
        <div class="lotnav">
          <a class="btn small" href="#lot-${n - 1}" ${n > 1 ? "" : 'aria-disabled="true" style="visibility:hidden"'}>←</a>
          <span class="pos">Lot ${n} / ${NB}</span>
          <a class="btn small" href="#lot-${n + 1}" ${n < NB ? "" : 'aria-disabled="true" style="visibility:hidden"'}>→</a>
        </div>
        ${seg(filter, opts)}
        <label class="check"><input type="checkbox" data-action="hide" ${S.hide ? "checked" : ""}> Cacher les réponses</label>
      </div>
      <div class="lot-head"><span class="eyebrow">${S.seed == null ? "Série de référence" : "Série aléatoire n° " + S.seed}</span>
        <h1>Lot ${n}</h1>
        <p>120 questions · 33 en catégorie A, 87 en catégorie C · ${fresh === 120 ? "toutes nouvelles" : `${fresh} nouvelles, ${120 - fresh} déjà sorties dans un lot précédent`}.</p>
        <div class="row"><button class="btn small ${isDone(n) ? "" : "primary"}" data-action="done">${isDone(n) ? "Révisé ✓ (annuler)" : "Marquer ce lot comme révisé"}</button></div></div>
      <div class="lot-body ${S.hide ? "masked" : ""}">${body || '<p class="empty">Aucune question avec ce filtre.</p>'}</div>
      <div class="lot-foot"><button class="btn ${isDone(n) ? "" : "primary"}" data-action="done">${isDone(n) ? "Révisé ✓ (annuler)" : "Marquer ce lot comme révisé"}</button>
        ${n < NB ? `<a class="btn" href="#lot-${n + 1}">Lot ${n + 1} →</a>` : '<a class="btn" href="#lots">Tous les lots</a>'}</div>
    </div>`;
  }

  // ---------- Questions à revoir ----------
  function viewStars() {
    const qs = S.stars.map((u) => BY_ID.get(u)).filter(Boolean).sort((a, b) => a.t - b.t || SUBS.indexOf(SUB[a.s]) - SUBS.indexOf(SUB[b.s]));
    let body = "";
    Object.keys(TW).forEach((t) => {
      const xs = qs.filter((q) => q.t === +t);
      if (xs.length) body += `<section class="th-sec"><h2>Thème ${t} — ${esc(SHORT[t])} <small>${xs.length}</small></h2><div class="qa-list">${xs.map((q) => qaItem(q, qs.indexOf(q) + 1)).join("")}</div></section>`;
    });
    $app.innerHTML = `<div class="page">
      <div class="page-head"><span class="eyebrow">Ta sélection</span><h1>Questions à revoir</h1>
        <p>Les questions marquées d'une étoile dans les lots, classées dans l'ordre des thèmes.</p></div>
      ${qs.length ? `<div class="row"><label class="check"><input type="checkbox" data-action="hide" ${S.hide ? "checked" : ""}> Cacher les réponses</label>
        <button class="btn small danger" data-action="clear-stars">Vider la liste</button></div>
        <div class="lot-body ${S.hide ? "masked" : ""}">${body}</div>`
        : '<p class="empty">Aucune question pour l\'instant. Dans un lot, touche l\'étoile d\'une question pour l\'ajouter ici.</p>'}
    </div>`;
  }

  // ---------- Actions ----------
  let clearArmed = false;
  const A = {
    theme: toggleTheme,
    star: (el) => {
      const u = el.closest(".qa").dataset.u;
      S.stars = isStar(u) ? S.stars.filter((x) => x !== u) : S.stars.concat(u);
      save();
      el.setAttribute("aria-pressed", String(isStar(u)));
      el.setAttribute("aria-label", isStar(u) ? "Retirer des questions à revoir" : "Ajouter aux questions à revoir");
    },
    reveal: (el) => { if (S.hide) el.closest(".qa").classList.toggle("shown"); },
    filter: (el) => { S.filter = el.dataset.v; save(); const y = window.scrollY; viewLot(S.last); window.scrollTo(0, Math.min(y, 200)); },
    done: () => {
      const l = doneList(), n = S.last;
      S.done[seriesKey()] = l.includes(n) ? l.filter((x) => x !== n) : l.concat(n);
      save();
      const y = window.scrollY; viewLot(n); window.scrollTo(0, y);
    },
    "new-series": () => { S.seed = Math.floor(Math.random() * 90000) + 10000; S.last = 1; save(); computeSeries(); viewLots(); },
    "ref-series": () => { S.seed = null; S.last = 1; save(); computeSeries(); viewLots(); },
    "clear-stars": (el) => {
      if (!clearArmed) { clearArmed = true; el.textContent = "Confirmer : vider la liste"; return; }
      clearArmed = false; S.stars = []; save(); viewStars();
    },
  };
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action]");
    if (!el || !A[el.dataset.action] || el.type === "checkbox") return;
    A[el.dataset.action](el, e);
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-action=hide]")) {
      S.hide = e.target.checked; save();
      document.querySelectorAll(".lot-body").forEach((b) => { b.classList.toggle("masked", S.hide); b.querySelectorAll(".qa.shown").forEach((q) => q.classList.remove("shown")); });
    }
  });
  document.addEventListener("keydown", (e) => {
    const m = location.hash.match(/^#lot-(\d+)$/);
    if (!m || e.target.closest("input, textarea, select") || e.ctrlKey || e.metaKey || e.altKey) return;
    const n = +m[1];
    if (e.key === "ArrowRight" && n < NB) location.hash = "lot-" + (n + 1);
    else if (e.key === "ArrowLeft" && n > 1) location.hash = "lot-" + (n - 1);
  });

  route();
})();
