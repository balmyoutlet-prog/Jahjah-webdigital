import { BRAND } from "@/lib/site";

/** The original DOS logo. `full` adds the "Architecture & Interior Studio" line. */
export default function Logo({ href = "#top", full = false, height }: { href?: string; full?: boolean; height?: number }) {
  const h = height ?? (full ? 64 : 30);
  const src = full ? BRAND.logoFull : BRAND.logoMark;
  const ratio = full ? 656 / 323 : 656 / 241;
  return (
    <a className={`logo${full ? " logo-full" : ""}`} href={href} aria-label={`${BRAND.name} — ${BRAND.tagline}`} dir="ltr">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${BRAND.name}`} width={Math.round(h * ratio)} height={h} style={{ height: h, width: "auto" }} />
    </a>
  );
}
