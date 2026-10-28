const resOf = k => k === "practice" ? state.practiceRes : (ENG.res[k] || (ENG.res[k] = { status: "todo", attempts: 0 }));
const isDone = k => ENG && ENG.res[k] && ENG.res[k].status === "done";
const doneCount = () => ENG ? ENG.list.filter(t => isDone(t.key)).length : 0;
const allTasksDone = () => ENG && doneCount() === ENG.list.length;
function storeEng() { if (!ENG) return; const e = save.cur[save.mode]; if (e) { e.res = ENG.res; e.briefed = ENG.briefed; } persist(); }

/* ============================== AI MENTOR (optional) ============================== */
let sample = null, aiState = "off";
if (window.claude && typeof window.claude.use === "function") {
  aiState = "loading";
  window.claude.use("sample").then(s => { sample = s; aiState = s ? "ready" : "off"; if (state.ui === "task") renderUI(); }).catch(() => { aiState = "off"; });
}

/* ============================== UI STATE ============================== */
const SPAWN = { x: 8.4, z: 20.6, yaw: .75, pitch: 0 };
const state = { ui: save.onboarded ? "hub" : "ob0", obReturn: null, player: { ...SPAWN }, task: null, sel: null, picks: new Set(), cls: {}, msg: "", hintOpen: false, mentor: "", mentorBusy: false, confirm: null, report: null, note: null, practiceTask: null, practiceRes: null, practiceFrom: null };

/* ============================== HQ (walking around your own firm) ============================== */
const hqWalk = () => !ENG && save.onboarded;
const hqCfg = () => { const rank = curRank(); return { rank, ws: WS_OF(rank), color: save.color, name: myName(), badges: Object.keys(save.badges).length, owned: SHOP.filter(i => save.owned[i.id] && canPlace(i)).map(i => i.id) }; };
let hqKey = "";
function ensureHQWorld(force) {
  if (ENG || !prog) return;
  const c = hqCfg(), k = JSON.stringify(c);
  if (k === hqKey && !force) return;
  hqKey = k; NPCS.exec.mesh = "execS"; uploadWorld({ palette: 0, bay: 18, stripe: "#c8372d", seed: 1, hq: c }); rebuildInter();
}
const MYSPACE = { hot: { x: 15, z: 10.35, y: 1.25, ap: [15, 11.55], room: "fin", place: "the hot desk on the Finance floor" }, desk: { x: 15, z: 10.35, y: 1.25, ap: [15, 11.55], room: "fin", place: "your desk on the Finance floor" }, office: { x: 39, z: 4.2, y: 1.6, ap: [39, 6.6], room: "office", place: "your private office", reach: 3 }, corner: { x: 45, z: 4.4, y: 1.7, ap: [45, 7.1], room: "corner", place: "the corner office", reach: 3.2 } };
const WS_NAME = { hot: "Hot desk", desk: "Your desk", office: "Your office", corner: "The corner office" };
const GREET = [
  ["Hi! You must be the new intern.", "Welcome aboard! The café makes great karak.", "Morning! Ask Sara if you get stuck.", "First week? You'll love it here."],
  ["Morning, {n}!", "Hey {n}, nice work on that last job.", "Hi {n}! Lunch later?", "{n}! Did you see the new café menu?"],
  ["Good morning, {n}.", "{n}! Thanks for your help last week.", "Congrats on the promotion, {n}!", "Got a minute later, {n}? I'd love your advice."],
  ["Good morning, {n}. Can I get you a coffee?", "Big fan of your work, {n}.", "The whole floor's talking about your last report, {n}.", "{n}! The team's in great shape thanks to you."],
  ["Good morning, Partner!", "{n}, it's an honour.", "Welcome back, {n}. Your 10 o'clock is ready.", "Everyone's still talking about your promotion, {n}!"]];
const CLIENT_GREET = [
  ["Are you the intern from Haddad & Partners?", "Hi! Sara said you'd be coming.", "Welcome! Shout if you need anything."],
  ["Welcome, {n}!", "Hi {n}, good to see you again.", "Morning! Thanks for coming in, {n}."],
  ["Good morning, {n}. Thanks for helping us.", "{n}! Our boss can't stop talking about your work.", "Welcome back, {n}."],
  ["It's great to have someone senior here, {n}.", "Good morning, {n}. Coffee?", "Welcome, {n}. We've cleared the meeting room for you."],
  ["A Partner from Haddad & Partners! It's an honour.", "Good morning, {n}. Welcome!", "Everyone's on their best behaviour today, {n}!"]];
const respectTier = rk => rk === 0 ? 0 : rk <= 2 ? 1 : rk <= 4 ? 2 : rk <= 6 ? 3 : 4;
function greetLine(cw) {
  const L = (ENG ? CLIENT_GREET : GREET)[respectTier(curRank())], n = myName() || RANKS[curRank()];
  cw.gi = ((cw.gi ?? Math.floor(Math.random() * L.length)) + 1) % L.length;
  if (cw.barista) return ["What can I get you, {n}?", "Karak's fresh, {n}!", "The usual, {n}?"][cw.gi % 3].replace(/\{n\}/g, n);
  return L[cw.gi].replace(/\{n\}/g, n);
}

/* ============================== INTERACTABLES ============================== */
let INTER = [];
const firstName = n => n.split(" ")[0];
function stationTasks(st) { return ENG ? ENG.list.filter(t => t.st === st) : []; }
function rebuildInter() {
  INTER = [];
  INTER.push({ id: "mariam", ...FIXED.mariam, label: "Mariam · Reception", verb: "Talk to Mariam", fixed: true });
  for (const c of CW) INTER.push({ id: "cw:" + c.id, cw: c, x: c.x, z: c.z, y: c.mesh.endsWith("_s") ? 1.55 : 2.0, ap: c.barista ? [45, 21.55] : [c.x, c.z], room: roomKey(c.x, c.z), label: `${c.name} · ${c.role}`, place: c.barista ? "the café" : c.office === "corner" ? "the corner office" : ROOMS.find(r => r.key === roomKey(c.x, c.z)).name.toLowerCase().replace(/^/, "the "), verb: c.barista ? (state.coffee === "fetch" ? "Pick up the coffee order" : "Order a coffee") : `Say hi to ${c.name.split(" ")[0]}`, reach: c.barista ? 2.6 : 2.2, cwTag: true });
  if (!ENG) {
    const hc = hqCfg(), ms = MYSPACE[hc.ws], ivw = interviewReady() ? interviewer(curRank() + 1) : null;
    INTER.push({ id: "myspace", ...ms, label: hc.ws === "hot" ? "Hot desk · interns" : `${myName() || "You"} · ${RANKS[hc.rank]}`, verb: openDeal() ? "Check your inbox (1 new)" : hc.ws === "hot" ? "Sit at the hot desk" : `Sit at ${WS_NAME[hc.ws].toLowerCase()}`, fixed: true, mine: true });
    INTER.push({ id: "sara", ...FIXED.sara, label: `Sara · ${RANKS[Math.min(5, Math.max(4, curRank() + 1))]}`, verb: ivw && ivw.name === "Sara" ? "Start your promotion interview" : "Ask Sara for a job", fixed: true });
    INTER.push({ id: "khalid", x: NPCS.exec.x, z: NPCS.exec.z, y: 2.15, room: "exec", ap: STATIONS.exec.ap, reach: 4, label: "Khalid Haddad · Director", place: "the Executive suite", verb: ivw && ivw.name === "Khalid Haddad" ? "Start your promotion interview" : "Say hello to Khalid", fixed: true });
    INTER.push({ id: "boardtable", x: 6, z: 5.9, y: 1.35, room: "meet", ap: [6, 7.85], label: "Board meeting", verb: boardReady() ? "Start today's board meeting" : "The board meets again tomorrow", fixed: true, place: "the meeting room" });
    INTER.push({ id: "till", x: 43.6, z: 22.6, y: 1.5, room: "cafe", ap: [43.6, 21.55], reach: 2.2, label: "Till · mini-game", verb: "Run the till (mini-game)", fixed: true, place: "the café" });
    INTER.push({ id: "ravi", x: 30.5, z: 19.6, y: 2.1, room: "stock", ap: [30.5, 21.1], label: "Ravi · Stockroom", verb: "Help Ravi sort stock (mini-game)", fixed: true, place: "the Stockroom" });
    const lay = CW.find(c => c.id === "layla"); if (lay && ivw && ivw.name === "Layla Haddad") { const it = INTER.find(i => i.id === "cw:layla"); it.verb = "Start your promotion interview"; it.ap = [45, 6.9]; it.reach = 3.9; }
  }
  if (ENG) {
    INTER.push({ id: "notice", ...FIXED.notice, label: "Notice board", verb: "Read the client fact sheet", fixed: true });
    const capPending = ENG.capT && !isDone("cap");
    INTER.push({ id: "sara", ...FIXED.sara, label: `Sara · ${bossTitle()}`, verb: !ENG.briefed ? "Get your briefing" : allTasksDone() ? (capPending ? "Give your recommendation" : "Hand in your report") : "Check in with Sara", fixed: true });
    for (const [id, s] of Object.entries(STATIONS)) {
      const ts = stationTasks(id); if (!ts.length) continue;
      const pend = ts.filter(t => !isDone(t.key)); let label, verb;
      if (id === "exec") { label = `${ENG.client.exec} · ${ENG.client.role}`; verb = pend.length ? `Talk to ${firstName(ENG.client.exec)}` : "Review your answers"; }
      else if (id === "ravi") { label = "Ravi · Stockroom"; verb = pend.length ? "Talk to Ravi" : "Review your answers"; }
      else { label = ts[0].T.title; verb = pend.length ? `Start: ${ts[0].T.title}` : `Review: ${ts[0].T.title}`; }
      INTER.push({ id, ...s, label, verb, station: true, done: !pend.length, title: (pend[0] || ts[0]).T.title });
    }
  }
  if (ENG) eventInter();
  if (near) near = INTER.find(i => i.id === near.id) || null;
  syncTags(); guideT = 0;
}

/* ============================== INPUT ============================== */
const keys = {}; let locked = false, dragging = false, lastX = 0, lastY = 0;
const isTouch = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
let joy = null, lookTouch = null, bob = 0, stepT = 0, near = null, moved = 0, promptKey = "";
const R = .3;
const blocked = (x, z) => blockedR(x, z, R) || CW.some(c => c.path && Math.hypot(c.x - x, c.z - z) < .55);
const paused = () => state.ui !== null || !!state.cam;
addEventListener("keydown", e => {
  if (paused()) { if (e.key === "Escape" && ENG && ["task", "overview", "note"].includes(state.ui)) closeUI(); return; }
  keys[e.code] = true;
  if (e.key === "Escape" && hqWalk()) { openUI("hub"); return; }
  if (e.code === "KeyE" || e.code === "Enter") interact();
  if (e.code === "KeyT" || e.code === "Tab") { e.preventDefault(); if (ENG) openUI("overview"); }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
});
addEventListener("keyup", e => { keys[e.code] = false; });
addEventListener("blur", () => { for (const k in keys) keys[k] = false; });
cv.addEventListener("click", () => { if (paused() || isTouch) return; try { const p = cv.requestPointerLock && cv.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} });
document.addEventListener("pointerlockchange", () => { locked = document.pointerLockElement === cv; });
cv.addEventListener("mousedown", e => { if (!locked && !isTouch) { dragging = true; lastX = e.clientX; lastY = e.clientY; } });
addEventListener("mouseup", () => { dragging = false; });
addEventListener("mousemove", e => {
  if (paused()) return;
  if (locked) { if (Math.abs(e.movementX) < 250 && Math.abs(e.movementY) < 250) look(e.movementX, e.movementY, .0022); }
  else if (dragging) { look(e.clientX - lastX, e.clientY - lastY, .005); lastX = e.clientX; lastY = e.clientY; }
});
function look(dx, dy, s) { const p = state.player; p.yaw -= dx * s; p.pitch = Math.max(-1.25, Math.min(1.25, p.pitch - dy * s)); }
const stick = document.getElementById("stick"), knob = stick.firstElementChild;
cv.addEventListener("touchstart", e => {
  if (paused()) return; e.preventDefault();
  for (const t of e.changedTouches) {
    if (t.clientX < innerWidth * .45 && !joy) { joy = { id: t.identifier, x: t.clientX, y: t.clientY, dx: 0, dy: 0 }; stick.style.left = t.clientX + "px"; stick.style.top = t.clientY + "px"; stick.hidden = false; knob.style.transform = ""; }
    else if (!lookTouch) lookTouch = { id: t.identifier, x: t.clientX, y: t.clientY };
  }
}, { passive: false });
cv.addEventListener("touchmove", e => {
  e.preventDefault();
  for (const t of e.changedTouches) {
    if (joy && t.identifier === joy.id) { let dx = t.clientX - joy.x, dy = t.clientY - joy.y; const m = Math.hypot(dx, dy), max = 50; if (m > max) { dx *= max / m; dy *= max / m; } joy.dx = dx / max; joy.dy = dy / max; knob.style.transform = `translate(${dx}px,${dy}px)`; }
    else if (lookTouch && t.identifier === lookTouch.id) { look(t.clientX - lookTouch.x, t.clientY - lookTouch.y, .006); lookTouch.x = t.clientX; lookTouch.y = t.clientY; }
  }
}, { passive: false });
const endTouch = e => { for (const t of e.changedTouches) { if (joy && t.identifier === joy.id) { joy = null; stick.hidden = true; } if (lookTouch && t.identifier === lookTouch.id) lookTouch = null; } };
cv.addEventListener("touchend", endTouch); cv.addEventListener("touchcancel", endTouch);
document.getElementById("tbtn").addEventListener("click", () => interact());

function update(dt) {
  const p = state.player; let f = 0, s = 0;
  if (!paused()) {
    if (keys.KeyW || keys.ArrowUp) f += 1; if (keys.KeyS || keys.ArrowDown) f -= 1;
    if (keys.KeyD) s += 1; if (keys.KeyA) s -= 1;
    if (keys.ArrowLeft) p.yaw += 2.2 * dt; if (keys.ArrowRight) p.yaw -= 2.2 * dt;
    if (joy) { f -= joy.dy; s += joy.dx; }
  } else if (!ENG || ["hub", "ob0", "ob1", "ob2", "ob3", "ladder"].includes(state.ui)) p.yaw += dt * .06;
  const m = Math.hypot(f, s);
  if (m > .12) {
    if (m > 1) { f /= m; s /= m; }
    const sprint = keys.ShiftLeft || keys.ShiftRight, sp = (sprint ? 5.4 : 3.4) * dt;
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
    const dx = (fx * f + rx * s) * sp, dz = (fz * f + rz * s) * sp, x0 = p.x, z0 = p.z;
    const stuck = blocked(p.x, p.z);
    if (stuck || !blocked(p.x + dx, p.z)) p.x += dx; if (stuck || !blocked(p.x, p.z + dz)) p.z += dz;
    moved += Math.hypot(p.x - x0, p.z - z0);
    const rate = sprint ? 13 : 9.5; bob += dt * rate * Math.min(1, m); stepT += dt * rate * Math.min(1, m);
    if (stepT > Math.PI) { stepT -= Math.PI; Audio.play("step", roomAt(p.x, p.z).surface); }
  } else bob *= .9;
  const turn = (n, target, k = 4) => { let diff = target - n.rot; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2; n.rot += diff * Math.min(1, dt * k); };
  for (const n of Object.values(NPCS)) { const d = Math.hypot(p.x - n.x, p.z - n.z); turn(n, d < 5 ? Math.atan2(p.x - n.x, p.z - n.z) : n.base); }
  for (const c of CW) {
    const d = Math.hypot(p.x - c.x, p.z - c.z);
    if (c.path) {
      const tg = c.path[c.seg ? 0 : 1], dx = tg[0] - c.x, dz = tg[1] - c.z, L = Math.hypot(dx, dz), fx2 = dx / (L || 1), fz2 = dz / (L || 1);
      const ahead = (p.x - c.x) * fx2 + (p.z - c.z) * fz2, wait = d < 1.6 && ahead > -.2;
      c.moving = false;
      if (c.pause > 0) c.pause -= dt;
      else if (!wait) { const st = Math.min(L, c.speed * dt); c.x += fx2 * st; c.z += fz2 * st; c.moving = true; c.t += dt; if (L < .05) { c.seg = 1 - c.seg; c.pause = 1.5 + Math.random() * 2; } }
      turn(c, c.moving ? Math.atan2(fx2, fz2) : d < 3 ? Math.atan2(p.x - c.x, p.z - c.z) : c.rot, c.moving ? 8 : 4);
    } else if (!c.mesh.endsWith("_s")) turn(c, d < 4 ? Math.atan2(p.x - c.x, p.z - c.z) : c.base);
    if (c.sayT > 0) c.sayT -= dt;
    if (!paused() && !c.greeted && d < 3.2 && visible(c.x, c.z)) { c.greeted = true; c.say = greetLine(c); c.sayT = 3.6; }
    if (d > 7) c.greeted = false;
  }
  for (const it of INTER) if (it.cw) { it.x = it.cw.x; it.z = it.cw.z; if (it.cw.path) it.ap = [it.cw.x, it.cw.z]; }
  const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw); let best = null, bs = 1e9;
  if (!paused()) for (const it of INTER) {
    if (it.station && !ENG.briefed) continue;
    if (it.cwTag && ENG && !ENG.briefed && !it.cw.barista) continue;
    const dx = it.x - p.x, dz = it.z - p.z, d = Math.hypot(dx, dz);
    if (d > (it.reach || 2.5)) continue;
    const dot = (dx * fx + dz * fz) / (d || 1); if (dot < .3 && d > 1.2) continue;
    const sc = d - dot + (it === guide.it ? -.6 : 0); if (sc < bs) { bs = sc; best = it; }
  }
  if (best !== near) { near = best; if (near) Audio.play("blip"); }
  const pk = near && !paused() ? near.id + near.verb : ""; if (pk !== promptKey) { promptKey = pk; updatePrompt(); }
}
function segX(ax, az, bx, bz, cx, cz, dx, dz) {
  const r1x = bx - ax, r1z = bz - az, r2x = dx - cx, r2z = dz - cz, den = r1x * r2z - r1z * r2x;
  if (Math.abs(den) < 1e-9) return false;
  const t = ((cx - ax) * r2z - (cz - az) * r2x) / den, u = ((cx - ax) * r1z - (cz - az) * r1x) / den;
  return t > 0.001 && t < .999 && u >= -0.02 && u <= 1.02;
}
const visible = (x, z) => !walls2d.some(w => segX(state.player.x, state.player.z, x, z, w[0], w[1], w[2], w[3]));

/* ============================== GUIDANCE ============================== */
const guide = { it: null, pts: [], dist: 0 }; let guideT = 0;
const interById = id => INTER.find(i => i.id === id);
function pathLen(pts) { let d = 0, a = [state.player.x, state.player.z]; for (const q of pts) { d += Math.hypot(q[0] - a[0], q[1] - a[1]); a = q; } return d; }
function pickGuide() {
  if (!ENG) {
    if (!hqWalk()) return null;
    if (state.coffee === "fetch") return interById("cw:hamza");
    if (interviewReady()) return INTER.find(i => i.verb === "Start your promotion interview") || null;
    if (openDeal()) return interById("myspace");
    if (!state.hqSeen) return interById("myspace");
    return interById("sara");
  }
  if (state.coffee === "fetch") return interById("cw:hamza");
  if (state.coffee === "carry") return interById("sara");
  if (evOf() && evOf().type === "lost" && evOf().status === "carry") return interById("mariam");
  if (!ENG.briefed || allTasksDone()) return interById("sara");
  let best = null, bd = 1e9;
  for (const it of INTER) if (it.station && !it.done) { const d = pathLen(pathTo(state.player, it)); if (d < bd) { bd = d; best = it; } }
  return best;
}
function updateGuide(dt) {
  guideT -= dt; if (guideT <= 0) { const g = pickGuide(); guideT = .6; if (g !== guide.it) { guide.it = g; if (state.ui === null) renderHud(); } }
  if (!guide.it) { guide.pts = []; return; }
  guide.pts = pathTo(state.player, guide.it); guide.dist = pathLen(guide.pts) + Math.hypot(guide.it.ap[0] - guide.it.x, guide.it.ap[1] - guide.it.z) * .5;
}
function buildPathMesh(t) {
  const a = []; if (!guide.it || paused()) return a;
  const p = state.player, poly = [[p.x, p.z], ...guide.pts], sp = .8; let s = .9 + (t * 1.6) % sp, acc = 0, count = 0;
  const c = [1, .88, .3];
  const arm = (tx, tz, bx, bz) => { const L = Math.hypot(bx - tx, bz - tz), nx = -(bz - tz) / L * .045, nz = (bx - tx) / L * .045, y = .03; quad("white", [[tx + nx, y, tz + nz], [tx - nx, y, tz - nz], [bx - nx, y, bz - nz], [bx + nx, y, bz + nz]], [0, 1, 0], c, 1, [[0, 0], [0, 0], [0, 0], [0, 0]]); };
  const prev = CUR; CUR = { white: a };
  for (let i = 0; i < poly.length - 1 && count < 28; i++) {
    const A = poly[i], Bp = poly[i + 1], L = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]); if (L < 1e-3) continue;
    const dx = (Bp[0] - A[0]) / L, dz = (Bp[1] - A[1]) / L;
    while (s <= acc + L && count < 28) { const u = s - acc, x = A[0] + dx * u, z = A[1] + dz * u, tx = x + dx * .2, tz = z + dz * .2; arm(tx, tz, x - dx * .12 - dz * .2, z - dz * .12 + dx * .2); arm(tx, tz, x - dx * .12 + dz * .2, z - dz * .12 - dx * .2); s += sp; count++; }
    acc += L;
  }
  CUR = prev; return a;
}

/* ============================== FRAME ============================== */
const labelsEl = document.getElementById("labels");
let tagEls = [], signEls = [], SIGNS = [], bubbleEls = new Map();
function syncTags() {
  tagEls.forEach(e => e.remove()); tagEls = INTER.map(it => { const d = document.createElement("div"); d.className = "tag"; d.textContent = it.label; labelsEl.append(d); return d; });
  signEls.forEach(e => e.remove()); bubbleEls.forEach(e => e.remove()); bubbleEls = new Map();
  const c = ENG && ENG.client, P = PALETTES[ENG ? ENG.palette : 0];
  const hc = c ? null : hqCfg(), who = hc ? (myName() || "Your") + (myName() ? "'s" : "") : "";
  SIGNS = [{ t: "Meeting room", x: 6, y: 2.75, z: 12.3 }, { t: "Finance floor", x: 18, y: 2.75, z: 12.3 }, { t: c ? `${c.role} · ${c.exec.split(" ").slice(-1)[0]}` : "Director · Haddad", x: 30, y: 2.75, z: 12.3 }, { t: "Stockroom", x: 22, y: 2.8, z: 15.7 },
    { t: hc && hc.ws === "office" ? `${who} office` : "Senior Manager", x: 39, y: 2.75, z: 12.3, mine: hc && hc.ws === "office" }, { t: hc ? (hc.ws === "corner" ? `${who} corner office` : "Managing Partner") : "Chairman", x: 45, y: 2.75, z: 12.3, mine: hc && hc.ws === "corner" }, { t: "The Ledger Café", x: 41.5, y: 2.8, z: 15.7 }];
  signEls = SIGNS.map(s => { const d = document.createElement("div"); d.className = "sign" + (s.mine ? " mine" : ""); d.style.background = s.mine ? save.color : P.sign; d.textContent = s.t; labelsEl.append(d); return d; });
}
let last = performance.now(), PV, pathGL = null;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
  update(dt); if ((ENG && !ENG.done) || hqWalk()) updateGuide(dt); else guide.it = null;
  if (ENG && ["task", "overview", "note", "brief", "report", "promo", "event", "call", "interview", "badges", "board", "till", "sort", "shop", "clients", "inbox"].includes(state.ui)) { requestAnimationFrame(frame); return; }
  const dpr = Math.min(2, devicePixelRatio || 1), w = Math.floor(cv.clientWidth * dpr), h = Math.floor(cv.clientHeight * dpr);
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const p = state.player, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const by = reduce ? 0 : Math.sin(bob) * .04, bx = reduce ? 0 : Math.cos(bob * .5) * .022;
  const cp = state.cam ? camNow(now) : null;
  const ex = cp ? cp.x : p.x + Math.cos(p.yaw) * bx, ez = cp ? cp.z : p.z - Math.sin(p.yaw) * bx, ey = cp ? cp.y : 1.65 + by;
  const Pm = persp(1.15, w / h, .05, 90), V = mul(rotX(-(cp ? cp.pitch : p.pitch)), mul(rotY(-(cp ? cp.yaw : p.yaw)), trans(-ex, -ey, -ez)));
  PV = mul(Pm, V);
  gl.uniformMatrix4fv(loc.uP, false, Pm); gl.uniformMatrix4fv(loc.uV, false, V); gl.uniform3f(loc.uFog, .1, .13, .2); gl.uniform3f(loc.uEye, ex, ey, ez);
  gl.uniform1f(loc.uAlpha, 1); gl.disable(gl.BLEND); gl.depthMask(true);
  gl.uniformMatrix4fv(loc.uM, false, I4);
  for (const s of staticBufs) { gl.uniform2f(loc.uScroll, s.tex === "ticker" ? (t * .045) % 1 : 0, 0); drawBuf(s); }
  gl.uniform2f(loc.uScroll, 0, 0);
  for (const c of CW) {
    const bobY = c.moving ? Math.abs(Math.sin(c.t * 7)) * .035 : Math.sin(t * 1.6 + c.x) * .006;
    gl.uniformMatrix4fv(loc.uM, false, mul(trans(c.x, bobY, c.z), rotY(c.rot)));
    for (const b of meshBufs[c.mesh]) drawBuf(b, .12);
  }
  for (const [k, n] of Object.entries(NPCS)) {
    if (k !== "mariam" && !ENG && !hqWalk() && state.ui !== "hub") continue;
    gl.uniformMatrix4fv(loc.uM, false, mul(trans(n.x, Math.sin(t * 1.6 + n.x) * .006, n.z), rotY(n.rot)));
    for (const b of meshBufs[n.mesh]) drawBuf(b, .12);
  }
  const lost = INTER.find(i => i.lost);
  if (lost) { gl.uniformMatrix4fv(loc.uM, false, mul(trans(lost.x, lost.y - .25 + Math.sin(t * 3) * .03, lost.z), rotY(t * 1.2))); drawBuf({ tex: "white", ...fxBufs.item }, .5); }
  const it = guide.it && !paused() ? guide.it : null, far = it ? Math.min(1, Math.max(0, (Math.hypot(it.x - p.x, it.z - p.z) - 2.2) / 3)) : 0;
  if (it && far > .05) { gl.uniformMatrix4fv(loc.uM, false, mul(trans(it.x, it.y + .35 + Math.sin(t * 2.4) * .07, it.z), rotY(t * 1.8))); drawBuf({ tex: "white", ...fxBufs.gem }, 0); }
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
  if (it) {
    const arr = buildPathMesh(t);
    if (arr.length) { if (!pathGL) pathGL = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pathGL); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.DYNAMIC_DRAW); gl.uniformMatrix4fv(loc.uM, false, I4); gl.uniform1f(loc.uAlpha, .9); gl.bindTexture(gl.TEXTURE_2D, TEX.white.t); gl.uniform1f(loc.uSpec, 0); bind(pathGL); gl.drawArrays(gl.TRIANGLES, 0, arr.length / 12); }
  }
  gl.uniformMatrix4fv(loc.uM, false, I4); gl.uniform1f(loc.uAlpha, .17); for (const s of glassBufs) drawBuf(s, 1.4);
  if (it) {
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    if (far > .05) { gl.uniform1f(loc.uAlpha, (.13 + Math.sin(t * 3) * .04) * far); gl.uniformMatrix4fv(loc.uM, false, trans(it.x, 0, it.z)); drawBuf({ tex: "white", ...fxBufs.beam }, 0); }
    const sc = 1 + ((t * .8) % 1) * .8; gl.uniform1f(loc.uAlpha, .5 * (1 - (t * .8) % 1)); gl.uniformMatrix4fv(loc.uM, false, mul(trans(it.ap[0], .02, it.ap[1]), new Float32Array([sc, 0, 0, 0, 0, 1, 0, 0, 0, 0, sc, 0, 0, 0, 0, 1]))); drawBuf({ tex: "white", ...fxBufs.ring }, 0);
  }
  gl.depthMask(true); gl.disable(gl.BLEND); gl.uniform1f(loc.uAlpha, 1);
  placeLabels(w / dpr, h / dpr); drawMini(t); drawGuideHud(t); drawCoach();
  requestAnimationFrame(frame);
}
function project(x, y, z, W, H) {
  const m = PV, cx = m[0] * x + m[4] * y + m[8] * z + m[12], cy = m[1] * x + m[5] * y + m[9] * z + m[13], cw = m[3] * x + m[7] * y + m[11] * z + m[15];
  if (cw < .1) return null; return { x: (cx / cw * .5 + .5) * W, y: (1 - (cy / cw * .5 + .5)) * H, d: cw };
}
function placeLabels(W, H) {
  const p = state.player, hide = paused() && !ENG;
  INTER.forEach((it, i) => {
    const el = tagEls[i]; if (!el) return;
    const d = Math.hypot(it.x - p.x, it.z - p.z), show = !hide && !(it.station && !ENG.briefed) && d < (it.cwTag ? 6.5 : 12) && visible(it.x, it.z);
    const pr = show ? project(it.x, it.y, it.z, W, H) : null;
    if (!pr) { el.style.display = "none"; return; }
    el.style.display = ""; const sc = Math.max(.75, Math.min(1.15, 3 / pr.d + .5));
    el.style.transform = `translate(${pr.x}px,${pr.y}px) translate(-50%,-100%) scale(${sc})`;
    el.className = "tag" + (it.cwTag ? " cw" : "") + (it.mine ? " mine" : "") + (near === it ? " hot" : it === guide.it ? " todo" : it.done ? " done" : "");
  });
  CW.forEach(c => {
    let el = bubbleEls.get(c); if (!el) { el = document.createElement("div"); el.className = "bubble"; labelsEl.append(el); bubbleEls.set(c, el); }
    const on = c.sayT > 0 && !hide && !paused(), pr = on ? project(c.x, c.mesh.endsWith("_s") ? 1.85 : 2.25, c.z, W, H) : null;
    if (!pr) { el.style.display = "none"; return; }
    if (el.textContent !== c.say) el.textContent = c.say;
    el.style.display = ""; el.style.opacity = Math.min(1, c.sayT * 2); el.style.transform = `translate(${pr.x}px,${pr.y}px) translate(-50%,-100%)`;
  });
  SIGNS.forEach((s, i) => {
    const el = signEls[i], d = Math.hypot(s.x - p.x, s.z - p.z);
    const pr = d < 16 && visible(s.x, s.z) ? project(s.x, s.y, s.z, W, H) : null;
    if (!pr) { el.style.display = "none"; return; }
    el.style.display = ""; el.style.transform = `translate(${pr.x}px,${pr.y}px) translate(-50%,-50%) scale(${Math.max(.35, Math.min(1.3, 4 / pr.d))})`;
  });
}
const mini = document.getElementById("mini"), mx = mini.getContext("2d");
function drawMini(t) {
  if (mini.hidden) return;
  const W = mini.width, H = mini.height, s = Math.min(W / 49, H / 25), ox = (W - 48 * s) / 2, oy = (H - 24 * s) / 2, k = W / 180;
  mx.clearRect(0, 0, W, H);
  ROOMS.forEach(r => { mx.fillStyle = r.key === "corr" ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.11)"; mx.fillRect(ox + r.x0 * s, oy + r.z0 * s, (r.x1 - r.x0) * s, (r.z1 - r.z0) * s); });
  mx.strokeStyle = "#93a3b5"; mx.lineWidth = 2; mx.beginPath(); walls2d.forEach(w => { mx.moveTo(ox + w[0] * s, oy + w[1] * s); mx.lineTo(ox + w[2] * s, oy + w[3] * s); }); mx.stroke();
  mx.strokeStyle = "rgba(160,200,230,.7)"; mx.setLineDash([3 * k, 2 * k]); mx.beginPath(); [[0, 12, 5], [7, 12, 17], [19, 12, 24], [36, 16, 40], [43, 16, 48]].forEach(([a, z, b]) => { mx.moveTo(ox + a * s, oy + z * s); mx.lineTo(ox + b * s, oy + z * s); }); mx.stroke(); mx.setLineDash([]);
  const p = state.player;
  if (guide.it) { mx.strokeStyle = "#f2df63"; mx.lineWidth = 2.5 * k; mx.beginPath(); mx.moveTo(ox + p.x * s, oy + p.z * s); guide.pts.forEach(q => mx.lineTo(ox + q[0] * s, oy + q[1] * s)); mx.stroke(); mx.fillStyle = "#f2df63"; mx.beginPath(); mx.arc(ox + guide.it.x * s, oy + guide.it.z * s, (3.5 + Math.sin(t * 5) * 1.2) * k, 0, 7); mx.fill(); }
  CW.forEach(c => { mx.fillStyle = "rgba(147,163,181,.8)"; mx.beginPath(); mx.arc(ox + c.x * s, oy + c.z * s, 1.6 * k, 0, 7); mx.fill(); });
  if (!ENG) { const ms = interById("myspace"); if (ms) { mx.fillStyle = save.color; mx.fillRect(ox + ms.x * s - 3 * k, oy + ms.z * s - 3 * k, 6 * k, 6 * k); } }
  INTER.forEach(it => { if (it.station && !it.done && ENG.briefed && it !== guide.it) { mx.fillStyle = "rgba(242,223,99,.55)"; mx.beginPath(); mx.arc(ox + it.x * s, oy + it.z * s, 2.2 * k, 0, 7); mx.fill(); } });
  mx.save(); mx.translate(ox + p.x * s, oy + p.z * s); mx.rotate(-p.yaw); mx.fillStyle = "#fff"; mx.strokeStyle = "#16212e"; mx.lineWidth = 1.5 * k;
  mx.beginPath(); mx.moveTo(0, -7 * k); mx.lineTo(5 * k, 5 * k); mx.lineTo(0, 2.5 * k); mx.lineTo(-5 * k, 5 * k); mx.closePath(); mx.fill(); mx.stroke(); mx.restore();
}
const guideEl = document.getElementById("guide"), coachEl = document.getElementById("coach");
let guideKey = "";
function drawGuideHud() {
  const show = !!(guide.it && !paused() && ((ENG && !ENG.done) || hqWalk()));
  guideEl.hidden = !show; if (!show) return;
  const p = state.player, it = guide.it, nearIt = near === it;
  let tx = it.x, tz = it.z; for (const q of guide.pts) { if (Math.hypot(q[0] - p.x, q[1] - p.z) > 1.0) { tx = q[0]; tz = q[1]; break; } }
  if (Math.hypot(it.ap[0] - p.x, it.ap[1] - p.z) < 1.3) { tx = it.x; tz = it.z; }
  const dx = tx - p.x, dz = tz - p.z, fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
  const ang = Math.atan2(dx * rx + dz * rz, dx * fx + dz * fz);
  guideEl.querySelector(".arr").style.transform = `rotate(${ang}rad)`;
  const what = it.id === "mariam" ? `Return the ${LOST[evOf().spot].thing} to Mariam` : it.id === "cw:hamza" ? "Pick up the coffee order at the café" : !ENG ? (it.verb === "Start your promotion interview" ? `Promotion interview with ${it.label.split(" · ")[0]}` : it.id === "myspace" ? `Visit ${WS_NAME[hqCfg().ws].toLowerCase()}` : "Talk to Sara to start a job") : state.coffee === "carry" && it.id === "sara" ? "Bring the coffees to Sara" : it.id === "sara" ? (!ENG.briefed ? "Get your briefing from Sara" : ENG.capT && !isDone("cap") ? "Give Sara your recommendation" : "Hand your report to Sara") : it.title;
  const where = nearIt ? (isTouch ? "Tap the yellow button" : "Press E to start") : `${it.place} · ${Math.max(1, Math.round(guide.dist))} m`;
  const key = what + where + nearIt;
  if (key !== guideKey) { guideKey = key; guideEl.classList.toggle("here", nearIt); guideEl.querySelector("b").textContent = what; guideEl.querySelector("span").textContent = where; }
}
let coachKey = "", coachTimer = 0;
function drawCoach() {
  let msg = "";
  if (ENG && !ENG.done && state.ui === null && save.coach < 4) {
    if (save.coach === 0 && moved > 2) { save.coach = 1; persist(); }
    if (save.coach === 0) msg = isTouch ? "<b>Drag your left thumb</b> to walk and <b>drag the right side</b> to look around." : "<b>Click the view</b>, then walk with <b>W A S D</b> and look around with the <b>mouse</b>.";
    else if (save.coach === 1) msg = "Follow the <b>yellow arrow</b> at the top and the <b>glowing path</b> on the floor to Sara.";
    else if (save.coach === 2) msg = `Your tasks are listed on the left. Follow the arrow to the first one and ${isTouch ? "tap the <b>yellow button</b>" : "press <b>E</b>"}.`;
    else if (save.coach === 3) { msg = `Nice work! Keep following the arrow. ${isTouch ? "Tap <b>Tasks</b>" : "Press <b>T</b>"} any time to see everything left to do.`; if (!coachTimer) coachTimer = performance.now(); if (performance.now() - coachTimer > 8000) { save.coach = 4; persist(); } }
  } else if (ENG && !ENG.done && state.ui === null && !isTouch && !locked) msg = "<b>Click the view</b> to look around with the mouse.";
  if (msg !== coachKey) { coachKey = msg; coachEl.hidden = !msg; coachEl.innerHTML = msg; }
}

/* ============================== HUD ============================== */
const hudEl = document.getElementById("hud"), objEl = document.getElementById("obj"), promptEl = document.getElementById("prompt"), tbtn = document.getElementById("tbtn");
const esc = escH;
function xpProgress() { const xp = career().xp, rk = curRank(); if (rk === RANKS.length - 1) return { rk, pct: 100, need: 0 }; return { rk, pct: Math.min(100, Math.max(0, (xp - XP_AT[rk]) / (XP_AT[rk + 1] - XP_AT[rk]) * 100)), need: Math.max(0, XP_AT[rk + 1] - xp) }; }
function renderHud() {
  const pr = xpProgress(), inEng = ENG && !ENG.done && state.ui !== "hub" && !String(state.ui).startsWith("ob");
  hudEl.innerHTML = `<div class="brand">Corner <b>Office</b></div>
    <div class="rankchip"><span class="hide-s">${esc(RANKS[pr.rk])}</span><div class="bar" title="XP to next rank"><i style="width:${pr.pct}%"></i></div></div>
    ${inEng ? `<button class="iconbtn strong" data-act="tasks">Tasks ${doneCount()}/${ENG.list.length}</button><button class="iconbtn" data-act="menu">Menu</button>` : hqWalk() && state.ui === null ? `<button class="iconbtn strong" data-act="hub">Menu</button>` : ""}
    <button class="iconbtn" data-act="music" aria-pressed="${save.music}" aria-label="Music">♪<span class="hide-s"> ${save.music ? "On" : "Off"}</span></button>
    <button class="iconbtn" data-act="sfx" aria-pressed="${save.sfx}" aria-label="Sound effects">◉<span class="hide-s"> ${save.sfx ? "On" : "Off"}</span></button>`;
  const showWorldUI = ((ENG && !ENG.done) || hqWalk()) && state.ui === null;
  objEl.hidden = mini.hidden = !showWorldUI; document.getElementById("cross").hidden = !showWorldUI;
  if (showWorldUI && !ENG) {
    const hc = hqCfg(), iv = interviewReady() ? interviewer(hc.rank + 1) : null;
    const items = [iv ? { t: `Promotion interview with ${iv.name}`, s: `to become ${RANKS[hc.rank + 1]}`, cur: true } : null, openDeal() ? { t: "📧 New message about a deal", s: `Check the inbox at ${WS_NAME[hc.ws].toLowerCase()}`, cur: !iv } : null, { t: `Visit ${WS_NAME[hc.ws].toLowerCase()}`, s: MYSPACE[hc.ws].place, cur: !iv && !state.hqSeen, done: state.hqSeen }, state.coffee === "fetch" ? { t: "Pick up the coffee order", s: "The Ledger Café", cur: true } : { t: "Grab a coffee", s: "The Ledger Café, east end", done: state.hadCoffee }, boardReady() ? { t: "🏛️ Today's board meeting", s: "Meeting room table" } : null, { t: "Talk to Sara to start a job", s: "Meeting room", cur: !iv && state.hqSeen }].filter(Boolean);
    objEl.innerHTML = `<h4><span>Haddad &amp; Partners HQ</span><span>${esc(RANKS[hc.rank])}</span></h4><ol>${items.map(i => `<li class="${i.cur ? "cur" : ""} ${i.done ? "done" : ""}"><span>${i.done ? "✓ " : ""}${esc(i.t)}${i.s ? `<small>${esc(i.s)}</small>` : ""}</span></li>`).join("")}</ol>`;
  } else if (showWorldUI) {
    let items;
    if (!ENG.briefed) items = [{ t: "Get your briefing from Sara", s: "Go to the meeting room", cur: true }];
    else {
      const g = guide.it && guide.it.station ? guide.it.id : null;
      const pend = ENG.list.filter(t => !isDone(t.key)).sort((a, b) => (b.st === g) - (a.st === g)), shown = pend.slice(0, 5);
      items = shown.map((t, i) => ({ t: t.T.title, s: "Go to " + STATIONS[t.st].place, cur: i === 0 && !allTasksDone() }));
      if (pend.length > shown.length) items.push({ t: `+ ${pend.length - shown.length} more (${isTouch ? "tap Tasks" : "press T"})`, s: "" });
      const eo = eventObjective(); if (eo) items.unshift(eo);
      if (allTasksDone()) items.push({ t: ENG.capT && !isDone("cap") ? "Give Sara your recommendation" : "Hand your report to Sara", s: "Go to the meeting room", cur: true });
    }
    objEl.innerHTML = `<h4><span>${esc(ENG.client.name)}</span><span>${doneCount()}/${ENG.list.length} done</span></h4><ol>${items.map(i => `<li class="${i.cur ? "cur" : ""}"><span>${esc(i.t)}${i.s ? `<small>${esc(i.s)}</small>` : ""}</span></li>`).join("")}</ol>`;
  }
}
function updatePrompt() {
  const show = near && !paused();
  if (isTouch) { tbtn.hidden = !show; if (show) tbtn.textContent = near.verb; promptEl.hidden = true; }
  else { promptEl.hidden = !show; if (show) promptEl.innerHTML = `<kbd>E</kbd><span>${esc(near.verb)}</span>`; }
}
function toast(msg) { const t = document.createElement("div"); t.className = "toast fadein"; t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 2800); }

/* ============================== FLOW ============================== */
const MESH_FOR = { m: "execM", s: "execS", f: "execF" };
function startEngagement(eng) {
  planEvent(eng); materialize(eng); ENG.ev = eng.ev; ENG.bonus = eng.bonus || []; uploadWorld({ palette: eng.palette, bay: eng.bay, stripe: eng.client.stripe, seed: eng.seed, logo: eng.client.name }); hqKey = ""; state.coffee = ENG.ev && ENG.ev.type === "coffee" && ["fetch", "carry"].includes(ENG.ev.status) ? ENG.ev.status : null;
  if (ENG.ev && ["offered", "call"].includes(ENG.ev.status)) ENG.ev.status = "waiting";
  NPCS.exec.mesh = MESH_FOR[eng.client.g] || "execS";
  Object.assign(state.player, SPAWN); moved = 0; rebuildInter();
  state.ui = null; renderUI(); updatePrompt();
  toast(ENG.briefed ? `Back at ${ENG.client.name}.` : `Welcome to ${ENG.client.name}. Sara is waiting in the meeting room.`);
}
function leaveToHub() { storeEng(); ENG = null; state.coffee = null; ensureHQWorld(true); Object.assign(state.player, SPAWN); state.ui = "hub"; state.confirm = null; renderUI(); updatePrompt(); }
function interact() {
  if (paused() || !near) return;
  const it = near;
  if (ENG && eventInteract(it)) return;
  if (it.id === "mariam") { Audio.play("click"); state.note = "mariam"; return openUI("note"); }
  if (it.verb === "Start your promotion interview") { Audio.play("knock"); state.iv = newInterview(); return openUI("interview"); }
  if (it.cw) {
    const c = it.cw;
    if (c.barista) return orderCoffee(c);
    c.say = greetLine(c); c.sayT = 3.6; c.greeted = true; Audio.play("blip"); return;
  }
  if (!ENG) {
    if (it.id === "myspace") { Audio.play("paper"); if (!state.hqSeen) { state.hqSeen = true; guideT = 0; } if (openDeal()) { state.dealQ = null; return openUI("inbox"); } return openUI("desk"); }
    if (it.id === "sara") { Audio.play("click"); toast(`Sara: "${hi("Ready for work")}? Pick your next job."`); return openUI("hub"); }
    if (it.id === "boardtable") { if (boardReady()) { state.mgFrom = "hq"; Audio.play("knock"); return startBoard(); } toast("The board has already met today. Come back tomorrow!"); return; }
    if (it.id === "till") { state.mgFrom = "hq"; Audio.play("click"); return startTill(); }
    if (it.id === "ravi") { state.mgFrom = "hq"; Audio.play("click"); return startSort(); }
    if (it.id === "khalid") { Audio.play("click"); toast(`Khalid: "${["Keep it up", "Good to see you", "The clients love your work"][Math.floor(Math.random() * 3)]}${myName() ? ", " + myName() : ""}!"`); return; }
  }
  if (it.id === "notice") { Audio.play("paper"); state.note = "facts"; return openUI("note"); }
  if (it.id === "sara") {
    Audio.play("click");
    if (!ENG.briefed) return openUI("brief");
    if (!allTasksDone()) return openUI("overview");
    if (ENG.capT && !isDone("cap")) return openTask("cap");
    return finishEngagement();
  }
  const ts = stationTasks(it.id), pend = ts.find(t => !isDone(t.key)), tk = pend || ts[ts.length - 1];
  if (save.coach === 2) { save.coach = 3; persist(); }
  if (isPC(tk)) return startZoomIn(it.id, tk.key);
  Audio.play(it.id === "exec" ? "knock" : "paper");
  openTask(tk.key);
}
function orderCoffee(c) {
  Audio.play("click");
  if (state.coffee === "fetch" && evOf()) { evOf().status = "carry"; syncEv(); rebuildInter(); c.say = `Here you go${myName() ? ", " + myName() : ""}! Careful, it's hot.`; c.sayT = 3.6; toast("☕ Got the coffees. Take them to Sara in the meeting room."); guideT = 0; renderHud(); return; }
  c.say = greetLine(c); c.sayT = 3.2; state.hadCoffee = true; toast(`☕ ${["Karak chai", "Flat white", "Arabic coffee", "Fresh mango juice"][Math.floor(Math.random() * 4)]}, on the house.`); if (!ENG) renderHud();
}
function openTask(key) { state.task = key; state.sel = null; state.picks = new Set(); state.cls = {}; state.msg = ""; state.hintOpen = false; state.mentor = ""; pcOpened(taskByKey(key)); openUI("task"); }
function openUI(ui) {
  if (ui === "task") document.querySelectorAll(".toast:not(.badge-toast)").forEach(t => t.remove());
  state.ui = ui; if (document.pointerLockElement) { try { document.exitPointerLock(); } catch (e) {} }
  for (const k in keys) keys[k] = false; joy = null; stick.hidden = true;
  renderUI(); updatePrompt(); ov.scrollTop = 0;
}
function closeUI() { state.ui = null; clearTimeout(state.pingT); state.ping = null; renderUI(); rebuildInter(); updatePrompt(); if (state.pcFrom) startZoomOut(); else if (ENG && !ENG.done) maybeFireEvent(); }
const taskByKey = k => k === "practice" ? state.practiceTask : k === "cap" ? ENG.capT : ENG.list[+k];
function startPractice(fromKey) {
  const src = taskByKey(fromKey), sd = (Math.random() * 2 ** 31) | 0;
  state.practiceTask = { ...makeTask(ENG, { tpl: src.tpl, tier: src.tier }, "practice", sd), st: src.st };
  state.practiceRes = { status: "todo", attempts: 0 }; state.practiceFrom = state.practiceFrom && fromKey === "practice" ? state.practiceFrom : fromKey;
  openTask("practice");
}

function parseNum(s) { let t = String(s).trim().toLowerCase().replace(/aed|units?|days?|pallets?|bn|%|×|x|,|\s/g, ""); let neg = false; if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1); } const v = parseFloat(t); return isNaN(v) ? null : neg ? -v : v; }
function submitTask() {
  const tk = taskByKey(state.task), d = tk.d, res = resOf(tk.key), kind = tk.T.kind, choice = kind === "mcq" || d.asChoice;
  const maxTries = choice ? (isStudent() ? (kind === "mcq" ? 1 : 2) : 2) : (isStudent() ? 2 : 3);
  let frac = 0;
  if (choice) {
    if (state.sel === null) return;
    res.attempts = (res.attempts || 0) + 1; res.wrongOpts = res.wrongOpts || [];
    if (state.sel === d.correct) frac = res.attempts === 1 ? 1 : .5;
    else { res.wrongOpts.push(state.sel); if (res.attempts < maxTries) { state.msg = "Not quite. That answer is crossed out. Read the tip and try again."; state.sel = null; state.hintOpen = true; Audio.play("bad"); storeEng(); return renderUI(); } }
    res.given = state.sel;
  } else if (kind === "calc" || kind === "count") {
    const raw = document.getElementById("ans").value.trim(), v = readAnswer(); if (v === null) { state.msg = raw.startsWith("=") ? "That formula doesn't work. Check the cell names, e.g. =B2*B3." : "Type a number first."; return renderUI(); }
    const tol = d.tol ?? Math.max(.5, Math.abs(d.answer) * .005);
    const ok = Math.abs(v - d.answer) <= tol || (d.alt !== undefined && Math.abs(v - d.alt) <= tol) || (d.absOk && Math.abs(Math.abs(v) - Math.abs(d.answer)) <= tol);
    res.attempts = (res.attempts || 0) + 1; res.tries = [...(res.tries || []), v]; res.given = v;
    if (ok) frac = [1, .5, .25][res.attempts - 1];
    else if (res.attempts < maxTries) { const left = maxTries - res.attempts; state.msg = `Not quite: ${N(v)} is too ${v > d.answer ? "high" : "low"}. ${left} more ${left > 1 ? "tries" : "try"}.${isStudent() ? "" : " Check the tip below."}`; if (!isStudent()) state.hintOpen = true; Audio.play("bad"); storeEng(); return renderUI(); }
  } else if (kind === "flag") { const wrong = new Set(d.wrong); let hits = 0, fp = 0; state.picks.forEach(i => wrong.has(i) ? hits++ : fp++); frac = Math.max(0, (hits - fp) / wrong.size); res.given = [...state.picks]; }
  else if (kind === "classify") { if (Object.keys(state.cls).length < d.items.length) { state.msg = "Choose a category for every item first."; return renderUI(); } let ok = 0; d.items.forEach((it, i) => { if (state.cls[i] === it.cat) ok++; }); frac = ok / d.items.length; res.given = { ...state.cls }; }
  const max = tk.key === "practice" ? 0 : ptsFor(tk.tier), mult = res.hint && isStudent() ? .75 : 1;
  Object.assign(res, { status: "done", frac, pts: Math.round(max * mult * frac), max });
  if (tk.key !== "practice") storeEng(); else if (frac >= .99) award("practice");
  if (kind === "count" && frac >= .99 && res.attempts === 1) award("eagle");
  Audio.play(frac >= .99 ? "good" : frac > 0 ? "stamp" : "bad"); if (frac >= .99) setTimeout(() => Audio.play("task"), 300);
  renderUI(); ov.scrollTop = ov.scrollHeight; if (tk.key !== "practice") rebuildInter();
}
function finishEngagement() {
  const items = [...ENG.list, ...(ENG.capT ? [ENG.capT] : [])];
  const score = items.reduce((s, t) => s + (ENG.res[t.key]?.pts || 0), 0), max = items.reduce((s, t) => s + ptsFor(t.tier), 0), pct = score / max * 100;
  const newDay = bumpStreak(), streak = save.streak.n, sb = streakBonus(streak), bonus = (ENG.bonus || []).reduce((a, b) => a + b.pts, 0);
  const cu = updateClient(ENG, pct);
  const xp = Math.round((score + bonus) * (cu && cu.loyalBonus ? 1.1 : 1) * (ENG.daily ? 1.5 : 1) * (1 + sb / 100)), before = curRank(), wasReady = interviewEarned();
  const cr = career(); cr.xp += xp; cr.eng += 1; cr.sumPct += pct; cr.best = Math.max(cr.best, Math.round(pct));
  if (ENG.daily) save.daily[save.mode] = ENG.date;
  const after = curRank(), noHint = items.every(t => !ENG.res[t.key]?.hint);
  state.report = { client: ENG.client.name, service: ENG.service, daily: ENG.daily, items: items.map(t => ({ title: t.T.title, cap: t.key === "cap", pts: ENG.res[t.key]?.pts || 0, max: ptsFor(t.tier), explain: t.d.explain, hint: t.d.hint, frac: ENG.res[t.key]?.frac ?? 0 })), score, max, pct, xp, before, after, cu, bonus, bonusList: ENG.bonus || [], streak, sb, newDay, interview: interviewReady(), justEarned: !wasReady && interviewEarned() };
  const total = save.careers.casual.eng + save.careers.student.eng;
  award("first"); if (pct >= 99.9) award("perfect"); if (noHint) award("nohint"); if (ENG.daily) award("daily");
  if (streak >= 3) award("streak3"); if (streak >= 7) award("streak7"); if (total >= 10) award("jobs10"); if (total >= 25) award("jobs25");
  state.report.deal = maybeNewDealMessage();
  state.report.cash = earn(Math.round(SALARY[curRank()] * Math.min(100, pct) / 100) + bonus);
  save.cur[save.mode] = null; persist(); ENG.done = true; openUI("report");
}
