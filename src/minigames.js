/* ============================== BOARD MEETING AND MINI-GAMES ============================== */
if (!save.best) save.best = {};
if (!save.boardDay) save.boardDay = { casual: "", student: "" };
BADGES.push({ id: "board", ic: "🏛️", name: "Boardroom hero", how: "Get 5 out of 5 in a board meeting" }, { id: "cashier", ic: "🧾", name: "Speed cashier", how: "Serve 12 customers in one till rush" }, { id: "sorter", ic: "📦", name: "Stock master", how: "Sort 20 items in one stock sort" });
for (const b of BADGES) BADGE[b.id] = b;
let mgTimer = null;
const mgLeft = g => Math.max(0, Math.ceil((g.end - performance.now()) / 1000));
function mgTick(onEnd) {
  clearInterval(mgTimer);
  mgTimer = setInterval(() => {
    const g = state.mg; if (!g || g.over || !["board", "till", "sort"].includes(state.ui)) { clearInterval(mgTimer); return; }
    const left = mgLeft(g), el = document.getElementById("mgtime"); if (el) { el.textContent = left + "s"; el.classList.toggle("low", left <= 5); }
    if (left <= 0) onEnd();
  }, 200);
}

/* ---------- board meeting: 5 rapid questions, 25 s each, once a day ---------- */
const boardReady = () => save.boardDay[save.mode] !== today();
function quickPool() {
  if (isStudent()) { const tier = baseTier(); let pool = TEMPLATES.filter(t => !t.cap && (t.kind === "mcq" || t.kind === "calc") && t.min <= tier && t.max >= tier - 1 && t.major === save.major); if (pool.length < 5) pool = TEMPLATES.filter(t => !t.cap && (t.kind === "mcq" || t.kind === "calc") && t.min <= tier); return pool.map(t => [t, Math.max(t.min, Math.min(t.max, tier))]); }
  const ft = funTier(curRank()); return FUN.filter(t => (t.kind === "mcq" || t.kind === "calc") && t.min <= ft).map(t => [t, Math.min(3, Math.max(t.min, ft + 1))]);
}
function quickQ(t, tier, seed) {
  const ind = INDUSTRIES[seed % INDUSTRIES.length], ctx = { client: "Haddad & Partners", exec: "the board", ind: ind.ind, prod: ind.prod, cost: ind.cost, per: ind.per, bay: 18 };
  const d = t.gen(mul32(seed), tier, ctx), o = t.kind === "calc" ? numChoices(d, seed + 5) : { options: d.options, correct: d.correct };
  return { title: t.title, brief: d.brief, table: d.table, facts: d.facts, q: d.q, options: o.options, correct: o.correct, explain: d.explain };
}
function startBoard() {
  const h = H(mul32((Math.random() * 2 ** 31) | 0)), qs = h.pickN(quickPool(), 5).map(([t, tier]) => quickQ(t, tier, (Math.random() * 2 ** 31) | 0));
  state.mg = { kind: "board", qs, i: 0, right: 0, combo: 0, sel: null, picked: null, end: performance.now() + 25000, over: false };
  save.boardDay[save.mode] = today(); persist();
  openUI("board"); mgTick(() => boardAnswer(-1));
}
function boardAnswer(choice) {
  const g = state.mg; if (!g || g.picked !== null) return;
  clearInterval(mgTimer); g.picked = choice; const q = g.qs[g.i];
  if (choice === q.correct) { g.right++; g.combo++; Audio.play("good"); } else { g.combo = 0; Audio.play("bad"); }
  g.timedOut = choice === -1; renderUI();
}
function boardNext() {
  const g = state.mg; g.i++; g.sel = null; g.picked = null;
  if (g.i >= g.qs.length) {
    g.over = true; const rk = curRank(), cash = Math.round((150 + rk * 120) * g.right), xp = g.right * 60;
    g.cash = earn(cash); career().xp += xp; g.xp = xp; save.best.board = Math.max(save.best.board || 0, g.right); persist();
    if (g.right === 5) award("board"); Audio.play(g.right >= 3 ? "fanfare" : "stamp");
  } else { g.end = performance.now() + 25000; mgTick(() => boardAnswer(-1)); Audio.play("paper"); }
  renderUI(); ov.scrollTop = 0;
}

/* ---------- café till rush: give the right change, 60 s ---------- */
const MENU = [["Karak chai", 8], ["Flat white", 14], ["Arabic coffee", 10], ["Fresh juice", 16], ["Date cake", 12], ["Falafel wrap", 18]];
function tillOrder() {
  const h = H(mul32((Math.random() * 2 ** 31) | 0)), served = state.mg ? state.mg.score : 0, n = Math.min(4, 1 + Math.floor(served / 3) + (Math.random() < .4 ? 1 : 0));
  const items = [...Array(n)].map(() => h.pick(MENU)), tot = items.reduce((a, b) => a + b[1], 0), pay = [20, 50, 100, 200].find(x => x > tot), ch = pay - tot;
  const opts = h.shuf([ch, ...h.pickN([...new Set([ch + 10, ch - 10, ch + 2, ch - 2, ch + 5, ch + 1, ch - 1].filter(v => v >= 0 && v !== ch))], 3)]);
  const counts = {}; items.forEach(([nm]) => counts[nm] = (counts[nm] || 0) + 1);
  return { text: Object.entries(counts).map(([nm, c]) => `${c} × ${nm}`).join(", "), tot, pay, ch, opts, who: h.pick(["👩", "👨", "🧕", "👳", "👧", "🧑", "👴"]) };
}
function startTill() { state.mg = { kind: "till", score: 0, wrong: 0, end: performance.now() + 60000, over: false, flash: "" }; state.mg.order = tillOrder(); openUI("till"); mgTick(endTill); }
function tillAnswer(v) {
  const g = state.mg; if (!g || g.over) return;
  if (v === g.order.ch) { g.score++; g.flash = "good"; Audio.play("tick"); }
  else { g.wrong++; g.end -= 4000; g.flash = "bad"; Audio.play("bad"); }
  g.order = tillOrder(); renderUI();
}
function endTill() {
  const g = state.mg; if (!g || g.over) return; clearInterval(mgTimer); g.over = true;
  g.cash = earn(g.score * 25); save.best.till = Math.max(save.best.till || 0, g.score); persist();
  if (g.score >= 12) award("cashier"); Audio.play(g.score >= 6 ? "fanfare" : "stamp"); renderUI();
}

/* ---------- stock sort: rules change every 6 items, 45 s ---------- */
const STOCK_ITEMS = [["Frozen pizza", "Frozen", 22], ["Ice cream tub", "Frozen", 18], ["Frozen peas", "Frozen", 9], ["Fresh milk", "Fresh", 7], ["Strawberries", "Fresh", 15], ["Chicken breast", "Fresh", 32], ["Rice (5 kg)", "Dry goods", 38], ["Pasta", "Dry goods", 6], ["Cereal", "Dry goods", 19], ["Orange juice", "Drinks", 11], ["Sparkling water", "Drinks", 4], ["Energy drink", "Drinks", 9], ["Olive oil", "Dry goods", 45], ["Salmon fillet", "Fresh", 58], ["Coffee beans", "Dry goods", 64], ["Frozen prawns", "Frozen", 52]];
const SORT_RULES = [
  { name: "Sort by storage", cats: ["Frozen", "Fresh", "Dry goods", "Drinks"], of: it => it[1] },
  { name: "Sort by price", cats: ["Under AED 10", "AED 10–30", "Over AED 30"], of: it => it[2] < 10 ? "Under AED 10" : it[2] <= 30 ? "AED 10–30" : "Over AED 30" },
  { name: "Cold or not?", cats: ["Needs the fridge or freezer", "Shelf is fine"], of: it => ["Frozen", "Fresh"].includes(it[1]) ? "Needs the fridge or freezer" : "Shelf is fine" }];
function startSort() { state.mg = { kind: "sort", score: 0, wrong: 0, n: 0, rule: 0, end: performance.now() + 45000, over: false, flash: "" }; nextSortItem(); openUI("sort"); mgTick(endSort); }
function nextSortItem() { const g = state.mg; g.item = STOCK_ITEMS[Math.floor(Math.random() * STOCK_ITEMS.length)]; if (g.n > 0 && g.n % 6 === 0) { g.rule = (g.rule + 1) % SORT_RULES.length; g.ruleFlash = true; } else g.ruleFlash = false; }
function sortAnswer(cat) {
  const g = state.mg; if (!g || g.over) return; const R = SORT_RULES[g.rule];
  if (R.of(g.item) === cat) { g.score++; g.flash = "good"; Audio.play("box"); } else { g.wrong++; g.end -= 3000; g.flash = "bad"; Audio.play("bad"); }
  g.n++; nextSortItem(); renderUI();
}
function endSort() {
  const g = state.mg; if (!g || g.over) return; clearInterval(mgTimer); g.over = true;
  g.cash = earn(g.score * 20); save.best.sort = Math.max(save.best.sort || 0, g.score); persist();
  if (g.score >= 20) award("sorter"); Audio.play(g.score >= 8 ? "fanfare" : "stamp"); renderUI();
}

/* ---------- views ---------- */
function mgViews() {
  return {
    board: () => {
      const g = state.mg;
      if (g.over) return `<article class="paper memo fadein"><div class="letterhead"><div class="co">🏛️ Board meeting</div><div class="label">Result</div></div>
        <div class="promo"><div class="big stamp-in">${g.right} / 5</div><p>${g.right === 5 ? `"Outstanding${myName() ? ", " + esc(myName()) : ""}. The board is very impressed."` : g.right >= 3 ? `"Solid answers. The board is pleased."` : `"The board expected more. Come back tomorrow."`}</p>
        <p class="cashline" style="justify-content:center">💰 +${A(g.cash)} · +${g.xp} XP · best ${save.best.board}/5</p><button class="btn red" data-act="mgdone">Back</button></div></article>`;
      const q = g.qs[g.i], ans = g.picked !== null, ok = g.picked === q.correct;
      return `<section class="fadein"><article class="paper boardcard">
        <div class="letterhead"><div class="co">🏛️ Board meeting · ${g.i + 1} of 5</div><div class="label">${ans ? `${g.right} right` : `<span id="mgtime" class="calltime">${mgLeft(g)}s</span>`}</div></div>
        <div class="boardrow">${[["K", "#1c2633"], ["L", "#5a2a40"], ["R", "#3a4a5e"], ["F", "#2e8b57"]].map(([a, c]) => `<div class="av" style="background:${c}">${a}</div>`).join("")}<span>${g.combo >= 2 ? `🔥 ${g.combo} in a row` : "The board is waiting for your answer…"}</span></div>
        <div class="ivdots">${g.qs.map((x, i) => `<i class="${i < g.i ? "past" : i === g.i ? "now" : ""}"></i>`).join("")}</div>
        <p class="brief">${q.brief}</p>
        ${q.facts ? `<div class="facts">${q.facts.map(f => `<div class="fact"><div class="v">${esc(f[1])}</div><div class="k">${esc(f[0])}</div></div>`).join("")}</div>` : ""}
        ${q.table ? tableHTML(q.table, false, false, new Set(), null) : ""}
        <p class="q">${esc(q.q)}</p>
        <div class="choices">${q.options.map((o, i) => ans ? `<div class="choice ${i === q.correct ? "right" : i === g.picked ? "wrong" : "dim"}"><b>${i === q.correct ? "✓ " : i === g.picked ? "✗ " : ""}${esc(o)}</b></div>` : `<button class="choice" data-act="mgopt" data-id="${i}"><b>${esc(o)}</b></button>`).join("")}</div>
        ${ans ? `<div class="result ${ok ? "good" : "bad"}"><div class="res-h"><b class="t">${ok ? "✓ Correct" : g.timedOut ? "⏱ Too slow" : "✗ Wrong"}</b></div><div class="howto"><ol>${stepsOf(q.explain).map(x => `<li>${x}</li>`).join("")}</ol></div></div><div class="row-btns" style="margin-top:14px"><button class="btn red" data-act="mgnext">${g.i < 4 ? "Next question" : "Hear the verdict"}</button></div>`
        : `<p class="instr">Tap an answer. One try, 25 seconds.</p><div class="row-btns"><button class="btn ghost calc-btn" data-act="calc" aria-pressed="${calc.open}" style="color:var(--ink)">Calculator</button></div>`}
      </article></section>`;
    },
    till: () => {
      const g = state.mg;
      if (g.over) return `<article class="paper memo fadein"><div class="letterhead"><div class="co">🧾 Till rush</div><div class="label">Time's up</div></div><div class="promo"><div class="big stamp-in">${g.score} served</div><p>Hamza: "${g.score >= 12 ? "You're faster than me!" : g.score >= 6 ? "Nice work. The queue's gone!" : "Busy, isn't it? Try again!"}"</p><p class="cashline" style="justify-content:center">💰 +${A(g.cash)} tips · best ${save.best.till}</p><div class="row-btns" style="justify-content:center"><button class="btn red" data-act="till">Play again</button><button class="btn plain" data-act="mgdone">Back</button></div></div></article>`;
      const o = g.order;
      return `<section class="fadein"><article class="paper mgcard ${g.flash}">
        <div class="letterhead"><div class="co">🧾 Till rush · The Ledger Café</div><div class="label"><span id="mgtime" class="calltime">${mgLeft(g)}s</span></div></div>
        <div class="mgscore"><span>Served <b>${g.score}</b></span><span>Mistakes <b>${g.wrong}</b> (−4 s each)</span></div>
        <div class="order"><span class="who">${o.who}</span><div><p>"${esc(o.text)}, please."</p><small>The order comes to <b>${A(o.tot)}</b>. They pay with an <b>${A(o.pay)}</b> note.</small></div></div>
        <p class="q">How much change?</p>
        <div class="choices grid2">${o.opts.map(v => `<button class="choice" data-act="tillopt" data-id="${v}"><b>${A(v)}</b></button>`).join("")}</div>
        <p class="instr" style="margin-top:12px">Menu: ${MENU.map(([n, p]) => `${n} ${p}`).join(" · ")}</p>
      </article></section>`;
    },
    sort: () => {
      const g = state.mg;
      if (g.over) return `<article class="paper memo fadein"><div class="letterhead"><div class="co">📦 Stock sort</div><div class="label">Time's up</div></div><div class="promo"><div class="big stamp-in">${g.score} sorted</div><p>Ravi: "${g.score >= 20 ? "Best sorter I've ever seen!" : g.score >= 8 ? "Good job, the shelves look great." : "Watch out when the rules change!"}"</p><p class="cashline" style="justify-content:center">💰 +${A(g.cash)} · best ${save.best.sort}</p><div class="row-btns" style="justify-content:center"><button class="btn red" data-act="sortgame">Play again</button><button class="btn plain" data-act="mgdone">Back</button></div></div></article>`;
      const R = SORT_RULES[g.rule], it = g.item;
      return `<section class="fadein"><article class="paper mgcard ${g.flash}">
        <div class="letterhead"><div class="co">📦 Stock sort · Stockroom</div><div class="label"><span id="mgtime" class="calltime">${mgLeft(g)}s</span></div></div>
        <div class="mgscore"><span>Sorted <b>${g.score}</b></span><span>Mistakes <b>${g.wrong}</b> (−3 s each)</span></div>
        <p class="rule ${g.ruleFlash ? "new" : ""}">${g.ruleFlash ? "⚠️ New rule! " : ""}<b>${R.name}</b></p>
        <div class="crate"><b>${esc(it[0])}</b><small>${it[1] === "Frozen" ? "❄️ keep frozen" : it[1] === "Fresh" ? "🥬 use within days" : it[1] === "Drinks" ? "🥤 drink" : "📦 store dry"} · ${A(it[2])}</small></div>
        <div class="choices grid2">${R.cats.map(c => `<button class="choice" data-act="sortopt" data-id="${esc(c)}"><b>${esc(c)}</b></button>`).join("")}</div>
      </article></section>`;
    },
  };
}
