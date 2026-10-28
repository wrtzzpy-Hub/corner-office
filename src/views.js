/* ============================== VIEWS ============================== */
const ov = document.getElementById("ov");
const FEEDBACK_URL = "https://tally.so/r/peePV1";
const JOB = () => isStudent() ? "engagement" : "job";
const KIND_IC = { calc: "123", mcq: "?", flag: "✗", classify: "≡", count: "#" };
const stars = pct => pct >= 85 ? "★★★" : pct >= 65 ? "★★☆" : pct >= 40 ? "★☆☆" : "☆☆☆";
const kindName = t => t.d && t.d.asChoice ? "Pick the answer" : KIND_NAME[t.T.kind];
function taskRow(t) {
  const r = ENG.res[t.key], done = r && r.status === "done";
  return `<div class="tl ${done ? "done" : ""} ${t.key === "cap" ? "cap" : ""}"><span class="ic">${done ? "✓" : KIND_IC[t.T.kind]}</span><div><b>${esc(t.T.title)}</b><small>${esc(t.T.major)} · ${kindName(t)} · ${esc(t.key === "cap" ? "Sara, meeting room" : STATIONS[t.st].place)}</small></div><span class="st">${done ? `${r.pts}/${r.max}` : `${ptsFor(t.tier)} pts`}</span></div>`;
}
function tableHTML(tb, flaggable, done, wrong, given) {
  const g = new Set(given || []);
  return `<div class="tablewrap"><table><thead><tr>${tb.cols.map((c, i) => `<th class="${tb.align[i] || ""}">${esc(c)}</th>`).join("")}</tr></thead><tbody>${tb.rows.map((r, ri) => {
    const cells = r.map((c, i) => `<td class="${tb.align[i] || ""} ${/^[−\-\d,.]+[%×]?$/.test(String(c)) ? "m" : ""}">${esc(c)}${i === 0 && done && flaggable ? (wrong.has(ri) ? `<span class="rtag ${g.has(ri) ? "ok" : "miss"}">${g.has(ri) ? "error · you caught it" : "error · missed"}</span>` : g.has(ri) ? `<span class="rtag fp">this one was fine</span>` : "") : ""}</td>`).join("");
    if (!flaggable) return `<tr>${cells}</tr>`;
    if (done) return `<tr class="row ${wrong.has(ri) ? "flagged" : g.has(ri) ? "fprow" : ""}">${cells}</tr>`;
    const on = state.picks.has(ri);
    return `<tr class="row ${on ? "flagged" : ""}" tabindex="0" role="button" aria-pressed="${on}" data-act="flagrow" data-id="${ri}">${cells}</tr>`;
  }).join("")}</tbody></table></div>`;
}
function stepsOf(html) {
  let parts = String(html).split(/<br\s*\/?>/i).map(s => s.trim()).filter(Boolean);
  if (parts.length === 1) parts = parts[0].replace(/([.!?])\s+(?=[A-Z<"“(])/g, "$1\u0001").split("\u0001").map(s => s.trim()).filter(Boolean);
  return parts;
}
const INSTR = { calc: "Type your answer, then press Submit.", count: "Count the pallets in Bay C, type your answer, then press Submit.", mcq: "Pick one answer, then press Lock in.", flag: "Tap every row that's wrong, then press Submit.", classify: "Choose a category for each item, then press Submit." };
function resultHTML(tk, d, res, kind) {
  const ok = res.frac >= .99, part = res.frac > 0 && !ok, choice = kind === "mcq" || d.asChoice, prac = tk.key === "practice";
  const title = ok ? (res.attempts > 1 ? "Got it on a second try" : "Correct!") : part ? "Partly right" : "Not this time";
  let compare = "";
  if (choice) { const yours = (res.wrongOpts || []).map(i => d.options[i]); compare = `<div class="cmp">${yours.length ? `<div class="bad"><span>Your answer${yours.length > 1 ? "s" : ""}</span><b>${yours.map(esc).join(", ")}</b></div>` : ""}<div class="good"><span>Correct answer</span><b>${esc(d.options[d.correct])}</b></div></div>`; }
  else if (kind === "calc" || kind === "count") { const wrongTries = (res.tries || []).filter((v, i) => !(ok || part) || i < res.tries.length - 1); compare = `<div class="cmp">${wrongTries.length ? `<div class="bad"><span>You entered</span><b>${wrongTries.map(v => esc(fmtAns(v, d.unit))).join(", ")}</b></div>` : ""}<div class="good"><span>Correct answer</span><b>${esc(fmtAns(d.answer, d.unit))}</b></div></div>`; }
  else if (kind === "flag") { const w = new Set(d.wrong), hits = res.given.filter(i => w.has(i)).length, fp = res.given.length - hits; compare = `<p class="sum">You caught <b>${hits} of ${w.size}</b> error${w.size > 1 ? "s" : ""}${fp ? `, and flagged ${fp} row${fp > 1 ? "s" : ""} that ${fp > 1 ? "were" : "was"} fine` : ""}. Each row is labelled in the table above.</p>`; }
  else if (kind === "classify") { const right = d.items.filter((it, i) => res.given[i] === it.cat).length; compare = `<p class="sum">You sorted <b>${right} of ${d.items.length}</b> correctly. Each item is marked above.</p>`; }
  const steps = stepsOf(d.explain);
  return `<div class="result ${ok ? "good" : part ? "mid" : "bad"}">
    <div class="res-h"><b class="t">${ok ? "✓ " : part ? "½ " : "✗ "}${title}</b><span class="pts">${prac ? "Practice" : "+" + res.pts + " pts"}</span></div>
    ${compare}
    <div class="howto"><h4>${ok ? "Why it's right" : "How to get it right"}</h4><ol>${steps.map(s => `<li>${s}</li>`).join("")}</ol></div>
    <p class="key"><b>Remember:</b> ${esc(d.hint)}</p>
  </div>`;
}
const views = {
  ob0: () => `<section class="title-hero"><div class="title-inner fadein">
    <div class="ticks">✓ ✓ ✗ ✓</div><h1 class="display stamp-in">Corner <span>Office</span></h1>
    <p>Start as an intern at Haddad &amp; Partners and climb to Partner. Every day you visit a new company and help them with fun business puzzles.</p>
    <span class="label">Choose how you want to play</span>
    <div class="modes">
      <button class="mode ${save.onboarded && save.mode === "casual" ? "cur" : ""}" data-act="mode" data-id="casual"><b>Play for fun</b><span>Business brain-teasers for teens and up. No business knowledge needed: everything you need is in the question. Multiple choice, two tries, and a worked answer whenever you slip up.</span></button>
      <button class="mode ${save.onboarded && save.mode === "student" ? "cur" : ""}" data-act="mode" data-id="student"><b>Student mode</b><span>Pick your major and university year. Real calculations that match what you're studying and get harder as you climb.</span></button>
    </div>
    ${save.onboarded ? `<button class="btn ghost" data-act="hub">Back</button>` : ""}
  </div></section>`,
  ob1: () => `<article class="paper memo fadein"><div class="letterhead"><div class="co">Student mode</div><div class="label">Step 1 of 3</div></div>
    <h2>What are you studying?</h2><p>Most of your tasks will come from your major, with some from neighbouring subjects, just like real client work.</p>
    <div class="picks">${MAJORS.map(m => `<button class="pickb ${save.major === m ? "sel" : ""}" data-act="major" data-id="${m}">${m}</button>`).join("")}</div>
    <h2 style="font-size:28px">Which year are you in?</h2><p>Year 1 starts with the foundations. Later years bring tougher analysis from day one.</p>
    <div class="picks">${[1, 2, 3, 4].map(y => `<button class="pickb ${save.year === y ? "sel" : ""}" data-act="year" data-id="${y}">Year ${y}</button>`).join("")}</div>
    <div class="row-btns"><button class="btn red" data-act="ob2">Continue</button><button class="btn plain" data-act="ob0">Back</button></div></article>`,
  ob2: () => `<article class="paper memo fadein"><div class="letterhead"><div class="co">Your career</div><div class="label">${isStudent() ? "Step 2 of 3" : "Step 1 of 2"}</div></div>
    <h2>Climb to Partner</h2>
    ${isStudent() ? `<p>Each <b>engagement</b> is a visit to a client's offices. Walk to each task, solve it, then report back to Sara, your manager. Your score becomes <b>XP</b>, and enough XP gets you promoted.</p>` : `<p>Each <b>job</b> is a visit to a company. Walk to each task, answer it, then go back to Sara, your boss. You earn <b>points</b>, and enough points get you promoted.</p>`}
    ${ladderHTML()}
    <p>${isStudent() ? "Higher ranks bring longer engagements and harder problems. The <b>daily challenge</b> is the same for everyone in your mode that day and pays 1.5× XP." : "The <b>daily challenge</b> is a new job every day with bonus points."}</p>
    <div class="row-btns"><button class="btn red" data-act="ob3">Continue</button><button class="btn plain" data-act="${isStudent() ? "ob1" : "ob0"}">Back</button></div></article>`,
  ob3: () => `<article class="paper memo fadein"><div class="letterhead"><div class="co">How to play</div><div class="label">${state.obReturn ? "" : isStudent() ? "Step 3 of 3" : "Step 2 of 2"}</div></div>
    <h2>Your first day</h2>
    <div class="how">
      <div><b>1 · Move</b><span>${isTouch ? "Drag your left thumb to walk. Drag the right side of the screen to look around." : "Click the view, then use W A S D to walk and the mouse to look. Hold Shift to hurry."}</span></div>
      <div><b>2 · Follow the arrow</b><span>The yellow arrow at the top always points to your next stop. A glowing path on the floor and a beam of light show the way.</span></div>
      <div><b>3 · Interact</b><span>${isTouch ? "When you arrive, tap the yellow button." : "When you arrive, press E."} Tasks open on paper over the office.</span></div>
      <div><b>4 · Report back</b><span>When every task is done, the arrow leads you back to Sara. Hand in your report to earn XP.</span></div>
    </div>
    <p style="margin:6px 0 10px"><b>Task types</b></p>
    <div class="how">
      <div><b>123 · Calculate</b><span>${isStudent() ? "Work out a number. Two tries; the second earns half points." : "Pick the right number from four choices. Two tries."}</span></div>
      <div><b>? · Decide</b><span>Choose the best answer${isStudent() ? ". One try." : ". Two tries."}</span></div>
      <div><b>✗ · Spot the errors</b><span>Tap the wrong rows in a document.${isStudent() ? "" : " You're told how many there are."}</span></div>
      <div><b>≡ · Sort</b><span>Put each item in the right category.</span></div>
      <div><b># · Count</b><span>Walk to the stockroom and count boxes with your own eyes.</span></div>
      <div><b>Got it wrong?</b><span>You'll see the right answer, a step-by-step solution, and a button to practise a similar one.</span></div>
    </div>
    <p style="margin:0 0 14px;color:var(--ink-dim)">${isStudent() ? "Hints cost 25% of a task's points. The AI mentor counts as a hint." : "Stuck? Every task has a free hint button."}</p>
    <div class="row-btns"><button class="btn red" data-act="${state.obReturn ? "hub" : "finishob"}">${state.obReturn ? "Back" : "Go to the office"}</button>${state.obReturn ? "" : `<button class="btn plain" data-act="ob2">Back</button>`}</div></article>`,
  desk: () => {
    const hc = hqCfg(), next = ["desk", "office", "corner"].find(w => ["hot", "desk", "office", "corner"].indexOf(w) > ["hot", "desk", "office", "corner"].indexOf(hc.ws)), nextRank = { desk: 1, office: 3, corner: 6 }[next];
    return `<article class="paper memo fadein"><div class="letterhead"><div class="co">${esc(WS_NAME[hc.ws])}</div><div class="label">Haddad &amp; Partners HQ</div></div>
    <div class="staffcard">${avatarHTML(72)}<div><b>${esc(myName() || "New starter")}</b><small>${esc(RANKS[hc.rank])} · ${N(career().xp)} XP · ${Object.keys(save.badges).length} badges${streakNow() ? ` · 🔥 ${streakNow()}` : ""}</small></div></div>
    <p>${{ hot: "Interns share the hot desk. Get promoted to <b>Analyst</b> and this desk becomes yours, with your name on it.", desk: `This is your own desk, with your nameplate in your colour.${hc.rank >= 2 ? " You've earned a plant and a photo frame too." : " At Associate you get a plant and a photo frame."}`, office: `Your own private office. Every promotion certificate hangs on the wall, and your badges sit on the trophy shelf.${hc.rank < 5 ? " More furniture arrives as you climb." : ""}`, corner: "The corner office: windows on two sides, the best view in the building, and a trophy cabinet for every badge." }[hc.ws]}</p>
    <div class="perks">${[["hot", "Intern", "Hot desk"], ["desk", "Analyst", "Your own desk"], ["office", "Senior Associate", "Private office"], ["corner", "Director", "Corner office"]].map(([w, r, t]) => `<div class="perk ${w === hc.ws ? "now" : ["hot", "desk", "office", "corner"].indexOf(w) < ["hot", "desk", "office", "corner"].indexOf(hc.ws) ? "past" : ""}"><b>${esc(t)}</b><small>${esc(r)}</small></div>`).join("")}</div>
    ${next ? `<p style="color:var(--ink-dim);font-size:14px">Next upgrade at <b>${RANKS[nextRank]}</b>.</p>` : ""}
    <div class="row-btns"><button class="btn red" data-act="close">Back to the office</button><button class="btn plain" data-act="hub">Menu</button></div></article>`;
  },
  ladder: () => `<article class="paper memo fadein"><div class="letterhead"><div class="co">Career ladder</div><div class="label">${isStudent() ? "Student mode" : "Play for fun"}</div></div>${ladderHTML()}<button class="btn red" data-act="hub">Back</button></article>`,
  hub: () => {
    const cr = career(), pr = xpProgress(), cur = save.cur[save.mode], dailyDone = save.daily[save.mode] === today(), conf = state.confirm;
    return `<div class="hub fadein">
      <article class="paper"><div class="letterhead"><div class="co">Haddad &amp; Partners</div><div class="label">${isStudent() ? `${esc(save.major)} · Year ${save.year}` : "Play for fun"}</div></div>
        <div class="me-row">${avatarHTML(46)}<div><span class="label">${myName() ? esc(myName()) + " · your position" : "Your position"}</span><div class="h2" style="margin-top:2px">${esc(RANKS[pr.rk])}</div></div>${streakNow() ? `<div class="streak" title="Days in a row">🔥 ${streakNow()}<small>day${streakNow() > 1 ? "s" : ""}</small></div>` : ""}</div>
        <div class="bigbar"><i style="width:${pr.pct}%"></i></div>
        <p style="margin:0 0 12px;color:var(--ink-dim)">${pr.rk === RANKS.length - 1 ? "You made Partner. Keep playing to raise your average." : pr.need ? `${N(pr.need)} XP until your interview for <b>${RANKS[pr.rk + 1]}</b>` : `You've earned an interview for <b>${RANKS[pr.rk + 1]}</b>!`} · ${N(cr.xp)} XP total</p>
        ${!myName() ? `<button class="namecta" data-act="you">✏️ Add your name and colour so the office knows who you are</button>` : ""}
        <div class="facts"><div class="fact"><div class="v">${cr.eng}</div><div class="k">${isStudent() ? "Engagements" : "Jobs done"}</div></div><div class="fact"><div class="v">${cr.eng ? Math.round(cr.sumPct / cr.eng) + "%" : "–"}</div><div class="k">Average score</div></div><div class="fact"><div class="v">${cr.eng ? cr.best + "%" : "–"}</div><div class="k">Best</div></div></div>
        <p style="margin:0;color:var(--ink-dim);font-size:14px">Next ${JOB()}: ${engLength(pr.rk)} tasks${isStudent() && baseTier() >= 2 ? " plus a final recommendation" : ""} · ${isStudent() ? `difficulty ${"●".repeat(baseTier())}${"○".repeat(4 - baseTier())}` : `questions: ${FUN_LEVEL[Math.min(3, funTier(pr.rk) + 1)].toLowerCase()}`}</p>
      </article>
      <div class="menu">
        ${interviewEarned() ? (interviewReady() ? `<button class="btn red glow" data-act="interview"><span>Promotion interview</span><small>for ${RANKS[pr.rk + 1]} · 3 questions</small></button>` : `<div class="paper" style="padding:12px 14px;font-size:14px">${interviewer(pr.rk + 1).name}: "Not this time, but you were close. Finish one more ${JOB()} and you can try the interview again."</div>`) : ""}
        ${cur ? `<button class="btn ${interviewReady() ? "" : "red"}" data-act="resume"><span>Resume: ${esc(cur.client.name)}</span><small>${Object.values(cur.res).filter(r => r.status === "done").length}/${cur.tasks.length} done</small></button>` : ""}
        <button class="btn ${cur || interviewReady() ? "" : "red"}" data-act="new"><span>New ${JOB()}</span><small>${cur ? "replaces the current one" : "a new client"}</small></button>
        <button class="btn" data-act="daily" ${dailyDone ? "disabled" : ""}><span>Daily challenge</span><small>${dailyDone ? "done today ✓" : "1.5× XP"}</small></button>
        <button class="btn" data-act="hq"><span>Walk around the office</span><small>${esc(WS_NAME[WS_OF(pr.rk)].toLowerCase())}, café, coworkers</small></button>
        ${conf ? `<div class="confirm paper" style="padding:12px"><p style="margin:0 0 8px">${conf === "reset" ? "Erase all progress in both modes? This can't be undone." : `Quit the current ${JOB()}? Its progress will be lost.`}</p><div class="row-btns"><button class="btn red" data-act="confirmyes">${conf === "reset" ? "Erase everything" : "Abandon it"}</button><button class="btn plain" data-act="confirmno" style="background:#fff">Cancel</button></div></div>` : ""}
        ${location.hash === "#dev" ? `<div class="paper devbox"><b>Tester tools</b><span>Jump to a rank to try its questions. Your next new ${JOB()} uses the new level.</span><div class="picks">${RANKS.map((n, i) => `<button class="pickb ${i === pr.rk ? "sel" : ""}" data-act="devrank" data-id="${i}">${n}</button>`).join("")}</div><button class="btn plain" data-act="deviv" style="margin-top:8px">Unlock the next interview</button></div>` : ""}
        <button class="btn ghost" data-act="badges"><span>Badges</span><small>${Object.keys(save.badges).length}/${BADGES.length}</small></button>
        <button class="btn ghost" data-act="you"><span>Your profile</span><small>name and colour</small></button>
        <button class="btn ghost" data-act="ladder"><span>Career ladder</span></button>
        <button class="btn ghost" data-act="howto"><span>How to play</span></button>
        ${isStudent() ? `<button class="btn ghost" data-act="ob1"><span>Change major or year</span></button>` : ""}
        <button class="btn ghost" data-act="ob0"><span>Switch mode</span><small>each mode keeps its own career</small></button>
        <button class="btn ghost" data-act="reset"><span>Reset progress</span></button>
        <a class="btn ghost" href="${FEEDBACK_URL}" target="_blank" rel="noopener"><span>Give feedback</span><small>2-minute form</small></a>
      </div></div>`;
  },
  brief: () => `<article class="paper memo fadein"><div class="letterhead"><div class="co">${esc(ENG.client.name)}</div><div class="label">${ENG.daily ? "Daily challenge · " : ""}${esc(ENG.service)}</div></div>
    <div class="npc-line"><div class="av" style="background:#2f3a4c">S</div><div>
    <h2>Today's ${JOB()}</h2>
    ${isStudent() ? `<p>"${hi("Welcome")}! ${esc(ENG.client.name)} works in ${esc(ENG.client.ind)}. ${esc(ENG.client.exec)}, their ${esc(ENG.client.role)}, is in the Executive suite. Here's your list. Do them in any order; the <b>yellow arrow</b> will lead you to the nearest one. ${ENG.capT ? "When you're done, come back and give me your recommendation." : "Come back to me when you're done."}"</p>` : `<p>"${hi()}! Today we're helping ${esc(ENG.client.name)}. Here are your ${ENG.list.length} tasks. Just follow the <b>yellow arrow</b>, then come back to me."</p>`}</div></div>
    <div class="tasklist">${ENG.list.map(taskRow).join("")}${ENG.capT ? taskRow(ENG.capT) : ""}</div>
    <p class="label" style="color:var(--ink-dim)">${isTouch ? "Tap Tasks" : "Press T"} any time to see this list again.</p>
    <span class="sig">Sara</span><div style="margin-top:14px"><button class="btn red" data-act="briefed">Get to work</button></div></article>`,
  overview: () => `<article class="paper memo fadein"><div class="letterhead"><div class="co">Task list</div><div class="label">${esc(ENG.client.name)} · ${doneCount()}/${ENG.list.length} done</div></div>
    ${ENG.briefed && !allTasksDone() && near && near.id === "sara" ? `<p>"You still have ${ENG.list.length - doneCount()} to go. Follow the arrow and come back when they're done."</p>` : ""}
    <div class="tasklist">${ENG.list.map(taskRow).join("")}${ENG.capT ? taskRow(ENG.capT) : ""}</div>
    <div class="row-btns"><button class="btn red" data-act="close">Back to work</button><button class="btn plain" data-act="menu">Save and leave</button></div></article>`,
  note: () => {
    const c = ENG && ENG.client;
    const n = state.note === "mariam" ? { who: "Mariam · Reception", av: "M", col: "#5a4a30", h: c ? `Welcome to ${c.name}` : "Welcome back to Haddad & Partners", body: `<p>"${hi("Good morning")}! ${c ? "Sara from Haddad &amp; Partners is in the <b>meeting room</b>, straight across the corridor." : `${{ hot: "The interns' hot desk is on the Finance floor", desk: "Your desk is on the Finance floor", office: "Your office is at the east end of the corridor", corner: "The corner office is at the far east end" }[hqCfg().ws]}. Sara is in the <b>meeting room</b> when you're ready for a job, and the <b>café</b> is at the far east end."`}"</p>${c ? `<p>"The Finance floor is next door, ${esc(c.exec)}'s office is at the far end, and the <b>Stockroom</b> is through the doors on your right. Just follow the yellow arrow."</p>` : ""}` }
      : { who: "Client fact sheet", av: "i", col: "#2f6db3", h: c.name, body: `<div class="facts"><div class="fact"><div class="v">${esc(c.ind)}</div><div class="k">Industry</div></div><div class="fact"><div class="v">${esc(c.exec)}</div><div class="k">${esc(c.role)}</div></div><div class="fact"><div class="v">${esc(c.prod)}</div><div class="k">Main stock line</div></div><div class="fact"><div class="v">${esc(ENG.service)}</div><div class="k">Engagement</div></div></div><p class="label" style="color:var(--ink-dim)">Financial year ends 31 December. All amounts in AED.</p>` };
    return `<article class="paper memo fadein"><div class="letterhead"><div class="co">${esc(n.who)}</div></div><div class="npc-line"><div class="av" style="background:${n.col}">${n.av}</div><div><h2>${esc(n.h)}</h2>${n.body}</div></div><div style="margin-top:12px"><button class="btn red" data-act="close">Got it</button></div></article>`;
  },
  task: () => {
    const tk = taskByKey(state.task), d = tk.d, kind = tk.T.kind, res = resOf(tk.key), done = res.status === "done", prac = tk.key === "practice", choice = kind === "mcq" || d.asChoice;
    const who = tk.key === "cap" ? "Sara" : tk.st === "exec" ? ENG.client.exec : tk.st === "ravi" ? "Ravi" : null;
    let input = "";
    if (!done) {
      if (choice) input = `<div class="choices">${d.options.map((o, i) => { const x = (res.wrongOpts || []).includes(i); return `<button class="choice ${x ? "crossed" : state.sel === i ? "sel" : ""}" ${x ? "disabled" : `data-act="opt" data-id="${i}"`}><b>${esc(o)}</b>${x ? "<span>Not this one</span>" : ""}</button>`; }).join("")}</div><div class="row-btns" style="margin-top:12px"><button class="btn red" data-act="submit" ${state.sel === null ? "disabled" : ""}>${isStudent() ? "Lock in" : "Check my answer"}</button></div>`;
      else if (kind === "calc" || kind === "count") input = `<form class="answer" data-form="ans"><input id="ans" inputmode="decimal" autocomplete="off" placeholder="Your answer" aria-label="Your answer"><span class="unit">${esc(d.unit || "")}</span><button class="btn red" type="submit">Submit</button>${kind === "count" ? `<button class="btn plain" type="button" data-act="close">Go and count</button>` : ""}</form>${(res.tries || []).length ? `<p class="tries">Tried: ${res.tries.map(v => esc(N(v))).join(", ")}</p>` : ""}`;
      else if (kind === "flag") input = `<div class="row-btns"><button class="btn red" data-act="submit">Submit ${state.picks.size} flag${state.picks.size === 1 ? "" : "s"}</button></div>`;
      else if (kind === "classify") input = `<div class="cls">${d.items.map((it, i) => `<div class="cls-row"><span>${esc(it.text)}</span><select id="cls${state.task}_${i}" data-cls="${i}" aria-label="Category for ${esc(it.text)}"><option value="">Choose…</option>${d.cats.map(cat => `<option ${state.cls[i] === cat ? "selected" : ""}>${esc(cat)}</option>`).join("")}</select></div>`).join("")}</div><div class="row-btns" style="margin-top:12px"><button class="btn red" data-act="submit">Submit</button></div>`;
    } else {
      if (choice) input = `<div class="choices">${d.options.map((o, i) => `<div class="choice ${i === d.correct ? "right" : (res.wrongOpts || []).includes(i) ? "wrong" : "dim"}"><b>${i === d.correct ? "✓ " : (res.wrongOpts || []).includes(i) ? "✗ " : ""}${esc(o)}</b></div>`).join("")}</div>`;
      if (kind === "classify") input = `<div class="cls">${d.items.map((it, i) => `<div class="cls-row ${res.given[i] === it.cat ? "right" : "wrong"}"><span>${res.given[i] === it.cat ? "✓" : "✗"} ${esc(it.text)}</span><span><b>${esc(it.cat)}</b>${res.given[i] !== it.cat ? ` <small>(you chose ${esc(res.given[i])})</small>` : ""}</span></div>`).join("")}</div>`;
    }
    const showTip = !done && (state.hintOpen || res.hint);
    return `<section class="fadein"><div class="ov-top"><div class="row-btns"><button class="btn ghost" data-act="${prac ? "endpractice" : "close"}">← ${prac ? "Back" : "Back to the office"}</button>${!done ? `<button class="btn ghost calc-btn" data-act="calc" aria-pressed="${calc.open}">Calculator</button>` : ""}</div><span class="hint2">${esc(tk.key === "cap" ? "Final recommendation" : prac ? "Practice round · no points" : "At " + STATIONS[tk.st].place)}</span></div>
      <article class="paper">
        <div class="chips-row"><span class="chipx k">${kindName(tk)}</span><span class="chipx">${esc(tk.T.major)}</span>${isStudent() ? `<span class="chipx">${"●".repeat(tk.tier)}${"○".repeat(4 - tk.tier)}</span>` : `<span class="chipx">${FUN_LEVEL[tk.tier] || "Easy"}</span>`}<span class="chipx ${prac ? "prac" : ""}">${prac ? "Practice" : ptsFor(tk.tier) + " pts"}</span></div>
        <h3 class="h2" style="font-size:32px">${esc(tk.T.title)}</h3>
        ${who ? `<div class="npc-line"><div class="av" style="background:${who === "Sara" ? "#2f3a4c" : who === "Ravi" ? "#e08a1e" : "#1c2633"}">${who[0]}</div><p class="brief">${d.brief}</p></div>` : `<p class="brief">${d.brief}</p>`}
        ${d.facts ? `<div class="facts">${d.facts.map(f => `<div class="fact"><div class="v">${esc(f[1])}</div><div class="k">${esc(f[0])}</div></div>`).join("")}</div>` : ""}
        ${d.table ? tableHTML(d.table, kind === "flag", done, new Set(d.wrong || []), kind === "flag" ? res.given : null) : ""}
        <p class="q">${esc(d.q)}</p>
        ${!done ? `<p class="instr">${choice ? (isStudent() && kind === "mcq" ? "Pick one answer, then press Lock in. One try." : "Pick an answer, then press Check. You get two tries.") : INSTR[kind]}</p>` : ""}
        ${showTip ? `<div class="tipbox"><b>${isStudent() ? "Hint" : "Hint"}</b><span>${esc(d.hint)}</span></div>` : ""}
        ${input}
        ${state.msg && !done ? `<p class="err">${esc(state.msg)}</p>` : ""}
        ${done ? resultHTML(tk, d, res, kind) : ""}
        ${!done && !(state.hintOpen || res.hint) ? `<div class="row-btns" style="margin-top:14px"><button class="btn plain" data-act="hint">${isStudent() ? "Show hint (−25%)" : "Need a hint?"}</button></div>` : ""}
        ${!done && aiState === "ready" ? `<div class="mentor"><form data-form="mentor"><input id="mentorq" maxlength="240" autocomplete="off" placeholder="Stuck? Ask the AI mentor to explain…" aria-label="Ask the AI mentor"><button class="btn plain" type="submit" style="background:#fff">Ask</button></form>${state.mentor ? `<div class="out">${esc(state.mentor)}</div>` : ""}<div class="label" style="color:var(--ink-dim);margin-top:6px">Explains without giving the answer${isStudent() ? " · counts as a hint" : ""} · uses your Claude account</div></div>` : ""}
        ${done ? `<div class="row-btns" style="margin-top:16px">${prac ? `<button class="btn red" data-act="practice" data-id="practice">Another one</button><button class="btn plain" data-act="endpractice">Done practising</button>` : `<button class="btn red" data-act="${tk.key === "cap" ? "finish" : "close"}">${tk.key === "cap" ? "Hand in the report" : "Continue"}</button>${tk.key !== "cap" ? `<button class="btn plain" data-act="practice" data-id="${tk.key}">Practice a similar one</button>` : ""}`}</div>` : ""}
      </article></section>`;
  },
  report: () => {
    const rp = state.report;
    return `<article class="paper fadein"><div class="letterhead"><div class="co">${isStudent() ? "Engagement report" : "Job report"}</div><div class="label">${esc(rp.client)} · ${esc(rp.service)}</div></div>
      <div class="score-top"><div><span class="label">Score</span><div class="bigscore num" id="bigscore">0</div><span class="label">of ${N(rp.max)} · ${Math.round(rp.pct)}%</span><div class="stars">${stars(rp.pct)}</div></div>
      <div class="rank stamp-in" style="animation-delay:1.1s">+${N(rp.xp)} XP<small>${[rp.daily ? "daily 1.5×" : "", rp.sb ? `🔥 streak +${rp.sb}%` : ""].filter(Boolean).join(" · ") || esc(RANKS[rp.after])}</small></div></div>
      ${rp.bonus ? `<p class="bonusline">⭐ <b>Bonus +${rp.bonus}:</b> ${rp.bonusList.map(b => esc(b.label)).join(", ")}</p>` : ""}
      ${rp.newDay ? `<p class="streakline">🔥 <b>${rp.streak}-day streak!</b> ${rp.streak > 1 ? `Play tomorrow to keep it going${rp.sb < 25 ? ` and raise your bonus to +${streakBonus(rp.streak + 1)}%` : ""}.` : "Come back tomorrow to start a streak and earn bonus XP."}</p>` : ""}
      ${rp.interview ? `<div class="ivcta"><b>${rp.justEarned ? "You've earned a promotion interview!" : "Your promotion interview is waiting."}</b><span>${esc(interviewer(rp.after + 1).name)} wants to see you about becoming <b>${RANKS[rp.after + 1]}</b>. Get 2 of 3 questions right to be promoted.</span></div>` : ""}
      <h3 class="section-h">Task by task</h3><p style="margin:-4px 0 10px;color:var(--ink-dim);font-size:14px">Tap a task to see how it's solved.</p>
      <div class="stack">${rp.items.map(t => `<details ${t.frac < .99 ? "open" : ""}><summary><span>${t.frac >= .99 ? "✓" : t.frac > 0 ? "½" : "✗"} ${esc(t.title)}${t.cap ? " (final)" : ""}</span><span class="num">${t.pts}/${t.max}</span></summary><ol class="steps">${stepsOf(t.explain).map(s => `<li>${s}</li>`).join("")}</ol><p class="key"><b>Remember:</b> ${esc(t.hint)}</p></details>`).join("")}</div>
      <div class="feedback-cta"><b>Testing the game?</b> Tell me what you thought. It takes 2 minutes. <a class="btn" href="${FEEDBACK_URL}" target="_blank" rel="noopener">Give feedback</a></div>
      <div class="row-btns" style="margin-top:20px">${rp.interview ? `<button class="btn red" data-act="interview">Go to the interview</button><button class="btn plain" data-act="hub">Later</button>` : `<button class="btn red" data-act="hub">Back to the firm</button>`}</div></article>`;
  },
  promo: () => { const rp = state.promo, iv = interviewer(rp.after); return `<article class="paper memo fadein"><div class="promo"><span class="label">Haddad &amp; Partners · Promotion</span><div class="big stamp-in">${esc(RANKS[rp.after])}</div>
    <div class="npc-line" style="justify-content:center"><div class="av" style="background:${iv.col}">${iv.av}</div></div>
    <p>"${hi("Congratulations")}! You got ${rp.right} out of 3 in your interview. You're our new ${RANKS[rp.after]}. From your next ${JOB()} you'll handle ${engLength(rp.after)} tasks${!isStudent() && funTier(rp.after) > funTier(rp.before) ? `, and the questions get a bit trickier (new question types unlocked)` : ""}. ${perkLine(rp.after)}"</p><span class="sig">${esc(iv.name)}</span>
    <button class="btn red" data-act="hub">Back to the firm</button></div></article>`; },
  interview: () => {
    const iv = state.iv, who = interviewer(iv.target);
    if (iv.done) return `<article class="paper memo fadein"><div class="letterhead"><div class="co">Promotion interview</div><div class="label">${RANKS[iv.target]}</div></div>
      <div class="npc-line"><div class="av" style="background:${who.col}">${who.av}</div><div><h2>Not this time</h2><p>"You got ${iv.right} out of 3${myName() ? ", " + esc(myName()) : ""}. You need 2 to pass. You saw the right answers along the way, so finish one more ${JOB()}, and come back. I know you can do it."</p></div></div>
      <button class="btn red" data-act="hub">Back to the firm</button></article>`;
    const q = iv.qs[iv.i], answered = iv.picked !== null;
    return `<section class="fadein"><article class="paper">
      <div class="letterhead"><div class="co">Promotion interview · ${RANKS[iv.target]}</div><div class="label">Question ${iv.i + 1} of 3 · ${iv.right} right</div></div>
      <div class="ivdots">${iv.qs.map((x, i) => `<i class="${i < iv.i ? "past" : i === iv.i ? "now" : ""}"></i>`).join("")}</div>
      <div class="npc-line"><div class="av" style="background:${who.col}">${who.av}</div><div><b>${esc(who.name)}</b><small style="display:block;color:var(--ink-dim)">${esc(who.role)}</small>${q.brief ? `<p class="brief">${q.brief}</p>` : iv.i === 0 ? `<p class="brief">"${hi("Thanks for coming in")}. I have three questions for you. Get two right and the job is yours."</p>` : ""}</div></div>
      ${q.facts ? `<div class="facts">${q.facts.map(f => `<div class="fact"><div class="v">${esc(f[1])}</div><div class="k">${esc(f[0])}</div></div>`).join("")}</div>` : ""}
      ${q.table ? tableHTML(q.table, false, false, new Set(), null) : ""}
      <p class="q">${esc(q.q)}</p>
      <div class="choices">${q.options.map((o, i) => answered ? `<div class="choice ${i === q.correct ? "right" : i === iv.picked ? "wrong" : "dim"}"><b>${i === q.correct ? "✓ " : i === iv.picked ? "✗ " : ""}${esc(o)}</b></div>` : `<button class="choice ${iv.sel === i ? "sel" : ""}" data-act="ivopt" data-id="${i}"><b>${esc(o)}</b></button>`).join("")}</div>
      ${answered ? `<div class="result ${iv.picked === q.correct ? "good" : "bad"}"><div class="res-h"><b class="t">${iv.picked === q.correct ? "✓ Good answer" : "✗ Not quite"}</b></div><div class="howto"><ol>${stepsOf(q.explain).map(x => `<li>${x}</li>`).join("")}</ol></div></div>
        <div class="row-btns" style="margin-top:14px"><button class="btn red" data-act="ivnext">${iv.i < 2 ? "Next question" : "Hear the decision"}</button></div>`
      : `<p class="instr">One try per question. Use the calculator if you need it.</p><div class="row-btns" style="margin-top:12px"><button class="btn red" data-act="ivsubmit" ${iv.sel === null ? "disabled" : ""}>Lock in</button><button class="btn ghost calc-btn" data-act="calc" aria-pressed="${calc.open}" style="color:var(--ink)">Calculator</button></div>`}
    </article></section>`;
  },
  event: () => { const e = eventCard(); return `<article class="paper memo fadein"><div class="letterhead"><div class="co">Surprise!</div><div class="label">Bonus +${e.bonus} pts</div></div>
    <div class="npc-line"><div class="av" style="background:${e.col}">${esc(e.av)}</div><div><b>${esc(e.who)}</b><small style="display:block;color:var(--ink-dim)">${esc(e.role)}</small><h2 style="margin-top:6px">${e.h}</h2><p>${e.body}</p></div></div>
    <div class="row-btns"><button class="btn red" data-act="evyes">${esc(e.yes)}</button><button class="btn plain" data-act="evno">${esc(e.no)}</button></div></article>`; },
  call: () => {
    const c = state.call, ans = c.picked !== null, ok = c.picked === c.correct, cl = ENG.client;
    return `<section class="fadein"><article class="paper callcard">
      <div class="letterhead"><div class="co">📞 ${esc(cl.exec)} on the line</div><div class="label">${ans ? (ok ? `+${EV_BONUS.call} bonus` : "No bonus") : `<span id="calltime" class="calltime">${Math.max(0, Math.ceil((c.end - performance.now()) / 1000))}s</span>`}</div></div>
      <p class="brief">${c.brief}</p>
      ${c.facts ? `<div class="facts">${c.facts.map(f => `<div class="fact"><div class="v">${esc(f[1])}</div><div class="k">${esc(f[0])}</div></div>`).join("")}</div>` : ""}
      ${c.table ? tableHTML(c.table, false, false, new Set(), null) : ""}
      <p class="q">${esc(c.q)}</p>
      <div class="choices">${c.options.map((o, i) => ans ? `<div class="choice ${i === c.correct ? "right" : i === c.picked ? "wrong" : "dim"}"><b>${i === c.correct ? "✓ " : i === c.picked ? "✗ " : ""}${esc(o)}</b></div>` : `<button class="choice ${c.sel === i ? "sel" : ""}" data-act="callopt" data-id="${i}"><b>${esc(o)}</b></button>`).join("")}</div>
      ${ans ? `<div class="result ${ok ? "good" : "bad"}"><div class="res-h"><b class="t">${ok ? "✓ Great answer!" : c.timedOut ? "⏱ Out of time" : "✗ Not quite"}</b><span class="pts">${ok ? "+" + EV_BONUS.call + " bonus" : ""}</span></div><div class="howto"><ol>${stepsOf(c.explain).map(x => `<li>${x}</li>`).join("")}</ol></div></div>
        <div class="row-btns" style="margin-top:14px"><button class="btn red" data-act="close">${ok ? `"Thanks! That's exactly what I needed."` : "Back to work"}</button></div>`
      : `<div class="row-btns" style="margin-top:12px"><button class="btn red" data-act="callsubmit" ${c.sel === null ? "disabled" : ""}>Answer</button><button class="btn ghost calc-btn" data-act="calc" aria-pressed="${calc.open}" style="color:var(--ink)">Calculator</button></div>`}
    </article></section>`;
  },
  badges: () => `<article class="paper memo fadein"><div class="letterhead"><div class="co">Badges</div><div class="label">${Object.keys(save.badges).length} of ${BADGES.length} unlocked</div></div>
    <div class="badges">${BADGES.map(b => { const got = save.badges[b.id]; return `<div class="bdg ${got ? "got" : ""}"><span class="bi">${got ? b.ic : "🔒"}</span><b>${esc(b.name)}</b><small>${esc(b.how)}</small></div>`; }).join("")}</div>
    <p style="color:var(--ink-dim);font-size:14px;margin:12px 0">🔥 Best streak: <b>${save.streak.best}</b> day${save.streak.best === 1 ? "" : "s"}. Each day in a row adds +5% XP, up to +25%.</p>
    <button class="btn red" data-act="hub">Back</button></article>`,
  you: () => `<article class="paper memo fadein"><div class="letterhead"><div class="co">Your profile</div><div class="label">Haddad &amp; Partners staff card</div></div>
    <div class="staffcard">${avatarHTML(72)}<div><b>${esc(myName() || "New starter")}</b><small>${esc(RANKS[curRank()])}</small></div></div>
    <form data-form="you"><label class="label" for="yourname">Your first name</label><input id="yourname" class="namein" maxlength="16" autocomplete="off" value="${esc(myName())}" placeholder="e.g. Abdullah"></form>
    <span class="label">Your colour</span><div class="swatches">${AV_COLORS.map(c => `<button class="sw ${save.color === c ? "sel" : ""}" style="background:${c}" data-act="color" data-id="${c}" aria-label="Colour ${c}"></button>`).join("")}</div>
    <p style="color:var(--ink-dim);font-size:14px">Coworkers will greet you by name, and your name goes on your desk and promotion letters.</p>
    <div class="row-btns"><button class="btn red" data-act="saveyou">Save</button>${state.youNext ? "" : `<button class="btn plain" data-act="hub">Cancel</button>`}</div></article>`,
};
const PERKS = ["", "You get your own desk with your nameplate.", "Your desk gets a plant and a photo frame.", "You get your own private office.", "Your office gets a whiteboard for leading the team.", "Your office gets a sofa for meeting clients.", "You move into the corner office, with windows on two sides.", "A gold trophy for your desk. You've made it to the top."];
const perkLine = rk => PERKS[rk] || "";
function ladderHTML() { const rk = curRank(); return `<div class="ladder">${RANKS.map((n, i) => `<div class="rung ${i === rk ? "me" : i < rk ? "past" : ""}"><span class="n">${i + 1}</span><b>${n}${i === rk ? " · you" : ""}</b><span class="x">${N(XP_AT[i])} XP</span></div>`).reverse().join("")}</div>`; }

function renderUI() {
  if (!ENG) ensureHQWorld();
  renderHud();
  if (!["task", "interview", "call"].includes(state.ui) && calc.open) toggleCalc(false);
  if (!state.ui) { ov.hidden = true; ov.innerHTML = ""; return; }
  ov.hidden = false; ov.innerHTML = `<div class="ov-inner">${views[state.ui]()}</div>`;
  if (state.ui === "report") countUp();
  if (state.ui === "task") { const a = document.getElementById("ans"); if (a && !isTouch && !calc.open) a.focus({ preventScroll: true }); }
  if (!["task", "interview", "call"].includes(state.ui) && calc.open) toggleCalc(false); else renderCalc();
}
function countUp() {
  const target = state.report.score, el = document.getElementById("bigscore"), t0 = performance.now();
  const f = now => { if (!el.isConnected) return; const p = Math.min(1, (now - t0) / 1000); el.textContent = N(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) { if (Math.random() < .3) Audio.play("tick"); requestAnimationFrame(f); } };
  requestAnimationFrame(f); setTimeout(() => { Audio.play("stamp"); setTimeout(() => Audio.play(state.report.pct >= 50 ? "fanfare" : "bad"), 250); }, 1150);
}
async function askMentor(q) {
  if (!sample || !q.trim() || state.mentorBusy) return;
  const tk = taskByKey(state.task), d = tk.d, res = resOf(tk.key);
  const data = [d.facts ? d.facts.map(f => `${f[0]}: ${f[1]}`).join("; ") : "", d.table ? [d.table.cols.join(" | "), ...d.table.rows.map(r => r.join(" | "))].join("\n") : "", d.options ? "Options: " + d.options.join(" / ") : "", d.items ? "Items: " + d.items.map(i => i.text).join("; ") + "; categories: " + d.cats.join(", ") : ""].filter(Boolean).join("\n");
  const prompt = `You are a friendly mentor inside a business-training game. The player is ${isStudent() ? `a year ${save.year} ${save.major} student` : "a curious beginner with no business background"}. Help them understand the concept and how to approach the task in under 90 words, plain text, no markdown. Never state the final number, the correct option, or which rows or items are wrong or where they go.\n\nTask: ${tk.T.title}\n${d.brief.replace(/<[^>]+>/g, "")}\n${data}\nQuestion: ${d.q}\n\nPlayer asks: ${q.trim()}`;
  state.mentorBusy = true; state.mentor = "Thinking…"; if (tk.key !== "practice") { res.hint = true; storeEng(); } renderUI();
  try { await sample(prompt, { modelTier: "quick", cache: false, onText: ({ text }) => { state.mentor = text; const o = ov.querySelector(".mentor .out"); if (o) o.textContent = text; } }); }
  catch (e) { const off = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e && e.code); if (off) aiState = "off"; state.mentor = off ? "The mentor isn't available here. Try the tip instead." : "The mentor was interrupted. Try again in a moment."; }
  state.mentorBusy = false; if (state.ui === "task") renderUI();
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-act]"); if (!t) return;
  const act = t.dataset.act, id = t.dataset.id;
  Audio.init();
  switch (act) {
    case "mode": save.mode = id; persist(); Audio.play("click"); state.ui = id === "student" ? "ob1" : save.onboarded ? "hub" : "ob2"; if (!save.onboarded && !myName() && id !== "student" && !state.youSeen) { state.youSeen = true; state.youNext = state.ui; state.ui = "you"; } renderUI(); break;
    case "major": save.major = id; persist(); Audio.play("click"); renderUI(); break;
    case "year": save.year = +id; persist(); Audio.play("click"); renderUI(); break;
    case "ob0": case "ob1": case "ob2": case "ob3": Audio.play("paper"); state.obReturn = null; state.ui = act; if (act === "ob2" && !save.onboarded && !myName() && !state.youSeen) { state.youSeen = true; state.youNext = "ob2"; state.ui = "you"; } renderUI(); ov.scrollTop = 0; break;
    case "howto": state.obReturn = "hub"; state.ui = "ob3"; Audio.play("paper"); renderUI(); break;
    case "finishob": save.onboarded = true; persist(); Audio.play("stamp"); state.ui = "hub"; renderUI(); break;
    case "hub": Audio.play("paper"); state.obReturn = null; if (ENG) leaveToHub(); else { state.ui = "hub"; state.confirm = null; renderUI(); } break;
    case "devrank": career().xp = XP_AT[+id]; career().rank = +id; career().ivWait = 0; persist(); Audio.play("stamp"); renderUI(); break;
    case "deviv": { const c = career(); if (c.rank < RANKS.length - 1) { c.xp = Math.max(c.xp, XP_AT[c.rank + 1]); c.ivWait = 0; persist(); } renderUI(); break; }
    case "interview": if (!interviewReady()) break; if (ENG && !ENG.done) { leaveToHub(); } state.iv = newInterview(); Audio.play("paper"); state.ui = "interview"; renderUI(); ov.scrollTop = 0; break;
    case "ivopt": if (state.iv.picked === null) { state.iv.sel = +id; Audio.play("click"); renderUI(); } break;
    case "ivsubmit": interviewAnswer(); break;
    case "ivnext": interviewNext(); ov.scrollTop = 0; break;
    case "hq": Audio.play("stamp"); state.ui = null; state.confirm = null; renderUI(); updatePrompt(); toast(state.hqSeen ? "Back at Haddad & Partners." : `Follow the arrow to ${WS_NAME[hqCfg().ws].toLowerCase()}.`); break;
    case "evyes": acceptEvent(); break;
    case "evno": declineEvent(); break;
    case "callopt": if (state.call && state.call.picked === null) { state.call.sel = +id; Audio.play("click"); renderUI(); startCallTimer(); } break;
    case "callsubmit": if (state.call && state.call.sel !== null) finishCall(state.call.sel); break;
    case "badges": Audio.play("paper"); state.ui = "badges"; renderUI(); break;
    case "you": Audio.play("paper"); state.ui = "you"; renderUI(); break;
    case "color": { const nm = document.getElementById("yourname"); if (nm) save.name = nm.value.trim().slice(0, 16); save.color = id; Audio.play("click"); renderUI(); break; }
    case "saveyou": { const nm = document.getElementById("yourname"); save.name = nm ? nm.value.trim().replace(/\s+/g, " ").slice(0, 16) : save.name; persist(); if (save.name) award("named"); Audio.play("stamp"); const nx = state.youNext; state.youNext = null; state.ui = nx || "hub"; renderUI(); break; }
    case "ladder": Audio.play("paper"); state.ui = "ladder"; renderUI(); break;
    case "resume": Audio.play("stamp"); startEngagement(save.cur[save.mode]); break;
    case "new": if (save.cur[save.mode]) { state.confirm = "new"; renderUI(); break; } Audio.play("stamp"); startEngagement(newEngagement(false)); break;
    case "daily": if (save.cur[save.mode]) { state.confirm = "daily"; renderUI(); break; } Audio.play("stamp"); startEngagement(newEngagement(true)); break;
    case "reset": state.confirm = "reset"; renderUI(); break;
    case "confirmno": state.confirm = null; renderUI(); break;
    case "confirmyes": { const c = state.confirm; state.confirm = null;
      if (c === "reset") { save = freshSave(save.music, save.sfx); persist(); state.ui = "ob0"; renderUI(); }
      else { save.cur[save.mode] = null; persist(); Audio.play("stamp"); startEngagement(newEngagement(c === "daily")); }
      break; }
    case "briefed": ENG.briefed = true; storeEng(); if (save.coach < 2) { save.coach = 2; persist(); } Audio.play("task"); closeUI(); break;
    case "tasks": if (ENG) { Audio.play("paper"); openUI("overview"); } break;
    case "menu": Audio.play("paper"); leaveToHub(); break;
    case "close": Audio.play("paper"); closeUI(); break;
    case "opt": state.sel = +id; Audio.play("click"); renderUI(); break;
    case "flagrow": { const i = +id; state.picks.has(i) ? (state.picks.delete(i), Audio.play("unstamp")) : (state.picks.add(i), Audio.play("stamp")); renderUI(); break; }
    case "submit": submitTask(); break;
    case "calc": toggleCalc(); renderUI(); break;
    case "hint": { const res = resOf(taskByKey(state.task).key); if (!res.hint && state.task !== "practice") { res.hint = true; storeEng(); } state.hintOpen = true; Audio.play("paper"); renderUI(); break; }
    case "practice": Audio.play("paper"); startPractice(id); break;
    case "endpractice": { Audio.play("paper"); const back = state.practiceFrom; state.practiceFrom = null; state.practiceTask = null; if (back && back !== "practice") openTask(back); else closeUI(); break; }
    case "finish": finishEngagement(); break;
    case "promo": Audio.play("promo"); state.ui = "promo"; renderUI(); break;
    case "music": save.music = !save.music; persist(); Audio.setMusic(save.music); renderHud(); break;
    case "sfx": save.sfx = !save.sfx; persist(); Audio.setSfx(save.sfx); renderHud(); if (save.sfx) Audio.play("click"); break;
  }
});
ov.addEventListener("change", e => { const s = e.target.closest("[data-cls]"); if (s) { if (s.value) state.cls[+s.dataset.cls] = s.value; else delete state.cls[+s.dataset.cls]; Audio.play("click"); } });
ov.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches("tr.row[data-act]")) { e.preventDefault(); e.target.click(); } });
ov.addEventListener("submit", e => {
  e.preventDefault();
  if (e.target.matches('[data-form="ans"]')) submitTask();
  if (e.target.matches('[data-form="you"]')) document.querySelector('[data-act="saveyou"]').click();
  if (e.target.matches('[data-form="mentor"]')) { const b = document.getElementById("mentorq"); const q = b.value; b.value = ""; askMentor(q); }
});

/* ============================== BOOT ============================== */
function boot() {
  if (isTouch) document.body.classList.add("touch");
  if (!gl) { document.body.insertAdjacentHTML("beforeend", `<div id="nogl"><div><h2 class="display" style="font-size:40px">3D isn't available</h2><p style="color:var(--chalk-dim)">This browser or device couldn't start WebGL. Try a recent version of Chrome, Edge, Safari or Firefox.</p></div></div>`); return; }
  initGL(); ensureHQWorld(true);
  renderUI(); updatePrompt();
  requestAnimationFrame(frame);
}
if (location.hash === "#test") window.__tt = { get state() { return state; }, get save() { return save; }, get eng() { return ENG; }, get guide() { return guide; }, go(x, z, yaw, pitch = 0) { Object.assign(state.player, { x, z, yaw, pitch }); }, near: () => near && near.id, interact, newEngagement, startEngagement, finishEngagement, STATIONS, colliders: () => colliders, pathTo, openTask, inter: () => INTER, cw: () => CW };
boot();
