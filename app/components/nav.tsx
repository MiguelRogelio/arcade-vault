"use client";

// app/components/nav.tsx — chrome de navegación compartido (montado en layout).
// Resalta la ruta activa con usePathname() y lee la sesión con useUser().

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "../lib/user-context";

export function Nav() {
  const pathname = usePathname();
  const { user, signOut } = useUser();
  const [open, setOpen] = useState(false);

  // Inicio (Home) es la ruta raíz. Biblioteca queda activa en /juegos y también en
  // Detalle (/juego) y Reproductor (/jugar), que son navegación "dentro del vault".
  const inicioActive = pathname === "/";
  const libActive =
    pathname === "/juegos" ||
    pathname.startsWith("/juego") ||
    pathname.startsWith("/jugar");
  const salonActive = pathname.startsWith("/salon");
  const authActive = pathname.startsWith("/auth");

  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={inicioActive ? "active" : ""} onClick={close}>
            Inicio
          </Link>
          <Link href="/juegos" className={libActive ? "active" : ""} onClick={close}>
            Biblioteca
          </Link>
          <Link
            href="/salon"
            className={salonActive ? "active" : ""}
            onClick={close}
          >
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {user ? (
          <button className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link href="/auth" className="btn auth-btn" onClick={close}>
            Iniciar Sesión
          </Link>
        )}
        <button
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
      ></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan" style={{ fontSize: 11, marginBottom: 16 }}>
          MENÚ
        </div>
        <Link href="/" className={inicioActive ? "active" : ""} onClick={close}>
          Inicio
        </Link>
        <Link href="/juegos" className={libActive ? "active" : ""} onClick={close}>
          Biblioteca
        </Link>
        <Link
          href="/salon"
          className={salonActive ? "active" : ""}
          onClick={close}
        >
          Salón de la Fama
        </Link>
        <Link
          href="/auth"
          className={authActive ? "active" : ""}
          onClick={close}
        >
          {user ? "Cuenta" : "Iniciar Sesión"}
        </Link>
        <div style={{ flex: 1 }}></div>
        <div
          className="pixel"
          style={{ fontSize: 9, color: "var(--ink-faint)", letterSpacing: "0.16em" }}
        >
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
