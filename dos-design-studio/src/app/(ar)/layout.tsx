import "../globals.css";
import { display, sans, arDisplay, arSans } from "../fonts";
import { buildMetadata } from "../metadata";
export { viewport } from "../metadata";

export const metadata = buildMetadata("ar");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${sans.variable} ${arDisplay.variable} ${arSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
