// scenes.jsx — minimal space backdrops for codejams.fm
// Clean SpaceX-feel: deep void + restrained star field + subtle nebula bloom.
// Heavy elements (planets, grids, chrome) removed for v2.

function useStars(count, seed) {
  return React.useMemo(() => {
    let s = seed;
    const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    return Array.from({
      length: count
    }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: rand() * 1.2 + 0.15,
      o: rand() * 0.6 + 0.25,
      tw: rand() * 4 + 2,
      td: rand() * 5
    }));
  }, [count, seed]);
}
function StarField({
  count = 220,
  seed = 42
}) {
  const stars = useStars(count, seed);
  return /*#__PURE__*/React.createElement("svg", {
    className: "cj-stars",
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none"
  }, stars.map((s, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: s.x,
    cy: s.y,
    r: s.r * 0.12,
    fill: "#fff",
    opacity: s.o
  }, /*#__PURE__*/React.createElement("animate", {
    attributeName: "opacity",
    values: `${s.o};${s.o * 0.25};${s.o}`,
    dur: `${s.tw}s`,
    begin: `${s.td}s`,
    repeatCount: "indefinite"
  }))));
}

// ── 01 Void — pure deep space, minimal ─────────────────────────────────────
function SceneVoid() {
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-scene cj-scene--void"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-bg cj-bg--void"
  }), /*#__PURE__*/React.createElement(StarField, {
    count: 240,
    seed: 11
  }));
}

// ── 02 Nebula — single soft bloom, no busy clouds ──────────────────────────
function SceneNebula() {
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-scene cj-scene--nebula"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-bg cj-bg--nebula"
  }), /*#__PURE__*/React.createElement(StarField, {
    count: 300,
    seed: 23
  }));
}

// ── 03 Orbit — distant earthlimb at bottom, no chrome ──────────────────────
function SceneOrbit() {
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-scene cj-scene--orbit"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-bg cj-bg--void"
  }), /*#__PURE__*/React.createElement(StarField, {
    count: 200,
    seed: 7
  }), /*#__PURE__*/React.createElement("svg", {
    className: "cj-orbit-arc",
    viewBox: "0 0 1600 900",
    preserveAspectRatio: "xMidYMax slice"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: "atmoV2",
    cx: "50%",
    cy: "100%",
    r: "62%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "92%",
    stopColor: "oklch(0.78 0.14 235)",
    stopOpacity: "0"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "96%",
    stopColor: "oklch(0.85 0.16 220)",
    stopOpacity: "0.55"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "oklch(0.85 0.16 220)",
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("ellipse", {
    cx: "800",
    cy: "1920",
    rx: "1500",
    ry: "1180",
    fill: "url(#atmoV2)"
  }), /*#__PURE__*/React.createElement("ellipse", {
    cx: "800",
    cy: "1925",
    rx: "1480",
    ry: "1170",
    fill: "oklch(0.06 0.03 252)"
  })));
}

// ── 04 Drift — slow scanline + dot grid, neofuturistic terminal ────────────
function SceneDrift() {
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-scene cj-scene--drift"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-bg cj-bg--drift"
  }), /*#__PURE__*/React.createElement("div", {
    className: "cj-dotgrid"
  }), /*#__PURE__*/React.createElement(StarField, {
    count: 120,
    seed: 5
  }));
}

// ── 05 Custom — drop your own AI-gen render ────────────────────────────────
function SceneCustom() {
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-scene cj-scene--custom"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-bg cj-bg--void"
  }), /*#__PURE__*/React.createElement("image-slot", {
    id: "cj-bg-custom",
    shape: "rect",
    placeholder: "Drop your AI-generated scene here  \xB7  (rendered fullscreen)",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%'
    }
  }));
}
const SCENES = {
  void: {
    name: 'Void',
    Component: SceneVoid
  },
  nebula: {
    name: 'Nebula',
    Component: SceneNebula
  },
  orbit: {
    name: 'Orbit',
    Component: SceneOrbit
  },
  drift: {
    name: 'Drift',
    Component: SceneDrift
  },
  custom: {
    name: 'Custom',
    Component: SceneCustom
  }
};
function Scene({
  id
}) {
  const def = SCENES[id] || SCENES.void;
  const C = def.Component;
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-scene-wrap"
  }, /*#__PURE__*/React.createElement(C, null));
}
Object.assign(window, {
  Scene,
  SCENES
});