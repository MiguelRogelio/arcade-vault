"use client";

// app/lib/user-context.tsx — estado de sesión EN MEMORIA (no se persiste).
// El estado inicial es null en servidor y cliente para evitar desajustes de
// hidratación; solo cambia tras una interacción del usuario.

import { createContext, useCallback, useContext, useState } from "react";

export interface User {
  name: string; // p. ej. "PX_KAI"
}

export interface ScoreEntry {
  game: string;
  score: number;
  name: string;
}

interface UserContextValue {
  user: User | null; // null = invitado
  lastScore: ScoreEntry | null; // última puntuación capturada en la sesión
  login: (u: User | null) => void;
  signOut: () => void;
  saveScore: (entry: ScoreEntry) => void;
  // saveScore actualiza solo estado de sesión / dispara el toast; no persiste.
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lastScore, setLastScore] = useState<ScoreEntry | null>(null);

  const login = useCallback((u: User | null) => setUser(u), []);
  const signOut = useCallback(() => setUser(null), []);
  const saveScore = useCallback((entry: ScoreEntry) => {
    // Sin persistencia (MVP visual): la puntuación vive solo en el estado de la
    // sesión actual; el toast lo dispara el Reproductor.
    setLastScore(entry);
  }, []);

  return (
    <UserContext.Provider value={{ user, lastScore, login, signOut, saveScore }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser debe usarse dentro de <UserProvider>");
  }
  return ctx;
}
