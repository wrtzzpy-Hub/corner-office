/* ============================== SENIOR WORK ==============================
   Real-world duties for senior ranks: approvals and sign-offs, hiring, team reviews and bonuses, crises.
   via: "pc" arrives on your computer, "visitor" walks into your office. */
const SENIOR = [];
const sr = t => { const T = { min: 1, max: 4, major: "Leadership", senior: true, ...t }; SENIOR.push(T); TPL[T.id] = T; };
const TEAM = ["Omar", "Lina", "Sami", "Noura", "Dana", "Ali", "Faisal"];

sr({ id: "sr_signoff", kind: "mcq", via: "pc", title: "Sign off the contract", gen(r) {
  const h = H(r), sup = h.pick(["Gulf Supplies", "Marina Traders", "Desert Wholesale", "Oasis Goods"]), what = h.pick(["cleaning", "IT support", "security", "catering", "printing"]);
  const monthly = h.pick([2500, 3000, 3500, 4000, 4500]), months = h.pick([12, 18, 24]), setup = h.pick([0, 2000, 5000, 8000]), total = monthly * months + setup, budget = Math.round((total + h.pick([-1, 1]) * h.pick([4000, 6000, 9000])) / 1000) * 1000;
  const ok = total <= budget, ans = ok ? "Sign it: it fits the budget" : "Don't sign: it's over budget";
  return { brief: `${sup} wants a ${months}-month ${what} contract. The finance team has approved a budget of <b>${A(budget)}</b> for the whole contract.`, table: { cols: ["Term", "Amount"], align: ["", "r"], rows: [["Monthly fee", A(monthly)], ["Length", months + " months"], ["One-off setup fee", setup ? A(setup) : "None"]] }, q: "The contract is on your desk for sign-off. What do you do?", ...mcq(h, ans, ["Sign it: it fits the budget", "Don't sign: it's over budget", "Sign it: the monthly fee is low"], 3), hint: "Work out the full cost: monthly fee × months + setup fee. Compare it with the budget.", explain: `Total: ${N(monthly)} × ${months} + ${N(setup)} = ${A(total)}.<br>Budget: ${A(budget)}.<br>So: <b>${ans}</b>.` };
} });
sr({ id: "sr_expense", kind: "mcq", via: "pc", title: "Approve the expenses", gen(r) {
  const h = H(r), ppl = h.pickN(TEAM, 4), cap = h.pick([150, 200, 250]), bad = h.ri(0, 3), types = ["Client lunch", "Taxi", "Train ticket", "Hotel night", "Printer ink"];
  const rows = ppl.map((p, i) => { const t = h.pick(types); return [p, t, A(i === bad ? cap + h.ri(20, 120) : h.ri(40, cap - 10)), i === bad || r() < .8 ? "Yes" : "Yes"]; });
  const miss = h.pick([0, 1, 2, 3].filter(i => i !== bad)), noRec = r() < .5;
  if (noRec) rows[miss][3] = "No";
  const wrongOnes = [bad, ...(noRec ? [miss] : [])], ask = noRec ? "Which TWO claims break the rules?" : "Which claim breaks the rules?";
  const label = i => ppl[i], opts = noRec ? [`${label(bad)} and ${label(miss)}`, `${label(bad)} only`, `${label(miss)} only`, "Nobody: approve them all"] : ppl;
  const ans = noRec ? opts[0] : label(bad);
  return { brief: `Your team's expense claims need your approval. Company rules:<br>• No single claim over <b>${A(cap)}</b><br>• Every claim needs a receipt`, table: { cols: ["Name", "For", "Amount", "Receipt?"], align: ["", "", "r", ""], rows }, q: ask, ...mcq(h, ans, opts, 4), hint: "Check every row against BOTH rules: the amount limit and the receipt.", explain: `${label(bad)}'s claim is over ${A(cap)}.${noRec ? `<br>${label(miss)} has no receipt.` : ""}<br>Everything else follows the rules, so approve those.` };
} });
sr({ id: "sr_hire", kind: "mcq", via: "visitor", title: "Hire a new analyst", gen(r) {
  const h = H(r), names = h.pickN(["Yousef", "Maryam", "Karim", "Reem", "Tariq", "Huda", "Adel"], 4), maxPay = h.pick([9000, 10000, 12000]), minScore = h.pick([60, 65, 70]);
  for (let k = 0; k < 60; k++) {
    const rows = names.map(n => [n, h.ri(45, 95), h.ri(0, 5), maxPay + h.pick([-3000, -2000, -1000, 0, 1000, 2000])]);
    const fit = rows.filter(x => x[1] >= minScore && x[3] <= maxPay); if (!fit.length) continue;
    const best = fit.reduce((a, b) => b[1] > a[1] ? b : a); if (fit.filter(x => x[1] === best[1]).length > 1) continue;
    const top = rows.reduce((a, b) => b[1] > a[1] ? b : a); if (top === best) continue;
    return { brief: `Four candidates came in for interviews today. You can pay at most <b>${A(maxPay)}</b> a month, and they need at least <b>${minScore}</b> on the skills test. Pick the highest scorer who meets both rules.`, table: { cols: ["Candidate", "Test score", "Years' experience", "Salary asked"], align: ["", "r", "r", "r"], rows: rows.map(x => [x[0], x[1], x[2], A(x[3])]) }, q: "Who do you hire?", ...mcq(h, best[0], names, 4), hint: "Cross out anyone who scored too low or asks for too much. Then pick the best score left.", explain: rows.map(x => `${x[0]}: ${x[1] < minScore ? "score too low ✗" : x[3] > maxPay ? "asks too much ✗" : "meets both rules ✓"}`).join("<br>") + `<br>Best of the rest: <b>${best[0]}</b> (${best[1]}). ${top[0]} scored higher but ${top[3] > maxPay ? "asks too much" : "didn't pass"}.` };
  }
} });
sr({ id: "sr_bonus", kind: "calc", via: "pc", title: "Split the bonus pool", gen(r) {
  const h = H(r), ppl = h.pickN(TEAM, 3), pts = h.pick([[5, 3, 2], [4, 4, 2], [6, 3, 1], [5, 4, 1], [3, 2, 1]]), unit = h.pick([1000, 1500, 2000, 500]), tot = pts.reduce((a, b) => a + b, 0), pool = tot * unit, who = h.ri(0, 2), a = pts[who] * unit;
  return { brief: `You have a bonus pool of <b>${A(pool)}</b> for your team. It's shared out by performance points: each point is worth the same.`, table: { cols: ["Team member", "Performance points"], align: ["", "r"], rows: ppl.map((p, i) => [p, pts[i]]) }, q: `How much bonus does ${ppl[who]} get?`, answer: a, unit: "AED", wrongs: wr(a, [pool / 3, pts[who] * 1000, a + unit, pool - a, a / 2]), hint: "Add up all the points. Divide the pool by that to find what one point is worth.", explain: `Total points: ${pts.join(" + ")} = ${tot}.<br>One point: ${N(pool)} ÷ ${tot} = ${A(unit)}.<br>${ppl[who]}: ${pts[who]} × ${N(unit)} = <b>${A(a)}</b>.` };
} });
sr({ id: "sr_review", kind: "mcq", via: "pc", title: "Team performance review", gen(r) {
  const h = H(r), ppl = h.pickN(TEAM, 4);
  for (let k = 0; k < 60; k++) {
    const tg = ppl.map(() => h.pick([20, 25, 40, 50, 80, 100])), act = tg.map(t => Math.round(t * (h.ri(80, 140) / 100))), pct = act.map((a, i) => Math.round((a / tg[i] - 1) * 100));
    const mx = Math.max(...pct); if (pct.filter(p => p === mx).length > 1) continue;
    const best = pct.indexOf(mx); if (act.indexOf(Math.max(...act)) === best) continue;
    return { brief: "It's review season. Here are your team's sales targets and results for the quarter.", table: { cols: ["Name", "Target", "Actual"], align: ["", "r", "r"], rows: ppl.map((p, i) => [p, tg[i], act[i]]) }, q: "Who beat their own target by the biggest percentage?", ...mcq(h, ppl[best], ppl, 4), hint: "Biggest number isn't the answer. For each person: (actual − target) ÷ target.", explain: ppl.map((p, i) => `${p}: ${act[i] - tg[i] >= 0 ? "+" : ""}${act[i] - tg[i]} on ${tg[i]} = ${pct[i] >= 0 ? "+" : ""}${pct[i]}%`).join("<br>") + `<br>So <b>${ppl[best]}</b> did best against their target.` };
  }
} });
sr({ id: "sr_budgetcut", kind: "calc", via: "pc", title: "Cut the budget", gen(r) {
  const h = H(r), depts = h.pickN(["Marketing", "IT", "Travel", "Training", "Events"], 3), vals = depts.map(() => h.pick([20, 30, 40, 50, 60, 80]) * 1000), cut = h.pick([10, 20, 25]), protect = h.ri(0, 2), rest = vals.filter((_, i) => i !== protect).reduce((a, b) => a + b, 0), total = vals.reduce((a, b) => a + b, 0), target = total * cut / 100, pctRest = Math.round(target / rest * 10000) / 100;
  if (pctRest !== Math.round(pctRest * 10) / 10) return this.gen(mul32((r() * 1e9) | 0));
  return { brief: `The board wants the total budget cut by <b>${cut}%</b>. But ${depts[protect]} can't be cut at all, so the other two departments share the cut by the same percentage.`, table: { cols: ["Department", "Budget"], align: ["", "r"], rows: depts.map((d, i) => [d, A(vals[i])]) }, q: "By what percentage must the other two departments be cut?", answer: pctRest, unit: "%", wrongs: wr(pctRest, [cut, cut * 1.5, cut / 2, pctRest + 5, Math.round(target / total * 100)]), hint: `First find ${cut}% of the TOTAL budget. Then see what % that is of the two departments you can cut.`, explain: `Total: ${A(total)}. ${cut}% of that = ${A(target)}.<br>The two cuttable departments: ${A(rest)}.<br>${N(target)} ÷ ${N(rest)} = <b>${pctRest}%</b>.` };
} });
sr({ id: "sr_pitch", kind: "mcq", via: "visitor", title: "Win the client", gen(r) {
  const h = H(r), S = h.pick([
    ["A new client asks why they should pick your firm over Falcon Advisory, which is 20% cheaper.", "Show what you've achieved for similar clients and offer a clear plan", ["Cut your price by 30% straight away", "Say Falcon Advisory is terrible", "Promise results you can't guarantee"], "Clients pay for value they can see. Evidence and a plan beat a price war or bad-mouthing a rival."],
    ["A client wants their project finished in half the usual time, at the same price.", "Explain what's possible and offer options: more people for a higher fee, or a smaller first phase", ["Agree, and hope the team can manage", "Refuse and end the meeting", "Agree, then quietly cut quality"], "Good leaders are honest about trade-offs and give the client a real choice."],
    ["A client asks you to change a report so their sales look bigger for the bank.", "Refuse politely and explain you can only report the true numbers", ["Do it this once", "Do it but don't sign your name", "Ask the junior to do it instead"], "Changing numbers to mislead a bank is dishonest and illegal. Your firm's reputation depends on trust."],
    ["A long-time client is unhappy about a late delivery and says they might leave.", "Apologise, explain what went wrong and what you've changed so it won't happen again", ["Blame your team", "Offer free work forever", "Tell them everyone is late sometimes"], "Owning the mistake and showing the fix keeps trust."]]);
  return { brief: S[0], q: "What do you say?", ...mcq(h, S[1], S[2]), hint: "Think long term: honesty and trust matter more than winning one argument.", explain: `<b>${S[1]}</b>.<br>${S[3]}` };
} });

/* ---------- crises (senior events) ---------- */
const CRISES = [
  ["🚨 A customer's angry video about your client is going viral.", "Reply publicly and calmly, apologise, and explain how you'll fix it", ["Ignore it and hope it goes away", "Argue with the customer in the comments", "Delete the company's social media"]],
  ["🚨 IT says an employee emailed a file of customer details to the wrong person.", "Contact the person to delete it, tell your manager and IT, and inform affected customers", ["Say nothing and hope nobody notices", "Fire the employee on the spot", "Delete all the company's emails"]],
  ["🚨 Your client's main supplier has just gone out of business.", "Contact backup suppliers today and tell customers about any delays", ["Wait a month to see what happens", "Stop selling everything", "Tell customers nothing has changed"]],
  ["🚨 Your best analyst resigns two days before a big deadline.", "Thank them, plan a handover, and share the work fairly across the team", ["Make the team work all night without a plan", "Ask the client to cancel the project", "Do nothing and miss the deadline"]],
  ["🚨 A big order was priced at AED 1,000 instead of AED 10,000 by mistake, and the customer has already accepted.", "Call the customer, explain the mistake honestly, and agree a fair solution", ["Ship it and send a surprise bill later", "Cancel the order without telling them", "Blame the customer for the mistake"]],
  ["🚨 The office internet is down and a client presentation starts in 20 minutes.", "Switch to a phone hotspot, send the slides by email, and warn the client you might be a few minutes late", ["Cancel the meeting with no explanation", "Wait and hope it comes back", "Present without any slides or numbers"]],
];
function makeCrisis() {
  const h = H(mul32((Math.random() * 2 ** 31) | 0)), c = h.pick(CRISES), o = mcq(h, c[1], c[2]);
  return { crisis: true, title: "Crisis", brief: c[0], q: "You have 30 seconds. What do you do first?", options: o.options, correct: o.correct, explain: `<b>${c[1]}</b>.<br>In a crisis, act fast, be honest, and tell the people affected.`, end: performance.now() + 30000, sel: null, picked: null, timedOut: false };
}

/* ---------- delegation and review (Manager and up) ---------- */
const canDelegate = () => curRank() >= 4;
const delegLimit = () => ENG && ENG.office ? 4 : 2;
const delegUsed = () => ENG ? Object.values(ENG.res).filter(r => r.by).length : 0;
const isAway = k => { const r = ENG && ENG.res[k]; return !!r && (r.status === "delegated" || r.status === "review"); };
const delegable = t => t.key !== "cap" && ["calc", "mcq", "count"].includes(t.T.kind) && !t.T.senior;
function delegate(key, who) {
  const t = taskByKey(key), res = resOf(key); if (!t || res.status !== "todo" && res.status !== undefined) return;
  Object.assign(res, { status: "delegated", by: who, readyAt: Date.now() + (who === "Ravi" ? 20000 : 25000 + Math.random() * 20000) });
  storeEng(); rebuildInter(); renderHud();
}
function checkDelegated() {
  if (!ENG || ENG.done) return;
  for (const t of ENG.list) { const r = ENG.res[t.key]; if (r && r.status === "delegated" && Date.now() >= r.readyAt) { r.status = "review"; storeEng(); Audio.play("ping"); toast(`📥 ${r.by} finished “${t.T.title}”. Review it: ${isTouch ? "tap Tasks" : "press T"}.`); renderHud(); if (state.ui === "overview") renderUI(); } }
}
function juniorAnswer(t) {
  const res = ENG.res[t.key], r = mul32(hashStr(t.key + ENG.seed + res.by)), right = r() < (res.by === "Sami" ? .45 : .62), d = t.d;
  if (d.options) { const wrong = d.options.map((_, i) => i).filter(i => i !== d.correct); return { right, text: d.options[right ? d.correct : wrong[Math.floor(r() * wrong.length)]] }; }
  if (right) return { right, text: fmtAns(d.answer, d.unit) };
  const w = d.wrongs && d.wrongs.length ? d.wrongs[Math.floor(r() * d.wrongs.length)] : t.T.kind === "count" ? d.answer + (r() < .5 ? -1 : 1) * (1 + Math.floor(r() * 3)) : d.answer * (r() < .5 ? .9 : 1.1);
  return { right, text: fmtAns(w, d.unit) };
}
function submitReview(approve) {
  const t = taskByKey(state.task), res = resOf(t.key), j = juniorAnswer(t), ok = approve === j.right, max = ptsFor(t.tier);
  Object.assign(res, { status: "done", frac: ok ? 1 : 0, pts: ok ? max : 0, max, reviewed: true, approve, juniorRight: j.right });
  storeEng(); Audio.play(ok ? "good" : "bad"); renderUI(); rebuildInter();
}
function reviewView(t) {
  const d = t.d, res = resOf(t.key), j = juniorAnswer(t), done = res.status === "done";
  return `<section class="fadein"><div class="ov-top"><div class="row-btns"><button class="btn ghost" data-act="close">← Back</button></div><span class="hint2">Reviewing ${esc(res.by)}'s work</span></div><article class="paper">
    <div class="chips-row"><span class="chipx k">Review</span><span class="chipx">${esc(t.T.major)}</span><span class="chipx">${ptsFor(t.tier)} pts</span></div>
    <h3 class="h2" style="font-size:30px">${esc(t.T.title)}</h3>
    <div class="npc-line"><div class="av" style="background:#3a4a5e">${esc(res.by[0])}</div><p class="brief">"${res.by === "Ravi" ? "I've counted the stock for you." : "Here's my work. Can you check it before it goes to the client?"}"</p></div>
    <p class="brief">${d.brief}</p>${d.facts ? `<div class="facts">${d.facts.map(f => `<div class="fact"><div class="v">${esc(f[1])}</div><div class="k">${esc(f[0])}</div></div>`).join("")}</div>` : ""}${d.table ? tableHTML(d.table, false, false, new Set(), null) : ""}
    <p class="q">${esc(d.q)}</p>
    <div class="junior"><span>${esc(res.by)}'s answer</span><b>${esc(j.text)}</b></div>
    ${!done ? `<p class="instr">Work it out yourself. If ${esc(res.by)} is right, approve it. If not, send it back.</p><div class="row-btns"><button class="btn red" data-act="approve">✓ Approve</button><button class="btn plain" data-act="sendback">✗ Send it back</button><button class="btn ghost calc-btn" data-act="calc" aria-pressed="${calc.open}" style="color:var(--ink)">Calculator</button></div>`
      : `<div class="result ${res.frac ? "good" : "bad"}"><div class="res-h"><b class="t">${res.frac ? "✓ Good call" : "✗ Wrong call"}</b><span class="pts">+${res.pts} pts</span></div><p class="sum">${esc(res.by)} was <b>${j.right ? "right" : "wrong"}</b>, and you ${res.approve ? "approved it" : "sent it back"}. ${j.right ? "" : `The correct answer is <b>${esc(d.options ? d.options[d.correct] : fmtAns(d.answer, d.unit))}</b>.`}</p><div class="howto"><h4>How to get it right</h4><ol>${stepsOf(d.explain).map(x => `<li>${x}</li>`).join("")}</ol></div></div><div class="row-btns" style="margin-top:14px"><button class="btn red" data-act="close">Continue</button></div>`}
  </article></section>`;
}
