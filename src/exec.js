/* ============================== THE EXECUTIVE FLOOR ==============================
   A private top floor for Senior Manager and up, reached by a private lift. Quiet and formal:
   lift lobby with your assistant, gallery, your grand suite, a private lounge for coffee with clients,
   and a dining room that doubles as the boardroom. 30 m × 22 m. */
let FLOOR = "main";
const EXEC_ROOMS = [
  { key: "lounge", name: "Private lounge", x0: 0, z0: 0, x1: 12, z1: 10, surface: "carpet" },
  { key: "suite", name: "Your suite", x0: 12, z0: 0, x1: 30, z1: 10, surface: "tile" },
  { key: "corr", name: "Gallery", x0: 0, z0: 10, x1: 30, z1: 13, surface: "tile" },
  { key: "elobby", name: "Executive lobby", x0: 0, z0: 13, x1: 10, z1: 22, surface: "tile" },
  { key: "dining", name: "Dining room and boardroom", x0: 10, z0: 13, x1: 30, z1: 22, surface: "tile" }];
const execKey = (x, z) => z < 10 ? (x < 12 ? "lounge" : "suite") : z < 13 ? "corr" : x < 10 ? "elobby" : "dining";
const EXEC_DOORS = { lounge: { x: 6, in: [6, 8.9], out: [6, 11.5] }, suite: { x: 21, in: [21, 8.9], out: [21, 11.5] }, elobby: { x: 7.3, in: [7.3, 14.3], out: [7.3, 11.5] }, dining: { x: 20, in: [20, 14.3], out: [20, 11.5] } };
const EXEC_SPOTS = {
  hind: { x: 5, z: 15.7, rot: 0 }, hindTalk: { x: 5, z: 15.7, y: 1.6, room: "elobby", ap: [5, 18.3], via: [[8.0, 17.6]], reach: 3, place: "Hind's desk by the lift" },
  lift: { x: 5, z: 21.8, y: 1.6, room: "elobby", ap: [5, 20.6], via: [[8.0, 17.8]] }, arrive: { x: 5, z: 20.6, yaw: 0, pitch: 0 },
  desk: { x: 24, z: 3.6 }, pc: { x: 24.9, z: 4.3, y: 1.5, kind: "desk", cap: 99, reach: 2.6, place: "your computer", room: "suite", ap: [25.9, 6.6] },
  visitor: { x: 23.1, z: 5.4, y: 1.75, kind: "npc", cap: 99, reach: 2.6, place: "your visitor chairs", room: "suite", ap: [22.2, 6.9] },
  screen: [24.4, 1.145, 3.783, -1], myspace: { x: 24, z: 3.6, y: 1.7, ap: [24, 6.9], room: "suite", place: "your suite on the Executive Floor", reach: 3.4 },
  coffee: { x: 6, z: 5, y: 1.2, room: "lounge", ap: [7.3, 6.6], reach: 2.8, place: "the private lounge" }, clientSeat: { x: 6, z: 3.95, rot: 0 },
  board: { x: 16, z: 17.5, y: 1.3, room: "dining", ap: [16, 15.0], reach: 3, place: "the boardroom table" }, lunch: { x: 24, z: 17.5, y: 1.3, room: "dining", ap: [24, 15.0], reach: 3, place: "the private dining table" } };

function buildExecFloor(cfg) {
  B = {}; CUR = B; colliders = []; walls2d = []; rng = 11;
  const hq = cfg.hq, gold = "#c9a24a", woodC = "#3a2618", plaster = "#ece4d4";
  ROOMS = EXEC_ROOMS;
  // floors
  box(6, -.1, 5, 12, .1, 10, "#2e3b33", { top: "carpet", topTile: 1, flat: true, skip: ["-y"] });
  box(21, -.1, 5, 18, .1, 10, "#ffffff", { top: "woodfloor", topTile: 2.2, flat: true, skip: ["-y"] });
  box(15, -.1, 11.5, 30, .1, 3, "#ffffff", { top: "dmarble", topTile: 2.4, flat: true, skip: ["-y"] });
  box(5, -.1, 17.5, 10, .1, 9, "#ffffff", { top: "dmarble", topTile: 2.4, flat: true, skip: ["-y"] });
  box(20, -.1, 17.5, 20, .1, 9, "#ffffff", { top: "woodfloor", topTile: 1.8, flat: true, skip: ["-y"] });
  for (let x = 1; x < 30; x += 2) box(x, .002, 11.5, .04, .004, 3, gold, { flat: true, em: .2 });
  // ceiling with coffers and warm lights
  box(15, WALL_H, 11, 30, .1, 22, "#f3ece0", { tex: "ceiling", tile: .6, flat: true });
  for (let x = 3; x < 30; x += 6) for (const z of [3, 7, 16, 20]) box(x, WALL_H - .03, z, 1.1, .03, 1.1, "#fff1d0", { em: 1, flat: true });
  for (let x = 2; x < 30; x += 3.5) box(x, WALL_H - .03, 11.5, .5, .03, .5, "#fff1d0", { em: 1, flat: true });
  const W = [[0, 0, 30, 0, "win"], [30, 0, 30, 10, "win"], [30, 10, 30, 22, "solid"], [0, 0, 0, 22, "solid"], [0, 22, 30, 22, "solid"], [12, 0, 12, 10, "solid"],
    [0, 10, 5, 10, "wood"], [7, 10, 20, 10, "wood"], [22, 10, 30, 10, "wood"], [0, 13, 2, 13, "solid"], [8, 13, 10, 13, "solid"], [10, 13, 19, 13, "glass"], [21, 13, 30, 13, "glass"], [10, 13, 10, 22, "solid"]];
  for (const [x1, z1, x2, z2, type] of W) {
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, hz = z1 === z2, sx = hz ? x2 - x1 + .2 : .204, sz = hz ? .2 : z2 - z1 + .16;
    if (type === "glass") {
      const prev = CUR; CUR = G; box(mx, .06, mz, x2 - x1, WALL_H - .06, .04, "#e8dcc0", { flat: true }); CUR = prev;
      colliders.push([mx - sx / 2, mz - .1, mx + sx / 2, mz + .1]);
      box(mx, 0, mz, x2 - x1, .06, .12, gold, { flat: true, em: .15 }); box(mx, WALL_H - .12, mz, x2 - x1, .12, .12, gold, { flat: true, em: .15 });
      for (let x = x1; x <= x2 + .01; x += (x2 - x1) / Math.max(1, Math.round((x2 - x1) / 1.6))) box(x, 0, mz, .05, WALL_H, .1, gold, { flat: true, em: .15 });
      continue;
    }
    walls2d.push([x1, z1, x2, z2]);
    solid(mx, 0, mz, sx, WALL_H, sz, type === "wood" ? woodC : plaster, { tex: type === "wood" ? "wood" : "plaster", tile: type === "wood" ? 1.2 : 2 });
    // dark wood wainscot and a gold rail on both faces
    box(mx, 0, mz, sx + (hz ? 0 : .06), 1.1, sz + (hz ? .06 : 0), woodC, { tex: "wood", tile: 1 });
    box(mx, 1.1, mz, sx + (hz ? 0 : .08), .04, sz + (hz ? .08 : 0), gold, { flat: true, em: .25 });
  }
  const win = (axis, a0, a1, fixed, dir, uoff) => { for (let a = a0; a < a1 - .01; a += 1.5) { const w = Math.min(1.5, a1 - a), cx = a + w / 2, u0 = a / 14 + uoff, u1 = (a + w) / 14 + uoff; if (axis === "x") { panel("skyline", cx, .35, fixed, w, 2.7, dir, .95, [u0, 0, u1, 1]); box(a, .35, fixed + .02, .06, 2.7, .06, gold, { flat: true, em: .2 }); } else { panel("skyline", fixed, .35, cx, w, 2.7, dir, .95, [u1, 0, u0, 1]); box(fixed - .02, .35, a, .06, 2.7, .06, gold, { flat: true, em: .2 }); } } };
  win("x", .1, 11.9, .11, "+z", .3); win("x", 12.1, 29.9, .11, "+z", .7); win("z", .1, 9.9, 29.89, "-x", .1);
  [[5, 7, 10, "wood"], [20, 22, 10, "wood"], [19, 21, 13, "glass"], [2, 8, 13, "solid"]].forEach(([a, b, z, t]) => {
    if (t === "glass") { box((a + b) / 2, 2.5, z, b - a, WALL_H - 2.5, .12, gold, { flat: true, em: .2 }); return; }
    box((a + b) / 2, 2.6, z, b - a - .004, WALL_H - 2.6, .196, t === "wood" ? woodC : plaster, { tex: t === "wood" ? "wood" : "plaster", tile: 1.2 });
    box((a + b) / 2, 2.54, z, b - a + .16, .07, .26, gold, { flat: true, em: .3 }); [a, b].forEach(x => box(x, 0, z, .1, 2.6, .28, gold, { flat: true, em: .2 }));
  });
  const chandelier = (x, z, r = .55) => { cyl(x, 2.35, z, .015, .85, gold, { seg: 6 }); cyl(x, 2.15, z, r, .06, gold, { seg: 18, em: .3 }); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; sph(x + Math.cos(a) * r * .85, 2.25, z + Math.sin(a) * r * .85, .07, "#fff3cf", { em: 1, seg: 8, rings: 5 }); } sph(x, 2.05, z, .16, "#fff3cf", { em: .9, seg: 10, rings: 6 }); };
  const sconce = (x, z, dir) => { box(x, 1.75, z, dir[1] === "x" ? .06 : .12, .3, dir[1] === "x" ? .12 : .06, gold, { flat: true, em: .4 }); sph(x + (dir === "+x" ? .08 : dir === "-x" ? -.08 : 0), 2.0, z + (dir === "+z" ? .08 : dir === "-z" ? -.08 : 0), .07, "#fff3cf", { em: 1, seg: 8, rings: 5 }); };
  const armchair = (x, z, dir) => sofa(x, z, dir, 1.0, true);

  /* ---- executive lobby with the private lift and your assistant ---- */
  box(5, 0, 21.9, 1.9, 2.5, .08, gold, { tex: "metal", tile: .4, em: .25 }); box(5, 0, 21.85, .02, 2.5, .02, "#3a2a10", { flat: true }); box(5, 2.55, 21.88, 2.1, .25, .06, "#1b1b1f", { flat: true }); box(5, 2.6, 21.85, .5, .12, .02, "#f2df63", { em: 1, flat: true });
  box(6.3, 1.2, 21.88, .12, .18, .04, gold, { em: .6, flat: true });
  officeChair(5, 15.7, 1); solid(5, 0, 16.5, 2.6, .95, .8, "#ffffff", { tex: "dmarble", tile: 1 }); box(5, .95, 16.5, 2.8, .05, .95, "#ffffff", { tex: "marble", tile: 1 }); box(5, .93, 16.98, 2.8, .03, .02, gold, { flat: true, em: .4 });
  monitor(5.5, 1.0, 16.35, "-z", "sheet"); box(4.2, 1.0, 16.5, .3, .02, .22, "#fbfaf4", { flat: true }); cyl(3.9, 1.0, 16.75, .07, .25, "#3f9a6b", { seg: 10 });
  panel("logo", .13, .9, 17.5, 4.2, 1.9, "+x", .55); box(.09, .85, 17.5, .06, 2.0, 4.4, woodC, { tex: "wood", tile: 1 });
  armchair(1.6, 20.9, "-z"); armchair(8.4, 20.9, "-z"); plant(9.3, 13.8, 1); plant(.8, 13.8, 1);
  /* ---- gallery ---- */
  [[3, "+z"], [10, "+z"], [26, "+z"]].forEach(([x]) => artFrame(x, 1.3, 12.88, "-z", 1.6, 1.1));
  for (const x of [2, 9, 16, 24, 28]) { sconce(x, 10.13, "+z"); }
  plant(29.3, 11.5, 1); bench(14, 12.5);
  /* ---- private lounge ---- */
  box(6, .004, 5, 7, .01, 6, "#5a2430", { tex: "fabric", tile: .8, flat: true }); box(6, .008, 5, 6.6, .01, 5.6, "#6b2a3a", { tex: "fabric", tile: .8, flat: true, em: .02 });
  armchair(6, 6.1, "-z"); armchair(6, 3.9, "+z"); cyl(6, 0, 5, .5, .42, "#1d1a18", { solid: true, capTex: "dmarble", capColor: "#ffffff", capTile: .8 }); cyl(5.85, .42, 4.95, .05, .1, "#f4f1e8", { seg: 10 }); cyl(6.15, .42, 5.05, .05, .1, "#f4f1e8", { seg: 10 });
  armchair(2.6, 8.9, "-z"); armchair(9.4, 8.9, "-z");
  solid(.75, 0, 3.6, 1.0, 1.0, 3.6, woodC, { tex: "wood", tile: .8 }); box(.75, 1.0, 3.6, 1.1, .05, 3.7, "#ffffff", { tex: "marble", tile: 1 });
  box(.75, 1.05, 2.6, .5, .5, .4, "#c4c8ce", { tex: "metal", tile: .3 }); box(.75, 1.3, 2.38, .3, .1, .02, "#1b1b1f", { flat: true }); [3.6, 3.9, 4.2].forEach(z => cyl(.75, 1.05, z, .045, .1, "#f4f1e8", { seg: 10 }));
  for (let i = 0; i < 3; i++) box(.15, 1.4 + i * .35, 3.6, .2, .03, 2.4, gold, { flat: true, em: .1 });
  plant(11.3, .9, 1); plant(.8, 9.2, 0); artFrame(11.88, 1.3, 5, "-x", 1.8, 1.2); chandelier(6, 5);
  /* ---- your suite ---- */
  const mine = hq && hq.ws === "exec", rug = mine ? hq.color : "#5a2430";
  box(24, .004, 5, 7, .01, 6.4, rug, { tex: "fabric", tile: .8, flat: true }); box(24, .008, 5, 6.4, .01, 5.8, rug, { tex: "fabric", tile: .8, flat: true, em: .03 });
  for (const [dx, dz, w, d] of [[0, -3.05, 6.9, .08], [0, 3.05, 6.9, .08], [-3.35, 0, .08, 6.1], [3.35, 0, .08, 6.1]]) box(24 + dx, .012, 5 + dz, w, .006, d, gold, { flat: true, em: .2 });
  solid(24, 0, 3.6, 3.0, .74, 1.2, "#1a120c", { tex: "wood", tile: 1 }); box(24, .74, 3.6, 3.3, .07, 1.4, "#ffffff", { tex: "dmarble", tile: 1 }); box(24, .5, 4.31, 3.0, .04, .02, gold, { em: .5, flat: true }); box(24, .1, 4.31, 3.0, .04, .02, gold, { em: .3, flat: true });
  monitor(23.6, .81, 3.8, "-z", "chart1"); monitor(24.4, .81, 3.8, "-z", "dash"); execChair(24, 2.55);
  officeChair(23.1, 5.4, -1, "#3a2e29", "leather"); officeChair(24.9, 5.4, -1, "#3a2e29", "leather");
  cyl(25.3, .81, 3.3, .08, .05, gold, { seg: 12 }); cyl(25.3, .86, 3.3, .015, .4, gold, { seg: 6 }); cyl(25.3, 1.2, 3.3, .16, .16, "#f3ead6", { r2: .1, seg: 14, em: .6 });
  solid(12.33, 0, 3, .45, 2.6, 4.2, "#2a1a10", { tex: "wood", tile: 1.2, faces: { "+x": { tex: "books", em: .02 } } });
  sofa(16.2, 9.3, "-z", 2.4, true); armchair(14.0, 7.2, "+z"); armchair(18.4, 7.2, "+z"); cyl(16.2, 0, 8.1, .55, .4, "#1d1a18", { solid: true, capTex: "dmarble", capColor: "#ffffff", capTile: .8 });
  artFrame(27.5, 1.25, 9.88, "-z", 2.4, 1.5); chandelier(16.2, 7.8, .5); chandelier(24, 5, .6);
  plant(29.3, .9, 1); cyl(28.8, 0, 8.6, .05, .9, gold, { seg: 8 }); sph(28.8, 1.15, 8.6, .25, "#3a6fa8", { seg: 16, rings: 12 }); cyl(28.8, 0, 8.6, .25, .03, gold, { seg: 14 });
  if (mine) {
    trophies(12.62, 7.2, hq.badges, 2.6);
    for (let i = 0; i < hq.rank; i++) { const z = 5.4 + (i % 4) * .78, y = 1.85 + Math.floor(i / 4) * .62; box(12.58, y - .05, z, .03, .56, .68, "#1b1b1f", { flat: true }); panel("cert", 12.6, y, z, .58, .44, "+x", .2); }
    box(24, .81, 3.05, .8, .1, .08, gold, { flat: true, em: .5 }); box(24, .82, 3.0, .6, .06, .01, hq.color, { flat: true, em: .4 });
    if (hq.rank >= 7) { cyl(22.8, .81, 3.3, .1, .05, gold, { seg: 12 }); cyl(22.8, .86, 3.3, .03, .22, gold, { seg: 8 }); sph(22.8, 1.16, 3.3, .13, "#f2df63", { em: .4, seg: 12, rings: 8 }); }
    buildDecor({ ...hq, ws: "exec" });
  }
  /* ---- dining room and boardroom ---- */
  solid(20, 0, 17.5, 9, .74, 2, "#1a120c", { tex: "wood", tile: 1 }); box(20, .74, 17.5, 9.4, .07, 2.3, "#ffffff", { tex: "wood", tile: 1.2 }); box(20, .815, 17.5, 8.6, .005, .5, "#e9e1cf", { flat: true });
  for (let i = 0; i < 6; i++) { const x = 16 + i * 1.6; officeChair(x, 15.95, 1, "#3a2e29", "leather"); officeChair(x, 19.05, -1, "#3a2e29", "leather"); if (i % 2 === 0) { cyl(x + .8, .815, 17.5, .05, .25, gold, { seg: 8 }); sph(x + .8, 1.1, 17.5, .05, "#fff3cf", { em: 1, seg: 8, rings: 5 }); } }
  for (let i = 0; i < 6; i++) { const x = 16 + i * 1.6; cyl(x, .815, 16.9, .13, .01, "#ffffff", { seg: 14 }); cyl(x, .815, 18.1, .13, .01, "#ffffff", { seg: 14 }); }
  execChair(14.6, 17.5); chandelier(17.5, 17.5); chandelier(22.5, 17.5);
  panel("chart2", 29.88, 1.1, 17.5, 3.2, 1.7, "-x", .95); box(29.92, 1.04, 17.5, .06, 1.82, 3.34, "#0b0f14", { flat: true });
  solid(20, 0, 21.6, 4, .9, .6, woodC, { tex: "wood", tile: .8 }); box(20, .9, 21.6, 4.1, .04, .7, "#ffffff", { tex: "marble", tile: 1 }); plant(11, 21.2, 1); plant(29.2, 21.2, 1);
  CW = [{ id: "hind", name: "Hind", role: "Executive assistant", mesh: "cwG_s", x: EXEC_SPOTS.hind.x, z: EXEC_SPOTS.hind.z, rot: 0, base: 0, seg: 0, t: 0, say: "", sayT: 0, greeted: false }];
  colliders.push([4.7, 15.4, 5.3, 16.0]);
  for (const n of Object.values(NPCS)) if (n.onExec) colliders.push([n.x - .3, n.z - .3, n.x + .3, n.z + .3]);
}
