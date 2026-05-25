// StudyFM — bubbly music player + corner pomodoro
const { useState, useEffect, useRef, useMemo } = React;

// ── palettes (light + dark variants per theme) ───────────────────────
const THEMES = {
  bubblegum: {
    name: "Bubblegum",
    accent: "#ff5fa2", accent2: "#a78bfa", accent3: "#7dd3fc",
    light: {
      bg: "linear-gradient(140deg,#ffe1ef 0%, #f3e1ff 50%, #dff3ff 100%)",
      ink: "#3b1a3b", inkSoft: "#7a4f7a",
      card: "#fffafc", cardEdge: "rgba(255,255,255,.9)",
      shadow: "0 1px 0 rgba(255,255,255,.9) inset, 0 18px 40px -12px rgba(120,40,100,.25), 0 6px 14px -8px rgba(120,40,100,.18)",
      softMix: "rgba(0,0,0,.05)",
    },
    dark: {
      bg: "linear-gradient(140deg,#2a0e2c 0%, #1a1240 50%, #0d2238 100%)",
      ink: "#fde7f0", inkSoft: "#c79ec7",
      card: "#2a1431", cardEdge: "rgba(255,255,255,.08)",
      shadow: "0 1px 0 rgba(255,255,255,.06) inset, 0 18px 40px -12px rgba(0,0,0,.6), 0 6px 14px -8px rgba(0,0,0,.4)",
      softMix: "rgba(255,255,255,.06)",
    },
  },
  citrus: {
    name: "Citrus",
    accent: "#ff7849", accent2: "#ffb43d", accent3: "#ff5d8f",
    light: {
      bg: "linear-gradient(140deg,#fff1d6 0%, #ffd4b8 50%, #ffbcd1 100%)",
      ink: "#4a2418", inkSoft: "#8a5340",
      card: "#fffbf3", cardEdge: "rgba(255,255,255,.9)",
      shadow: "0 1px 0 rgba(255,255,255,.9) inset, 0 18px 40px -12px rgba(160,80,30,.25), 0 6px 14px -8px rgba(160,80,30,.18)",
      softMix: "rgba(74,36,24,.06)",
    },
    dark: {
      bg: "linear-gradient(140deg,#2a1408 0%, #3a1a12 50%, #2c0e1a 100%)",
      ink: "#ffe4cc", inkSoft: "#d4a288",
      card: "#321a10", cardEdge: "rgba(255,255,255,.08)",
      shadow: "0 1px 0 rgba(255,255,255,.06) inset, 0 18px 40px -12px rgba(0,0,0,.6), 0 6px 14px -8px rgba(0,0,0,.4)",
      softMix: "rgba(255,255,255,.06)",
    },
  },
  mint: {
    name: "Mint Cloud",
    accent: "#1fbf9e", accent2: "#5eb6ff", accent3: "#b39cff",
    light: {
      bg: "linear-gradient(140deg,#d6ffe8 0%, #d4f1ff 50%, #e8e3ff 100%)",
      ink: "#0f3b3a", inkSoft: "#3f7a78",
      card: "#f6fffc", cardEdge: "rgba(255,255,255,.9)",
      shadow: "0 1px 0 rgba(255,255,255,.9) inset, 0 18px 40px -12px rgba(20,100,90,.22), 0 6px 14px -8px rgba(20,100,90,.16)",
      softMix: "rgba(15,59,58,.06)",
    },
    dark: {
      bg: "linear-gradient(140deg,#06241f 0%, #0b2538 50%, #1a1535 100%)",
      ink: "#d4fbed", inkSoft: "#88bdb1",
      card: "#0c2a25", cardEdge: "rgba(255,255,255,.08)",
      shadow: "0 1px 0 rgba(255,255,255,.06) inset, 0 18px 40px -12px rgba(0,0,0,.6), 0 6px 14px -8px rgba(0,0,0,.4)",
      softMix: "rgba(255,255,255,.06)",
    },
  },
  sunset: {
    name: "Sunset",
    accent: "#f43f7e", accent2: "#fb923c", accent3: "#a855f7",
    light: {
      bg: "linear-gradient(140deg,#ffd1b3 0%, #ff8fb1 45%, #c084fc 100%)",
      ink: "#2d0e2e", inkSoft: "#6e3f6e",
      card: "#fffafa", cardEdge: "rgba(255,255,255,.9)",
      shadow: "0 1px 0 rgba(255,255,255,.9) inset, 0 20px 44px -12px rgba(120,30,90,.30), 0 6px 14px -8px rgba(120,30,90,.20)",
      softMix: "rgba(45,14,46,.06)",
    },
    dark: {
      bg: "linear-gradient(140deg,#2c0a1a 0%, #1f0a2c 50%, #0c1430 100%)",
      ink: "#ffd9e5", inkSoft: "#c08aa6",
      card: "#2a1024", cardEdge: "rgba(255,255,255,.08)",
      shadow: "0 1px 0 rgba(255,255,255,.06) inset, 0 18px 40px -12px rgba(0,0,0,.6), 0 6px 14px -8px rgba(0,0,0,.4)",
      softMix: "rgba(255,255,255,.06)",
    },
  },
};

// Live stream state — populated from /status polling
const INITIAL = (window.__STUDYFM_INITIAL__) || {
  track_number: 1, track_title: "", block_name: "",
  block_titles: [], listeners: 0, uptime_seconds: 0, block_count: 0
};

const VISUALIZERS = [
  { id: "bars",  label: "Bars" },
  { id: "wave",  label: "Wave" },
  { id: "pulse", label: "Pulse" },
  { id: "bloom", label: "Bloom" },
];

// ── theming ──────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");
const fmt = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;

function applyTheme({ theme, dark, random }) {
  const r = document.documentElement.style;
  let m, accent, accent2, accent3;
  if (random) {
    accent = random.accent; accent2 = random.accent2; accent3 = random.accent3;
    m = dark ? random.dark : random.light;
  } else {
    const pal = THEMES[theme] || THEMES.bubblegum;
    accent = pal.accent; accent2 = pal.accent2; accent3 = pal.accent3;
    m = dark ? pal.dark : pal.light;
  }
  r.setProperty("--bg", m.bg);
  r.setProperty("--ink", m.ink);
  r.setProperty("--ink-soft", m.inkSoft);
  r.setProperty("--card", m.card);
  r.setProperty("--card-edge", m.cardEdge);
  r.setProperty("--shadow", m.shadow);
  r.setProperty("--soft", m.softMix);
  r.setProperty("--accent", accent);
  r.setProperty("--accent-2", accent2);
  r.setProperty("--accent-3", accent3);
  document.documentElement.dataset.mode = dark ? "dark" : "light";
}

function randomPalette() {
  // fully independent hues across the entire color spectrum
  const rand = () => Math.floor(Math.random() * 360);
  const h1 = rand(), h2 = rand(), h3 = rand();
  // also vary chroma & lightness a bit per accent for real variety
  const c = () => (0.14 + Math.random() * 0.10).toFixed(2);
  const l = () => (0.62 + Math.random() * 0.18).toFixed(2);
  const bgHue = rand(); // independent bg tint
  return {
    accent:  `oklch(${l()} ${c()} ${h1})`,
    accent2: `oklch(${l()} ${c()} ${h2})`,
    accent3: `oklch(${l()} ${c()} ${h3})`,
    light: {
      bg: `linear-gradient(140deg, oklch(0.95 0.05 ${h1}) 0%, oklch(0.94 0.06 ${bgHue}) 50%, oklch(0.95 0.05 ${h3}) 100%)`,
      ink: `oklch(0.22 0.06 ${h1})`,
      inkSoft: `oklch(0.50 0.06 ${h1})`,
      card: `oklch(0.99 0.008 ${bgHue})`,
      cardEdge: "rgba(255,255,255,.9)",
      shadow: `0 1px 0 rgba(255,255,255,.9) inset, 0 18px 40px -12px oklch(0.30 0.10 ${h1} / .25), 0 6px 14px -8px oklch(0.30 0.10 ${h1} / .18)`,
      softMix: `oklch(0.22 0.06 ${h1} / .07)`,
    },
    dark: {
      bg: `linear-gradient(140deg, oklch(0.18 0.06 ${h1}) 0%, oklch(0.16 0.07 ${bgHue}) 50%, oklch(0.18 0.06 ${h3}) 100%)`,
      ink: `oklch(0.95 0.04 ${h1})`,
      inkSoft: `oklch(0.68 0.05 ${h1})`,
      card: `oklch(0.22 0.04 ${bgHue})`,
      cardEdge: "rgba(255,255,255,.08)",
      shadow: "0 1px 0 rgba(255,255,255,.06) inset, 0 18px 40px -12px rgba(0,0,0,.6), 0 6px 14px -8px rgba(0,0,0,.4)",
      softMix: "rgba(255,255,255,.06)",
    },
  };
}

// ── icons ────────────────────────────────────────────────────────────
const I = {
  play:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72c0 .79.87 1.27 1.54.83l10.5-6.86a1 1 0 0 0 0-1.66L9.54 4.31C8.87 3.87 8 4.35 8 5.14z"/></svg>,
  pause: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.5" height="14" rx="1.5"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.5"/></svg>,
  prev:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5.14v13.72c0 .79-.87 1.27-1.54.83l-10.5-6.86a1 1 0 0 1 0-1.66l10.5-6.86c.67-.44 1.54.04 1.54.83z"/></svg>,
  next:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5.14v13.72c0 .79.87 1.27 1.54.83l10.5-6.86a1 1 0 0 0 0-1.66L5.54 4.31C4.87 3.87 4 4.35 4 5.14z"/></svg>,
  gear:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  sun:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>,
  moon:  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
};

// ── visualizers ──────────────────────────────────────────────────────
function Visualizer({ kind, playing, letter }) {
  if (!playing) {
    return (
      <div className="art-wrap">
        <div className="bubble-art">{letter}</div>
      </div>
    );
  }
  if (kind === "bars") {
    return (
      <div className="art-wrap">
        <div className="viz viz-bars">
          {Array.from({length: 9}).map((_, i) => (
            <i key={i} style={{ animationDelay: `${i * 90}ms` }}/>
          ))}
        </div>
      </div>
    );
  }
  if (kind === "wave") {
    return (
      <div className="art-wrap">
        <svg className="viz viz-wave" viewBox="0 0 200 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wg" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--accent)"/>
              <stop offset="50%" stopColor="var(--accent-2)"/>
              <stop offset="100%" stopColor="var(--accent-3)"/>
            </linearGradient>
          </defs>
          <path d="M0,40 Q25,10 50,40 T100,40 T150,40 T200,40 T250,40 T300,40" fill="none" stroke="url(#wg)" strokeWidth="6" strokeLinecap="round">
            <animate attributeName="d" dur="2.2s" repeatCount="indefinite"
              values="M0,40 Q25,10 50,40 T100,40 T150,40 T200,40 T250,40 T300,40;
                      M0,40 Q25,70 50,40 T100,40 T150,40 T200,40 T250,40 T300,40;
                      M0,40 Q25,10 50,40 T100,40 T150,40 T200,40 T250,40 T300,40"/>
          </path>
          <path d="M0,40 Q25,55 50,40 T100,40 T150,40 T200,40" fill="none" stroke="var(--accent-2)" strokeWidth="3" strokeLinecap="round" opacity=".55">
            <animate attributeName="d" dur="3s" repeatCount="indefinite"
              values="M0,40 Q25,55 50,40 T100,40 T150,40 T200,40;
                      M0,40 Q25,20 50,40 T100,40 T150,40 T200,40;
                      M0,40 Q25,55 50,40 T100,40 T150,40 T200,40"/>
          </path>
        </svg>
      </div>
    );
  }
  if (kind === "pulse") {
    return (
      <div className="art-wrap">
        <div className="viz viz-pulse">
          <span className="r r1"/>
          <span className="r r2"/>
          <span className="r r3"/>
          <span className="core">{letter}</span>
        </div>
      </div>
    );
  }
  // bloom — energetic bubble
  return (
    <div className="art-wrap">
      <div className="bubble-art bloom">{letter}</div>
    </div>
  );
}

// ── Music Player (real audio streaming) ──────────────────────────────
function Player({ visualizer, openGear, gearOpen, t, setTweak }) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [trackInfo, setTrackInfo] = useState(INITIAL);
  const [liveTime, setLiveTime] = useState(INITIAL.uptime_seconds || 0);
  const [connecting, setConnecting] = useState(false);
  const audioRef = useRef(null);

  // Setup audio element on mount
  useEffect(() => {
    const a = document.createElement("audio");
    a.crossOrigin = "anonymous";
    a.preload = "none";
    a.src = "/stream";
    a.volume = volume;
    audioRef.current = a;
    return () => { a.pause(); a.removeAttribute("src"); };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Poll /status every 5s
  useEffect(() => {
    const poll = () => {
      fetch("/status").then(r => r.json()).then(s => {
        setTrackInfo(prev => (
          prev.track_title !== s.track_title ? s : { ...prev, ...s, track_title: prev.track_title }
        ));
        setLiveTime(s.uptime_seconds);
      }).catch(() => {});
    };
    poll(); // immediate on mount
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      setConnecting(false);
    } else {
      setConnecting(true);
      a.load();
      a.play().then(() => {
        setPlaying(true);
        setConnecting(false);
      }).catch(() => {
        setPlaying(false);
        setConnecting(false);
      });
    }
  };

  const letter = trackInfo.block_name ? trackInfo.block_name.charAt(0).toUpperCase() : "S";
  const isActive = playing || connecting;
  const titleText = connecting ? "Connecting..." : trackInfo.track_title || "Study.FM";

  // Volume icon
  const VolIcon = () => {
    if (muted || volume === 0) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;
    if (volume < 0.5) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
  };

  return (
    <div className="player">
      <button className="gear" onClick={openGear} aria-label="Settings" aria-expanded={gearOpen}>
        {I.gear}
      </button>

      {gearOpen && <GearPanel t={t} setTweak={setTweak} onClose={openGear}/>}

      <Visualizer kind={visualizer} playing={isActive} letter={letter}/>

      <div className="track-num">
        STUDY <b>{String(trackInfo.track_number || 1).padStart(2, "0")}</b> · {trackInfo.block_name || "Live"}
      </div>
      <div className="track-title display">{titleText}</div>

      {/* Transport */}
      <div className="transport">
        <button className="ctl play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {connecting ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{animation: "spin 1s linear infinite"}}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M21 3v6h-6"/>
            </svg>
          ) : playing ? I.pause : I.play}
        </button>
      </div>

      {/* Volume row */}
      <div className="volrow">
        <button className="ctl volbtn" onClick={() => setMuted(m => !m)} aria-label={muted ? "Unmute" : "Mute"}>
          <VolIcon/>
        </button>
        <input type="range" className="vol-slider" min="0" max="1" step="0.02" value={muted ? 0 : volume}
          onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
          style={{"--volpct": (muted ? 0 : volume) * 100 + "%"}}/>
      </div>
    </div>
  );
}

// ── Gear popover (color / dark-light / randomize) ───────────────────
function GearPanel({ t, setTweak, onClose }) {
  return (
    <div className="gear-pop" role="dialog" aria-label="Appearance">
      <div className="gear-pop-hd">
        <span>Appearance</span>
        <button className="gear-x" onClick={onClose} aria-label="Close">{I.close}</button>
      </div>

      <div className="gear-row-label">Palette</div>
      <div className="swatch-row">
        {Object.entries(THEMES).map(([id, pal]) => (
          <button key={id}
            className={`swatch ${t.theme === id && !t.random ? "on" : ""}`}
            onClick={() => { setTweak({ theme: id, random: null }); }}
            aria-label={pal.name} title={pal.name}>
            <span style={{background: pal.accent}}/>
            <span style={{background: pal.accent2}}/>
            <span style={{background: pal.accent3}}/>
          </button>
        ))}
      </div>

      <div className="gear-row-label">Mode</div>
      <div className="mode-toggle">
        <button className={!t.dark ? "on" : ""} onClick={() => setTweak("dark", false)}>
          {I.sun} Light
        </button>
        <button className={t.dark ? "on" : ""} onClick={() => setTweak("dark", true)}>
          {I.moon} Dark
        </button>
      </div>

      <button className="randomize" onClick={() => setTweak("random", randomPalette())}>
        {I.refresh} Randomize colors
      </button>
    </div>
  );
}

// ── Pomodoro ────────────────────────────────────────────────────────
const POM_MODES = [
  { id: "focus", label: "Focus" },
  { id: "short", label: "Short" },
  { id: "long",  label: "Long" },
];

const TASK_KEY = "studyfm-tasks";

function Pomodoro({ pom, setTweak }) {
  const [hidden, setHidden] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mode, setMode] = useState("focus");
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [remaining, setRemaining] = useState(pom.focus * 60);
  const [blink, setBlink] = useState(false);

  // tasks (persisted)
  const [tasks, setTasks] = useState([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASK_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(TASK_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  // when durations or mode change, reset clock
  useEffect(() => {
    setRemaining(pom[mode] * 60);
    setRunning(false);
  }, [mode, pom.focus, pom.short, pom.long]);

  // tick
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          if (mode === "focus") {
            setRound((n) => n + 1);
            const next = round % pom.longEvery === 0 ? "long" : "short";
            setTimeout(() => setMode(next), 250);
          } else {
            setTimeout(() => setMode("focus"), 250);
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, round, pom.longEvery]);

  // colon blink
  useEffect(() => {
    if (!running) { setBlink(false); return; }
    const id = setInterval(() => setBlink((b) => !b), 500);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const reset = () => { setRemaining(pom[mode] * 60); setRunning(false); };

  const addTask = () => {
    const text = draft.trim();
    if (!text) { setAdding(false); setDraft(""); return; }
    setTasks((ts) => [...ts, { id: Date.now() + Math.random(), text, done: false }]);
    setDraft("");
    // keep input open for fast entry
  };

  const toggleTask = (id) =>
    setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id) =>
    setTasks((ts) => ts.filter((t) => t.id !== id));

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const doneCount = tasks.filter((t) => t.done).length;

  if (hidden) {
    return (
      <button className="pom-show" onClick={() => setHidden(false)}>
        <span className="pulse"/>POMODORO
      </button>
    );
  }

  return (
    <div className="pom">
      <div className="pom-top">
        <span className="pom-eyebrow">POMODORO</span>
        <div className="pom-top-actions">
          <button className="pom-icon" onClick={() => setSettingsOpen((o) => !o)}
                  aria-label="Pomodoro settings" aria-expanded={settingsOpen}>
            {I.gear}
          </button>
          <button className="pom-hide" onClick={() => setHidden(true)} aria-label="Hide pomodoro">
            Hide
          </button>
        </div>
      </div>

      {settingsOpen && (
        <PomSettings pom={pom} setTweak={setTweak} onClose={() => setSettingsOpen(false)}/>
      )}

      <div className="pom-tabs">
        {POM_MODES.map((m) => (
          <button key={m.id}
            className={m.id === mode ? "on" : ""}
            onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="pom-time">
        {pad(mins)}<span className={`colon ${blink ? "blink" : ""}`}>:</span>{pad(secs)}
      </div>

      <div className="pom-ring" title={`Long break every ${pom.longEvery}`}>
        {Array.from({length: pom.longEvery}).map((_, i) => (
          <i key={i} className={i < (round - 1) % pom.longEvery ? "on" : ""}/>
        ))}
      </div>

      <div className="pom-actions">
        <button className="pom-btn" onClick={() => setRunning((r) => !r)}>
          {running ? "Pause" : remaining < pom[mode] * 60 ? "Resume" : "Start"}
        </button>
        <button className="pom-btn ghost" onClick={reset} aria-label="Reset">↺</button>
      </div>

      <div className="pom-divider"/>

      <div className="task-head">
        <span>Tasks</span>
        <span className="task-count">{doneCount}/{tasks.length || 0}</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 && !adding && (
          <div className="task-empty">No tasks yet — add one to get focused.</div>
        )}
        {tasks.map((task) => (
          <div key={task.id} className={`task ${task.done ? "done" : ""}`}>
            <button className="task-check" onClick={() => toggleTask(task.id)}
                    aria-label={task.done ? "Uncheck" : "Check"} aria-pressed={task.done}>
              {task.done && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
            <span className="task-text">{task.text}</span>
            <button className="task-x" onClick={() => removeTask(task.id)} aria-label="Delete task">
              {I.close}
            </button>
          </div>
        ))}

        {adding && (
          <div className="task adding">
            <span className="task-check empty"/>
            <input ref={inputRef} className="task-input" value={draft}
              placeholder="What are you working on?"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
                if (e.key === "Escape") { setAdding(false); setDraft(""); }
              }}
              onBlur={() => { if (!draft.trim()) setAdding(false); }}/>
          </div>
        )}
      </div>

      <button className="task-add" onClick={() => {
        if (adding) addTask();
        else setAdding(true);
      }}>
        <span>＋</span> {adding ? "Save task" : "Add task"}
      </button>

      <div className="pom-meta">
        <span>Round</span>
        <b>#{pad(round)}</b>
      </div>
    </div>
  );
}

function PomSettings({ pom, setTweak, onClose }) {
  return (
    <div className="pom-settings" role="dialog" aria-label="Pomodoro settings">
      <div className="pom-settings-hd">
        <span>Timer settings</span>
        <button className="gear-x" onClick={onClose} aria-label="Close">{I.close}</button>
      </div>

      <PomSlider label="Focus" value={pom.focus} min={5} max={90} step={5}
                 onChange={(v) => setTweak("focusMins", v)}/>
      <PomSlider label="Short break" value={pom.short} min={1} max={20} step={1}
                 onChange={(v) => setTweak("shortMins", v)}/>
      <PomSlider label="Long break" value={pom.long} min={5} max={45} step={5}
                 onChange={(v) => setTweak("longMins", v)}/>

      <div className="pom-settings-divider"/>

      <div className="pom-cycle-label">Long break every</div>
      <div className="pom-cycle">
        {[2,3,4,5,6].map((n) => (
          <button key={n}
            className={pom.longEvery === n ? "on" : ""}
            onClick={() => setTweak("longEvery", n)}>
            {n}
          </button>
        ))}
        <span className="pom-cycle-suffix">rounds</span>
      </div>
    </div>
  );
}

function PomSlider({ label, value, min, max, step, onChange }) {
  return (
    <div className="pom-slider-row">
      <div className="pom-slider-head">
        <span>{label}</span>
        <b>{value}<small>m</small></b>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="pom-range"/>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(window.__STUDYFM_DEFAULTS);
  const [gearOpen, setGearOpen] = useState(false);

  useEffect(() => { applyTheme(t); }, [t.theme, t.dark, t.random]);

  useEffect(() => {
    document.querySelectorAll(".blob").forEach((el) => {
      el.style.display = t.blobs ? "" : "none";
    });
  }, [t.blobs]);

  const pom = useMemo(() => ({
    focus: t.focusMins, short: t.shortMins, long: t.longMins,
    longEvery: t.longEvery || 4,
  }), [t.focusMins, t.shortMins, t.longMins, t.longEvery]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.matches("input,textarea")) return;
      if (e.code === "Space") {
        e.preventDefault();
        document.querySelector(".ctl.play")?.click();
      } else if (e.code === "ArrowRight") {
        document.querySelectorAll(".transport .ctl")[2]?.click();
      } else if (e.code === "ArrowLeft") {
        document.querySelectorAll(".transport .ctl")[0]?.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Player
        visualizer={t.visualizer}
        openGear={() => setGearOpen((g) => !g)}
        gearOpen={gearOpen}
        t={t} setTweak={setTweak}
      />
      <Pomodoro pom={pom} setTweak={setTweak}/>

      <TweaksPanel>
        <TweakSection label="Visualizer"/>
        <TweakRadio label="Style" value={t.visualizer}
          options={VISUALIZERS.map((v) => ({value: v.id, label: v.label}))}
          onChange={(v) => setTweak("visualizer", v)}/>

        <TweakSection label="Background"/>
        <TweakToggle label="Drifting blobs" value={t.blobs}
          onChange={(v) => setTweak("blobs", v)}/>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
