/* ============================== THE CITY BLOCK ==============================
   Outside the lobby doors: a pavement, a two-lane road with a zebra crossing and signals, traffic,
   palm trees and street lights, and three buildings across the street. z 24–44. */
const DOOR_X = 11.2, CROSS = [9.6, 12.8], ROAD = [27, 35];
let CARS = [], PEDS = [];
const CAR_COLS = ["#c8372d", "#f2f2f2", "#1b1b1f", "#2f6db3", "#e8dcc4", "#7c8796"];
function carMesh(col, taxi) {
  CUR = {};
  box(0, .28, 0, 4.2, .55, 1.8, col, { flat: true }); box(-.2, .8, 0, 2.3, .5, 1.6, col, { flat: true });
  box(.92, .82, 0, .02, .42, 1.5, "#22303f", { flat: true, em: .1 }); box(-1.32, .82, 0, .02, .42, 1.5, "#22303f", { flat: true }); box(-.2, .82, .81, 2.1, .4, .02, "#22303f", { flat: true }); box(-.2, .82, -.81, 2.1, .4, .02, "#22303f", { flat: true });
  [[1.35, .9], [-1.35, .9], [1.35, -.9], [-1.35, -.9]].forEach(([x, z]) => { cyl(x, .32, z - Math.sign(z) * .05, .32, .2, "#111", { seg: 12, sz: 1 }); });
  box(2.1, .45, .6, .04, .14, .3, "#fff6d0", { em: 1, flat: true }); box(2.1, .45, -.6, .04, .14, .3, "#fff6d0", { em: 1, flat: true });
  box(-2.1, .5, .6, .04, .12, .3, "#ff2a2a", { em: .9, flat: true }); box(-2.1, .5, -.6, .04, .12, .3, "#ff2a2a", { em: .9, flat: true });
  if (taxi) { box(-.2, 1.3, 0, 1.4, .06, 1.5, "#c8372d", { flat: true }); box(-.2, 1.36, 0, .5, .16, .25, "#f2df63", { em: .8, flat: true }); }
  const out = CUR; CUR = B; return out;
}
const CAR_MESHES = {};
function palm(x, z) {
  cyl(x, 0, z, .18, 4.6, "#8a6a48", { r2: .12, seg: 10, tex: "wood", tile: .6 });
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; box(x + Math.cos(a) * .9, 4.45 - .25, z + Math.sin(a) * .9, Math.abs(Math.cos(a)) * 1.6 + .25, .08, Math.abs(Math.sin(a)) * 1.6 + .25, "#2e7d4f", { flat: true }); }
  sph(x, 4.6, z, .35, "#3d8a55", { seg: 10, rings: 6 }); colliders.push([x - .25, z - .25, x + .25, z + .25]);
}
function streetLight(x, z, face) { cyl(x, 0, z, .07, 5.2, "#2b313a", { seg: 8 }); box(x, 5.1, z + face * .6, .14, .08, 1.3, "#2b313a", { flat: true }); box(x, 5.0, z + face * 1.2, .5, .1, .35, "#fff1d0", { em: 1, flat: true }); colliders.push([x - .15, z - .15, x + .15, z + .15]); }
function tower(x0, x1, z0, h, col, label, sign, entrance) {
  const w = x1 - x0, cx = (x0 + x1) / 2;
  solid(cx, 0, z0 + 4, w, h, 8, col, { tex: "facade", tile: 4, flat: true });
  box(cx, 0, z0 - .02, w, 3.4, .04, "#0d141c", { flat: true }); box(cx, 3.4, z0 - .05, w + .2, .25, .3, sign, { flat: true, em: .35 });
  if (entrance) { box(entrance, 0, z0 - .06, 2.4, 2.6, .04, "#9fc6de", { em: .25, flat: true }); box(entrance, 2.6, z0 - .1, 2.8, .18, .4, sign, { flat: true, em: .4 }); }
  for (let x = x0 + 1; x < x1 - .5; x += 2.2) box(x, 0, z0 - .04, .08, 3.4, .06, "#2b313a", { flat: true });
}
function buildStreet(cfg) {
  const firm = cfg.hq ? null : cfg.logo;
  // our building's street face: tower above the ground floor, lobby door and café windows
  box(24, WALL_H, 24.2, 48.4, 22, .4, "#ffffff", { tex: "facade", tile: 4, flat: true });
  box(DOOR_X, 2.62, 24.32, 2.2, .3, .2, "#c9a24a", { flat: true, em: .4 });
  // pavements, kerbs, road, markings, crossing
  box(24, -.1, 25.6, 64, .12, 3.2, "#ffffff", { top: "stone", topTile: 1.6, flat: true, skip: ["-y"] });
  box(24, -.1, 36.5, 64, .12, 3, "#ffffff", { top: "stone", topTile: 1.6, flat: true, skip: ["-y"] });
  box(24, -.12, 31, 64, .1, 8, "#2a2d31", { top: "concrete", topTile: 3, topColor: "#3a3e44", flat: true, skip: ["-y"] });
  box(24, -.1, 27.15, 64, .14, .3, "#9a9a92", { flat: true }); box(24, -.1, 34.85, 64, .14, .3, "#9a9a92", { flat: true });
  for (let x = -8; x < 56; x += 4) if (x + 2 < CROSS[0] - .5 || x > CROSS[1] + .5) box(x + 1, -.015, 31, 2, .01, .14, "#e8e2c8", { flat: true, em: .1 });
  for (let z = 27.6; z < 34.6; z += .9) box((CROSS[0] + CROSS[1]) / 2, -.012, z, CROSS[1] - CROSS[0], .01, .45, "#f2f2ee", { flat: true, em: .12 });
  box(24, -.3, 46, 80, .1, 30, "#11161d", { flat: true });
  // across the street
  tower(-4, 15, 38.2, 26, "#b9c3cc", firm ? "HADDAD & PARTNERS" : "FALCON ADVISORY", firm ? "#1b2a40" : "#5a1f24", DOOR_X);
  tower(16, 30, 38.2, 14, "#d8cbb4", "METRO · SHOPS", "#c8372d", 23);
  tower(31, 54, 38.2, 32, "#9fb0bf", firm ? "FALCON ADVISORY" : "GULF PLAZA", firm ? "#5a1f24" : "#2f6db3", 42);
  box(23, 0, 37.4, 3.6, .1, 1.2, "#c8372d", { flat: true, em: .2 }); box(23, 2.3, 37.5, 3.8, .5, .3, "#c8372d", { flat: true, em: .5 }); box(23, 0, 36.9, .12, 2.3, .12, "#2b313a", { flat: true }); box(21.3, 0, 36.9, .12, 2.3, .12, "#2b313a", { flat: true }); box(24.7, 0, 36.9, .12, 2.3, .12, "#2b313a", { flat: true });
  // kiosk on the far pavement
  solid(4, 0, 37.2, 2.4, 1.1, 1.2, "#6b3f22", { tex: "wood", tile: .6 }); box(4, 2.3, 37.2, 2.8, .12, 1.6, "#c9a24a", { flat: true, em: .2 }); box(2.9, 0, 36.6, .08, 2.3, .08, "#2b313a", { flat: true }); box(5.1, 0, 36.6, .08, 2.3, .08, "#2b313a", { flat: true });
  // trees, lights, benches, bollards
  for (const x of [-2, 6, 18, 26, 34, 42, 50]) palm(x, 26.2);
  for (const x of [0, 16, 30, 46]) palm(x, 36.2);
  for (const x of [2, 22, 38]) streetLight(x, 26.6, 1); for (const x of [8, 28, 44]) streetLight(x, 35.4, -1);
  bench(14.5, 25.2); bench(32, 25.2); bench(36, 37.4);
  for (const x of [CROSS[0] - .3, CROSS[1] + .3]) for (const z of [26.8, 35.2]) { cyl(x, 0, z, .09, .9, "#c9a24a", { seg: 8, em: .2 }); colliders.push([x - .12, z - .12, x + .12, z + .12]); }
  // signal poles (the lights themselves are drawn each frame)
  for (const [x, z] of [[CROSS[0] - .6, 26.7], [CROSS[1] + .6, 35.3]]) { cyl(x, 0, z, .07, 2.6, "#2b313a", { seg: 8 }); box(x, 2.1, z, .3, .7, .3, "#14171c", { flat: true }); colliders.push([x - .15, z - .15, x + .15, z + .15]); }
  // world edges
  colliders.push([-8, 24, -6.5, 40], [54.5, 24, 56, 40], [-8, 38.1, 56, 40]);
  // our own pavement end walls
  CARS = [[-6, 29.1, 1, 0], [18, 29.1, 1, 1], [40, 29.1, 1, 2], [6, 32.9, -1, 3], [30, 32.9, -1, 4], [52, 32.9, -1, 5]].map(([x, z, d, i]) => ({ x, z, d, v: 6 + (i % 3), want: 6 + (i % 3), mesh: "car" + i, wait: 0 }));
  PEDS = [{ x: 20, z: 36.3, d: 1, v: 1.1, mesh: "cwE" }, { x: 40, z: 25.5, d: -1, v: 1.0, mesh: "cwB" }, { x: -3, z: 36.6, d: 1, v: .9, mesh: "cwF" }];
}
/* traffic signal: 0–10 s cars go, 10–16 s people walk */
const walkPhase = () => (performance.now() / 1000) % 16 >= 10;
function updateCity(dt) {
  if (FLOOR !== "main" || !CARS.length) return;
  const p = state.player, walk = walkPhase(), onRoad = p.z > ROAD[0] - .3 && p.z < ROAD[1] + .3;
  for (const c of CARS) {
    const front = c.x + c.d * 2.3, toCross = c.d > 0 ? CROSS[0] - 1.2 - front : front - (CROSS[1] + 1.2);
    const playerAhead = onRoad && Math.abs(p.z - c.z) < 2.2 && (p.x - c.x) * c.d > 0 && Math.abs(p.x - c.x) < 9;
    const carAhead = CARS.some(o => o !== c && o.z === c.z && (o.x - c.x) * c.d > 0 && Math.abs(o.x - c.x) < 6.5);
    let stop = carAhead || playerAhead || (walk && toCross > -.3 && toCross < 6);
    if (playerAhead && !walk && !c.honked && Math.abs(p.x - c.x) < 6) { c.honked = true; Audio.play("honk"); }
    if (!playerAhead) c.honked = false;
    c.v += ((stop ? 0 : c.want) - c.v) * Math.min(1, dt * (stop ? 4 : 1.2));
    c.x += c.d * c.v * dt;
    if (c.x > 58) c.x = -12; if (c.x < -12) c.x = 58;
  }
  for (const q of PEDS) { q.x += q.d * q.v * dt; if (q.x > 52) q.d = -1; if (q.x < -4) q.d = 1; q.t = (q.t || 0) + dt; }
}
const carBlocks = (x, z) => FLOOR === "main" && CARS.some(c => Math.abs(c.x - x) < 2.4 && Math.abs(c.z - z) < 1.2);
function drawCity(t) {
  if (FLOOR !== "main" || !CARS.length) return;
  for (const c of CARS) { gl.uniformMatrix4fv(loc.uM, false, mul(trans(c.x, 0, c.z), rotY(c.d > 0 ? 0 : Math.PI))); for (const b of meshBufs[c.mesh]) drawBuf(b, .5); }
  for (const q of PEDS) { gl.uniformMatrix4fv(loc.uM, false, mul(trans(q.x, Math.abs(Math.sin(q.t * 7)) * .03, q.z), rotY(q.d > 0 ? Math.PI / 2 : -Math.PI / 2))); for (const b of meshBufs[q.mesh]) drawBuf(b, .12); }
  const walk = walkPhase();
  for (const [x, z] of [[CROSS[0] - .6, 26.7], [CROSS[1] + .6, 35.3]]) {
    const fz = z < 30 ? .16 : -.16;
    gl.uniformMatrix4fv(loc.uM, false, trans(x, 2.42, z + fz)); drawBuf({ tex: "white", ...(walk ? fxBufs.off : fxBufs.red) }, 0);
    gl.uniformMatrix4fv(loc.uM, false, trans(x, 2.15, z + fz)); drawBuf({ tex: "white", ...(walk ? fxBufs.green : fxBufs.off) }, 0);
  }
}
CAR_COLS.forEach((c, i) => { MESH["car" + i] = carMesh(c, i === 4); });
