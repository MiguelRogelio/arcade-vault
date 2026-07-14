# SPEC 01 — MVP visual: pantallas de Arcade Vault en App Router

> **Estado:** aprobado
> **Depende de:** —
> **Fecha:** 2026-07-12
> **Objetivo:** Maquetar las cinco pantallas del template (Biblioteca, Detalle, Reproductor, Autenticación y Salón de la Fama) como interfaz visual navegable en Next.js App Router, sin implementar ningún juego real.

---

## Alcance

**Dentro:**

- Cinco rutas reales de App Router: `/` (Biblioteca), `/juego/[id]` (Detalle), `/jugar/[id]` (Reproductor), `/auth` (Autenticación) y `/salon` (Salón de la Fama).
- Chrome compartido (`Nav` + `footer`) montado una sola vez en `app/layout.tsx`, con resaltado de ruta activa vía `usePathname()`.
- `UserProvider` (React Context, cliente) que guarda el usuario **en memoria** durante la sesión.
- Módulo de datos TS tipado (`app/lib/games.ts`): `GAMES`, `CATS`, `seededScores`, y tipos `Game` / `Score`.
- Interactividad de UI sin juego: búsqueda y filtros por categoría en Biblioteca; tabs de juego en Salón; tabs iniciar/crear en Auth; navegación entre pantallas; menú móvil (hamburguesa) del Nav.
- Reproductor con HUD simulado: puntuación que asciende sola, subida de nivel, Pausa que congela el contador, y modal de Fin con captura de puntuación (toast visual, sin persistir).
- Login/invitado y "guardar puntuación" actualizan la UI en la sesión actual; no se persiste nada.
- `notFound()` en `/juego/[id]` y `/jugar/[id]` cuando el `id` no existe en `GAMES`.
- Portafolios de arte de portada, fondos, fuentes y animaciones ya presentes en `app/globals.css` (se reutilizan tal cual).

**Fuera de alcance (para futuras specs):**

- Cualquier motor o lógica de juego real (la arena del Reproductor sigue siendo animación CSS decorativa).
- Persistencia en `localStorage`/IndexedDB de sesión o puntuaciones.
- Autenticación real, backend, o login social funcional (Google/GitHub son botones decorativos).
- Leaderboards reales servidos desde una API (el Salón y el Detalle usan datos deterministas de `seededScores`).
- El contador de "CRÉDITOS · 03" del Nav como funcionalidad (queda como decoración).
- Tests automatizados (no hay runner configurado en el repo).
- Modo claro / theming alternativo; la paleta neón oscura es la única.

---

## Modelo de datos

Se porta `references/templates/data.jsx` a un módulo TS tipado en `app/lib/games.ts`. No hay base de datos ni persistencia: son datos estáticos en memoria más una función determinista para generar tablas de puntuaciones.

```ts
// app/lib/games.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
	id: string; // slug, p. ej. "bloque-buster" — clave de ruta
	title: string;
	short: string; // descripción corta (tarjeta)
	long: string; // descripción larga (detalle)
	cat: Category;
	cover: string; // clase CSS de portada, p. ej. "cover-bricks"
	color: GameColor; // acento del botón JUGAR
	best: number; // mejor puntuación global
	plays: string; // formateado, p. ej. "12.4K"
}

export interface Score {
	rank: number;
	name: string;
	score: number;
	date: string; // "DD/MM/2026"
}

export const GAMES: Game[] = [
	/* los 8 juegos del template, sin cambios */
];

// Incluye "TODOS" como filtro por defecto de la Biblioteca.
export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;

// Generador determinista (mismo seed → mismas filas). Sin Math.random.
export function seededScores(seed: number, count?: number): Score[];
```

Estado de sesión (en memoria, vía Context — no se persiste):

```ts
// app/lib/user-context.tsx
export interface User {
	name: string;
} // p. ej. { name: "PX_KAI" }

interface UserContextValue {
	user: User | null; // null = invitado
	login: (u: User | null) => void;
	signOut: () => void;
	saveScore: (entry: { game: string; score: number; name: string }) => void;
	// saveScore actualiza solo estado de sesión / dispara el toast; no persiste.
}
```

Convenciones:

- El `id` del juego es la clave tanto del objeto como del segmento de ruta dinámica.
- Fechas como string ya formateado `DD/MM/2026`; no se usan objetos `Date`.
- `seededScores` es puro y determinista: la misma pantalla siempre muestra la misma tabla.

---

## Plan de implementación

Cada paso deja la app compilando y navegable. Antes de escribir cualquier código de Next, consultar la guía correspondiente en `node_modules/next/dist/docs/` (App Router, componentes cliente, rutas dinámicas) según exige `AGENTS.md`.

1. **Módulo de datos.** Crear `app/lib/games.ts` portando `GAMES`, `CATS` y `seededScores` desde `data.jsx`, con los tipos `Game`, `Score`, `Category`, `GameColor`. Verificación: `npm run lint` pasa y el módulo importa sin errores de tipo.
2. **Contexto de usuario.** Crear `app/lib/user-context.tsx` (`"use client"`) con `UserProvider`, hook `useUser()`, y `login`/`signOut`/`saveScore` en memoria. Envolver `children` con `UserProvider` en `app/layout.tsx`. Verificación: la app arranca (`npm run dev`) sin errores de hidratación.
3. **Nav + footer compartidos.** Crear `app/components/nav.tsx` (`"use client"`) leyendo `useUser()` y `usePathname()` para el resaltado activo y el menú móvil; renderizar `Nav`, `<main class="av-main">` y `footer` en `app/layout.tsx`. Verificación: el Nav aparece en todas las rutas, resalta la activa, y el panel hamburguesa abre/cierra en móvil.
4. **Biblioteca (`/`).** Reemplazar el placeholder de `app/page.tsx` por el componente `Library` (`"use client"`) con hero, buscador, chips de categoría, grid y `GameCard` (efecto tilt). Cada tarjeta navega a `/juego/[id]`. Verificación: se ven las 8 tarjetas; buscar filtra por nombre; los chips filtran por categoría; sin resultados muestra el estado vacío.
5. **Detalle (`/juego/[id]`).** Crear `app/juego/[id]/page.tsx` con `GameDetail`: portada, tags, descripción larga, tira de estadísticas, leaderboard (`seededScores`) y acciones. `params` es asíncrono (await); `notFound()` si el `id` no existe. Verificación: muestra el juego correcto; "JUGAR AHORA" va a `/jugar/[id]`; "VOLVER AL VAULT" va a `/`; un id inventado da 404.
6. **Reproductor (`/jugar/[id]`).** Crear `app/jugar/[id]/page.tsx` con `GamePlayer` (`"use client"`): HUD con ticker simulado (sube solo, sube de nivel, Pausa congela), arena CRT decorativa, y modal de Fin con captura de iniciales y toast "PUNTUACIÓN GUARDADA". `notFound()` si el `id` no existe. Verificación: la puntuación asciende; Pausa la congela; "FIN" abre el modal; "GUARDAR" muestra el toast; "JUGAR DE NUEVO" reinicia el HUD.
7. **Autenticación (`/auth`).** Crear `app/auth/page.tsx` con `Auth` (`"use client"`): tarjeta, tabs iniciar/crear (el campo correo aparece solo en "crear"), formulario, botón invitado y botones sociales decorativos. Enviar hace `login()` y navega a `/`. Verificación: enviar inicia sesión y redirige a Biblioteca; "JUGAR COMO INVITADO" navega a `/`; cambiar de tab muestra/oculta el campo correo.
8. **Salón de la Fama (`/salon`).** Crear `app/salon/page.tsx` con `HallOfFame` (`"use client"`): cabecera, tabs por juego, podio (top 3), tabla completa (`seededScores`) y la fila "tu mejor marca" solo si hay usuario en sesión. Verificación: cambiar de tab cambia podio y tabla; con sesión iniciada aparece la fila destacada del usuario; "VOLVER A LA BIBLIOTECA" va a `/`.

---

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores ni warnings de TypeScript.
- [ ] Las cinco rutas (`/`, `/juego/[id]`, `/jugar/[id]`, `/auth`, `/salon`) cargan sin errores en consola.
- [ ] El Nav y el footer aparecen en las cinco rutas y el Nav resalta el enlace de la ruta activa.
- [ ] En viewport ≤ 840px, el botón hamburguesa abre el panel móvil y el backdrop lo cierra.
- [ ] La Biblioteca muestra las 8 tarjetas de `GAMES`.
- [ ] Escribir en el buscador filtra las tarjetas por nombre en tiempo real.
- [ ] Pulsar un chip de categoría deja solo los juegos de esa categoría; "TODOS" las muestra todas.
- [ ] Cuando el filtro no deja resultados, se muestra el bloque "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta (o en "JUGAR") navega a `/juego/[id]` del juego correcto.
- [ ] El Detalle muestra título, descripción larga, tira de estadísticas y leaderboard del juego indicado por el `id`.
- [ ] `/juego/id-inexistente` y `/jugar/id-inexistente` devuelven la página 404 de Next.
- [ ] En el Reproductor la puntuación asciende automáticamente mientras no está en pausa.
- [ ] "PAUSA" congela el contador y muestra el overlay "EN PAUSA"; "REANUDAR" lo reactiva.
- [ ] "FIN" abre el modal con la puntuación final; "GUARDAR PUNTUACIÓN" muestra el toast "PUNTUACIÓN GUARDADA".
- [ ] "JUGAR DE NUEVO" reinicia puntuación, vidas y nivel; "VOLVER AL VAULT" navega a `/`.
- [ ] En `/auth`, cambiar a la pestaña "CREAR CUENTA" muestra el campo de correo; "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario de Auth inicia sesión (nombre en el Nav) y redirige a `/`.
- [ ] "JUGAR COMO INVITADO" navega a `/` sin dejar usuario en sesión.
- [ ] En el Salón, cambiar de tab de juego cambia el podio y la tabla de puntuaciones.
- [ ] La fila "TU MEJOR MARCA" solo aparece en el Salón cuando hay usuario en sesión.
- [ ] Recargar cualquier página no conserva la sesión ni las puntuaciones (sin persistencia).

---

## Decisiones

- **Sí:** rutas reales de App Router (una por pantalla). Es el patrón nativo de Next 16, da URLs compartibles y es el objetivo del proyecto.
- **No:** replicar el router por hash del template en un único `page.tsx`. Desaprovecha App Router y va contra el objetivo.
- **Sí:** estado de usuario en memoria vía React Context (`UserProvider`). Coherente con "solo visual" y evita lógica de persistencia e hidratación.
- **No:** `localStorage` para sesión y puntuaciones (como el template). Añade persistencia y manejo SSR/hidratación fuera de alcance del MVP.
- **Sí:** módulo TS tipado (`app/lib/games.ts`) con `Game`/`Score`. Aprovecha el modo strict y da autocompletado a todas las pantallas.
- **Sí:** conservar la interactividad de UI (búsqueda, filtros, tabs, ticker simulado, modales). Da vida visual a las maquetas sin implementar juegos.
- **No:** motor de juego real en la arena del Reproductor. Es otra spec; aquí la arena es animación CSS decorativa.
- **Sí:** `notFound()` para `id` inválido en rutas dinámicas. Comportamiento idiomático de App Router.
- **No:** `redirect('/')` ante `id` inválido. Oculta el error y confunde al usuario que llegó por una URL rota.
- **Sí:** conservar el ticker de puntuación simulado del Reproductor. Es el efecto visual "vivo" de la pantalla.
- **Sí:** reutilizar el `app/globals.css` ya portado tal cual. El tema y todas las clases de componente ya existen; no se re-escriben.
- **Sí:** Nav y footer en `app/layout.tsx` (chrome una sola vez). Evita duplicación y centraliza el estado de usuario.
- **Nota:** definición guiada con preguntas completas; sin atajos en la fase de aclaración.

---

## Riesgos

| Riesgo                                                                                                             | Mitigación                                                                                              |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| En Next 16 los `params` de rutas dinámicas son asíncronos (`Promise`); tratarlos como objeto plano rompe el build. | Leer la guía en `node_modules/next/dist/docs/` y hacer `await params` en `/juego/[id]` y `/jugar/[id]`. |
| Componentes con `useState`/`useEffect`/Context renderizados como Server Components fallan.                         | Marcar `"use client"` en `Nav`, `UserProvider` y las cinco pantallas interactivas.                      |
| El ticker del Reproductor usa un `setInterval`; sin limpieza provoca fugas o dobles contadores.                    | `clearInterval` en el cleanup del `useEffect`, dependiente de `paused`/`over`.                          |
| El estado de usuario en memoria puede causar desajustes de hidratación si el Nav asume sesión en SSR.              | Estado inicial `user = null` en servidor y cliente; solo cambia tras interacción del usuario.           |
| Diferencias de fuente entre el template (Google Fonts CDN) y el proyecto (`next/font` self-hosted).                | Ya resuelto: `globals.css` mapea `--pixel`/`--mono` a las variables de `next/font`; no tocar el mapeo.  |

---

## Lo que **no** entra en esta spec

- Motor o lógica de juego real (otra spec).
- Persistencia en `localStorage`/IndexedDB.
- Autenticación real, backend o login social funcional.
- Leaderboards servidos desde una API.
- Tests automatizados.

Cada uno de estos, si se aborda, va en su propia spec.
