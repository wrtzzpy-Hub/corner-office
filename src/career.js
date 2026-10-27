/* ============================== CAREER ============================== */
const RANKS = ["Intern", "Analyst", "Associate", "Senior Associate", "Manager", "Senior Manager", "Director", "Partner"];
const XP_AT = [0, 1200, 3200, 6000, 9500, 14000, 19500, 26000];
const YEAR_BASE = { 1: 1, 2: 2, 3: 3, 4: 3 };
const rankOf = xp => { let i = 0; while (i < RANKS.length - 1 && xp >= XP_AT[i + 1]) i++; return i; };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const hashStr = s => { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const KEY = "tickandtie.v2";
const blankCareer = () => ({ xp: 0, eng: 0, sumPct: 0, best: 0 });
const freshSave = (m = true, s = true) => ({ v: 2, onboarded: false, mode: "casual", major: "Accounting", year: 1, careers: { casual: blankCareer(), student: blankCareer() }, daily: { casual: "", student: "" }, cur: { casual: null, student: null }, recent: { casual: [], student: [] }, music: m, sfx: s, coach: 0 });
function loadSave() { try { const s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.v === 2) return s; } catch (e) {} return null; }
let save = loadSave() || freshSave();
if (save.coach === undefined) save.coach = 0;
function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) {} }
const career = () => save.careers[save.mode];
const isStudent = () => save.mode === "student";
/* Play for fun uses a beginner pool at the easiest tier; numeric answers become multiple choice with a tip on every task. */
const CASUAL_IDS = new Set(["acc_classify", "acc_cutoff", "acc_count", "acc_materiality", "acc_baddebt", "acc_depr", "acc_prepaid", "fin_tvm", "fin_ratio", "fin_breakeven", "mkt_funnel", "mkt_classify", "mkt_campaign", "mkt_share", "mkt_pricing", "mgt_swot", "mgt_theory", "mgt_roster", "mgt_ops", "mgt_lead", "mgt_count", "eco_cpi", "eco_gdp", "eco_classify"]);
function baseTier() { const rk = rankOf(career().xp); return isStudent() ? Math.min(4, YEAR_BASE[save.year] + Math.floor((rk + (save.year === 4 ? 2 : 0)) / 3)) : 1; }
const ptsFor = tier => isStudent() ? 100 + 25 * (tier - 1) : 100;
const engLength = rk => isStudent() ? Math.min(12, 6 + Math.floor(rk * .85)) : 4 + Math.floor(rk * .5);
const bossTitle = () => { const rk = rankOf(career().xp); return rk < 4 ? "Manager" : rk < 6 ? "Director" : "Managing Partner"; };

/* ============================== CLIENTS & STATIONS ============================== */
const INDUSTRIES = [
  { ind: "kitchen appliances", sfx: "Trading", prod: "AX-200 blenders", cost: 450, per: 50, stripe: "#c8372d" },
  { ind: "coffee shops", sfx: "Coffee Co", prod: "espresso machines", cost: 1850, per: 10, stripe: "#6b3f22" },
  { ind: "fashion retail", sfx: "Fashion", prod: "sneaker cartons", cost: 220, per: 50, stripe: "#2f6db3" },
  { ind: "consumer electronics", sfx: "Electronics", prod: "wireless headphones", cost: 310, per: 50, stripe: "#222831" },
  { ind: "pharmacies", sfx: "Pharma", prod: "vitamin cases", cost: 95, per: 50, stripe: "#3f9a6b" },
  { ind: "sports equipment", sfx: "Sports", prod: "treadmills", cost: 2400, per: 10, stripe: "#e08a1e" },
  { ind: "office furniture", sfx: "Furnishings", prod: "office chairs", cost: 380, per: 20, stripe: "#5a3f4a" },
  { ind: "hotel supplies", sfx: "Hospitality", prod: "linen sets", cost: 140, per: 50, stripe: "#7c8796" },
  { ind: "toys", sfx: "Toys", prod: "building-block sets", cost: 120, per: 50, stripe: "#d4a017" },
  { ind: "auto parts", sfx: "Auto Parts", prod: "tyre sets", cost: 900, per: 20, stripe: "#1b1b1f" }];
const NAMES = ["Falcon Bay", "Pearl Coast", "Desert Rose", "Oasis", "Marina", "Coral", "Saffron", "Cedar", "Palm Grove", "Horizon", "Gulf Star", "Al Waha", "Silverline", "Blue Dhow", "Sandstone", "Najm"];
const EXECS = [["Khalid Mansour", "m"], ["Layla Nasser", "f"], ["Omar Rahman", "s"], ["Fatima Saeed", "f"], ["Rashid Karim", "m"], ["Noura Darwish", "f"], ["Yousef Hamdan", "s"], ["Aisha Obaid", "f"], ["Tariq Saleh", "m"], ["Hessa Al Ali", "f"]];
const ROLE = { Accounting: "CFO", Finance: "CFO", Marketing: "CMO", Management: "COO", Economics: "Head of Strategy" };
const STATIONS = {
  laptop: { x: 6, z: 5.9, y: 1.35, kind: "desk", place: "the laptop on the meeting room table", room: "meet", ap: [6, 7.85] },
  mon1: { x: 15, z: 7.6, y: 1.55, kind: "desk", reach: 3, place: "the left desk on the Finance floor", room: "fin", ap: [16.6, 8.9], via: [[17.75, 6.2], [17.6, 8.6]] },
  mon2: { x: 20.5, z: 7.6, y: 1.55, kind: "desk", reach: 3, place: "the right desk on the Finance floor", room: "fin", ap: [22.1, 9.2], via: [[17.75, 6.2], [18.4, 9.35]] },
  dpc: { x: 34.6, z: 20.4, y: 1.5, kind: "desk", place: "the dispatch desk in the Stockroom", room: "stock", ap: [34.6, 22.0] },
  cab1: { x: 14, z: .6, y: 1.8, kind: "files", place: "the red filing cabinet, Finance floor", room: "fin", ap: [14, 2.0], via: [[17.75, 6.2]] },
  cab2: { x: 16, z: .6, y: 1.8, kind: "files", place: "the blue filing cabinet, Finance floor", room: "fin", ap: [16, 2.0], via: [[17.75, 6.2]] },
  cab3: { x: 18, z: .6, y: 1.8, kind: "files", place: "the green filing cabinet, Finance floor", room: "fin", ap: [18, 2.0], via: [[17.75, 6.2]] },
  cab4: { x: 20, z: .6, y: 1.8, kind: "files", place: "the grey filing cabinet, Finance floor", room: "fin", ap: [20, 2.0], via: [[17.75, 6.2]] },
  cab5: { x: 22, z: .6, y: 1.8, kind: "files", place: "the gold filing cabinet, Finance floor", room: "fin", ap: [22, 2.0], via: [[17.75, 6.2]] },
  printer: { x: 22.7, z: 4.6, y: 1.6, kind: "files", place: "the printer on the Finance floor", room: "fin", ap: [22.7, 6.0], via: [[17.75, 6.2]] },
  tray: { x: 24.55, z: 6.8, y: 1.6, kind: "files", place: "the mail tray in the Executive suite", room: "exec", ap: [25.9, 6.8] },
  clip: { x: 32.2, z: 23.3, y: 1.6, kind: "files", place: "the clipboard by Bay C, Stockroom", room: "stock", ap: [32.2, 22.0] },
  exec: { x: 30, z: 2.1, y: 2.15, kind: "npc", cap: 3, reach: 4, place: "the Executive suite", room: "exec", ap: [30, 5.6] },
  ravi: { x: 30.5, z: 19.6, y: 2.1, kind: "npc", cap: 2, place: "Ravi in the Stockroom", room: "stock", ap: [30.5, 21.1] },
  bay: { x: 28, z: 23.3, y: 2.9, kind: "bay", reach: 3.4, place: "Bay C in the Stockroom", room: "stock", ap: [28, 21.8] },
};
const FIXED = {
  sara: { x: 10.1, z: 5.2, y: 2.05, room: "meet", ap: [10.4, 7.3], reach: 3.5, place: "Sara in the meeting room" },
  mariam: { x: 1.2, z: 20.4, y: 2.0, room: "lobby", ap: [3.8, 20.4], reach: 3.3, place: "Reception" },
  notice: { x: 35.9, z: 18.4, y: 2.6, room: "stock", ap: [35.0, 18.8], via: [[31, 19.2]], place: "the notice board" },
};
const KIND_AT = { calc: ["desk", "files"], classify: ["files", "desk"], flag: ["files", "desk"], mcq: ["npc", "desk"], count: ["bay"] };

function newEngagement(daily) {
  const seed = daily ? hashStr(today() + save.mode + (isStudent() ? save.major + save.year : "")) : (Math.random() * 2 ** 31) | 0;
  const r = mul32(seed), h = H(r), rk = rankOf(career().xp), tier = baseTier();
  const n = daily ? (isStudent() ? 8 : 6) : engLength(rk);
  const ind = h.pick(INDUSTRIES), ex = h.pick(EXECS);
  const recent = new Set(save.recent[save.mode] || []), used = new Set(), list = [], majCount = {};
  let countUsed = false;
  if (!isStudent()) {
    for (let i = 0; i < n; i++) {
      const cand = FUN.filter(t => !used.has(t.id) && !(t.kind === "count" && countUsed)); if (!cand.length) break;
      const lastKind = list.length ? TPL[list[list.length - 1].tpl].kind : null, fresh = cand.filter(t => !recent.has(t.id) && t.kind !== lastKind);
      const t = h.pick(fresh.length ? fresh : cand); used.add(t.id); if (t.kind === "count") countUsed = true; majCount[t.major] = (majCount[t.major] || 0) + 1;
      list.push({ tpl: t.id, tier: 1 });
    }
  } else for (let i = 0; i < n; i++) {
    const major = r() < .7 ? save.major : h.pick(MAJORS.filter(m => m !== save.major));
    const tt = Math.min(4, tier + (r() < .25 ? 1 : 0));
    const ok = t => !t.cap && !used.has(t.id) && t.min <= tt && t.max >= tier - 1 && !(t.kind === "count" && countUsed);
    let cand = TEMPLATES.filter(t => ok(t) && t.major === major); if (!cand.length) cand = TEMPLATES.filter(ok); if (!cand.length) break;
    const fresh = cand.filter(t => !recent.has(t.id)), t = h.pick(fresh.length ? fresh : cand);
    used.add(t.id); if (t.kind === "count") countUsed = true; majCount[t.major] = (majCount[t.major] || 0) + 1;
    list.push({ tpl: t.id, tier: Math.max(t.min, Math.min(t.max, tt)) });
  }
  const free = {}; for (const [id, s] of Object.entries(STATIONS)) free[id] = s.cap || 1;
  const order = h.shuf(Object.keys(STATIONS));
  for (const t of list) {
    for (const k of KIND_AT[TPL[t.tpl].kind]) { const st = order.find(id => STATIONS[id].kind === k && free[id] > 0 && !(k === "npc" && id === "ravi" && free.exec > 0)); if (st) { t.st = st; free[st]--; break; } }
    if (!t.st) { const st = order.find(id => ["desk", "files"].includes(STATIONS[id].kind) && free[id] > 0); t.st = st; free[st]--; }
  }
  const capMajor = isStudent() ? save.major : Object.entries(majCount).sort((a, b) => b[1] - a[1])[0][0];
  const capT = isStudent() && tier >= 2 ? TEMPLATES.find(t => t.cap && t.major === capMajor) : null;
  const eng = { seed, daily, date: today(), tier, n: list.length, tasks: list, cap: capT ? { tpl: capT.id, tier: Math.max(capT.min, Math.min(capT.max, tier)) } : null,
    client: { name: h.pick(NAMES) + " " + ind.sfx, ind: ind.ind, prod: ind.prod, cost: ind.cost, per: ind.per, stripe: ind.stripe, exec: ex[0], g: ex[1], role: isStudent() ? ROLE[save.major] : "CEO" },
    service: isStudent() ? SERVICE[save.major] : "Helping out for the day", palette: h.ri(0, 3), bay: h.ri(14, 23), res: {}, briefed: false };
  save.recent[save.mode] = [...list.map(t => t.tpl), ...(save.recent[save.mode] || [])].slice(0, 16);
  save.cur[save.mode] = eng; persist();
  return eng;
}

/* numeric answers shown as choices in Play for fun */
function fmtAns(v, unit) {
  const int = Math.abs(v - Math.round(v)) < .005;
  if (unit === "AED") return "AED " + N(v, int ? 0 : 2);
  if (unit === "%") return N(v, 2) + "%";
  if (unit === "x") return N(v, 2) + "×";
  if (unit === "AED bn") return "AED " + N(v, 1) + " bn";
  if (!unit) return N(v, 2);
  return N(v, int ? 0 : 1) + " " + unit;
}
function numChoices(d, seed) {
  const h = H(mul32(seed)), a = d.answer, f = v => fmtAns(v, d.unit), right = f(a);
  let near = [a * 1.5, a / 2, a * 2, a * .8, a * 1.25, a * .75], far = [a * 10, a / 10, a * 1.1, a * .9];
  if (a === 0) { near = [1, -1, 10, 100]; far = [5]; }
  const first = a < 0 ? [-a] : d.unit === "%" && a > 0 && a < 100 ? [100 - a] : [];
  const seen = new Set([right]), opts = [];
  if (d.wrongs) for (const v of h.shuf(d.wrongs)) { const s = f(v); if (!seen.has(s)) { seen.add(s); opts.push(s); } if (opts.length === 3) break; }
  for (const v of [...first, ...h.shuf(near), ...h.shuf(far)]) { if (opts.length >= 3) break; if (!isFinite(v)) continue; const s = f(v); if (!seen.has(s)) { seen.add(s); opts.push(s); } if (opts.length === 3) break; }
  const all = h.shuf([right, ...opts]);
  return { options: all, correct: all.indexOf(right), asChoice: true };
}
const escH = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function easyfy(d, kind, seed, T) {
  if (isStudent()) return d;
  if (T && T.fun) { if (kind === "calc") Object.assign(d, numChoices(d, seed)); return d; }
  if (kind === "classify" && d.items.length > 5) { d.items = d.items.slice(0, 5); d.explain = d.items.map(i => `<b>${escH(i.text)}</b> → ${escH(i.cat)}${i.why ? ". " + escH(i.why) : ""}`).join("<br>"); }
  if (kind === "flag") d.q += ` There ${d.wrong.length > 1 ? "are" : "is"} ${d.wrong.length} to find.`;
  if (kind === "calc") Object.assign(d, numChoices(d, seed));
  return d;
}
let ENG = null;
function ctxOf(eng) { const c = eng.client; return { client: c.name, exec: c.exec, ind: c.ind, prod: c.prod, cost: c.cost, per: c.per, bay: eng.bay }; }
function makeTask(eng, t, i, sd) { const T = TPL[t.tpl]; return { ...t, key: String(i), T, d: easyfy(T.gen(mul32(sd), t.tier, ctxOf(eng)), T.kind, sd + 17, T) }; }
function materialize(eng) {
  ENG = { ...eng, list: eng.tasks.map((t, i) => makeTask(eng, t, i, eng.seed + i * 7919 + 1)), capT: eng.cap ? makeTask(eng, eng.cap, "cap", eng.seed + 99991) : null };
  return ENG;
}
