/* ============================== TEXTURES ==============================
   Every surface texture is painted at load time on a canvas, so the game ships as one file. */
const TEX = {};
const SPEC = { marble: .65, dmarble: .75, woodfloor: .45, wood: .35, stone: .3, glass: 1.2, metal: .45, leather: .3, chart1: .4, chart2: .4, sheet: .3, dash: .4, ticker: .2, logo: .5, skyline: .15 };
const rr = (a, b) => a + Math.random() * (b - a);
function mkTex(name, w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h); TEX[name] = { c, g, w, h, t: null }; }
function speckle(g, w, h, n, amt, s = 2) { for (let i = 0; i < n; i++) { const v = (Math.random() - .5) * amt; g.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; g.fillRect(Math.random() * w, Math.random() * h, s, s); } }
function wrap(w, h, fn) { for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) fn(dx, dy); }
function veins(g, w, h, n, colr) {
  for (let i = 0; i < n; i++) {
    const p = [rr(0, w), rr(0, h)], c1 = [p[0] + rr(-200, 200), p[1] + rr(-200, 200)], c2 = [p[0] + rr(-250, 250), p[1] + rr(-250, 250)], e = [p[0] + rr(-300, 300), p[1] + rr(-300, 300)];
    g.strokeStyle = colr(); g.lineWidth = rr(.6, 2.4);
    wrap(w, h, (dx, dy) => { g.beginPath(); g.moveTo(p[0] + dx, p[1] + dy); g.bezierCurveTo(c1[0] + dx, c1[1] + dy, c2[0] + dx, c2[1] + dy, e[0] + dx, e[1] + dy); g.stroke(); });
  }
}
function blobs(g, w, h, n, rgb, a, rmin, rmax) {
  for (let i = 0; i < n; i++) { const x = rr(0, w), y = rr(0, h), r = rr(rmin, rmax), al = rr(0, a);
    wrap(w, h, (dx, dy) => { const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r); gr.addColorStop(0, `rgba(${rgb},${al})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, r * 2, r * 2); }); }
}
const MONO = "Menlo, Consolas, 'Courier New', monospace", SANS = "Helvetica, Arial, sans-serif", SERIF = "Georgia, 'Times New Roman', serif";
function walk(n, start, vol) { const a = [start]; for (let i = 1; i < n; i++) a.push(a[i - 1] * (1 + (Math.random() - .47) * vol)); return a; }

function buildTextures() {
  mkTex("white", 4, 4, (g) => { g.fillStyle = "#fff"; g.fillRect(0, 0, 4, 4); });
  mkTex("marble", 512, 512, (g, w, h) => { g.fillStyle = "#ece7dd"; g.fillRect(0, 0, w, h); blobs(g, w, h, 30, "150,140,125", .12, 40, 140); speckle(g, w, h, 9000, .05); veins(g, w, h, 10, () => `rgba(125,115,100,${rr(.15, .4)})`); g.fillStyle = "rgba(90,80,70,.28)"; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(0, h / 2, w, 1.5); g.fillRect(w / 2, 0, 1.5, h); });
  mkTex("dmarble", 512, 512, (g, w, h) => { g.fillStyle = "#1c2524"; g.fillRect(0, 0, w, h); blobs(g, w, h, 25, "60,80,78", .25, 40, 160); speckle(g, w, h, 6000, .06); veins(g, w, h, 12, () => `rgba(225,225,210,${rr(.12, .35)})`); });
  mkTex("woodfloor", 512, 512, (g, w, h) => {
    const rows = 8, rh = h / rows, pal = ["#6d4a32", "#7b5539", "#5f402c", "#845d40", "#70503a"];
    for (let r = 0; r < rows; r++) { g.fillStyle = pal[(r * 3 + 1) % pal.length]; g.fillRect(0, r * rh, w, rh);
      for (let k = 0; k < 26; k++) { g.strokeStyle = `rgba(${Math.random() < .5 ? "30,18,10" : "160,120,80"},${rr(.05, .14)})`; g.lineWidth = rr(.5, 1.5); const y = r * rh + rr(2, rh - 2), ph = rr(0, 6); g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x / 60 + ph) * 1.5); g.stroke(); }
      g.fillStyle = "rgba(20,10,5,.45)"; g.fillRect(0, r * rh, w, 1.5); const s = rr(60, w - 60); g.fillRect(s, r * rh, 1.5, rh); }
    speckle(g, w, h, 4000, .05, 1);
  });
  mkTex("carpet", 256, 256, (g, w, h) => { g.fillStyle = "#8e939b"; g.fillRect(0, 0, w, h); speckle(g, w, h, 26000, .2, 1); for (let y = 0; y < h; y += 4) { g.fillStyle = `rgba(0,0,0,${y % 8 ? .02 : .05})`; g.fillRect(0, y, w, 1); } g.fillStyle = "rgba(0,0,0,.14)"; g.fillRect(0, 0, w, 1.5); g.fillRect(0, 0, 1.5, h); });
  mkTex("concrete", 512, 512, (g, w, h) => { g.fillStyle = "#a5a5a1"; g.fillRect(0, 0, w, h); blobs(g, w, h, 40, "70,70,65", .14, 30, 120); blobs(g, w, h, 20, "220,220,215", .1, 30, 100); speckle(g, w, h, 16000, .1, 1.5); g.fillStyle = "rgba(40,40,40,.35)"; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); });
  mkTex("stone", 512, 512, (g, w, h) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const v = 205 + Math.random() * 14; g.fillStyle = `rgb(${v},${v - 3},${v - 9})`; g.fillRect(i * 256, j * 256, 256, 256); } blobs(g, w, h, 20, "150,145,135", .1, 30, 110); speckle(g, w, h, 12000, .06, 1.5); g.fillStyle = "rgba(70,65,60,.35)"; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(0, 256, w, 2); g.fillRect(256, 0, 2, h); });
  mkTex("plaster", 256, 256, (g, w, h) => { g.fillStyle = "#f1eee8"; g.fillRect(0, 0, w, h); speckle(g, w, h, 9000, .035, 2); });
  mkTex("wood", 512, 512, (g, w, h) => { g.fillStyle = "#6f4b31"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2.2) { g.strokeStyle = `rgba(${Math.random() < .5 ? "35,20,10" : "170,125,85"},${rr(.04, .16)})`; g.lineWidth = rr(.6, 1.8); const ph = rr(0, 6), a = rr(1, 4); g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x / 90 + ph) * a + Math.sin(x / 23 + ph) * .6); g.stroke(); } speckle(g, w, h, 3000, .05, 1); });
  mkTex("leather", 256, 256, (g, w, h) => { g.fillStyle = "#3a2e29"; g.fillRect(0, 0, w, h); blobs(g, w, h, 30, "0,0,0", .25, 10, 50); blobs(g, w, h, 20, "120,95,80", .15, 10, 40); speckle(g, w, h, 12000, .1, 1); });
  mkTex("fabric", 256, 256, (g, w, h) => { g.fillStyle = "#a9abb0"; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 2) { g.fillStyle = `rgba(0,0,0,${i % 4 ? .05 : .09})`; g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); } speckle(g, w, h, 12000, .12, 1); });
  mkTex("metal", 256, 256, (g, w, h) => { g.fillStyle = "#c6cbd1"; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? "255,255,255" : "0,0,0"},${rr(.02, .08)})`; g.fillRect(0, Math.random() * h, w, rr(.5, 1.5)); } });
  mkTex("ceiling", 256, 256, (g, w, h) => { g.fillStyle = "#e9e8e4"; g.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(0,0,0,${rr(.05, .15)})`; g.fillRect(Math.random() * w, Math.random() * h, 1.6, 1.6); } g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h); });
  mkTex("leaves", 256, 256, (g, w, h) => { g.fillStyle = "#2f6a3a"; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const x = rr(0, w), y = rr(0, h); g.fillStyle = `hsl(${rr(95, 135)},${rr(35, 60)}%,${rr(22, 45)}%)`; g.save(); g.translate(x, y); g.rotate(rr(0, 6.3)); g.beginPath(); g.ellipse(0, 0, rr(5, 12), rr(2, 4), 0, 0, 7); g.fill(); g.restore(); } });
  mkTex("cardboard", 256, 256, (g, w, h) => { g.fillStyle = "#b88c57"; g.fillRect(0, 0, w, h); speckle(g, w, h, 8000, .08, 1.5); g.fillStyle = "rgba(225,205,160,.65)"; g.fillRect(0, 108, w, 40); g.fillStyle = "#fbfaf5"; g.fillRect(150, 30, 80, 58); g.fillStyle = "#222"; for (let x = 158; x < 222; x += rr(2, 5)) g.fillRect(x, 58, rr(1, 2.5), 24); g.font = `bold 13px ${SANS}`; g.fillText("FRAGILE", 162, 50); g.strokeStyle = "rgba(60,40,20,.6)"; g.lineWidth = 3; g.beginPath(); g.moveTo(40, 220); g.lineTo(40, 180); g.moveTo(30, 192); g.lineTo(40, 180); g.lineTo(50, 192); g.stroke(); });
  mkTex("books", 512, 256, (g, w, h) => { g.fillStyle = "#3b2618"; g.fillRect(0, 0, w, h); const pal = ["#7d2e2a", "#2f4f6b", "#c9b98a", "#3f6b4f", "#5a3f4a", "#1f2a3a", "#a0583a", "#e6dcc4"]; for (let r = 0; r < 4; r++) { let x = 4; const base = (r + 1) * 64 - 8; while (x < w - 8) { const bw = rr(9, 22), bh = rr(36, 52), c = pal[Math.floor(Math.random() * pal.length)]; g.fillStyle = c; g.fillRect(x, base - bh, bw, bh); g.fillStyle = "rgba(230,200,120,.7)"; g.fillRect(x, base - bh + 6, bw, 2); g.fillRect(x, base - 10, bw, 2); g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(x + bw - 1.5, base - bh, 1.5, bh); x += bw + rr(0, 2); if (Math.random() < .05) x += 18; } g.fillStyle = "#4a301e"; g.fillRect(0, base, w, 8); } });
  mkTex("art", 512, 512, (g, w, h) => { g.fillStyle = "#ebe3d2"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c9a24a"; g.lineWidth = 22; g.beginPath(); g.arc(300, 250, 150, 3.6, 6.8); g.stroke(); g.strokeStyle = "#1f3554"; g.lineCap = "round"; for (let i = 0; i < 5; i++) { g.lineWidth = rr(8, 20); g.beginPath(); g.moveTo(rr(60, 200), rr(80, 420)); g.quadraticCurveTo(rr(150, 350), rr(60, 450), rr(250, 460), rr(100, 420)); g.stroke(); } g.fillStyle = "#c8372d"; g.beginPath(); g.arc(160, 140, 26, 0, 7); g.fill(); speckle(g, w, h, 5000, .06, 1.5); });
  mkTex("notice", 512, 512, (g, w, h) => { g.fillStyle = "#b08a5a"; g.fillRect(0, 0, w, h); speckle(g, w, h, 14000, .15, 1.5); const notes = [["WAREHOUSE HOURS", "Sun–Thu 7am–5pm"], ["SAFETY FIRST", "Hi-vis in loading bays"], ["STOCK COUNT", "Last Friday of month"], ["DISPATCH", "Cut-off 3pm daily"], ["FORKLIFT", "Licensed drivers only"]]; notes.forEach((n, i) => { g.save(); g.translate(40 + (i % 2) * 230, 40 + Math.floor(i / 2) * 150); g.rotate(rr(-.06, .06)); g.fillStyle = i === 2 ? "#f6e27a" : "#fbfaf4"; g.fillRect(0, 0, 200, 120); g.fillStyle = "#222"; g.font = `bold 17px ${SANS}`; g.fillText(n[0], 12, 32); g.font = `15px ${SANS}`; g.fillText(n[1], 12, 60); g.fillStyle = "rgba(0,0,0,.15)"; for (let k = 0; k < 3; k++) g.fillRect(12, 76 + k * 12, rr(100, 170), 3); g.fillStyle = "#c8372d"; g.beginPath(); g.arc(100, 8, 6, 0, 7); g.fill(); g.restore(); }); });
  mkTex("whiteboard", 1024, 512, (g, w, h) => {
    g.fillStyle = "#fbfbf8"; g.fillRect(0, 0, w, h); g.lineCap = "round"; g.lineJoin = "round";
    g.strokeStyle = "#2f5fae"; g.lineWidth = 5; g.beginPath(); g.moveTo(80, 60); g.lineTo(80, 400); g.lineTo(440, 400); g.stroke();
    g.beginPath(); g.moveTo(110, 100); g.quadraticCurveTo(250, 300, 410, 360); g.stroke(); g.strokeStyle = "#c8372d"; g.beginPath(); g.moveTo(110, 360); g.quadraticCurveTo(250, 300, 410, 100); g.stroke();
    g.fillStyle = "#2f5fae"; g.font = `italic 34px ${SERIF}`; g.fillText("D", 415, 375); g.fillStyle = "#c8372d"; g.fillText("S", 415, 105); g.fillStyle = "#333"; g.font = `28px ${SANS}`; g.fillText("Price", 20, 50); g.fillText("Qty", 445, 440);
    g.strokeStyle = "#2a8a52"; g.lineWidth = 5; g.beginPath(); g.moveTo(560, 120); g.lineTo(860, 120); g.moveTo(710, 120); g.lineTo(710, 330); g.stroke(); g.fillStyle = "#2a8a52"; g.font = `bold 34px ${SANS}`; g.fillText("Dr", 610, 105); g.fillText("Cr", 760, 105); g.font = `26px ${SANS}`; g.fillText("Cash 120k", 570, 170); g.fillText("Sales 120k", 725, 220);
    g.fillStyle = "#c8372d"; g.font = `bold 40px ${SANS}`; g.fillText("Q4 TARGETS", 560, 400); g.strokeStyle = "#c8372d"; g.lineWidth = 4; g.beginPath(); g.moveTo(560, 412); g.lineTo(800, 412); g.stroke();
    [["#f6e27a", 880, 40], ["#f6b6c8", 905, 190], ["#9fe0c1", 880, 330]].forEach(([c, x, y]) => { g.save(); g.translate(x, y); g.rotate(rr(-.08, .08)); g.fillStyle = c; g.fillRect(0, 0, 110, 110); g.fillStyle = "rgba(0,0,0,.35)"; for (let k = 0; k < 4; k++) g.fillRect(12, 22 + k * 20, rr(50, 85), 4); g.restore(); });
    g.strokeStyle = "rgba(0,0,0,.05)"; g.lineWidth = 30; g.beginPath(); g.moveTo(500, 470); g.lineTo(700, 450); g.stroke();
  });
  mkTex("menu", 512, 256, (g, w, h) => { g.fillStyle = "#1d2420"; g.fillRect(0, 0, w, h); speckle(g, w, h, 6000, .08, 1.5); g.fillStyle = "#f3ead6"; g.font = `bold 34px ${SERIF}`; g.textAlign = "center"; g.fillText("The Ledger Café", w / 2, 44); g.fillStyle = "#c9a24a"; g.fillRect(w / 2 - 120, 56, 240, 2); g.textAlign = "left"; g.font = `21px ${SANS}`;
    [["Karak chai", "8"], ["Flat white", "14"], ["Arabic coffee", "10"], ["Fresh juice", "16"], ["Date cake", "12"], ["Falafel wrap", "18"]].forEach(([n, pr], i) => { const y = 90 + i * 28; g.fillStyle = "#f3ead6"; g.fillText(n, 50, y); g.textAlign = "right"; g.fillStyle = "#e9c46a"; g.fillText("AED " + pr, w - 50, y); g.textAlign = "left"; }); });
  mkTex("cert", 256, 256, (g, w, h) => { g.fillStyle = "#fbf7ec"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c9a24a"; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = "#1b2a40"; g.font = `bold 20px ${SERIF}`; g.textAlign = "center"; g.fillText("Certificate", w / 2, 78); g.font = `15px ${SERIF}`; g.fillText("of Promotion", w / 2, 104); g.fillStyle = "rgba(0,0,0,.25)"; for (let k = 0; k < 3; k++) g.fillRect(50, 130 + k * 18, w - 100, 3); g.fillStyle = "#c8372d"; g.beginPath(); g.arc(w / 2, 212, 16, 0, 7); g.fill(); });
  mkTex("skyline", 1024, 512, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h * .8); sky.addColorStop(0, "#081430"); sky.addColorStop(.45, "#1f3266"); sky.addColorStop(.75, "#a2546a"); sky.addColorStop(1, "#f0a35e"); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${rr(.2, .7)})`; g.fillRect(rr(0, w), rr(0, h * .35), 1.4, 1.4); }
    const sun = g.createRadialGradient(w * .72, h * .8, 0, w * .72, h * .8, 220); sun.addColorStop(0, "rgba(255,210,140,.75)"); sun.addColorStop(1, "rgba(255,210,140,0)"); g.fillStyle = sun; g.fillRect(0, 0, w, h);
    const base = h * .86;
    const bld = (x, bw, bh, c) => wrap(w, 0, (dx) => { g.fillStyle = c; g.fillRect(x + dx, base - bh, bw, bh); for (let yy = base - bh + 6; yy < base - 4; yy += 7) for (let xx = x + 3; xx < x + bw - 3; xx += 6) if (Math.random() < .38) { g.fillStyle = Math.random() < .7 ? "rgba(255,214,140,.9)" : "rgba(220,235,255,.85)"; g.fillRect(xx + dx, yy, 3, 3.5); } });
    for (let x = -10; x < w; x += rr(14, 40)) bld(x, rr(18, 46), rr(30, 120), "#1a2440");
    for (let x = 0; x < w; x += rr(30, 80)) bld(x, rr(22, 50), rr(70, 230), "#101a33");
    const sx = w * .52; g.fillStyle = "#0b1328"; g.beginPath(); g.moveTo(sx - 26, base); g.lineTo(sx - 16, base - 160); g.lineTo(sx - 9, base - 260); g.lineTo(sx - 4, base - 350); g.lineTo(sx, base - 420); g.lineTo(sx + 4, base - 350); g.lineTo(sx + 10, base - 240); g.lineTo(sx + 18, base - 140); g.lineTo(sx + 28, base); g.fill();
    for (let yy = base - 330; yy < base - 6; yy += 9) { g.fillStyle = "rgba(255,225,170,.75)"; g.fillRect(sx - 3, yy, 6, 3); }
    g.fillStyle = "#ff4b3e"; g.fillRect(sx - 1.5, base - 424, 3, 3);
    const sea = g.createLinearGradient(0, base, 0, h); sea.addColorStop(0, "#1b2a4d"); sea.addColorStop(1, "#0d1730"); g.fillStyle = sea; g.fillRect(0, base, w, h - base);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,${rr(170, 220)},140,${rr(.1, .4)})`; g.fillRect(rr(0, w), rr(base + 4, h), rr(4, 18), 1.2); }
  });
  const screenBase = (g, w, h, title, sub, up) => { g.fillStyle = "#0a1220"; g.fillRect(0, 0, w, h); g.strokeStyle = "#16243a"; g.lineWidth = 1; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 34); g.lineTo(x, h); g.stroke(); } for (let y = 34; y < h; y += 28) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.fillStyle = "#dfe8f5"; g.font = `bold 15px ${SANS}`; g.fillText(title, 10, 22); g.fillStyle = up ? "#2ecc71" : "#e74c3c"; g.font = `bold 15px ${MONO}`; g.fillText(sub, w - g.measureText(sub).width - 10, 22); };
  mkTex("chart1", 512, 256, (g, w, h) => { screenBase(g, w, h, "DFM GENERAL INDEX · 1D", "4,182.33 ▲ 0.62%", true); const n = 40, vals = walk(n + 1, 100, .03), mn = Math.min(...vals) * .98, mx = Math.max(...vals) * 1.02, Y = v => 44 + (1 - (v - mn) / (mx - mn)) * (h - 100);
    for (let i = 0; i < n; i++) { const o = vals[i], c = vals[i + 1], x = 12 + i * ((w - 24) / n), up = c >= o, hi = Math.max(o, c) * (1 + rr(0, .01)), lo = Math.min(o, c) * (1 - rr(0, .01)); g.strokeStyle = g.fillStyle = up ? "#2ecc71" : "#e74c3c"; g.beginPath(); g.moveTo(x + 4, Y(hi)); g.lineTo(x + 4, Y(lo)); g.stroke(); g.fillRect(x, Math.min(Y(o), Y(c)), 8, Math.max(1.5, Math.abs(Y(o) - Y(c)))); g.globalAlpha = .45; g.fillRect(x, h - rr(6, 40), 8, 40); g.globalAlpha = 1; } });
  mkTex("chart2", 512, 256, (g, w, h) => { screenBase(g, w, h, "REVENUE VS BUDGET · AED m", "+3.2% YoY", true); const vals = walk(24, 50, .06), mx = Math.max(...vals) * 1.15, X = i => 14 + i * (330 / 23), Y = v => h - 18 - v / mx * (h - 70);
    const gr = g.createLinearGradient(0, 40, 0, h); gr.addColorStop(0, "rgba(77,163,255,.55)"); gr.addColorStop(1, "rgba(77,163,255,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(X(0), h - 18); vals.forEach((v, i) => g.lineTo(X(i), Y(v))); g.lineTo(X(23), h - 18); g.fill(); g.strokeStyle = "#4da3ff"; g.lineWidth = 2.5; g.beginPath(); vals.forEach((v, i) => g.lineTo(X(i), Y(v))); g.stroke();
    g.setLineDash([5, 5]); g.strokeStyle = "#f2df63"; g.beginPath(); g.moveTo(X(0), Y(vals[0])); g.lineTo(X(23), Y(vals[0] * 1.08)); g.stroke(); g.setLineDash([]);
    g.font = `13px ${MONO}`; [["EMAAR", "8.95", 1], ["ADNOC", "4.12", 0], ["FAB", "14.60", 1], ["ENBD", "17.35", 1], ["DEWA", "2.48", 0], ["ALDAR", "5.71", 1]].forEach(([t, p, up], i) => { g.fillStyle = "#9fb3cc"; g.fillText(t, 370, 60 + i * 30); g.fillStyle = up ? "#2ecc71" : "#e74c3c"; g.fillText(p + (up ? " ▲" : " ▼"), 440, 60 + i * 30); }); });
  mkTex("sheet", 512, 256, (g, w, h) => { g.fillStyle = "#fdfdfd"; g.fillRect(0, 0, w, h); g.fillStyle = "#1f7a4a"; g.fillRect(0, 0, w, 22); g.fillStyle = "#fff"; g.font = `bold 12px ${SANS}`; g.fillText("FY2025_trial_balance.xlsx", 8, 15); g.fillStyle = "#e8eef4"; g.fillRect(0, 22, w, 18); g.fillRect(0, 22, 26, h); g.strokeStyle = "#d3d9e0"; for (let x = 26; x < w; x += 80) { g.beginPath(); g.moveTo(x, 22); g.lineTo(x, h); g.stroke(); } for (let y = 40; y < h; y += 17) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.font = `11px ${MONO}`; g.fillStyle = "#333"; ["A", "B", "C", "D", "E", "F"].forEach((c, i) => g.fillText(c, 60 + i * 80, 35)); for (let r = 0; r < 12; r++) { g.fillStyle = "#666"; g.fillText(String(r + 1), 6, 53 + r * 17); g.fillStyle = "#222"; g.fillText(["Revenue", "Cost of sales", "Gross profit", "Salaries", "Rent", "Marketing", "Utilities", "EBITDA", "Depreciation", "EBIT", "Interest", "Net profit"][r], 30, 53 + r * 17); for (let c = 1; c < 6; c++) { const v = Math.round(rr(10, 900)) * 1000; g.fillStyle = r === 11 ? "#1f7a4a" : "#222"; g.fillText(v.toLocaleString("en-US"), 30 + c * 80 + 4, 53 + r * 17); } } g.strokeStyle = "#1f7a4a"; g.lineWidth = 2; g.strokeRect(186, 108, 80, 17); });
  mkTex("dash", 1024, 512, (g, w, h) => {
    g.fillStyle = "#070d18"; g.fillRect(0, 0, w, h); const panel = (x, y, pw, ph, t) => { g.fillStyle = "#0e1828"; g.fillRect(x, y, pw, ph); g.fillStyle = "#8fa6c4"; g.font = `bold 15px ${SANS}`; g.fillText(t, x + 12, y + 22); };
    g.fillStyle = "#e8eef7"; g.font = `bold 26px ${SANS}`; g.fillText("MARKETS OVERVIEW", 20, 38); g.fillStyle = "#2ecc71"; g.font = `bold 22px ${MONO}`; g.fillText("DFM 4,182.33 ▲0.62%   ADX 9,471.10 ▲0.18%   AED/USD 3.6725", 330, 38);
    panel(16, 56, 600, 270, "DFM GENERAL INDEX"); const v = walk(60, 100, .02), mn = Math.min(...v), mx = Math.max(...v), X = i => 30 + i * (570 / 59), Y = q => 300 - (q - mn) / (mx - mn) * 200; const gr = g.createLinearGradient(0, 90, 0, 310); gr.addColorStop(0, "rgba(46,204,113,.45)"); gr.addColorStop(1, "rgba(46,204,113,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(X(0), 310); v.forEach((q, i) => g.lineTo(X(i), Y(q))); g.lineTo(X(59), 310); g.fill(); g.strokeStyle = "#2ecc71"; g.lineWidth = 3; g.beginPath(); v.forEach((q, i) => g.lineTo(X(i), Y(q))); g.stroke();
    panel(632, 56, 376, 270, "SECTOR HEAT MAP"); const sect = ["BANKS", "REAL EST.", "ENERGY", "TELECOM", "RETAIL", "TRANSPORT", "INSURANCE", "UTILITIES", "TECH"]; sect.forEach((s, i) => { const ch = rr(-2.5, 3), x = 644 + (i % 3) * 120, y = 90 + Math.floor(i / 3) * 76; g.fillStyle = ch >= 0 ? `rgba(46,204,113,${.25 + ch / 5})` : `rgba(231,76,60,${.25 - ch / 5})`; g.fillRect(x, y, 112, 68); g.fillStyle = "#fff"; g.font = `bold 13px ${SANS}`; g.fillText(s, x + 8, y + 24); g.font = `bold 18px ${MONO}`; g.fillText((ch >= 0 ? "+" : "") + ch.toFixed(2) + "%", x + 8, y + 52); });
    panel(16, 342, 300, 154, "REVENUE · AED"); g.fillStyle = "#e8eef7"; g.font = `bold 42px ${MONO}`; g.fillText("2.41bn", 30, 420); g.fillStyle = "#2ecc71"; g.font = `bold 20px ${MONO}`; g.fillText("▲ 3.2% vs budget", 30, 460);
    panel(332, 342, 676, 154, "QUARTERLY PROFIT · AED m"); for (let i = 0; i < 12; i++) { const bh = rr(30, 100); g.fillStyle = i > 7 ? "#4da3ff" : "#2f5f9e"; g.fillRect(352 + i * 54, 486 - bh, 36, bh); }
  });
  mkTex("ticker", 2048, 64, (g, w, h) => { g.fillStyle = "#05080d"; g.fillRect(0, 0, w, h); const items = [["DFM", "4,182.33", "+0.62%"], ["ADX", "9,471.10", "−0.21%"], ["EMAAR", "8.95", "+1.24%"], ["FAB", "14.60", "+0.41%"], ["ADNOC DIST", "4.12", "−0.73%"], ["ENBD", "17.35", "+0.88%"], ["ALDAR", "5.71", "+2.05%"], ["DEWA", "2.48", "−0.40%"], ["GOLD", "2,384.10", "+0.32%"], ["BRENT", "82.47", "−1.12%"]]; const slot = w / items.length; g.font = `bold 26px ${MONO}`; items.forEach(([n, p, c], i) => { const up = c.startsWith("+"), x = i * slot + 18; g.fillStyle = "#f2df63"; g.fillText(n, x, 42); const nw = g.measureText(n + " ").width; g.fillStyle = "#e8eef7"; g.fillText(p, x + nw, 42); const pw = g.measureText(p + " ").width; g.fillStyle = up ? "#2ecc71" : "#ff5a4a"; g.fillText((up ? "▲" : "▼") + c, x + nw + pw, 42); }); });
  mkTex("logo", 1024, 256, (g) => drawLogo(g, "Haddad & Partners"));
}
function drawLogo(g, name) {
  const w = 1024, h = 256; g.fillStyle = "#1a2230"; g.fillRect(0, 0, w, h); speckle(g, w, h, 4000, .05, 2);
  const gr = g.createLinearGradient(0, 60, 0, 180); gr.addColorStop(0, "#f3dc94"); gr.addColorStop(.5, "#c9a24a"); gr.addColorStop(1, "#8f6c28"); g.fillStyle = gr;
  let fs = 92; g.font = `bold ${fs}px ${SERIF}`; while (g.measureText(name).width > w - 80 && fs > 40) { fs -= 4; g.font = `bold ${fs}px ${SERIF}`; }
  g.textAlign = "center"; g.fillText(name, w / 2, 140); g.font = `22px ${SANS}`; g.fillStyle = "#c9b27a"; g.fillText("D U B A I   ·   S H A R J A H   ·   A B U   D H A B I", w / 2, 200); g.textAlign = "left";
  g.fillStyle = "#c9a24a"; g.fillRect(w / 2 - 160, 165, 320, 2);
}

/* ============================== GEOMETRY ============================== */
const WALL_H = 3.2;
let B = {}, CUR = B, colliders = [], walls2d = [];
let rng = 7; const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647;
const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const colr = c => typeof c === "string" ? hex(c) : c;
const bucket = tex => CUR[tex] || (CUR[tex] = []);
function vtx(a, p, n, c, em, u, v) { a.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], em, u, v); }
function quad(tex, ps, ns, c, em, uvs) { const a = bucket(tex); for (const i of [0, 1, 2, 0, 2, 3]) vtx(a, ps[i], Array.isArray(ns[0]) ? ns[i] : ns, c, em, uvs[i][0], uvs[i][1]); }
function box(x, y, z, sx, sy, sz, color, o = {}) {
  const j = o.flat ? 1 : .96 + rand() * .08, c = colr(color).map(v => Math.min(1, v * j));
  const x0 = x - sx / 2, x1 = x + sx / 2, y0 = y, y1 = y + sy, z0 = z - sz / 2, z1 = z + sz / 2, t = o.tile || 1, tex = o.tex || "white", em = o.em || 0;
  const F = [["+x", [1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]]], ["-x", [-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]],
    ["+y", [0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]]], ["-y", [0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]],
    ["+z", [0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]], ["-z", [0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]]]];
  for (const [k, n, ps] of F) {
    if (o.skip && o.skip.includes(k)) continue;
    const f = o.faces && o.faces[k]; let ft = tex, fe = em, fc = c, fit = !!o.fit, tt = t;
    if (k === "+y" && o.top) { ft = o.top; tt = o.topTile || t; fit = false; fc = o.topColor ? colr(o.topColor) : c; }
    if (f) { ft = f.tex; fe = f.em ?? em; fc = f.color ? colr(f.color) : [1, 1, 1]; fit = f.fit !== false; }
    const uvs = fit ? [[0, 0], [1, 0], [1, 1], [0, 1]] : ps.map(p => k[1] === "x" ? [p[2] / tt, p[1] / tt] : k[1] === "y" ? [p[0] / tt, p[2] / tt] : [p[0] / tt, p[1] / tt]);
    quad(ft, ps, n, fc, fe, uvs);
  }
  if (o.solid) colliders.push([x0, z0, x1, z1]);
}
const solid = (x, y, z, sx, sy, sz, c, o = {}) => box(x, y, z, sx, sy, sz, c, { ...o, solid: true });
function panel(tex, x, y, z, w, h, dir, em = .95, uv = [0, 0, 1, 1], color = "#ffffff") {
  const c = colr(color), hw = w / 2, [u0, v0, u1, v1] = uv; let ps, n;
  if (dir === "+z") { n = [0, 0, 1]; ps = [[x - hw, y, z], [x + hw, y, z], [x + hw, y + h, z], [x - hw, y + h, z]]; }
  else if (dir === "-z") { n = [0, 0, -1]; ps = [[x + hw, y, z], [x - hw, y, z], [x - hw, y + h, z], [x + hw, y + h, z]]; }
  else if (dir === "+x") { n = [1, 0, 0]; ps = [[x, y, z + hw], [x, y, z - hw], [x, y + h, z - hw], [x, y + h, z + hw]]; }
  else { n = [-1, 0, 0]; ps = [[x, y, z - hw], [x, y, z + hw], [x, y + h, z + hw], [x, y + h, z - hw]]; }
  quad(tex, ps, n, c, em, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
}
function cyl(x, y, z, r, h, color, o = {}) {
  const c = colr(color), tex = o.tex || "white", em = o.em || 0, t = o.tile || 1, seg = o.seg || 16, r2 = o.r2 ?? r, sz = o.sz ?? 1, sl = (r - r2) / h, a = bucket(tex);
  const P = (an, rad, yy) => [x + Math.cos(an) * rad, yy, z + Math.sin(an) * rad * sz];
  const Nn = an => { const v = [Math.cos(an), sl, Math.sin(an) / sz], l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
  for (let i = 0; i < seg; i++) {
    const a0 = i / seg * Math.PI * 2, a1 = (i + 1) / seg * Math.PI * 2, ps = [P(a0, r, y), P(a1, r, y), P(a1, r2, y + h), P(a0, r2, y + h)];
    const u0 = i / seg * Math.PI * 2 * r / t, u1 = (i + 1) / seg * Math.PI * 2 * r / t;
    quad(tex, ps, [Nn(a0), Nn(a1), Nn(a1), Nn(a0)], c, em, [[u0, y / t], [u1, y / t], [u1, (y + h) / t], [u0, (y + h) / t]]);
    if (!o.noCap) { const ct = [x, y + h, z], ctex = o.capTex || tex, cc = o.capColor ? colr(o.capColor) : c, b2 = bucket(ctex), ctile = o.capTile || t; for (const q of [ct, ps[3], ps[2]]) vtx(b2, q, [0, 1, 0], cc, o.capEm ?? em, q[0] / ctile, q[2] / ctile); }
  }
  if (o.solid) colliders.push([x - r, z - r * sz, x + r, z + r * sz]);
}
function sph(x, y, z, r, color, o = {}) {
  const c = colr(color), tex = o.tex || "white", em = o.em || 0, seg = o.seg || 14, rings = o.rings || 10, sx = o.sx || 1, sy = o.sy || 1, sz = o.sz || 1, thMax = o.thMax || Math.PI, t = o.tile || .5;
  const P = (th, ph) => { const n = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)]; return [[x + n[0] * r * sx, y + n[1] * r * sy, z + n[2] * r * sz], n]; };
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
    const th0 = i / rings * thMax, th1 = (i + 1) / rings * thMax, ph0 = j / seg * Math.PI * 2, ph1 = (j + 1) / seg * Math.PI * 2;
    const q = [P(th1, ph0), P(th1, ph1), P(th0, ph1), P(th0, ph0)];
    quad(tex, q.map(v => v[0]), q.map(v => v[1]), c, em, q.map(v => [v[0][0] / t + v[0][2] / t, v[0][1] / t]));
  }
}

/* ============================== FINANCE OFFICE ==============================
   36 m × 24 m floor plate. North: meeting room, finance floor, executive suite (skyline windows).
   Middle: corridor. South: lobby and stockroom. */
const PALETTES = [
  { meet: "#4a5a74", fin: "#3e4a5c", wall: "#f1eee8", accent: "#c9a24a", sign: "#1b2a40", rug: "#6b2430" },
  { meet: "#3e5c58", fin: "#4c4a5e", wall: "#eef0ec", accent: "#b58a3c", sign: "#24403c", rug: "#24405c" },
  { meet: "#5a4652", fin: "#3f5464", wall: "#f3efe9", accent: "#c79a55", sign: "#3a2a36", rug: "#3a3250" },
  { meet: "#3f5240", fin: "#57534a", wall: "#efede6", accent: "#bfa05a", sign: "#2a3a2c", rug: "#5a3a24" }];
let ROOMS = [];
const roomKey = (x, z) => z < 12 ? (x < 12 ? "meet" : x < 24 ? "fin" : x < 36 ? "exec" : x < 42 ? "office" : "corner") : z < 16 ? "corr" : (x < 12 ? "lobby" : x < 36 ? "stock" : "cafe");
const WORLD_W = 48;
const roomAt = (x, z) => ROOMS.find(r => r.key === roomKey(x, z)) || ROOMS[0];

function buildWorld(cfg) {
  B = {}; CUR = B; colliders = []; walls2d = []; rng = 7 + (cfg.seed % 1000);
  const P = PALETTES[cfg.palette || 0];
  ROOMS = [
    { key: "meet", name: "Meeting room", x0: 0, z0: 0, x1: 12, z1: 12, surface: "carpet" },
    { key: "fin", name: "Finance floor", x0: 12, z0: 0, x1: 24, z1: 12, surface: "carpet" },
    { key: "exec", name: "Executive suite", x0: 24, z0: 0, x1: 36, z1: 12, surface: "tile" },
    { key: "office", name: "Private office", x0: 36, z0: 0, x1: 42, z1: 12, surface: "carpet" },
    { key: "corner", name: "Corner office", x0: 42, z0: 0, x1: 48, z1: 12, surface: "tile" },
    { key: "corr", name: "Corridor", x0: 0, z0: 12, x1: 48, z1: 16, surface: "tile" },
    { key: "cafe", name: "Café", x0: 36, z0: 16, x1: 48, z1: 24, surface: "tile" },
    { key: "lobby", name: "Lobby", x0: 0, z0: 16, x1: 12, z1: 24, surface: "tile" },
    { key: "stock", name: "Stockroom", x0: 12, z0: 16, x1: 36, z1: 24, surface: "concrete" }];
  // floors
  box(6, -.1, 6, 12, .1, 12, P.meet, { top: "carpet", topTile: 1, flat: true, skip: ["-y"] });
  box(18, -.1, 6, 12, .1, 12, P.fin, { top: "carpet", topTile: 1, flat: true, skip: ["-y"] });
  box(30, -.1, 6, 12, .1, 12, "#ffffff", { top: "woodfloor", topTile: 2.6, flat: true, skip: ["-y"] });
  box(24, -.1, 14, 48, .1, 4, "#ffffff", { top: "stone", topTile: 1.8, flat: true, skip: ["-y"] });
  box(39, -.1, 6, 6, .1, 12, cfg.hq && cfg.hq.ws === "office" ? cfg.hq.color : "#4a4f5c", { top: "carpet", topTile: 1, flat: true, skip: ["-y"] });
  box(45, -.1, 6, 6, .1, 12, "#ffffff", { top: "woodfloor", topTile: 2.2, flat: true, skip: ["-y"] });
  box(42, -.1, 20, 12, .1, 8, "#ffffff", { top: "woodfloor", topTile: 1.6, flat: true, skip: ["-y"] });
  box(6, -.1, 20, 12, .1, 8, "#ffffff", { top: "marble", topTile: 2.2, flat: true, skip: ["-y"] });
  box(24, -.1, 20, 24, .1, 8, "#ffffff", { top: "concrete", topTile: 3, flat: true, skip: ["-y"] });
  // ceiling and lights
  box(24, WALL_H, 12, 48, .1, 24, "#ffffff", { tex: "ceiling", tile: .6, flat: true });
  for (let x = 3; x < 48; x += 6) for (const z of [3, 7.5, 18.5, 22]) { if (x < 12 && z > 16) continue; box(x, WALL_H - .03, z, 1.4, .03, .6, "#fffbea", { em: 1, flat: true }); }
  for (let x = 2.5; x < 48; x += 4) box(x, WALL_H - .03, 14, 1.8, .03, .18, "#fffbea", { em: 1, flat: true });
  box(6, WALL_H - .05, 20, 6, .05, .25, "#fffbea", { em: 1, flat: true }); box(6, WALL_H - .05, 20, .25, .05, 5, "#fffbea", { em: 1, flat: true });

  // walls: [x1,z1,x2,z2,type]
  const W = [[0, 0, 48, 0, "win"], [0, 24, 12, 24, "solid"], [12, 24, 36, 24, "solid"], [36, 24, 48, 24, "solid"], [0, 0, 0, 12, "solid"], [0, 12, 0, 24, "solid"], [36, 0, 36, 12, "solid"], [42, 0, 42, 12, "solid"], [48, 0, 48, 12, "win"], [48, 12, 48, 24, "solid"], [36, 16, 36, 24, "solid"],
    [36, 12, 38, 12, "wood"], [40, 12, 44, 12, "wood"], [46, 12, 48, 12, "wood"], [36, 16, 40, 16, "glass"], [43, 16, 48, 16, "glass"],
    [0, 12, 5, 12, "glass"], [7, 12, 12, 12, "glass"], [12, 12, 17, 12, "glass"], [19, 12, 24, 12, "glass"], [24, 12, 29, 12, "wood"], [31, 12, 36, 12, "wood"],
    [12, 0, 12, 12, "solid"], [24, 0, 24, 12, "solid"], [0, 16, 3, 16, "solid"], [9, 16, 12, 16, "solid"], [12, 16, 20, 16, "solid"], [24, 16, 36, 16, "solid"], [12, 16, 12, 24, "solid"]];
  for (const [x1, z1, x2, z2, type] of W) {
    const mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, hz = z1 === z2, sx = hz ? x2 - x1 + .2 : .204, sz = hz ? .2 : z2 - z1 + .16;
    const stock = (mz === 24 && mx > 12 && mx < 36) || (mx === 12 && mz > 16) || (mx === 36 && mz > 16);
    if (type === "glass") {
      const prev = CUR; CUR = G; box(mx, .06, mz, x2 - x1, WALL_H - .06, .04, "#cfe3ee", { flat: true }); CUR = prev;
      colliders.push([mx - sx / 2, mz - .1, mx + sx / 2, mz + .1]);
      box(mx, 0, mz, x2 - x1, .06, .12, "#2b313a", { flat: true }); box(mx, WALL_H - .12, mz, x2 - x1, .12, .12, "#2b313a", { flat: true });
      for (let x = x1; x <= x2 + .01; x += (x2 - x1) / Math.max(1, Math.round((x2 - x1) / 1.6))) box(x, 0, mz, .05, WALL_H, .1, "#2b313a", { flat: true });
      box(mx, 1.05, mz, x2 - x1, .18, .05, "#ffffff", { em: .25, flat: true, tex: "white" });
      continue;
    }
    walls2d.push([x1, z1, x2, z2]);
    const wc = stock ? "#b7bbbf" : type === "wood" ? "#6f4b31" : P.wall;
    solid(mx, 0, mz, sx, WALL_H, sz, wc, { tex: type === "wood" ? "wood" : "plaster", tile: type === "wood" ? 1.2 : 2 });
    box(mx, 0, mz, sx + (hz ? 0 : .04), hz ? .1 : .097, sz + (hz ? .04 : 0), stock ? "#5a5f66" : "#2d2a28", { flat: true });
  }
  // exterior windows (skyline) with mullions and sills
  const win = (axis, a0, a1, fixed, dir, uoff) => {
    for (let a = a0; a < a1 - .01; a += 1.5) {
      const w = Math.min(1.5, a1 - a), cx = a + w / 2, u0 = (a / 14 + uoff), u1 = ((a + w) / 14 + uoff);
      if (axis === "x") panel("skyline", cx, .55, fixed, w, 2.45, dir, .92, dir === "+z" ? [u0, 0, u1, 1] : [u1, 0, u0, 1]);
      else panel("skyline", fixed, .55, cx, w, 2.45, dir, .92, dir === "-x" ? [u0, 0, u1, 1] : [u1, 0, u0, 1]);
      if (axis === "x") box(a, .55, fixed + (dir === "+z" ? .02 : -.02), .06, 2.45, .06, "#2b313a", { flat: true }); else box(fixed + (dir === "-x" ? -.02 : .02), .55, a, .06, 2.45, .06, "#2b313a", { flat: true });
    }
    if (axis === "x") { box((a0 + a1) / 2, .5, fixed + .1, a1 - a0, .05, .25, "#f4f2ee", { flat: true }); box((a0 + a1) / 2, 2.98, fixed + .05, a1 - a0, .06, .1, "#2b313a", { flat: true }); }
    else { box(fixed - .1, .5, (a0 + a1) / 2, .25, .05, a1 - a0, "#f4f2ee", { flat: true }); box(fixed - .05, 2.98, (a0 + a1) / 2, .1, .06, a1 - a0, "#2b313a", { flat: true }); }
  };
  win("x", .1, 11.9, .11, "+z", .1); win("x", 12.1, 23.9, .11, "+z", .37); win("x", 24.1, 35.9, .11, "+z", .64); win("x", 36.1, 41.9, .11, "+z", .91); win("x", 42.1, 47.9, .11, "+z", .18); win("z", .1, 11.9, 47.89, "-x", .2);
  // door frames and headers
  [[5, 7, 12, "glass"], [17, 19, 12, "glass"], [29, 31, 12, "wood"], [38, 40, 12, "wood"], [44, 46, 12, "wood"], [40, 43, 16, "glass"], [3, 9, 16, "solid"], [20, 24, 16, "solid"]].forEach(([a, b, z, t]) => {
    if (t === "glass") { box((a + b) / 2, 2.5, z, b - a, WALL_H - 2.5, .12, "#2b313a", { flat: true }); return; }
    box((a + b) / 2, 2.6, z, b - a - .004, WALL_H - 2.6, .196, t === "wood" ? "#6f4b31" : z === 16 && a === 20 ? "#b7bbbf" : P.wall, { tex: t === "wood" ? "wood" : "plaster", tile: 1.2 });
    box((a + b) / 2, 2.54, z, b - a + .16, .07, .26, P.accent, { flat: true, em: .15 }); [a, b].forEach(x => box(x, 0, z, .08, 2.6, .26, P.accent, { flat: true, em: .1 }));
  });

  /* ---- lobby ---- */
  solid(2.2, 0, 20.4, 1.1, 1.05, 3.6, "#ffffff", { tex: "dmarble", tile: 1.2 });
  box(2.15, 1.05, 20.4, 1.35, .06, 3.85, "#ffffff", { tex: "marble", tile: 1 }); box(2.76, .86, 20.4, .02, .05, 3.6, P.accent, { em: .5, flat: true });
  box(.17, .9, 20.4, .1, 1.9, 4.6, "#2a2420", { tex: "wood", tile: 1.2, faces: { "+x": { tex: "logo", em: .55 } } });
  panel("dash", 11.88, .9, 20, 5.2, 1.65, "-x", .95); box(11.92, .84, 20, .06, 1.77, 5.34, "#0b0f14", { flat: true });
  panel("ticker", 6, 2.55, 23.88, 10, .26, "-z", 1, [0, 0, 2.5, 1]); box(6, 2.5, 23.93, 10.2, .36, .04, "#05080d", { flat: true });
  sofa(5.3, 23.25, "-z", 2.4); sofa(8.9, 23.25, "-z", 2.4);
  cyl(7.1, 0, 21.9, .55, .38, "#20262e", { solid: true, capTex: "marble", capColor: "#ffffff", capTile: .8 });
  box(7.0, .38, 21.85, .3, .02, .22, "#c8372d", { flat: true }); box(7.3, .38, 21.95, .28, .03, .2, "#e9e4da", { flat: true });
  [[11.2, 23.2, 1], [.9, 23.2, 1], [11.2, 16.9, 0], [.9, 16.9, 0]].forEach(([x, z, big]) => plant(x, z, big));
  cyl(10.9, 0, 18.3, .28, WALL_H, "#ffffff", { tex: "marble", tile: 1, seg: 20, solid: true }); cyl(1.2, 0, 18.3, .28, WALL_H, "#ffffff", { tex: "marble", tile: 1, seg: 20, solid: true });
  box(6, .005, 17.6, 3.2, .01, 1.2, "#3a3a3e", { tex: "carpet", flat: true });
  /* ---- corridor ---- */
  panel("ticker", 30, 2.52, 15.88, 11, .24, "-z", 1, [0, 0, 2.75, 1]); box(30, 2.47, 15.93, 11.2, .34, .04, "#05080d", { flat: true });
  panel("ticker", 15.7, 2.52, 15.88, 7, .24, "-z", 1, [.4, 0, 2.15, 1]); box(15.7, 2.47, 15.93, 7.2, .34, .04, "#05080d", { flat: true });
  artFrame(1.6, 1.3, 15.88, "-z", 1.1, .85); artFrame(10.5, 1.3, 15.88, "-z", 1.1, .85); artFrame(47.88, 1.3, 14, "-x", 1.4, 1);
  bench(26.5, 15.45); plant(.6, 12.6, 0); plant(47.3, 12.6, 0); plant(12.6, 15.4, 0); plant(35.4, 15.4, 0);
  artFrame(35.88, 1.3, 6, "-x", 1.4, 1);
  buildExtension(cfg, P);
  /* ---- meeting room ---- */
  solid(6, 0, 5.2, 5.8, .72, 2.2, "#1e2228", { top: "wood", topTile: 1.2, topColor: "#ffffff" });
  box(6, .72, 5.2, 6, .05, 2.4, "#ffffff", { tex: "wood", tile: 1.2 });
  for (let i = 0; i < 4; i++) { officeChair(3.8 + i * 1.45, 3.45, 1); officeChair(3.8 + i * 1.45, 6.95, -1); }
  laptop(6, .77, 5.9); box(4.2, .77, 5.0, .3, .02, .22, "#f4f1e8", { flat: true }); cyl(7.8, .77, 4.8, .045, .1, "#f4f1e8", { seg: 10 }); cyl(4.9, .77, 4.6, .045, .1, "#2f4f6b", { seg: 10 });
  panel("whiteboard", .145, .95, 5, 4.4, 1.6, "+x", .2); box(.1, .9, 5, .06, 1.7, 4.55, "#c9ced4", { flat: true }); box(.25, .92, 5, .22, .03, 3.6, "#c9ced4", { flat: true });
  panel("chart2", 11.88, 1.1, 5.2, 3.2, 1.6, "-x", .95); box(11.92, 1.04, 5.2, .06, 1.72, 3.34, "#0b0f14", { flat: true });
  solid(1, 0, 10.9, 1.6, .9, .55, "#ffffff", { tex: "wood", tile: 1.2 }); cyl(.6, .9, 10.9, .13, .35, "#2b2f36", { seg: 12 }); cyl(1.15, .9, 10.85, .045, .1, "#ffffff", { seg: 10 }); cyl(1.35, .9, 10.95, .045, .1, "#ffffff", { seg: 10 });
  plant(11.2, .9, 1); plant(.9, .9, 1);
  /* ---- finance floor ---- */
  [["#c8372d", 14], ["#2f6db3", 16], ["#3f9a6b", 18], ["#7c8796", 20], ["#c9a24a", 22]].forEach(([band, x]) => cabinet(x, .6, band));
  panel("dash", 12.12, 1.0, 6, 5.6, 1.75, "+x", .95); box(12.08, .94, 6, .06, 1.87, 5.74, "#0b0f14", { flat: true });
  panel("ticker", 12.12, 2.82, 6, 5.6, .22, "+x", 1, [0, 0, 1.4, 1]);
  solid(22.7, 0, 4.6, .9, .72, .7, "#4e5763", { tex: "metal", tile: .6 }); box(22.7, .72, 4.6, .8, .34, .62, "#e9eaec", { tex: "metal", tile: .6 }); box(22.7, 1.06, 4.42, .6, .03, .3, "#ffffff", { em: .3, flat: true }); box(22.95, .98, 4.88, .2, .06, .02, "#2ecc71", { em: 1, flat: true });
  desk(15, 7.6, 2.2, 1.1); desk(20.5, 7.6, 2.2, 1.1); officeChair(15, 8.65, -1); officeChair(20.5, 8.65, -1);
  monitor(14.66, .77, 7.35, "+z", "chart1"); monitor(15.34, .77, 7.35, "+z", "sheet"); monitor(20.16, .77, 7.35, "+z", "chart2"); monitor(20.84, .77, 7.35, "+z", "chart1");
  desk(15, 10.35, 2.2, 1.0); desk(22.6, 10.35, 2.2, 1.0); officeChair(15, 11.05, -1); officeChair(22.6, 11.05, -1);
  monitor(14.7, .77, 10.15, "-z", "sheet"); monitor(15.3, .77, 10.15, "-z", "chart1"); monitor(22.3, .77, 10.15, "-z", "chart2"); monitor(22.9, .77, 10.15, "-z", "sheet");
  cyl(23.4, 0, 2.3, .17, 1.05, "#e9eaec", { seg: 14, solid: true }); cyl(23.4, 1.05, 2.3, .14, .38, "#9fd0f0", { seg: 14, em: .2 });
  plant(12.7, 11.3, 0); plant(23.4, 7.2, 1);
  /* ---- executive suite ---- */
  box(30, .002, 4.6, 6, .01, 4.4, P.rug, { tex: "fabric", tile: .8, flat: true }); box(30, .006, 4.6, 5.6, .01, 4, P.rug, { tex: "fabric", tile: .8, flat: true, em: .02 });
  solid(30, 0, 3.2, 3.0, .72, 1.3, "#1d1a18", { tex: "wood", tile: 1 }); box(30, .72, 3.2, 3.3, .06, 1.5, "#ffffff", { tex: "wood", tile: 1.2 }); box(30, .45, 3.86, 3.0, .04, .02, P.accent, { em: .4, flat: true });
  monitor(29.3, .78, 2.85, "+z", "chart1"); box(30.8, .78, 3.4, .32, .02, .24, "#f4f1e8", { flat: true }); box(30.15, .78, 3.7, .36, .1, .05, P.accent, { em: .3, flat: true });
  cyl(31.4, .78, 2.8, .08, .05, "#c9a24a", { seg: 12 }); cyl(31.4, .83, 2.8, .015, .4, "#c9a24a", { seg: 6 }); cyl(31.4, 1.18, 2.8, .16, .16, "#f3ead6", { r2: .1, seg: 14, em: .6 });
  execChair(30, 1.45); officeChair(28.3, 4.85, -1, "#3a2e29", "leather"); officeChair(31.7, 4.85, -1, "#3a2e29", "leather");
  solid(24.42, 0, 2.8, .45, 2.5, 3.6, "#4a301e", { tex: "wood", tile: 1.2, faces: { "+x": { tex: "books", em: .02 } } });
  solid(24.5, 0, 6.8, .6, 1, 1.8, "#4a301e", { tex: "wood", tile: 1 }); box(24.55, 1, 6.8, .4, .08, .5, "#c9b98a", { flat: true }); box(24.55, 1.08, 6.8, .34, .03, .42, "#fbfaf4", { em: .2, flat: true });
  sofa(33.6, 11.3, "-z", 2.6, true); cyl(33.6, 0, 10.2, .45, .4, "#1d1a18", { solid: true, capTex: "dmarble", capColor: "#ffffff", capTile: .8 });
  artFrame(26.6, 1.3, 11.88, "-z", 1.4, 1); plant(35.3, 7.6, 1); plant(25, .9, 1);
  cyl(25.4, 0, 10.6, .05, .9, "#c9a24a", { seg: 8 }); sph(25.4, 1.15, 10.6, .25, "#3a6fa8", { seg: 16, rings: 12 }); cyl(25.4, 0, 10.6, .25, .03, "#c9a24a", { seg: 14 });
  /* ---- stockroom ---- */
  box(24, .004, 18.4, 23, .01, .08, "#e3c341", { flat: true }); box(24, .004, 21.9, 23, .01, .08, "#e3c341", { flat: true });
  rack(12.7, 19.3, 16.75); rack(24.7, 35.3, 16.75); rack(14, 20, 20, null, true); rack(12.7, 19.3, 23.3);
  rack(25, 31, 23.3, { count: cfg.bay, stripe: cfg.stripe, seed: cfg.seed });
  panel("white", 28, 2.65, 23.83, 1.6, .4, "-z", .6, [0, 0, 1, 1], "#f2df63"); box(28, 2.62, 23.88, 1.7, .46, .04, "#1b1b1f", { flat: true });
  solid(32.2, 0, 23.3, .4, 1.05, .4, "#4e5763", { tex: "metal", tile: .5 }); box(32.2, 1.05, 23.3, .36, .04, .46, "#fbfaf4", { em: .3, flat: true });
  solid(34.6, 0, 20.4, 2, .76, 1.1, "#4e5763", { tex: "metal", tile: .6 }); box(34.6, .76, 20.4, 2.1, .04, 1.2, "#5d6672", { flat: true }); monitor(34.2, .8, 20.6, "+z", "sheet"); box(35.1, .8, 20.3, .4, .05, .3, "#2f6db3", { flat: true });
  panel("notice", 35.88, 1.0, 18.4, 1.8, 1.4, "-x", .25); box(35.92, .95, 18.4, .05, 1.5, 1.9, "#4a301e", { flat: true });
  solid(22, 0, 21.4, 1.1, 1.2, 1.9, "#e08a1e"); box(22, 1.2, 21.7, 1, .9, .9, "#2a2d31"); box(22, 0, 20.25, .9, 2.2, .1, "#2a2d31"); box(22, .1, 20, .9, .05, .8, "#9aa0a6");
  [[21.45, 20.8], [22.55, 20.8], [21.45, 22.0], [22.55, 22.0]].forEach(([x, z]) => box(x, 0, z, .12, .4, .4, "#111"));
  [[13.4, 18.6], [13.4, 19.4], [33.5, 17.8]].forEach(([x, z]) => { solid(x, 0, z, 1, .12, 1, "#a0835a", { tex: "wood", tile: .5 }); box(x, .12, z, .9, .7, .9, "#ffffff", { tex: "cardboard", fit: true }); });
  for (const n of Object.values(NPCS)) colliders.push([n.x - .3, n.z - .3, n.x + .3, n.z + .3]);
  for (const c of activeCoworkers(cfg)) if (!c.path) colliders.push([c.x - .3, c.z - .3, c.x + .3, c.z + .3]);
}

/* ============================== EAST WING: OFFICES AND CAFÉ ============================== */
const WS_OF = rk => rk === 0 ? "hot" : rk <= 2 ? "desk" : rk <= 5 ? "office" : "corner";
const COWORKERS = [
  { id: "omar", name: "Omar", role: "Analyst", mesh: "cwA_s", x: 22.6, z: 11.0, rot: Math.PI },
  { id: "lina", name: "Lina", role: "Associate", mesh: "cwB_s", x: 15, z: 11.0, rot: Math.PI, notHQdesk: true },
  { id: "rashid", name: "Rashid", role: "Senior Manager", mesh: "cwE_s", x: 39, z: 3.3, rot: 0, office: "office" },
  { id: "layla", name: "Layla Haddad", role: "Managing Partner", mesh: "boss_s", x: 45, z: 3.25, rot: 0, office: "corner", hqOnly: true },
  { id: "saeed", name: "Saeed", role: "Chairman", mesh: "cwD_s", x: 45, z: 3.25, rot: 0, office: "corner", clientOnly: true },
  { id: "hamza", name: "Hamza", role: "Café", mesh: "barista", x: 45, z: 23.5, rot: Math.PI, barista: true },
  { id: "dana", name: "Dana", role: "Marketing", mesh: "cwC_s", x: 37.45, z: 18.6, rot: Math.PI / 2 },
  { id: "khalid2", name: "Faisal", role: "IT support", mesh: "cwD_s", x: 46.25, z: 18.8, rot: -Math.PI / 2 },
  { id: "sami", name: "Sami", role: "Intern", mesh: "cwE", path: [[3.5, 14.5], [46, 14.5]], speed: 1.1 },
  { id: "noura", name: "Noura", role: "Senior Associate", mesh: "cwC", path: [[13.4, 6.0], [21.8, 6.0]], speed: .9 },
  { id: "ali", name: "Ali", role: "Stock team", mesh: "cwF", path: [[24.5, 18.3], [33.6, 18.3]], speed: .8 },
];
function activeCoworkers(cfg) {
  const hq = cfg.hq, ws = hq ? hq.ws : null;
  return COWORKERS.filter(c => !(c.hqOnly && !hq) && !(c.clientOnly && hq) && !(c.notHQdesk && hq && (ws === "hot" || ws === "desk")) && !(c.office && hq && c.office === ws));
}
let CW = [];
function buildExtension(cfg, P) {
  const hq = cfg.hq, ws = hq ? hq.ws : null, mine = k => ws === k;
  CW = activeCoworkers(cfg).map(c => ({ ...c, base: c.rot ?? 0, rot: c.rot ?? 0, seg: 0, t: 0, x: c.path ? c.path[0][0] : c.x, z: c.path ? c.path[0][1] : c.z, say: "", sayT: 0, greeted: false }));
  /* ---- private office ---- */
  const rugC = mine("office") ? hq.color : P.rug;
  box(39, .004, 5.2, 4, .01, 4.6, rugC, { tex: "fabric", tile: .8, flat: true });
  solid(39, 0, 4.2, 2.0, .72, .9, "#2a221e", { tex: "wood", tile: 1 }); box(39, .72, 4.2, 2.2, .05, 1.0, "#ffffff", { tex: "wood", tile: 1.2 });
  monitor(39.35, .77, 4.35, "-z", "chart2"); laptop(38.5, .77, 4.25); execChair(39, 3.3);
  officeChair(38.4, 5.55, -1); officeChair(39.6, 5.55, -1);
  solid(36.33, 0, 6.2, .45, 2.3, 3.2, "#4a301e", { tex: "wood", tile: 1.2, faces: { "+x": { tex: "books", em: .02 } } });
  plant(41.4, .9, 1); plant(36.6, 11.3, 0);
  if (mine("office")) {
    for (let i = 0; i < hq.rank; i++) { const z = 1.6 + i * 1.05; box(41.9, 1.45, z, .03, .62, .82, "#1b1b1f", { flat: true }); panel("cert", 41.88, 1.5, z, .7, .52, "-x", .2); }
    trophies(41.62, 9.4, hq.badges);
    if (hq.rank >= 4) { panel("whiteboard", 41.85, .95, 7.2, 1.6, 1.0, "-x", .2); }
    if (hq.rank >= 5) { sofa(40.6, 11.3, "-z", 1.6); }
    box(39, .725, 3.82, .5, .07, .06, hq.color, { flat: true, em: .3 });
  } else { artFrame(41.88, 1.3, 6.5, "-x", 1.4, 1); }
  /* ---- corner office ---- */
  const cRug = mine("corner") ? hq.color : P.rug;
  box(45, .003, 5, 5, .01, 5.4, cRug, { tex: "fabric", tile: .8, flat: true }); box(45, .007, 5, 4.6, .01, 5, cRug, { tex: "fabric", tile: .8, flat: true, em: .03 });
  solid(45, 0, 4.4, 2.6, .72, 1.1, "#1d1a18", { tex: "wood", tile: 1 }); box(45, .72, 4.4, 2.9, .06, 1.3, "#ffffff", { tex: "wood", tile: 1.2 }); box(45, .45, 4.96, 2.6, .04, .02, P.accent, { em: .4, flat: true });
  monitor(44.5, .78, 4.55, "-z", "chart1"); monitor(45.3, .78, 4.55, "-z", "dash"); execChair(45, 3.25);
  officeChair(44.2, 6.0, -1, "#3a2e29", "leather"); officeChair(45.8, 6.0, -1, "#3a2e29", "leather");
  solid(42.33, 0, 3.5, .45, 2.5, 3.4, "#4a301e", { tex: "wood", tile: 1.2, faces: { "+x": { tex: "books", em: .02 } } });
  sofa(46.7, 11.3, "-z", 1.8, true); cyl(46.7, 0, 10.0, .4, .4, "#1d1a18", { solid: true, capTex: "dmarble", capColor: "#ffffff", capTile: .8 });
  cyl(43.2, 0, 10.6, .05, .9, "#c9a24a", { seg: 8 }); sph(43.2, 1.15, 10.6, .25, "#3a6fa8", { seg: 16, rings: 12 }); cyl(43.2, 0, 10.6, .25, .03, "#c9a24a", { seg: 14 });
  plant(47.4, .9, 1); plant(42.7, 11.3, 0);
  if (mine("corner")) {
    trophies(42.62, 8.6, hq.badges, 2.4);
    box(45, .78, 3.85, .7, .1, .07, "#c9a24a", { flat: true, em: .5 }); box(45, .79, 3.83, .5, .06, .01, hq.color, { flat: true, em: .4 });
    if (hq.rank >= 7) { cyl(44.1, .78, 4.6, .09, .05, "#c9a24a", { seg: 12 }); cyl(44.1, .83, 4.6, .03, .2, "#c9a24a", { seg: 8 }); sph(44.1, 1.1, 4.6, .12, "#f2df63", { em: .4, seg: 12, rings: 8 }); }
  }
  /* ---- café ---- */
  solid(44.8, 0, 22.7, 5.6, 1.0, .7, "#3a2a20", { tex: "wood", tile: .8 }); box(44.8, 1.0, 22.7, 5.8, .05, .85, "#ffffff", { tex: "marble", tile: 1 });
  solid(42.05, 0, 23.2, .1, 1.0, 1.6, "#3a2a20", { tex: "wood", tile: .8 });
  box(46.4, 1.05, 22.85, .6, .55, .45, "#9aa0a6", { tex: "metal", tile: .4 }); box(46.4, 1.35, 22.62, .45, .12, .02, "#1b1b1f", { flat: true }); box(46.25, 1.05, 22.55, .06, .2, .06, "#2b2b2e", { flat: true }); box(46.55, 1.05, 22.55, .06, .2, .06, "#2b2b2e", { flat: true });
  [43.3, 43.6, 43.9].forEach((x, i) => cyl(x, 1.05, 22.6, .045, .1, ["#f4f1e8", "#c8372d", "#2f6db3"][i], { seg: 10 }));
  box(44.4, 1.05, 22.6, .5, .22, .3, "#e8dcc4", { flat: true }); box(44.4, 1.27, 22.6, .5, .02, .3, "#c9a24a", { flat: true, em: .2 });
  panel("menu", 45, 1.45, 23.88, 2.2, 1.3, "-z", .85); box(45, 1.4, 23.93, 2.3, 1.4, .04, "#111", { flat: true });
  solid(36.55, 0, 23.25, .9, 1.9, .7, "#d6dade", { tex: "metal", tile: .5 }); box(36.55, .15, 22.89, .78, 1.6, .02, "#bfe6f2", { em: .45, flat: true });
  for (let k = 0; k < 4; k++) [36.3, 36.55, 36.8].forEach((x, i) => box(x, .25 + k * .4, 22.95, .12, .26, .12, ["#e08a1e", "#3f9a6b", "#c8372d"][(i + k) % 3], { flat: true, em: .1 }));
  [[38.4, 18.6], [38.4, 21.8], [45.4, 18.8]].forEach(([x, z]) => { cyl(x, 0, z, .05, .74, "#2b2b2e", { seg: 8 }); cyl(x, 0, z, .26, .03, "#2b2b2e", { seg: 14 }); cyl(x, .74, z, .45, .04, "#ffffff", { tex: "marble", tile: .6, seg: 20 }); colliders.push([x - .45, z - .45, x + .45, z + .45]); });
  [[39.35, 18.6], [37.45, 21.8], [39.35, 21.8], [44.45, 18.8], [37.45, 18.6], [46.25, 18.8]].forEach(([x, z]) => { cyl(x, 0, z, .04, .46, "#4a4f57", { seg: 8 }); cyl(x, .46, z, .2, .05, "#6b3f22", { tex: "leather", tile: .3, seg: 14 }); });
  cyl(38.6, .78, 18.4, .05, .1, "#f4f1e8", { seg: 10 }); cyl(45.2, .78, 18.9, .05, .1, "#f4f1e8", { seg: 10 }); cyl(45.6, .78, 18.7, .05, .12, "#e08a1e", { seg: 10 });
  plant(47.4, 16.7, 1); plant(36.6, 16.7, 0); plant(47.4, 21.0, 0);
  for (const x of [38.4, 45.4]) { cyl(x, 2.55, x < 40 ? 20.2 : 18.8, .01, .65, "#222", { seg: 4 }); cyl(x, 2.4, x < 40 ? 20.2 : 18.8, .22, .16, "#c9a24a", { r2: .06, seg: 14, em: .5 }); }
  /* ---- your workspace on the Finance floor (HQ, Intern to Associate) ---- */
  if (mine("hot")) { box(15.3, .775, 10.4, .12, .005, .12, "#f2df63", { flat: true, em: .3 }); }
  if (mine("desk")) {
    box(15, .775, 9.95, .5, .09, .05, hq.color, { flat: true, em: .35 }); box(15, .79, 9.925, .42, .05, .01, "#fbfaf4", { flat: true, em: .3 });
    cyl(14.2, .775, 10.6, .1, .1, hq.color, { seg: 12 }); 
    if (hq.rank >= 2) { cyl(15.8, .77, 10.6, .1, .14, "#2b2b2e", { seg: 10 }); sph(15.8, 1.0, 10.6, .15, "#ffffff", { tex: "leaves", seg: 10, rings: 6 }); box(14.0, .775, 10.15, .2, .16, .03, "#1b1b1f", { flat: true }); }
  }
}
function trophies(x, z, n, span = 2.6) {
  colliders.push([x - .2, z - span / 2, x + .2, z + span / 2]);
  box(x, 1.2, z, .32, .04, span, "#4a301e", { tex: "wood", tile: .6 }); box(x, 1.75, z, .32, .04, span, "#4a301e", { tex: "wood", tile: .6 });
  const k = Math.min(16, n || 0);
  for (let i = 0; i < k; i++) { const row = i < 8 ? 0 : 1, j = i % 8, zz = z - span / 2 + .18 + j * (span - .36) / 7, y = row ? 1.79 : 1.24, gold = i % 3 ? "#c9a24a" : "#d9dde2";
    cyl(x, y, zz, .05, .03, "#2b2b2e", { seg: 8 }); cyl(x, y + .03, zz, .015, .1, gold, { seg: 6 }); cyl(x, y + .13, zz, .05, .1, gold, { r2: .07, seg: 10, em: .15 }); }
}

const G = {}; // glass geometry goes in its own bucket set
function plant(x, z, big) {
  cyl(x, 0, z, big ? .3 : .24, big ? .55 : .42, "#2b2b2e", { r2: big ? .26 : .21, seg: 16, solid: true, capColor: "#3b2a1e" });
  const top = big ? .55 : .42;
  if (big) { cyl(x, top, z, .03, .9, "#4a3a2a", { seg: 6 }); [[0, 1.1, 0, .42], [.18, 1.45, .1, .34], [-.15, 1.55, -.1, .3], [.05, 1.8, -.05, .26]].forEach(([dx, y, dz, r]) => sph(x + dx, top + y - .55, z + dz, r, "#ffffff", { tex: "leaves", sy: 1.1, seg: 12, rings: 8 })); }
  else [[0, .32, 0, .3], [.14, .5, .08, .22], [-.12, .52, -.06, .2]].forEach(([dx, y, dz, r]) => sph(x + dx, top + y - .1, z + dz, r, "#ffffff", { tex: "leaves", seg: 12, rings: 8 }));
}
function officeChair(x, z, face, c = "#2a2f38", tex = "fabric") {
  cyl(x, .05, z, .035, .37, "#4a4f57", { seg: 8 }); box(x, .04, z, .56, .04, .05, "#2a2a2e", { flat: true }); box(x, .04, z, .05, .04, .56, "#2a2a2e", { flat: true });
  cyl(x, .42, z, .27, .09, c, { tex, tile: .4, seg: 16 });
  box(x, .58, z - face * .26, .46, .5, .07, c, { tex, tile: .4 }); box(x, .5, z - face * .23, .05, .12, .05, "#4a4f57", { flat: true });
}
function execChair(x, z) { cyl(x, .05, z, .04, .38, "#4a4f57", { seg: 8 }); box(x, .04, z, .62, .04, .06, "#2a2a2e", { flat: true }); box(x, .04, z, .06, .04, .62, "#2a2a2e", { flat: true }); cyl(x, .43, z, .3, .11, "#2a221e", { tex: "leather", tile: .4, seg: 16 }); box(x, .6, z - .3, .56, .9, .1, "#2a221e", { tex: "leather", tile: .4 }); [-1, 1].forEach(s => box(x + s * .3, .55, z, .06, .2, .45, "#2a221e", { tex: "leather", tile: .4 })); }
function desk(x, z, w, d) { box(x, .72, z, w, .05, d, "#ffffff", { tex: "wood", tile: 1.2 }); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => box(x + sx * (w / 2 - .06), 0, z + sz * (d / 2 - .06), .05, .72, .05, "#2b313a", { flat: true })); box(x, .3, z - d / 2 + .08, w - .2, .4, .02, "#2b313a", { flat: true }); colliders.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]); }
function monitor(x, y, z, dir, tex) { const s = dir === "+z" ? 1 : -1; box(x, y, z, .2, .015, .16, "#1b1f26", { flat: true }); box(x, y, z - s * .03, .04, .22, .03, "#1b1f26", { flat: true }); box(x, y + .18, z, .62, .37, .03, "#14171c", { flat: true }); panel(tex, x, y + .2, z + s * .017, .58, .33, dir, .95); }
function laptop(x, y, z) { box(x, y, z, .42, .02, .3, "#c4c8ce", { tex: "metal", tile: .3 }); box(x, y + .02, z - .15, .42, .28, .015, "#c4c8ce", { tex: "metal", tile: .3 }); panel("sheet", x, y + .04, z - .14, .38, .24, "+z", .95); }
function cabinet(x, z, band) { solid(x, 0, z, 1.3, 1.4, .8, "#ffffff", { tex: "metal", tile: .6 }); for (let k = 0; k < 4; k++) { box(x, .12 + k * .32, z + .41, 1.2, .28, .02, k === 3 ? band : "#d6dade", { flat: true, tex: k === 3 ? "white" : "metal", tile: .6 }); box(x, .22 + k * .32, z + .43, .3, .035, .03, "#3b3f46", { flat: true }); } box(x - .45, .6, z + .43, .12, .07, .01, "#fbfaf4", { flat: true }); }
function sofa(x, z, dir, w, lux) { const s = dir === "-z" ? 1 : -1, c = lux ? "#2b221e" : "#3b3530", t = "leather"; box(x, 0, z, w, .42, .85, c, { tex: t, tile: .6, solid: true }); box(x, .42, z + s * .33, w, .45, .2, c, { tex: t, tile: .6 }); [-1, 1].forEach(k => box(x + k * (w / 2 - .1), .42, z, .2, .2, .85, c, { tex: t, tile: .6 })); for (let i = 0; i < 2; i++) box(x - w / 4 + i * w / 2, .42, z - s * .05, w / 2 - .25, .1, .6, "#4a403a", { tex: t, tile: .6 }); }
function bench(x, z) { box(x, 0, z, 1.8, .42, .45, "#ffffff", { tex: "wood", tile: .8, solid: true }); }
function artFrame(x, y, z, dir, w, h) { const t = .04; if (dir === "-z") box(x, y - .05, z + .02, w + .1, h + .1, t, "#1b1b1f", { flat: true }); else box(x + .02, y - .05, z, t, h + .1, w + .1, "#1b1b1f", { flat: true }); panel("art", dir === "-z" ? x : x - .008, y, dir === "-z" ? z - .008 : z, w, h, dir, .15); }
function rack(x0, x1, z, bay, island) {
  const len = x1 - x0, cx = (x0 + x1) / 2, dz = island ? .9 : .8; colliders.push([x0, z - dz / 2, x1, z + dz / 2]);
  for (let x = x0; x <= x1 + .01; x += len / Math.round(len / 2)) [-1, 1].forEach(s => box(x, 0, z + s * (dz / 2 - .04), .08, 2.5, .08, "#2f5f9e", { flat: true }));
  [.1, .9, 1.7, 2.45].forEach(y => box(cx, y, z, len, .05, dz, "#e08a1e", { flat: true }));
  const slots = Math.floor(len / .75); let filled = null;
  if (bay) { const hh = H(mul32(bay.seed + 5)); filled = new Set(hh.shuf([...Array(slots * 3).keys()]).slice(0, bay.count)); }
  [.15, .95, 1.75].forEach((y, lvl) => { for (let i = 0; i < slots; i++) {
    const bx = x0 + .375 + i * .75 + (len - slots * .75) / 2;
    if (bay) { if (!filled.has(lvl * slots + i)) continue; box(bx, y, z, .62, .62, .62, "#ffffff", { tex: "cardboard", fit: true }); box(bx, y + .22, z - .315, .5, .12, .01, bay.stripe, { flat: true }); box(bx, y + .22, z + .315, .5, .12, .01, bay.stripe, { flat: true }); }
    else if (rand() > .18) { const bw = .5 + rand() * .15, bh = .4 + rand() * .3; box(bx, y, z, bw, bh, dz - .2, "#ffffff", { tex: "cardboard", fit: true }); }
  } });
}

/* ============================== PEOPLE ============================== */
function person(o) {
  CUR = {}; const skin = o.skin;
  if (!o.sit) [-1, 1].forEach(s => { box(s * .1, 0, .03, .13, .08, .27, "#16181c", { flat: true }); });
  if (o.robe) { if (o.sit) cyl(0, .8, 0, .25, .66, o.robe, { r2: .22, sz: .75, seg: 18 }); else cyl(0, .06, 0, .27, 1.4, o.robe, { r2: .22, sz: .75, seg: 18 }); }
  else if (!o.sit) { [-1, 1].forEach(s => cyl(s * .1, .07, 0, .075, .82, o.pants, { r2: .085, seg: 12 })); cyl(0, .82, 0, .19, .12, o.pants, { r2: .2, sz: .7, seg: 16 }); }
  else cyl(0, .82, 0, .19, .12, o.pants, { r2: .2, sz: .7, seg: 16 });
  cyl(0, .9, 0, o.robe ? .22 : .2, .58, o.top, { r2: .25, sz: .66, seg: 18 }); sph(0, 1.46, 0, .25, o.top, { sy: .35, sz: .66, seg: 16, rings: 6, thMax: Math.PI / 2 });
  [-1, 1].forEach(s => { cyl(s * .29, .86, 0, .055, .6, o.arms || o.top, { r2: .065, seg: 10 }); sph(s * .29, .84, 0, .055, skin, { seg: 10, rings: 6 }); });
  if (o.shirt) { box(0, 1.16, .155, .12, .3, .01, o.shirt, { flat: true }); if (o.tie) box(0, 1.02, .162, .045, .4, .01, o.tie, { flat: true }); }
  if (o.vest) { box(0, 1.0, .16, .4, .3, .01, "#d7e84a", { flat: true, em: .25 }); box(0, 1.08, .165, .4, .025, .01, "#e6e6e6", { flat: true, em: .5 }); }
  cyl(0, 1.44, 0, .055, .1, skin, { seg: 10 });
  if (o.scarf) { sph(0, 1.64, 0, .152, o.scarf, { sy: 1.12, seg: 16, rings: 10 }); cyl(0, 1.38, -.01, .2, .2, o.scarf, { r2: .15, sz: .8, seg: 16 }); sph(0, 1.635, .045, .118, skin, { sy: 1.05, sz: .9, seg: 14, rings: 9 }); }
  else if (o.ghutra) { sph(0, 1.64, 0, .14, skin, { sy: 1.1, seg: 14, rings: 10 }); sph(0, 1.69, -.005, .155, "#f6f6f2", { sy: .95, seg: 16, rings: 10, thMax: Math.PI * .55 }); cyl(0, 1.32, -.06, .2, .4, "#f6f6f2", { r2: .155, sz: .75, seg: 16 }); cyl(0, 1.77, -.005, .158, .035, "#141414", { seg: 18 }); }
  else { sph(0, 1.64, 0, .135, skin, { sy: 1.1, seg: 14, rings: 10 }); sph(0, 1.675, -.012, .142, o.hair, { sy: 1.0, seg: 14, rings: 8, thMax: Math.PI * .5 }); if (o.long) cyl(0, 1.3, -.07, .13, .4, o.hair, { r2: .14, sz: .6, seg: 12 }); }
  if (!o.scarf) { [-1, 1].forEach(s => { sph(s * .14, 1.64, 0, .03, skin, { seg: 8, rings: 5 }); }); }
  if (o.beard) sph(0, 1.56, .065, .1, o.hair || "#1f1a17", { sy: .7, sz: .7, seg: 12, rings: 8 });
  const ez = o.scarf ? .157 : .126;
  [-1, 1].forEach(s => sph(s * .047, 1.665, ez, .017, "#141414", { seg: 8, rings: 5 }));
  if (o.glasses) { [-1, 1].forEach(s => box(s * .048, 1.645, ez + .012, .07, .045, .008, "#111", { flat: true })); box(0, 1.665, ez + .012, .03, .01, .008, "#111", { flat: true }); }
  if (o.sit) {
    for (const a of Object.values(CUR)) for (let i = 1; i < a.length; i += 12) a[i] -= .36;
    const lc = o.robe || o.pants;
    [-1, 1].forEach(s => { box(s * .1, .4, .2, .17, .14, .5, lc); cyl(s * .1, .07, .42, .07, .38, lc, { r2: .075, seg: 10 }); box(s * .1, 0, .47, .13, .08, .27, "#16181c", { flat: true }); });
  }
  const out = CUR; CUR = B; return out;
}

/* ============================== GL ============================== */
const cv = document.getElementById("gl");
const gl = cv.getContext("webgl", { antialias: true }) || cv.getContext("experimental-webgl");
let prog, loc = {}, staticBufs = [], glassBufs = [], meshBufs = {}, fxBufs = {}, pathBuf = null, aniso = null;
const VS = `attribute vec3 aP;attribute vec3 aN;attribute vec4 aC;attribute vec2 aT;uniform mat4 uP,uV,uM;uniform vec2 uScroll;
varying vec3 vN;varying vec4 vC;varying float vD;varying vec3 vW;varying vec2 vT;
void main(){vec4 w=uM*vec4(aP,1.);vec4 v=uV*w;gl_Position=uP*v;vN=(uM*vec4(aN,0.)).xyz;vC=aC;vD=-v.z;vW=w.xyz;vT=aT+uScroll;}`;
const FS = `precision mediump float;varying vec3 vN;varying vec4 vC;varying float vD;varying vec3 vW;varying vec2 vT;
uniform sampler2D uTex;uniform vec3 uFog;uniform vec3 uEye;uniform float uAlpha;uniform float uSpec;
void main(){vec3 n=normalize(vN);vec3 alb=texture2D(uTex,vT).rgb*vC.rgb;
vec3 L=normalize(vec3(.3,.9,.35));float hemi=.5+.5*n.y;
vec3 amb=mix(vec3(.30,.31,.36),vec3(.66,.64,.60),hemi);
float key=max(dot(n,L),0.);float fill=max(dot(n,normalize(vec3(-.5,.25,-.7))),0.);
vec2 g=vec2(6.,4.5);vec2 q=vW.xz-vec2(3.,3.);vec2 c=q-g*floor(q/g+.5);float pool=exp(-dot(c,c)*.22);
float flr=step(.9,n.y);float ao=mix(.6,1.,smoothstep(0.,1.1,vW.y));ao=mix(ao,1.,flr);ao*=mix(1.,.82,smoothstep(2.6,3.2,vW.y)*(1.-flr));
vec3 lit=alb*(amb*ao+vec3(1.,.96,.9)*(.40*key+.12*fill)+pool*vec3(.24,.22,.19));
vec3 V=normalize(uEye-vW);vec3 Hh=normalize(L+V);float sp=pow(max(dot(n,Hh),0.),48.)*uSpec;
vec3 R=reflect(-V,n);float sheen=uSpec*flr*pool*.35+uSpec*.12*pow(1.-max(dot(n,V),0.),3.);
lit+=vec3(1.,.97,.9)*(sp*.5+sheen);
vec3 col=mix(lit,alb*1.12+sp*.3,vC.a);
float f=smoothstep(20.,48.,vD);col=mix(col,uFog,f);
col=col*1.08/(1.+col*.12);
gl_FragColor=vec4(col,uAlpha);}`;
function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
function upload(arr, dyn) { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), dyn ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW); return { b, n: arr.length / 12 }; }
function glTex(T) {
  if (!T.t) T.t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, T.t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, T.c); gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
}
function initGL() {
  prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  for (const k of ["aP", "aN", "aC", "aT"]) loc[k] = gl.getAttribLocation(prog, k);
  for (const k of ["uP", "uV", "uM", "uFog", "uEye", "uAlpha", "uSpec", "uScroll", "uTex"]) loc[k] = gl.getUniformLocation(prog, k);
  aniso = gl.getExtension("EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
  buildTextures(); for (const T of Object.values(TEX)) glTex(T);
  gl.uniform1i(loc.uTex, 0); gl.activeTexture(gl.TEXTURE0);
  for (const [k, m] of Object.entries(MESH)) meshBufs[k] = Object.entries(m).map(([tex, a]) => ({ tex, ...upload(a) }));
  CUR = {}; cyl(0, 0, 0, .32, 3.1, "#f2df63", { seg: 20, noCap: true, em: 1 }); fxBufs.beam = upload(CUR.white);
  CUR = {}; sph(0, 0, 0, .14, "#f2df63", { seg: 4, rings: 2, sy: 1.5, em: 1 }); fxBufs.gem = upload(CUR.white);
  CUR = {}; cyl(0, 0, 0, .55, .02, "#f2df63", { seg: 28, em: 1 }); fxBufs.ring = upload(CUR.white); CUR = B;
  gl.enable(gl.DEPTH_TEST); gl.clearColor(.06, .09, .15, 1);
}
function uploadWorld(cfg) {
  for (const k in G) delete G[k];
  buildWorld(cfg);
  staticBufs.forEach(s => gl.deleteBuffer(s.b)); glassBufs.forEach(s => gl.deleteBuffer(s.b));
  staticBufs = Object.entries(B).filter(([t, a]) => a.length).map(([tex, a]) => ({ tex, ...upload(a) }));
  glassBufs = Object.entries(G).filter(([t, a]) => a.length).map(([tex, a]) => ({ tex, ...upload(a) }));
  const T = TEX.logo; drawLogo(T.g, cfg.logo || "Haddad & Partners"); glTex(T);
}
function bind(b) {
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.enableVertexAttribArray(loc.aP); gl.vertexAttribPointer(loc.aP, 3, gl.FLOAT, false, 48, 0);
  gl.enableVertexAttribArray(loc.aN); gl.vertexAttribPointer(loc.aN, 3, gl.FLOAT, false, 48, 12);
  gl.enableVertexAttribArray(loc.aC); gl.vertexAttribPointer(loc.aC, 4, gl.FLOAT, false, 48, 24);
  gl.enableVertexAttribArray(loc.aT); gl.vertexAttribPointer(loc.aT, 2, gl.FLOAT, false, 48, 40);
}
function drawBuf(s, spec) { gl.bindTexture(gl.TEXTURE_2D, TEX[s.tex] ? TEX[s.tex].t : TEX.white.t); gl.uniform1f(loc.uSpec, spec ?? SPEC[s.tex] ?? .08); bind(s.b); gl.drawArrays(gl.TRIANGLES, 0, s.n); }
const mul = (a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; };
const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]); };
const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); };
const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); };
const trans = (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
const I4 = trans(0, 0, 0);

/* ============================== NAVIGATION ============================== */
const DOORS = { meet: { x: 6, in: [6, 10.9], out: [6, 13.6] }, fin: { x: 18, in: [18, 10.9], out: [18, 13.6] }, exec: { x: 30, in: [30, 10.9], out: [30, 13.6] }, office: { x: 39, in: [39, 10.9], out: [39, 13.6] }, corner: { x: 45, in: [45, 10.9], out: [45, 13.6] }, lobby: { x: 6, in: [6, 17.3], out: [6, 14.5] }, stock: { x: 22, in: [22, 17.8], out: [22, 14.5] }, cafe: { x: 41.5, in: [41.5, 17.3], out: [41.5, 14.5] } };
const HUBS = { fin: [17.75, 6.2], meet: [10.6, 9.2], exec: [27.2, 8.6], stock: [24, 19.2] };
const blockedR = (x, z, r) => colliders.some(c => x > c[0] - r && x < c[2] + r && z > c[1] - r && z < c[3] + r);
function segBlocked(a, b) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let s = .4; s < d - .2; s += .1) { const t = s / d; if (blockedR(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, .3)) return true; } return false; }
function pathTo(p, tg) {
  const ra = roomKey(p.x, p.z), rb = tg.room, pts = [];
  if (ra !== rb) {
    if (ra !== "corr") { const d = DOORS[ra]; if (!(Math.abs(p.x - d.x) < 1.1 && Math.abs(p.z - d.in[1]) < 1.1)) { if (HUBS[ra] && segBlocked([p.x, p.z], d.in)) pts.push(HUBS[ra]); pts.push(d.in); } pts.push(d.out); }
    if (rb !== "corr") { const d = DOORS[rb]; if (!(ra === "corr" && Math.abs(p.x - d.x) < .9)) pts.push(d.out); pts.push(d.in); }
  }
  const lastP = pts.length ? pts[pts.length - 1] : [p.x, p.z];
  if (tg.via && segBlocked(lastP, tg.ap)) for (const v of tg.via) pts.push(v);
  pts.push(tg.ap);
  return pts;
}

const MESH = {
  sara: person({ pants: "#2b2f36", top: "#2f3a4c", skin: "#c99b7a", hair: "#2a1d16", long: true, shirt: "#f4f1ea" }),
  execM: person({ robe: "#f6f6f2", top: "#f6f6f2", skin: "#b98463", hair: "#1f1a17", ghutra: true, beard: true }),
  execS: person({ pants: "#1c2633", top: "#1c2633", skin: "#c08a64", hair: "#1f1a17", shirt: "#f4f1ea", tie: "#c8372d", beard: true, glasses: true }),
  execF: person({ pants: "#1a1a1e", top: "#1a1a1e", robe: "#1a1a1e", skin: "#d4a586", scarf: "#1a1a1e" }),
  mariam: person({ pants: "#14161a", top: "#2a3442", skin: "#d4a586", scarf: "#c9b98a" }),
  ravi: person({ pants: "#2f3b4a", top: "#3a4a5e", skin: "#9c6b4e", hair: "#151515", vest: true }),
  cwA: person({ pants: "#33363d", top: "#5b6f8a", skin: "#c99b7a", hair: "#2a1d16", shirt: "#f4f1ea", tie: "#2f6db3" }),
  cwB: person({ pants: "#2a2a30", top: "#8a3b4a", skin: "#e0b394", hair: "#5a3520", long: true }),
  cwC: person({ pants: "#1a1a1e", top: "#3e5c58", robe: "#3e5c58", skin: "#cf9f80", scarf: "#d9c7a0" }),
  cwD: person({ robe: "#f6f6f2", top: "#f6f6f2", skin: "#a8775a", hair: "#1f1a17", ghutra: true }),
  cwE: person({ pants: "#4a4238", top: "#e6e0d4", skin: "#8a5e44", hair: "#151515", glasses: true }),
  cwF: person({ pants: "#2b2f36", top: "#3a3f48", skin: "#d4a586", hair: "#1a1410", shirt: "#ffffff", beard: true }),
  barista: person({ pants: "#22252b", top: "#2b2b2e", skin: "#b07a58", hair: "#151515", vest: false, shirt: "#6b3f22" }),
  cwA_s: person({ pants: "#33363d", top: "#5b6f8a", skin: "#c99b7a", hair: "#2a1d16", shirt: "#f4f1ea", tie: "#2f6db3", sit: true }),
  cwB_s: person({ pants: "#2a2a30", top: "#8a3b4a", skin: "#e0b394", hair: "#5a3520", long: true, sit: true }),
  cwC_s: person({ pants: "#1a1a1e", top: "#3e5c58", robe: "#3e5c58", skin: "#cf9f80", scarf: "#d9c7a0", sit: true }),
  cwD_s: person({ robe: "#f6f6f2", top: "#f6f6f2", skin: "#a8775a", hair: "#1f1a17", ghutra: true, sit: true }),
  cwE_s: person({ pants: "#4a4238", top: "#e6e0d4", skin: "#8a5e44", hair: "#151515", glasses: true, sit: true }),
  boss_s: person({ pants: "#1a1a1e", top: "#1a1a1e", robe: "#1a1a1e", skin: "#d4a586", scarf: "#5a2a40", sit: true }),
};
const NPCS = {
  sara: { x: 10.1, z: 5.2, rot: -Math.PI / 2, mesh: "sara" },
  exec: { x: 30, z: 2.1, rot: 0, mesh: "execM" },
  mariam: { x: 1.2, z: 20.4, rot: Math.PI / 2, mesh: "mariam" },
  ravi: { x: 30.5, z: 19.6, rot: Math.PI, mesh: "ravi" },
};
for (const n of Object.values(NPCS)) n.base = n.rot;
