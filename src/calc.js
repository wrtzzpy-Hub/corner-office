/* ============================== CALCULATOR ==============================
   A small on-screen calculator for task screens. Parses the expression itself (no eval). */
const calcEl = document.getElementById("calc");
const calc = { expr: "", result: null, open: false };
const CALC_KEYS = [["C", "clear"], ["⌫", "back"], ["%", "op"], ["÷", "op"], ["7"], ["8"], ["9"], ["×", "op"], ["4"], ["5"], ["6"], ["−", "op"], ["1"], ["2"], ["3"], ["+", "op"], ["0", "wide"], ["."], ["=", "eq"]];
function calcEval(src) {
  const toks = src.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").match(/\d*\.?\d+|[-+*/%]/g);
  if (!toks) return null;
  const out = [], ops = [], prec = { "+": 1, "-": 1, "*": 2, "/": 2 };
  let expectNum = true;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (/\d/.test(t)) { out.push(parseFloat(t)); expectNum = false; }
    else if (t === "%") { if (expectNum) return null; out.push(out.pop() / 100); }
    else if (t === "-" && expectNum) { out.push(0); ops.push("-"); }
    else { if (expectNum) return null; while (ops.length && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop()); ops.push(t); expectNum = true; }
  }
  if (expectNum) return null;
  while (ops.length) out.push(ops.pop());
  const st = [];
  for (const t of out) { if (typeof t === "number") st.push(t); else { const b = st.pop(), a = st.pop(); if (a === undefined || b === undefined) return null; st.push(t === "+" ? a + b : t === "-" ? a - b : t === "*" ? a * b : b === 0 ? NaN : a / b); } }
  const v = st[0]; return isFinite(v) ? Math.round(v * 1e8) / 1e8 : NaN;
}
function renderCalc() {
  calcEl.hidden = !calc.open; if (!calc.open) return;
  const canUse = calc.result !== null && !isNaN(calc.result) && document.getElementById("ans");
  calcEl.innerHTML = `<div class="calc-top"><b>Calculator</b><button class="calc-x" data-k="close" aria-label="Close calculator">×</button></div>
    <div class="calc-screen" aria-live="polite"><span class="calc-expr">${esc(calc.expr || "0")}</span><span class="calc-res">${calc.result === null ? "" : isNaN(calc.result) ? "Can't divide by 0" : "= " + N(calc.result, 6)}</span></div>
    <div class="calc-keys">${CALC_KEYS.map(([k, t]) => `<button data-k="${k}" class="${t || ""}">${k}</button>`).join("")}</div>
    ${canUse ? `<button class="calc-use" data-k="use">Put ${esc(N(calc.result, 6))} in my answer</button>` : ""}`;
}
function calcPress(k) {
  Audio.play("click");
  if (k === "close") { calc.open = false; return renderCalc(); }
  if (k === "C") { calc.expr = ""; calc.result = null; }
  else if (k === "⌫") { calc.expr = calc.expr.slice(0, -1); calc.result = null; }
  else if (k === "=") { const v = calcEval(calc.expr); calc.result = v === null ? NaN : v; }
  else if (k === "use") { const a = document.getElementById("ans"); if (a && calc.result !== null && !isNaN(calc.result)) { a.value = String(calc.result); a.focus({ preventScroll: true }); } }
  else {
    if (calc.result !== null && !isNaN(calc.result)) calc.expr = /[\d.]/.test(k) ? "" : String(calc.result);
    calc.result = null; calc.expr = (calc.expr + k).slice(0, 40);
  }
  renderCalc();
}
calcEl.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) { e.stopPropagation(); calcPress(b.dataset.k); } });
addEventListener("keydown", e => {
  if (!calc.open || state.ui !== "task") return;
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); calcPress("close"); renderUI(); return; }
  if (e.target.matches && e.target.matches("input,select,textarea")) return;
  const map = { "*": "×", "/": "÷", "-": "−", "Enter": "=", "Backspace": "⌫", "Escape": "close" };
  const k = map[e.key] || e.key;
  if (/^[0-9.+%=]$/.test(k) || ["×", "÷", "−", "⌫", "close"].includes(k)) { e.preventDefault(); e.stopPropagation(); calcPress(k === "=" ? "=" : k); }
}, true);
function toggleCalc(force) { calc.open = force ?? !calc.open; if (calc.open && document.activeElement && document.activeElement.blur) document.activeElement.blur(); renderCalc(); }
