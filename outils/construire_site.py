#!/usr/bin/env python3
"""Construit les données du site de révision (dossier docs/) et les exports de la base.

Entrées : donnees/Base_AMF_fusionnee.xlsx, manuel/*.md, annexes/*.md, README.md
Sorties : docs/data/questions.js, docs/data/cours.js,
          donnees/questions.json, donnees/questions.csv

Dépendances : pip install openpyxl markdown-it-py beautifulsoup4
Usage      : python3 outils/construire_site.py   (depuis la racine du dépôt)
"""
import csv, glob, json, os, re, sys
from collections import Counter, OrderedDict

import openpyxl
from bs4 import BeautifulSoup
from markdown_it import MarkdownIt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# --- Grille de l'examen : nombre de questions par sous-thème (120 au total) ----
GRILLE = OrderedDict([
    ("1.1", 2), ("1.2.1", 2), ("1.2.2", 1), ("1.3", 3), ("1.5.1", 2), ("1.5.2", 2), ("1.8", 2),
    ("2.1", 2), ("2.2", 2), ("2.3", 2),
    ("3", 3), ("4", 2),
    ("5.1", 4), ("5.2", 2),
    ("6.1.1", 5), ("6.1.2", 2), ("6.2", 5), ("6.3", 3), ("6.4", 3), ("6.5", 2), ("6.6", 1),
    ("6.7", 1), ("6.8", 2), ("6.9", 1),
    ("7.1", 3), ("7.2", 3), ("7.3", 3), ("7.4", 2), ("7.5", 1), ("7.6", 2), ("7.7", 1),
    ("7.8", 2), ("7.9", 2), ("7.10", 2),
    ("8.1", 1), ("8.2.1", 1), ("8.2.2", 2), ("8.4", 2), ("8.5", 3), ("8.6", 1), ("8.7", 15),
    ("9.1", 2), ("9.2", 2), ("9.3", 1), ("9.4", 1), ("9.5", 1),
    ("10.1", 2), ("10.2", 1),
    ("11.1", 1), ("11.2", 1),
    ("12.1", 2), ("12.2", 1), ("12.3", 2), ("12.4", 1),
])
CAT_A = {"2.1", "2.2", "2.3", "3", "4", "5.1", "6.1.1", "6.2", "6.3", "6.4", "9.2"}
assert sum(GRILLE.values()) == 120 and sum(GRILLE[s] for s in CAT_A) == 33

LESSONS = sorted(glob.glob("manuel/*.md"))
ANNEXES = sorted(glob.glob("annexes/*.md"))

FLAG_CODES = {
    "ERREUR DE LA BASE": "err", "RÉPONSE ABSENTE": "abs", "Réponse dépassée": "obs",
    "À vérifier": "ver", "Discutable": "dis", "Piège": "pie", "Contexte": "ctx",
}
CORRECTIONS = {"2670": "B", "2578": "C"}  # erreur avérée / réponse absente (annexe A)


def clean(s):
    return re.sub(r"[ \t]+\n", "\n", str(s or "")).strip()


# --- 1. Questions -------------------------------------------------------------
wb = openpyxl.load_workbook("donnees/Base_AMF_fusionnee.xlsx", read_only=True)
rows = list(wb["Base fusionnée"].iter_rows(values_only=True))
head, rows = rows[0], rows[1:]
questions, export = [], []
for r in rows:
    d = dict(zip(head, r))
    uid, sub = str(d["N°"]), str(d["Sous-thème"])
    base = (d["Bonne réponse"] or "").strip()
    ans = CORRECTIONS.get(uid, base)
    assert ans in "ABC" and ans, uid
    alert = clean(d["Alerte du manuel"])
    flag, note = "", ""
    if alert:
        kind, _, note = alert.partition(":")
        flag = FLAG_CODES[kind.strip()]
        note = note.strip()
    lesson = re.search(r"/(\d\d)-", d["Leçon"]).group(1)
    q = OrderedDict(
        i=uid, t=int(d["Thème"]), s=sub, k="A" if sub in CAT_A else "C",
        q=clean(d["Question"]), c=[clean(d["Choix A"]), clean(d["Choix B"]), clean(d["Choix C"])],
        a="ABC".index(ans), j=clean(d["Justification (base)"]),
        o=1 if str(d["Origine"]).startswith("Récente") else 0, l=lesson)
    if base != ans:
        q["b"] = base
    if flag:
        q["f"], q["n"] = flag, note
    questions.append(q)
    export.append(OrderedDict(
        numero=uid, theme=q["t"], sous_theme=sub, categorie_examen=q["k"], question=q["q"],
        choix_a=q["c"][0], choix_b=q["c"][1], choix_c=q["c"][2], bonne_reponse=ans,
        reponse_de_la_base=base, justification=q["j"], origine=d["Origine"],
        alerte=flag, note=note, lecon=d["Leçon"]))

assert len(questions) == len({q["i"] for q in questions}) == 2244
counts = Counter(q["s"] for q in questions)
missing = [s for s in GRILLE if counts[s] < GRILLE[s]]
assert not missing and set(counts) == set(GRILLE), (missing, set(counts) ^ set(GRILLE))

# --- 2. Libellés des thèmes et sous-thèmes ------------------------------------
themes, sub_labels = [], {"3": "Sécurité financière (blanchiment, corruption, embargos)",
                          "4": "Abus de marché"}
for path in LESSONS:
    txt = open(path, encoding="utf-8").read()
    n = int(os.path.basename(path)[:2])
    title = re.search(r"^# Thème \d+ — (.+)$", txt, re.M).group(1).strip()
    themes.append(dict(n=n, id=f"{n:02d}", title=title))
    for num, lab in re.findall(r"^## (\d+(?:\.\d+)+) (.+)$", txt, re.M):
        if num in GRILLE and num not in sub_labels:
            sub_labels[num] = re.sub(r"\s*\((catégorie A|\d+ questions)\)", "", lab).replace("*", "").strip()
assert set(sub_labels) == set(GRILLE), set(GRILLE) - set(sub_labels)

meta = dict(
    themes=themes,
    subs=[dict(s=s, t=int(s.split(".")[0]), label=sub_labels[s], n=GRILLE[s],
               k="A" if s in CAT_A else "C", bank=counts[s]) for s in GRILLE],
)

# --- 3. Leçons et annexes en HTML ---------------------------------------------
md = MarkdownIt("commonmark", {"html": True, "typographer": False}).enable("table")
TAGS = {
    "🧠": ("mnemo", "mnémo"), "🆕": ("new", "nouveau"), "⚠️": ("warn", "piège"), "⚠": ("warn", "piège"),
    "❌": ("err", "erreur"), "❓": ("err", "absente"), "🕰️": ("obs", "dépassée"), "🕰": ("obs", "dépassée"),
    "🔎": ("ver", "à vérifier"), "🤔": ("ver", "discutable"), "ℹ️": ("ctx", "contexte"), "ℹ": ("ctx", "contexte"),
    "✅": ("ok", "juste"),
}
CALLOUTS = {"🧠": ("mnemo", "Moyen mnémotechnique"), "🆕": ("new", "Mise à jour"),
            "⚠️": ("warn", "Piège"), "🎯": ("goal", "À retenir")}
STRIP = ["📌", "⚡", "🎯", "🏠", "⬅️", "➡️", "️"]
MARK_RE = re.compile(r"^> (🧠|🆕|⚠️|🎯)")


def slug(s):
    s = re.sub(r"[^\w\s.-]", "", s.lower()).strip()
    return re.sub(r"[\s.]+", "-", s)[:60]


def rewrite_href(h):
    if h.startswith("http"):
        return h
    m = re.search(r"manuel/(\d\d)-[^#)]*\.md(#.*)?$", h) or re.match(r"(\d\d)-[^/#)]*\.md(#.*)?$", h)
    if m:
        return f"#cours-{m.group(1)}"
    m = re.search(r"([A-D])-[^/#)]*\.md", h)
    if m:
        return f"#annexe-{m.group(1)}"
    if h.endswith("README.md"):
        return "#guide"
    return h


def to_html(text, ids_check=None):
    text = text.split("<!-- NAV -->")[0]
    text = re.sub(r"^\*\*Légende\*\*.*$", "", text, flags=re.M)
    text = (text.replace("« 📌 »", "« Questions de la base »")
                .replace("listées en 📌", "listées dans « Questions de la base »")
                .replace("fiches flash ⚡", "fiches flash"))

    def ids_block(m):
        sub = m.group(1)
        if ids_check is not None:
            listed = re.findall(r"(\d+[ab]?)⚠?️?", m.group(2).split(":", 1)[1])
            ids_check[sub] = listed
        return f'\n<div class="ids" data-sub="{sub}"></div>\n'

    text = re.sub(r"<!-- IDS:(\S+) -->\n(.*?)\n<!-- /IDS -->", ids_block, text, flags=re.S)
    out, prev = [], ""
    for line in text.split("\n"):
        if MARK_RE.match(line) and prev.startswith(">") and prev.strip() != ">":
            out.append("")  # un encadré par moyen mnémotechnique / mise à jour / piège
        out.append(line)
        prev = line
    html = md.render("\n".join(out))
    soup = BeautifulSoup(html, "html.parser")
    title = ""
    h1 = soup.find("h1")
    if h1:
        title = h1.get_text().strip()
        h1.decompose()
    toc, seen = [], set()
    for h in soup.find_all(["h2", "h3"]):
        t = h.get_text().strip()
        for e in STRIP:
            t = t.replace(e, "")
        t = t.strip()
        sid = slug(t) or "s"
        while sid in seen:
            sid += "-2"
        seen.add(sid)
        h["id"] = sid
        if h.name == "h2":
            if "Fiche flash" in t:
                h["class"] = "flash"
            toc.append(dict(id=sid, t=t))
    for bq in soup.find_all("blockquote"):
        first = bq.get_text().strip()
        kind = next((k for k in CALLOUTS if first.startswith(k)), None)
        if not kind:
            bq["class"] = "note"
            continue
        cls, label = CALLOUTS[kind]
        bq.name = "aside"
        bq["class"] = f"callout c-{cls}"
        node = bq.find(string=re.compile(re.escape(kind)))
        node.replace_with(node.replace(kind, "", 1).lstrip())
        lab = soup.new_tag("span", attrs={"class": "callout-label"})
        lab.string = label
        bq.insert(0, lab)
    for a in soup.find_all("a", href=True):
        a["href"] = rewrite_href(a["href"])
    for tb in soup.find_all("table"):
        wrap = soup.new_tag("div", attrs={"class": "table-wrap"})
        tb.wrap(wrap)
    html = str(soup)
    for e, (cls, lab) in TAGS.items():
        html = html.replace(e, f'<span class="tag t-{cls}">{lab}</span>')
    for e in STRIP:
        html = html.replace(e, "")
    html = re.sub(r"(?<![\w/#\"-])Q(\d{1,4}[ab]?)\b",
                  r'<a class="qref" href="#" data-q="\1">Q\1</a>', html)
    return title, html, toc


ids_check = {}
lessons = []
for path, th in zip(LESSONS, themes):
    title, html, toc = to_html(open(path, encoding="utf-8").read(), ids_check)
    lessons.append(dict(id=th["id"], n=th["n"], title=th["title"], html=html, toc=toc))

by_sub = {}
for q in questions:
    by_sub.setdefault(q["s"], set()).add(q["i"])
for sub, listed in ids_check.items():
    assert set(listed) == by_sub[sub], f"IDS {sub}: {set(listed) ^ by_sub[sub]}"
assert set(ids_check) == set(GRILLE)

annexes = []
for path in ANNEXES:
    title, html, toc = to_html(open(path, encoding="utf-8").read())
    letter = os.path.basename(path)[0]
    annexes.append(dict(id=letter, title=re.sub(r"^Annexe [A-D] — ", "", title), html=html, toc=toc))

# Guide : sections 1, 3, 4 et 5 du README (le sommaire et la partie « site » sont gérés par le site)
readme = open("README.md", encoding="utf-8").read()
parts = re.split(r"^(?=## )", readme, flags=re.M)
keep = [p for p in parts[1:] if re.match(r"## [1345]\. ", p)]
_, guide_html, guide_toc = to_html("# Guide\n\n" + "\n".join(keep))

# --- 4. Écriture ---------------------------------------------------------------
def js(name, obj):
    return f"window.{name}=" + json.dumps(obj, ensure_ascii=False, separators=(",", ":")) + ";\n"

with open("docs/data/questions.js", "w", encoding="utf-8") as f:
    f.write("/* Base AMF fusionnée : générée par outils/construire_site.py, ne pas modifier à la main */\n")
    f.write(js("AMF_META", meta))
    f.write(js("AMF_Q", questions))
with open("docs/data/cours.js", "w", encoding="utf-8") as f:
    f.write("/* Leçons et annexes : générées par outils/construire_site.py depuis manuel/ et annexes/ */\n")
    f.write(js("AMF_COURS", dict(lessons=lessons, annexes=annexes,
                                  guide=dict(html=guide_html, toc=guide_toc))))
with open("donnees/questions.json", "w", encoding="utf-8") as f:
    json.dump(export, f, ensure_ascii=False, indent=1)
with open("donnees/questions.csv", "w", encoding="utf-8-sig", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(export[0]), delimiter=";")
    w.writeheader()
    w.writerows(export)

print(f"{len(questions)} questions · {len(lessons)} leçons · {len(annexes)} annexes")
for p in ["docs/data/questions.js", "docs/data/cours.js", "donnees/questions.json", "donnees/questions.csv"]:
    print(f"  {p}: {os.path.getsize(p) // 1024} Ko")
