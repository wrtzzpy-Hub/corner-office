/* ============================== PLAY FOR FUN TASKS ==============================
   Short, everyday questions a 10-year-old can follow: small numbers, plain words, one idea per task.
   Number answers carry their own believable wrong answers (d.wrongs) for the multiple-choice buttons. */
const FUN = [];
const fun = t => { FUN.push({ ...t, fun: true, min: 1, max: 1 }); };
const A = x => "AED " + N(x);
const wr = (a, list) => [...new Set(list.map(v => Math.round(v * 100) / 100))].filter(v => v > 0 && v !== a);

fun({ id: "f_change", major: "Money", kind: "calc", title: "Give the right change", gen(r) {
  const h = H(r), [item, lo, hi] = h.pick([["a juice", 4, 9], ["a sandwich", 11, 19], ["a toy car", 22, 38], ["a notebook", 5, 9], ["a slice of pizza", 7, 15], ["a cap", 26, 45]]);
  const p = h.ri(lo, hi), note = [10, 20, 50, 100].find(n => n > p), a = note - p;
  return { brief: `A customer buys ${item} for ${A(p)}. They pay with a ${A(note)} note.`, q: "How much change do you give back?", answer: a, unit: "AED", wrongs: wr(a, [a + 1, a - 1, a + 5, a + 10, p]), hint: "Change = the money they gave you − the price.", explain: `They gave you ${A(note)}.<br>The price is ${A(p)}.<br>${note} − ${p} = <b>${A(a)}</b> change.` };
} });
fun({ id: "f_profit", major: "Money", kind: "calc", title: "How much did we make?", gen(r) {
  const h = H(r), [item, s0, s1, c0, c1] = h.pick([["sandwich", 12, 20, 4, 8], ["cupcake", 8, 12, 2, 5], ["smoothie", 15, 22, 5, 9], ["T-shirt", 45, 70, 15, 30], ["bracelet", 20, 35, 5, 12]]);
  const s = h.ri(s0, s1), c = h.ri(c0, c1), a = s - c;
  return { brief: `The shop sells a ${item} for ${A(s)}. Making one costs the shop ${A(c)}.`, q: `How much profit does the shop make on one ${item}?`, answer: a, unit: "AED", wrongs: wr(a, [s + c, s, c, a + 2, a - 2]), hint: "Profit is what's left after you pay for making it: price − cost.", explain: `The ${item} sells for ${A(s)}.<br>It costs ${A(c)} to make.<br>${s} − ${c} = <b>${A(a)}</b> profit.` };
} });
fun({ id: "f_sales", major: "Shop", kind: "calc", title: "Count today's sales", gen(r) {
  const h = H(r), things = h.pick(["caps", "water bottles", "comic books", "phone cases", "keychains"]), n = h.ri(3, 9), p = h.pick([5, 10, 12, 15, 20, 25]), a = n * p;
  return { brief: `Today the shop sold ${n} ${things}. Each one costs ${A(p)}.`, q: "How much money did the shop take in?", answer: a, unit: "AED", wrongs: wr(a, [n + p, a + p, a - p, a * 2, (n - 1) * p]), hint: "Multiply how many were sold by the price of one.", explain: `${n} ${things} were sold.<br>Each one is ${A(p)}.<br>${n} × ${p} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_discount", major: "Shop", kind: "calc", title: "Sale price", gen(r) {
  const h = H(r), item = h.pick(["backpack", "pair of trainers", "football", "jacket", "lamp", "board game"]), price = h.pick([40, 60, 80, 100, 120, 200]), pct = h.pick([10, 25, 50]), off = price * pct / 100, a = price - off;
  return { brief: `A ${item} usually costs ${A(price)}. Today everything is ${pct}% off.`, q: "What is the new price?", answer: a, unit: "AED", wrongs: wr(a, [off, price, price - pct, a + 10, a - 10]), hint: pct === 50 ? "50% off means half price." : pct === 25 ? "25% off means a quarter of the price is taken away." : "10% off: find a tenth of the price and take it away.", explain: `${pct}% of ${A(price)} is ${A(off)}.<br>Take that away from the price.<br>${price} − ${off} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_save", major: "Money", kind: "calc", title: "Saving up", gen(r) {
  const h = H(r), w = h.pick([5, 10, 20, 25]), k = h.ri(3, 10), goal = w * k, [an, thing] = h.pick([["a", "video game"], ["a", "pair of headphones"], ["a", "skateboard"], ["a", "new football"], ["an", "art set"]]);
  return { brief: `You save ${A(w)} every week. You want ${an} ${thing} that costs ${A(goal)}.`, q: "How many weeks until you can buy it?", answer: k, unit: "weeks", wrongs: wr(k, [k + 1, k - 1, k + 2, k * 2]), hint: "Divide the price by how much you save each week.", explain: `The ${thing} costs ${A(goal)}.<br>You save ${A(w)} a week.<br>${goal} ÷ ${w} = <b>${k} weeks</b>.` };
} });
fun({ id: "f_wage", major: "Team", kind: "calc", title: "Pay day", gen(r) {
  const h = H(r), who = h.pick(["Ravi", "Mariam", "Omar", "Priya"]), rate = h.pick([20, 25, 30, 40, 50]), hrs = h.ri(2, 8), a = rate * hrs;
  return { brief: `${who} earns ${A(rate)} for every hour of work. Today ${who} worked ${hrs} hours.`, q: `How much did ${who} earn today?`, answer: a, unit: "AED", wrongs: wr(a, [rate + hrs, a + rate, a - rate, a * 2]), hint: "Multiply the money per hour by the number of hours.", explain: `${A(rate)} for each hour.<br>${hrs} hours worked.<br>${rate} × ${hrs} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_bank", major: "Money", kind: "calc", title: "Money that grows", gen(r) {
  const h = H(r), amt = h.pick([100, 200, 500, 1000]), pct = h.pick([5, 10]), extra = amt * pct / 100, a = amt + extra;
  return { brief: `You put ${A(amt)} in a savings account. Every year the bank adds an extra ${pct}%.`, q: "How much will you have after 1 year?", answer: a, unit: "AED", wrongs: wr(a, [amt, extra, amt + pct, a + extra]), hint: `First find ${pct}% of ${A(amt)}. That's the extra money. Then add it on.`, explain: `${pct}% of ${A(amt)} is ${A(extra)}.<br>The bank adds that to your money.<br>${amt} + ${extra} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_deal", major: "Shop", kind: "mcq", title: "Find the better deal", gen(r) {
  const h = H(r), thing = h.pick(["juice bottles", "pencils", "cookies", "yogurts"]), [u1, u2] = h.pickN([2, 3, 4, 5], 2), [n1, n2] = h.pickN([4, 5, 6, 8, 10], 2), p1 = u1 * n1, p2 = u2 * n2, best = u1 < u2 ? "Pack A" : "Pack B";
  const o = mcq(h, best, ["Pack A", "Pack B", "They cost the same"], 3);
  return { brief: `Two packs of ${thing} are on the shelf.`, table: { cols: ["Pack", "How many", "Price"], align: ["", "r", "r"], rows: [["Pack A", n1, A(p1)], ["Pack B", n2, A(p2)]] }, q: `Which pack is cheaper for each one?`, ...o, hint: "Divide each price by how many are in the pack. That's the price of one.", explain: `Pack A: ${p1} ÷ ${n1} = ${A(u1)} each.<br>Pack B: ${p2} ÷ ${n2} = ${A(u2)} each.<br>So <b>${best}</b> is the better deal.` };
} });
fun({ id: "f_best", major: "Shop", kind: "mcq", title: "Read the sales chart", gen(r) {
  const h = H(r), start = h.ri(0, 8), months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].slice(start, start + 4);
  const vals = h.pickN([120, 180, 240, 310, 360, 420, 480, 530, 610, 700], 4), most = r() < .6, idx = vals.indexOf(most ? Math.max(...vals) : Math.min(...vals));
  return { brief: "Here are the shop's sales for four months.", table: { cols: ["Month", "Sales"], align: ["", "r"], rows: months.map((m, i) => [m, A(vals[i])]) }, q: `Which month had the ${most ? "most" : "fewest"} sales?`, ...mcq(h, months[idx], months), hint: `Look down the Sales column for the ${most ? "biggest" : "smallest"} number.`, explain: `The ${most ? "biggest" : "smallest"} number is ${A(vals[idx])}.<br>That's in <b>${months[idx]}</b>.` };
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
fun({ id: "f_needs", major: "Money", kind: "classify", title: "Needs and wants", gen(r) {
  const h = H(r);
  return { brief: "When money is tight, you pay for needs first.", q: "Is each one a need or a want?", ...sortTask(h, [["Drinking water", "Need"], ["Food for dinner", "Need"], ["School books", "Need"], ["Medicine", "Need"], ["Rent for your home", "Need"], ["Bus ticket to school", "Need"], ["A new video game", "Want"], ["Designer trainers", "Want"], ["Cinema tickets", "Want"], ["A sparkly phone case", "Want"], ["A third pair of headphones", "Want"], ["Ice cream", "Want"]], ["Need", "Want"], 5), hint: "A need is something you must have to live, stay healthy or go to school. A want is nice to have." };
} });
fun({ id: "f_inout", major: "Money", kind: "classify", title: "Money in, money out", gen(r) {
  const h = H(r);
  return { brief: "Here's what happened at the café this week.", q: "Did money come in or go out?", ...sortTask(h, [["A customer pays for a hot chocolate", "Money in"], ["Selling cupcakes", "Money in"], ["A school pays for a party order", "Money in"], ["Selling a gift card", "Money in"], ["Paying the rent", "Money out"], ["Buying milk and coffee beans", "Money out"], ["Paying the staff", "Money out"], ["The electricity bill", "Money out"], ["Buying new cups", "Money out"]], ["Money in", "Money out"], 5), hint: "Money in = the café gets paid. Money out = the café pays someone." };
} });
fun({ id: "f_jobs", major: "Team", kind: "classify", title: "Who does this job?", gen(r) {
  const h = H(r);
  return { brief: "Every team in a company has its own jobs.", q: "Which team does each job?", ...sortTask(h, [["Help a customer choose a phone", "Sales"], ["Call other shops to sell our products", "Sales"], ["Pay the bills", "Money team"], ["Count the cash at the end of the day", "Money team"], ["Pack boxes for delivery", "Stockroom"], ["Count the boxes on the shelves", "Stockroom"], ["Design a poster for the sale", "Marketing"], ["Post about the sale on Instagram", "Marketing"]], ["Sales", "Money team", "Stockroom", "Marketing"], 5), hint: "Ask: is this job about selling, money, boxes, or telling people about the shop?" };
} });
fun({ id: "f_receipt", major: "Shop", kind: "flag", title: "Check the receipt", gen(r) {
  const h = H(r), items = h.pickN([["Apples", 3], ["Bread", 5], ["Milk", 7], ["Eggs", 12], ["Cheese", 15], ["Juice", 6], ["Rice", 9], ["Bananas", 4]], 5), bad = h.ri(0, 4);
  const rows = items.map(([n, p], i) => { const q = h.ri(1, 4), t = q * p; return [n, q, A(p), A(i === bad ? t + h.pick([-2, 2, 3, 5, 10]) : t), q, p, t]; });
  const R = rows[bad];
  return { brief: "The till printed this receipt, but something looks wrong.", table: { cols: ["Item", "How many", "Price each", "Total"], align: ["", "r", "r", "r"], rows: rows.map(x => x.slice(0, 4)) }, wrong: [bad], q: "One line is added up wrong. Tap it.", hint: "For each line, check: how many × price each = total.", explain: `<b>${R[0]}</b>: ${R[4]} × ${R[5]} = ${A(R[6])}, but the receipt says ${R[3]}.<br>Every other line adds up correctly.` };
} });
fun({ id: "f_stock", major: "Stockroom", kind: "flag", title: "Missing boxes", gen(r) {
  const h = H(r), items = h.pickN(["Footballs", "Water bottles", "Lunch boxes", "Pencil cases", "Torches", "Yo-yos", "Umbrellas"], 5), miss = new Set(h.pickN([0, 1, 2, 3, 4], h.ri(1, 2)));
  const rows = items.map((n, i) => { const s = h.ri(8, 30); return [n, s, miss.has(i) ? s - h.ri(2, 6) : s]; });
  return { brief: "Ravi counted the boxes in the stockroom. Some don't match the list.", table: { cols: ["Item", "Should have", "Counted"], align: ["", "r", "r"], rows }, wrong: [...miss].sort(), q: `Tap every item with missing boxes. There ${miss.size > 1 ? "are 2" : "is 1"}.`, hint: "Compare the two numbers on each line. If Counted is smaller, some boxes are missing.", explain: [...miss].sort().map(i => `<b>${rows[i][0]}</b>: should have ${rows[i][1]}, counted ${rows[i][2]}. ${rows[i][1] - rows[i][2]} missing.`).join("<br>") };
} });
fun({ id: "f_count", major: "Stockroom", kind: "count", title: "Count the boxes", gen(r, T, c) {
  return { brief: "Walk to Bay C in the Stockroom and count the boxes on the shelves yourself. Some spaces are empty.", q: "How many boxes are in Bay C?", answer: c.bay, unit: "boxes", tol: .5, hint: "Count one shelf at a time, then add the shelves together. Empty spaces don't count.", explain: `Bay C has 3 shelves of boxes.<br>Adding up every shelf gives <b>${c.bay} boxes</b>.` };
} });
fun({ id: "f_bigger", major: "Money", kind: "mcq", title: "Which earns more?", gen(r) {
  const h = H(r), a = h.pick([5, 8, 10, 12]), na = h.ri(8, 20), b = h.pick([15, 20, 25, 30]), nb = h.ri(3, 8), ta = a * na, tb = b * nb;
  if (ta === tb) return this.gen(mul32(Math.floor(r() * 1e9)));
  const best = ta > tb ? "The lemonade stand" : "The car wash";
  return { brief: `On Saturday, the lemonade stand sold ${na} cups at ${A(a)} each. The car wash cleaned ${nb} cars at ${A(b)} each.`, q: "Which one made more money?", ...mcq(h, best, ["The lemonade stand", "The car wash", "They made the same"], 3), hint: "Work out each total: how many × price.", explain: `Lemonade: ${na} × ${a} = ${A(ta)}.<br>Car wash: ${nb} × ${b} = ${A(tb)}.<br>So <b>${best.toLowerCase()}</b> made more.` };
} });
for (const t of FUN) TPL[t.id] = t;
