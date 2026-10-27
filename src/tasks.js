/* ============================== TASK GENERATOR ==============================
   Every task is generated from a template, a seeded random source and a difficulty tier (1-4).
   Kinds: calc (enter a number), mcq (pick one), flag (spot wrong rows), classify (sort rows), count (count in 3D). */
const MAJORS = ["Accounting", "Finance", "Marketing", "Management", "Economics"];
const SERVICE = { Accounting: "Audit & Assurance", Finance: "Corporate Finance", Marketing: "Growth & Marketing", Management: "Operations & People", Economics: "Economic Advisory" };
const KIND_NAME = { calc: "Calculate", mcq: "Decide", flag: "Spot the errors", classify: "Sort", count: "Count" };

function mul32(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function H(r) {
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = a => a[Math.floor(r() * a.length)];
  const shuf = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  return { ri, pick, shuf, pickN: (a, n) => shuf(a).slice(0, n) };
}
const N = (x, d = 2) => Number(x).toLocaleString("en-US", { maximumFractionDigits: d });
const AED = x => "AED " + N(Math.round(x));
const r2 = x => Math.round(x * 100) / 100;
const pct = x => N(x, 2) + "%";

/* mcq helper: correct answer plus distractors, shuffled */
function mcq(h, correct, wrong, n = 4) { const opts = h.shuf([correct, ...h.pickN(wrong.filter(w => w !== correct), n - 1)]); return { options: opts, correct: opts.indexOf(correct) }; }
/* classify helper from a pool [text, category, minTier, why] */
function classify(h, T, pool, cats, n) {
  const items = h.pickN(pool.filter(p => (p[2] || 1) <= T), n).map(p => ({ text: p[0], cat: p[1], why: p[3] || "" }));
  return { cats, items, explain: items.map(i => `<b>${i.text}</b> → ${i.cat}${i.why ? ". " + i.why : ""}`).join("<br>") };
}

const T_ = [];
const def = t => T_.push(t);

/* ============================== ACCOUNTING ============================== */
def({ id: "acc_classify", major: "Accounting", kind: "classify", title: "Sort the ledger accounts", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  const pool = [["Cash at bank", "Asset", 1, "Money the business controls"], ["Inventory", "Asset", 1, "Goods held for sale"], ["Trade payables", "Liability", 1, "Amounts owed to suppliers"], ["Bank loan", "Liability", 1, "Borrowed money to repay"], ["Share capital", "Equity", 1, "The owners' investment"], ["Sales revenue", "Revenue", 1, "Income from selling goods"], ["Rent expense", "Expense", 1, "The cost of premises used this period"], ["Salaries expense", "Expense", 1, "The cost of staff this period"], ["Delivery vans", "Asset", 1, "A long-term resource used in the business"], ["Retained earnings", "Equity", 1, "Profits kept in the business"], ["Interest income", "Revenue", 1, "Income earned on deposits"], ["Prepaid insurance", "Asset", 2, "Paid in advance, so the benefit is still to come"], ["Unearned revenue", "Liability", 2, "Cash received before the goods or service are delivered"], ["Accrued wages", "Liability", 2, "Wages earned by staff but not yet paid"], ["Depreciation expense", "Expense", 2, "This period's share of an asset's cost"], ["Accumulated depreciation", "Asset", 2, "A contra-asset: it sits with assets and reduces their carrying amount"], ["Goodwill", "Asset", 3, "An intangible asset arising on an acquisition"], ["Provision for warranties", "Liability", 3, "A present obligation of uncertain timing or amount"], ["Allowance for doubtful debts", "Asset", 3, "A contra-asset that reduces receivables"], ["Gain on disposal of equipment", "Revenue", 3, "Income from selling an asset above its carrying amount"], ["Deferred tax liability", "Liability", 3, "Tax payable in future periods"], ["Dividends declared", "Equity", 3, "A distribution to owners that reduces equity"]];
  const k = classify(h, T, pool, ["Asset", "Liability", "Equity", "Revenue", "Expense"], Math.min(9, 5 + T));
  return { brief: `${c.client}'s new bookkeeper has dumped every account into one list. Sort them so the trial balance can be built.`, q: "Which category does each account belong to?", ...k, hint: "Assets are resources the business controls. Liabilities are amounts it owes. Equity belongs to the owners. Revenue and expenses are this period's income and costs. Contra accounts sit with the item they reduce." };
} });

def({ id: "acc_depr", major: "Accounting", kind: "calc", title: "Depreciation schedule", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), C = h.ri(8, 40) * 5000, R = Math.round(C * h.pick([0, .1, .1, .2]) / 1000) * 1000, L = h.pick([4, 5, 8, 10]);
  const asset = h.pick(["a delivery van", "a packaging machine", "a set of warehouse racks", "a forklift", "a point-of-sale system"]);
  const ann = (C - R) / L;
  const facts = [["Cost", AED(C)], ["Residual value", AED(R)], ["Useful life", L + " years"]];
  if (T === 1) return { brief: `${c.client} bought ${asset} on 1 January 2025. It uses the straight-line method.`, facts, q: "What is the depreciation charge for one full year?", answer: ann, unit: "AED", explain: `Straight-line depreciation = (cost − residual value) ÷ useful life = (${N(C)} − ${N(R)}) ÷ ${L} = <b>${AED(ann)}</b> a year.`, hint: "Spread the depreciable amount (cost minus residual value) evenly over the useful life." };
  if (T === 2) { const d = h.pick([.2, .25, .3, .4]), a = C * (1 - d) * d; return { brief: `${c.client} bought ${asset} on 1 January 2024 and uses the reducing-balance method at ${d * 100}% a year.`, facts: [["Cost", AED(C)], ["Rate", d * 100 + "% reducing balance"]], q: "What is the depreciation charge for the second year (2025)?", answer: a, unit: "AED", explain: `Year 1: ${N(C)} × ${d * 100}% = ${N(C * d)}, leaving ${N(C * (1 - d))}. Year 2: ${N(C * (1 - d))} × ${d * 100}% = <b>${AED(a)}</b>.`, hint: "Reducing balance applies the rate to the carrying amount at the start of each year, not to the original cost." }; }
  if (T === 3) { const m = h.ri(3, 10), months = 13 - m, a = ann * months / 12, mn = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m]; return { brief: `${c.client} bought ${asset} on 1 ${mn} 2025. Straight-line, charged monthly from the date of purchase. Year-end is 31 December.`, facts, q: "What is the depreciation charge for 2025?", answer: a, unit: "AED", explain: `Annual charge = (${N(C)} − ${N(R)}) ÷ ${L} = ${N(ann)}. Owned for ${months} months in 2025, so ${N(ann)} × ${months}/12 = <b>${AED(a)}</b>.`, hint: "Work out a full year's charge, then take only the months the asset was owned." }; }
  const k = h.ri(2, L - 1), cv = C - k * ann, P = Math.round(cv * (0.7 + r() * 0.5) / 100) * 100, g = P - cv;
  return { brief: `${c.client} bought ${asset} on 1 January, depreciated it straight-line, and sold it for ${AED(P)} exactly ${k} years later.`, facts: [...facts, ["Sale proceeds", AED(P)]], q: "What is the gain or loss on disposal? Enter a loss as a negative number.", answer: g, unit: "AED", explain: `Carrying amount = ${N(C)} − ${k} × ${N(ann)} = ${N(cv)}. Proceeds − carrying amount = ${N(P)} − ${N(cv)} = <b>${AED(g)}</b> (${g >= 0 ? "a gain" : "a loss"}).`, hint: "Compare the sale proceeds with the carrying amount (cost minus accumulated depreciation) on the date of sale." };
} });

def({ id: "acc_cutoff", major: "Accounting", kind: "flag", title: "Sales cut-off test", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), n = Math.min(10, 6 + T), w = 1 + (T >= 2) + (T >= 3), custs = ["Marina Home", "Al Noor Hypermarket", "Coral Coast Hotels", "Desert Rose Kitchens", "Gulf Mart", "Pearl Retail", "Sands Supplies", "Najm Stores"];
  const wrongIdx = new Set(h.pickN([...Array(n).keys()], w)); const rows = [], why = {};
  let inv = h.ri(1100, 1800);
  const trick = T >= 3 ? h.ri(0, n - 1) : -1;
  for (let i = 0; i < n; i++) {
    let d, del;
    if (wrongIdx.has(i)) { d = h.ri(27, 31); del = `0${h.ri(2, 6)} Jan 2026`; why[i] = `Invoiced ${d} Dec but delivered ${del}: the sale belongs in 2026.`; }
    else if (i === trick) { d = 31; del = "31 Dec 2025"; }
    else { d = h.ri(1, 26); del = `${Math.min(30, d + h.ri(0, 3))} Dec 2025`; }
    rows.push([`INV-${inv++}`, `${d} Dec 2025`, h.pick(custs), N(h.ri(12, 340) * 1000), del]);
  }
  rows.sort((a, b) => parseInt(a[1]) - parseInt(b[1]));
  const wrong = rows.map((row, i) => row[4].includes("2026") ? i : -1).filter(i => i >= 0);
  return { brief: `These invoices were all recorded as revenue for the year ended 31 December 2025. ${T === 1 ? "Revenue belongs in the year the goods are delivered to the customer." : "Test the cut-off."}`, table: { cols: ["Invoice", "Invoice date", "Customer", "Amount (AED)", "Delivered"], align: ["", "", "", "r", ""], rows }, wrong, q: "Flag every sale recorded in the wrong year.", explain: wrong.map(i => `<b>${rows[i][0]}</b>: invoiced ${rows[i][1]}, delivered ${rows[i][4]}. Control passed in 2026, so the revenue belongs in 2026 (IFRS 15).`).join("<br>") + (trick >= 0 ? "<br>An invoice dated and delivered on 31 December is correctly in 2025." : ""), hint: "Compare each invoice date with the delivery date. Which deliveries happened after the year-end?" };
} });

def({ id: "acc_count", major: "Accounting", kind: "count", title: "Inventory test count", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), k = h.ri(2, 6), sys = (c.bay + k) * c.per;
  const facts = [["Item", c.prod], ["Units per pallet", N(c.per)], ["System quantity", N(sys) + " units"], ["Unit cost", AED(c.cost)]];
  if (T === 1) return { brief: `Walk to Bay C in the warehouse and count the pallets of ${c.prod} on the racks yourself. Some slots are empty.`, facts, q: "How many units are physically in Bay C?", answer: c.bay * c.per, unit: "units", explain: `There are ${c.bay} pallets × ${c.per} units = <b>${N(c.bay * c.per)} units</b>. The system says ${N(sys)}, so ${N(k * c.per)} units are missing.`, hint: `Count the pallets, then multiply by ${c.per} units per pallet.` };
  const v = k * c.per * c.cost;
  return { brief: `Walk to Bay C in the warehouse and count the pallets of ${c.prod} yourself. Then compare with the system record.`, facts, q: "By how much is inventory overstated in the books (in AED)?", answer: v, unit: "AED", explain: `Counted: ${c.bay} pallets × ${c.per} = ${N(c.bay * c.per)} units. System: ${N(sys)}. Shortfall ${N(k * c.per)} units × ${AED(c.cost)} = <b>${AED(v)}</b> of inventory that doesn't exist (existence assertion).`, hint: "Physical units = pallets × units per pallet. The overstatement is (system − physical) × unit cost." };
} });

def({ id: "acc_baddebt", major: "Accounting", kind: "calc", title: "Doubtful debts allowance", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) { const TR = h.ri(40, 200) * 10000, p = h.pick([2, 3, 4, 5]), a = TR * p / 100; return { brief: `${c.client}'s policy is an allowance of ${p}% of year-end trade receivables.`, facts: [["Trade receivables", AED(TR)], ["Policy", p + "%"]], q: "What allowance for doubtful debts is required?", answer: a, unit: "AED", explain: `${N(TR)} × ${p}% = <b>${AED(a)}</b>.`, hint: "Apply the policy percentage to total receivables." }; }
  const b = [h.ri(80, 300) * 1000, h.ri(30, 120) * 1000, h.ri(10, 60) * 1000, h.ri(5, 40) * 1000], ps = T >= 3 ? [2, 10, 25, 60] : [1, 5, 20, 50];
  const req = b.reduce((s, x, i) => s + x * ps[i] / 100, 0);
  const rows = ["0–30 days", "31–60 days", "61–90 days", "Over 90 days"].map((l, i) => [l, N(b[i]), ps[i] + "%"]);
  if (T === 2) return { brief: `${c.client} estimates doubtful debts from the aging schedule.`, table: { cols: ["Age", "Balance (AED)", "Expected loss"], align: ["", "r", "r"], rows }, q: "What total allowance is required?", answer: req, unit: "AED", explain: rows.map((x, i) => `${x[0]}: ${x[1]} × ${ps[i]}% = ${N(b[i] * ps[i] / 100)}`).join("<br>") + `<br>Total = <b>${AED(req)}</b>.`, hint: "Multiply each age band by its expected loss rate, then add them up." };
  const E = Math.round(req * (0.3 + r() * 0.5) / 100) * 100, exp = req - E;
  return { brief: `${c.client} uses an aging-based expected credit loss model. The allowance already in the books is ${AED(E)}.`, table: { cols: ["Age", "Balance (AED)", "Expected loss"], align: ["", "r", "r"], rows }, q: "What impairment expense must be recorded this year?", answer: exp, unit: "AED", explain: `Required allowance = ${N(req)}. Existing allowance = ${N(E)}. Top-up expense = <b>${AED(exp)}</b>.`, hint: "Work out the required closing allowance, then compare it with what's already there." };
} });

def({ id: "acc_bankrec", major: "Accounting", kind: "calc", title: "Bank reconciliation", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), B = h.ri(50, 300) * 1000 + h.ri(0, 999), D = [...Array(h.ri(1, 2))].map(() => h.ri(5, 60) * 100), O = [...Array(h.ri(2, 3))].map(() => h.ri(5, 90) * 100);
  const adj = B + D.reduce((a, b) => a + b, 0) - O.reduce((a, b) => a + b, 0);
  const rows = [["Balance per bank statement", N(B)], ...D.map((d, i) => [`Deposit in transit ${i + 1}`, N(d)]), ...O.map((o, i) => [`Outstanding cheque #${2040 + i * 7}`, N(o)])];
  if (T === 2) return { brief: `It's 31 December. Reconcile ${c.client}'s bank statement to its cash book.`, table: { cols: ["Item", "AED"], align: ["", "r"], rows }, q: "What is the adjusted (true) cash balance?", answer: adj, unit: "AED", explain: `Bank balance ${N(B)} + deposits in transit ${N(D.reduce((a, b) => a + b, 0))} − outstanding cheques ${N(O.reduce((a, b) => a + b, 0))} = <b>${AED(adj)}</b>.`, hint: "Start from the bank's balance. Add money the bank hasn't received yet; subtract cheques that haven't cleared." };
  const f = h.ri(50, 400), books = adj + f;
  return { brief: `Reconcile ${c.client}'s bank to its books at 31 December. The bank statement also shows a service fee the company hasn't recorded. Balance per books: ${AED(books)}.`, table: { cols: ["Item", "AED"], align: ["", "r"], rows }, q: "What adjustment must the company post to its cash book? Enter a decrease as a negative number.", answer: -f, unit: "AED", explain: `Adjusted bank balance = ${N(adj)}. Books show ${N(books)}. The difference, <b>${AED(-f)}</b>, is the unrecorded bank fee to deduct in the books.`, hint: "First find the true balance from the bank side. The book adjustment is whatever moves the books to that figure." };
} });

def({ id: "acc_prepaid", major: "Accounting", kind: "calc", title: "Prepayments and accruals", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), mn = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  if (T === 1) { const X = h.ri(2, 10) * 12000, a = X * 9 / 12; return { brief: `On 1 October 2025 ${c.client} paid ${AED(X)} rent for 12 months in advance. Year-end is 31 December.`, facts: [["Rent paid", AED(X)], ["Period covered", "1 Oct 2025 – 30 Sep 2026"]], q: "How much should be shown as a prepayment at 31 December 2025?", answer: a, unit: "AED", explain: `3 of the 12 months are used in 2025. The other 9 months (${N(X)} × 9/12 = <b>${AED(a)}</b>) are a prepayment.`, hint: "Which months fall in next year? That share is still an asset." }; }
  if (T === 2) { const m = h.ri(2, 11), X = h.ri(2, 10) * 12000, a = X * (m - 1) / 12; return { brief: `${c.client} paid ${AED(X)} for a 12-month insurance policy starting 1 ${mn[m]} 2025. Year-end is 31 December.`, facts: [["Premium", AED(X)], ["Policy start", "1 " + mn[m] + " 2025"]], q: "What is the prepayment at 31 December 2025?", answer: a, unit: "AED", explain: `${13 - m} months fall in 2025; ${m - 1} months fall in 2026. Prepayment = ${N(X)} × ${m - 1}/12 = <b>${AED(a)}</b>.`, hint: "Count how many of the policy's months are in 2026." }; }
  const L = h.ri(2, 20) * 100000, rate = h.pick([4, 5, 6, 7.5]), m = h.ri(2, 11), a = L * rate / 100 * (13 - m) / 12;
  return { brief: `${c.client} took a ${AED(L)} bank loan on 1 ${mn[m]} 2025 at ${rate}% a year. Interest is paid annually on the loan's anniversary.`, facts: [["Loan", AED(L)], ["Rate", rate + "% a year"], ["Drawn", "1 " + mn[m] + " 2025"]], q: "What accrued interest must be recognised at 31 December 2025?", answer: a, unit: "AED", explain: `${13 - m} months of interest have built up: ${N(L)} × ${rate}% × ${13 - m}/12 = <b>${AED(a)}</b>, owed but unpaid.`, hint: "Interest accrues month by month even if it's only paid once a year." };
} });

def({ id: "acc_assertion", major: "Accounting", kind: "mcq", title: "Which assertion is at risk?", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), all = ["Existence", "Completeness", "Cut-off", "Valuation", "Occurrence", "Rights and obligations", "Classification"];
  const S = h.pick([["Goods shipped on 3 January were recorded as December sales.", "Cut-off", "The transaction is real but recorded in the wrong period."], ["Inventory listed in the ledger couldn't be found in the warehouse.", "Existence", "The asset recorded may not exist."], ["A December supplier invoice was never entered in the books.", "Completeness", "A liability that exists is missing."], ["Receivables from a customer in liquidation carry no allowance.", "Valuation", "The asset is recorded at more than it's worth."], ["Sales were booked to a customer nobody in the company has heard of.", "Occurrence", "The transaction may never have happened."], ["Stock held on consignment for a supplier was counted as the company's own.", "Rights and obligations", "The company doesn't own those goods."], ["A bank loan due in three months is shown as non-current.", "Classification", "It's in the wrong place in the statements."]]);
  return { brief: `${c.exec} mentions something in passing: "${S[0]}"`, q: "Which financial statement assertion is most at risk?", ...mcq(h, S[1], all), explain: `<b>${S[1]}</b>. ${S[2]}`, hint: "Ask: did it happen, is it all there, is it in the right year, is the amount right, does the company own it, is it in the right place?" };
} });

def({ id: "acc_materiality", major: "Accounting", kind: "calc", title: "Set materiality", min: 1, max: 2, gen(r, T, c) {
  const h = H(r), P = h.ri(8, 60) * 100000, m = P * .05;
  if (T === 1) return { brief: `Sara wants overall materiality for ${c.client} set at 5% of profit before tax.`, facts: [["Profit before tax", AED(P)]], q: "What is overall materiality?", answer: m, unit: "AED", explain: `${N(P)} × 5% = <b>${AED(m)}</b>. Misstatements above this could change a reader's decisions.`, hint: "Take 5% of profit before tax." };
  return { brief: `Overall materiality for ${c.client} is 5% of profit before tax. The firm sets performance materiality at 75% of overall materiality.`, facts: [["Profit before tax", AED(P)]], q: "What is performance materiality?", answer: m * .75, unit: "AED", explain: `Overall = ${N(P)} × 5% = ${N(m)}. Performance = ${N(m)} × 75% = <b>${AED(m * .75)}</b>. The lower figure leaves room for errors you didn't find.`, hint: "Calculate overall materiality first, then take 75% of it." };
} });

def({ id: "acc_cap", major: "Accounting", kind: "mcq", cap: true, title: "Sign the audit opinion", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), M = h.ri(5, 20) * 10000, types = T >= 3 ? ["U", "Q", "A", "D", "QS"] : ["U", "Q", "A"], t = h.pick(types);
  const sc = { U: [`The only uncorrected misstatement is ${AED(M * h.ri(3, 8) / 10)}, below materiality of ${AED(M)}.`, "Unmodified", "It's below materiality, so it doesn't change a reader's view."], Q: [`Management refuses to correct a ${AED(M * (1.3 + r()))} overstatement of receivables. Materiality is ${AED(M)}. Everything else is fine.`, "Qualified", "Material, but confined to one balance, so not pervasive: 'except for'."], A: [`Uncorrected errors of ${AED(M * h.ri(6, 12))} run through revenue, inventory and payables and turn a reported profit into a loss. Materiality is ${AED(M)}.`, "Adverse", "Material and pervasive: the statements as a whole are misleading."], D: ["A fire destroyed the records for inventory and receivables, about 60% of total assets. No other evidence exists.", "Disclaimer", "You can't get enough evidence and the possible effect is pervasive."], QS: [`You couldn't attend the stock count at an overseas branch holding inventory of ${AED(M * 1.5)}. Materiality is ${AED(M)}. Everything else is fine.`, "Qualified", "A material but contained scope limitation: 'except for' the branch inventory."] }[t];
  return { brief: `Final review of ${c.client}. ${sc[0]}`, q: "Which audit opinion should the firm issue?", ...mcq(h, sc[1], ["Unmodified", "Qualified", "Adverse", "Disclaimer"]), explain: `<b>${sc[1]}</b>. ${sc[2]}`, hint: "Two questions: is it material? If so, is it pervasive? Then: is it a disagreement or missing evidence?" };
} });

/* ============================== FINANCE ============================== */
def({ id: "fin_tvm", major: "Finance", kind: "calc", title: "Time value of money", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) { const P = h.ri(5, 50) * 1000, k = h.pick([3, 4, 5, 6]), n = h.ri(2, 5), a = P * k / 100 * n; return { brief: `${c.exec} put ${AED(P)} of spare cash on deposit at ${k}% simple interest for ${n} years.`, facts: [["Deposit", AED(P)], ["Rate", k + "% simple"], ["Term", n + " years"]], q: "How much interest will it earn in total?", answer: a, unit: "AED", explain: `Simple interest = P × r × n = ${N(P)} × ${k}% × ${n} = <b>${AED(a)}</b>.`, hint: "Simple interest is the same amount every year." }; }
  if (T === 2) { const P = h.ri(5, 50) * 1000, k = h.pick([4, 5, 6, 8]), n = h.ri(3, 8), a = P * (1 + k / 100) ** n; return { brief: `${c.client} invests ${AED(P)} at ${k}% compounded annually for ${n} years.`, facts: [["Investment", AED(P)], ["Rate", k + "% compound"], ["Term", n + " years"]], q: "What will it be worth at the end?", answer: a, unit: "AED", explain: `FV = P(1 + r)ⁿ = ${N(P)} × ${(1 + k / 100).toFixed(2)}^${n} = <b>${AED(a)}</b>.`, hint: "Compound interest: FV = P × (1 + r)ⁿ." }; }
  if (T === 3) { const I = h.ri(5, 20) * 10000, cf = [h.ri(2, 9) * 10000, h.ri(2, 9) * 10000, h.ri(2, 9) * 10000], k = h.pick([8, 10, 12]), npv = cf.reduce((s, x, i) => s + x / (1 + k / 100) ** (i + 1), -I); return { brief: `${c.client} is considering new equipment. Discount rate: ${k}%.`, table: { cols: ["Year", "Cash flow (AED)"], align: ["", "r"], rows: [["0", N(-I)], ...cf.map((x, i) => [String(i + 1), N(x)])] }, q: "What is the project's NPV?", answer: npv, unit: "AED", explain: cf.map((x, i) => `Year ${i + 1}: ${N(x)} ÷ ${(1 + k / 100).toFixed(2)}^${i + 1} = ${N(x / (1 + k / 100) ** (i + 1))}`).join("<br>") + `<br>NPV = sum − ${N(I)} = <b>${AED(npv)}</b>. ${npv > 0 ? "Positive: it creates value." : "Negative: it destroys value."}`, hint: "Discount each year's cash flow by (1 + r)^year, add them, then subtract the initial cost." }; }
  const A = h.ri(2, 6) * 10000, n = h.ri(4, 7), k = h.pick([8, 9, 10, 12]) / 100, I = Math.round(A * (1 - (1 + k) ** -n) / k * (0.8 + r() * 0.35) / 1000) * 1000, npv = A * (1 - (1 + k) ** -n) / k - I;
  return { brief: `A new branch for ${c.client} costs ${AED(I)} today and should generate ${AED(A)} a year for ${n} years. Cost of capital: ${k * 100}%.`, facts: [["Initial cost", AED(I)], ["Annual cash flow", AED(A)], ["Years", n], ["Discount rate", k * 100 + "%"]], q: "What is the NPV?", answer: npv, unit: "AED", explain: `PV of annuity = ${N(A)} × [1 − (1.${String(k * 100).padStart(2, "0")})^−${n}] ÷ ${k} = ${N(A * (1 - (1 + k) ** -n) / k)}. NPV = that − ${N(I)} = <b>${AED(npv)}</b>.`, hint: "Equal yearly cash flows are an annuity: PV = A × (1 − (1 + r)^−n) ÷ r." };
} });

def({ id: "fin_ratio", major: "Finance", kind: "calc", title: "Ratio analysis", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), cash = h.ri(5, 60) * 10000, rec = h.ri(10, 90) * 10000, inv = h.ri(10, 120) * 10000, CL = h.ri(20, 160) * 10000, eq = h.ri(80, 400) * 10000, NI = Math.round(eq * (0.04 + r() * .2) / 1000) * 1000, EBIT = Math.round(NI * (1.3 + r() * .6) / 1000) * 1000, intr = Math.round(EBIT * (0.05 + r() * .3) / 1000) * 1000;
  const table = { cols: ["Item", "AED"], align: ["", "r"], rows: [["Cash", N(cash)], ["Trade receivables", N(rec)], ["Inventory", N(inv)], ["Current liabilities", N(CL)], ["Total equity", N(eq)], ["Operating profit (EBIT)", N(EBIT)], ["Interest expense", N(intr)], ["Net profit", N(NI)]] };
  const CA = cash + rec + inv;
  const v = [null, [CA / CL, "the current ratio", `(${N(cash)} + ${N(rec)} + ${N(inv)}) ÷ ${N(CL)}`, "Current assets ÷ current liabilities.", "x"], [(cash + rec) / CL, "the quick (acid-test) ratio", `(${N(cash)} + ${N(rec)}) ÷ ${N(CL)}`, "Like the current ratio, but leave out inventory, which is slow to turn into cash.", "x"], [NI / eq * 100, "return on equity (%)", `${N(NI)} ÷ ${N(eq)} × 100`, "Net profit as a percentage of equity.", "%"], [EBIT / intr, "interest cover", `${N(EBIT)} ÷ ${N(intr)}`, "How many times operating profit covers interest.", "x"]][T];
  return { brief: `${c.client}'s bank wants ${v[1]} before renewing its credit line.`, table, q: `Calculate ${v[1]} (two decimal places).`, answer: v[0], unit: v[4], tol: .02, explain: `${v[2]} = <b>${N(v[0])}${v[4] === "%" ? "%" : "×"}</b>.`, hint: v[3] };
} });

def({ id: "fin_breakeven", major: "Finance", kind: "calc", title: "Break-even analysis", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), p = h.ri(40, 200), v = Math.round(p * (0.4 + r() * .3)), F = h.ri(5, 40) * 10000, cm = p - v;
  const facts = [["Selling price", AED(p)], ["Variable cost per unit", AED(v)], ["Fixed costs (monthly)", AED(F)]];
  if (T === 1) { const a = Math.ceil(F / cm); return { brief: `${c.client} is launching a new product line.`, facts, q: "How many units a month must it sell to break even? Round up to whole units.", answer: a, unit: "units", tol: .5, explain: `Contribution per unit = ${p} − ${v} = ${cm}. Break-even = ${N(F)} ÷ ${cm} = ${N(F / cm)}, so <b>${N(a)} units</b>.`, hint: "Each unit contributes price minus variable cost towards fixed costs." }; }
  if (T === 2) { const P = h.ri(2, 10) * 10000, a = Math.ceil((F + P) / cm); return { brief: `${c.exec} wants the new line to make ${AED(P)} profit a month.`, facts, q: "How many units must be sold each month? Round up.", answer: a, unit: "units", tol: .5, explain: `(Fixed costs + target profit) ÷ contribution = (${N(F)} + ${N(P)}) ÷ ${cm} = <b>${N(a)} units</b>.`, hint: "Treat the target profit like an extra fixed cost to cover." }; }
  if (T === 3) { const ratio = cm / p, a = F / ratio; return { brief: `${c.client} wants its break-even point in sales value, not units.`, facts, q: "What monthly revenue is needed to break even?", answer: a, unit: "AED", explain: `Contribution margin ratio = ${cm} ÷ ${p} = ${N(ratio, 4)}. Break-even revenue = ${N(F)} ÷ ${N(ratio, 4)} = <b>${AED(a)}</b>.`, hint: "Divide fixed costs by the contribution margin ratio (contribution ÷ price)." }; }
  const p2 = h.ri(40, 200), v2 = Math.round(p2 * (0.4 + r() * .3)), [a, b] = h.pick([[2, 1], [3, 1], [3, 2]]), wcm = (a * cm + b * (p2 - v2)) / (a + b), units = Math.ceil(F / wcm);
  return { brief: `${c.client} sells two products in a fixed mix of ${a}:${b}.`, table: { cols: ["", "Product A", "Product B"], align: ["", "r", "r"], rows: [["Price", N(p), N(p2)], ["Variable cost", N(v), N(v2)], ["Mix", a, b]] }, facts: [["Fixed costs (monthly)", AED(F)]], q: "How many units in total must be sold to break even? Round up.", answer: units, unit: "units", tol: .5, explain: `Weighted contribution = (${a} × ${cm} + ${b} × ${p2 - v2}) ÷ ${a + b} = ${N(wcm)}. Break-even = ${N(F)} ÷ ${N(wcm)} = <b>${N(units)} units</b> in total.`, hint: "Find a weighted-average contribution per unit using the sales mix." };
} });

def({ id: "fin_variance", major: "Finance", kind: "flag", title: "Budget variance review", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), lines = T === 1 ? ["Salaries", "Marketing", "Rent", "Utilities", "Travel", "IT costs", "Training"] : ["Revenue", "Online revenue", "Cost of sales", "Salaries", "Marketing", "Rent", "Utilities", "Travel", "IT costs"];
  const sel = h.pickN(lines, Math.min(lines.length, 5 + T)); const w = new Set(h.pickN([...sel.keys()], 1 + (T >= 2) + (T >= 4))); const rows = [], why = [];
  sel.forEach((l, i) => {
    const B = h.ri(20, 300) * 1000; let A = Math.round(B * (0.8 + r() * .4) / 100) * 100; if (A === B) A += 500; const rev = /revenue/i.test(l), diff = Math.abs(A - B);
    let fav = rev ? A > B : A < B, amt = diff;
    if (w.has(i)) { if (r() < .5 || diff === 0) { fav = !fav; why.push(`${l}: actual is ${A > B ? "above" : "below"} budget, so for ${rev ? "revenue" : "a cost"} it's ${(rev ? A > B : A < B) ? "favourable" : "adverse"}, not ${fav ? "favourable" : "adverse"}.`); } else { amt = diff + h.pick([-1, 1]) * h.ri(2, 9) * 1000; amt = Math.abs(amt); if (amt === diff) amt += 1000; why.push(`${l}: the variance should be ${N(diff)}, not ${N(amt)}.`); } }
    rows.push([l, N(B), N(A), N(amt), fav ? "F" : "A"]);
  });
  return { brief: `${c.client}'s finance team prepared this budget-vs-actual report for the board. Some variances are wrong.`, table: { cols: ["Line", "Budget", "Actual", "Variance", "F/A"], align: ["", "r", "r", "r", ""], rows }, wrong: [...w], q: "Flag every row where the variance or its label is wrong.", explain: why.join("<br>"), hint: "Variance = |actual − budget|. Higher revenue or lower costs are favourable (F); the opposite is adverse (A)." };
} });

def({ id: "fin_project", major: "Finance", kind: "mcq", title: "Choose the project", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), a = h.ri(30, 90) * 1000, b = Math.round(a * (0.4 + r() * .4) / 1000) * 1000, pa = h.ri(4, 6), pb = h.ri(2, 3), ia = h.ri(11, 15), ib = ia + h.ri(3, 8);
  const swap = r() < .5, X = swap ? "Project B" : "Project A", rows = [[X === "Project A" ? "Project A" : "Project B", N(a), pa + " years", T >= 3 ? ia + "%" : "–"], [X === "Project A" ? "Project B" : "Project A", N(b), pb + " years", T >= 3 ? ib + "%" : "–"]].sort((p, q) => p[0] < q[0] ? -1 : 1);
  return { brief: `${c.exec} can only fund one of two projects. They're mutually exclusive.`, table: { cols: ["Project", "NPV (AED)", "Payback", "IRR"], align: ["", "r", "", "r"], rows }, q: "Which project should the company choose to maximise shareholder value?", ...mcq(h, X, [X === "Project A" ? "Project B" : "Project A", "Neither: payback is too long", "Both, funded with debt"]), explain: `<b>${X}</b>: it has the higher NPV (${AED(a)}). NPV measures the value added in today's money. Payback ignores later cash flows${T >= 3 ? ", and IRR can mislead when projects differ in size or timing" : ""}.`, hint: "Which measure tells you how much value a project adds in today's money?" };
} });

def({ id: "fin_loan", major: "Finance", kind: "calc", title: "Loan repayment", min: 3, max: 4, gen(r, T, c) {
  const h = H(r), L = h.ri(10, 50) * 10000, k = h.pick([5, 6, 7, 8]) / 100, n = h.ri(3, 7), pmt = L * k / (1 - (1 + k) ** -n);
  return { brief: `${c.client} borrows ${AED(L)} at ${k * 100}% a year, repaid in equal annual instalments over ${n} years.`, facts: [["Loan", AED(L)], ["Rate", k * 100 + "%"], ["Term", n + " years"]], q: "What is the annual repayment?", answer: pmt, unit: "AED", explain: `PMT = L × r ÷ [1 − (1 + r)^−n] = ${N(L)} × ${k} ÷ [1 − ${(1 + k).toFixed(2)}^−${n}] = <b>${AED(pmt)}</b>.`, hint: "Equal repayments are an annuity. Rearrange the PV of annuity formula for the payment." };
} });

def({ id: "fin_wacc", major: "Finance", kind: "calc", title: "Cost of capital", min: 4, max: 4, gen(r, T, c) {
  const h = H(r), E = h.ri(20, 80) * 100000, D = h.ri(10, 60) * 100000, ke = h.ri(10, 16), kd = h.ri(4, 8), t = 9, w = (E * ke + D * kd * (1 - t / 100)) / (E + D);
  return { brief: `${c.client} needs a discount rate for a new investment. UAE corporate tax is 9%.`, facts: [["Market value of equity", AED(E)], ["Market value of debt", AED(D)], ["Cost of equity", ke + "%"], ["Pre-tax cost of debt", kd + "%"], ["Tax rate", t + "%"]], q: "What is the WACC (as a percentage, two decimals)?", answer: w, unit: "%", tol: .05, explain: `WACC = E/V × ke + D/V × kd × (1 − t) = ${N(E / (E + D), 3)} × ${ke}% + ${N(D / (E + D), 3)} × ${kd}% × 0.91 = <b>${N(w)}%</b>.`, hint: "Weight each source of finance by its market value, and use the after-tax cost of debt." };
} });

def({ id: "fin_ccc", major: "Finance", kind: "calc", title: "Cash conversion cycle", min: 2, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 2) { const a = h.ri(30, 90), b = h.ri(20, 70), d = h.ri(20, 60), ccc = a + b - d; return { brief: `${c.exec} wants to know how long cash is tied up in operations.`, facts: [["Days inventory outstanding", a], ["Days sales outstanding", b], ["Days payables outstanding", d]], q: "What is the cash conversion cycle in days?", answer: ccc, unit: "days", tol: .5, explain: `CCC = DIO + DSO − DPO = ${a} + ${b} − ${d} = <b>${ccc} days</b>.`, hint: "Days to sell stock, plus days to collect cash, minus days you take to pay suppliers." }; }
  const S = h.ri(200, 900) * 10000, CO = Math.round(S * (0.55 + r() * .2) / 10000) * 10000, I = Math.round(CO * h.ri(40, 100) / 365 / 1000) * 1000, R = Math.round(S * h.ri(25, 75) / 365 / 1000) * 1000, P = Math.round(CO * h.ri(20, 60) / 365 / 1000) * 1000, dio = I / CO * 365, dso = R / S * 365, dpo = P / CO * 365, ccc = dio + dso - dpo;
  return { brief: `Work out ${c.client}'s cash conversion cycle from its annual figures (use 365 days, and cost of sales for payables).`, table: { cols: ["Item", "AED"], align: ["", "r"], rows: [["Revenue", N(S)], ["Cost of sales", N(CO)], ["Inventory", N(I)], ["Trade receivables", N(R)], ["Trade payables", N(P)]] }, q: "What is the cash conversion cycle in days (one decimal)?", answer: ccc, unit: "days", tol: 1, explain: `DIO = ${N(I)} ÷ ${N(CO)} × 365 = ${N(dio, 1)}. DSO = ${N(R)} ÷ ${N(S)} × 365 = ${N(dso, 1)}. DPO = ${N(P)} ÷ ${N(CO)} × 365 = ${N(dpo, 1)}. CCC = <b>${N(ccc, 1)} days</b>.`, hint: "Convert each balance into days, then CCC = DIO + DSO − DPO." };
} });

def({ id: "fin_cap", major: "Finance", kind: "mcq", cap: true, title: "Recommend the financing", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), S = h.pick([[`${c.client} needs AED 2m every autumn to build stock for the winter season, repaid by February.`, "A revolving credit facility", "Short-term, seasonal needs suit short-term, flexible finance (the matching principle)."], [`${c.client} wants to buy the warehouse it will use for the next 25 years.`, "A long-term loan or mortgage", "A long-lived asset should be financed with long-term funding."], [`${c.client} has AED 5m of cash it won't need for three months.`, "A short-term deposit or treasury bills", "Park idle cash safely and earn something until it's needed."], [`${c.client} is a loss-making startup with heavy debt and uncertain cash flows, seeking growth funding.`, "Issue new equity", "More debt would add fixed repayments it may not meet; equity shares the risk."]]);
  return { brief: `Final meeting with Sara. ${S[0]}`, q: "What should the firm recommend?", ...mcq(h, S[1], ["A revolving credit facility", "A long-term loan or mortgage", "A short-term deposit or treasury bills", "Issue new equity", "Sell and lease back the head office"]), explain: `<b>${S[1]}</b>. ${S[2]}`, hint: "Match the length and risk of the funding to the length and risk of the need." };
} });

/* ============================== MARKETING ============================== */
def({ id: "mkt_funnel", major: "Marketing", kind: "calc", title: "Funnel metrics", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) { const V = h.ri(20, 90) * 1000, O = Math.round(V * (0.01 + r() * .03)), a = O / V * 100; return { brief: `${c.client}'s online store had ${N(V)} visitors last month and ${N(O)} orders.`, facts: [["Visitors", N(V)], ["Orders", N(O)]], q: "What is the conversion rate (%)?", answer: a, unit: "%", tol: .05, explain: `${N(O)} ÷ ${N(V)} × 100 = <b>${N(a)}%</b>.`, hint: "Orders divided by visitors, as a percentage." }; }
  if (T === 2) { const S = h.ri(20, 120) * 1000, C = h.ri(200, 1500), a = S / C; return { brief: `${c.client} spent ${AED(S)} on ads last quarter and won ${N(C)} new customers.`, facts: [["Ad spend", AED(S)], ["New customers", N(C)]], q: "What is the customer acquisition cost (CAC)?", answer: a, unit: "AED", tol: .5, explain: `CAC = ${N(S)} ÷ ${N(C)} = <b>AED ${N(a)}</b> per customer.`, hint: "Total spend divided by the customers it brought in." }; }
  if (T === 3) { const a = h.ri(80, 400), f = h.ri(2, 8), y = h.ri(2, 5), m = h.pick([30, 40, 50]), clv = a * f * y * m / 100; return { brief: `${c.exec} wants to know what a typical customer is worth over the relationship.`, facts: [["Average order value", AED(a)], ["Orders per year", f], ["Customer lifetime", y + " years"], ["Gross margin", m + "%"]], q: "What is the customer lifetime value (gross profit basis)?", answer: clv, unit: "AED", explain: `${a} × ${f} × ${y} × ${m}% = <b>${AED(clv)}</b>.`, hint: "Value per order × orders a year × years × margin." }; }
  const m = h.pick([20, 25, 30, 40, 50]), a = 100 / m;
  return { brief: `${c.client}'s products earn a ${m}% gross margin. ${c.exec} asks what return on ad spend (ROAS) a campaign needs before it stops losing money.`, facts: [["Gross margin", m + "%"]], q: "What is the break-even ROAS?", answer: a, unit: "x", tol: .02, explain: `Each AED of revenue earns ${m / 100} of gross profit, so revenue must be 1 ÷ ${m / 100} = <b>${N(a)}×</b> ad spend to cover it.`, hint: "At break-even, gross profit from the revenue equals the ad spend." };
} });

def({ id: "mkt_classify", major: "Marketing", kind: "classify", title: "Strategy sorting", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) return { brief: `${c.client}'s marketing team listed ideas for next quarter. Sort them into the marketing mix.`, q: "Which of the 4Ps does each idea belong to?", ...classify(h, 1, [["Launch a larger family-size version", "Product"], ["Add a new colour option", "Product"], ["Improve the packaging design", "Product"], ["Offer 15% off for students", "Price"], ["Introduce a monthly subscription", "Price"], ["Bundle two products at a lower total price", "Price"], ["Start selling on a delivery app", "Place"], ["Open a kiosk in a mall", "Place"], ["Partner with a supermarket chain", "Place"], ["Run an Instagram campaign", "Promotion"], ["Sponsor a local football team", "Promotion"], ["Send a loyalty email newsletter", "Promotion"]], ["Product", "Price", "Place", "Promotion"], 7), hint: "Product is what you sell, Price is what it costs, Place is where it's sold, Promotion is how you tell people." };
  if (T === 2) return { brief: `${c.exec} has growth ideas. Map each one onto the Ansoff matrix.`, q: "Which growth strategy is each idea?", ...classify(h, 1, [["Loyalty discounts so existing customers buy more often", "Market penetration"], ["Undercut competitors' prices in current stores", "Market penetration"], ["Launch the current range in Oman", "Market development"], ["Target university students with the existing range", "Market development"], ["Create a premium line for current customers", "Product development"], ["Add a new flavour for existing buyers", "Product development"], ["Open a fitness app business unrelated to current products", "Diversification"], ["Buy a hotel chain", "Diversification"]], ["Market penetration", "Market development", "Product development", "Diversification"], 7), hint: "Two questions: new or existing product? New or existing market?" };
  const prods = h.pickN(["Air fryer", "Smart kettle", "Toaster", "Juicer", "Rice cooker", "Coffee grinder", "Hand mixer", "Water filter"], 6).map(p => { const g = h.pick([h.ri(1, 7), h.ri(12, 25)]), s = h.pick([r2(0.2 + r() * .7), r2(1.2 + r() * 1.5)]); return { p, g, s, cat: g >= 10 ? (s >= 1 ? "Star" : "Question mark") : (s >= 1 ? "Cash cow" : "Dog") }; });
  return { brief: `Place ${c.client}'s products on the BCG matrix. High market growth means 10% or more; high relative share means above 1.0.`, table: { cols: ["Product", "Market growth", "Relative share"], align: ["", "r", "r"], rows: prods.map(x => [x.p, x.g + "%", x.s + "×"]) }, q: "Which BCG category is each product?", cats: ["Star", "Cash cow", "Question mark", "Dog"], items: prods.map(x => ({ text: x.p, cat: x.cat })), explain: prods.map(x => `<b>${x.p}</b>: growth ${x.g}% (${x.g >= 10 ? "high" : "low"}), share ${x.s}× (${x.s >= 1 ? "high" : "low"}) → ${x.cat}`).join("<br>"), hint: "Star = high growth, high share. Cash cow = low growth, high share. Question mark = high growth, low share. Dog = low, low." };
} });

def({ id: "mkt_campaign", major: "Marketing", kind: "flag", title: "Campaign report check", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), ch = h.pickN(["Instagram", "TikTok", "Google Search", "Billboards", "Email", "Influencers", "Radio", "Snapchat", "YouTube"], Math.min(9, 5 + T)), w = new Set(h.pickN([...ch.keys()], 1 + (T >= 2) + (T >= 3)));
  const rows = [], why = [];
  ch.forEach((n, i) => {
    const S = h.ri(5, 80) * 1000; let roas;
    if (T === 1) { roas = w.has(i) ? r2(0.3 + r() * .6) : r2(1.2 + r() * 4); const R = Math.round(S * roas); rows.push([n, N(S), N(R), N(R / S) + "×"]); if (w.has(i)) why.push(`${n}: revenue ${N(R)} is less than spend ${N(S)} (ROAS ${N(R / S)}×), so it loses money.`); }
    else { roas = r2(0.6 + r() * 4.5); const R = Math.round(S * roas), real = R / S; let shown = real; if (w.has(i)) { shown = real + h.pick([-1, 1]) * (0.6 + r() * 1.5); if (shown < 0.1) shown = real + 1.1; why.push(`${n}: ${N(R)} ÷ ${N(S)} = ${N(real)}×, not ${N(shown)}×.`); } rows.push([n, N(S), N(R), N(shown) + "×"]); }
  });
  return { brief: T === 1 ? `${c.exec} wants to cut the channels that lose money: revenue lower than what was spent.` : `${c.client}'s agency sent this report. Someone typed some ROAS figures by hand. ROAS = revenue ÷ spend.`, table: { cols: ["Channel", "Spend (AED)", "Revenue (AED)", "ROAS"], align: ["", "r", "r", "r"], rows }, wrong: [...w], q: T === 1 ? "Flag every channel that loses money." : "Flag every row where the ROAS is wrong.", explain: why.join("<br>"), hint: T === 1 ? "Losing money means revenue below spend: ROAS under 1." : "Recalculate revenue ÷ spend for each row." };
} });

def({ id: "mkt_nps", major: "Marketing", kind: "calc", title: "Net Promoter Score", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), p = h.ri(80, 400), pa = h.ri(50, 250), d = h.ri(20, 220), tot = p + pa + d, a = (p - d) / tot * 100;
  return { brief: `${c.client} surveyed customers: "How likely are you to recommend us?" (0–10).`, table: { cols: ["Score", "Respondents"], align: ["", "r"], rows: [["9–10 (promoters)", p], ["7–8 (passives)", pa], ["0–6 (detractors)", d]] }, q: "What is the NPS (one decimal)?", answer: a, unit: "", tol: .2, explain: `% promoters − % detractors = ${N(p / tot * 100, 1)} − ${N(d / tot * 100, 1)} = <b>${N(a, 1)}</b>.`, hint: "NPS = % promoters − % detractors, out of all respondents." };
} });

def({ id: "mkt_elastic", major: "Marketing", kind: "mcq", title: "Price change advice", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), e = r2(h.pick([0.2 + r() * .6, 1.3 + r() * 1.5])), up = r() < .6, x = h.ri(5, 15), elastic = e > 1;
  const ans = up ? (elastic ? "Revenue falls" : "Revenue rises") : (elastic ? "Revenue rises" : "Revenue falls");
  return { brief: `Research puts the price elasticity of demand for ${c.client}'s best-seller at −${e}. ${c.exec} plans to ${up ? "raise" : "cut"} its price by ${x}%.`, q: "What happens to total revenue?", ...mcq(h, ans, ["Revenue rises", "Revenue falls", "Revenue stays the same", "Can't tell without cost data"]), explain: `<b>${ans}</b>. Demand is ${elastic ? "elastic (|e| > 1): quantity changes by more than the price" : "inelastic (|e| < 1): quantity changes by less than the price"}. A ${x}% price ${up ? "rise" : "cut"} moves quantity about ${N(e * x, 1)}% the other way.`, hint: "Compare the size of the elasticity with 1." };
} });

def({ id: "mkt_pricing", major: "Marketing", kind: "mcq", title: "Pick a pricing strategy", min: 1, max: 3, gen(r, T, c) {
  const h = H(r), S = h.pick([["A new gadget is first to market and early adopters will pay a lot for it.", "Price skimming"], ["The client is entering a crowded market and wants market share fast.", "Penetration pricing"], ["Products are priced at AED 99.99 instead of AED 100.", "Psychological pricing"], ["A luxury line is priced high to signal exclusivity.", "Premium pricing"], ["A blender, jug and recipe book are sold together at a discount.", "Bundle pricing"]]);
  return { brief: `${c.exec} describes a plan: "${S[0]}"`, q: "Which pricing strategy is this?", ...mcq(h, S[1], ["Price skimming", "Penetration pricing", "Psychological pricing", "Premium pricing", "Bundle pricing"]), explain: `<b>${S[1]}</b>.`, hint: "Is the price high to start, low to grab share, just under a round number, high for status, or a package deal?" };
} });

def({ id: "mkt_share", major: "Marketing", kind: "calc", title: "Market share", min: 1, max: 2, gen(r, T, c) {
  const h = H(r), S = h.ri(5, 60) * 100000, M = S * h.ri(5, 25), L = Math.round(S * (0.6 + r() * 2.5) / 1000) * 1000;
  if (T === 1) return { brief: `The UAE market for ${c.ind} was ${AED(M)} last year. ${c.client} sold ${AED(S)}.`, facts: [["Market size", AED(M)], ["Client sales", AED(S)]], q: "What is the client's market share (%)?", answer: S / M * 100, unit: "%", tol: .05, explain: `${N(S)} ÷ ${N(M)} × 100 = <b>${N(S / M * 100)}%</b>.`, hint: "Client sales as a share of the whole market." };
  return { brief: `${c.client} sold ${AED(S)}. The market leader sold ${AED(L)}.`, facts: [["Client sales", AED(S)], ["Leader's sales", AED(L)]], q: "What is the client's relative market share (two decimals)?", answer: S / L, unit: "x", tol: .02, explain: `${N(S)} ÷ ${N(L)} = <b>${N(S / L)}×</b>. ${S / L >= 1 ? "Above 1: the client is the leader." : "Below 1: the client trails the leader."}`, hint: "Divide the client's sales by the biggest competitor's." };
} });

def({ id: "mkt_cap", major: "Marketing", kind: "mcq", cap: true, title: "Where to put the budget", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), ch = h.pickN(["Instagram", "TikTok", "Google Search", "Email", "Influencers", "Snapchat"], 4).map(n => ({ n, roas: r2(1.2 + r() * 4), cac: h.ri(30, 180) }));
  ch.sort((a, b) => b.roas - a.roas); let ans = ch[0].n, note = "";
  if (T >= 3) { ch[0].sat = true; ans = ch[1].n; note = ` ${ch[0].n} has the best ROAS, but its audience is saturated, so extra spend will earn much less.`; }
  return { brief: `Sara asks for one recommendation: which channel should get ${c.client}'s extra AED 200,000?`, table: { cols: ["Channel", "ROAS", "CAC (AED)", "Note"], align: ["", "r", "r", ""], rows: h.shuf(ch).map(x => [x.n, x.roas + "×", x.cac, x.sat ? "Audience saturated: costs rising fast" : "Room to scale"]) }, q: "Which channel should get the extra budget?", ...mcq(h, ans, ch.map(x => x.n)), explain: `<b>${ans}</b>: the highest return that can still scale.${note}`, hint: "Look for the best return on the next dirham, not the last one." };
} });

/* ============================== MANAGEMENT ============================== */
def({ id: "mgt_swot", major: "Management", kind: "classify", title: "SWOT analysis", min: 1, max: 3, gen(r, T, c) {
  const h = H(r);
  return { brief: `${c.exec} brainstormed with the leadership team. Turn their notes into a SWOT.`, q: "Is each note a Strength, Weakness, Opportunity or Threat?", ...classify(h, 1, [["Strong brand recognition in Sharjah", "Strength", 1, "Internal and positive"], ["Experienced, loyal staff", "Strength"], ["Its own delivery fleet", "Strength"], ["An outdated stock system", "Weakness", 1, "Internal and negative"], ["High staff turnover in the warehouse", "Weakness"], ["Very few online sales", "Weakness"], ["Fast-growing e-commerce in the UAE", "Opportunity", 1, "External and positive"], ["New residential communities opening nearby", "Opportunity"], ["A trade fair bringing in new regional buyers", "Opportunity"], ["A large competitor opening next door", "Threat", 1, "External and negative"], ["Rising shipping costs", "Threat"], ["Stricter import rules for its products", "Threat"]], ["Strength", "Weakness", "Opportunity", "Threat"], Math.min(9, 6 + T)), hint: "Strengths and weaknesses are inside the company. Opportunities and threats come from outside." };
} });

def({ id: "mgt_theory", major: "Management", kind: "classify", title: "Management theory", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) return { brief: `Sort ${c.exec}'s weekly activities into the four functions of management.`, q: "Which function is each activity?", ...classify(h, 1, [["Set next year's sales targets", "Planning"], ["Write a 3-year expansion strategy", "Planning"], ["Draw up the organisation chart", "Organizing"], ["Decide who reports to the new supervisor", "Organizing"], ["Motivate the team before a busy season", "Leading"], ["Coach a struggling employee", "Leading"], ["Compare actual output with targets", "Controlling"], ["Review monthly budget variances", "Controlling"]], ["Planning", "Organizing", "Leading", "Controlling"], 7), hint: "Planning sets goals, organizing arranges people and resources, leading influences people, controlling checks results." };
  if (T === 2) return { brief: `Staff survey results at ${c.client}. Classify each factor using Herzberg's two-factor theory.`, q: "Is each factor a motivator or a hygiene factor?", ...classify(h, 1, [["Recognition for great work", "Motivator"], ["Chance of promotion", "Motivator"], ["Interesting, challenging work", "Motivator"], ["Responsibility for a project", "Motivator"], ["Salary", "Hygiene factor"], ["Office air conditioning", "Hygiene factor"], ["Company policies", "Hygiene factor"], ["Job security", "Hygiene factor"]], ["Motivator", "Hygiene factor"], 7), hint: "Hygiene factors prevent dissatisfaction when they're right. Motivators actively drive satisfaction." };
  return { brief: `Sara describes the project teams she's seen at ${c.client}. Place each on Tuckman's model.`, q: "Which stage is each team in?", ...classify(h, 1, [["Members are polite but unsure of their roles", "Forming"], ["A new team is meeting for the first time", "Forming"], ["Arguments break out over how to split the work", "Storming"], ["Two members challenge the leader's plan", "Storming"], ["The team agrees on ways of working", "Norming"], ["Members start supporting each other's work", "Norming"], ["The team works independently and beats its targets", "Performing"], ["The project ends and the team disbands", "Adjourning"]], ["Forming", "Storming", "Norming", "Performing", "Adjourning"], 7), hint: "Forming, storming, norming, performing, adjourning." };
} });

def({ id: "mgt_roster", major: "Management", kind: "flag", title: "Shift roster check", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), names = h.pickN(["Ahmed", "Priya", "Joseph", "Mariam", "Ravi", "Sofia", "Hassan", "Grace", "Imran", "Leila", "Daniel", "Noor"], Math.min(10, 6 + T));
  const w = new Set(h.pickN([...names.keys()], 1 + (T >= 2) + (T >= 3))), rows = [], why = [];
  names.forEach((n, i) => {
    let days = h.ri(5, 6), sh = h.ri(7, 9);
    if (w.has(i)) { const kind = h.pick(T >= 2 ? ["hours", "days", "shift"] : ["hours", "days"]); if (kind === "hours") { days = 6; sh = 9; why.push(`${n}: ${days * sh} hours is over the 48-hour limit.`); } else if (kind === "days") { days = 7; sh = 6; why.push(`${n}: works 7 days, with no rest day.`); } else { days = 4; sh = 11; why.push(`${n}: an ${sh}-hour shift is over the 10-hour limit.`); } }
    else if (days * sh > 48) sh = Math.floor(48 / days);
    rows.push([n, days, sh + " h", days * sh + " h"]);
  });
  return { brief: `${c.client}'s policy: no more than 48 hours a week, at least one rest day${T >= 2 ? ", and no single shift over 10 hours" : ""}. Check next week's roster.`, table: { cols: ["Employee", "Days", "Shift length", "Weekly hours"], align: ["", "r", "r", "r"], rows }, wrong: [...w], q: "Flag every employee whose roster breaks the policy.", explain: why.join("<br>"), hint: "Check each rule against each row: weekly hours, number of days, and shift length." };
} });

def({ id: "mgt_ops", major: "Management", kind: "calc", title: "Operations metrics", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) { const C = h.ri(20, 60) * 100, A = Math.round(C * (0.55 + r() * .4)); return { brief: `${c.client}'s packing line can handle ${N(C)} orders a week. Last week it packed ${N(A)}.`, facts: [["Capacity", N(C) + " orders"], ["Actual output", N(A) + " orders"]], q: "What was capacity utilisation (%)?", answer: A / C * 100, unit: "%", tol: .1, explain: `${N(A)} ÷ ${N(C)} × 100 = <b>${N(A / C * 100)}%</b>.`, hint: "Actual output as a percentage of capacity." }; }
  if (T === 2) { const s = h.ri(40, 120), e = s + h.ri(-10, 15), L = h.ri(6, 30), a = L / ((s + e) / 2) * 100; return { brief: `${c.exec} is worried about staff turnover.`, facts: [["Staff at 1 January", s], ["Staff at 31 December", e], ["Leavers during the year", L]], q: "What was the annual staff turnover rate (%)?", answer: a, unit: "%", tol: .1, explain: `Average headcount = (${s} + ${e}) ÷ 2 = ${(s + e) / 2}. Turnover = ${L} ÷ ${(s + e) / 2} × 100 = <b>${N(a)}%</b>.`, hint: "Leavers divided by average headcount." }; }
  if (T === 3) { const D = h.ri(20, 120) * 100, S = h.ri(100, 600), Hc = h.ri(4, 30), q = Math.sqrt(2 * D * S / Hc); return { brief: `${c.client} wants the economic order quantity for its best-selling ${c.prod.replace(/s$/, "")}.`, facts: [["Annual demand", N(D) + " units"], ["Cost per order", AED(S)], ["Holding cost per unit per year", AED(Hc)]], q: "What is the EOQ (units)?", answer: q, unit: "units", tol: Math.max(1, q * .01), explain: `EOQ = √(2DS ÷ H) = √(2 × ${N(D)} × ${S} ÷ ${Hc}) = <b>${N(q, 0)} units</b>.`, hint: "EOQ = square root of (2 × demand × order cost ÷ holding cost)." }; }
  const d = h.ri(20, 90), l = h.ri(3, 12), ss = h.ri(5, 30) * 10, rop = d * l + ss;
  return { brief: `${c.client} needs a reorder point for ${c.prod}.`, facts: [["Daily demand", d + " units"], ["Supplier lead time", l + " days"], ["Safety stock", ss + " units"]], q: "At what stock level should it reorder?", answer: rop, unit: "units", tol: .5, explain: `${d} × ${l} + ${ss} = <b>${N(rop)} units</b>.`, hint: "Demand during the lead time, plus the safety buffer." };
} });

def({ id: "mgt_cpm", major: "Management", kind: "calc", title: "Critical path", min: 3, max: 4, gen(r, T, c) {
  const h = H(r), d = { A: h.ri(2, 6), B: h.ri(3, 9), C: h.ri(2, 8), D: h.ri(2, 7), E: h.ri(3, 9), F: h.ri(1, 5) }, pre = { A: [], B: ["A"], C: ["A"], D: T >= 4 ? ["B", "C"] : ["B"], E: ["C"], F: ["D", "E"] };
  const ef = {}; for (const k of "ABCDEF") ef[k] = d[k] + Math.max(0, ...pre[k].map(p => ef[p]));
  const names = { A: "Sign the lease", B: "Fit out the store", C: "Hire staff", D: "Install shelving", E: "Train staff", F: "Stock and open" };
  return { brief: `${c.client} is opening a new branch. Here are the activities.`, table: { cols: ["Activity", "Days", "Depends on"], align: ["", "r", ""], rows: "ABCDEF".split("").map(k => [`${k}: ${names[k]}`, d[k], pre[k].join(", ") || "–"]) }, q: "What is the minimum number of days to open the store?", answer: ef.F, unit: "days", tol: .5, explain: "Earliest finish times: " + "ABCDEF".split("").map(k => `${k} ${ef[k]}`).join(", ") + `. The project takes <b>${ef.F} days</b>, the length of the longest (critical) path.`, hint: "Work forwards: each activity finishes at its own duration plus the latest finish of anything it depends on." };
} });

def({ id: "mgt_lead", major: "Management", kind: "mcq", title: "Leadership style", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), S = h.pick([["During a fire alarm, the supervisor gives clear orders with no discussion.", "Autocratic"], ["Before redesigning the office, the manager asks the whole team to vote on layouts.", "Democratic"], ["A team of senior researchers is left to set their own goals and methods.", "Laissez-faire"], ["The CEO inspires staff with a vision of becoming the region's most trusted brand.", "Transformational"], ["Staff get a bonus for every monthly target they hit, and nothing extra beyond that.", "Transactional"]]);
  return { brief: `${c.exec} describes how things work around here: "${S[0]}"`, q: "Which leadership style is this?", ...mcq(h, S[1], ["Autocratic", "Democratic", "Laissez-faire", "Transformational", "Transactional"]), explain: `<b>${S[1]}</b>.`, hint: "Who makes the decision, and what drives people: orders, votes, freedom, vision or rewards?" };
} });

def({ id: "mgt_count", major: "Management", kind: "count", title: "Stock accuracy check", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), k = h.ri(1, 5), sys = (c.bay + k) * c.per, acc = c.bay * c.per / sys * 100;
  const facts = [["Item", c.prod], ["Units per pallet", N(c.per)], ["System quantity", N(sys) + " units"]];
  if (T === 1) return { brief: `Go to Bay C in the warehouse and count the pallets of ${c.prod} on the racks. Some slots are empty.`, facts, q: "How many pallets are in Bay C?", answer: c.bay, unit: "pallets", tol: .5, explain: `There are <b>${c.bay} pallets</b> (${N(c.bay * c.per)} units). The system expects ${sys / c.per}.`, hint: "Walk along the rack and count each level. The empty slots are gaps." };
  return { brief: `Go to Bay C and count the pallets of ${c.prod}. Then measure how accurate the stock system is.`, facts, q: "What is stock record accuracy for this item (counted ÷ system, %)?", answer: acc, unit: "%", tol: .1, explain: `Counted ${c.bay} × ${c.per} = ${N(c.bay * c.per)}. Accuracy = ${N(c.bay * c.per)} ÷ ${N(sys)} × 100 = <b>${N(acc)}%</b>.`, hint: "Physical units ÷ system units × 100." };
} });

def({ id: "mgt_cap", major: "Management", kind: "mcq", cap: true, title: "Fix the bottleneck", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), steps = ["Receiving", "Picking", "Packing", "Quality check", "Dispatch"].map(s => ({ s, cap: h.ri(60, 140) })); const min = steps.reduce((a, b) => a.cap <= b.cap ? a : b);
  steps.forEach(x => { if (x !== min && x.cap - min.cap < 8) x.cap += 10; });
  return { brief: `Sara needs one recommendation for ${c.client}'s warehouse. Orders flow through every step in order.`, table: { cols: ["Step", "Capacity (orders/hour)"], align: ["", "r"], rows: steps.map(x => [x.s, x.cap]) }, q: "Which step should get extra investment first?", ...mcq(h, min.s, steps.map(x => x.s)), explain: `<b>${min.s}</b> is the bottleneck at ${min.cap} orders an hour, so the whole warehouse can't go faster than that. Improving any other step adds nothing until this one improves.`, hint: "A chain is only as fast as its slowest step." };
} });

/* ============================== ECONOMICS ============================== */
def({ id: "eco_elastic", major: "Economics", kind: "calc", title: "Elasticity estimate", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T <= 2) { const P1 = h.ri(20, 100), P2 = P1 + h.ri(2, 15), Q1 = h.ri(10, 50) * 100, Q2 = Math.round(Q1 * (1 - (0.05 + r() * .5))); const e = T === 1 ? ((Q2 - Q1) / Q1) / ((P2 - P1) / P1) : ((Q2 - Q1) / ((Q1 + Q2) / 2)) / ((P2 - P1) / ((P1 + P2) / 2));
    return { brief: `${c.client} raised a price from AED ${P1} to AED ${P2}. Monthly sales fell from ${N(Q1)} to ${N(Q2)} units.`, facts: [["Old price", "AED " + P1], ["New price", "AED " + P2], ["Old quantity", N(Q1)], ["New quantity", N(Q2)]], q: `What is the price elasticity of demand${T === 2 ? " (midpoint method)" : " (use the original values)"}? Two decimals.`, answer: e, unit: "", tol: .03, absOk: true, explain: T === 1 ? `%ΔQ = ${N((Q2 - Q1) / Q1 * 100)}%, %ΔP = ${N((P2 - P1) / P1 * 100)}%. PED = <b>${N(e)}</b>. ${Math.abs(e) > 1 ? "Elastic." : "Inelastic."}` : `Using averages: %ΔQ = ${N((Q2 - Q1) / ((Q1 + Q2) / 2) * 100)}%, %ΔP = ${N((P2 - P1) / ((P1 + P2) / 2) * 100)}%. PED = <b>${N(e)}</b>.`, hint: T === 1 ? "PED = % change in quantity ÷ % change in price." : "Midpoint: divide each change by the average of the old and new values." }; }
  if (T === 3) { const x = h.ri(4, 12), y = r2(h.pick([-1, 1]) * (2 + r() * 18)), e = y / x; return { brief: `Household incomes in ${c.client}'s market rose ${x}%. Demand for its ${c.prod} changed by ${y > 0 ? "+" : ""}${y}%.`, facts: [["Income change", "+" + x + "%"], ["Demand change", (y > 0 ? "+" : "") + y + "%"]], q: "What is the income elasticity of demand? Two decimals, keep the sign.", answer: e, unit: "", tol: .03, explain: `${y} ÷ ${x} = <b>${N(e)}</b>: ${e < 0 ? "an inferior good" : e > 1 ? "a luxury (normal) good" : "a necessity (normal) good"}.`, hint: "% change in demand ÷ % change in income. The sign matters." }; }
  const x = h.ri(5, 20), y = r2(x * (0.3 + r() * 1.5)), e = y / x;
  return { brief: `A competitor raised the price of a rival product by ${x}%. Demand for ${c.client}'s ${c.prod} rose ${y}%.`, facts: [["Rival price change", "+" + x + "%"], ["Client demand change", "+" + y + "%"]], q: "What is the cross-price elasticity? Two decimals.", answer: e, unit: "", tol: .03, explain: `${y} ÷ ${x} = <b>${N(e)}</b>. Positive, so the products are substitutes.`, hint: "% change in demand for this good ÷ % change in the other good's price." };
} });

def({ id: "eco_cpi", major: "Economics", kind: "calc", title: "Inflation and real values", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) { const a = r2(100 + r() * 20), b = r2(a * (1 + (0.5 + r() * 5) / 100)), i = (b - a) / a * 100; return { brief: `${c.exec} wants to know how fast prices rose last year.`, facts: [["CPI last year", a], ["CPI this year", b]], q: "What was the inflation rate (%)?", answer: i, unit: "%", tol: .05, explain: `(${b} − ${a}) ÷ ${a} × 100 = <b>${N(i)}%</b>.`, hint: "Percentage change in the price index." }; }
  if (T === 2) { const n = r2(2 + r() * 8), i = r2(1 + r() * 5), rr = ((1 + n / 100) / (1 + i / 100) - 1) * 100; return { brief: `${c.client}'s staff got a ${n}% pay rise. Inflation was ${i}%.`, facts: [["Pay rise", n + "%"], ["Inflation", i + "%"]], q: "What was the real pay growth (%)?", answer: rr, alt: n - i, unit: "%", tol: .05, explain: `Real growth = (${N(1 + n / 100, 4)} ÷ ${N(1 + i / 100, 4)} − 1) × 100 = <b>${N(rr)}%</b> (roughly ${N(n - i)}%).`, hint: "Real ≈ nominal − inflation. Exactly: (1 + nominal) ÷ (1 + inflation) − 1." }; }
  const nom = h.ri(300, 900), d = r2(100 + r() * 25), real = nom / d * 100;
  return { brief: `An economist at ${c.client} needs real output to compare with an earlier year.`, facts: [["Nominal GDP", "AED " + nom + " bn"], ["GDP deflator", d]], q: "What is real GDP (AED bn, one decimal)?", answer: real, unit: "AED bn", tol: .2, explain: `${nom} ÷ ${d} × 100 = <b>${N(real, 1)} bn</b>.`, hint: "Real = nominal ÷ deflator × 100." };
} });

def({ id: "eco_gdp", major: "Economics", kind: "calc", title: "National output", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) { const C = h.ri(200, 600), I = h.ri(60, 250), G = h.ri(80, 300), X = h.ri(300, 900), M = h.ri(250, 800), y = C + I + G + X - M; return { brief: `${c.client} is sizing a market. Here's an economy's annual spending (AED bn).`, facts: [["Consumption", C], ["Investment", I], ["Government spending", G], ["Exports", X], ["Imports", M]], q: "What is GDP (AED bn)?", answer: y, unit: "AED bn", tol: .5, explain: `C + I + G + (X − M) = ${C} + ${I} + ${G} + (${X} − ${M}) = <b>${y} bn</b>.`, hint: "GDP = C + I + G + net exports." }; }
  if (T === 2) { const y = h.ri(400, 1800), p = r2(3 + r() * 8), pc = y * 1e9 / (p * 1e6); return { brief: `${c.exec} wants income per person for a market entry study.`, facts: [["GDP", "AED " + y + " bn"], ["Population", p + " million"]], q: "What is GDP per capita (AED)?", answer: pc, unit: "AED", tol: pc * .005, explain: `${y} bn ÷ ${p} m = <b>${AED(pc)}</b> per person.`, hint: "Watch the units: billions divided by millions." }; }
  if (T === 3) { const mpc = h.pick([.6, .7, .75, .8]), g = h.ri(2, 20), d = g / (1 - mpc); return { brief: `The government plans an extra AED ${g} bn of infrastructure spending. ${c.client} wants the knock-on effect.`, facts: [["Extra spending", "AED " + g + " bn"], ["Marginal propensity to consume", mpc]], q: "What is the total increase in GDP (AED bn), using the simple multiplier?", answer: d, unit: "AED bn", tol: .1, explain: `Multiplier = 1 ÷ (1 − ${mpc}) = ${N(1 / (1 - mpc))}. ΔGDP = ${g} × ${N(1 / (1 - mpc))} = <b>${N(d)} bn</b>.`, hint: "Multiplier = 1 ÷ (1 − MPC)." }; }
  const mpc = h.pick([.7, .75, .8, .85]), t = h.pick([.05, .1, .15]), m = h.pick([.1, .2, .3]), g = h.ri(2, 20), k = 1 / (1 - mpc * (1 - t) + m), d = g * k;
  return { brief: `In an open economy with taxes, the government adds AED ${g} bn of spending.`, facts: [["Extra spending", "AED " + g + " bn"], ["MPC", mpc], ["Tax rate", t * 100 + "%"], ["Marginal propensity to import", m]], q: "What is the change in GDP (AED bn)?", answer: d, unit: "AED bn", tol: .1, explain: `k = 1 ÷ (1 − ${mpc} × (1 − ${t}) + ${m}) = ${N(k, 3)}. ΔGDP = ${g} × ${N(k, 3)} = <b>${N(d)} bn</b>.`, hint: "Leakages (saving, tax, imports) shrink the multiplier: k = 1 ÷ (1 − MPC(1 − t) + MPM)." };
} });

def({ id: "eco_classify", major: "Economics", kind: "classify", title: "Economic concepts", min: 1, max: 4, gen(r, T, c) {
  const h = H(r);
  if (T === 1) return { brief: `${c.exec} saw these headlines. Sort each policy by type.`, q: "Is each policy fiscal, monetary or supply-side?", ...classify(h, 1, [["Cut the corporate tax rate", "Fiscal"], ["Spend more on new roads", "Fiscal"], ["Raise VAT", "Fiscal"], ["Raise the central bank's base rate", "Monetary"], ["Buy government bonds to inject money", "Monetary"], ["Change banks' reserve requirements", "Monetary"], ["Fund vocational training", "Supply-side"], ["Cut red tape for new businesses", "Supply-side"]], ["Fiscal", "Monetary", "Supply-side"], 7), hint: "Fiscal = government taxes and spending. Monetary = interest rates and money supply. Supply-side = boosting productive capacity." };
  return { brief: `${c.client} is mapping its competitive landscape. Classify each market.`, q: "Which market structure is each?", ...classify(h, 1, [["Thousands of farmers selling identical tomatoes", "Perfect competition"], ["Currency traders dealing in an identical product", "Perfect competition"], ["Many cafés with slightly different menus", "Monopolistic competition"], ["Many hair salons, each with its own style", "Monopolistic competition"], ["Three telecom providers dominate the country", "Oligopoly"], ["A handful of airlines fly a route", "Oligopoly"], ["The only water supplier in a city", "Monopoly"], ["A patented drug with no substitutes", "Monopoly"]], ["Perfect competition", "Monopolistic competition", "Oligopoly", "Monopoly"], 7), hint: "How many sellers, and how different are their products?" };
} });

def({ id: "eco_macro", major: "Economics", kind: "mcq", title: "Macro briefing", min: 1, max: 4, gen(r, T, c) {
  const h = H(r), S = h.pick([["The US Federal Reserve raises interest rates. The dirham is pegged to the US dollar.", "The UAE Central Bank usually raises its base rate too", ["The UAE Central Bank usually raises its base rate too", "The dirham strengthens against the dollar", "The UAE Central Bank must cut rates", "Nothing changes for UAE borrowers"], "The peg means UAE rates generally follow US rates to keep the AED/USD rate stable."], ["The government sets a rent cap below the market rent.", "A shortage of rental homes", ["A shortage of rental homes", "A surplus of rental homes", "Higher quality homes", "No effect on supply"], "A binding price ceiling below equilibrium makes demand exceed supply."], ["A minimum wage is set above the market wage for unskilled work.", "A surplus of labour (some unemployment)", ["A surplus of labour (some unemployment)", "A shortage of workers", "Lower wages overall", "No effect"], "A binding price floor makes supply of labour exceed demand."], ["In a recession, the government increases spending on projects.", "Expansionary fiscal policy", ["Expansionary fiscal policy", "Contractionary fiscal policy", "Expansionary monetary policy", "Supply-side policy"], "More government spending boosts aggregate demand."], ["A central bank wants to bring down high inflation.", "Raise interest rates", ["Raise interest rates", "Cut interest rates", "Print more money", "Cut taxes"], "Higher rates cool borrowing and spending."], ["A tariff is placed on imported cars.", "Car prices rise for buyers", ["Car prices rise for buyers", "Car prices fall for buyers", "Imports rise", "Domestic producers lose sales"], "The tariff raises the cost of imports and shields domestic producers."]]);
  return { brief: `${c.exec} asks you a quick question: "${S[0]}"`, q: "What's the most likely result?", ...mcq(h, S[1], S[2]), explain: `<b>${S[1]}</b>. ${S[3]}`, hint: "Think about which curve or which rate moves first." };
} });

def({ id: "eco_compadv", major: "Economics", kind: "mcq", title: "Comparative advantage", min: 2, max: 4, gen(r, T, c) {
  const h = H(r); let a1, a2, b1, b2; do { a1 = h.ri(4, 12); a2 = h.ri(4, 12); b1 = h.ri(2, 10); b2 = h.ri(2, 10); } while (Math.abs(a2 / a1 - b2 / b1) < .3);
  const aCloth = a2 / a1 < b2 / b1;
  const ans = aCloth ? "Country A makes cloth, Country B makes dates" : "Country A makes dates, Country B makes cloth";
  return { brief: `${c.client} is studying trade between two countries. Output per worker per day:`, table: { cols: ["", "Cloth (rolls)", "Dates (crates)"], align: ["", "r", "r"], rows: [["Country A", a1, a2], ["Country B", b1, b2]] }, q: "How should they specialise?", ...mcq(h, ans, ["Country A makes cloth, Country B makes dates", "Country A makes dates, Country B makes cloth", "Country A makes both", "Neither gains from trade"]), explain: `Opportunity cost of 1 roll of cloth: A gives up ${N(a2 / a1)} crates of dates, B gives up ${N(b2 / b1)}. Country ${aCloth ? "A" : "B"} gives up less, so it has the comparative advantage in cloth. So <b>${ans}</b>.`, hint: "Compare opportunity costs, not absolute output." };
} });

def({ id: "eco_flag", major: "Economics", kind: "flag", title: "Indicator table check", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), n = Math.min(9, 5 + T), w = new Set(h.pickN([...Array(n).keys()].slice(1), 1 + (T >= 3))); let v = h.ri(300, 600); const rows = [], why = [];
  for (let i = 0; i < n; i++) {
    const y = 2016 + i; let g = "–";
    if (i > 0) { const prev = v; v = Math.round(v * (1 + (-.03 + r() * .09)) * 10) / 10; const real = (v - prev) / prev * 100; let shown = real; if (w.has(i)) { shown = real + h.pick([-1, 1]) * (1 + r() * 3); why.push(`${y}: (${v} − ${prev}) ÷ ${prev} = ${N(real, 1)}%, not ${N(shown, 1)}%.`); } g = N(shown, 1) + "%"; }
    rows.push([String(y), N(v, 1), g]);
  }
  return { brief: `An intern at ${c.client} built this table of non-oil GDP (AED bn) and growth rates. Check the growth column.`, table: { cols: ["Year", "GDP (AED bn)", "Growth"], align: ["", "r", "r"], rows }, wrong: [...w], q: "Flag every year with a wrong growth rate.", explain: why.join("<br>"), hint: "Growth = (this year − last year) ÷ last year. Allow for rounding to one decimal." };
} });

def({ id: "eco_cap", major: "Economics", kind: "mcq", cap: true, title: "Revenue strategy", min: 2, max: 4, gen(r, T, c) {
  const h = H(r), e1 = r2(0.2 + r() * .6), e2 = r2(1.4 + r() * 1.5), p1 = h.pick(["bottled water", "rice", "cooking oil", "school uniforms"]), p2 = h.pick(["designer handbags", "sports cars", "luxury watches", "premium perfume"]);
  const ans = `Raise the price of ${p1}`;
  return { brief: `Sara needs one recommendation. ${c.client} can raise the price of one product line by 10% to grow revenue.`, table: { cols: ["Product", "Price elasticity"], align: ["", "r"], rows: [[p1, "−" + e1], [p2, "−" + e2]] }, q: "Which price should it raise?", ...mcq(h, ans, [ans, `Raise the price of ${p2}`, "Raise both by 5%", "Neither: revenue always falls when price rises"]), explain: `<b>${ans}</b>. Its demand is inelastic (${e1} < 1), so a 10% rise cuts quantity by only about ${N(e1 * 10, 1)}% and revenue goes up. ${p2} is elastic: about ${N(e2 * 10, 1)}% of sales would be lost.`, hint: "Revenue rises with price only where demand is inelastic." };
} });

const TEMPLATES = T_;
const TPL = Object.fromEntries(T_.map(t => [t.id, t]));
