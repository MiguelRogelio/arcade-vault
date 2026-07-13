import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./lib/user-context";
import { Nav } from "./components/nav";

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
        <div id="root">
          <UserProvider>
            <Nav />
            <main className="av-main">{children}</main>
            <footer
              style={{
                borderTop: "1px solid var(--line)",
                padding: "20px 32px",
                textAlign: "center",
                color: "var(--ink-faint)",
                fontFamily: "var(--mono)",
                fontSize: 11,
                letterSpacing: "0.16em",
              }}
            >
              © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
            </footer>
          </UserProvider>
        </div>
      </body>
    </html>
  );
}
