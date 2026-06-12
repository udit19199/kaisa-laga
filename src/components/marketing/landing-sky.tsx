export function LandingSky() {
  return (
    <div className="landing-sky-canvas pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="hero-sky-mesh" />
      <div className="landing-sky-glow absolute inset-0" />
      <div className="landing-sky-bloom landing-sky-bloom--upper" />
      <div className="landing-sky-bloom landing-sky-bloom--mid" />
      <div className="landing-sky-bloom landing-sky-bloom--lower" />
    </div>
  );
}
