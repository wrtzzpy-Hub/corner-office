/* ============================== THE COMPUTER ==============================
   Desk tasks open on a computer: the camera sits down and zooms into the monitor, the screen powers on,
   and the task runs inside an app (spreadsheet with working formulas, email, or a PDF with a red pen). */
const PC_STATIONS = new Set(["laptop", "mon1", "mon2", "dpc"]);
const SCREEN_AT = { laptop: [6, .93, 5.76], mon1: [15.34, 1.13, 7.37], mon2: [20.84, 1.13, 7.37], dpc: [34.2, 1.16, 20.62] };
const isPC = tk => !!tk && tk.key !== "cap" && PC_STATIONS.has(tk.st) && ["calc", "mcq", "flag", "classify"].includes(tk.T.kind);
const appOf = tk => tk.T.kind === "mcq" ? "email" : tk.T.kind === "flag" ? "pdf" : "sheet";

/* ---------- camera: sit down and zoom into the screen ---------- */
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function screenPose(st) { const [x, y, z] = SCREEN_AT[st]; return { x, y: y + .03, z: z + .5, yaw: 0, pitch: -.05 }; }
function playerPose() { const p = state.player; return { x: p.x, y: 1.65, z: p.z, yaw: p.yaw, pitch: p.pitch }; }
function startZoomIn(st, key) {
  if (state.cam) return;
  Audio.play("sit"); document.body.classList.add("zooming");
  state.cam = { from: playerPose(), to: screenPose(st), t0: performance.now(), dur: 1150, then: () => { state.cam = null; state.pcFrom = st; Audio.play("power"); openTask(key); } };
  for (const k in keys) keys[k] = false; joy = null; stick.hidden = true; updatePrompt();
}
function startZoomOut() {
  const st = state.pcFrom; state.pcFrom = null; if (!st || !SCREEN_AT[st]) { document.body.classList.remove("zooming"); return; }
  state.cam = { from: screenPose(st), to: playerPose(), t0: performance.now(), dur: 800, then: () => { state.cam = null; document.body.classList.remove("zooming"); updatePrompt(); } };
}
function camNow(now) {
  const c = state.cam, t = Math.min(1, (now - c.t0) / c.dur), e = ease(t), L = (a, b) => a + (b - a) * e;
  let dy = c.to.yaw - c.from.yaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
  const sit = Math.sin(Math.PI * Math.min(1, t * 1.2)) * -.12;
  const pose = { x: L(c.from.x, c.to.x), y: L(c.from.y, c.to.y) + sit, z: L(c.from.z, c.to.z), yaw: c.from.yaw + dy * e, pitch: L(c.from.pitch, c.to.pitch) };
  if (t >= 1) setTimeout(c.then, 0);
  return pose;
}

/* ---------- spreadsheet model ---------- */
const COLS = "ABCDEFGH";
const numOf = v => { if (typeof v === "number") return v; const s = String(v).trim(); if (!/^[−\-(]?\s*(AED\s*)?[\d,]*\.?\d+\s*(%|×|x|bn|m)?\)?$/i.test(s)) return null; const n = parseNum(s.replace("−", "-")); return n; };
function briefNumbers(brief) {
  const txt = String(brief).replace(/<br\s*\/?>/g, ". ").replace(/<[^>]+>/g, "").replace(/•/g, ""), out = [];
  const re = /(AED\s?)?(\d[\d,]*(?:\.\d+)?)\s?(%)?/g; let m, last = 0;
  while ((m = re.exec(txt)) && out.length < 8) {
    let before = txt.slice(last, m.index); const cut = Math.max(before.lastIndexOf(". "), before.lastIndexOf("! "), before.lastIndexOf("? "), before.lastIndexOf(": ")); if (cut >= 0) before = before.slice(cut + 2);
    const words = before.replace(/[.!?,:;"“”()]/g, " ").trim().split(/\s+/).filter(Boolean).slice(-4).join(" ");
    out.push([words ? words[0].toUpperCase() + words.slice(1) : "Number", (m[1] ? "AED " : "") + m[2] + (m[3] || "")]); last = m.index + m[0].length;
  }
  return out;
}
function sheetOf(tk) {
  const d = tk.d, rows = []; // rows: arrays of cell strings; first row is header
  if (d.table) { rows.push(d.table.cols.map(String)); d.table.rows.forEach(r => rows.push(r.map(String))); }
  else if (d.facts) { rows.push(["Item", "Value"]); d.facts.forEach(f => rows.push([String(f[0]), String(f[1])])); }
  else rows.push(["From the brief", "Number"]);
  const have = new Set(rows.flatMap(r => r.map(c => numOf(c))).filter(v => v !== null));
  const extra = briefNumbers(d.brief).filter(([, v]) => !have.has(numOf(v)));
  if (extra.length && (d.table || d.facts)) rows.push(["From the brief", ""]);
  extra.forEach(([l, v]) => { const r = [l, v]; rows.push(r); });
  return rows;
}
function cellMap(rows, scratch) {
  const map = {};
  rows.forEach((r, i) => r.forEach((c, j) => { const v = numOf(c); if (v !== null) map[COLS[j] + (i + 1)] = v; }));
  for (const [ref, src] of Object.entries(scratch || {})) { const v = String(src).startsWith("=") ? sheetEval(src, map) : numOf(src); if (v !== null && isFinite(v)) map[ref] = v; }
  return map;
}
/* formula evaluator: + - * / ^ ( ) %, cell refs, SUM/AVERAGE/MIN/MAX/ROUND/ABS with ranges */
function sheetEval(src, map) {
  let s = String(src).trim().replace(/^=/, "").toUpperCase().replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, ""), i = 0;
  const peek = () => s[i], eat = c => { if (s[i] === c) { i++; return true; } return false; };
  const rangeVals = (a, b) => { const [ca, ra] = [a.charCodeAt(0), +a.slice(1)], [cb, rb] = [b.charCodeAt(0), +b.slice(1)], out = []; for (let c = Math.min(ca, cb); c <= Math.max(ca, cb); c++) for (let r = Math.min(ra, rb); r <= Math.max(ra, rb); r++) { const v = map[String.fromCharCode(c) + r]; if (v !== undefined) out.push(v); } return out; };
  function args() { const vals = []; if (eat(")")) return vals; do { const m = /^([A-H]\d+):([A-H]\d+)/.exec(s.slice(i)); if (m) { i += m[0].length; vals.push(...rangeVals(m[1], m[2])); } else vals.push(expr()); } while (eat(",") || eat(";")); if (!eat(")")) throw 0; return vals; }
  function atom() {
    if (eat("(")) { const v = expr(); if (!eat(")")) throw 0; return v; }
    if (eat("-")) return -atom(); if (eat("+")) return atom();
    const fn = /^(SUM|AVERAGE|AVG|MIN|MAX|ROUND|ABS)\(/.exec(s.slice(i));
    if (fn) { i += fn[0].length; const a = args(); if (fn[1] === "SUM") return a.reduce((x, y) => x + y, 0); if (fn[1] === "AVERAGE" || fn[1] === "AVG") return a.reduce((x, y) => x + y, 0) / a.length; if (fn[1] === "MIN") return Math.min(...a); if (fn[1] === "MAX") return Math.max(...a); if (fn[1] === "ABS") return Math.abs(a[0]); const p = Math.pow(10, a[1] || 0); return Math.round(a[0] * p) / p; }
    const ref = /^[A-H]\d+/.exec(s.slice(i)); if (ref) { i += ref[0].length; const v = map[ref[0]]; if (v === undefined) throw 0; return v; }
    const num = /^\d*\.?\d+/.exec(s.slice(i)); if (num) { i += num[0].length; return parseFloat(num[0]); }
    throw 0;
  }
  function pct() { let v = atom(); while (eat("%")) v /= 100; return v; }
  function pow() { let v = pct(); while (eat("^")) v = Math.pow(v, pct()); return v; }
  function term() { let v = pow(); for (;;) { if (eat("*")) v *= pow(); else if (eat("/")) v /= pow(); else return v; } }
  function expr() { let v = term(); for (;;) { if (eat("+")) v += term(); else if (eat("-")) v -= term(); else return v; } }
  try { const v = expr(); if (i < s.length) return null; return isFinite(v) ? Math.round(v * 1e8) / 1e8 : null; } catch (e) { return null; }
}
function readAnswer() {
  const el = document.getElementById("ans"); if (!el) return null; const raw = el.value.trim();
  if (raw.startsWith("=")) { const tk = taskByKey(state.task); return sheetEval(raw, cellMap(sheetOf(tk), state.scratch)); }
  return parseNum(raw);
}

/* ---------- views ---------- */
const PING_LINES = ["need a hand with “{t}”? The hint button is your friend 😉", "you've got this. Take it one number at a time.", "tip: you can type formulas like =B2*B3 in the sheet!", "coffee after this one? ☕", "Sara says great work so far 👏", "try the calculator in the taskbar if you need it."];
function pcFrame(tk, inner, title, icon) {
  const pw = state.pcPower; state.pcPower = false;
  const rk = curRank(), dual = rk >= 3 && rk < 6, wide = rk >= 6, c = ENG ? ENG.client : { name: "Haddad & Partners" };
  const now = new Date(), clock = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const nxt = ENG ? ENG.list.find(t => t.key !== tk.key && !isDone(t.key)) : null, res = resOf(tk.key), done = res.status === "done", ok = done && res.frac >= .99;
  return `<div class="pc ${wide ? "wide" : ""} ${dual ? "dual" : ""}">
    <div class="pc-desk"><span class="mug">☕</span><span class="sticky">${esc(myName() || "Me")}: call Sara 3pm</span></div>
    <div class="pc-row">
    <div class="monitor"><div class="screen ${pw ? "power" : ""}">
      <div class="wall"><span>${esc(c.name)}</span></div>
      <div class="win app-${appOf(tk)}"><div class="win-bar"><span class="win-ic">${icon}</span><b>${esc(title)}</b><span class="win-btns"><i></i><i></i><button class="win-x" data-act="${tk.key === "practice" ? "endpractice" : "close"}" aria-label="Close">×</button></span></div>${inner}</div>
      <div class="taskbar"><span class="start">◆</span><span class="tb-app on">${icon}</span><button class="tb-app" data-act="calc" aria-pressed="${calc.open}" title="Calculator">🧮</button><span class="tb-app">📧</span><span class="tb-app">📝</span>
        ${ok && nxt ? `<span class="dl"><i></i><b>${esc(nxt.T.title)}.xlsx</b></span>` : ""}
        <span class="tb-clock">${clock}</span></div>
      ${state.ping && !done ? `<div class="ping"><b>${esc(state.ping.who)}</b> ${esc(state.ping.text)}${state.ping.hint && !state.hintOpen ? ` <button class="pinglink" data-act="hint">Show hint</button>` : ""}</div>` : ""}
      <div class="glare"></div>
    </div><div class="stand"></div></div>
    ${dual ? `<div class="monitor side"><div class="screen"><div class="mkt"><b>MARKET WATCH</b>${["DFM ▲ 0.62%", "ADX ▲ 0.41%", "GOLD ▼ 0.18%", "USD/AED 3.6725", "BRENT ▲ 1.02%"].map(x => `<span>${x}</span>`).join("")}<div class="spark"></div></div></div><div class="stand"></div></div>` : ""}
    </div>
    <div class="pc-hint">${tk.key === "practice" ? "Practice round · no points" : "At " + esc(STATIONS[tk.st].place)} · ${isTouch ? "tap ×" : "press Esc"} to stand up</div>
  </div>`;
}
function sheetView(tk) {
  const d = tk.d, res = resOf(tk.key), done = res.status === "done", choice = !!d.asChoice, rows = sheetOf(tk), kind = tk.T.kind, ok = done && res.frac >= .99;
  const nCols = Math.max(...rows.map(r => r.length)), ansRow = rows.length + 2, scr = state.scratch || (state.scratch = {}), map = cellMap(rows, scr);
  const ansRef = "B" + ansRow, sel = state.cell || ansRef;
  let grid = `<table class="grid"><thead><tr><th class="corner"></th>${[...Array(Math.max(nCols, 2) + 2)].map((_, j) => `<th>${COLS[j]}</th>`).join("")}</tr></thead><tbody>`;
  rows.forEach((r, i) => {
    grid += `<tr><th>${i + 1}</th>${[...Array(Math.max(nCols, 2))].map((_, j) => { const v = r[j] ?? "", isN = numOf(v) !== null; return `<td class="${i === 0 ? "hd" : ""} ${isN ? "n" : ""} ${sel === COLS[j] + (i + 1) ? "sel" : ""}" data-act="cell" data-id="${COLS[j]}${i + 1}">${esc(v)}</td>`; }).join("")}`;
    const sref = COLS[Math.max(nCols, 2)] + (i + 1), sv = scr[sref];
    grid += i === 0 ? `<td class="hd scr">Workings</td><td class="hd"></td>` : `<td class="scr ${sel === sref ? "sel" : ""}"><input class="scell" data-ref="${sref}" value="${esc(sv || "")}" placeholder="${i === 1 ? "=B2*B3" : ""}" ${done ? "disabled" : ""}></td><td class="n res">${sv && String(sv).startsWith("=") ? (map[sref] !== undefined ? esc(N(map[sref], 4)) : "#ERR") : ""}</td>`;
    grid += `</tr>`;
  });
  const extra = Math.max(nCols, 2) + 2;
  grid += `<tr><th>${rows.length + 1}</th>${[...Array(extra)].map(() => "<td></td>").join("")}</tr>`;
  if (kind === "classify") {
    d.items.forEach((it, i) => { grid += `<tr><th>${ansRow + i}</th><td>${esc(it.text)}</td><td class="dv ${done ? (res.given[i] === it.cat ? "ok" : "bad") : ""}">${done ? `${res.given[i] === it.cat ? "✓" : "⚠"} ${esc(it.cat)}${res.given[i] !== it.cat ? ` <small>(you: ${esc(res.given[i])})</small>` : ""}` : `<select id="cls${state.task}_${i}" data-cls="${i}"><option value="">Choose…</option>${d.cats.map(c => `<option ${state.cls[i] === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>`}</td>${[...Array(extra - 2)].map(() => "<td></td>").join("")}</tr>`; });
  } else {
    const val = done ? (choice ? d.options[d.correct] : fmtAns(d.answer, d.unit)) : choice && state.sel !== null ? d.options[state.sel] : "";
    grid += `<tr class="ansrow"><th>${ansRow}</th><td class="hd lab">Answer${d.unit ? ` (${esc(d.unit)})` : ""} →</td><td class="ans ${done ? (ok ? "ok" : "bad") : "live"}">${done ? `${ok ? "✓" : "⚠"} ${esc(val)}` : choice ? esc(val || "pick below ↓") : `<form data-form="ans" class="cellform"><input id="ans" autocomplete="off" placeholder="type or =formula" value="${esc(state.ansDraft || "")}"></form>`}</td>${[...Array(extra - 2)].map(() => "<td></td>").join("")}</tr>`;
  }
  grid += `</tbody></table>`;
  const fx = done ? (kind === "classify" ? "" : choice ? d.options[d.correct] : "=" + N(d.answer, 4)) : sel.startsWith(COLS[Math.max(nCols, 2)]) ? (scr[sel] || "") : (() => { const c = /^([A-H])(\d+)$/.exec(sel); if (!c) return ""; const r = rows[+c[2] - 1]; return r ? (r[COLS.indexOf(c[1])] ?? "") : ""; })();
  const comments = done ? stepsOf(d.explain).map((x, i) => `<div class="cmt"><span class="ct">${i === 0 ? (ok ? "✓ Why it's right" : "Here's how") : "Step " + (i + 1)}</span>${x}</div>`).join("") : "";
  const tries = !done && (res.tries || []).length ? `<p class="tries">Tried: ${res.tries.map(v => esc(N(v))).join(", ")}</p>` : "";
  return pcFrame(tk, `<div class="ribbon"><span class="on">Home</span><span>Insert</span><span>Formulas</span><span>Data</span><span class="rt">${ptsFor(tk.tier)} pts · ${isStudent() ? "●".repeat(tk.tier) + "○".repeat(4 - tk.tier) : FUN_LEVEL[tk.tier]}</span></div>
    <div class="fxbar"><span class="nm">${esc(sel)}</span><span class="fx">fx</span><span class="fv">${esc(fx)}</span></div>
    <div class="sheetbody"><div class="brief-note"><b>📌 ${esc(tk.T.title)}</b><p>${d.brief}</p><p class="q">${esc(d.q)}</p>${!done ? `<p class="instr">${choice ? "Pick the right value for the answer cell. You can work it out with formulas in the Workings column." : kind === "classify" ? "Choose a category in each dropdown cell, then Submit." : "Type the answer in the yellow cell, or a formula like <code>=B2-B3</code>, then press Enter."}</p>` : ""}${state.hintOpen || res.hint ? `<div class="tipbox"><b>Hint</b><span>${esc(d.hint)}</span></div>` : ""}</div>
    <div class="gridwrap">${grid}</div></div>
    ${!done ? `<div class="sheetbtns">${choice ? `<div class="choices grid2">${d.options.map((o, i) => { const x = (res.wrongOpts || []).includes(i); return `<button class="choice ${x ? "crossed" : state.sel === i ? "sel" : ""}" ${x ? "disabled" : `data-act="opt" data-id="${i}"`}><b>${esc(o)}</b></button>`; }).join("")}</div><button class="btn red" data-act="submit" ${state.sel === null ? "disabled" : ""}>Check</button>` : kind === "classify" ? `<button class="btn red" data-act="submit">Submit</button>` : `<button class="btn red" data-act="submitpc">Submit</button>`}${!(state.hintOpen || res.hint) ? `<button class="btn plain" data-act="hint">${isStudent() ? "Hint (−25%)" : "Hint"}</button>` : ""}${tries}${state.msg ? `<span class="err">${esc(state.msg)}</span>` : ""}</div>`
      : `<div class="comments"><div class="res-h"><b>${ok ? "✓ Correct!" : res.frac > 0 ? "½ Partly right" : "⚠ Not this time"}</b><span>${tk.key === "practice" ? "Practice" : "+" + res.pts + " pts"}</span></div>${comments}<p class="key"><b>Remember:</b> ${esc(d.hint)}</p></div>
        <div class="sheetbtns">${tk.key === "practice" ? `<button class="btn red" data-act="practice" data-id="practice">Another one</button><button class="btn plain" data-act="endpractice">Done</button>` : `<button class="btn red" data-act="close">Save and stand up</button><button class="btn plain" data-act="practice" data-id="${tk.key}">Practice a similar one</button>`}</div>`}`,
    `${ENG ? ENG.client.name : "Practice"} – ${tk.T.title}.xlsx`, "📊");
}
function emailView(tk) {
  const d = tk.d, res = resOf(tk.key), done = res.status === "done", from = ENG ? `${ENG.client.exec} (${ENG.client.role}, ${ENG.client.name})` : "Client";
  return pcFrame(tk, `<div class="mail"><div class="mail-list"><div class="mi on"><b>${esc(ENG ? ENG.client.exec : "Client")}</b><span>${esc(tk.T.title)}</span></div><div class="mi"><b>Sara</b><span>Today's list</span></div><div class="mi"><b>IT support</b><span>Password reminder</span></div></div>
    <div class="mail-body"><h3>${esc(tk.T.title)}</h3><p class="mailhead"><b>From:</b> ${esc(from)}<br><b>To:</b> ${esc(myName() || "You")}</p>
    <p class="brief">${d.brief}</p>${d.facts ? `<div class="facts">${d.facts.map(f => `<div class="fact"><div class="v">${esc(f[1])}</div><div class="k">${esc(f[0])}</div></div>`).join("")}</div>` : ""}${d.table ? tableHTML(d.table, false, false, new Set(), null) : ""}
    <p class="q">${esc(d.q)}</p>${!done && (state.hintOpen || res.hint) ? `<div class="tipbox"><b>Hint</b><span>${esc(d.hint)}</span></div>` : ""}
    ${!done ? `<p class="instr">Choose your reply.${isStudent() ? " One try." : ""}</p><div class="choices">${d.options.map((o, i) => { const x = (res.wrongOpts || []).includes(i); return `<button class="choice reply ${x ? "crossed" : state.sel === i ? "sel" : ""}" ${x ? "disabled" : `data-act="opt" data-id="${i}"`}><b>↩ ${esc(o)}</b></button>`; }).join("")}</div><div class="sheetbtns"><button class="btn red" data-act="submit" ${state.sel === null ? "disabled" : ""}>Send reply</button>${!(state.hintOpen || res.hint) ? `<button class="btn plain" data-act="hint">${isStudent() ? "Hint (−25%)" : "Hint"}</button>` : ""}${state.msg ? `<span class="err">${esc(state.msg)}</span>` : ""}</div>`
      : `<div class="choices">${d.options.map((o, i) => `<div class="choice ${i === d.correct ? "right" : (res.wrongOpts || []).includes(i) ? "wrong" : "dim"}"><b>${i === d.correct ? "✓ " : (res.wrongOpts || []).includes(i) ? "✗ " : ""}${esc(o)}</b></div>`).join("")}</div>${resultHTML(tk, d, res, "mcq")}<div class="sheetbtns">${tk.key === "practice" ? `<button class="btn red" data-act="practice" data-id="practice">Another one</button><button class="btn plain" data-act="endpractice">Done</button>` : `<button class="btn red" data-act="close">Close email and stand up</button><button class="btn plain" data-act="practice" data-id="${tk.key}">Practice a similar one</button>`}</div>`}
    </div></div>`, `Mail – ${tk.T.title}`, "📧");
}
function pdfView(tk) {
  const d = tk.d, res = resOf(tk.key), done = res.status === "done";
  return pcFrame(tk, `<div class="pdfbar"><span>📄 ${esc(tk.T.title.toLowerCase().replace(/\s+/g, "_"))}.pdf</span><span class="pen on">🔴 Red pen</span><span>${done ? "" : `${state.picks.size} circled`}</span></div>
    <div class="pdfpage"><p class="brief">${d.brief}</p>${d.facts ? `<div class="facts">${d.facts.map(f => `<div class="fact"><div class="v">${esc(f[1])}</div><div class="k">${esc(f[0])}</div></div>`).join("")}</div>` : ""}${d.table ? tableHTML(d.table, true, done, new Set(d.wrong || []), res.given) : ""}<p class="q">${esc(d.q)}</p>
    ${!done ? `<p class="instr">Tap a row to circle it with the red pen. Tap again to rub it out.</p>${state.hintOpen || res.hint ? `<div class="tipbox"><b>Hint</b><span>${esc(d.hint)}</span></div>` : ""}<div class="sheetbtns"><button class="btn red" data-act="submit">Submit ${state.picks.size} circle${state.picks.size === 1 ? "" : "s"}</button>${!(state.hintOpen || res.hint) ? `<button class="btn plain" data-act="hint">${isStudent() ? "Hint (−25%)" : "Hint"}</button>` : ""}</div>`
      : `${resultHTML(tk, d, res, "flag")}<div class="sheetbtns">${tk.key === "practice" ? `<button class="btn red" data-act="practice" data-id="practice">Another one</button><button class="btn plain" data-act="endpractice">Done</button>` : `<button class="btn red" data-act="close">Close and stand up</button><button class="btn plain" data-act="practice" data-id="${tk.key}">Practice a similar one</button>`}</div>`}</div>`, "PDF Viewer", "📄");
}
function pcView(tk) { const a = appOf(tk); return a === "email" ? emailView(tk) : a === "pdf" ? pdfView(tk) : sheetView(tk); }
function pcOpened(tk) {
  state.scratch = {}; state.cell = null; state.ping = null; state.ansDraft = ""; state.pcPower = true; clearTimeout(state.pingT);
  if (!isPC(tk) || resOf(tk.key).status === "done" || Math.random() > .45) return;
  state.pingT = setTimeout(() => {
    if (state.ui !== "task" || state.task !== tk.key || resOf(tk.key).status === "done") return;
    const who = h => (CW.find(c => !c.barista && Math.random() < .5) || CW[0] || { name: "Omar" }).name.split(" ")[0];
    const line = PING_LINES[Math.floor(Math.random() * PING_LINES.length)];
    state.ping = { who: who() + ":", text: line.replace("{t}", tk.T.title), hint: line.includes("hint") && !isStudent() };
    Audio.play("ping"); renderUI();
  }, 5000 + Math.random() * 4000);
}
/* scratch cells update live as you type */
function pcInit() {
ov.addEventListener("input", e => {
  if (e.target.id === "ans") state.ansDraft = e.target.value;
  const c = e.target.closest(".scell"); if (c) { state.scratch[c.dataset.ref] = c.value; state.cell = c.dataset.ref; const map = cellMap(sheetOf(taskByKey(state.task)), state.scratch), out = c.closest("td").nextElementSibling; if (out) out.textContent = String(c.value).startsWith("=") ? (map[c.dataset.ref] !== undefined ? N(map[c.dataset.ref], 4) : "#ERR") : ""; const fv = ov.querySelector(".fv"), nm = ov.querySelector(".fxbar .nm"); if (fv) fv.textContent = c.value; if (nm) nm.textContent = c.dataset.ref; }
  if (e.target.matches(".pc input")) Audio.play("key");
});
ov.addEventListener("focusin", e => { const c = e.target.closest(".scell"); if (c) { state.cell = c.dataset.ref; ov.querySelectorAll(".grid .sel").forEach(x => x.classList.remove("sel")); c.closest("td").classList.add("sel"); const fv = ov.querySelector(".fv"), nm = ov.querySelector(".fxbar .nm"); if (fv) fv.textContent = c.value; if (nm) nm.textContent = c.dataset.ref; } if (e.target.id === "ans" && e.target.closest(".pc")) { const nm = ov.querySelector(".fxbar .nm"); if (nm) nm.textContent = "Answer"; } });
}
