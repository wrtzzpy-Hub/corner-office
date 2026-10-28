/* ============================== PLAY FOR FUN TASKS ==============================
   Short, everyday questions a 10-year-old can follow: plain words, one idea per task.
   Three gentle levels: T1 small numbers and one step; T2 bigger numbers, some two-step questions;
   T3 trickier wrong answers, more rows and items. Number answers carry believable wrong answers (d.wrongs). */
const FUN = [];
const fun = t => { FUN.push({ min: 1, max: 3, ...t, fun: true }); };
const A = x => "AED " + N(x);
const wr = (a, list) => [...new Set(list.map(v => Math.round(v * 100) / 100))].filter(v => v > 0 && v !== a);
const FUN_LEVEL = ["", "Easy", "Medium", "Tricky"];

fun({ id: "f_change", major: "Money", kind: "calc", title: "Give the right change", gen(r, T) {
  const h = H(r);
  if (T < 3) {
    const [item, lo, hi] = T === 1 ? h.pick([["a juice", 4, 9], ["a sandwich", 11, 19], ["a toy car", 22, 38], ["a notebook", 5, 9], ["a slice of pizza", 7, 15], ["a cap", 26, 45]]) : h.pick([["a football", 55, 95], ["a pair of trainers", 120, 190], ["a backpack", 65, 140], ["a board game", 45, 85], ["a watch", 110, 180]]);
    const p = h.ri(lo, hi), note = [10, 20, 50, 100, 200].find(n => n > p), a = note - p;
    return { brief: `A customer buys ${item} for ${A(p)}. They pay with a ${A(note)} note.`, q: "How much change do you give back?", answer: a, unit: "AED", wrongs: wr(a, [a + 1, a - 1, a + 5, a + 10, a - 10, p]), hint: "Change = the money they gave you − the price.", explain: `They gave you ${A(note)}.<br>The price is ${A(p)}.<br>${note} − ${p} = <b>${A(a)}</b> change.` };
  }
  const [i1, i2] = h.pickN([["a juice", 4, 9], ["a sandwich", 11, 19], ["a cookie", 3, 6], ["a salad", 18, 28], ["a smoothie", 14, 22]], 2), p1 = h.ri(i1[1], i1[2]), p2 = h.ri(i2[1], i2[2]), tot = p1 + p2, note = [20, 50, 100].find(n => n > tot), a = note - tot;
  return { brief: `A customer buys ${i1[0]} for ${A(p1)} and ${i2[0]} for ${A(p2)}. They pay with a ${A(note)} note.`, q: "How much change do you give back?", answer: a, unit: "AED", wrongs: wr(a, [note - p1, note - p2, a + 1, a - 1, a + 10]), hint: "First add up both prices. Then take the total away from the money they gave you.", explain: `Total price: ${p1} + ${p2} = ${A(tot)}.<br>They gave you ${A(note)}.<br>${note} − ${tot} = <b>${A(a)}</b> change.` };
} });
fun({ id: "f_profit", major: "Money", kind: "calc", title: "How much did we make?", gen(r, T) {
  const h = H(r), big = T >= 2, [item, s0, s1, c0, c1] = h.pick([["sandwich", 12, 20, 4, 8], ["cupcake", 8, 12, 2, 5], ["smoothie", 15, 22, 5, 9], ["T-shirt", 45, 70, 15, 30], ["bracelet", 20, 35, 5, 12]]);
  const s = big ? h.ri(s0, s1) * 5 : h.ri(s0, s1), c = big ? h.ri(c0, c1) * 5 : h.ri(c0, c1), one = s - c;
  if (T < 3) return { brief: `The shop sells a ${item} for ${A(s)}. Making one costs the shop ${A(c)}.`, q: `How much profit does the shop make on one ${item}?`, answer: one, unit: "AED", wrongs: wr(one, [s + c, s, c, one + 2, one - 2, one + 10]), hint: "Profit is what's left after you pay for making it: price − cost.", explain: `The ${item} sells for ${A(s)}.<br>It costs ${A(c)} to make.<br>${s} − ${c} = <b>${A(one)}</b> profit.` };
  const n = h.ri(3, 8), a = one * n;
  return { brief: `The shop sells a ${item} for ${A(s)}. Making one costs ${A(c)}. Today it sold ${n} of them.`, q: `How much profit did the shop make today?`, answer: a, unit: "AED", wrongs: wr(a, [s * n, c * n, one, a + one, a - one]), hint: "Find the profit on one, then multiply by how many were sold.", explain: `Profit on one: ${s} − ${c} = ${A(one)}.<br>${n} were sold.<br>${one} × ${n} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_sales", major: "Shop", kind: "calc", title: "Count today's sales", gen(r, T) {
  const h = H(r), [t1, t2] = h.pickN(["caps", "water bottles", "comic books", "phone cases", "keychains", "notebooks"], 2);
  const n = T === 1 ? h.ri(3, 9) : h.ri(11, 25), p = T === 1 ? h.pick([5, 10, 12, 15, 20, 25]) : h.pick([15, 20, 25, 30, 40, 45]);
  if (T < 3) { const a = n * p; return { brief: `Today the shop sold ${n} ${t1}. Each one costs ${A(p)}.`, q: "How much money did the shop take in?", answer: a, unit: "AED", wrongs: wr(a, [n + p, a + p, a - p, a * 2, (n - 1) * p, a + 10]), hint: "Multiply how many were sold by the price of one.", explain: `${n} ${t1} were sold.<br>Each one is ${A(p)}.<br>${n} × ${p} = <b>${A(a)}</b>.` }; }
  const n1 = h.ri(3, 9), p1 = h.pick([5, 10, 15, 20]), n2 = h.ri(2, 8), p2 = h.pick([12, 25, 30, 50]), a = n1 * p1 + n2 * p2;
  return { brief: `Today the shop sold ${n1} ${t1} at ${A(p1)} each and ${n2} ${t2} at ${A(p2)} each.`, q: "How much money did the shop take in altogether?", answer: a, unit: "AED", wrongs: wr(a, [n1 * p1, n2 * p2, (n1 + n2) * p1, (n1 + n2) * p2, a + 10]), hint: "Work out each item's total, then add the two totals together.", explain: `${t1}: ${n1} × ${p1} = ${A(n1 * p1)}.<br>${t2}: ${n2} × ${p2} = ${A(n2 * p2)}.<br>${n1 * p1} + ${n2 * p2} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_discount", major: "Shop", kind: "calc", title: "Sale price", gen(r, T) {
  const h = H(r), item = h.pick(["backpack", "pair of trainers", "football", "jacket", "lamp", "board game"]);
  const price = T === 1 ? h.pick([40, 60, 80, 100, 120, 200]) : h.pick([150, 250, 300, 400, 450, 500]), pct = T === 1 ? h.pick([10, 25, 50]) : h.pick([10, 20, 25, 30, 40]);
  const tip = pct === 50 ? "50% off means half price." : pct === 25 ? "25% off means a quarter of the price is taken away." : pct === 10 ? "10% off: find a tenth of the price and take it away." : `${pct}% off: find 10% of the price, multiply it by ${pct / 10}, and take that away.`;
  if (T < 3) { const off = price * pct / 100, a = price - off; return { brief: `A ${item} usually costs ${A(price)}. Today everything is ${pct}% off.`, q: "What is the new price?", answer: a, unit: "AED", wrongs: wr(a, [off, price, price - pct, a + 10, a - 10, price * (100 - pct * 2) / 100]), hint: tip, explain: `${pct}% of ${A(price)} is ${A(off)}.<br>Take that away from the price.<br>${price} − ${off} = <b>${A(a)}</b>.` }; }
  const each = h.pick([20, 30, 40, 50, 60]), n = h.ri(2, 4), tot = each * n, off = tot * pct / 100, a = tot - off;
  return { brief: `You buy ${n} T-shirts at ${A(each)} each. At the till, you get ${pct}% off everything.`, q: "How much do you pay?", answer: a, unit: "AED", wrongs: wr(a, [tot, off, each * (100 - pct) / 100, a + each, tot - pct]), hint: `First find the total for all ${n}. Then take ${pct}% off the total.`, explain: `Total before the sale: ${n} × ${each} = ${A(tot)}.<br>${pct}% of ${A(tot)} is ${A(off)}.<br>${tot} − ${off} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_save", major: "Money", kind: "calc", title: "Saving up", gen(r, T) {
  const h = H(r), w = T === 1 ? h.pick([5, 10, 20, 25]) : h.pick([15, 30, 40, 50]), k = T === 1 ? h.ri(3, 10) : h.ri(6, 15), goal = w * k, [an, thing] = h.pick([["a", "video game"], ["a", "pair of headphones"], ["a", "skateboard"], ["a", "new football"], ["an", "art set"], ["a", "bike"]]);
  if (T < 3) return { brief: `You save ${A(w)} every week. You want ${an} ${thing} that costs ${A(goal)}.`, q: "How many weeks until you can buy it?", answer: k, unit: "weeks", wrongs: wr(k, [k + 1, k - 1, k + 2, k * 2]), hint: "Divide the price by how much you save each week.", explain: `The ${thing} costs ${A(goal)}.<br>You save ${A(w)} a week.<br>${goal} ÷ ${w} = <b>${k} weeks</b>.` };
  const have = w * h.ri(2, 4), price = goal + have;
  return { brief: `You want ${an} ${thing} that costs ${A(price)}. You already have ${A(have)} saved, and you save ${A(w)} more every week.`, q: "How many more weeks until you can buy it?", answer: k, unit: "weeks", wrongs: wr(k, [price / w, k + 1, k - 1, have / w]), hint: "First work out how much more money you need. Then divide by what you save each week.", explain: `You still need ${price} − ${have} = ${A(goal)}.<br>You save ${A(w)} a week.<br>${goal} ÷ ${w} = <b>${k} weeks</b>.` };
} });
fun({ id: "f_wage", major: "Team", kind: "calc", title: "Pay day", gen(r, T) {
  const h = H(r), who = h.pick(["Ravi", "Mariam", "Omar", "Priya"]), rate = T === 1 ? h.pick([20, 25, 30, 40, 50]) : h.pick([35, 45, 55, 60, 75]);
  if (T < 3) { const hrs = T === 1 ? h.ri(2, 8) : h.ri(6, 10), a = rate * hrs; return { brief: `${who} earns ${A(rate)} for every hour of work. Today ${who} worked ${hrs} hours.`, q: `How much did ${who} earn today?`, answer: a, unit: "AED", wrongs: wr(a, [rate + hrs, a + rate, a - rate, a * 2]), hint: "Multiply the money per hour by the number of hours.", explain: `${A(rate)} for each hour.<br>${hrs} hours worked.<br>${rate} × ${hrs} = <b>${A(a)}</b>.` }; }
  const h1 = h.ri(3, 6), h2 = h.ri(4, 8), a = rate * (h1 + h2);
  return { brief: `${who} earns ${A(rate)} an hour. ${who} worked ${h1} hours on Monday and ${h2} hours on Tuesday.`, q: `How much did ${who} earn on both days together?`, answer: a, unit: "AED", wrongs: wr(a, [rate * h1, rate * h2, rate * h1 * h2, a + rate, a - rate]), hint: "Add the hours from both days first, then multiply by the money per hour.", explain: `Hours: ${h1} + ${h2} = ${h1 + h2}.<br>${A(rate)} for each hour.<br>${rate} × ${h1 + h2} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_bank", major: "Money", kind: "calc", title: "Money that grows", gen(r, T) {
  const h = H(r);
  if (T < 3) { const amt = T === 1 ? h.pick([100, 200, 500, 1000]) : h.pick([300, 600, 1500, 2000]), pct = T === 1 ? h.pick([5, 10]) : h.pick([4, 5, 8, 10]), extra = amt * pct / 100, a = amt + extra;
    return { brief: `You put ${A(amt)} in a savings account. Every year the bank adds an extra ${pct}%.`, q: "How much will you have after 1 year?", answer: a, unit: "AED", wrongs: wr(a, [amt, extra, amt + pct, a + extra]), hint: `First find ${pct}% of ${A(amt)}. That's the extra money. Then add it on.`, explain: `${pct}% of ${A(amt)} is ${A(extra)}.<br>The bank adds that to your money.<br>${amt} + ${extra} = <b>${A(a)}</b>.` }; }
  const amt = h.pick([100, 200, 500, 1000]), y1 = amt * 1.1, a = Math.round(y1 * 1.1 * 100) / 100;
  return { brief: `You put ${A(amt)} in a savings account. Every year the bank adds 10% of whatever is in the account.`, q: "How much will you have after 2 years?", answer: a, unit: "AED", wrongs: wr(a, [amt * 1.2, y1, amt * 0.2, a + 10]), hint: "Do it one year at a time. In year 2, the bank adds 10% of the new, bigger amount.", explain: `Year 1: ${A(amt)} + 10% = ${A(y1)}.<br>Year 2: ${A(y1)} + 10% = <b>${A(a)}</b>.<br>That's more than ${A(amt * 1.2)}, because in year 2 you also earn extra on last year's extra.` };
} });
fun({ id: "f_deal", major: "Shop", kind: "mcq", title: "Find the better deal", gen(r, T) {
  const h = H(r), thing = h.pick(["juice bottles", "pencils", "cookies", "yogurts"]), packs = T === 1 ? ["Pack A", "Pack B"] : ["Pack A", "Pack B", "Pack C"];
  const units = h.pickN(T === 3 ? [1.5, 2, 2.5, 3, 3.5] : [2, 3, 4, 5], packs.length), ns = h.pickN([4, 5, 6, 8, 10], packs.length), prices = units.map((u, i) => u * ns[i]);
  const best = packs[units.indexOf(Math.min(...units))];
  return { brief: `${packs.length === 2 ? "Two" : "Three"} packs of ${thing} are on the shelf.`, table: { cols: ["Pack", "How many", "Price"], align: ["", "r", "r"], rows: packs.map((p, i) => [p, ns[i], A(prices[i])]) }, q: "Which pack is cheapest for each one?", ...mcq(h, best, [...packs, "They cost the same"], packs.length + 1), hint: "Divide each price by how many are in the pack. That's the price of one.", explain: packs.map((p, i) => `${p}: ${prices[i]} ÷ ${ns[i]} = ${A(units[i])} each.`).join("<br>") + `<br>So <b>${best}</b> is the best deal.` };
} });
fun({ id: "f_best", major: "Shop", kind: "mcq", title: "Read the sales chart", gen(r, T) {
  const h = H(r), n = T === 1 ? 4 : 6, start = h.ri(0, 12 - n), months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].slice(start, start + n);
  const pool = T === 3 ? [410, 430, 440, 460, 470, 490, 500, 520] : [120, 180, 240, 310, 360, 420, 480, 530, 610, 700], vals = h.pickN(pool, n), most = r() < .6, idx = vals.indexOf(most ? Math.max(...vals) : Math.min(...vals));
  return { brief: `Here are the shop's sales for ${n === 4 ? "four" : "six"} months.`, table: { cols: ["Month", "Sales"], align: ["", "r"], rows: months.map((m, i) => [m, A(vals[i])]) }, q: `Which month had the ${most ? "most" : "fewest"} sales?`, ...mcq(h, months[idx], months), hint: `Look down the Sales column for the ${most ? "biggest" : "smallest"} number.${T === 3 ? " The numbers are close, so check each one carefully." : ""}`, explain: `The ${most ? "biggest" : "smallest"} number is ${A(vals[idx])}.<br>That's in <b>${months[idx]}</b>.` };
} });
fun({ id: "f_service", major: "Team", kind: "mcq", title: "What should the shop do?", gen(r) {
  const h = H(r), S = h.pick([
    ["A customer says their coffee is cold.", "Make a fresh one and say sorry", ["Tell them it's fine", "Charge them more", "Ask them to leave"], "Fixing the problem kindly keeps customers coming back."],
    ["It starts raining and umbrellas are selling fast.", "Put more umbrellas near the door", ["Hide the umbrellas", "Close the shop early", "Stop selling umbrellas"], "When something is popular, make it easy for customers to find."],
    ["A new bakery wants people to know it has opened.", "Hand out free samples nearby", ["Keep the shop lights off", "Tell nobody", "Take the sign down"], "Free samples let people try the food and spread the word."],
    ["The shop still has lots of winter coats when summer starts.", "Put the coats on sale", ["Raise the price of the coats", "Order more coats", "Hide them in the back"], "A sale helps sell things people want less, so the space can be used for summer items."],
    ["Customers are waiting a long time to pay.", "Open another till", ["Close a till", "Turn off the card machine", "Ask customers to come back tomorrow"], "More tills means shorter queues and happier customers."],
    ["A worker keeps arriving late.", "Talk to them kindly to find out why", ["Shout at them in front of everyone", "Never mention it", "Give them a prize"], "A calm chat often fixes the real reason behind the problem."],
    ["The shop's best-selling snack has nearly run out.", "Order more from the supplier", ["Remove it from the shelves", "Double its price", "Stop selling snacks"], "If something sells well, make sure you don't run out."]]);
  return { brief: S[0], q: "What is the best thing to do?", ...mcq(h, S[1], S[2]), hint: "Pick the answer that keeps customers happy and helps the shop.", explain: `<b>${S[1]}</b>.<br>${S[3]}` };
} });
fun({ id: "f_price", major: "Money", kind: "mcq", title: "Will the price change?", gen(r) {
  const h = H(r), up = "The price usually goes up", down = "The price usually goes down", same = "The price stays exactly the same";
  const S = h.pick([["Everyone wants the new toy, but only a few are left in the shops.", up], ["A shop has far too many mangoes, and they will go bad soon.", down], ["A storm destroys lots of orange trees, so there are fewer oranges.", up], ["Ten new cafés open on the same street.", down], ["Concert tickets are almost sold out and lots of fans still want one.", up], ["A factory makes twice as many bikes as people want to buy.", down]]);
  return { brief: S[0], q: "What will probably happen to the price?", ...mcq(h, S[1], [up, down, same], 3), hint: "Lots of people want it but there isn't much of it → price goes up. Too much of it and not enough buyers → price goes down.", explain: S[1] === up ? `Lots of people want it, but there isn't much of it.<br>So sellers can ask for more: <b>${up.toLowerCase()}</b>.` : `There's more of it than people want to buy.<br>To sell it, shops lower the price: <b>${down.toLowerCase()}</b>.` };
} });
const sortTask = (h, pool, cats, n) => { const out = []; for (const c of cats) out.push(...h.pickN(pool.filter(p => p[1] === c), 2)); const rest = h.pickN(pool.filter(p => !out.includes(p)), Math.max(0, n - out.length)); const items = h.shuf([...out, ...rest]).slice(0, n).map(p => ({ text: p[0], cat: p[1] })); return { cats, items, explain: items.map(i => `<b>${escH(i.text)}</b> → ${escH(i.cat)}`).join("<br>") }; };
const sortN = T => 4 + T;
fun({ id: "f_needs", major: "Money", kind: "classify", title: "Needs and wants", gen(r, T) {
  const h = H(r);
  return { brief: "When money is tight, you pay for needs first.", q: "Is each one a need or a want?", ...sortTask(h, [["Drinking water", "Need"], ["Food for dinner", "Need"], ["School books", "Need"], ["Medicine", "Need"], ["Rent for your home", "Need"], ["Bus ticket to school", "Need"], ["A warm coat for winter", "Need"], ["A new video game", "Want"], ["Designer trainers", "Want"], ["Cinema tickets", "Want"], ["A sparkly phone case", "Want"], ["A third pair of headphones", "Want"], ["Ice cream", "Want"], ["A bigger TV", "Want"]], ["Need", "Want"], sortN(T)), hint: "A need is something you must have to live, stay healthy or go to school. A want is nice to have." };
} });
fun({ id: "f_inout", major: "Money", kind: "classify", title: "Money in, money out", gen(r, T) {
  const h = H(r);
  return { brief: "Here's what happened at the café this week.", q: "Did money come in or go out?", ...sortTask(h, [["A customer pays for a hot chocolate", "Money in"], ["Selling cupcakes", "Money in"], ["A school pays for a party order", "Money in"], ["Selling a gift card", "Money in"], ["Selling old chairs to another café", "Money in"], ["Paying the rent", "Money out"], ["Buying milk and coffee beans", "Money out"], ["Paying the staff", "Money out"], ["The electricity bill", "Money out"], ["Buying new cups", "Money out"], ["Fixing the coffee machine", "Money out"]], ["Money in", "Money out"], sortN(T)), hint: "Money in = the café gets paid. Money out = the café pays someone." };
} });
fun({ id: "f_jobs", major: "Team", kind: "classify", title: "Who does this job?", gen(r, T) {
  const h = H(r);
  return { brief: "Every team in a company has its own jobs.", q: "Which team does each job?", ...sortTask(h, [["Help a customer choose a phone", "Sales"], ["Call other shops to sell them our products", "Sales"], ["Pay the bills", "Money team"], ["Count the cash at the end of the day", "Money team"], ["Work out how much profit we made", "Money team"], ["Pack boxes for delivery", "Stockroom"], ["Count the boxes on the shelves", "Stockroom"], ["Unload the delivery truck", "Stockroom"], ["Design a poster for the sale", "Marketing"], ["Post about the sale on Instagram", "Marketing"]], ["Sales", "Money team", "Stockroom", "Marketing"], T === 1 ? 5 : T === 2 ? 6 : 8), hint: "Ask: is this job about selling, money, boxes, or telling people about the shop?" };
} });
fun({ id: "f_receipt", major: "Shop", kind: "flag", title: "Check the receipt", gen(r, T) {
  const h = H(r), n = T === 1 ? 5 : 6, items = h.pickN([["Apples", 3], ["Bread", 5], ["Milk", 7], ["Eggs", 12], ["Cheese", 15], ["Juice", 6], ["Rice", 9], ["Bananas", 4], ["Butter", 11]], n);
  const bad = h.pickN([...Array(n).keys()], T === 3 ? 2 : 1).sort((a, b) => a - b);
  const rows = items.map(([nm, p], i) => { const q = T === 1 ? h.ri(1, 4) : h.ri(2, 9), t = q * p; return [nm, q, A(p), A(bad.includes(i) ? t + h.pick(T === 3 ? [-1, 1, 2, -2] : [-2, 2, 3, 5, 10]) : t), q, p, t]; });
  return { brief: "The till printed this receipt, but something looks wrong.", table: { cols: ["Item", "How many", "Price each", "Total"], align: ["", "r", "r", "r"], rows: rows.map(x => x.slice(0, 4)) }, wrong: bad, q: bad.length > 1 ? "Two lines are added up wrong. Tap both." : "One line is added up wrong. Tap it.", hint: "For each line, check: how many × price each = total." + (T === 3 ? " Some mistakes are tiny, so check every line." : ""), explain: bad.map(i => `<b>${rows[i][0]}</b>: ${rows[i][4]} × ${rows[i][5]} = ${A(rows[i][6])}, but the receipt says ${rows[i][3]}.`).join("<br>") + "<br>Every other line adds up correctly." };
} });
fun({ id: "f_stock", major: "Stockroom", kind: "flag", title: "Missing boxes", gen(r, T) {
  const h = H(r), n = T === 1 ? 5 : 6, items = h.pickN(["Footballs", "Water bottles", "Lunch boxes", "Pencil cases", "Torches", "Yo-yos", "Umbrellas", "Kites"], n), miss = new Set(h.pickN([...Array(n).keys()], T === 1 ? h.ri(1, 2) : 2));
  const extra = T === 3 ? h.pick([...Array(n).keys()].filter(i => !miss.has(i))) : -1;
  const rows = items.map((nm, i) => { const s = h.ri(8, 30); return [nm, s, miss.has(i) ? s - h.ri(T === 3 ? 1 : 2, 6) : i === extra ? s + h.ri(1, 3) : s]; });
  const w = [...miss].sort((a, b) => a - b);
  return { brief: "Ravi counted the boxes in the stockroom. Some don't match the list.", table: { cols: ["Item", "Should have", "Counted"], align: ["", "r", "r"], rows }, wrong: w, q: `Tap every item with missing boxes. There ${w.length > 1 ? "are 2" : "is 1"}.`, hint: "Compare the two numbers on each line. If Counted is smaller, some boxes are missing." + (extra >= 0 ? " If Counted is bigger, nothing is missing." : ""), explain: w.map(i => `<b>${rows[i][0]}</b>: should have ${rows[i][1]}, counted ${rows[i][2]}. ${rows[i][1] - rows[i][2]} missing.`).join("<br>") + (extra >= 0 ? `<br>${rows[extra][0]} has extra boxes, not missing ones.` : "") };
} });
fun({ id: "f_count", major: "Stockroom", kind: "count", title: "Count the boxes", gen(r, T, c) {
  return { brief: "Walk to Bay C in the Stockroom and count the boxes on the shelves yourself. Some spaces are empty.", q: "How many boxes are in Bay C?", answer: c.bay, unit: "boxes", tol: .5, hint: "Count one shelf at a time, then add the shelves together. Empty spaces don't count.", explain: `Bay C has 3 shelves of boxes.<br>Adding up every shelf gives <b>${c.bay} boxes</b>.` };
} });
fun({ id: "f_bigger", major: "Money", kind: "mcq", title: "Which earns more?", gen(r, T) {
  const h = H(r), opts = [["The lemonade stand", "sold", "cups", [5, 8, 10, 12], [8, 20]], ["The car wash", "washed", "cars", [15, 20, 25, 30], [3, 8]], ["The cake stall", "sold", "cakes", [12, 18, 24], [4, 10]]].slice(0, T === 3 ? 3 : 2);
  for (let k = 0; k < 20; k++) {
    const v = opts.map(([nm, vb, u, ps, [lo, hi]]) => { const p = h.pick(ps), n = h.ri(lo, hi); return { nm, vb, u, p, n, t: p * n }; }), max = Math.max(...v.map(x => x.t));
    if (v.filter(x => x.t === max).length > 1) continue;
    const best = v.find(x => x.t === max).nm;
    const parts = v.map(x => `${x.nm.replace("The ", "the ")} ${x.vb} ${x.n} ${x.u} at ${A(x.p)} each`);
    return { brief: "On Saturday, " + parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] + ".", q: "Which one made the most money?", ...mcq(h, best, [...v.map(x => x.nm), "They made the same"], v.length + 1), hint: "Work out each total: how many × price.", explain: v.map(x => `${x.nm.replace("The ", "")}: ${x.n} × ${x.p} = ${A(x.t)}.`).join("<br>") + `<br>So <b>${best.toLowerCase()}</b> made the most.` };
  }
} });
