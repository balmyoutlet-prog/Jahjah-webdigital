import "../globals.css";
import { display, sans, arDisplay, arSans } from "../fonts";
import { buildMetadata } from "../metadata";
export { viewport } from "../metadata";

export const metadata = buildMetadata("en");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${display.variable} ${sans.variable} ${arDisplay.variable} ${arSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
