/* ============================== YOU: NAME, STREAKS, BADGES, INTERVIEWS ============================== */
const AV_COLORS = ["#c8372d", "#2f6db3", "#2e8b57", "#8e44ad", "#e08a1e", "#16a3a3", "#d6457f", "#2f3a4c"];
if (save.name === undefined) save.name = "";
if (save.color === undefined) save.color = AV_COLORS[1];
if (!save.streak) save.streak = { n: 0, last: "", best: 0 };
if (!save.badges) save.badges = {};
for (const m of ["casual", "student"]) { const c = save.careers[m]; if (c.rank === undefined) c.rank = rankOf(c.xp); }
const curRank = () => career().rank;
const myName = () => save.name || "";
const hi = (pre = "Hi") => myName() ? `${pre}, ${escH(myName())}` : pre;
const avatarHTML = (size = 34) => `<span class="avatar" style="background:${save.color};width:${size}px;height:${size}px;font-size:${Math.round(size * .45)}px">${escH((myName()[0] || "?").toUpperCase())}</span>`;

/* ---------- daily streak ---------- */
const dayShift = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const streakNow = () => { const s = save.streak; return s.last === today() || s.last === dayShift(today(), -1) ? s.n : 0; };
const streakBonus = n => Math.min(25, Math.max(0, n - 1) * 5);
function bumpStreak() {
  const s = save.streak, t = today();
  if (s.last === t) return false;
  s.n = s.last === dayShift(t, -1) ? s.n + 1 : 1; s.last = t; s.best = Math.max(s.best, s.n); return true;
}

/* ---------- badges ---------- */
const BADGES = [
  { id: "first", ic: "👋", name: "First day", how: "Finish your first job" },
  { id: "perfect", ic: "💯", name: "Perfectionist", how: "Score 100% on a job" },
  { id: "nohint", ic: "🧠", name: "No help needed", how: "Finish a job without using a hint" },
  { id: "daily", ic: "📅", name: "Daily player", how: "Finish a daily challenge" },
  { id: "streak3", ic: "🔥", name: "On a roll", how: "Play 3 days in a row" },
  { id: "streak7", ic: "🚀", name: "Week warrior", how: "Play 7 days in a row" },
  { id: "jobs10", ic: "💼", name: "Regular", how: "Finish 10 jobs" },
  { id: "jobs25", ic: "🏅", name: "Veteran", how: "Finish 25 jobs" },
  { id: "promo", ic: "📈", name: "Moving up", how: "Pass your first promotion interview" },
  { id: "ace", ic: "🎯", name: "Nailed it", how: "Get 3 out of 3 in an interview" },
  { id: "comeback", ic: "💪", name: "Comeback", how: "Pass an interview after failing one" },
  { id: "manager", ic: "🗂️", name: "The boss", how: "Become a Manager" },
  { id: "partner", ic: "🏆", name: "Corner office", how: "Become a Partner" },
  { id: "practice", ic: "🔁", name: "Practice makes perfect", how: "Get a practice round right" },
  { id: "eagle", ic: "🦅", name: "Eagle eye", how: "Count the stockroom right on the first try" },
  { id: "named", ic: "🪪", name: "Name badge", how: "Add your name to your profile" },
];
const BADGE = Object.fromEntries(BADGES.map(b => [b.id, b]));
let badgeAt = 0;
function award(id) {
  if (!BADGE[id] || save.badges[id]) return false;
  save.badges[id] = today(); persist();
  const b = BADGE[id], now = performance.now(), at = Math.max(now + 400, badgeAt); badgeAt = at + 2600;
  setTimeout(() => { badgeToast(b); Audio.play("fanfare"); }, at - now);
  return true;
}
function badgeToast(b) { const t = document.createElement("div"); t.className = "toast badge-toast fadein"; t.innerHTML = `<span class="bi">${b.ic}</span><span><small>Badge unlocked</small>${escH(b.name)}</span>`; document.body.append(t); setTimeout(() => t.remove(), 3400); }

/* ---------- promotion interviews ---------- */
const BEHAVE = [
  { min: 1, q: "A teammate is stuck and their work is due today. What do you do?", a: "Offer to help, or find someone who can", w: ["Ignore it, it's not your job", "Tell everyone they're slow", "Do their work and take the credit"] },
  { min: 1, q: "You find a mistake in work you already sent to a client. What do you do?", a: "Tell your manager and send a corrected version quickly", w: ["Hope nobody notices", "Blame the client's numbers", "Delete the email"] },
  { min: 1, q: "Two tasks are due at the same time. What's the best move?", a: "Ask your manager which matters most and agree on new times", w: ["Do neither", "Rush both and hand in messy work", "Pick the easier one without telling anyone"] },
  { min: 1, q: "Why should we promote you?", a: "I do careful work, help my team and learn from my mistakes", w: ["I've been here the longest", "I want a bigger salary", "Everyone else got promoted"] },
  { min: 2, q: "A client asks for extra work that wasn't part of the deal. What do you say?", a: "Politely say you'll check with your manager first", w: ["Yes to everything, for free", "Hang up on them", "Say no and walk out"] },
  { min: 2, q: "A new intern joins your team. What do you do?", a: "Show them around and explain how things work", w: ["Give them all your boring tasks", "Ignore them until they ask", "Tell them to figure it out"] },
  { min: 3, q: "You disagree with your boss's plan. What's the professional thing to do?", a: "Explain your view politely, with reasons", w: ["Complain to your coworkers", "Do it badly on purpose", "Say nothing and ignore the plan"] },
  { min: 4, q: "Your team missed its target this month. What do you do as the manager?", a: "Find out why together and plan how to fix it", w: ["Blame the newest person", "Hide the numbers", "Shout at the team"] },
  { min: 4, q: "A team member's work isn't good enough. How do you tell them?", a: "Privately, kindly and specifically, with ideas to improve", w: ["In front of everyone", "Never tell them", "Send an angry email to the whole office"] },
  { min: 5, q: "An important client is unhappy with your firm. What do you do?", a: "Call them, listen carefully and agree on a fix", w: ["Wait for them to calm down", "Send a discount code and nothing else", "Tell them they're wrong"] },
  { min: 6, q: "As a Partner, what matters most for the firm's future?", a: "Keeping clients' trust and growing good people", w: ["Winning every argument", "Working alone", "Cutting corners to finish faster"] },
];
const interviewer = target => target <= 3 ? { name: "Sara", role: "your manager", av: "S", col: "#2f3a4c" } : target <= 5 ? { name: "Khalid Haddad", role: "Director", av: "K", col: "#1c2633" } : { name: "Layla Haddad", role: "Managing Partner", av: "L", col: "#5a2a40" };
const interviewReady = () => { const c = career(); return c.rank < RANKS.length - 1 && c.xp >= XP_AT[c.rank + 1] && c.eng >= (c.ivWait || 0); };
const interviewEarned = () => { const c = career(); return c.rank < RANKS.length - 1 && c.xp >= XP_AT[c.rank + 1]; };

function newInterview() {
  const c = career(), target = c.rank + 1, seed = (Math.random() * 2 ** 31) | 0, r = mul32(seed), h = H(r), qs = [];
  const b = h.pick(BEHAVE.filter(x => x.min <= target && x.min >= target - 3));
  qs.push({ kind: "behave", title: "About you", brief: "", q: b.q, ...mcq(h, b.a, b.w), explain: `<b>${escH(b.a)}</b>.<br>Good professionals are honest, helpful and calm under pressure.` });
  let pool;
  if (isStudent()) { const tier = Math.min(4, YEAR_BASE[save.year] + Math.floor((target + (save.year === 4 ? 2 : 0)) / 3)); pool = TEMPLATES.filter(t => !t.cap && (t.kind === "mcq" || t.kind === "calc") && t.min <= tier && t.max >= tier - 1).map(t => [t, Math.max(t.min, Math.min(t.max, tier))]); const mine = pool.filter(([t]) => t.major === save.major); if (mine.length >= 4) pool = mine; }
  else { const ft = funTier(target); pool = FUN.filter(t => (t.kind === "mcq" || t.kind === "calc") && t.min <= ft).map(t => [t, Math.max(t.min, ft)]); const top = pool.filter(([t]) => t.min === ft); if (top.length >= 3) pool = top; }
  const ind = h.pick(INDUSTRIES), ctx = { client: "Falcon " + ind.sfx, exec: "the CEO", ind: ind.ind, prod: ind.prod, cost: ind.cost, per: ind.per, bay: 18 };
  for (const [t, tier] of h.pickN(pool, 2)) {
    const sd = (r() * 2 ** 31) | 0, d = t.gen(mul32(sd), tier, ctx);
    const opts = t.kind === "calc" ? numChoices(d, sd + 5) : { options: d.options, correct: d.correct };
    qs.push({ kind: t.kind, title: t.title, brief: d.brief, table: d.table, facts: d.facts, q: d.q, options: opts.options, correct: opts.correct, explain: d.explain });
  }
  return { target, qs, i: 0, right: 0, sel: null, picked: null, done: false };
}
function interviewAnswer() {
  const iv = state.iv, q = iv.qs[iv.i]; if (iv.sel === null || iv.picked !== null) return;
  iv.picked = iv.sel; if (iv.sel === q.correct) { iv.right++; Audio.play("good"); } else Audio.play("bad");
  renderUI();
}
function interviewNext() {
  const iv = state.iv; iv.i++; iv.sel = null; iv.picked = null;
  if (iv.i < iv.qs.length) { Audio.play("paper"); return renderUI(); }
  iv.done = true; const c = career(), pass = iv.right >= 2;
  if (pass) {
    const before = c.rank; c.rank = iv.target; c.ivWait = 0;
    award("promo"); if (iv.right === 3) award("ace"); if (c.failed) award("comeback"); c.failed = false;
    if (c.rank >= 4) award("manager"); if (c.rank === RANKS.length - 1) award("partner");
    state.promo = { before, after: c.rank, right: iv.right };
    persist(); Audio.play("promo"); state.ui = "promo"; renderUI();
  } else { c.ivWait = c.eng + 1; c.failed = true; persist(); Audio.play("bad"); renderUI(); }
}
