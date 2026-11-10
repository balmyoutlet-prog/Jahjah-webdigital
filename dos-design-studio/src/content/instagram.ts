/**
 * Posts from @dos.designstudio, supplied by the owner (cropped from a screenshot of the profile grid).
 * Captions describe only what is visible. Replace the files with full-resolution originals when available;
 * add verified project details (location, scope, materials) in content/projects.json, not here.
 */
export interface FeedPost {
  src: string;
  kind: "post" | "reel";
  caption: { en: string; ar: string };
}

export const FEED: FeedPost[] = [
  { src: "/instagram/post-01.jpg", kind: "post", caption: { en: "Bathroom vanity", ar: "مغسلة الحمّام" } },
  { src: "/instagram/post-02.jpg", kind: "post", caption: { en: "Kitchen", ar: "مطبخ" } },
  { src: "/instagram/post-03.jpg", kind: "post", caption: { en: "Kitchen — second view", ar: "مطبخ — زاوية ثانية" } },
  { src: "/instagram/post-04.jpg", kind: "post", caption: { en: "Living room", ar: "غرفة جلوس" } },
  { src: "/instagram/post-05.jpg", kind: "post", caption: { en: "MOWA Coffee Shop — pick-up counter", ar: "مقهى MOWA — كاونتر الاستلام" } },
  { src: "/instagram/post-06.jpg", kind: "post", caption: { en: "MOWA Coffee Shop — bar & seating", ar: "مقهى MOWA — البار والجلسات" } },
  { src: "/instagram/post-07.jpg", kind: "reel", caption: { en: "Workspace", ar: "مساحة عمل" } },
  { src: "/instagram/post-08.jpg", kind: "post", caption: { en: "Site in progress", ar: "موقع قيد التنفيذ" } },
  { src: "/instagram/post-09.jpg", kind: "post", caption: { en: "Formal living room", ar: "صالون" } },
  { src: "/instagram/post-10.jpg", kind: "post", caption: { en: "Dining room", ar: "غرفة طعام" } },
  { src: "/instagram/post-11.jpg", kind: "post", caption: { en: "Café counter", ar: "كاونتر مقهى" } },
  { src: "/instagram/post-12.jpg", kind: "post", caption: { en: "Kitchen with marble island", ar: "مطبخ بجزيرة رخامية" } },
];

/** Reels shared by the owner. IDs only — tracking parameters from share links are dropped. */
export const REELS: string[] = ["Dbsv76aA4Ya", "DWekXrkgDI7", "DWRyHnNgFxj"];
