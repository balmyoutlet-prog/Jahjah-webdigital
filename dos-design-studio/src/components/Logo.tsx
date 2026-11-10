import { BRAND } from "@/lib/site";

/**
 * Typographic placeholder for the DOS wordmark. As soon as the studio supplies the original
 * logo file, set BRAND.logoSrc and this renders the authentic mark instead.
 */
export default function Logo({ href = "#top" }: { href?: string }) {
  return (
    <a className="logo" href={href} aria-label={BRAND.name}>
      {BRAND.logoSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={BRAND.logoSrc} alt={BRAND.name} height={28} style={{ height: 28, width: "auto" }} />
      ) : (
        <>
          <span className="word">DOS</span>
          <span className="sub">Design Studio</span>
        </>
      )}
    </a>
  );
}
