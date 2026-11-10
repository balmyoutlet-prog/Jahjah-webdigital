import { Instrument_Serif, Inter_Tight, Noto_Kufi_Arabic, IBM_Plex_Sans_Arabic } from "next/font/google";

export const display = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--f-display", display: "swap" });
export const sans = Inter_Tight({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--f-sans", display: "swap" });
export const arDisplay = Noto_Kufi_Arabic({ subsets: ["arabic"], weight: ["200", "300", "400"], variable: "--f-ar-display", display: "swap" });
export const arSans = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400", "500"], variable: "--f-ar-sans", display: "swap" });
