/* ============================== PLAY FOR FUN: MORE QUESTION IDEAS ==============================
   min = the level that unlocks the idea (1 Easy, 2 Medium, 3 Tricky). Each still scales a little with T. */

/* ---------- unlocked from the start ---------- */
fun({ id: "f_split", min: 1, major: "Money", kind: "calc", title: "Split the bill", gen(r, T) {
  const h = H(r), n = h.ri(2, T === 1 ? 4 : 6), each = T === 1 ? h.ri(6, 20) : h.ri(15, 45), food = h.pick(["a pizza", "a cake", "a big lunch", "a taxi ride", "a game rental"]);
  if (T < 3) { const tot = n * each; return { brief: `${n} friends share ${food} that costs ${A(tot)}. They split it equally.`, q: "How much does each person pay?", answer: each, unit: "AED", wrongs: wr(each, [tot - n, each + 1, each - 1, each * 2, tot / (n + 1)]), hint: "Divide the total by the number of people.", explain: `The total is ${A(tot)}.<br>There are ${n} people.<br>${tot} ÷ ${n} = <b>${A(each)}</b> each.` }; }
  const del = n * h.ri(2, 5), food2 = n * each - del, tot = food2 + del;
  return { brief: `${n} friends order food for ${A(food2)}. Delivery costs another ${A(del)}. They split everything equally.`, q: "How much does each person pay?", answer: each, unit: "AED", wrongs: wr(each, [food2 / n, del / n, each + del, tot - n]), hint: "Add the delivery to the food first. Then divide by the number of people.", explain: `Total: ${food2} + ${del} = ${A(tot)}.<br>${tot} ÷ ${n} = <b>${A(each)}</b> each.` };
} });
fun({ id: "f_recipe", min: 1, major: "Shop", kind: "calc", title: "Scale the recipe", gen(r, T) {
  const h = H(r), [what, ing, unit, base] = h.pick([["cookies", "flour", "g", [100, 150, 200, 250]], ["pancakes", "milk", "ml", [200, 250, 300, 400]], ["cupcakes", "sugar", "g", [80, 120, 160, 200]], ["smoothies", "bananas", "bananas", [2, 3, 4]]]);
  const b = h.pick(base), makes = h.pick([6, 8, 10, 12]), mult = T === 1 ? 2 : T === 2 ? h.pick([3, 4]) : 1.5, want = makes * mult, a = b * mult;
  return { brief: `This recipe makes ${makes} ${what} and needs ${b} ${unit === "bananas" ? "" : unit + " of "}${ing}.`, q: `You want to make ${want} ${what}. How much ${ing} do you need?`, answer: a, unit, wrongs: wr(a, [b + want, b * 2, a + b, b * (mult + 1), a - b / 2]), hint: mult === 1.5 ? `${want} is one and a half times ${makes}. So you need the ${ing} plus half as much again.` : `${want} is ${mult} times ${makes}. So multiply the ${ing} by ${mult}.`, explain: `${want} ÷ ${makes} = ${mult}, so you need ${mult} times the recipe.<br>${b} × ${mult} = <b>${N(a)} ${unit}</b>.` };
} });
fun({ id: "f_hours", min: 1, major: "Team", kind: "calc", title: "Opening hours", gen(r, T) {
  const h = H(r), shop = h.pick(["bakery", "bookshop", "toy shop", "café", "pharmacy"]), open = h.ri(7, 10), half = T >= 2 && r() < .6, close = h.ri(4, 8), hrs = (12 - open) + close - (half ? .5 : 0);
  const oTxt = `${open}${half ? ":30" : ""} am`, cTxt = `${close} pm`;
  if (T < 3) return { brief: `The ${shop} opens at ${oTxt} and closes at ${cTxt}.`, q: "How many hours is it open each day?", answer: hrs, unit: "hours", wrongs: wr(hrs, [close - open, hrs + 1, hrs - 1, close + open, hrs + .5]), hint: "Count the hours up to 12 noon, then add the hours after noon.", explain: `From ${oTxt} to 12 noon is ${12 - open - (half ? .5 : 0)} hours.<br>From noon to ${cTxt} is ${close} hours.<br>Total: <b>${N(hrs)} hours</b>.` };
  const days = h.pick([5, 6]), a = hrs * days;
  return { brief: `The ${shop} opens at ${oTxt} and closes at ${cTxt}, ${days} days a week.`, q: "How many hours is it open each week?", answer: a, unit: "hours", wrongs: wr(a, [hrs, hrs * 7, a + days, (close - open) * days]), hint: "Work out the hours for one day, then multiply by the number of days.", explain: `One day: ${N(hrs)} hours.<br>${N(hrs)} × ${days} = <b>${N(a)} hours</b> a week.` };
} });
fun({ id: "f_restock", min: 1, major: "Stockroom", kind: "calc", title: "Fill the shelf", gen(r, T) {
  const h = H(r), thing = h.pick(["water bottles", "cereal boxes", "tins of beans", "packs of crayons"]), cap = h.pick([30, 40, 50, 60]), have = h.ri(5, cap - 10);
  if (T === 1) { const a = cap - have; return { brief: `The shelf holds ${cap} ${thing}. Right now it has ${have}.`, q: "How many should you order to fill it?", answer: a, unit: "", wrongs: wr(a, [cap + have, a + 1, a - 1, a + 10, cap]), hint: "Take what's on the shelf away from what the shelf can hold.", explain: `The shelf holds ${cap}.<br>It has ${have}.<br>${cap} − ${have} = <b>${a}</b> to order.` }; }
  const have2 = h.ri(5, cap - 10), a = cap * 2 - have - have2;
  if (T === 2) return { brief: `There are two shelves of ${thing}. Each holds ${cap}. One has ${have} and the other has ${have2}.`, q: "How many should you order to fill both?", answer: a, unit: "", wrongs: wr(a, [cap - have, cap - have2, cap * 2, a + 10, a - 5]), hint: "Work out how many each shelf needs, then add them.", explain: `Shelf 1 needs ${cap} − ${have} = ${cap - have}.<br>Shelf 2 needs ${cap} − ${have2} = ${cap - have2}.<br>Total: <b>${a}</b>.` };
  const sell = h.ri(3, 9), b = cap - have + sell;
  return { brief: `The shelf holds ${cap} ${thing} and has ${have} now. Before the delivery arrives, about ${sell} more will be sold.`, q: "How many should you order so the shelf is full after delivery?", answer: b, unit: "", wrongs: wr(b, [cap - have, cap - have - sell, cap, b + sell]), hint: "The shelf will have fewer by delivery time. Work out what it will have then.", explain: `By delivery time it will have ${have} − ${sell} = ${have - sell}.<br>${cap} − ${have - sell} = <b>${b}</b> to order.` };
} });
fun({ id: "f_survey", min: 1, major: "Shop", kind: "mcq", title: "Customer survey", gen(r, T) {
  const h = H(r), [what, list] = h.pick([["ice cream flavour", ["Chocolate", "Vanilla", "Mango", "Strawberry", "Pistachio"]], ["juice", ["Orange", "Apple", "Mango", "Lemon & mint", "Watermelon"]], ["sandwich", ["Chicken", "Cheese", "Tuna", "Falafel", "Egg"]]]);
  const items = h.pickN(list, T === 1 ? 4 : 5), votes = h.pickN(T === 3 ? [11, 12, 13, 14, 15, 16] : [4, 7, 9, 12, 15, 18, 21], items.length), most = T === 3 ? r() < .5 : true, idx = votes.indexOf(most ? Math.max(...votes) : Math.min(...votes));
  return { brief: `The café asked customers for their favourite ${what}.`, table: { cols: ["Choice", "Votes"], align: ["", "r"], rows: items.map((x, i) => [x, votes[i]]) }, q: most ? "Which one should the café make the most of?" : "Which one is the least popular?", ...mcq(h, items[idx], items), hint: `Make the most of what got the ${most ? "most" : "fewest"} votes.`, explain: `<b>${items[idx]}</b> got ${votes[idx]} votes, the ${most ? "most" : "fewest"} of all.` };
} });
fun({ id: "f_coins", min: 1, major: "Money", kind: "calc", title: "Count the money", gen(r, T) {
  const h = H(r), sets = T === 1 ? [[10, "AED 10 notes"], [1, "AED 1 coins"]] : T === 2 ? [[50, "AED 50 notes"], [20, "AED 20 notes"], [5, "AED 5 notes"], [1, "AED 1 coins"]] : [[20, "AED 20 notes"], [5, "AED 5 notes"], [1, "AED 1 coins"], [.5, "50 fils coins"]];
  const use = (T === 1 ? sets : h.pickN(sets, 3)).sort((a, b) => b[0] - a[0]).map(([v, nm]) => [v, nm, h.ri(1, 5)]), a = use.reduce((s, [v, , n]) => s + v * n, 0);
  return { brief: `A customer pays with ${use.map(([, nm, n]) => `${n} × ${nm.replace(/s$/, n === 1 ? "" : "s")}`).join(", ").replace(/, ([^,]*)$/, " and $1")}.`, q: "How much did they pay altogether?", answer: a, unit: "AED", wrongs: wr(a, [use.reduce((s, [, , n]) => s + n, 0), a + 10, a - 5, a + 1, a * 2]), hint: "Work out each kind of note or coin, then add them up.", explain: use.map(([v, nm, n]) => `${n} × ${v === .5 ? "AED 0.50" : A(v)} = ${A(v * n)}`).join("<br>") + `<br>Total: <b>${A(a)}</b>.` };
} });
fun({ id: "f_honest", min: 1, major: "Team", kind: "mcq", title: "Do the right thing", gen(r) {
  const h = H(r), S = h.pick([
    ["After closing, you find AED 100 on the shop floor.", "Give it to the manager in case someone comes back for it", ["Keep it, nobody saw", "Put it in the till as extra sales", "Leave it on the floor"], "Being honest with money builds trust, and trust is everything in business."],
    ["A customer accidentally pays AED 10 too much.", "Give the extra AED 10 back", ["Keep it as a tip", "Say nothing", "Put it in your pocket"], "Customers come back to shops they trust."],
    ["A friend asks you for a secret discount.", "Explain you charge everyone the same price", ["Give it to them quietly", "Charge them double", "Tell them to come back when the boss is away"], "Fair prices for everyone keep the business honest."],
    ["You broke a mug while cleaning the café.", "Tell the manager honestly", ["Hide the pieces", "Blame a customer", "Pretend it was already broken"], "Owning up to mistakes earns respect."],
    ["You notice the scale is giving customers a little less than they pay for.", "Tell the manager so it can be fixed", ["Keep quiet, it's good for the shop", "Only fix it for friends", "Make it give even less"], "Customers must get what they pay for. It's fair, and it's the law."]]);
  return { brief: S[0], q: "What should you do?", ...mcq(h, S[1], S[2]), hint: "Pick the honest choice, even if nobody is watching.", explain: `<b>${S[1]}</b>.<br>${S[3]}` };
} });

/* ---------- unlocked at Medium ---------- */
fun({ id: "f_vat", min: 2, major: "Money", kind: "calc", title: "Add the VAT", gen(r, T) {
  const h = H(r), item = h.pick(["lamp", "school bag", "pair of headphones", "desk chair", "football kit"]), p = h.pick([100, 200, 300, 400, 600, 800, 1000]);
  if (T < 3) { const v = p * .05, a = p + v; return { brief: `In the UAE, most prices have 5% VAT (a tax) added. A ${item} costs ${A(p)} before VAT.`, q: "What is the price with VAT?", answer: a, unit: "AED", wrongs: wr(a, [v, p + 5, p * 1.5, a + 10, p]), hint: "Find 5% of the price: that's 10% halved. Then add it on.", explain: `10% of ${A(p)} is ${A(p / 10)}, so 5% is ${A(v)}.<br>${p} + ${v} = <b>${A(a)}</b>.` }; }
  const p2 = h.pick([40, 60, 80, 120]), tot = p + p2, v = tot * .05, a = tot + v;
  return { brief: `In the UAE, most prices have 5% VAT added. You buy a ${item} for ${A(p)} and a cable for ${A(p2)}, both before VAT.`, q: "What do you pay in total with VAT?", answer: a, unit: "AED", wrongs: wr(a, [tot, p * 1.05 + p2, tot + 5, tot * 1.5, v]), hint: "Add the two prices, then add 5% of the total.", explain: `Total before VAT: ${p} + ${p2} = ${A(tot)}.<br>5% of ${A(tot)} is ${A(v)}.<br>${tot} + ${v} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_tip", min: 2, major: "Money", kind: "calc", title: "Leave a tip", gen(r, T) {
  const h = H(r), bill = h.pick([80, 120, 150, 200, 240, 300, 360]);
  if (T < 3) { const a = bill / 10; return { brief: `Your family's restaurant bill is ${A(bill)}. You want to leave a 10% tip.`, q: "How much is the tip?", answer: a, unit: "AED", wrongs: wr(a, [bill / 5, 10, a + 10, bill / 100, a * 1.5]), hint: "10% is the same as dividing by 10.", explain: `10% of ${A(bill)} = ${bill} ÷ 10 = <b>${A(a)}</b>.` }; }
  const tip = bill * .15, a = bill + tip;
  return { brief: `The restaurant bill is ${A(bill)}. You leave a 15% tip.`, q: "How much do you pay altogether?", answer: a, unit: "AED", wrongs: wr(a, [tip, bill + 15, bill * 1.1, a + 10]), hint: "15% = 10% + 5%. Find 10%, halve it to get 5%, add them, then add that to the bill.", explain: `10% is ${A(bill / 10)}, 5% is ${A(bill / 20)}, so 15% is ${A(tip)}.<br>${bill} + ${tip} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_markup", min: 2, major: "Shop", kind: "calc", title: "Set the price", gen(r, T) {
  const h = H(r), item = h.pick(["mug", "phone case", "notebook", "water bottle", "keyring"]), c = h.pick([8, 10, 12, 16, 20, 24, 40]), pct = T === 2 ? h.pick([50, 100]) : h.pick([25, 50, 75]), a = c * (1 + pct / 100);
  return { brief: `The shop buys a ${item} for ${A(c)}. To make a profit, it adds ${pct}% to set the selling price.`, q: "What should the selling price be?", answer: a, unit: "AED", wrongs: wr(a, [c * pct / 100, c + pct, a + c, c * 2.5]), hint: pct === 100 ? "Adding 100% means doubling it." : pct === 50 ? "Adding 50% means adding half of the cost." : `Find ${pct}% of the cost, then add it on.`, explain: `${pct}% of ${A(c)} is ${A(c * pct / 100)}.<br>${c} + ${c * pct / 100} = <b>${A(a)}</b>.` };
} });
fun({ id: "f_cover", min: 2, major: "Money", kind: "calc", title: "Cover your costs", gen(r, T) {
  const h = H(r), [stall, item] = h.pick([["cupcake stall", "cupcakes"], ["lemonade stand", "cups"], ["bracelet stall", "bracelets"], ["car wash", "cars"]]), each = h.pick(T === 2 ? [2, 3, 4, 5] : [3, 4, 6, 8]), n = h.ri(10, 30), rent = each * n;
  return { brief: `Renting a spot for your ${stall} costs ${A(rent)} for the day. You make ${A(each)} profit on each of your ${item}.`, q: `How many ${item} must you sell just to pay the rent?`, answer: n, unit: item, wrongs: wr(n, [rent - each, n + 1, n - 1, n * 2, rent / (each + 1)]), hint: "Divide the rent by the profit you make on each one.", explain: `Each one earns ${A(each)} toward the rent.<br>${rent} ÷ ${each} = <b>${n} ${item}</b>.<br>After that, everything you sell is real profit.` };
} });
fun({ id: "f_supplier", min: 2, major: "Stockroom", kind: "mcq", title: "Pick a supplier", gen(r, T) {
  const h = H(r), n = T === 2 ? 2 : 3, boxes = h.pick([10, 20, 25]), names = h.pickN(["Gulf Supplies", "Desert Wholesale", "Marina Traders", "Oasis Goods"], n);
  for (let k = 0; k < 30; k++) {
    const per = names.map(() => h.pick([4, 5, 6, 7, 8])), fee = names.map(() => h.pick([0, 10, 20, 30, 40])), tot = per.map((p, i) => p * boxes + fee[i]), min = Math.min(...tot);
    if (tot.filter(t => t === min).length > 1 || new Set(per).size < n) continue;
    const best = names[tot.indexOf(min)];
    return { brief: `You need ${boxes} boxes of paper cups. These suppliers sell them:`, table: { cols: ["Supplier", "Price per box", "Delivery fee"], align: ["", "r", "r"], rows: names.map((s, i) => [s, A(per[i]), fee[i] ? A(fee[i]) : "Free"]) }, q: "Which supplier is cheapest overall?", ...mcq(h, best, names), hint: "For each supplier: (price per box × number of boxes) + delivery fee.", explain: names.map((s, i) => `${s}: ${per[i]} × ${boxes} + ${fee[i]} = ${A(tot[i])}`).join("<br>") + `<br>So <b>${best}</b> is cheapest.` };
  }
} });
fun({ id: "f_scam", min: 2, major: "Team", kind: "mcq", title: "Spot the scam", gen(r) {
  const h = H(r), scams = ["URGENT!! You won AED 1,000,000! Reply with your bank password to claim it", "Your account will be closed today unless you send your card PIN", "Free iPhone for the first 10 people. Just pay a AED 50 'shipping fee' by gift card", "Hi, it's your boss. I'm in a meeting, buy 5 gift cards and send me the codes now"],
    real = ["Your order #4821 has shipped and will arrive on Thursday", "Reminder: team meeting moved to 3 pm in the boardroom", "Your monthly electricity bill is ready to view in the app", "Thanks for your payment. Here is your receipt", "Sara has shared the Q4 sales report with you"];
  const scam = h.pick(scams);
  return { brief: "Four emails just arrived in the company inbox.", q: "Which one is most likely a scam?", ...mcq(h, scam, real), hint: "Scams rush you, promise prizes, or ask for passwords, PINs or gift cards.", explain: `<b>"${scam}"</b> is the scam.<br>Real companies never ask for passwords, PINs or gift-card codes, and they don't rush you with prizes. When in doubt, check with someone you trust.` };
} });
fun({ id: "f_loyalty", min: 2, major: "Shop", kind: "calc", title: "Loyalty card", gen(r, T) {
  const h = H(r), k = h.pick([5, 9, 10]);
  if (T < 3) { const free = h.ri(2, 6), bought = k * free + h.ri(0, k - 1); return { brief: `The café gives you 1 free coffee for every ${k} you buy.`, q: `You bought ${bought} coffees. How many free coffees have you earned?`, answer: free, unit: "", wrongs: wr(free, [free + 1, free - 1, bought - free, Math.round(bought / 2)]), hint: `How many full groups of ${k} are in ${bought}?`, explain: `${bought} ÷ ${k} = ${free} full groups (with ${bought - k * free} left over).<br>So you get <b>${free} free</b>.` }; }
  const groups = h.ri(2, 5), total = (k + 1) * groups, pay = k * groups;
  return { brief: `The café's deal: buy ${k} coffees and the next one is free.`, q: `Your team needs ${total} coffees. How many do you pay for?`, answer: pay, unit: "", wrongs: wr(pay, [total, total - 1, pay + 1, total - groups + 1]), hint: `Every group of ${k + 1} coffees costs you only ${k}.`, explain: `${total} coffees = ${groups} groups of ${k + 1}.<br>You pay for ${k} in each group: ${k} × ${groups} = <b>${pay}</b>.` };
} });
fun({ id: "f_budget", min: 2, major: "Money", kind: "calc", title: "Party budget", gen(r, T) {
  const h = H(r), budget = h.pick([150, 200, 250, 300]), snacks = h.ri(30, 70), deco = h.ri(15, 45);
  if (T < 3) { const a = budget - snacks - deco; return { brief: `You have ${A(budget)} for a class party. You spent ${A(snacks)} on snacks and ${A(deco)} on decorations.`, q: "How much money is left?", answer: a, unit: "AED", wrongs: wr(a, [budget - snacks, budget - deco, snacks + deco, a + 10, a - 10]), hint: "Add up what you spent, then take it away from the budget.", explain: `Spent: ${snacks} + ${deco} = ${A(snacks + deco)}.<br>${budget} − ${snacks + deco} = <b>${A(a)}</b> left.` }; }
  const kids = h.ri(10, 20), cup = h.pick([2, 3, 4]), big = budget + 150, a = big - snacks - deco - kids * cup;
  return { brief: `You have ${A(big)} for a class party. You spent ${A(snacks)} on snacks, ${A(deco)} on decorations, and bought a ${A(cup)} drink for each of the ${kids} students.`, q: "How much money is left?", answer: a, unit: "AED", wrongs: wr(a, [big - snacks - deco, big - snacks - deco - cup, a + 10, kids * cup]), hint: "Work out the drinks total first (students × price), then subtract everything from the budget.", explain: `Drinks: ${kids} × ${cup} = ${A(kids * cup)}.<br>Spent: ${snacks} + ${deco} + ${kids * cup} = ${A(snacks + deco + kids * cup)}.<br>${big} − ${snacks + deco + kids * cup} = <b>${A(a)}</b> left.` };
} });

/* ---------- unlocked at Tricky ---------- */
fun({ id: "f_currency", min: 3, major: "Money", kind: "calc", title: "Change currency", gen(r) {
  const h = H(r), usd = h.pick([10, 20, 30, 50, 100]), rate = 3.67, a = Math.round(usd * rate * 100) / 100, item = h.pick(["souvenir", "theme-park ticket", "pair of sunglasses", "book"]);
  return { brief: `On a trip to the US, a ${item} costs $${usd}. For this game, $1 = AED 3.67.`, q: "How much is that in dirhams?", answer: a, unit: "AED", wrongs: wr(a, [usd / rate, usd + rate, usd * 3, a + 10]), hint: "Multiply the dollars by 3.67 to get dirhams.", explain: `${usd} × 3.67 = <b>${A(a)}</b>.<br>Tip: ${usd} × 3.67 is a bit less than ${usd} × 4 = ${A(usd * 4)}, so check your answer is close to that.` };
} });
fun({ id: "f_growth", min: 3, major: "Shop", kind: "calc", title: "Did sales grow?", gen(r) {
  const h = H(r), base = h.pick([100, 200, 400, 500, 800]), pct = h.pick([10, 20, 25, 40, 50]), up = r() < .7, now = base * (1 + (up ? pct : -pct) / 100), thing = h.pick(["ice creams", "sandwiches", "books", "T-shirts"]);
  return { brief: `Last month the shop sold ${base} ${thing}. This month it sold ${now}.`, q: `By what percentage did sales go ${up ? "up" : "down"}?`, answer: pct, unit: "%", wrongs: wr(pct, [Math.abs(now - base), pct * 2, Math.round(Math.abs(now - base) / now * 100), pct / 2]), hint: "Find the change, then divide it by LAST month's number and multiply by 100.", explain: `Change: ${Math.abs(now - base)} ${thing}.<br>${Math.abs(now - base)} ÷ ${base} × 100 = <b>${pct}%</b> ${up ? "up" : "down"}.` };
} });
fun({ id: "f_average", min: 3, major: "Shop", kind: "calc", title: "Average sales", gen(r) {
  const h = H(r), days = h.pick([3, 4, 5]), avg = h.ri(10, 30); let vals; do { vals = [...Array(days)].map(() => avg + h.ri(-6, 6)); vals[days - 1] = avg * days - vals.slice(0, -1).reduce((a, b) => a + b, 0); } while (vals[days - 1] <= 0);
  const a = vals.reduce((x, y) => x + y, 0) / days;
  return { brief: `The lemonade stand sold ${vals.join(", ").replace(/, ([^,]*)$/, " and $1")} cups over ${days} days.`, q: "What is the average number of cups per day?", answer: a, unit: "cups", wrongs: wr(a, [Math.max(...vals), vals.reduce((x, y) => x + y, 0), a + 2, a - 2]), hint: "Add up all the days, then divide by the number of days.", explain: `Total: ${vals.join(" + ")} = ${vals.reduce((x, y) => x + y, 0)}.<br>${vals.reduce((x, y) => x + y, 0)} ÷ ${days} = <b>${N(a)} cups</b> a day.` };
} });
fun({ id: "f_advert", min: 3, major: "Shop", kind: "mcq", title: "Best advert", gen(r) {
  const h = H(r), ways = h.pickN(["Flyers", "Instagram post", "Radio advert", "Billboard", "Newspaper"], 3);
  for (let k = 0; k < 30; k++) {
    const cust = ways.map(() => h.pick([10, 20, 25, 40, 50, 80])), per = ways.map(() => h.pick([2, 3, 4, 5, 6, 8, 10])), cost = cust.map((c, i) => c * per[i]), min = Math.min(...per);
    if (per.filter(p => p === min).length > 1 || cust.indexOf(Math.max(...cust)) === per.indexOf(min)) continue;
    const best = ways[per.indexOf(min)];
    return { brief: "The shop tried three kinds of advert.", table: { cols: ["Advert", "Cost", "New customers"], align: ["", "r", "r"], rows: ways.map((w, i) => [w, A(cost[i]), cust[i]]) }, q: "Which advert got new customers for the lowest cost each?", ...mcq(h, best, ways), hint: "For each advert, divide the cost by the number of new customers.", explain: ways.map((w, i) => `${w}: ${cost[i]} ÷ ${cust[i]} = ${A(per[i])} per customer`).join("<br>") + `<br>So <b>${best}</b> is the best value, even though another advert brought more people.` };
  }
} });
fun({ id: "f_shift", min: 3, major: "Team", kind: "mcq", title: "Cover the shift", gen(r) {
  const h = H(r), staff = h.pickN(["Ravi", "Mariam", "Omar", "Priya", "Hassan", "Grace"], 4), s = h.pick([10, 12, 14]), e = s + 4, f = x => x === 12 ? "12 pm" : x > 12 ? `${x - 12} pm` : `${x} am`;
  const who = h.ri(0, 3), rows = staff.map((n, i) => { if (i === who) return [n, `${f(s - h.pick([0, 1, 2]))} – ${f(e + h.pick([0, 1, 2]))}`]; return [n, h.pick([`${f(s + 1)} – ${f(e + 2)}`, `${f(s - 2)} – ${f(e - 1)}`, `${f(s + 2)} – ${f(e + 2)}`])]; });
  return { brief: `The café needs someone to work on Saturday from ${f(s)} to ${f(e)}. Here's when each person is free:`, table: { cols: ["Name", "Free on Saturday"], align: ["", ""], rows }, q: "Who can cover the whole shift?", ...mcq(h, staff[who], staff), hint: `They must be free at ${f(s)} AND still free at ${f(e)}.`, explain: `<b>${staff[who]}</b> is free ${rows[who][1]}, which covers ${f(s)} to ${f(e)}.<br>Everyone else starts too late or leaves too early.` };
} });
fun({ id: "f_margin", min: 3, major: "Money", kind: "mcq", title: "Most profitable product", gen(r) {
  const h = H(r), prods = h.pickN(["Smoothie", "Sandwich", "Muffin", "Salad", "Coffee"], 3);
  for (let k = 0; k < 30; k++) {
    const price = prods.map(() => h.pick([8, 10, 12, 15, 18, 20, 25])), cost = price.map(p => p - h.pick([2, 3, 4, 5, 6, 8])), prof = price.map((p, i) => p - cost[i]), mx = Math.max(...prof);
    if (prof.filter(x => x === mx).length > 1 || price.indexOf(Math.max(...price)) === prof.indexOf(mx) || cost.some(c => c <= 0)) continue;
    const best = prods[prof.indexOf(mx)];
    return { brief: "Here's what the café charges and what each item costs to make.", table: { cols: ["Item", "Price", "Cost to make"], align: ["", "r", "r"], rows: prods.map((p, i) => [p, A(price[i]), A(cost[i])]) }, q: "Which item makes the most profit per sale?", ...mcq(h, best, prods), hint: "Profit = price − cost. The most expensive item isn't always the most profitable.", explain: prods.map((p, i) => `${p}: ${price[i]} − ${cost[i]} = ${A(prof[i])}`).join("<br>") + `<br>So <b>${best}</b> earns the most each time it sells.` };
  }
} });
fun({ id: "f_stockvalue", min: 3, major: "Stockroom", kind: "calc", title: "Value the stock", gen(r) {
  const h = H(r), [thing, unit] = h.pick([["pens", "pen"], ["batteries", "battery"], ["candles", "candle"], ["soaps", "soap"]]), boxes = h.ri(4, 15), per = h.pick([10, 12, 20, 24, 25]), each = h.pick([1, 2, 3, 5]), a = boxes * per * each;
  return { brief: `The stockroom has ${boxes} boxes of ${thing}. Each box holds ${per} ${thing}, and each ${unit} cost the shop ${A(each)}.`, q: `How much are all the ${thing} worth?`, answer: a, unit: "AED", wrongs: wr(a, [boxes * per, boxes * each, per * each, a + per, boxes + per + each]), hint: `First find how many ${thing} there are (boxes × per box). Then multiply by the cost of one.`, explain: `${boxes} × ${per} = ${boxes * per} ${thing}.<br>${boxes * per} × ${each} = <b>${A(a)}</b>.` };
} });

for (const t of FUN) TPL[t.id] = t;
