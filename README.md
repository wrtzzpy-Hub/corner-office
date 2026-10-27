# Corner Office

A first-person business career game set in a Dubai finance office. You start as an intern at a professional services firm and climb to Partner by completing client engagements: walking the client's offices, pulling files, counting stock, questioning executives and making recommendations.

Play it online at **https://wrtzzpy-hub.github.io/corner-office/**, or download `index.html` and open it in any modern browser. No install, no build step, no dependencies.

## How it plays

- **Career ladder:** Intern → Analyst → Associate → Senior Associate → Manager → Senior Manager → Director → Partner. Each engagement's score becomes XP.
- **Engagements:** every engagement is a new client, with its own company, industry, executive, logo wall and office colour scheme. Tasks are spread around the building: a meeting room, a finance floor, an executive suite with skyline views, a lobby and a stockroom.
- **Two modes:**
  - *Play for fun*: a mode simple enough for kids. 18 everyday question types (giving change, profit, sale prices, saving up, needs and wants, checking a receipt, good customer service), written in plain words with small numbers. Answers are multiple choice with two tries and a free hint, and jobs are 4 to 7 tasks long.
  - *Student mode*: pick a major (Accounting, Finance, Marketing, Management or Economics) and a university year (1 to 4). About 70% of tasks come from the chosen major, answers are typed, and difficulty scales with year and rank.
- **Learning from mistakes:** a wrong answer shows your answer next to the correct one, a numbered step-by-step solution, the key idea to remember, and a button to practise a similar question with fresh numbers.
- **Guidance:** an on-screen arrow, a glowing path on the floor, a light beam over the destination and a minimap route lead the player to the nearest open task. A first-day coach walks new players through the controls.
- **Daily challenge:** one seeded engagement per day per mode, worth 1.5× XP.
- **Task types:** calculate, decide, spot the errors, sort, and count (physically counting boxes in the 3D stockroom).

## How it works

- **Procedural task generation:** 43 task templates across five business disciplines, each with up to four difficulty tiers. Every task is generated from a seeded random source, so numbers, names and correct answers change every time while staying internally consistent. A test harness generated 43,800 student variations and 54,000 Play for fun variations and checked every answer.
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
- `src/`: the readable source, split by part: question templates (`tasks.js`, `fun.js`), career and engagement logic (`career.js`), the WebGL engine and office (`engine.js`), sound (`audio.js`), movement and guidance (`play.js`), the calculator (`calc.js`) and the screens (`views.js`).
- `build.sh`: joins the files in `src/` back into `index.html`.
