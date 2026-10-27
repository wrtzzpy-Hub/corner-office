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

/* ============================== INTERACTABLES ============================== */
let INTER = [];
const firstName = n => n.split(" ")[0];
function stationTasks(st) { return ENG ? ENG.list.filter(t => t.st === st) : []; }
function rebuildInter() {
  INTER = [];
  INTER.push({ id: "mariam", ...FIXED.mariam, label: "Mariam · Reception", verb: "Talk to Mariam", fixed: true });
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
  if (near) near = INTER.find(i => i.id === near.id) || null;
  syncTags(); guideT = 0;
}

/* ============================== INPUT ============================== */
const keys = {}; let locked = false, dragging = false, lastX = 0, lastY = 0;
const isTouch = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
let joy = null, lookTouch = null, bob = 0, stepT = 0, near = null, moved = 0, promptKey = "";
const R = .3;
const blocked = (x, z) => blockedR(x, z, R);
const paused = () => state.ui !== null;
addEventListener("keydown", e => {
  if (paused()) { if (e.key === "Escape" && ENG && ["task", "overview", "note"].includes(state.ui)) closeUI(); return; }
  keys[e.code] = true;
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
  for (const n of Object.values(NPCS)) {
    const d = Math.hypot(p.x - n.x, p.z - n.z), target = d < 5 ? Math.atan2(p.x - n.x, p.z - n.z) : n.base;
    let diff = target - n.rot; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
    n.rot += diff * Math.min(1, dt * 4);
  }
  const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw); let best = null, bs = 1e9;
  if (!paused()) for (const it of INTER) {
    if (it.station && !ENG.briefed) continue;
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
  if (!ENG) return null;
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
let tagEls = [], signEls = [], SIGNS = [];
function syncTags() {
  tagEls.forEach(e => e.remove()); tagEls = INTER.map(it => { const d = document.createElement("div"); d.className = "tag"; d.textContent = it.label; labelsEl.append(d); return d; });
  signEls.forEach(e => e.remove());
  const c = ENG && ENG.client, P = PALETTES[ENG ? ENG.palette : 0];
  SIGNS = [{ t: "Meeting room", x: 6, y: 2.75, z: 12.3 }, { t: "Finance floor", x: 18, y: 2.75, z: 12.3 }, { t: c ? `${c.role} · ${c.exec.split(" ").slice(-1)[0]}` : "Executive suite", x: 30, y: 2.75, z: 12.3 }, { t: "Stockroom", x: 22, y: 2.8, z: 15.7 }];
  signEls = SIGNS.map(s => { const d = document.createElement("div"); d.className = "sign"; d.style.background = P.sign; d.textContent = s.t; labelsEl.append(d); return d; });
}
let last = performance.now(), PV, pathGL = null;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; const t = now / 1000;
  update(dt); if (ENG && !ENG.done) updateGuide(dt); else guide.it = null;
  if (ENG && ["task", "overview", "note", "brief", "report", "promo"].includes(state.ui)) { requestAnimationFrame(frame); return; }
  const dpr = Math.min(2, devicePixelRatio || 1), w = Math.floor(cv.clientWidth * dpr), h = Math.floor(cv.clientHeight * dpr);
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const p = state.player, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const by = reduce ? 0 : Math.sin(bob) * .04, bx = reduce ? 0 : Math.cos(bob * .5) * .022;
  const ex = p.x + Math.cos(p.yaw) * bx, ez = p.z - Math.sin(p.yaw) * bx, ey = 1.65 + by;
  const Pm = persp(1.15, w / h, .1, 90), V = mul(rotX(-p.pitch), mul(rotY(-p.yaw), trans(-ex, -ey, -ez)));
  PV = mul(Pm, V);
  gl.uniformMatrix4fv(loc.uP, false, Pm); gl.uniformMatrix4fv(loc.uV, false, V); gl.uniform3f(loc.uFog, .1, .13, .2); gl.uniform3f(loc.uEye, ex, ey, ez);
  gl.uniform1f(loc.uAlpha, 1); gl.disable(gl.BLEND); gl.depthMask(true);
  gl.uniformMatrix4fv(loc.uM, false, I4);
  for (const s of staticBufs) { gl.uniform2f(loc.uScroll, s.tex === "ticker" ? (t * .045) % 1 : 0, 0); drawBuf(s); }
  gl.uniform2f(loc.uScroll, 0, 0);
  for (const [k, n] of Object.entries(NPCS)) {
    if (k !== "mariam" && !ENG) continue;
    gl.uniformMatrix4fv(loc.uM, false, mul(trans(n.x, Math.sin(t * 1.6 + n.x) * .006, n.z), rotY(n.rot)));
    for (const b of meshBufs[n.mesh]) drawBuf(b, .12);
  }
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
    const d = Math.hypot(it.x - p.x, it.z - p.z), show = !hide && !(it.station && !ENG.briefed) && d < 12 && visible(it.x, it.z);
    const pr = show ? project(it.x, it.y, it.z, W, H) : null;
    if (!pr) { el.style.display = "none"; return; }
    el.style.display = ""; const sc = Math.max(.75, Math.min(1.15, 3 / pr.d + .5));
    el.style.transform = `translate(${pr.x}px,${pr.y}px) translate(-50%,-100%) scale(${sc})`;
    el.className = "tag" + (near === it ? " hot" : it === guide.it ? " todo" : it.done ? " done" : "");
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
  const W = mini.width, H = mini.height, s = Math.min(W / 37, H / 25), ox = (W - 36 * s) / 2, oy = (H - 24 * s) / 2, k = W / 180;
  mx.clearRect(0, 0, W, H);
  ROOMS.forEach(r => { mx.fillStyle = r.key === "corr" ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.11)"; mx.fillRect(ox + r.x0 * s, oy + r.z0 * s, (r.x1 - r.x0) * s, (r.z1 - r.z0) * s); });
  mx.strokeStyle = "#93a3b5"; mx.lineWidth = 2; mx.beginPath(); walls2d.forEach(w => { mx.moveTo(ox + w[0] * s, oy + w[1] * s); mx.lineTo(ox + w[2] * s, oy + w[3] * s); }); mx.stroke();
  mx.strokeStyle = "rgba(160,200,230,.7)"; mx.setLineDash([3 * k, 2 * k]); mx.beginPath(); [[0, 12, 5], [7, 12, 17], [19, 12, 24]].forEach(([a, z, b]) => { mx.moveTo(ox + a * s, oy + z * s); mx.lineTo(ox + b * s, oy + z * s); }); mx.stroke(); mx.setLineDash([]);
  const p = state.player;
  if (guide.it) { mx.strokeStyle = "#f2df63"; mx.lineWidth = 2.5 * k; mx.beginPath(); mx.moveTo(ox + p.x * s, oy + p.z * s); guide.pts.forEach(q => mx.lineTo(ox + q[0] * s, oy + q[1] * s)); mx.stroke(); mx.fillStyle = "#f2df63"; mx.beginPath(); mx.arc(ox + guide.it.x * s, oy + guide.it.z * s, (3.5 + Math.sin(t * 5) * 1.2) * k, 0, 7); mx.fill(); }
  INTER.forEach(it => { if (it.station && !it.done && ENG.briefed && it !== guide.it) { mx.fillStyle = "rgba(242,223,99,.55)"; mx.beginPath(); mx.arc(ox + it.x * s, oy + it.z * s, 2.2 * k, 0, 7); mx.fill(); } });
  mx.save(); mx.translate(ox + p.x * s, oy + p.z * s); mx.rotate(-p.yaw); mx.fillStyle = "#fff"; mx.strokeStyle = "#16212e"; mx.lineWidth = 1.5 * k;
  mx.beginPath(); mx.moveTo(0, -7 * k); mx.lineTo(5 * k, 5 * k); mx.lineTo(0, 2.5 * k); mx.lineTo(-5 * k, 5 * k); mx.closePath(); mx.fill(); mx.stroke(); mx.restore();
}
const guideEl = document.getElementById("guide"), coachEl = document.getElementById("coach");
let guideKey = "";
function drawGuideHud() {
  const show = !!(guide.it && !paused() && ENG && !ENG.done);
  guideEl.hidden = !show; if (!show) return;
  const p = state.player, it = guide.it, nearIt = near === it;
  let tx = it.x, tz = it.z; for (const q of guide.pts) { if (Math.hypot(q[0] - p.x, q[1] - p.z) > 1.0) { tx = q[0]; tz = q[1]; break; } }
  if (Math.hypot(it.ap[0] - p.x, it.ap[1] - p.z) < 1.3) { tx = it.x; tz = it.z; }
  const dx = tx - p.x, dz = tz - p.z, fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
  const ang = Math.atan2(dx * rx + dz * rz, dx * fx + dz * fz);
  guideEl.querySelector(".arr").style.transform = `rotate(${ang}rad)`;
  const what = it.id === "sara" ? (!ENG.briefed ? "Get your briefing from Sara" : ENG.capT && !isDone("cap") ? "Give Sara your recommendation" : "Hand your report to Sara") : it.title;
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
function xpProgress() { const xp = career().xp, rk = rankOf(xp); if (rk === RANKS.length - 1) return { rk, pct: 100, need: 0 }; return { rk, pct: (xp - XP_AT[rk]) / (XP_AT[rk + 1] - XP_AT[rk]) * 100, need: XP_AT[rk + 1] - xp }; }
function renderHud() {
  const pr = xpProgress(), inEng = ENG && !ENG.done && state.ui !== "hub" && !String(state.ui).startsWith("ob");
  hudEl.innerHTML = `<div class="brand">Corner <b>Office</b></div>
    <div class="rankchip"><span class="hide-s">${esc(RANKS[pr.rk])}</span><div class="bar" title="XP to next rank"><i style="width:${pr.pct}%"></i></div></div>
    ${inEng ? `<button class="iconbtn strong" data-act="tasks">Tasks ${doneCount()}/${ENG.list.length}</button><button class="iconbtn" data-act="menu">Menu</button>` : ""}
    <button class="iconbtn" data-act="music" aria-pressed="${save.music}" aria-label="Music">♪<span class="hide-s"> ${save.music ? "On" : "Off"}</span></button>
    <button class="iconbtn" data-act="sfx" aria-pressed="${save.sfx}" aria-label="Sound effects">◉<span class="hide-s"> ${save.sfx ? "On" : "Off"}</span></button>`;
  const showWorldUI = ENG && !ENG.done && state.ui === null;
  objEl.hidden = mini.hidden = !showWorldUI; document.getElementById("cross").hidden = !showWorldUI;
  if (showWorldUI) {
    let items;
    if (!ENG.briefed) items = [{ t: "Get your briefing from Sara", s: "Go to the meeting room", cur: true }];
    else {
      const g = guide.it && guide.it.station ? guide.it.id : null;
      const pend = ENG.list.filter(t => !isDone(t.key)).sort((a, b) => (b.st === g) - (a.st === g)), shown = pend.slice(0, 5);
      items = shown.map((t, i) => ({ t: t.T.title, s: "Go to " + STATIONS[t.st].place, cur: i === 0 && !allTasksDone() }));
      if (pend.length > shown.length) items.push({ t: `+ ${pend.length - shown.length} more (${isTouch ? "tap Tasks" : "press T"})`, s: "" });
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
  materialize(eng); uploadWorld({ palette: eng.palette, bay: eng.bay, stripe: eng.client.stripe, seed: eng.seed, logo: eng.client.name });
  NPCS.exec.mesh = MESH_FOR[eng.client.g] || "execS";
  Object.assign(state.player, SPAWN); moved = 0; rebuildInter();
  state.ui = null; renderUI(); updatePrompt();
  toast(ENG.briefed ? `Back at ${ENG.client.name}.` : `Welcome to ${ENG.client.name}. Sara is waiting in the meeting room.`);
}
function leaveToHub() { storeEng(); ENG = null; rebuildInter(); uploadWorld({ palette: 0, bay: 18, stripe: "#c8372d", seed: 1 }); Object.assign(state.player, SPAWN); state.ui = "hub"; state.confirm = null; renderUI(); updatePrompt(); }
function interact() {
  if (paused() || !near) return;
  const it = near;
  if (it.id === "mariam") { Audio.play("click"); state.note = "mariam"; return openUI("note"); }
  if (it.id === "notice") { Audio.play("paper"); state.note = "facts"; return openUI("note"); }
  if (it.id === "sara") {
    Audio.play("click");
    if (!ENG.briefed) return openUI("brief");
    if (!allTasksDone()) return openUI("overview");
    if (ENG.capT && !isDone("cap")) return openTask("cap");
    return finishEngagement();
  }
  const ts = stationTasks(it.id), pend = ts.find(t => !isDone(t.key));
  Audio.play(it.id === "exec" ? "knock" : "paper");
  if (save.coach === 2) { save.coach = 3; persist(); }
  openTask((pend || ts[ts.length - 1]).key);
}
function openTask(key) { state.task = key; state.sel = null; state.picks = new Set(); state.cls = {}; state.msg = ""; state.hintOpen = false; state.mentor = ""; openUI("task"); }
function openUI(ui) {
  state.ui = ui; if (document.pointerLockElement) { try { document.exitPointerLock(); } catch (e) {} }
  for (const k in keys) keys[k] = false; joy = null; stick.hidden = true;
  renderUI(); updatePrompt(); ov.scrollTop = 0;
}
function closeUI() { state.ui = null; renderUI(); rebuildInter(); updatePrompt(); }
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
    const v = parseNum(document.getElementById("ans").value); if (v === null) { state.msg = "Type a number first."; return renderUI(); }
    const tol = d.tol ?? Math.max(.5, Math.abs(d.answer) * .005);
    const ok = Math.abs(v - d.answer) <= tol || (d.alt !== undefined && Math.abs(v - d.alt) <= tol) || (d.absOk && Math.abs(Math.abs(v) - Math.abs(d.answer)) <= tol);
    res.attempts = (res.attempts || 0) + 1; res.tries = [...(res.tries || []), v]; res.given = v;
    if (ok) frac = [1, .5, .25][res.attempts - 1];
    else if (res.attempts < maxTries) { const left = maxTries - res.attempts; state.msg = `Not quite: ${N(v)} is too ${v > d.answer ? "high" : "low"}. ${left} more ${left > 1 ? "tries" : "try"}.${isStudent() ? "" : " Check the tip below."}`; if (!isStudent()) state.hintOpen = true; Audio.play("bad"); storeEng(); return renderUI(); }
  } else if (kind === "flag") { const wrong = new Set(d.wrong); let hits = 0, fp = 0; state.picks.forEach(i => wrong.has(i) ? hits++ : fp++); frac = Math.max(0, (hits - fp) / wrong.size); res.given = [...state.picks]; }
  else if (kind === "classify") { if (Object.keys(state.cls).length < d.items.length) { state.msg = "Choose a category for every item first."; return renderUI(); } let ok = 0; d.items.forEach((it, i) => { if (state.cls[i] === it.cat) ok++; }); frac = ok / d.items.length; res.given = { ...state.cls }; }
  const max = tk.key === "practice" ? 0 : ptsFor(tk.tier), mult = res.hint && isStudent() ? .75 : 1;
  Object.assign(res, { status: "done", frac, pts: Math.round(max * mult * frac), max });
  if (tk.key !== "practice") storeEng();
  Audio.play(frac >= .99 ? "good" : frac > 0 ? "stamp" : "bad"); if (frac >= .99) setTimeout(() => Audio.play("task"), 300);
  renderUI(); ov.scrollTop = ov.scrollHeight; if (tk.key !== "practice") rebuildInter();
}
function finishEngagement() {
  const items = [...ENG.list, ...(ENG.capT ? [ENG.capT] : [])];
  const score = items.reduce((s, t) => s + (ENG.res[t.key]?.pts || 0), 0), max = items.reduce((s, t) => s + ptsFor(t.tier), 0), pct = score / max * 100;
  const xp = Math.round(score * (ENG.daily ? 1.5 : 1)), before = rankOf(career().xp);
  const cr = career(); cr.xp += xp; cr.eng += 1; cr.sumPct += pct; cr.best = Math.max(cr.best, Math.round(pct));
  if (ENG.daily) save.daily[save.mode] = ENG.date;
  const after = rankOf(cr.xp);
  state.report = { client: ENG.client.name, service: ENG.service, daily: ENG.daily, items: items.map(t => ({ title: t.T.title, cap: t.key === "cap", pts: ENG.res[t.key]?.pts || 0, max: ptsFor(t.tier), explain: t.d.explain, hint: t.d.hint, frac: ENG.res[t.key]?.frac ?? 0 })), score, max, pct, xp, before, after };
  save.cur[save.mode] = null; persist(); ENG.done = true; openUI("report");
}
