/* ============================== CALCULATOR ==============================
   A Desmos-style scientific calculator: type or tap an expression, see the answer live,
   keep a history, and use functions like mean, median, mode, sum, min, max, round and sqrt. No eval. */
const calcEl = document.getElementById("calc");
const calc = { expr: "", open: false, tab: "123", hist: [], ans: 0 };
const FN_HELP = { mean: "average of a list", median: "middle value", mode: "most common value", sum: "add them all", min: "smallest", max: "biggest", range: "max − min", count: "how many", round: "round(x, decimals)", sqrt: "square root", abs: "remove the minus", pct: "pct(part, whole) = % of", change: "change(old, new) = % change" };
function mathEval(src, vars = {}) {
  let s = String(src).toLowerCase().replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/√/g, "sqrt").replace(/π/g, "pi").replace(/²/g, "^2").replace(/\s+/g, ""), i = 0;
  s = s.replace(/aed/g, "");
  const eat = c => s[i] === c ? (i++, true) : false;
  const F = {
    mean: a => a.reduce((x, y) => x + y, 0) / a.length, avg: a => F.mean(a), average: a => F.mean(a), sum: a => a.reduce((x, y) => x + y, 0), total: a => F.sum(a), count: a => a.length,
    median: a => { const b = [...a].sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; },
    mode: a => { const c = new Map(); a.forEach(v => c.set(v, (c.get(v) || 0) + 1)); let best = a[0], n = 0; c.forEach((k, v) => { if (k > n) { n = k; best = v; } }); return best; },
    min: a => Math.min(...a), max: a => Math.max(...a), range: a => Math.max(...a) - Math.min(...a),
    round: a => { const p = Math.pow(10, a[1] || 0); return Math.round(a[0] * p) / p; }, sqrt: a => Math.sqrt(a[0]), abs: a => Math.abs(a[0]),
    pct: a => a[0] / a[1] * 100, change: a => (a[1] - a[0]) / a[0] * 100, floor: a => Math.floor(a[0]), ceil: a => Math.ceil(a[0]),
  };
  function list() { const v = []; if (eat(")") || eat("]")) return v; do { v.push(expr()); } while (eat(",") || eat(";")); if (!(eat(")") || eat("]"))) throw 0; return v; }
  function atom() {
    if (eat("(")) { const v = expr(); if (!eat(")")) throw 0; return v; }
    if (eat("-")) return -pow(); if (eat("+")) return pow();
    const w = /^[a-z]+/.exec(s.slice(i));
    if (w) {
      const name = w[0]; i += name.length;
      if (F[name]) { if (!eat("(")) throw 0; let a = list(); if (a.length === 1 && Array.isArray(a[0])) a = a[0]; a = a.flat(); if (!a.length) throw 0; return F[name](a); }
      if (name === "pi") return Math.PI; if (name === "ans") return calc.ans; if (name in vars) return vars[name]; throw 0;
    }
    if (eat("[")) return list();
    const n = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i)); if (n) { i += n[0].length; return parseFloat(n[0]); }
    throw 0;
  }
  function post() { let v = atom(); while (s[i] === "%" ) { i++; v /= 100; } return v; }
  function pow() { const b = post(); if (eat("^")) return Math.pow(b, pow()); return b; }
  function term() { let v = pow(); for (;;) { if (eat("*")) v *= pow(); else if (eat("/")) v /= pow(); else if (/[a-z(]/.test(s[i] || "")) v *= pow(); else return v; } }
  function expr() { let v = term(); for (;;) { if (eat("+")) v += term(); else if (eat("-")) v -= term(); else return v; } }
  try { if (!s) return null; const v = expr(); if (i < s.length || typeof v !== "number" || !isFinite(v)) return NaN; return Math.round(v * 1e10) / 1e10; } catch (e) { return NaN; }
}
const calcEval = src => mathEval(src);
const KEYS = {
  "123": [["7"], ["8"], ["9"], ["÷"], ["("], [")"], ["4"], ["5"], ["6"], ["×"], ["%"], ["^"], ["1"], ["2"], ["3"], ["−"], [","], ["ans"], ["0"], ["."], ["⌫", "back"], ["+"], ["C", "clear"], ["=", "eq"]],
  "f(x)": [["mean(", "fn"], ["median(", "fn"], ["mode(", "fn"], ["sum(", "fn"], ["min(", "fn"], ["max(", "fn"], ["range(", "fn"], ["count(", "fn"], ["round(", "fn"], ["√(", "fn"], ["x²", "fn"], ["abs(", "fn"], ["pct(", "fn"], ["change(", "fn"], ["(", ""], [")", ""], [",", ""], ["⌫", "back"], ["C", "clear"], ["=", "eq"]],
};
function renderCalc() {
  calcEl.hidden = !calc.open; if (!calc.open) return;
  const live = mathEval(calc.expr), canUse = document.getElementById("ans") || document.querySelector("[data-act=opt]");
  calcEl.innerHTML = `<div class="calc-top"><b>Calculator</b><div class="calc-tabs">${Object.keys(KEYS).map(t => `<button data-k="tab:${t}" class="${calc.tab === t ? "on" : ""}">${t}</button>`).join("")}</div><button class="calc-x" data-k="close" aria-label="Close calculator">×</button></div>
    <div class="calc-hist">${calc.hist.slice(-4).map((h, n) => `<button class="hrow" data-k="hist:${calc.hist.length - Math.min(4, calc.hist.length) + n}"><span>${esc(h.e)}</span><b>= ${esc(N(h.v, 6))}</b></button>`).join("") || `<p class="calc-tip">Try <code>mean(12, 15, 21)</code>, <code>20% × 350</code> or <code>change(400, 560)</code></p>`}</div>
    <div class="calc-line"><input id="calcin" autocomplete="off" spellcheck="false" ${isTouch ? "inputmode=\"none\"" : ""} value="${esc(calc.expr)}" placeholder="Type a calculation…" aria-label="Calculation"><span class="calc-live ${live !== null && isNaN(live) ? "bad" : ""}">${live === null ? "" : isNaN(live) ? "…" : "= " + esc(N(live, 6))}</span></div>
    <div class="calc-keys ${calc.tab === "f(x)" ? "fx" : ""}">${KEYS[calc.tab].map(([k, t]) => `<button data-k="${esc(k)}" class="${t || ""}" title="${esc(FN_HELP[k.replace(/[(√]/g, "")] || "")}">${esc(k === "√(" ? "√" : k)}</button>`).join("")}</div>
    ${canUse && live !== null && !isNaN(live) ? `<button class="calc-use" data-k="use">Use ${esc(N(live, 6))} in my answer</button>` : ""}`;
  const inp = document.getElementById("calcin"); if (inp && !isTouch) { inp.focus({ preventScroll: true }); inp.setSelectionRange(inp.value.length, inp.value.length); }
}
function calcCommit() {
  const v = mathEval(calc.expr); if (v === null || isNaN(v)) { Audio.play("bad"); return; }
  calc.hist.push({ e: calc.expr, v }); if (calc.hist.length > 30) calc.hist.shift(); calc.ans = v; calc.expr = ""; Audio.play("tick");
}
function calcPress(k) {
  Audio.play("click");
  if (k === "close") { calc.open = false; return renderCalc(); }
  if (k.startsWith("tab:")) calc.tab = k.slice(4);
  else if (k.startsWith("hist:")) { const h = calc.hist[+k.slice(5)]; if (h) calc.expr += N(h.v, 10).replace(/,/g, ""); }
  else if (k === "C") calc.expr = "";
  else if (k === "⌫") calc.expr = calc.expr.slice(0, -1);
  else if (k === "=") calcCommit();
  else if (k === "use") {
    const v = mathEval(calc.expr || String(calc.ans)), a = document.getElementById("ans");
    if (v !== null && !isNaN(v)) { if (a) { a.value = String(v); state.ansDraft = a.value; a.focus({ preventScroll: true }); } else { const opt = [...document.querySelectorAll("[data-act=opt]")].find(b => parseNum(b.textContent) !== null && Math.abs(parseNum(b.textContent) - v) < .01 * Math.max(1, Math.abs(v))); if (opt) opt.click(); else toast(`${N(v, 4)} isn't one of the choices. Check your working!`); } }
  }
  else if (k === "x²") calc.expr += "^2";
  else if (k === "√(") calc.expr += "sqrt(";
  else calc.expr = (calc.expr + k).slice(0, 120);
  renderCalc();
}
calcEl.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) { e.stopPropagation(); calcPress(b.dataset.k); } });
calcEl.addEventListener("input", e => { if (e.target.id === "calcin") { calc.expr = e.target.value; const live = mathEval(calc.expr), el = calcEl.querySelector(".calc-live"); if (el) { el.textContent = live === null ? "" : isNaN(live) ? "…" : "= " + N(live, 6); el.classList.toggle("bad", live !== null && isNaN(live)); } } });
calcEl.addEventListener("keydown", e => { if (e.target.id !== "calcin") return; e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); calcCommit(); renderCalc(); } if (e.key === "Escape") { e.preventDefault(); calcPress("close"); renderUI(); } });
addEventListener("keydown", e => {
  if (!calc.open || !["task", "interview", "call", "inbox", "board"].includes(state.ui)) return;
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); calcPress("close"); renderUI(); return; }
}, true);
function toggleCalc(force) { calc.open = force ?? !calc.open; if (calc.open && document.activeElement && document.activeElement.blur) document.activeElement.blur(); renderCalc(); }
