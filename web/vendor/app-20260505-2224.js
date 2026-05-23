(() => {
  const SKY = {
    stops: [
      { h: 0, paper: "#3c4350", accent: "#7a3a52" },
      // night gray
      { h: 5, paper: "#5a4a58", accent: "#9a4a52" },
      // pre-dawn warm gray
      { h: 6.5, paper: "#d68a4a", accent: "#a8492a" },
      // dawn orange
      { h: 8, paper: "#9ec8e0", accent: "#c88a2c" },
      // morning blue
      { h: 12, paper: "#7ab4d4", accent: "#a8492a" },
      // midday blue
      { h: 16, paper: "#86b8d4", accent: "#a8492a" },
      // afternoon blue
      { h: 18, paper: "#e8804c", accent: "#a8492a" },
      // dusk orange
      { h: 20, paper: "#7a5868", accent: "#a8492a" },
      // twilight mauve
      { h: 22, paper: "#4a4854", accent: "#7a3a52" },
      // night gray
      { h: 24, paper: "#3c4350", accent: "#7a3a52" }
    ]
  };
  const hexToRgb = (h) => {
    const n = parseInt(h.replace("#", ""), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  };
  const rgbToHex = (a) => "#" + a.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
  const lerpHex = (a, b, t) => {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
  };
  function paletteAt(hourFloat) {
    const h = (hourFloat % 24 + 24) % 24;
    for (let i = 0; i < SKY.stops.length - 1; i++) {
      const a = SKY.stops[i], b = SKY.stops[i + 1];
      if (h >= a.h && h <= b.h) {
        const t = (h - a.h) / (b.h - a.h);
        return { paper: lerpHex(a.paper, b.paper, t), accent: lerpHex(a.accent, b.accent, t) };
      }
    }
    return { paper: SKY.stops[0].paper, accent: SKY.stops[0].accent };
  }
  const isDay = (h) => h >= 6 && h <= 18;
  function useRealClock() {
    const demo = typeof window !== "undefined" && /[?&]demo=1\b/.test(window.location.search);
    const [hour, setHour] = React.useState(() => {
      const d = /* @__PURE__ */ new Date();
      return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    });
    React.useEffect(() => {
      if (demo) {
        let h = hour;
        const id2 = setInterval(() => {
          h = (h + 12 / 60) % 24;
          setHour(h);
        }, 700);
        return () => clearInterval(id2);
      }
      const id = setInterval(() => {
        const d = /* @__PURE__ */ new Date();
        setHour(d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600);
      }, 30 * 1e3);
      return () => clearInterval(id);
    }, [demo]);
    return hour;
  }
  function Vinyl({ playing, sienna, duoShadow, duoHighlight, cream }) {
    return /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "sp-spin 4.5s linear infinite",
      animationPlayState: playing ? "running" : "paused",
      filter: "drop-shadow(0 30px 80px rgba(0,0,0,0.5))",
      position: "relative"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "46%",
      height: "46%",
      borderRadius: "50%",
      background: cream,
      boxShadow: "inset 0 0 0 1px rgba(30,20,10,0.22), 0 1px 0 rgba(255,235,200,0.06)"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "84%",
      height: "84%",
      borderRadius: "50%",
      overflow: "hidden",
      boxShadow: "inset 0 0 0 1px rgba(30,20,10,0.16)"
    } }, /* @__PURE__ */ React.createElement(DuotonePhoto, { src: "assets/spencer.png", shadow: duoShadow, highlight: duoHighlight, id: "sp", contrast: 1.4, style: { width: "100%", height: "100%", transform: "scale(1.04)", transformOrigin: "50% 42%" } }))), /* @__PURE__ */ React.createElement(
      "svg",
      {
        viewBox: "0 0 200 200",
        preserveAspectRatio: "xMidYMid meet",
        style: { position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }
      },
      /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "vinyl-body", cx: "50%", cy: "50%", r: "50%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#1f140a" }), /* @__PURE__ */ React.createElement("stop", { offset: "55%", stopColor: "#0e0804" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#000" })), /* @__PURE__ */ React.createElement("radialGradient", { id: "vinyl-sheen", cx: "38%", cy: "32%", r: "55%" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "rgba(255,235,200,0.12)" }), /* @__PURE__ */ React.createElement("stop", { offset: "55%", stopColor: "rgba(255,235,200,0)" })), /* @__PURE__ */ React.createElement("radialGradient", { id: "vinyl-rim", cx: "50%", cy: "50%", r: "50%" }, /* @__PURE__ */ React.createElement("stop", { offset: "93%", stopColor: "rgba(255,235,200,0)" }), /* @__PURE__ */ React.createElement("stop", { offset: "98%", stopColor: "rgba(255,235,200,0.18)" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "rgba(255,235,200,0)" })), /* @__PURE__ */ React.createElement("mask", { id: "vinyl-label-mask" }, /* @__PURE__ */ React.createElement("rect", { width: "200", height: "200", fill: "white" }), /* @__PURE__ */ React.createElement("circle", { cx: "100", cy: "100", r: "46", fill: "black" })), /* @__PURE__ */ React.createElement("path", { id: "dj-caption-top", d: "M 60 100 A 40 40 0 0 1 140 100", fill: "none" }), /* @__PURE__ */ React.createElement("path", { id: "dj-caption-bottom", d: "M 56.5 100 A 43.5 43.5 0 0 0 143.5 100", fill: "none" })),
      /* @__PURE__ */ React.createElement("g", { mask: "url(#vinyl-label-mask)" }, /* @__PURE__ */ React.createElement("circle", { cx: "100", cy: "100", r: "100", fill: "url(#vinyl-body)" }), /* @__PURE__ */ React.createElement("g", { fill: "none", stroke: "#1a110a", strokeWidth: "0.32", opacity: "0.95" }, Array.from({ length: 54 }).map((_, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: "100", cy: "100", r: 42 + i * 1.06 }))), /* @__PURE__ */ React.createElement("g", { fill: "none", stroke: "rgba(200,140,60,0.26)", strokeWidth: "0.55" }, [52, 66, 82, 96].map((r, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: "100", cy: "100", r }))), /* @__PURE__ */ React.createElement("g", { fill: "rgba(255,235,200,0.10)" }, [[60, 72, 0.5], [74, 118, 0.4], [126, 64, 0.45], [140, 128, 0.4], [88, 150, 0.5], [112, 52, 0.35], [44, 100, 0.4], [156, 90, 0.4], [80, 38, 0.35]].map(([x, y, r], i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: x, cy: y, r }))), /* @__PURE__ */ React.createElement("circle", { cx: "100", cy: "100", r: "100", fill: "url(#vinyl-sheen)" })),
      /* @__PURE__ */ React.createElement("circle", { cx: "100", cy: "100", r: "100", fill: "url(#vinyl-rim)" }),
      /* @__PURE__ */ React.createElement(
        "text",
        {
          fill: sienna,
          fontFamily: '"Oswald", Impact, sans-serif',
          fontWeight: "700",
          fontSize: "4.4",
          letterSpacing: "1.8",
          style: { transition: "fill 1.2s linear" }
        },
        /* @__PURE__ */ React.createElement("textPath", { href: "#dj-caption-top", side: "right", startOffset: "50%", textAnchor: "middle" }, "CODE")
      ),
      /* @__PURE__ */ React.createElement(
        "text",
        {
          fill: sienna,
          fontFamily: '"Oswald", Impact, sans-serif',
          fontWeight: "700",
          fontSize: "4",
          letterSpacing: "1.4",
          style: { transition: "fill 1.2s linear" }
        },
        /* @__PURE__ */ React.createElement("textPath", { href: "#dj-caption-bottom", startOffset: "50%", textAnchor: "middle" }, "DJ OF THE VIBES")
      )
    ));
  }
  function BigSun({ size = 72 }) {
    return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 80 80" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "sun-glow", cx: "50%", cy: "50%", r: "50%" }, /* @__PURE__ */ React.createElement("stop", { offset: "55%", stopColor: "rgba(255,210,120,0.35)" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "rgba(255,210,120,0)" }))), /* @__PURE__ */ React.createElement("circle", { cx: "40", cy: "40", r: "38", fill: "url(#sun-glow)" }), /* @__PURE__ */ React.createElement("g", { fill: "#e8a542" }, Array.from({ length: 12 }).map((_, i) => {
      const a = i / 12 * Math.PI * 2;
      const r1 = 22, r2 = 32, w = 0.13;
      const p1x = 40 + Math.cos(a - w) * r1, p1y = 40 + Math.sin(a - w) * r1;
      const p2x = 40 + Math.cos(a + w) * r1, p2y = 40 + Math.sin(a + w) * r1;
      const p3x = 40 + Math.cos(a) * r2, p3y = 40 + Math.sin(a) * r2;
      return /* @__PURE__ */ React.createElement("path", { key: i, d: `M${p1x} ${p1y} L${p3x} ${p3y} L${p2x} ${p2y} Z` });
    }), /* @__PURE__ */ React.createElement("circle", { cx: "40", cy: "40", r: "20" })), /* @__PURE__ */ React.createElement("g", { fill: "#1e140a", opacity: "0.9" }, /* @__PURE__ */ React.createElement("circle", { cx: "34", cy: "38", r: "1.6" }), /* @__PURE__ */ React.createElement("circle", { cx: "46", cy: "38", r: "1.6" }), /* @__PURE__ */ React.createElement("path", { d: "M34 44 Q 40 48, 46 44", stroke: "#1e140a", strokeWidth: "1.6", fill: "none", strokeLinecap: "round" })));
  }
  function BigMoon({ size = 58 }) {
    return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 80 80" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("radialGradient", { id: "moon-glow", cx: "50%", cy: "50%", r: "50%" }, /* @__PURE__ */ React.createElement("stop", { offset: "55%", stopColor: "rgba(245,235,205,0.28)" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "rgba(245,235,205,0)" }))), /* @__PURE__ */ React.createElement("circle", { cx: "40", cy: "40", r: "38", fill: "url(#moon-glow)" }), /* @__PURE__ */ React.createElement("path", { d: "M52 8 a32 32 0 1 0 0 64 a22 22 0 0 1 0 -64 z", fill: "#f5ebcd" }), /* @__PURE__ */ React.createElement("g", { fill: "#1e140a", opacity: "0.18" }, /* @__PURE__ */ React.createElement("circle", { cx: "40", cy: "28", r: "2.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "34", cy: "44", r: "1.8" }), /* @__PURE__ */ React.createElement("circle", { cx: "46", cy: "50", r: "2.2" })));
  }
  const CLOUD_SHAPES = [
    // 0 — classic four-bump cumulus, a touch wider on the right.
    [
      { cx: 22, cy: 35, rx: 18, ry: 14 },
      { cx: 44, cy: 28, rx: 22, ry: 18 },
      { cx: 68, cy: 32, rx: 20, ry: 16 },
      { cx: 84, cy: 38, rx: 14, ry: 11 }
    ],
    // 1 — long stratus, low and stretched, two big domes.
    [
      { cx: 18, cy: 36, rx: 14, ry: 10 },
      { cx: 40, cy: 30, rx: 24, ry: 14 },
      { cx: 66, cy: 33, rx: 22, ry: 13 },
      { cx: 86, cy: 36, rx: 12, ry: 9 }
    ],
    // 2 — fluffy three-tier puff with a tall middle.
    [
      { cx: 26, cy: 38, rx: 18, ry: 13 },
      { cx: 50, cy: 24, rx: 18, ry: 18 },
      { cx: 74, cy: 34, rx: 18, ry: 16 }
    ],
    // 3 — small tufted cloudlet, lopsided right.
    [
      { cx: 30, cy: 34, rx: 14, ry: 11 },
      { cx: 50, cy: 30, rx: 16, ry: 13 },
      { cx: 68, cy: 36, rx: 12, ry: 9 }
    ]
  ];
  function Cloud({ size = 140, color = "#f5ebcd", opacity = 0.8, variant = 0 }) {
    const blobs = CLOUD_SHAPES[variant % CLOUD_SHAPES.length];
    return /* @__PURE__ */ React.createElement("svg", { width: size, height: size * 0.55, viewBox: "0 0 100 55", style: { opacity, display: "block" } }, /* @__PURE__ */ React.createElement("g", { fill: color }, blobs.map((b, i) => /* @__PURE__ */ React.createElement("ellipse", { key: i, cx: b.cx, cy: b.cy, rx: b.rx, ry: b.ry }))));
  }
  function MidClouds({ dayNow }) {
    const dayColor = "#f6efd9", duskColor = "#f3d9b8", nightColor = "#7a7a8e";
    const color = dayNow ? dayColor : nightColor;
    const opacity = dayNow ? 0.95 : 0.5;
    const clouds = [
      { dur: 130, delay: 0, y: "24%", size: 150, op: 0.8, dir: "r", v: 0 },
      { dur: 170, delay: -85, y: "32%", size: 110, op: 0.55, dir: "l", v: 2 },
      { dur: 150, delay: -55, y: "40%", size: 130, op: 0.65, dir: "r", v: 1 },
      { dur: 195, delay: -150, y: "46%", size: 95, op: 0.45, dir: "l", v: 3 },
      { dur: 165, delay: -110, y: "28%", size: 100, op: 0.5, dir: "l", v: 1 }
    ];
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, opacity, transition: "opacity 1.2s linear" } }, clouds.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      position: "absolute",
      top: c.y,
      animation: `${c.dir === "r" ? "sp-cloud-r" : "sp-cloud-l"} ${c.dur}s linear infinite`,
      animationDelay: `${c.delay}s`
    } }, /* @__PURE__ */ React.createElement(Cloud, { size: c.size, opacity: c.op, color, variant: c.v }))));
  }
  function Stars({ visible }) {
    const stars = React.useMemo(() => Array.from({ length: 36 }).map((_, i) => ({
      x: (Math.sin(i * 7.13) * 0.5 + 0.5) * 100,
      y: (Math.cos(i * 4.41) * 0.5 + 0.5) * 42,
      size: 5 + i * 3 % 5,
      delay: i % 8 * 0.5
    })), []);
    return /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, pointerEvents: "none", opacity: visible ? 1 : 0, transition: "opacity 2s", zIndex: 3 } }, stars.map((s, i) => /* @__PURE__ */ React.createElement(
      "svg",
      {
        key: i,
        width: s.size,
        height: s.size,
        viewBox: "0 0 14 14",
        style: { position: "absolute", left: `${s.x}%`, top: `${s.y}%`, animation: "sp-twinkle 3.2s ease-in-out infinite", animationDelay: `${s.delay}s` }
      },
      /* @__PURE__ */ React.createElement("path", { d: "M7 0 L8 6 L14 7 L8 8 L7 14 L6 8 L0 7 L6 6 Z", fill: "#f3e6c7" })
    )));
  }
  function Jet({ visible }) {
    const size = 220;
    return /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 2,
      opacity: visible ? 0.75 : 0,
      transition: "opacity 1.2s linear"
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      top: "10%",
      left: 0,
      animation: "sp-jet-r 220s linear infinite"
    } }, /* @__PURE__ */ React.createElement("svg", { width: size, height: size * 0.15, viewBox: "0 0 380 56" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "jet-trail", x1: "0", x2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#f3e6c7", stopOpacity: "0" }), /* @__PURE__ */ React.createElement("stop", { offset: "40%", stopColor: "#f3e6c7", stopOpacity: "0.18" }), /* @__PURE__ */ React.createElement("stop", { offset: "75%", stopColor: "#f3e6c7", stopOpacity: "0.45" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#f3e6c7", stopOpacity: "0.75" }))), /* @__PURE__ */ React.createElement(
      "path",
      {
        d: "M 0 30.5\n                   Q 100 30, 200 29.7\n                   Q 300 29.5, 348 29.5\n                   L 348 31.5\n                   Q 300 31.5, 200 31.3\n                   Q 100 31, 0 30.5 Z",
        fill: "url(#jet-trail)"
      }
    ), /* @__PURE__ */ React.createElement("g", { fill: "#1e140a", opacity: "0.9", transform: "translate(345, 30)" }, /* @__PURE__ */ React.createElement("path", { d: "M -22 -2\n                     Q -22 -3, -19 -3\n                     L 8 -3\n                     Q 14 -2.5, 16 0\n                     Q 14 2.5, 8 3\n                     L -19 3\n                     Q -22 3, -22 2\n                     Z" }), /* @__PURE__ */ React.createElement("rect", { x: "6", y: "-2.4", width: "6", height: "1.2", fill: "#f3e6c7", opacity: "0.5" }), /* @__PURE__ */ React.createElement("path", { d: "M -6 2\n                     L 4 2\n                     L -2 9\n                     L -16 9\n                     Z" }), /* @__PURE__ */ React.createElement("path", { d: "M -22 2\n                     L -16 2\n                     L -18 5.5\n                     L -24 5.5\n                     Z" }), /* @__PURE__ */ React.createElement("path", { d: "M -22 -3\n                     L -17 -3\n                     L -19 -10\n                     L -22 -10\n                     Z" })))));
  }
  function ShootingStars({ visible }) {
    const streaks = [
      { delay: 0, top: "10%", left: "10%", dur: 7, size: 140, angle: -22 },
      { delay: 18, top: "22%", left: "55%", dur: 6, size: 110, angle: -30 },
      { delay: 34, top: "6%", left: "70%", dur: 8, size: 160, angle: -18 }
    ];
    return /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      zIndex: 3,
      opacity: visible ? 1 : 0,
      transition: "opacity 1.5s linear"
    } }, streaks.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: {
      position: "absolute",
      top: s.top,
      left: s.left,
      width: s.size,
      height: 2,
      transform: `rotate(${s.angle}deg)`,
      transformOrigin: "left center",
      animation: `sp-shoot 50s linear infinite`,
      animationDelay: `${s.delay}s`,
      opacity: 0
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      width: "100%",
      height: "100%",
      background: "linear-gradient(to right, rgba(243,230,199,0) 0%, rgba(243,230,199,0.85) 60%, rgba(255,255,255,1) 100%)",
      borderRadius: 2,
      boxShadow: "0 0 6px rgba(243,230,199,0.9)"
    } }), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      right: -2,
      top: -2,
      width: 6,
      height: 6,
      borderRadius: 3,
      background: "#fff",
      boxShadow: "0 0 8px rgba(255,255,255,0.9)"
    } }))));
  }
  function Equalizer({ audioRef, status, color, width = 130, height = 22, bars = 16 }) {
    const playing = status === "playing";
    const canvasRef = React.useRef(null);
    const analyserRef = React.useRef(null);
    const ctxRef = React.useRef(null);
    const sourceRef = React.useRef(null);
    const animRef = React.useRef(null);
    React.useEffect(() => {
      if (!audioRef.current) return;
      if (!ctxRef.current) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.75;
        analyser.minDecibels = -100;
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        ctxRef.current = audioCtx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      }
      const clearBars = () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        animRef.current = null;
        if (canvasRef.current) canvasRef.current.innerHTML = "";
      };
      if (status !== "playing") {
        clearBars();
        if (ctxRef.current && ctxRef.current.state === "running") {
          ctxRef.current.suspend().catch(() => {
          });
        }
        return;
      }
      if (ctxRef.current && ctxRef.current.state === "suspended") {
        ctxRef.current.resume().catch(() => {
        });
      }
      const draw = () => {
        if (!analyserRef.current || status !== "playing") {
          clearBars();
          return;
        }
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const gap = 3, barW = (width - gap * (bars - 1)) / bars;
        const binCount = data.length;
        const startBin = 0;
        const endBin = Math.floor(binCount * 0.7);
        const range = endBin - startBin;
        const center = (bars - 1) / 2;
        const sigma = bars / 4;
        let html = "";
        for (let i = 0; i < bars; i++) {
          const logIndex = Math.pow(i / bars, 0.7) * range;
          const binIdx = startBin + Math.floor(logIndex);
          let value = data[Math.min(binIdx, binCount - 1)];
          const dist = i - center;
          const bellWeight = Math.exp(-(dist * dist) / (2 * sigma * sigma));
          const weighted = 0.4 + 0.6 * bellWeight;
          value = Math.min(255, value * weighted * 1.5);
          const h = Math.max(2, value / 255 * height);
          html += `<div style="width:${barW}px;height:${h}px;background:${color};border-radius:1px;transition:height 60ms ease-out"></div>`;
        }
        if (canvasRef.current) canvasRef.current.innerHTML = html;
        animRef.current = requestAnimationFrame(draw);
      };
      clearBars();
      animRef.current = requestAnimationFrame(draw);
      return clearBars;
    }, [status, audioRef, width, height, bars, color]);
    React.useEffect(() => {
      const onVisibility = () => {
        if (status === "playing" && ctxRef.current && ctxRef.current.state === "suspended") {
          ctxRef.current.resume().catch(() => {
          });
        }
      };
      window.addEventListener("visibilitychange", onVisibility);
      return () => window.removeEventListener("visibilitychange", onVisibility);
    }, [status]);
    React.useEffect(() => {
      return () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        if (ctxRef.current && ctxRef.current.state !== "closed") {
          ctxRef.current.close().catch(() => {
          });
        }
        ctxRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
      };
    }, []);
    if (status !== "playing") {
      const label = status === "idle" ? "Now Live" : status === "buffering" ? "Buffering\u2026" : (
        /* paused */
        "Paused"
      );
      return /* @__PURE__ */ React.createElement("div", { key: `status-${status}`, style: {
        width,
        height,
        minWidth: width,
        minHeight: height,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 10,
        letterSpacing: 4,
        textTransform: "uppercase",
        color,
        opacity: status === "buffering" ? 1 : 0.7,
        animation: status === "buffering" ? "sp-buffer 1.2s ease-in-out infinite" : "none"
      } }, /* @__PURE__ */ React.createElement("span", { style: { whiteSpace: "nowrap" } }, label));
    }
    return /* @__PURE__ */ React.createElement("div", { key: "eq", ref: canvasRef, style: { width, height, minWidth: width, minHeight: height, flexShrink: 0, display: "flex", alignItems: "flex-end", gap: 3, justifyContent: "center" } });
  }
  const AUTOPLAY_KEY = "spencerfm-autoplay";
  const HOLD_MS = 1e3;
  function PlayButton({ playing, onToggle }) {
    const [progress, setProgress] = React.useState(0);
    const [toast, setToast] = React.useState(null);
    const [autoEnabled, setAutoEnabled] = React.useState(
      () => typeof window !== "undefined" && localStorage.getItem(AUTOPLAY_KEY) === "true"
    );
    const holdRef = React.useRef({ raf: 0, start: 0, completed: false });
    const cancelHold = () => {
      cancelAnimationFrame(holdRef.current.raf);
      holdRef.current.raf = 0;
      setProgress(0);
    };
    const startHold = () => {
      holdRef.current.completed = false;
      holdRef.current.start = performance.now();
      const tick = () => {
        const p = Math.min(1, (performance.now() - holdRef.current.start) / HOLD_MS);
        setProgress(p);
        if (p >= 1) {
          holdRef.current.completed = true;
          const cur = localStorage.getItem(AUTOPLAY_KEY) === "true";
          const next = !cur;
          localStorage.setItem(AUTOPLAY_KEY, String(next));
          setAutoEnabled(next);
          setToast(`Auto-play ${next ? "on" : "off"}`);
          setTimeout(() => setToast(null), 1600);
          cancelHold();
          return;
        }
        holdRef.current.raf = requestAnimationFrame(tick);
      };
      holdRef.current.raf = requestAnimationFrame(tick);
    };
    const handleClick = () => {
      if (holdRef.current.completed) {
        holdRef.current.completed = false;
        return;
      }
      onToggle();
    };
    const R = 26, C = 2 * Math.PI * R;
    const offset = C * (1 - progress);
    const showRing = progress > 0;
    return /* @__PURE__ */ React.createElement("div", { style: { position: "relative", width: 48, height: 48, flexShrink: 0 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: handleClick,
        onMouseDown: startHold,
        onMouseUp: cancelHold,
        onMouseLeave: cancelHold,
        onTouchStart: (e) => {
          e.preventDefault();
          startHold();
        },
        onTouchEnd: cancelHold,
        "aria-label": playing ? "Pause stream \u2014 hold to toggle auto-play" : "Play stream \u2014 hold to toggle auto-play",
        style: {
          position: "absolute",
          inset: 0,
          width: 48,
          height: 48,
          borderRadius: 24,
          background: "#f3e6c7",
          color: "#1e140a",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.15s",
          transform: showRing ? "scale(0.94)" : "scale(1)"
        }
      },
      playing ? /* @__PURE__ */ React.createElement(PauseIcon, { size: 20 }) : /* @__PURE__ */ React.createElement(PlayIcon, { size: 22, style: { marginLeft: 2 } })
    ), /* @__PURE__ */ React.createElement(
      "svg",
      {
        width: "56",
        height: "56",
        viewBox: "0 0 56 56",
        style: { position: "absolute", left: -4, top: -4, pointerEvents: "none" }
      },
      /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "28",
          cy: "28",
          r: R,
          fill: "none",
          stroke: "rgba(245,235,205,0.18)",
          strokeWidth: "2",
          style: { opacity: showRing ? 1 : 0, transition: "opacity 0.2s" }
        }
      ),
      /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "28",
          cy: "28",
          r: R,
          fill: "none",
          stroke: "#e6b76a",
          strokeWidth: "2",
          style: { opacity: autoEnabled && !showRing ? 1 : 0, transition: "opacity 0.25s" }
        }
      ),
      /* @__PURE__ */ React.createElement(
        "circle",
        {
          cx: "28",
          cy: "28",
          r: R,
          fill: "none",
          stroke: "#e6b76a",
          strokeWidth: "2.5",
          strokeDasharray: C,
          strokeDashoffset: offset,
          strokeLinecap: "round",
          transform: "rotate(-90 28 28)",
          style: { opacity: showRing ? 1 : 0, transition: "opacity 0.15s" }
        }
      )
    ), autoEnabled && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      right: -3,
      bottom: -3,
      width: 18,
      height: 18,
      borderRadius: 9,
      background: "#e6b76a",
      color: "#1e140a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 7,
      letterSpacing: 0.5,
      fontWeight: 700,
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      pointerEvents: "none"
    } }, "AP"), toast && /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: "50%",
      bottom: "calc(100% + 12px)",
      transform: "translateX(-50%)",
      whiteSpace: "nowrap",
      padding: "6px 12px",
      borderRadius: 999,
      background: "#1e140a",
      color: "#f3e6c7",
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 10,
      letterSpacing: 3,
      textTransform: "uppercase",
      boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
      animation: "sp-toast 1.6s ease-out forwards"
    } }, toast));
  }
  function CodeFM() {
    const audioRef = React.useRef(null);
    const [status, setStatus] = React.useState("idle");
    React.useEffect(() => {
      if (typeof window !== "undefined" && localStorage.getItem(AUTOPLAY_KEY) === "true") {
        setStatus("buffering");
      }
    }, []);
    React.useEffect(() => {
      audioRef.current = document.getElementById("streamAudio");
      if (audioRef.current) audioRef.current.volume = volume;
    }, []);
    React.useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const onWaiting = () => setStatus((s) => s === "buffering" ? "buffering" : s);
      const onPlaying = () => setStatus((s) => s === "buffering" ? "playing" : s);
      const onError = () => setStatus((s) => s === "playing" ? "paused" : s);
      audio.addEventListener("waiting", onWaiting);
      audio.addEventListener("playing", onPlaying);
      audio.addEventListener("error", onError);
      return () => {
        audio.removeEventListener("waiting", onWaiting);
        audio.removeEventListener("playing", onPlaying);
        audio.removeEventListener("error", onError);
      };
    }, []);
    const playing = status === "playing";
    const togglePlay = React.useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (status === "playing" || status === "buffering") {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        setStatus("paused");
      } else {
        setStatus("buffering");
        audio.src = "/stream";
        audio.load();
        audio.play().catch(() => setStatus("paused"));
      }
    }, [status]);
    const [volume, setVolume] = React.useState(0.7);
    const [preMute, setPreMute] = React.useState(0.7);
    const muted = volume === 0;
    const toggleMute = () => {
      if (muted) {
        setVolume(preMute || 0.7);
      } else {
        setPreMute(volume);
        setVolume(0);
      }
    };
    React.useEffect(() => {
      if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);
    const [auto, setAuto] = React.useState(true);
    const [manualHour, setManualHour] = React.useState(12);
    const realHour = useRealClock();
    const hour = auto ? realHour : manualHour;
    const pal = paletteAt(hour);
    const dayNow = isDay(hour);
    const ink = dayNow ? "#1e140a" : "#f3e6c7";
    const cream = "#f2e8cc";
    const sienna = pal.accent;
    const duoShadow = dayNow ? "#1e140a" : "#231a30";
    const duoHighlight = dayNow ? "#c88a2c" : "#cfd8e8";
    const VINYL_CX_PCT = 50;
    const VINYL_CY_VH = 54;
    const VINYL_R_VH = 32;
    const ARC_PEAK_VH = 2.5;
    const dayT = Math.max(0, Math.min(1, (hour - 6) / 12));
    const nightHour = hour < 6 ? hour + 24 : hour;
    const nightT = Math.max(0, Math.min(1, (nightHour - 18) / 12));
    const sunTheta = (1 - dayT) * Math.PI;
    const sunR = VINYL_R_VH + ARC_PEAK_VH * Math.sin(sunTheta);
    const sunDx = sunR * Math.cos(sunTheta);
    const sunDy = -sunR * Math.sin(sunTheta);
    const moonTheta = nightT * Math.PI;
    const moonR = VINYL_R_VH + ARC_PEAK_VH * Math.sin(moonTheta);
    const moonDx = moonR * Math.cos(moonTheta);
    const moonDy = -moonR * Math.sin(moonTheta);
    return /* @__PURE__ */ React.createElement("div", { style: {
      position: "fixed",
      inset: 0,
      background: pal.paper,
      transition: auto ? "background 1.2s linear" : "none",
      color: ink,
      fontFamily: '"Alegreya", Georgia, serif',
      overflow: "hidden"
    } }, /* @__PURE__ */ React.createElement("svg", { width: "0", height: "0", style: { position: "absolute" } }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("filter", { id: "sp-paper" }, /* @__PURE__ */ React.createElement("feTurbulence", { type: "fractalNoise", baseFrequency: "1.4", numOctaves: "2", seed: "2" }), /* @__PURE__ */ React.createElement("feColorMatrix", { values: "0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 0.10 0" })), /* @__PURE__ */ React.createElement("clipPath", { id: "sp-arch", clipPathUnits: "objectBoundingBox" }, /* @__PURE__ */ React.createElement("path", { d: "M 0 0.42 Q 0 0, 0.5 0 Q 1 0, 1 0.42 L 1 1 L 0 1 Z" })))), /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", inset: 0, opacity: 0.35, mixBlendMode: "multiply", pointerEvents: "none", zIndex: 1 } }, /* @__PURE__ */ React.createElement("svg", { width: "100%", height: "100%", preserveAspectRatio: "none" }, /* @__PURE__ */ React.createElement("rect", { width: "100%", height: "100%", filter: "url(#sp-paper)" }))), /* @__PURE__ */ React.createElement(Stars, { visible: !dayNow }), /* @__PURE__ */ React.createElement(ShootingStars, { visible: !dayNow }), /* @__PURE__ */ React.createElement(Jet, { visible: dayNow }), /* @__PURE__ */ React.createElement(MidClouds, { dayNow }), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: `${VINYL_CX_PCT}%`,
      top: `${VINYL_CY_VH}vh`,
      transform: `translate(-50%, -50%) translate(${sunDx}vh, ${sunDy}vh)`,
      transition: auto ? "transform 0.4s linear, opacity 0.4s linear" : "none",
      zIndex: 2,
      pointerEvents: "none",
      opacity: dayNow ? 1 : 0
    } }, /* @__PURE__ */ React.createElement(BigSun, { size: 64 })), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: `${VINYL_CX_PCT}%`,
      top: `${VINYL_CY_VH}vh`,
      transform: `translate(-50%, -50%) translate(${moonDx}vh, ${moonDy}vh)`,
      transition: auto ? "transform 0.4s linear, opacity 0.4s linear" : "none",
      zIndex: 2,
      pointerEvents: "none",
      opacity: !dayNow ? 1 : 0
    } }, /* @__PURE__ */ React.createElement(BigMoon, { size: 60 })), /* @__PURE__ */ React.createElement("div", { style: {
      position: "relative",
      zIndex: 6,
      padding: "clamp(8px, 2vh, 22px) 24px 0",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4
    } }, /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: '"IBM Plex Mono", monospace',
      fontSize: 10,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: dayNow ? "#1e140a" : sienna,
      opacity: 1,
      textAlign: "center",
      transition: "color 1.2s linear",
      fontWeight: 600
    } }, "A 24/7 STATION OF GOOD MUSIC"), /* @__PURE__ */ React.createElement("div", { style: {
      fontFamily: '"Oswald", Impact, sans-serif',
      fontWeight: 700,
      fontSize: "clamp(30px, 5.4vw, 64px)",
      letterSpacing: 0,
      lineHeight: 0.95,
      color: ink,
      transition: "color 1.2s linear",
      textAlign: "center"
    } }, "CODE", /* @__PURE__ */ React.createElement("span", { style: { color: sienna, transition: "color 1.2s linear" } }, "."), "FM")), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: `${VINYL_CX_PCT}%`,
      top: `${VINYL_CY_VH}vh`,
      transform: "translate(-50%, -50%)",
      width: `${VINYL_R_VH * 2}vh`,
      height: `${VINYL_R_VH * 2}vh`,
      zIndex: 4
    } }, /* @__PURE__ */ React.createElement(Vinyl, { playing, sienna, duoShadow, duoHighlight, cream })), /* @__PURE__ */ React.createElement("div", { style: {
      position: "absolute",
      left: "50%",
      bottom: "max(3.5vh, 24px)",
      transform: "translateX(-50%)",
      zIndex: 7,
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "10px 18px",
      background: "rgba(20,18,30,0.45)",
      border: "1px solid rgba(245,235,205,0.22)",
      borderRadius: 999,
      backdropFilter: "blur(8px)"
    } }, /* @__PURE__ */ React.createElement(PlayButton, { playing, onToggle: togglePlay }), /* @__PURE__ */ React.createElement(Equalizer, { audioRef, status, color: "#f3e6c7", width: 130, height: 36 }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0, paddingLeft: 8, borderLeft: "1px solid rgba(245,235,205,0.22)" } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: toggleMute,
        "aria-label": muted ? "Unmute" : "Mute",
        style: {
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "#f3e6c7",
          opacity: muted ? 0.55 : 0.7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      muted ? /* @__PURE__ */ React.createElement(MuteIcon, { size: 14 }) : /* @__PURE__ */ React.createElement(VolumeIcon, { size: 14 })
    ), /* @__PURE__ */ React.createElement(VolumeSlider, { value: volume, onChange: setVolume, trackColor: "#f3e6c7", fillColor: "#e6b76a", width: 68 }))), /* @__PURE__ */ React.createElement("style", null, `
        @keyframes sp-spin { to { transform: rotate(360deg); } }
        @keyframes sp-onair { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }
        @keyframes sp-buffer { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
        @keyframes sp-toast {
          0%   { opacity: 0; transform: translateX(-50%) translateY(4px); }
          15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          80%  { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes sp-cloud-r {
          from { transform: translateX(-30vw); }
          to   { transform: translateX(130vw); }
        }
        @keyframes sp-cloud-l {
          from { transform: translateX(130vw); }
          to   { transform: translateX(-30vw); }
        }
        /* Daytime jet \u2014 slow drift across the sky, then a long pause
           offstage before the next pass. Active crossing \u2248 first 30s
           of a 220s loop (the SVG is wide so the trail finishes
           leaving the right edge by ~50s); the rest the plane sits
           offscreen for ~90s of empty sky before the next sighting. */
        @keyframes sp-jet-r {
          0%   { transform: translateX(-25vw); }
          22%  { transform: translateX(125vw); }
          100% { transform: translateX(125vw); }
        }
        /* Shooting star \u2014 long pause, brief streak. The streak appears
           at the start of the active window, fades out fast. */
        @keyframes sp-shoot {
          0%   { opacity: 0; transform: translate(-30vw, 30vh) rotate(var(--ang, -22deg)); }
          1%   { opacity: 1; }
          5%   { opacity: 1; transform: translate(30vw, -10vh) rotate(var(--ang, -22deg)); }
          7%   { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes sp-twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.9); }
          50%      { opacity: 1;    transform: scale(1.1); }
        }
      `));
  }
  Object.assign(window, { CodeFM });
})();
