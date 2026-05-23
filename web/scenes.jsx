// scenes.jsx — minimal space backdrops for codejams.fm
// Clean SpaceX-feel: deep void + restrained star field + subtle nebula bloom.
// Heavy elements (planets, grids, chrome) removed for v2.

function useStars(count, seed) {
  return React.useMemo(() => {
    let s = seed;
    const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      r: rand() * 1.2 + 0.15,
      o: rand() * 0.6 + 0.25,
      tw: rand() * 4 + 2,
      td: rand() * 5,
    }));
  }, [count, seed]);
}

function StarField({ count = 220, seed = 42 }) {
  const stars = useStars(count, seed);
  return (
    <svg className="cj-stars" viewBox="0 0 100 100" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.12} fill="#fff" opacity={s.o}>
          <animate attributeName="opacity"
                   values={`${s.o};${s.o * 0.25};${s.o}`}
                   dur={`${s.tw}s`} begin={`${s.td}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ── 01 Void — pure deep space, minimal ─────────────────────────────────────
function SceneVoid() {
  return (
    <div className="cj-scene cj-scene--void">
      <div className="cj-bg cj-bg--void" />
      <StarField count={240} seed={11} />
    </div>
  );
}

// ── 02 Nebula — single soft bloom, no busy clouds ──────────────────────────
function SceneNebula() {
  return (
    <div className="cj-scene cj-scene--nebula">
      <div className="cj-bg cj-bg--nebula" />
      <StarField count={300} seed={23} />
    </div>
  );
}

// ── 03 Orbit — distant earthlimb at bottom, no chrome ──────────────────────
function SceneOrbit() {
  return (
    <div className="cj-scene cj-scene--orbit">
      <div className="cj-bg cj-bg--void" />
      <StarField count={200} seed={7} />
      <svg className="cj-orbit-arc" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="atmoV2" cx="50%" cy="100%" r="62%">
            <stop offset="92%" stopColor="oklch(0.78 0.14 235)" stopOpacity="0" />
            <stop offset="96%" stopColor="oklch(0.85 0.16 220)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="oklch(0.85 0.16 220)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="800" cy="1920" rx="1500" ry="1180" fill="url(#atmoV2)" />
        <ellipse cx="800" cy="1925" rx="1480" ry="1170" fill="oklch(0.06 0.03 252)" />
      </svg>
    </div>
  );
}

// ── 04 Drift — slow scanline + dot grid, neofuturistic terminal ────────────
function SceneDrift() {
  return (
    <div className="cj-scene cj-scene--drift">
      <div className="cj-bg cj-bg--drift" />
      <div className="cj-dotgrid" />
      <StarField count={120} seed={5} />
    </div>
  );
}

// ── 05 Custom — drop your own AI-gen render ────────────────────────────────
function SceneCustom() {
  return (
    <div className="cj-scene cj-scene--custom">
      <div className="cj-bg cj-bg--void" />
      <image-slot
        id="cj-bg-custom"
        shape="rect"
        placeholder="Drop your AI-generated scene here  ·  (rendered fullscreen)"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}

const SCENES = {
  void:    { name: 'Void',    Component: SceneVoid },
  nebula:  { name: 'Nebula',  Component: SceneNebula },
  orbit:   { name: 'Orbit',   Component: SceneOrbit },
  drift:   { name: 'Drift',   Component: SceneDrift },
  custom:  { name: 'Custom',  Component: SceneCustom },
};

function Scene({ id }) {
  const def = SCENES[id] || SCENES.void;
  const C = def.Component;
  return <div className="cj-scene-wrap"><C /></div>;
}

Object.assign(window, { Scene, SCENES });
