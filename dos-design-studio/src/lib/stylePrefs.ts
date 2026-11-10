const KEY = "dos:styles";
export const MAX_SAVED = 3;

export function readSaved(): string[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, MAX_SAVED) : [];
  } catch {
    return [];
  }
}

export function writeSaved(ids: string[]) {
  try { sessionStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX_SAVED))); } catch {}
  window.dispatchEvent(new Event("dos:styles-changed"));
}
