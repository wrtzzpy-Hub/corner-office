/* ============================== SURPRISE EVENTS ==============================
   One per job (most of the time): an urgent phone call, a lost item to return, or a coffee run. Each pays bonus points. */
const LOST = [
  { thing: "phone", x: 26.5, z: 15.45, y: .5, hint: "near the bench in the corridor" },
  { thing: "car keys", x: 45.4, z: 18.8, y: .8, hint: "on a table in the café" },
  { thing: "ID badge", x: 1, z: 10.9, y: .95, hint: "on the side cabinet in the meeting room" },
  { thing: "wallet", x: 13.4, z: 19.4, y: .9, hint: "on the boxes near the Stockroom door" },
  { thing: "sunglasses", x: 33.6, z: 10.2, y: .45, hint: "on the coffee table in the Executive suite" },
  { thing: "notebook", x: 7.1, z: 21.9, y: .42, hint: "on the round table in the Lobby" },
];
const EV_BONUS = { call: 50, lost: 40, coffee: 30 };
function planEvent(eng) {
  if (eng.ev !== undefined) return;
  const r = mul32(eng.seed + 4242), h = H(r);
  if (eng.tasks.length < 4 || r() < .2) { eng.ev = null; return; }
  const type = h.pick(["call", "lost", "coffee"]);
  eng.ev = { type, at: 1 + Math.floor(r() * Math.min(3, eng.tasks.length - 2)), status: "waiting", spot: type === "lost" ? Math.floor(r() * LOST.length) : 0 };
}
const evOf = () => ENG && ENG.ev;
function bonusAdd(label, pts) { ENG.bonus = ENG.bonus || []; ENG.bonus.push({ label, pts }); const e = save.cur[save.mode]; if (e) e.bonus = ENG.bonus; }
function syncEv() { const e = save.cur[save.mode]; if (e && ENG) { e.ev = ENG.ev; e.bonus = ENG.bonus; } persist(); state.coffee = ENG && ENG.ev && ENG.ev.type === "coffee" && ["fetch", "carry"].includes(ENG.ev.status) ? ENG.ev.status : null; }
function maybeFireEvent() {
  const ev = evOf(); if (!ev || ev.status !== "waiting" || !ENG.briefed || doneCount() < ev.at || allTasksDone()) return false;
  ev.status = "offered"; syncEv();
  if (ev.type === "call") { Audio.play("ring"); setTimeout(() => Audio.play("ring"), 1300); }
  else Audio.play("blip");
  openUI("event"); return true;
}
function eventCard() {
  const ev = evOf(), c = ENG.client, lost = LOST[ev.spot];
  if (ev.type === "call") return { who: c.exec, role: c.role, av: c.exec[0], col: "#1c2633", h: "📞 Urgent call!", body: `"${hi("Hello")}! It's ${esc(firstName(c.exec))}. I've got a quick question and I need an answer in the next 30 seconds."`, yes: "Answer the phone", no: "Let it ring", bonus: EV_BONUS.call };
  if (ev.type === "lost") return { who: "Mariam", role: "Reception", av: "M", col: "#5a4a30", h: `A visitor lost their ${lost.thing}`, body: `"${hi("Excuse me")}! A visitor left their <b>${lost.thing}</b> somewhere. They think it's ${lost.hint}. Could you find it and bring it to me at reception?"`, yes: "I'll look for it", no: "Not now", bonus: EV_BONUS.lost };
  return { who: "Sara", role: bossTitle(), av: "S", col: "#2f3a4c", h: "Coffee run?", body: `"I'm buried in work${myName() ? ", " + esc(myName()) : ""}. Could you pick up the team's coffee order from the café at the east end and bring it to me in the meeting room?"`, yes: "Sure!", no: "Not now", bonus: EV_BONUS.coffee };
}
function acceptEvent() {
  const ev = evOf(); if (!ev) return;
  if (ev.type === "call") { ev.status = "call"; syncEv(); state.call = makeCall(); Audio.play("click"); openUI("call"); startCallTimer(); return; }
  ev.status = ev.type === "lost" ? "search" : "fetch"; syncEv(); Audio.play("stamp"); closeUI(); guideT = 0;
  toast(ev.type === "lost" ? `Find the ${LOST[ev.spot].thing}: ${LOST[ev.spot].hint}.` : "Head to the café at the east end of the corridor.");
}
function declineEvent() { const ev = evOf(); if (ev) { ev.status = "declined"; syncEv(); } Audio.play("paper"); closeUI(); }

/* ---------- urgent call ---------- */
function makeCall() {
  const seed = (Math.random() * 2 ** 31) | 0, r = mul32(seed), h = H(r);
  let pool;
  if (isStudent()) { const tier = baseTier(); pool = TEMPLATES.filter(t => !t.cap && (t.kind === "mcq" || t.kind === "calc") && t.min <= tier && t.max >= tier - 1 && t.major === save.major).map(t => [t, Math.max(t.min, Math.min(t.max, tier))]); if (pool.length < 2) pool = TEMPLATES.filter(t => !t.cap && (t.kind === "mcq" || t.kind === "calc") && t.min <= tier).map(t => [t, Math.max(t.min, Math.min(t.max, tier))]); }
  else { const ft = funTier(curRank()); pool = FUN.filter(t => (t.kind === "mcq" || t.kind === "calc") && t.min <= ft).map(t => [t, Math.max(t.min, ft)]); }
  const [t, tier] = h.pick(pool), d = t.gen(mul32(seed + 3), tier, ctxOf(ENG));
  const opts = t.kind === "calc" ? numChoices(d, seed + 5) : { options: d.options, correct: d.correct };
  return { title: t.title, brief: d.brief, table: d.table, facts: d.facts, q: d.q, options: opts.options, correct: opts.correct, explain: d.explain, end: performance.now() + 30000, sel: null, picked: null, timedOut: false };
}
let callTimer = null;
function startCallTimer() {
  clearInterval(callTimer);
  callTimer = setInterval(() => {
    const c = state.call; if (!c || c.picked !== null || state.ui !== "call") { clearInterval(callTimer); return; }
    const left = Math.max(0, Math.ceil((c.end - performance.now()) / 1000)), el = document.getElementById("calltime");
    if (el) { el.textContent = left + "s"; el.classList.toggle("low", left <= 10); }
    if (left <= 0) { c.timedOut = true; finishCall(-1); }
  }, 250);
}
function finishCall(choice) {
  const c = state.call, ev = evOf(); if (!c || c.picked !== null) return;
  clearInterval(callTimer); c.picked = choice; const ok = choice === c.correct;
  ev.status = ok ? "won" : "lost"; if (ok) bonusAdd("Urgent call", EV_BONUS.call); syncEv();
  Audio.play(ok ? "good" : "bad"); renderUI();
}

/* ---------- lost item and coffee ---------- */
function eventInter() {
  const ev = evOf(); if (!ev) return;
  if (ev.type === "lost" && ev.status === "search") { const L = LOST[ev.spot]; INTER.push({ id: "lost", x: L.x, z: L.z, y: L.y + .35, ap: [L.x, L.z], room: roomKey(L.x, L.z), reach: 2.4, label: `Lost ${L.thing}`, verb: `Pick up the ${L.thing}`, fixed: true, lost: true, place: L.hint }); }
  if (ev.type === "lost" && ev.status === "carry") { const m = INTER.find(i => i.id === "mariam"); if (m) m.verb = `Return the ${LOST[ev.spot].thing}`; }
  if (ev.type === "coffee" && ev.status === "carry") { const s = INTER.find(i => i.id === "sara"); if (s) s.verb = "Give Sara the coffees"; }
}
function eventInteract(it) {
  const ev = evOf(); if (!ev) return false;
  if (it.id === "lost" && ev.status === "search") { ev.status = "carry"; syncEv(); Audio.play("task"); toast(`Found the ${LOST[ev.spot].thing}! Take it to Mariam at reception.`); rebuildInter(); guideT = 0; return true; }
  if (it.id === "mariam" && ev.type === "lost" && ev.status === "carry") { ev.status = "won"; bonusAdd(`Returned the ${LOST[ev.spot].thing}`, EV_BONUS.lost); syncEv(); Audio.play("fanfare"); toast(`Mariam: "Thank you so much! You're a star." +${EV_BONUS.lost} bonus`); rebuildInter(); guideT = 0; return true; }
  if (it.id === "sara" && ev.type === "coffee" && ev.status === "carry") { ev.status = "won"; bonusAdd("Coffee run", EV_BONUS.coffee); syncEv(); Audio.play("fanfare"); toast(`Sara: "You're a lifesaver!" +${EV_BONUS.coffee} bonus`); rebuildInter(); guideT = 0; return true; }
  return false;
}
function eventObjective() {
  const ev = evOf(); if (!ev) return null;
  if (ev.type === "lost" && ev.status === "search") return { t: `Bonus: find the lost ${LOST[ev.spot].thing}`, s: `Try ${LOST[ev.spot].hint}` };
  if (ev.type === "lost" && ev.status === "carry") return { t: `Bonus: return the ${LOST[ev.spot].thing}`, s: "Mariam at reception", cur: true };
  if (ev.type === "coffee" && ev.status === "fetch") return { t: "Bonus: pick up the coffees", s: "The café, east end", cur: true };
  if (ev.type === "coffee" && ev.status === "carry") return { t: "Bonus: bring the coffees to Sara", s: "Meeting room", cur: true };
  return null;
}
