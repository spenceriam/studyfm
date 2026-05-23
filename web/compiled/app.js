// app.jsx — codejams.fm v2 (minimal, centered, SpaceX-clean)

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scene": "void",
  "accent": "#FFFFFF",
  "focusMin": 25,
  "shortMin": 5,
  "longMin": 15
} /*EDITMODE-END*/;
const ACCENT_PRESETS = ['#FFFFFF',
// pure white — default SpaceX
'#7CD9F5',
// electric cyan
'#9DB4FF',
// periwinkle
'#FF6B5A' // pomofocus tomato (warm)
];
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const wrapRef = React.useRef(null);
  const [pomVisible, setPomVisible] = React.useState(() => {
    try {
      return localStorage.getItem('codejams.pom.hidden') !== '1';
    } catch (e) {
      return true;
    }
  });
  const [pomPos, setPomPos] = React.useState(() => {
    try {
      const raw = localStorage.getItem('codejams.pom.pos');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  });
  const [dragging, setDragging] = React.useState(false);
  const togglePom = () => {
    setPomVisible(v => {
      try {
        localStorage.setItem('codejams.pom.hidden', v ? '1' : '0');
      } catch (e) {}
      return !v;
    });
  };

  // Drag: panel can be repositioned by dragging from any non-interactive area
  const isMobile = () => window.matchMedia('(max-width: 720px)').matches;
  // HIDE button sits ~20px above the panel — clamp Y so it stays on-screen
  const MIN_TOP = 26;
  const PAD = 8;
  const startDrag = e => {
    if (isMobile()) return; // mobile uses fixed-bottom layout
    if (e.target.closest('button, input, textarea, select, a, [contenteditable]')) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    e.preventDefault();
    setDragging(true);
    const rect = wrap.getBoundingClientRect();
    const sx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const sy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const ox = rect.left;
    const oy = rect.top;
    let latest = {
      x: ox,
      y: oy
    };
    const onMove = ev => {
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX ?? 0;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY ?? 0;
      const w = wrap.offsetWidth;
      const h = wrap.offsetHeight;
      const newX = Math.max(PAD, Math.min(window.innerWidth - w - PAD, ox + (cx - sx)));
      const newY = Math.max(MIN_TOP, Math.min(window.innerHeight - h - PAD, oy + (cy - sy)));
      latest = {
        x: newX,
        y: newY
      };
      setPomPos(latest);
    };
    const onUp = () => {
      setDragging(false);
      try {
        localStorage.setItem('codejams.pom.pos', JSON.stringify(latest));
      } catch (e) {}
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, {
      passive: false
    });
    window.addEventListener('touchend', onUp);
  };

  // Clamp position to viewport on resize (and ditch position entirely on mobile)
  React.useEffect(() => {
    const onResize = () => {
      if (isMobile()) return;
      if (!pomPos || !wrapRef.current) return;
      const w = wrapRef.current.offsetWidth;
      const h = wrapRef.current.offsetHeight;
      const x = Math.max(PAD, Math.min(window.innerWidth - w - PAD, pomPos.x));
      const y = Math.max(MIN_TOP, Math.min(window.innerHeight - h - PAD, pomPos.y));
      if (x !== pomPos.x || y !== pomPos.y) setPomPos({
        x,
        y
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pomPos]);
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent);
  }, [t.accent]);
  const wrapStyle = pomPos ? {
    left: pomPos.x,
    top: pomPos.y,
    right: 'auto'
  } : {};
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-app",
    "data-scene": t.scene
  }, /*#__PURE__*/React.createElement(Scene, {
    id: t.scene
  }), /*#__PURE__*/React.createElement("div", {
    className: "cj-overlay"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-pom-wrap",
    ref: wrapRef,
    "data-visible": pomVisible ? '1' : '0',
    "data-dragging": dragging ? '1' : '0',
    "data-positioned": pomPos ? '1' : '0',
    style: wrapStyle
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-pom-slot"
  }, /*#__PURE__*/React.createElement(Pomodoro, {
    focusMin: t.focusMin,
    shortMin: t.shortMin,
    longMin: t.longMin,
    onHide: togglePom,
    onDragStart: startDrag
  })), /*#__PURE__*/React.createElement("button", {
    className: "cj-pom-show",
    onClick: togglePom,
    "aria-label": "Show timer",
    title: "Show timer + tasks",
    tabIndex: pomVisible ? -1 : 0
  }, "TIMER")), /*#__PURE__*/React.createElement("main", {
    className: "cj-center"
  }, /*#__PURE__*/React.createElement(Player, null))), /*#__PURE__*/React.createElement(TweaksPanel, {
    title: "codejams \xB7 tweaks"
  }, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Scene"
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Backdrop",
    value: t.scene,
    options: Object.keys(SCENES).map(k => ({
      value: k,
      label: SCENES[k].name
    })),
    onChange: v => setTweak('scene', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Accent"
  }), /*#__PURE__*/React.createElement(TweakColor, {
    label: "Color",
    value: t.accent,
    options: ACCENT_PRESETS,
    onChange: v => setTweak('accent', v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Pomodoro"
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Focus",
    value: t.focusMin,
    min: 5,
    max: 90,
    step: 5,
    unit: "m",
    onChange: v => setTweak('focusMin', v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Short break",
    value: t.shortMin,
    min: 1,
    max: 20,
    step: 1,
    unit: "m",
    onChange: v => setTweak('shortMin', v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Long break",
    value: t.longMin,
    min: 5,
    max: 45,
    step: 5,
    unit: "m",
    onChange: v => setTweak('longMin', v)
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));