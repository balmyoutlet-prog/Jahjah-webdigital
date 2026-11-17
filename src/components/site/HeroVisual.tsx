import { projects } from "@/lib/site-data";

/**
 * Real delivered work, shown as a layered browser-window composition.
 * No abstract shapes, no stock imagery — these are the four live sites
 * already linked from the footer and /work.
 */
export function HeroVisual() {
  const [back, front] = projects; // Wholesome Craft (back), Sweet Spot Lebanon (front)

  return (
    <div
      className="relative mx-auto aspect-[4/5] w-full max-w-md sm:aspect-[5/4] sm:max-w-xl lg:mx-0"
      aria-hidden="true"
    >
      <div className="browser-frame absolute left-0 top-0 w-[78%] -rotate-3 opacity-95 sm:w-[68%]">
        <div className="browser-frame-bar">
          <span className="browser-frame-dot" />
          <span className="browser-frame-dot" />
          <span className="browser-frame-dot" />
        </div>
        <div className="aspect-[16/11] overflow-hidden">
          <img
            src={back!.image}
            alt=""
            loading="eager"
            decoding="async"
            width={900}
            height={620}
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>

      <div className="browser-frame absolute bottom-0 right-0 w-[68%] rotate-2 sm:w-[58%]">
        <div className="browser-frame-bar">
          <span className="browser-frame-dot" />
          <span className="browser-frame-dot" />
          <span className="browser-frame-dot" />
        </div>
        <div className="aspect-[16/11] overflow-hidden">
          <img
            src={front!.image}
            alt=""
            loading="eager"
            decoding="async"
            width={900}
            height={620}
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}
