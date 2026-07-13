// app/jugar/[id]/page.tsx — Reproductor. Server Component: params asíncrono
// (await) y notFound() si el id no existe. Monta el cliente GamePlayer.

import { notFound } from "next/navigation";
import { GamePlayer } from "../../components/game-player";
import { GAMES } from "../../lib/games";

export default async function GamePlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) {
    notFound();
  }

  return <GamePlayer game={game} />;
}
