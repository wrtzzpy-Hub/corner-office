/* ============================== PLAY FOR FUN: THINKING QUESTIONS ==============================
   Harder, teen-level reasoning. Everything needed is in the question; no business knowledge required. */

const THINK_FROM = FUN.length;
/* ---------- unlocked from the start ---------- */
fun({ id: "f_rank", min: 1, major: "Team", kind: "mcq", title: "Who sold the most?", gen(r, T) {
  const h = H(r), n = T === 1 ? 3 : 4, ppl = h.pickN(["Omar", "Lina", "Sami", "Dana", "Ali", "Noura", "Faisal"], n), order = h.shuf(ppl);
  const clues = []; for (let i = 0; i < n - 1; i++) clues.push(h.pick([`${order[i]} sold more than ${order[i + 1]}`, `${order[i + 1]} sold fewer than ${order[i]}`]));
  const most = r() < .6 || T === 1, ans = most ? order[0] : order[n - 1];
  return { brief: `The shop's sales team won't say their totals, but they gave these clues:<br>• ${h.shuf(clues).join("<br>• ")}`, q: most ? "Who sold the most?" : "Who sold the least?", ...mcq(h, ans, ppl, n), hint: "Put the names in a line from most to least, one clue at a time.", explain: `From most to least: <b>${order.join(" → ")}</b>.<br>So <b>${ans}</b> sold the ${most ? "most" : "least"}.` };
} });
fun({ id: "f_upten", min: 1, major: "Money", kind: "calc", title: "Up, then down", gen(r, T) {
  const h = H(r), p = h.pick([100, 200, 400, 500, 800]), u = h.pick(T === 1 ? [10, 20, 50] : [10, 20, 25, 50]), d = T === 1 ? u : h.pick([10, 20, 25, 50].filter(x => x !== u).concat([u])), up = p * (1 + u / 100), a = Math.round(up * (1 - d / 100) * 100) / 100;
  const item = h.pick(["pair of trainers", "game console", "bike", "phone"]);
  return { brief: `A ${item} costs ${A(p)}. The shop raises the price by ${u}%. A month later it has a ${d}% off sale.`, q: "What is the sale price?", answer: a, unit: "AED", wrongs: wr(a, [p, p * (1 + (u - d) / 100), up, up - d, p - 1]), hint: `The ${d}% is taken off the NEW price, not the old one. So it won't land back at ${A(p)}.`, explain: `After the rise: ${p} + ${u}% = ${A(up)}.<br>${d}% of ${A(up)} is ${A(up * d / 100)}.<br>${up} − ${up * d / 100} = <b>${A(a)}</b>.<br>${u === d ? "Up and down by the same % does NOT get you back where you started!" : ""}` };
} });
fun({ id: "f_stack", min: 1, major: "Money", kind: "mcq", title: "Which discount wins?", gen(r, T) {
  const h = H(r), p = h.pick([200, 300, 400, 500]), a1 = h.pick([20, 30]), a2 = h.pick([10, 20]), b = a1 + a2, A1 = p * (1 - a1 / 100) * (1 - a2 / 100), B1 = p * (1 - b / 100), k = h.pick([3, 4]), C1 = T >= 2 ? p * (k - 1) / k : null;
  const opts = [`${a1}% off, then another ${a2}% off at the till`, `${b}% off in one go`]; if (C1 !== null) opts.push(`Buy ${k}, pay for ${k - 1} (one free)`);
  const vals = [A1, B1, ...(C1 !== null ? [C1] : [])], best = vals.indexOf(Math.min(...vals));
  if (vals.filter(v => Math.abs(v - vals[best]) < .01).length > 1) return fun3Retry(this, r, T);
  return { brief: C1 !== null ? `You want to buy ${k} hoodies at ${A(p / k)} each (${A(p)} in total). Three shops have different deals:` : `You want to buy a jacket priced ${A(p)}. Two shops have different deals:`, q: "Which deal costs you the least?", ...mcq(h, opts[best], opts, opts.length), hint: "Work out the final price for each deal. Two discounts in a row are NOT the same as adding them.", explain: `${opts[0]}: ${A(p)} → ${A(p * (1 - a1 / 100))} → <b>${A(A1)}</b><br>${opts[1]}: <b>${A(B1)}</b>${C1 !== null ? `<br>${opts[2]}: you pay ${k - 1} × ${A(p / k)} = <b>${A(C1)}</b>` : ""}<br>So <b>${opts[best]}</b> wins.` };
} });
function fun3Retry(t, r, T) { return t.gen(r, T); }
fun({ id: "f_missing", min: 1, major: "Shop", kind: "calc", title: "Hit the target", gen(r, T) {
  const h = H(r), days = T === 1 ? 4 : 5, target = h.pick([20, 25, 30, 40, 50]) * (T === 3 ? 10 : 1), known = [...Array(days - 1)].map(() => target + h.ri(-8, 8) * (T === 3 ? 10 : 1)), a = target * days - known.reduce((x, y) => x + y, 0);
  if (a <= 0) return this.gen(r, T);
  return { brief: `The manager wants the shop to average <b>${target}</b> sales a day over ${days} days. So far: ${known.join(", ")}.`, q: `How many sales are needed on day ${days} to hit the average exactly?`, answer: a, unit: "sales", wrongs: wr(a, [target, target * days, Math.round(known.reduce((x, y) => x + y, 0) / (days - 1)), a + 10, a - 5]), hint: `An average of ${target} over ${days} days means ${target} × ${days} in total. Subtract what's already been sold.`, explain: `Total needed: ${target} × ${days} = ${target * days}.<br>Sold so far: ${known.join(" + ")} = ${known.reduce((x, y) => x + y, 0)}.<br>${target * days} − ${known.reduce((x, y) => x + y, 0)} = <b>${a}</b>.` };
} });
fun({ id: "f_queue", min: 1, major: "Team", kind: "calc", title: "Beat the queue", gen(r, T) {
  const h = H(r), per = h.pick([2, 3, 4]), n = h.pick([20, 24, 30, 36, 40]), staff = T === 1 ? 1 : h.pick([2, 3]), a = n / staff * per;
  if (a !== Math.round(a)) return this.gen(r, T);
  return { brief: `The café has a queue of ${n} customers. Each barista serves one customer every ${per} minutes, and ${staff === 1 ? "one barista is" : `${staff} baristas are`} working.`, q: "How many minutes until the whole queue is served?", answer: a, unit: "minutes", wrongs: wr(a, [n * per, n / per, a / 2, a + per, n + per]), hint: staff > 1 ? `With ${staff} baristas, each one serves ${n} ÷ ${staff} customers.` : "Each customer takes the same time. Multiply.", explain: `${staff > 1 ? `Each barista serves ${n} ÷ ${staff} = ${n / staff} customers.<br>` : ""}${n / staff} × ${per} minutes = <b>${a} minutes</b>.` };
} });

/* ---------- unlocked at Medium ---------- */
fun({ id: "f_fraud", min: 2, major: "Team", kind: "mcq", title: "Detective: expense claims", gen(r) {
  const h = H(r), ppl = h.pickN(["Omar", "Lina", "Sami", "Dana", "Ali", "Noura"], 4), rules = ["Taxi claims must be AED 100 or less", "Nobody can claim for a day they were on leave", "Meals are only paid on work trips"];
  const leave = h.pick(ppl), days = ["Mon", "Tue", "Wed", "Thu"], leaveDay = h.pick(days), bad = h.ri(0, 2), cheat = h.pick(ppl.filter(p => bad !== 1 || p === leave));
  const rows = ppl.map(p => { const d = h.pick(days.filter(x => !(p === leave && x === leaveDay))); return [p, d, "Taxi", A(h.ri(30, 95)), "Office visit"]; });
  const ci = ppl.indexOf(cheat);
  if (bad === 0) rows[ci] = [cheat, rows[ci][1], "Taxi", A(h.ri(130, 220)), "Client visit"];
  if (bad === 1) rows[ci] = [cheat, leaveDay, "Taxi", A(h.ri(40, 90)), "Client visit"];
  if (bad === 2) rows[ci] = [cheat, rows[ci][1], "Meal", A(h.ri(40, 90)), "Lunch near the office"];
  const why = [`${cheat}'s taxi is over AED 100.`, `${cheat} was on leave on ${leaveDay}, so couldn't have travelled for work.`, `${cheat} claimed a meal, but it wasn't on a work trip.`][bad];
  return { brief: `Company rules:<br>• ${rules.join("<br>• ")}<br><br>Note: <b>${leave}</b> was on leave on <b>${leaveDay}</b>.`, table: { cols: ["Name", "Day", "Type", "Amount", "Reason"], align: ["", "", "", "r", ""], rows }, q: "Whose claim breaks a rule?", ...mcq(h, cheat, ppl, 4), hint: "Check every row against all three rules and the leave note.", explain: `<b>${cheat}</b>. ${why}<br>Every other claim follows all three rules.` };
} });
fun({ id: "f_estimate", min: 2, major: "Shop", kind: "mcq", title: "Quick estimate", gen(r) {
  const h = H(r), cups = h.pick([150, 180, 200, 250, 300]), price = h.pick([8, 10, 12, 15]), days = h.pick([26, 30]), real = cups * price * days, round = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); return Math.round(v / p) * p; }, a = round(real);
  const fmt = v => "About " + A(v);
  return { brief: `A café sells about ${cups} drinks a day at ${A(price)} each and is open ${days} days a month.`, q: "Roughly how much does it take in a month? (Don't work it out exactly.)", ...mcq(h, fmt(a), [fmt(a / 10), fmt(a * 10), fmt(a / 100), fmt(a * 3)]), hint: `Round to easy numbers: ${cups} × ${price} is about ${round(cups * price)} a day, then × ${days}.`, explain: `${cups} × ${price} = ${N(cups * price)} a day.<br>${N(cups * price)} × ${days} = ${A(real)}, which is <b>about ${A(a)}</b>.<br>Estimating helps you spot answers that are 10 times too big or small.` };
} });
fun({ id: "f_halfway", min: 2, major: "Money", kind: "calc", title: "Meet in the middle", gen(r, T) {
  const h = H(r), ask = h.pick([800, 1000, 1200, 1500, 2000]), offer = ask - h.pick([200, 300, 400, 600]), mid = (ask + offer) / 2, cash = h.pick([5, 10]), a = mid * (1 - cash / 100);
  const thing = h.pick(["second-hand laptop", "used scooter", "camera", "gaming PC"]);
  return { brief: `A seller wants ${A(ask)} for a ${thing}. You offer ${A(offer)}. You agree to meet exactly halfway, and then the seller gives you an extra ${cash}% off for paying in cash.`, q: "What do you pay?", answer: a, unit: "AED", wrongs: wr(a, [mid, offer, ask * (1 - cash / 100), mid - cash, (ask - offer) / 2]), hint: "Halfway between two prices: add them and divide by 2. Then take off the cash discount.", explain: `Halfway: (${ask} + ${offer}) ÷ 2 = ${A(mid)}.<br>${cash}% of ${A(mid)} = ${A(mid * cash / 100)}.<br>${mid} − ${mid * cash / 100} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_ratio", min: 2, major: "Money", kind: "calc", title: "Share the profit", gen(r, T) {
  const h = H(r), [p1, p2] = h.pickN(["Hessa", "Rami", "Yara", "Zayed"], 2), [x, y] = h.pick([[3, 2], [2, 1], [3, 1], [5, 3], [4, 1]]), unit = h.pick([1000, 2000, 500, 1500]), tot = (x + y) * unit, a = x * unit;
  return { brief: `${p1} and ${p2} run a phone-repair business. ${p1} put in more money, so they split profit ${x} : ${y} (${p1} : ${p2}). This year's profit is ${A(tot)}.`, q: `How much does ${p1} get?`, answer: a, unit: "AED", wrongs: wr(a, [tot / 2, y * unit, tot / x, tot * x / 10, a + unit]), hint: `${x} : ${y} means the profit is cut into ${x + y} equal parts. ${p1} gets ${x} of them.`, explain: `${x} + ${y} = ${x + y} parts.<br>One part: ${N(tot)} ÷ ${x + y} = ${A(unit)}.<br>${p1}: ${x} × ${N(unit)} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_vatback", min: 2, major: "Money", kind: "calc", title: "Price before VAT", gen(r) {
  const h = H(r), base = h.pick([40, 60, 80, 100, 120, 200, 240, 300]), withV = base * 1.05;
  return { brief: `The receipt says you paid ${A(withV)}, and that <b>includes</b> 5% VAT.`, q: "What was the price before VAT?", answer: base, unit: "AED", wrongs: wr(base, [withV * .95, withV - 5, withV / 1.5, base + 5]), hint: "Taking 5% off the total is a trap! The total is 105% of the original price, so divide by 1.05.", explain: `Total = price × 1.05.<br>So price = ${N(withV)} ÷ 1.05 = <b>${A(base)}</b>.<br>(Taking 5% off ${A(withV)} gives ${A(withV * .95)}, which is wrong.)` };
} });
fun({ id: "f_trend", min: 2, major: "Shop", kind: "mcq", title: "Biggest jump", gen(r) {
  const h = H(r), months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]; let v, jumps, best;
  for (let k = 0; k < 40; k++) { v = [h.ri(20, 40) * 10]; for (let i = 1; i < 6; i++) v.push(Math.max(50, v[i - 1] + h.ri(-8, 12) * 10)); jumps = v.slice(1).map((x, i) => x - v[i]); const mx = Math.max(...jumps); if (jumps.filter(j => j === mx).length === 1 && v.indexOf(Math.max(...v)) !== jumps.indexOf(mx) + 1) { best = jumps.indexOf(mx) + 1; break; } }
  if (!best) best = jumps.indexOf(Math.max(...jumps)) + 1;
  return { brief: "Monthly sales of a sneaker shop:", table: { cols: ["Month", "Pairs sold"], align: ["", "r"], rows: months.map((m, i) => [m, v[i]]) }, q: "Which month had the biggest increase compared with the month before?", ...mcq(h, months[best], months.slice(1), 4), hint: "Don't pick the highest month. Work out the change from each month to the next.", explain: jumps.map((j, i) => `${months[i + 1]}: ${j >= 0 ? "+" : ""}${j}`).join("<br>") + `<br>So <b>${months[best]}</b> jumped the most.` };
} });

/* ---------- unlocked at Tricky ---------- */
fun({ id: "f_breakeven2", min: 3, major: "Money", kind: "calc", title: "When do we profit?", gen(r) {
  const h = H(r), [what, unitN] = h.pick([["custom T-shirts", "shirts"], ["phone cases", "cases"], ["cupcakes", "cupcakes"]]), price = h.pick([25, 30, 40, 50]), cost = price - h.pick([10, 15, 20]), n = h.ri(10, 40), fixed = n * (price - cost);
  return { brief: `You start a business selling ${what}. The equipment costs ${A(fixed)} (paid once). Each one costs ${A(cost)} to make, and you sell it for ${A(price)}.`, q: `How many must you sell to get back the equipment cost?`, answer: n, unit: unitN, wrongs: wr(n, [Math.round(fixed / price), Math.round(fixed / cost), n + 5, n * 2]), hint: "Each sale only earns you price − cost toward paying off the equipment.", explain: `Each sale earns ${price} − ${cost} = ${A(price - cost)}.<br>${N(fixed)} ÷ ${price - cost} = <b>${n} ${unitN}</b>.` };
} });
fun({ id: "f_grow", min: 3, major: "Money", kind: "calc", title: "Savings that grow", gen(r) {
  const h = H(r), p = h.pick([1000, 2000, 5000, 10000]), rate = h.pick([10, 20]), yrs = h.pick([2, 3]), a = Math.round(p * Math.pow(1 + rate / 100, yrs) * 100) / 100;
  return { brief: `You put ${A(p)} in a savings account that adds ${rate}% every year. The ${rate}% is added on top of everything already in the account.`, q: `How much is there after ${yrs} years?`, answer: a, unit: "AED", wrongs: wr(a, [p + p * rate / 100 * yrs, p * (1 + rate / 100), a + p * rate / 100, p * rate / 100 * yrs]), hint: "Each year's interest is bigger than the last, because it's worked out on the new total.", explain: [...Array(yrs)].map((_, i) => `Year ${i + 1}: ${A(Math.round(p * Math.pow(1 + rate / 100, i) * 100) / 100)} + ${rate}% = ${A(Math.round(p * Math.pow(1 + rate / 100, i + 1) * 100) / 100)}`).join("<br>") + `<br>Answer: <b>${A(a)}</b>. That's more than simple interest (${A(p + p * rate / 100 * yrs)}).` };
} });
fun({ id: "f_overtime", min: 3, major: "Team", kind: "calc", title: "Overtime pay", gen(r) {
  const h = H(r), rate = h.pick([20, 25, 30, 40]), hrs = h.ri(42, 50), ot = hrs - 40, a = 40 * rate + ot * rate * 1.5, who = h.pick(["Rami", "Yara", "Hessa", "Zayed"]);
  return { brief: `${who} earns ${A(rate)} an hour. Any hours over 40 in a week are paid at 1.5 times the normal rate. This week ${who} worked ${hrs} hours.`, q: `What is ${who}'s pay this week?`, answer: a, unit: "AED", wrongs: wr(a, [hrs * rate, hrs * rate * 1.5, 40 * rate + ot * rate, 40 * rate]), hint: "Split it: the first 40 hours at the normal rate, the extra hours at 1.5 times.", explain: `Normal: 40 × ${rate} = ${A(40 * rate)}.<br>Overtime rate: ${rate} × 1.5 = ${A(rate * 1.5)}; ${ot} × ${rate * 1.5} = ${A(ot * rate * 1.5)}.<br>Total: <b>${A(a)}</b>.` };
} });
fun({ id: "f_truth", min: 3, major: "Team", kind: "mcq", title: "Who's telling the truth?", gen(r) {
  const h = H(r), sup = h.pickN(["Gulf Supplies", "Desert Wholesale", "Marina Traders", "Oasis Goods"], 3);
  for (let k = 0; k < 200; k++) {
    const claims = sup.map((s, i) => ({ who: h.ri(0, 2), not: r() < .5 }));
    const trueCount = cand => claims.filter(c => c.not ? c.who !== cand : c.who === cand).length;
    const sols = [0, 1, 2].filter(c => trueCount(c) === 1);
    if (sols.length !== 1) continue;
    const ans = sols[0], say = (c, i) => `"${c.who === i ? "We are" : sup[c.who] + " is"}${c.not ? " NOT" : ""} the cheapest."`;
    const liar = claims.findIndex(c => c.not ? c.who !== ans : c.who === ans);
    return { brief: `Three suppliers each make a claim. You know that <b>exactly one</b> of them is telling the truth.<br>${sup.map((s, i) => `• <b>${s}:</b> ${say(claims[i], i)}`).join("<br>")}`, q: "Which supplier is really the cheapest?", ...mcq(h, sup[ans], sup, 3), hint: "Try each supplier as the cheapest, and count how many claims would then be true. Only one choice gives exactly one true claim.", explain: sup.map((s, j) => `If ${s} is cheapest: ${trueCount(j)} true claim${trueCount(j) === 1 ? "" : "s"}.`).join("<br>") + `<br>Only <b>${sup[ans]}</b> gives exactly one (${sup[liar]}'s).` };
  }
} });
fun({ id: "f_plan", min: 3, major: "Money", kind: "mcq", title: "Best phone plan", gen(r) {
  const h = H(r), m = h.pick([12, 18, 24]);
  for (let k = 0; k < 40; k++) {
    const A1 = h.pick([60, 80, 100]), S1 = h.pick([0, 50, 100]), A2 = A1 - h.pick([10, 20]), S2 = S1 + h.pick([150, 200, 300]), A3 = A1 + h.pick([10, 20]), D3 = h.pick([2, 3]);
    const t = [A1 * m + S1, A2 * m + S2, A3 * (m - D3)], mn = Math.min(...t);
    if (t.filter(x => x === mn).length > 1) continue;
    const names = ["Plan Blue", "Plan Gold", "Plan Max"], best = names[t.indexOf(mn)];
    return { brief: `You need a phone plan for ${m} months.`, table: { cols: ["Plan", "Monthly", "Catch"], align: ["", "r", ""], rows: [["Plan Blue", A(A1), S1 ? `${A(S1)} setup fee` : "No setup fee"], ["Plan Gold", A(A2), `${A(S2)} setup fee`], ["Plan Max", A(A3), `First ${D3} months free`]] }, q: `Which plan is cheapest over ${m} months?`, ...mcq(h, best, names, 3), hint: "Total cost = monthly × months you actually pay + any one-off fee.", explain: `Blue: ${A1} × ${m} + ${S1} = ${A(t[0])}<br>Gold: ${A2} × ${m} + ${S2} = ${A(t[1])}<br>Max: ${A3} × ${m - D3} = ${A(t[2])}<br>So <b>${best}</b> is cheapest.` };
  }
  return this.gen(mul32((r() * 1e9) | 0));
} });
fun({ id: "f_cashflow", min: 3, major: "Money", kind: "calc", title: "Will we run out?", gen(r) {
  const h = H(r), start = h.pick([5000, 8000, 10000, 12000]), inc = h.pick([2000, 3000, 4000]), spend = inc + h.pick([500, 1000, 1500, 2000]), loss = spend - inc, a = Math.floor(start / loss);
  return { brief: `A new gaming café has ${A(start)} in the bank. Every month it earns ${A(inc)} but spends ${A(spend)}.`, q: "How many full months can it keep going before the money runs out?", answer: a, unit: "months", wrongs: wr(a, [Math.floor(start / spend), Math.floor(start / inc), a + 1, Math.round(start / 1000)]), hint: "Each month the bank balance drops by (spend − earn).", explain: `Each month: ${spend} − ${inc} = ${A(loss)} lost.<br>${N(start)} ÷ ${N(loss)} = ${N(start / loss)}, so <b>${a} full months</b>.` };
} });

FUN.slice(THINK_FROM).forEach(t => t.think = true);
for (const t of FUN) TPL[t.id] = t;
