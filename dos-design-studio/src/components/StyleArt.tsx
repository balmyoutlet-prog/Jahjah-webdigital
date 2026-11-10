import type { Motif } from "@/content/styles";

/**
 * A composed "material study" for a design language: an architectural elevation motif
 * rendered in the style's palette with soft light. Clearly inspiration, never a project photo.
 */
export default function StyleArt({ palette, motif, id }: { palette: [string, string, string, string]; motif: Motif; id: string }) {
  const [base, mid, accent, ink] = palette;
  const g = `g-${id}`;
  const s = `s-${id}`;
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="presentation">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={base} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <radialGradient id={s} cx="0.25" cy="0.15" r="0.9">
          <stop offset="0" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${g})`} />
      <rect y="380" width="400" height="120" fill={mid} />
      <rect y="380" width="400" height="1" fill={ink} opacity="0.25" />
      <g fill="none" stroke={ink} strokeWidth="1" opacity="0.55">{motifShapes(motif, accent, ink)}</g>
      <rect width="400" height="500" fill={`url(#${s})`} />
      <rect x="292" y="300" width="70" height="80" fill={accent} opacity="0.9" />
      <rect x="250" y="340" width="34" height="40" fill={ink} opacity="0.85" />
    </svg>
  );
}

function motifShapes(m: Motif, accent: string, ink: string) {
  switch (m) {
    case "grid":
      return (
        <>
          {[0, 1, 2, 3].map((i) => <rect key={i} x={40 + i * 80} y="90" width="70" height="290" />)}
          <line x1="40" y1="200" x2="350" y2="200" />
        </>
      );
    case "arch":
      return [0, 1, 2].map((i) => (
        <path key={i} d={`M${50 + i * 110} 380 V180 a45 45 0 0 1 90 0 V380`} fill={i === 1 ? accent : "none"} fillOpacity="0.25" />
      ));
    case "curve":
      return (
        <>
          <path d="M30 380 C 80 120, 320 120, 370 380" />
          <path d="M80 380 C 120 200, 280 200, 320 380" fill={accent} fillOpacity="0.2" />
          <ellipse cx="200" cy="120" rx="120" ry="18" />
        </>
      );
    case "column":
      return (
        <>
          <rect x="30" y="80" width="340" height="18" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={50 + i * 66} y="98" width="22" height="282" />)}
          <path d="M30 80 L200 30 L370 80" />
        </>
      );
    case "lattice":
      return (
        <>
          <rect x="70" y="80" width="260" height="300" />
          {Array.from({ length: 6 }, (_, r) =>
            Array.from({ length: 5 }, (_, c) => (
              <path key={`${r}-${c}`} d={`M${96 + c * 52} ${100 + r * 48} l26 22 l-26 22 l-26 -22 z`} />
            )),
          )}
        </>
      );
    case "fin":
      return Array.from({ length: 14 }, (_, i) => <line key={i} x1={40 + i * 24} y1="70" x2={40 + i * 24} y2="380" strokeWidth={i % 3 === 0 ? 2 : 1} />);
    case "wave":
      return Array.from({ length: 7 }, (_, i) => <path key={i} d={`M20 ${130 + i * 34} C 120 ${100 + i * 34}, 260 ${170 + i * 34}, 380 ${130 + i * 34}`} />);
    case "slat":
      return (
        <>
          {Array.from({ length: 22 }, (_, i) => <line key={i} x1={60 + i * 13} y1="110" x2={60 + i * 13} y2="380" />)}
          <rect x="60" y="110" width="280" height="270" />
        </>
      );
    case "dome":
      return (
        <>
          <path d="M90 230 A110 110 0 0 1 310 230" fill={accent} fillOpacity="0.2" />
          <rect x="90" y="230" width="220" height="150" />
          {[0, 1, 2].map((i) => <path key={i} d={`M${125 + i * 60} 380 V300 a15 15 0 0 1 30 0 V380`} />)}
        </>
      );
    case "chevron":
      return (
        <>
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M60 ${110 + i * 34} L200 ${80 + i * 34} L340 ${110 + i * 34}`} />)}
          <rect x="60" y="80" width="280" height="300" stroke={ink} />
        </>
      );
  }
}
