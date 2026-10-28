/* ============================== COFFEE AND LUNCH WITH CLIENTS ==============================
   Meet a client and keep the conversation going. Good listeners win trust, and great meetings bring new work. */
if (!save.meet) save.meet = { day: "", coffee: 0, lunch: 0 };
BADGES.push({ id: "smooth", ic: "☕", name: "Smooth talker", how: "Have a perfect coffee or lunch with a client" });
for (const b of BADGES) BADGE[b.id] = b;
const CHAT_LINES = [
  { say: "Business has been really busy lately.", opts: [["What's been keeping you busiest?", 2, "Honestly? Our online orders have doubled. It's a lot to keep up with."], ["That's great to hear.", 1, "Yes… it is."], ["Let me tell you about our new services instead.", 0, "Oh. Right. Sure."]] },
  { say: "We're thinking about opening a new branch next year.", opts: [["What would success look like for you?", 2, "Good question! Paying for itself within two years, I'd say."], ["Expansion is always exciting.", 1, "It is. A bit scary too."], ["You should definitely hire us for that.", 0, "Let's not rush into anything."]] },
  { say: "To be honest, our last supplier really let us down.", opts: [["That sounds frustrating. What happened?", 2, "They missed three deliveries in a row. We lost customers."], ["Suppliers can be tricky.", 1, "Tell me about it."], ["*checks phone* Sorry, one second.", 0, "…I'll wait."]] },
  { say: "I'm not sure we can afford more help right now.", opts: [["Let's find where it would save you money first.", 2, "That would actually help. Send me some ideas."], ["No problem, maybe later.", 1, "Maybe."], ["Everyone says that. Sign today and get 5% off!", 0, "I don't like being pushed."]] },
  { say: "Have you tried the karak here? It's my favourite.", opts: [["I have! It goes perfectly with the date cake.", 2, "Exactly! You have good taste."], ["I don't really drink tea.", 1, "Oh, fair enough."], ["Let's skip the small talk and get to business.", 0, "Okay… if you insist."]] },
  { say: "My team feels stretched. Everyone's tired.", opts: [["What's taking up most of their time?", 2, "Manual reports, mostly. Hours every week."], ["Maybe give them a day off?", 1, "If only it were that easy."], ["My team works way harder than yours.", 0, "That's… not helpful."]] },
  { say: "We had our best month ever in March.", opts: [["Congratulations! What made the difference?", 2, "A new promotion on social media. It went viral!"], ["Nice.", 1, "Thanks."], ["Our best client did even better.", 0, "Good for them, I suppose."]] },
];
const CHAT_END = { say: "Well, I should get going. Thanks for this.", opts: [["Thanks for your time. I'll send you a short summary tomorrow.", 2, "That would be great. Speak soon!"], ["Bye!", 1, "Bye."], ["Before you go, can you sign this contract?", 0, "Not today, sorry."]] };
const meetToday = () => { if (save.meet.day !== today()) save.meet = { day: today(), coffee: 0, lunch: 0 }; return save.meet; };
const coffeeLeft = () => 2 - meetToday().coffee, lunchLeft = () => 1 - meetToday().lunch;
function startChat(kind) {
  const act = activeClients().filter(c => kind === "lunch" ? c.trust >= 55 : true);
  state.chat = { kind, pick: true, list: act.sort((a, b) => b.trust - a.trust).slice(0, 8) };
  openUI("chat");
}
function chooseChatClient(name) {
  const c = clientsMap()[name]; if (!c) return;
  const h = H(mul32((Math.random() * 2 ** 31) | 0)), n = state.chat.kind === "lunch" ? 4 : 3;
  const rounds = [...h.pickN(CHAT_LINES, n - 1), CHAT_END].map(r => ({ say: r.say, opts: h.shuf(r.opts) }));
  state.chat = { kind: state.chat.kind, client: c, rounds, i: 0, score: 0, picked: null, done: false };
  meetToday()[state.chat.kind]++; persist(); Audio.play("click"); renderUI();
}
function chatAnswer(j) {
  const ch = state.chat; if (!ch || ch.picked !== null) return;
  ch.picked = j; const pts = ch.rounds[ch.i].opts[j][1]; ch.score += pts; Audio.play(pts === 2 ? "good" : pts === 1 ? "tick" : "bad"); renderUI();
}
function chatNext() {
  const ch = state.chat; ch.i++; ch.picked = null;
  if (ch.i >= ch.rounds.length) {
    ch.done = true; const max = ch.rounds.length * 2, pct = ch.score / max, c = ch.client, mult = ch.kind === "lunch" ? 2 : 1;
    const d = Math.round((pct >= .99 ? 8 : pct >= .7 ? 5 : pct >= .4 ? 1 : -4) * mult); c.trust = Math.max(0, Math.min(100, c.trust + d)); ch.delta = d;
    ch.cash = earn(Math.round(pct * 80 * mult)); career().xp += Math.round(pct * 60 * mult); ch.xp = Math.round(pct * 60 * mult);
    if (pct >= .99) { award("smooth"); save.nextClient = c.name; ch.newWork = true; }
    persist(); Audio.play(pct >= .7 ? "fanfare" : "stamp");
  } else Audio.play("paper");
  renderUI();
}
function chatView() {
  const ch = state.chat, isL = ch.kind === "lunch", title = isL ? "🍽️ Client lunch" : "☕ Coffee with a client";
  if (ch.pick) return `<article class="paper memo fadein"><div class="letterhead"><div class="co">${title}</div><div class="label">${isL ? `${lunchLeft()} lunch left today` : `${coffeeLeft()} coffees left today`}</div></div>
    <p style="margin-top:0">${isL ? "Invite one of your trusted clients (trust 55+) to a private lunch. Four rounds of conversation. A great lunch doubles the trust you win." : "Invite a client for coffee and keep the conversation going. Good listeners win trust, and a perfect meeting brings you new work."}</p>
    ${ch.list.length ? `<div class="clist">${ch.list.map(c => `<button class="crow pickc" data-act="chatpick" data-id="${esc(c.name)}"><div><b>${esc(c.name)}</b><small>${esc(EXECS[c.ex] ? EXECS[c.ex][0] : "")} · ${trustLabel(c.trust)}</small></div><div class="tbar"><i style="width:${c.trust}%;background:${c.trust >= 60 ? "var(--ok)" : c.trust >= 35 ? "var(--warn)" : "var(--tick)"}"></i></div><span class="tl2">${c.trust}</span></button>`).join("")}</div>` : `<p><b>${isL ? "No client trusts you enough yet (55+ needed)." : "You don't have any clients yet."}</b> Finish some jobs first.</p>`}
    <div class="row-btns" style="margin-top:12px"><button class="btn plain" data-act="chatdone">Not now</button></div></article>`;
  const c = ch.client, ex = EXECS[c.ex] || EXECS[0];
  if (ch.done) { const max = ch.rounds.length * 2; return `<article class="paper memo fadein"><div class="letterhead"><div class="co">${title}</div><div class="label">${esc(c.name)}</div></div>
    <div class="promo"><div class="big stamp-in">${ch.score} / ${max}</div><p>${ch.score === max ? `"I really enjoyed this. Actually, we have a new project. Can your team help?"` : ch.score >= max * .7 ? `"Great to catch up. Let's do this again."` : `"Thanks for the ${isL ? "lunch" : "coffee"}."`}</p>
    <p class="cashline" style="justify-content:center">🤝 Trust ${ch.delta >= 0 ? "+" : ""}${ch.delta} → ${c.trust} · 💰 +${A(ch.cash)} · +${ch.xp} XP</p>${ch.newWork ? `<p class="clientline">📁 <b>New work!</b> Your next new job will be for ${esc(c.name)}.</p>` : ""}
    <button class="btn red" data-act="chatdone">Done</button></div></article>`; }
  const r = ch.rounds[ch.i], ans = ch.picked !== null;
  return `<section class="fadein"><article class="paper chat">
    <div class="letterhead"><div class="co">${title}</div><div class="label">${ch.i + 1} of ${ch.rounds.length} · ${esc(c.name)}</div></div>
    <div class="ivdots">${ch.rounds.map((x, i) => `<i class="${i < ch.i ? "past" : i === ch.i ? "now" : ""}"></i>`).join("")}</div>
    <div class="bubble-l"><div class="av" style="background:#1c2633">${esc(ex[0][0])}</div><div><small>${esc(ex[0])}</small><p>"${esc(r.say)}"</p></div></div>
    ${ans ? `<div class="bubble-r"><p>"${esc(r.opts[ch.picked][0])}"</p>${avatarHTML(40)}</div><div class="bubble-l"><div class="av" style="background:#1c2633">${esc(ex[0][0])}</div><div><p>"${esc(r.opts[ch.picked][2])}"</p></div></div>
      <p class="chat-note ${r.opts[ch.picked][1] === 2 ? "good" : r.opts[ch.picked][1] === 1 ? "" : "bad"}">${r.opts[ch.picked][1] === 2 ? "✓ Great reply: you listened and showed interest." : r.opts[ch.picked][1] === 1 ? "Okay reply, but it didn't keep the conversation going." : "✗ That made things awkward."}</p>
      <div class="row-btns"><button class="btn red" data-act="chatnext">${ch.i < ch.rounds.length - 1 ? "Continue" : "Finish"}</button></div>`
    : `<p class="instr">What do you say?</p><div class="choices">${r.opts.map((o, j) => `<button class="choice reply" data-act="chatopt" data-id="${j}"><b>💬 ${esc(o[0])}</b></button>`).join("")}</div>`}
  </article></section>`;
}
