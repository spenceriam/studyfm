var motifs = (() => {
  const AromaSwirl = ({ size = 60, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 60 60", style, fill: "currentColor" }, /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "M30 52 C 12 52, 8 38, 18 32 C 28 27, 36 32, 32 40 C 28 46, 20 44, 22 38 C 23 34, 28 34, 28 38",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "3.5",
      strokeLinecap: "round"
    }
  ));
  const SunFace = ({ size = 80, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 80 80", style }, /* @__PURE__ */ React.createElement("g", { fill: "currentColor" }, Array.from({ length: 12 }).map((_, i) => {
    const a = i / 12 * Math.PI * 2;
    const r1 = 26, r2 = 38;
    const w = 0.13;
    const p1x = 40 + Math.cos(a - w) * r1, p1y = 40 + Math.sin(a - w) * r1;
    const p2x = 40 + Math.cos(a + w) * r1, p2y = 40 + Math.sin(a + w) * r1;
    const p3x = 40 + Math.cos(a) * r2, p3y = 40 + Math.sin(a) * r2;
    return /* @__PURE__ */ React.createElement("path", { key: i, d: `M${p1x} ${p1y} L${p3x} ${p3y} L${p2x} ${p2y} Z` });
  }), /* @__PURE__ */ React.createElement("circle", { cx: "40", cy: "40", r: "22" })), /* @__PURE__ */ React.createElement("g", { fill: "#f2e8d5" }, /* @__PURE__ */ React.createElement("ellipse", { cx: "33", cy: "36", rx: "2.2", ry: "3" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "47", cy: "36", rx: "2.2", ry: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M32 44 Q 40 50, 48 44", stroke: "#f2e8d5", strokeWidth: "2", fill: "none", strokeLinecap: "round" })));
  const MoonFace = ({ size = 60, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 60 60", style }, /* @__PURE__ */ React.createElement("path", { d: "M42 8 a22 22 0 1 0 0 44 a16 16 0 0 1 0 -44 z", fill: "currentColor" }), /* @__PURE__ */ React.createElement("g", { fill: "#f2e8d5" }, /* @__PURE__ */ React.createElement("ellipse", { cx: "34", cy: "24", rx: "1.8", ry: "2.4" }), /* @__PURE__ */ React.createElement("path", { d: "M28 34 Q 34 38, 40 34", stroke: "#f2e8d5", strokeWidth: "1.8", fill: "none", strokeLinecap: "round" })));
  const EyeMotif = ({ size = 50, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 50 30", style, fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M2 15 Q 25 0, 48 15 Q 25 30, 2 15 Z" }), /* @__PURE__ */ React.createElement("circle", { cx: "25", cy: "15", r: "7", fill: "#f2e8d5" }), /* @__PURE__ */ React.createElement("circle", { cx: "25", cy: "15", r: "4", fill: "currentColor" }), /* @__PURE__ */ React.createElement("g", { stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }, /* @__PURE__ */ React.createElement("line", { x1: "25", y1: "2", x2: "25", y2: "-2" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "8", x2: "9", y2: "4" }), /* @__PURE__ */ React.createElement("line", { x1: "38", y1: "8", x2: "41", y2: "4" })));
  const HandSpiral = ({ size = 60, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 60 60", style }, /* @__PURE__ */ React.createElement("g", { fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M16 28 L 16 48 Q 16 56, 24 56 L 38 56 Q 44 56, 44 50 L 44 28 Q 44 24, 40 24 L 40 14 Q 40 10, 36 10 Q 32 10, 32 14 L 32 24 Q 32 20, 28 20 Q 24 20, 24 24 L 24 12 Q 24 8, 20 8 Q 16 8, 16 12 L 16 26 Q 14 24, 12 26 Q 10 28, 12 32 L 16 38 Z" })), /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "M30 42 m0 -6 a6 6 0 1 1 -4 6 a3 3 0 1 1 4 -3",
      fill: "none",
      stroke: "#f2e8d5",
      strokeWidth: "2",
      strokeLinecap: "round"
    }
  ));
  const CompassRose = ({ size = 60, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 60 60", style }, /* @__PURE__ */ React.createElement("g", { fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M30 4 L 34 28 L 30 32 L 26 28 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M30 56 L 34 32 L 30 28 L 26 32 Z", opacity: "0.55" }), /* @__PURE__ */ React.createElement("path", { d: "M4 30 L 28 26 L 32 30 L 28 34 Z", opacity: "0.7" }), /* @__PURE__ */ React.createElement("path", { d: "M56 30 L 32 26 L 28 30 L 32 34 Z", opacity: "0.85" }), /* @__PURE__ */ React.createElement("circle", { cx: "30", cy: "30", r: "3" })), /* @__PURE__ */ React.createElement("g", { fill: "none", stroke: "currentColor", strokeWidth: "1.5" }, /* @__PURE__ */ React.createElement("circle", { cx: "30", cy: "30", r: "22" })));
  const WaveBlock = ({ width = 160, height = 26, style }) => /* @__PURE__ */ React.createElement("svg", { width, height, viewBox: `0 0 ${width} ${height}`, style, fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: `M0 ${height * 0.5} Q ${width * 0.125} ${height * 0.05}, ${width * 0.25} ${height * 0.5} T ${width * 0.5} ${height * 0.5} T ${width * 0.75} ${height * 0.5} T ${width} ${height * 0.5} L ${width} ${height} L 0 ${height} Z` }));
  const Globe = ({ size = 56, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 56 56", style }, /* @__PURE__ */ React.createElement("circle", { cx: "28", cy: "28", r: "22", fill: "currentColor" }), /* @__PURE__ */ React.createElement("g", { fill: "none", stroke: "#f2e8d5", strokeWidth: "1.8", strokeLinecap: "round" }, /* @__PURE__ */ React.createElement("ellipse", { cx: "28", cy: "28", rx: "22", ry: "8" }), /* @__PURE__ */ React.createElement("ellipse", { cx: "28", cy: "28", rx: "10", ry: "22" }), /* @__PURE__ */ React.createElement("line", { x1: "6", y1: "28", x2: "50", y2: "28" })));
  const Fish = ({ size = 60, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size * 0.55, viewBox: "0 0 60 33", style }, /* @__PURE__ */ React.createElement("g", { fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M4 16 Q 16 2, 38 16 Q 16 30, 4 16 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M38 16 L 56 6 L 52 16 L 56 26 Z" })), /* @__PURE__ */ React.createElement("circle", { cx: "14", cy: "14", r: "1.8", fill: "#f2e8d5" }));
  const DancingFigure = ({ size = 60, style }) => /* @__PURE__ */ React.createElement("svg", { width: size * 0.7, height: size, viewBox: "0 0 42 60", style }, /* @__PURE__ */ React.createElement("g", { fill: "currentColor" }, /* @__PURE__ */ React.createElement("circle", { cx: "22", cy: "8", r: "5.5" }), /* @__PURE__ */ React.createElement("path", { d: "M19 14 Q 16 24, 22 34 Q 28 42, 24 50 Q 22 54, 26 58 L 22 58 Q 18 54, 20 48 Q 16 40, 13 34 Q 13 24, 19 14 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M20 18 Q 10 14, 4 4 L 7 2 Q 13 10, 22 16 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M26 22 Q 36 20, 40 28 L 38 30 Q 32 24, 24 26 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M20 42 Q 30 50, 38 46 L 40 50 Q 32 56, 22 48 Z" })), /* @__PURE__ */ React.createElement("g", { fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M2 2 L 6 6 M0 8 L 5 10" }), /* @__PURE__ */ React.createElement("path", { d: "M36 4 L 32 8 M40 10 L 35 12" }), /* @__PURE__ */ React.createElement("path", { d: "M38 30 L 34 34" })));
  const ScratchFigure = ({ size = 70, style, bg = "#2a1a0e" }) => /* @__PURE__ */ React.createElement("svg", { width: size * 0.8, height: size, viewBox: "0 0 56 70", style }, /* @__PURE__ */ React.createElement("rect", { width: "56", height: "70", fill: bg }), /* @__PURE__ */ React.createElement("g", { fill: "currentColor" }, /* @__PURE__ */ React.createElement("circle", { cx: "28", cy: "14", r: "7" }), /* @__PURE__ */ React.createElement("path", { d: "M22 22 Q 18 32, 24 42 L 20 58 L 24 58 L 28 46 L 32 58 L 36 58 L 32 42 Q 38 32, 34 22 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M23 26 L 10 22 L 8 25 L 22 30 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M33 26 L 46 22 L 48 25 L 34 30 Z" })), /* @__PURE__ */ React.createElement("g", { stroke: "currentColor", strokeWidth: "1", fill: "none" }, /* @__PURE__ */ React.createElement("line", { x1: "4", y1: "4", x2: "10", y2: "8" }), /* @__PURE__ */ React.createElement("line", { x1: "50", y1: "6", x2: "54", y2: "10" }), /* @__PURE__ */ React.createElement("line", { x1: "2", y1: "62", x2: "8", y2: "66" }), /* @__PURE__ */ React.createElement("line", { x1: "50", y1: "62", x2: "54", y2: "66" })));
  const TreeMotif = ({ size = 60, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 60 60", style }, /* @__PURE__ */ React.createElement("g", { fill: "currentColor" }, /* @__PURE__ */ React.createElement("rect", { x: "27", y: "38", width: "6", height: "18" }), /* @__PURE__ */ React.createElement("circle", { cx: "30", cy: "26", r: "18" })), /* @__PURE__ */ React.createElement("g", { fill: "#f2e8d5" }, /* @__PURE__ */ React.createElement("circle", { cx: "24", cy: "22", r: "2.5" }), /* @__PURE__ */ React.createElement("circle", { cx: "34", cy: "18", r: "2" }), /* @__PURE__ */ React.createElement("circle", { cx: "32", cy: "30", r: "1.8" })));
  const RoughLine = ({ width = 200, style, color = "currentColor" }) => /* @__PURE__ */ React.createElement("svg", { width, height: "4", viewBox: `0 0 ${width} 4`, style, fill: color }, /* @__PURE__ */ React.createElement("path", { d: `M0 2 Q ${width * 0.25} 0, ${width * 0.5} 2 T ${width} 2`, stroke: color, strokeWidth: "2", fill: "none", strokeLinecap: "round" }));
  Object.assign(window, {
    AromaSwirl,
    SunFace,
    MoonFace,
    EyeMotif,
    HandSpiral,
    CompassRose,
    WaveBlock,
    Globe,
    Fish,
    DancingFigure,
    ScratchFigure,
    TreeMotif,
    RoughLine
  });
})();
