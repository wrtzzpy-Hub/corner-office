/* ============================== STORY, CONSEQUENCES, WEEKLY CHALLENGE, SEASONS ============================== */

/* ---------- The Leak: someone inside the firm is passing secrets to Falcon Advisory ---------- */
const SUSPECTS = [["Omar", "Analyst"], ["Lina", "Associate"], ["Noura", "Senior Associate"], ["Faisal", "IT support"]];
if (!save.story) { const h = H(mul32((Math.random() * 2 ** 31) | 0)), order = h.shuf([0, 1, 2, 3]); save.story = { mole: order[0], out: order.slice(1), ch: 0, solved: false, failed: false }; }
BADGES.push({ id: "detective", ic: "🕵️", name: "Detective", how: "Unmask the mole in The Leak" }, { id: "weekly", ic: "🗓️", name: "Weekly warrior", how: "Finish a weekly challenge" }, { id: "season", ic: "🎉", name: "In season", how: "Finish a job during a seasonal event" }, { id: "advisor", ic: "🧭", name: "Wise adviser", how: "Give a client advice that pays off" });
for (const b of BADGES) BADGE[b.id] = b;
const CH_RANK = [1, 2, 3, 4];
const storyReady = () => { const s = save.story; return !s.solved && s.ch < 4 && curRank() >= CH_RANK[s.ch]; };
const stillIn = () => { const s = save.story; return [0, 1, 2, 3].filter(i => !s.out.slice(0, s.ch).includes(i)); };
function caseFile() {
  const s = save.story, ch = s.ch, inn = s.out[ch], sus = stillIn(), name = i => SUSPECTS[i][0];
  if (ch === 0) return { title: "Chapter 1 · The price leak", who: "Sara", text: `"We have a problem. Falcon Advisory just quoted <b>our exact secret price</b> to one of our clients. Only someone who opened the pricing file could know it. IT pulled the file log for me. Can you check it?"`,
    table: { cols: ["Name", "Opened 'Pricing 2026.xlsx'?", "When"], align: ["", "", ""], rows: sus.map(i => [name(i), i === inn ? "No" : "Yes", i === inn ? "—" : ["Mon 9:14 am", "Mon 4:52 pm", "Tue 11:03 am"][sus.indexOf(i) % 3]]) }, q: "Who can be ruled out?", answer: name(inn), why: `${name(inn)} never opened the pricing file, so couldn't have known the price.` };
  if (ch === 1) return { title: "Chapter 2 · The late-night print", who: "Khalid Haddad", text: `"Someone printed our client list at <b>9:42 pm on Tuesday</b> and it turned up at Falcon Advisory. The printer only works inside the building. Here are Tuesday's door-badge records."`,
    table: { cols: ["Name", "Left the building on Tuesday"], align: ["", ""], rows: sus.map(i => [name(i), i === inn ? "6:15 pm" : ["10:20 pm", "No badge-out recorded", "11:05 pm"][sus.indexOf(i) % 3]]) }, q: "Who can be ruled out?", answer: name(inn), why: `${name(inn)} left at 6:15 pm, more than three hours before the print at 9:42 pm.` };
  if (ch === 2) return { title: "Chapter 3 · The email", who: "Khalid Haddad", text: `"The last leak was sent from a personal email account over <b>our office Wi-Fi at 1:10 pm on Thursday</b>. Where was everyone at lunchtime?"`,
    table: { cols: ["Name", "Thursday 12–3 pm"], align: ["", ""], rows: sus.map(i => [name(i), i === inn ? "Client meeting across town (client confirmed)" : ["At their desk", "Lunch in the office café", "In the stockroom"][sus.indexOf(i) % 3]]) }, q: "Who can be ruled out?", answer: name(inn), why: `${name(inn)} was across town, so couldn't have used the office Wi-Fi at 1:10 pm.` };
  const evid = s.out.slice(0, 3).map((i, k) => `${name(i)}: ruled out in chapter ${k + 1}`);
  return { title: "Final chapter · Unmask the mole", who: "Layla Haddad", text: `"You've done brilliant work. Here's everything we know:<br>• ${evid.join("<br>• ")}<br>Only one person fits every clue. Who has been leaking to Falcon Advisory?"`, q: "Who is the mole?", answer: name(s.mole), final: true, why: `Every other suspect was ruled out by the evidence. ${name(s.mole)} opened the pricing file, stayed late on Tuesday, and was in the office on Thursday.` };
}
function caseAnswer(choice) {
  const s = save.story, cf = caseFile(), ok = choice === cf.answer;
  state.caseRes = { ok, choice, cf };
  if (ok) { if (cf.final) { s.solved = true; s.ch = 4; earn(5000); career().xp += 500; award("detective"); } else { s.ch++; earn(300); career().xp += 100; } Audio.play("fanfare"); }
  else Audio.play("bad");
  persist(); renderUI();
}
function caseView() {
  const s = save.story;
  if (state.caseRes) { const r = state.caseRes; return `<article class="paper memo fadein casefile"><div class="letterhead"><div class="co">📁 The Leak</div><div class="label">${esc(r.cf.title)}</div></div>
    <div class="result ${r.ok ? "good" : "bad"}"><div class="res-h"><b class="t">${r.ok ? (r.cf.final ? "🕵️ Case closed!" : "✓ Good detective work") : "✗ Not quite"}</b><span class="pts">${r.ok ? (r.cf.final ? "+AED 5,000 · +500 XP" : "+AED 300 · +100 XP") : ""}</span></div>
    <p class="sum">${r.ok ? r.cf.why : `The evidence doesn't rule out ${esc(r.choice)}. Look at the table again.`}</p>
    ${r.ok && r.cf.final ? `<p class="sum">"${esc(r.cf.answer)} has been escorted out of the building. Falcon Advisory won't be getting any more of our secrets."</p>` : r.ok ? `<p class="sum">The next chapter unlocks at <b>${RANKS[CH_RANK[s.ch]]}</b>.</p>` : ""}</div>
    <div class="row-btns" style="margin-top:14px">${r.ok ? `<button class="btn red" data-act="hub">Back</button>` : `<button class="btn red" data-act="case">Try again</button><button class="btn plain" data-act="hub">Later</button>`}</div></article>`; }
  if (s.solved) return `<article class="paper memo fadein casefile"><div class="letterhead"><div class="co">📁 The Leak</div><div class="label">Case closed</div></div><p>You unmasked <b>${esc(SUSPECTS[s.mole][0])}</b> as the mole. The firm's secrets are safe again.</p><button class="btn red" data-act="hub">Back</button></article>`;
  if (!storyReady()) return `<article class="paper memo fadein casefile"><div class="letterhead"><div class="co">📁 The Leak</div><div class="label">Chapter ${s.ch + 1} of 4</div></div><p>Someone inside Haddad &amp; Partners is leaking secrets to Falcon Advisory. ${s.ch ? `You've ruled out ${s.out.slice(0, s.ch).map(i => SUSPECTS[i][0]).join(", ")}.` : ""}</p><p>The next case file arrives when you reach <b>${RANKS[CH_RANK[s.ch]]}</b>.</p><button class="btn red" data-act="hub">Back</button></article>`;
  const cf = caseFile(), sus = stillIn();
  return `<article class="paper memo fadein casefile"><div class="letterhead"><div class="co">📁 The Leak</div><div class="label">${esc(cf.title)}</div></div>
    <div class="suspects">${SUSPECTS.map((x, i) => `<div class="sus ${sus.includes(i) ? "" : "out"}"><span class="av">${x[0][0]}</span><b>${x[0]}</b><small>${x[1]}</small>${sus.includes(i) ? "" : "<i>ruled out</i>"}</div>`).join("")}</div>
    <div class="npc-line"><div class="av" style="background:#1c2633">${esc(cf.who[0])}</div><div><b>${esc(cf.who)}</b><p class="brief">${cf.text}</p></div></div>
    ${cf.table ? tableHTML(cf.table, false, false, new Set(), null) : ""}
    <p class="q">${esc(cf.q)}</p>
    <div class="choices">${sus.map(i => `<button class="choice" data-act="caseans" data-id="${SUSPECTS[i][0]}"><b>${SUSPECTS[i][0]}</b></button>`).join("")}</div>
    <div class="row-btns" style="margin-top:12px"><button class="btn plain" data-act="hub">Later</button></div></article>`;
}

/* ---------- choices with consequences: one big decision per client ---------- */
function makeDecision(eng) {
  if (eng.daily || eng.weekly) return null;
  const h = H(mul32(eng.seed + 777)), c = eng.client.name, k = h.ri(0, 2);
  if (k === 0) { const rent = h.pick([8, 10, 12, 15]) * 1000, prof = rent + h.pick([-4, -3, 3, 5]) * 1000, good = prof > rent;
    return { client: c, q: `${c} wants your advice: should they open a second branch?`, table: { cols: ["", "Per month"], align: ["", "r"], rows: [["Rent for the new branch", A(rent)], ["Extra profit expected (before rent)", A(prof)]] }, opts: ["Open the branch", "Don't open it yet"], right: good ? 0 : 1, win: "The new branch is a hit and paying for itself!", lose: good ? "They held back, and a competitor opened there instead." : "The branch lost money every month and had to close." }; }
  if (k === 1) { const cost = h.pick([6, 8, 10]) * 1000, lost = h.pick([20, 25, 30, 40]) * 1000, m = h.pick([20, 25, 30, 40]), gain = lost * m / 100, good = gain > cost;
    return { client: c, q: `${c} keeps turning customers away at busy times. Should they hire two more staff?`, table: { cols: ["", "Per month"], align: ["", "r"], rows: [["Cost of two more staff", A(cost)], ["Sales lost to turned-away customers", A(lost)], ["Profit margin on those sales", m + "%"]] }, opts: ["Hire them", "Don't hire"], right: good ? 0 : 1, win: "Their queues are gone and profit is up!", lose: good ? "They kept losing customers to the shop next door." : "The new staff cost more than they brought in." }; }
  const mg = h.pick([40, 50, 60]), off = h.pick([20, 25, 30]), up = h.pick([30, 50, 80, 100]), before = mg, after = (1 + up / 100) * (mg - off), good = after > before;
  return { client: c, q: `${c} wants to run a ${off}%-off sale. Their profit margin is ${mg}% and they expect to sell ${up}% more. Good idea?`, table: { cols: ["", "Profit per 100 AED of normal sales"], align: ["", "r"], rows: [["Now", A(before)], [`With the sale (${up}% more sold, ${off}% off)`, `? (work it out)`]] }, opts: ["Run the sale", "Skip the sale"], right: good ? 0 : 1, win: "The sale brought in record profit!", lose: good ? "They skipped it and a rival's sale stole their customers." : "They sold more, but made less money overall.", explain: `With the sale: (1 + ${up}%) × (${mg}% − ${off}%) = ${N(after)} per 100 AED, vs ${before} now.` };
}
function decide(i) {
  const d = state.report && state.report.decision; if (!d || d.picked !== undefined) return;
  d.picked = i; const c = clientsMap()[d.client]; if (c) c.decision = { ok: i === d.right, win: d.win, lose: d.lose, pick: d.opts[i] };
  persist(); Audio.play("stamp"); renderUI();
}
function applyConsequence(eng) {
  const c = clientsMap()[eng.client.name]; if (!c || !c.decision || !eng.returning) return null;
  const d = c.decision; delete c.decision; const before = c.trust;
  c.trust = Math.max(0, Math.min(100, c.trust + (d.ok ? 10 : -10))); if (d.ok) { c.size = Math.min(4, c.size + 1); award("advisor"); }
  persist(); return { ...d, before, after: c.trust };
}
function decisionHTML(rp) {
  const d = rp.decision; if (!d) return "";
  return `<div class="decision"><h3 class="section-h">🧭 Big decision</h3><p>${esc(d.q)}</p>${tableHTML(d.table, false, false, new Set(), null)}
    ${d.picked === undefined ? `<div class="row-btns">${d.opts.map((o, i) => `<button class="btn ${i ? "plain" : "red"}" data-act="decide" data-id="${i}">${esc(o)}</button>`).join("")}</div><p class="instr">Your advice changes what happens to ${esc(d.client)}. You'll find out next time you work with them.</p>`
      : `<p class="clientline">📌 You advised: <b>${esc(d.opts[d.picked])}</b>. We'll see how it turns out next time you visit ${esc(d.client)}…</p>`}</div>`;
}

/* ---------- weekly challenge ---------- */
const weekKey = () => { const d = new Date(), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + "-W" + String(Math.ceil(((t - y) / 864e5 + 1) / 7)).padStart(2, "0"); };
if (!save.weekly) save.weekly = {};
const weeklyBest = () => (save.weekly[save.mode + weekKey()] || null);
function recordWeekly(pct) { const k = save.mode + weekKey(), first = !save.weekly[k]; save.weekly[k] = Math.max(save.weekly[k] || 0, Math.round(pct)); award("weekly"); persist(); return first; }
function shareWeekly() { const b = weeklyBest(), txt = `I scored ${b}% in the Corner Office weekly challenge (${weekKey()}). Can you beat me? https://wrtzzpy-hub.github.io/corner-office/`; try { navigator.clipboard.writeText(txt); toast("📋 Copied! Paste it to your friends."); } catch (e) { toast(txt); } }

/* ---------- seasons ---------- */
const SEASONS = [
  { name: "Autumn Sale Season", ic: "🍂", from: "10-15", to: "11-30", note: "Shops are busy with autumn sales. +10% XP on every job." },
  { name: "UAE National Day", ic: "🇦🇪", from: "12-01", to: "12-05", note: "Celebrate with the city. +10% XP on every job." },
  { name: "Dubai Shopping Festival", ic: "🛍️", from: "12-06", to: "01-31", note: "The city's biggest sale. +10% XP on every job." },
  { name: "Ramadan Kareem", ic: "🌙", from: "02-08", to: "03-09", note: "Evening iftars and busy shops. +10% XP on every job." },
  { name: "Summer Surprises", ic: "☀️", from: "07-01", to: "08-15", note: "Summer deals across the city. +10% XP on every job." },
  { name: "Back to School", ic: "🎒", from: "08-16", to: "09-10", note: "Families shopping for school. +10% XP on every job." }];
function seasonNow() { const d = today().slice(5); return SEASONS.find(s => s.from <= s.to ? d >= s.from && d <= s.to : d >= s.from || d <= s.to) || null; }
