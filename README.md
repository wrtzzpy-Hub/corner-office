# Corner Office

A first-person business career game set in a Dubai finance office. You start as an intern at a professional services firm and climb to Partner by completing client engagements: walking the client's offices, pulling files, counting stock, questioning executives and making recommendations.

Play it online at **https://wrtzzpy-hub.github.io/corner-office/**, or download `index.html` and open it in any modern browser. No install, no build step, no dependencies.

## How it plays

- **Career ladder:** Intern → Analyst → Associate → Senior Associate → Manager → Senior Manager → Director → Partner. Each engagement's score becomes XP. Enough XP earns a **promotion interview**: one question on professional behaviour plus two skill questions at the new level, with 2 out of 3 needed to pass.
- **Your firm:** between jobs you can walk around Haddad & Partners HQ. Your workspace grows with your rank, from the interns' hot desk to your own desk with a nameplate, a private office with promotion certificates and a trophy shelf, and finally the corner office. About ten coworkers sit at desks, walk the corridors and chat in the café, and their greetings get more respectful as you rise.
- **Streaks, badges and a profile:** a daily streak adds up to +25% XP, 16 badges unlock as you play, and players choose a name and colour that appear on nameplates, greetings and promotion letters.
- **Clients who remember you:** companies come back for more work and track how much they trust you. Good advice makes them grow from start-up to market leader, and loyal clients pay +10% XP. Poor work sends them to the rival firm, Falcon Advisory, which also competes with you in pitches.
- **Deals between companies:** from Senior Associate, clients email you about deals with each other. Each deal runs over three jobs (the offer, the invoice, the contract), and your advice decides whether it is signed.
- **Salary and shop:** every job pays a salary that rises with rank. Spend it on a desk lamp, a golden bull, an office cat, a fish tank, a neon sign, an arcade machine or a supercar, and see it all at your workspace.
- **Board meeting and mini-games:** a daily board meeting of five 25-second questions, a café till rush (give the right change against the clock) and a stockroom sort where the rules change every six items.
- **Desk computers:** at a desk the camera sits down and zooms into the monitor, which powers on into a desktop. Number tasks open in a spreadsheet with working formulas (=B2*B3, SUM, AVERAGE), decisions arrive as emails to reply to, and error-spotting tasks open as a PDF you mark with a red pen. Coworkers ping you in chat, and the setup grows to two monitors and then an ultra-wide as you rise.
- **Senior roles work like the real thing:** from Manager you can send juniors to do legwork and then review their answers, approving or sending them back. From Senior Manager, jobs are run from your own office: your assistant Hind briefs you, files arrive on your computer, clients and job candidates come to your visitor chairs, some meetings are video calls, and Ravi counts the stock for you. Senior work includes contract sign-offs, expense approvals, hiring, team performance reviews, splitting a bonus pool, budget cuts, client pitches and timed crises.
- **A city block:** client jobs start across the street. Wait for the green walking signal and cross at the zebra crossing: traffic stops for the signal (and honks if you jaywalk). The street has palm trees, street lights, a kiosk, a metro entrance, other pedestrians, and towers for Falcon Advisory and your own firm.
- **The Executive Floor:** from Senior Manager, a private lift takes you to a quiet, formal top floor with your assistant Hind, a marble-and-gold suite, a private lounge for coffee with clients, and a dining room that doubles as the boardroom. Office-based jobs run there.
- **Coffee and lunch with clients:** short conversations where listening and asking good questions win trust; a perfect meeting brings new work.
- **Story and consequences:** The Leak is a four-chapter detective story (a different mole for every player) solved by reading evidence. After each job, a big decision for the client (open a branch, hire staff, run a sale) is judged from the numbers, and you see what happened the next time you visit.
- **Collections, weekly challenge and seasons:** business cards from every client (rare and legendary ones too), a weekly 8-task challenge with a share button, and seasonal events through the year.
- **Bonus-task training:** the first three jobs teach the coffee run, the lost item and the phone call; after that every bonus task is optional.
- **Surprise events:** most jobs include one optional bonus: an urgent phone call with a 30-second question, a lost item to find and return to reception, or a coffee run from the café.
- **Engagements:** every engagement is a new client, with its own company, industry, executive, logo wall and office colour scheme. Tasks are spread around the building: a meeting room, a finance floor, an executive suite with skyline views, a private office, a corner office, a café, a lobby and a stockroom.
- **Two modes:**
  - *Play for fun*: business brain-teasers for teens and up, with no business knowledge needed. 57 question types written in plain words with small numbers. Answers are multiple choice with two tries and a free hint. Each of the three levels (Easy, Medium, Tricky) unlocks new kinds of question as well as bigger numbers: Starter covers change, splitting a bill, ranking puzzles, prices that rise and fall, stacked discounts and queues; Challenging adds UAE VAT, markup, expense-fraud cases, estimation, negotiation, profit shares and scam emails; Expert adds break-even, compound growth, overtime pay, logic puzzles about who is telling the truth, phone plans with hidden catches and cash flow. Jobs grow from 4 to 7 tasks.
  - *Student mode*: pick a major (Accounting, Finance, Marketing, Management or Economics) and a university year (1 to 4). About 70% of tasks come from the chosen major, answers are typed, and difficulty scales with year and rank.
- **Learning from mistakes:** a wrong answer shows your answer next to the correct one, a numbered step-by-step solution, the key idea to remember, and a button to practise a similar question with fresh numbers.
- **Guidance:** an on-screen arrow, a glowing path on the floor, a light beam over the destination and a minimap route lead the player to the nearest open task. A first-day coach walks new players through the controls.
- **Daily challenge:** one seeded engagement per day per mode, worth 1.5× XP.
- **Task types:** calculate, decide, spot the errors, sort, and count (physically counting boxes in the 3D stockroom).

## How it works

- **Procedural task generation:** 43 task templates across five business disciplines, each with up to four difficulty tiers. Every task is generated from a seeded random source, so numbers, names and correct answers change every time while staying internally consistent. A test harness generated 43,800 student variations and 81,000 Play for fun variations and checked every answer.
- **Custom 3D engine:** a hand-written WebGL renderer with no 3D library. All textures (marble, wood, carpet, a Dubai skyline, live market screens and a scrolling stock ticker) are painted procedurally on canvas at load time. It also handles smooth-shaded rounded shapes, transparent glass, lighting with ceiling light pools and floor reflections, collision, and line-of-sight checks for labels.
- **Navigation:** a door-graph pathfinder with collision checks routes the guidance path around furniture and through doorways.
- **Procedural audio:** footsteps that change with the floor surface, stamps, chimes and the background music are all synthesised live with the Web Audio API.
- **Optional AI mentor:** when running inside Claude, players can ask an AI mentor to explain a concept. The mentor is instructed never to reveal the answer.
- **Saving:** progress is stored in the browser's local storage.

## Controls

- **Desktop:** click the view, then W A S D to walk, mouse to look, Shift to hurry, E to interact, T for the task list.
- **Phone:** left thumb to walk, drag the right side to look, tap the yellow button to interact.

## Project structure

- `index.html`: the whole game in one file (this is what GitHub Pages serves).
- `src/`: the readable source, split by part: question templates (`tasks.js`, `fun.js`, `fun2.js`, `fun3.js`), career and engagement logic (`career.js`), interviews, streaks, badges and the shop (`progress.js`), clients, the rival firm and deals (`clients.js`), senior work, delegation and crises (`senior.js`), the WebGL engine and office (`engine.js`), sound (`audio.js`), movement, guidance and coworkers (`play.js`), surprise events (`events.js`), the desk computer with its spreadsheet, email and PDF apps (`computer.js`), the board meeting and mini-games (`minigames.js`), the Desmos-style calculator with mean, median, mode and more (`calc.js`), the Executive Floor (`exec.js`), the street (`city.js`), coffee and lunch with clients (`chat.js`), the story, decisions, weekly challenge and seasons (`story.js`) and the screens (`views.js`).
- `build.sh`: joins the files in `src/` back into `index.html`.
