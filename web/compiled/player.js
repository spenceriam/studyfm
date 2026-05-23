// player.jsx — codejams.fm player wired to live Code.FM stream
// SpaceX-activation shell with real audio + track info from /status

function Icon({
  name,
  size = 20
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  };
  switch (name) {
    case 'play':
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("path", {
        d: "M8 5.5v13l10.5-6.5z",
        fill: "currentColor",
        stroke: "none"
      }));
    case 'pause':
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("rect", {
        x: "7.5",
        y: "5.5",
        width: "3",
        height: "13",
        rx: "0.5",
        fill: "currentColor",
        stroke: "none"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "13.5",
        y: "5.5",
        width: "3",
        height: "13",
        rx: "0.5",
        fill: "currentColor",
        stroke: "none"
      }));
    case 'vol':
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("path", {
        d: "M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4z",
        fill: "currentColor",
        stroke: "none"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M15.5 8.5a5 5 0 0 1 0 7"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M18 6a8 8 0 0 1 0 12"
      }));
    case 'low':
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("path", {
        d: "M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4z",
        fill: "currentColor",
        stroke: "none"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M15.5 8.5a5 5 0 0 1 0 7"
      }));
    case 'mute':
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("path", {
        d: "M4 9.5v5h3.5l4.5 3.5V6L7.5 9.5H4z",
        fill: "currentColor",
        stroke: "none"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "15",
        y1: "9",
        x2: "20",
        y2: "14"
      }), /*#__PURE__*/React.createElement("line", {
        x1: "20",
        y1: "9",
        x2: "15",
        y2: "14"
      }));
    default:
      return null;
  }
}

// ── Visualizer — RAF-driven heights, active when playing ──────────────────
function Visualizer({
  active,
  side = 'left',
  bars = 14
}) {
  const ref = React.useRef(null);
  const seedsRef = React.useRef(Array.from({
    length: bars
  }, (_, i) => ({
    phase: Math.random() * Math.PI * 2,
    speed: 1.3 + Math.random() * 1.4,
    amp: 0.7 + Math.random() * 0.4,
    pos: i / (bars - 1)
  })));
  React.useEffect(() => {
    let raf;
    const tick = t => {
      const el = ref.current;
      if (!el) return;
      const seeds = seedsRef.current;
      const childs = el.children;
      const tt = t / 1000;
      for (let i = 0; i < bars; i++) {
        const s = seeds[i];
        const taper = side === 'left' ? s.pos : 1 - s.pos;
        const bell = 0.35 + 0.65 * taper;
        let h;
        if (active) {
          const w1 = Math.sin(tt * s.speed + s.phase);
          const w2 = Math.sin(tt * s.speed * 1.7 + s.phase * 1.3);
          const v = (w1 * 0.6 + w2 * 0.4 + 1) / 2;
          h = 3 + (2 + bell * 36) * (v * s.amp + 0.2);
        } else {
          h = 3;
        }
        childs[i].style.height = h + 'px';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, bars, side]);
  return /*#__PURE__*/React.createElement("div", {
    className: 'cj-viz cj-viz--' + side,
    ref: ref,
    "aria-hidden": "true",
    "data-state": active ? 'live' : 'idle'
  }, Array.from({
    length: bars
  }).map((_, i) => {
    const order = side === 'left' ? i : bars - 1 - i;
    const delay = order * 22;
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        '--d': delay + 'ms'
      }
    });
  }));
}

// ── Player ─────────────────────────────────────────────────────────────────
const STATUS_TEXT = {
  idle: 'STANDBY',
  loading: 'ACQUIRING SIGNAL',
  live: 'RADIO STATION NOMINAL'
};
function Player() {
  const [state, setState] = React.useState('idle'); // idle | loading | live
  const [statusText, setStatusText] = React.useState(STATUS_TEXT.idle);
  const [trackTitle, setTrackTitle] = React.useState('');
  const [trackNumber, setTrackNumber] = React.useState(1);
  const [blockName, setBlockName] = React.useState('');
  const [vol, setVol] = React.useState(0.7);
  const [muted, setMuted] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const audioRef = React.useRef(null);
  const elapsedRef = React.useRef(null);

  // Create audio element once
  React.useEffect(() => {
    const audio = document.getElementById('streamAudio');
    if (audio) {
      audio.volume = vol;
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Sync volume
  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : vol;
  }, [vol, muted]);

  // Poll /status continuously — independent of play state
  React.useEffect(() => {
    const poll = () => {
      fetch('/status').then(r => r.json()).then(s => {
        setTrackTitle(s.track_title || '');
        setTrackNumber(s.track_number || 1);
        setBlockName(s.block_name || '');
      }).catch(() => {});
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  // Elapsed counter while live
  React.useEffect(() => {
    if (state !== 'live') return;
    const start = Date.now();
    elapsedRef.current = start;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [state]);
  const onPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state === 'idle') {
      setState('loading');
      setStatusText(STATUS_TEXT.loading);
      audio.load();
      audio.play().then(() => {
        setState('live');
        setStatusText(STATUS_TEXT.live);
      }).catch(err => {
        console.warn('Stream play failed:', err);
        setState('idle');
        setStatusText(STATUS_TEXT.idle);
      });
    } else {
      audio.pause();
      setState('idle');
      setStatusText(STATUS_TEXT.idle);
      setElapsed(0);
    }
  };
  const ledState = state === 'live' ? 'on' : state === 'loading' ? 'buffering' : 'off';
  const playState = state === 'live' ? 'playing' : state === 'loading' ? 'connecting' : 'paused';
  const volIcon = muted || vol === 0 ? 'mute' : vol < 0.4 ? 'low' : 'vol';
  const pct = muted ? 0 : Math.round(vol * 100);

  // T+ formatting
  const pad = n => String(n).padStart(2, '0');
  const tplus = `T+ ${pad(Math.floor(elapsed / 3600))}:${pad(Math.floor(elapsed % 3600 / 60))}:${pad(elapsed % 60)}`;
  return /*#__PURE__*/React.createElement("div", {
    className: "cj-player",
    "data-state": state
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-wordmark"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cj-wordmark__name"
  }, "codejams"), /*#__PURE__*/React.createElement("span", {
    className: "cj-wordmark__dot"
  }, "."), /*#__PURE__*/React.createElement("span", {
    className: "cj-wordmark__tld"
  }, "fm")), /*#__PURE__*/React.createElement("div", {
    className: "cj-byline"
  }, "created by", ' ', /*#__PURE__*/React.createElement("a", {
    className: "cj-byline__link",
    href: "https://x.com/spencer_i_am",
    target: "_blank",
    rel: "noopener noreferrer"
  }, "Spencer Francisco")), /*#__PURE__*/React.createElement("div", {
    className: "cj-statusbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cj-status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "cj-led",
    "data-state": ledState
  }), /*#__PURE__*/React.createElement("span", {
    className: "cj-status__text",
    "data-state": ledState
  }, statusText)), /*#__PURE__*/React.createElement("div", {
    className: "cj-telemetry",
    "data-active": "1"
  }, state !== 'idle' && /*#__PURE__*/React.createElement("span", {
    className: "cj-telemetry__time"
  }, tplus), trackTitle && /*#__PURE__*/React.createElement(React.Fragment, null, state !== 'idle' && /*#__PURE__*/React.createElement("span", {
    className: "cj-telemetry__pipe",
    "aria-hidden": "true"
  }, "|"), /*#__PURE__*/React.createElement("span", {
    className: "cj-telemetry__tracknum"
  }, String(trackNumber).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
    className: "cj-telemetry__pipe",
    "aria-hidden": "true"
  }, "|"), /*#__PURE__*/React.createElement("span", {
    className: "cj-telemetry__trackname"
  }, trackTitle)))), /*#__PURE__*/React.createElement("div", {
    className: "cj-playrow",
    "data-state": state
  }, /*#__PURE__*/React.createElement(Visualizer, {
    active: state === 'live' && !muted,
    side: "left"
  }), /*#__PURE__*/React.createElement("button", {
    className: "cj-play",
    onClick: onPlay,
    "aria-label": state === 'live' || state === 'loading' ? 'Pause' : 'Play',
    "data-state": playState
  }, /*#__PURE__*/React.createElement("svg", {
    className: "cj-play__svg",
    viewBox: "0 0 100 100",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("g", {
    transform: "rotate(-90 50 50)"
  }, /*#__PURE__*/React.createElement("circle", {
    className: "cj-play__base",
    cx: "50",
    cy: "50",
    r: "46"
  }), /*#__PURE__*/React.createElement("circle", {
    className: "cj-play__draw",
    cx: "50",
    cy: "50",
    r: "46"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "cj-play__icon cj-play__icon--play"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "play",
    size: 26
  })), /*#__PURE__*/React.createElement("span", {
    className: "cj-play__icon cj-play__icon--pause"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "pause",
    size: 26
  }))), /*#__PURE__*/React.createElement(Visualizer, {
    active: state === 'live' && !muted,
    side: "right"
  })), /*#__PURE__*/React.createElement("div", {
    className: "cj-volrow"
  }, /*#__PURE__*/React.createElement("button", {
    className: "cj-iconbtn",
    onClick: () => setMuted(m => !m),
    "aria-label": muted ? 'Unmute' : 'Mute',
    "data-muted": muted ? '1' : '0'
  }, /*#__PURE__*/React.createElement(Icon, {
    name: volIcon,
    size: 18
  })), /*#__PURE__*/React.createElement("input", {
    className: "cj-vol",
    type: "range",
    min: "0",
    max: "100",
    step: "1",
    value: pct,
    onChange: e => {
      setVol(Number(e.target.value) / 100);
      setMuted(false);
    },
    style: {
      '--pct': `${pct}%`
    },
    "aria-label": "Volume"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cj-vol__val"
  }, String(pct).padStart(3, '0'))));
}
Object.assign(window, {
  Player
});