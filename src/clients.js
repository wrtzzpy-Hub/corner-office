/* ============================== CLIENTS WHO REMEMBER YOU, THE RIVAL FIRM, DEALS BETWEEN COMPANIES ============================== */
const RIVAL = "Falcon Advisory";
const LEGENDS = ["Burj Crown Holdings", "Royal Pearl Group", "Golden Falcon Ventures", "Emerald Sands Resorts", "Atlas Sky Airlines", "Sultan & Sons Trading"];
const SIZE_NAMES = ["Start-up", "Small business", "Growing company", "Big company", "Market leader"];
if (!save.clientsBy) save.clientsBy = { casual: {}, student: {} };
if (!save.dealsBy) save.dealsBy = { casual: [], student: [] };
const clientsMap = () => save.clientsBy[save.mode] || (save.clientsBy[save.mode] = {});
const dealsList = () => save.dealsBy[save.mode] || (save.dealsBy[save.mode] = []);
const activeClients = () => Object.values(clientsMap()).filter(c => c.status === "active");
const sizeOf = trust => Math.max(0, Math.min(4, Math.floor(trust / 22)));
const trustLabel = t => t >= 80 ? "Loyal client" : t >= 60 ? "Regular client" : t >= 35 ? "New client" : "Unhappy client";
BADGES.push({ id: "dealmaker", ic: "🤝", name: "Dealmaker", how: "Close a deal between two companies" }, { id: "loyal", ic: "💎", name: "Trusted adviser", how: "Get a client's trust to 80" }, { id: "rival", ic: "🥊", name: "Rival beaten", how: "Beat Falcon Advisory in a pitch" });
for (const b of BADGES) BADGE[b.id] = b;

/* Called from newEngagement: decide whether this job is for a returning client, and whether the rival is pitching. */
function chooseClient(eng, h, r) {
  if (eng.daily) return;
  const act = activeClients();
  if (act.length >= 2 && r() < .45) {
    const pool = act.flatMap(c => Array(1 + Math.floor(c.trust / 25)).fill(c)), c = h.pick(pool), ind = INDUSTRIES[c.ind], ex = EXECS[c.ex];
    eng.client = { name: c.name, ind: ind.ind, prod: ind.prod, cost: ind.cost, per: ind.per, stripe: ind.stripe, exec: ex[0], g: ex[1], role: eng.client.role };
    eng.palette = c.palette; eng.returning = true; return;
  }
  const taken = new Set(Object.keys(clientsMap()));
  for (let k = 0; k < 30 && taken.has(eng.client.name); k++) eng.client.name = h.pick(NAMES) + " " + INDUSTRIES.find(i => i.ind === eng.client.ind).sfx;
  const freeLegends = LEGENDS.filter(n => !taken.has(n));
  if (curRank() >= 1 && freeLegends.length && r() < .08) { eng.client.name = h.pick(freeLegends); eng.legend = true; eng.client.stripe = "#c9a24a"; }
  if (curRank() >= 2 && r() < .35) eng.pitch = true;
}
BADGES.push({ id: "legend", ic: "👑", name: "Legendary client", how: "Work for a legendary client" }, { id: "cards10", ic: "🗂️", name: "Networker", how: "Collect 10 business cards" });
for (const b of BADGES) BADGE[b.id] = b;
const rarityOf = c => c.legend ? "legendary" : c.size >= 3 ? "rare" : "common";
function cardsHTML() {
  const all = Object.values(clientsMap()).sort((a, b) => (b.legend - a.legend) || b.size - a.size || b.trust - a.trust);
  return `<div class="cards">${all.map(c => { const ind = INDUSTRIES[c.ind] || INDUSTRIES[0], ex = EXECS[c.ex] || EXECS[0], rar = rarityOf(c); return `<div class="bcard ${rar} ${c.status === "rival" ? "lost" : ""}" style="--stripe:${c.legend ? "#c9a24a" : ind.stripe}"><div class="bc-top"><b>${esc(c.name)}</b><span class="rar">${rar}</span></div><div class="bc-mid"><span>${esc(ex[0])}</span><small>${esc(ind.ind)}</small></div><div class="bc-foot"><span>Trust ${c.trust}</span><span>${SIZE_NAMES[c.size]}</span>${c.status === "rival" ? `<span>with ${RIVAL}</span>` : ""}</div></div>`; }).join("")}</div>`;
}
function clientRecord(eng) {
  return clientsMap()[eng.client.name];
}
function clientBriefLine() {
  if (!ENG) return "";
  const c = clientRecord(ENG);
  if (ENG.returning && c) return `<p class="clientline">🤝 <b>Returning client.</b> You've helped ${esc(c.name)} ${c.jobs} time${c.jobs > 1 ? "s" : ""}. Trust: <b>${c.trust}</b> (${trustLabel(c.trust)}). ${c.grew ? `Good news: thanks to your advice they've grown into a <b>${SIZE_NAMES[c.size].toLowerCase()}</b>!` : ""}</p>`;
  if (ENG.pitch) return `<p class="clientline rival">🥊 <b>${RIVAL} is pitching for this client too.</b> Score 75% or more and ${esc(ENG.client.name)} picks us. Score less and they go to our rival.</p>`;
  return "";
}
/* Called from finishEngagement: update trust, growth, rival outcome. Returns lines for the report. */
function updateClient(eng, pct) {
  if (eng.daily) return null;
  const map = clientsMap(); let c = map[eng.client.name], out = { name: eng.client.name };
  if (!c) { c = map[eng.client.name] = { met: today(), legend: !!eng.legend, name: eng.client.name, ind: INDUSTRIES.findIndex(i => i.ind === eng.client.ind), ex: EXECS.findIndex(e => e[0] === eng.client.exec), palette: eng.palette, trust: 50, jobs: 0, size: sizeOf(50), status: "active" }; out.isNew = true; }
  const before = c.trust, d = pct >= 85 ? 15 : pct >= 65 ? 8 : pct >= 45 ? -5 : -15;
  c.jobs++; c.grew = false;
  if (eng.pitch) {
    if (pct >= 75) { out.won = true; c.trust = 60; award("rival"); }
    else { out.lost = true; c.status = "rival"; c.trust = 30; }
  } else c.trust = Math.max(0, Math.min(100, c.trust + d));
  const sz = sizeOf(c.trust); if (sz > c.size) { c.grew = true; out.grew = SIZE_NAMES[sz]; } c.size = Math.max(c.size, sz);
  if (c.trust < 20 && c.status === "active") { c.status = "rival"; out.left = true; }
  if (c.trust >= 80) award("loyal"); if (c.legend) award("legend"); if (Object.keys(map).length >= 10) award("cards10");
  Object.assign(out, { before, after: c.trust, label: trustLabel(c.trust), loyalBonus: before >= 80 && !eng.pitch });
  return out;
}
function clientReportHTML(cu) {
  if (!cu) return "";
  if (cu.won) return `<p class="clientline">🥊 <b>You beat ${RIVAL}!</b> ${esc(cu.name)} has chosen Haddad &amp; Partners.</p>`;
  if (cu.lost) return `<p class="clientline rival">😬 <b>${esc(cu.name)} went with ${RIVAL}.</b> Score 75%+ in a pitch to win clients.</p>`;
  return `<p class="clientline">🤝 <b>${esc(cu.name)}</b> trust: ${cu.before} → <b>${cu.after}</b> (${cu.label})${cu.grew ? `. They've grown into a <b>${cu.grew.toLowerCase()}</b>!` : ""}${cu.left ? `. <b>They've left for ${RIVAL}.</b>` : ""}${cu.loyalBonus ? " · loyal client +10% XP" : ""}</p>`;
}

/* ---------- deals between companies (from Senior Associate) ---------- */
const DEAL_STEPS = ["The offer", "The invoice", "The contract"];
function maybeNewDealMessage() {
  if (curRank() < 3) return null;
  const deals = dealsList(), open = deals.find(d => d.status === "open");
  if (open) { if (!open.waiting) { open.waiting = true; return open; } return null; }
  const act = activeClients(); if (act.length < 2) return null;
  const h = H(mul32((Math.random() * 2 ** 31) | 0)), [a, b] = h.pickN(act, 2);
  const deal = { id: Date.now(), a: a.name, b: b.name, step: 0, right: 0, status: "open", waiting: true, seed: (Math.random() * 2 ** 31) | 0 };
  deals.push(deal); return deal;
}
const openDeal = () => dealsList().find(d => d.status === "open" && d.waiting);
function dealQuestion(deal) {
  const r = mul32(deal.seed + deal.step * 101), h = H(r), A1 = deal.a, B1 = deal.b, item = h.pick(["printer paper", "delivery boxes", "uniforms", "coffee beans", "LED screens", "phone chargers"]);
  if (deal.step === 0) {
    const q = h.pick([200, 300, 400, 500]), p1 = h.pick([12, 14, 15, 16]), p2 = p1 + h.pick([2, 3, 4]), disc = h.pick([15, 20, 25]), over = q - h.pick([50, 100]);
    const t1 = q * p1, t2 = Math.round(q * p2 * (1 - disc / 100) * 100) / 100, best = t1 < t2 ? "Offer 1" : "Offer 2";
    if (t1 === t2) return dealQuestion({ ...deal, seed: deal.seed + 7 });
    return { from: A1, to: B1, subject: `Our offer for ${q} ${item}`, brief: `${esc(A1)} wants to supply ${esc(B1)} with <b>${q} ${item}</b>, and has sent two options. ${esc(B1)} asks you which is cheaper.`, table: { cols: ["Option", "Price each", "Extra"], align: ["", "r", ""], rows: [["Offer 1", A(p1), "—"], ["Offer 2", A(p2), `${disc}% off orders over ${over}`]] }, q: "Which offer is cheaper for this order?", ...mcq(h, best, ["Offer 1", "Offer 2", "They cost the same"], 3), explain: `Offer 1: ${q} × ${p1} = ${A(t1)}<br>Offer 2: ${q} × ${p2} = ${A(q * p2)}, minus ${disc}% = ${A(t2)}<br>So <b>${best}</b> is cheaper.` };
  }
  if (deal.step === 1) {
    const lines = h.pickN([["Boxes", 6], ["Tape rolls", 4], ["Labels (pack)", 9], ["Pallets", 45], ["Shrink wrap", 22], ["Delivery", 120]], 4).map(([n, p]) => { const q = n === "Delivery" ? 1 : h.ri(3, 40); return [n, q, p, q * p]; }), bad = h.ri(0, 3);
    lines[bad][3] = lines[bad][3] + h.pick([10, 20, 30, -10, 50]) * (lines[bad][2] > 20 ? 2 : 1); if (lines[bad][3] <= 0) lines[bad][3] += 60;
    return { from: A1, to: B1, subject: "Invoice #" + (1000 + (deal.seed % 9000)), brief: `${esc(A1)} has sent ${esc(B1)} its first invoice. ${esc(B1)} thinks something doesn't add up.`, table: { cols: ["Item", "Qty", "Price", "Line total"], align: ["", "r", "r", "r"], rows: lines.map(l => [l[0], l[1], A(l[2]), A(l[3])]) }, q: "Which line has the wrong total?", ...mcq(h, lines[bad][0], lines.map(l => l[0]), 4), explain: lines.map(l => `${l[0]}: ${l[1]} × ${l[2]} = ${A(l[1] * l[2])}${l[1] * l[2] !== l[3] ? ` (invoice says ${A(l[3])} ✗)` : ""}`).join("<br>") };
  }
  for (let k = 0; k < 40; k++) {
    const per = h.pick([300, 400, 500, 600]), orders = h.ri(4, 10), monthly = h.pick([2500, 3000, 3500, 4000]), payPer = per * orders;
    if (payPer === monthly) continue;
    const best = monthly < payPer ? "Sign the monthly contract" : "Keep paying per order";
    return { from: B1, to: A1, subject: "Should we sign?", brief: `${esc(A1)} offers ${esc(B1)} a contract: a flat <b>${A(monthly)} a month</b> for unlimited deliveries. Right now ${esc(B1)} pays <b>${A(per)} per delivery</b> and needs about <b>${orders} deliveries a month</b>.`, q: `What should ${B1} do?`, ...mcq(h, best, ["Sign the monthly contract", "Keep paying per order"], 2), explain: `Paying per order: ${orders} × ${per} = ${A(payPer)} a month.<br>Contract: ${A(monthly)} a month.<br>So: <b>${best}</b>.` };
  }
}
function answerDeal(choice) {
  const deal = openDeal(), q = state.dealQ; if (!deal || !q || q.picked !== null) return;
  q.picked = choice; const ok = choice === q.correct, map = clientsMap();
  if (ok) { deal.right++; career().xp += 60; }
  for (const n of [deal.a, deal.b]) if (map[n]) map[n].trust = Math.max(0, Math.min(100, map[n].trust + (ok ? 4 : -3)));
  deal.step++; deal.waiting = false;
  if (deal.step >= 3) { deal.status = deal.right >= 2 ? "signed" : "failed"; if (deal.status === "signed") { award("dealmaker"); for (const n of [deal.a, deal.b]) if (map[n]) map[n].trust = Math.min(100, map[n].trust + 10); } }
  if (typeof onDealAnswered === "function") onDealAnswered(ok, deal);
  persist(); Audio.play(ok ? "good" : "bad"); renderUI();
}
