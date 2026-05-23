var playerShared = (() => {
  function usePlayer(initial = {}) {
    const [playing, setPlaying] = React.useState(false);
    const [volume, setVolume] = React.useState(initial.volume ?? 0.7);
    const [t, setT] = React.useState(0);
    const duration = initial.duration ?? 247;
    const episode = initial.episode ?? 147;
    const track = initial.track ?? "Indigo Thursday";
    React.useEffect(() => {
      if (!playing) return;
      const id = setInterval(() => {
        setT((v) => (v + 0.25) % duration);
      }, 250);
      return () => clearInterval(id);
    }, [playing, duration]);
    return { playing, setPlaying, volume, setVolume, t, setT, duration, episode, track };
  }
  function formatTime(s) {
    s = Math.floor(s);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }
  function Waveform({ bars = 40, t, playing, color = "currentColor", height = 40, barWidth = 3, gap = 3, onSeek }) {
    const heights = React.useMemo(() => {
      return Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 12.9898) * 43758.5453;
        return 0.25 + (seed - Math.floor(seed)) * 0.75;
      });
    }, [bars]);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        onClick: onSeek,
        style: { display: "flex", alignItems: "center", gap, height, cursor: onSeek ? "pointer" : "default" }
      },
      heights.map((base, i) => {
        const wobble = playing ? 0.6 + 0.4 * Math.sin(t * 2 + i * 0.4) * Math.sin(t * 3.5 + i * 0.2) : 0.5;
        const h = Math.max(4, base * height * (0.5 + wobble * 0.6));
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: i,
            style: {
              width: barWidth,
              height: h,
              background: color,
              borderRadius: 1,
              transition: "height 0.18s ease-out"
            }
          }
        );
      })
    );
  }
  const PlayIcon = ({ size = 20, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 20 20", style, fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M5 3 L16 10 L5 17 Z" }));
  const PauseIcon = ({ size = 20, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 20 20", style, fill: "currentColor" }, /* @__PURE__ */ React.createElement("rect", { x: "4", y: "3", width: "4", height: "14", rx: "0.5" }), /* @__PURE__ */ React.createElement("rect", { x: "12", y: "3", width: "4", height: "14", rx: "0.5" }));
  const VolumeIcon = ({ size = 16, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", style, fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M0 5 L4 5 L8 1 L8 15 L4 11 L0 11 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M10 4 Q 13 8, 10 12", stroke: "currentColor", strokeWidth: "1.2", fill: "none", strokeLinecap: "round" }));
  const MuteIcon = ({ size = 16, style }) => /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 16 16", style, fill: "currentColor" }, /* @__PURE__ */ React.createElement("path", { d: "M0 5 L4 5 L8 1 L8 15 L4 11 L0 11 Z" }), /* @__PURE__ */ React.createElement("path", { d: "M10 5 L15 11 M15 5 L10 11", stroke: "currentColor", strokeWidth: "1.4", fill: "none", strokeLinecap: "round" }));
  function VolumeSlider({ value, onChange, trackColor = "#3a2818", fillColor = "#b85c3c", width = 90 }) {
    const ref = React.useRef(null);
    const set = (e) => {
      const r = ref.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      onChange(x);
    };
    const [drag, setDrag] = React.useState(false);
    React.useEffect(() => {
      if (!drag) return;
      const m = (e) => set(e);
      const u = () => setDrag(false);
      window.addEventListener("pointermove", m);
      window.addEventListener("pointerup", u);
      return () => {
        window.removeEventListener("pointermove", m);
        window.removeEventListener("pointerup", u);
      };
    }, [drag]);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        ref,
        onPointerDown: (e) => {
          setDrag(true);
          set(e);
        },
        style: { width, height: 14, display: "flex", alignItems: "center", cursor: "pointer", position: "relative", userSelect: "none" }
      },
      /* @__PURE__ */ React.createElement("div", { style: { position: "absolute", left: 0, right: 0, height: 3, background: trackColor, opacity: 0.25, borderRadius: 2 } }),
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        left: 0,
        width: `${value * 100}%`,
        height: 3,
        background: fillColor,
        borderRadius: 2,
        transition: drag ? "none" : "width 280ms cubic-bezier(.4,0,.2,1)"
      } }),
      /* @__PURE__ */ React.createElement("div", { style: {
        position: "absolute",
        left: `calc(${value * 100}% - 5px)`,
        width: 10,
        height: 10,
        background: fillColor,
        borderRadius: 5,
        boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        transition: drag ? "none" : "left 280ms cubic-bezier(.4,0,.2,1)"
      } })
    );
  }
  Object.assign(window, { usePlayer, formatTime, Waveform, PlayIcon, PauseIcon, VolumeIcon, MuteIcon, VolumeSlider });
})();
