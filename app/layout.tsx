import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Pixel/arcade display font (--pixel). Press Start 2P ships a single weight.
const pressStart2P = Press_Start_2P({
  variable: "--ff-pixel",
  subsets: ["latin"],
  weight: "400",
});

// Body/monospace font (--mono). JetBrains Mono is a variable font.
const jetBrainsMono = JetBrains_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arcade Vault · Portal Retro",
  description:
    "Arcade Vault — juega clásicos retro online y compite por el puntaje más alto.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${pressStart2P.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        {/* Perspective grid + scanlines + vignette */}
        <div className="av-bg" />
        {/* Film-grain noise overlay */}
        <div className="av-noise" />
        {/* App frame — styles.css targets #root for the flex column shell */}
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
