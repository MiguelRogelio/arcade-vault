export default function Home() {
  return (
    <main className="av-main">
      <section className="av-hero">
        <h1>Arcade Vault</h1>
        <p className="sub">
          INSERT COIN <span className="blink">_</span>
        </p>
      </section>

      <div className="av-filters">
        <button className="btn pulse">Jugar ahora</button>
        <button className="btn magenta">Salón de la fama</button>
        <button className="btn ghost">Iniciar sesión</button>
      </div>
    </main>
  );
}
