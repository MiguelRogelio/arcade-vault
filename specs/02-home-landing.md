# SPEC 02 — Home / Landing como página principal

> **Estado:** aprovado
> **Depende de:** SPEC 01 (pantallas MVP, `app/lib/games.ts`, `globals.css`, Nav, footer)
> **Fecha:** 2026-07-13
> **Objetivo:** Portar `home.jsx` del template a un Home en la ruta `/` como página principal, moviendo la Biblioteca a `/juegos` y actualizando el Nav y los enlaces internos, sin implementar `about.jsx`.

---

## Contexto

La spec 01 maquetó las cinco pantallas del template y dejó la **Biblioteca** en la ruta
raíz `/`. El template incluye además una **landing page** (`references/templates/home-about/home.jsx`)
que nunca se portó. Se quiere que ese Home sea la **página principal** del sitio (`/`),
empujando la Biblioteca a su propia ruta. La página `about.jsx` del mismo template queda
**explícitamente fuera** de esta spec.

Resultado esperado: al entrar a Arcade Vault el visitante ve la landing (hero "EL ARCADE
CLÁSICO ESTÁ DE VUELTA", secciones de por qué, preview de juegos, stats, actividad, precios
y CTA final), y desde ahí navega a la Biblioteca (`/juegos`), al detalle de un juego, al
Salón o a Auth.

---

## Alcance

**Dentro:**

- Nuevo Home en `/` (componente cliente) con todas las secciones de `home.jsx`: hero con
  siluetas flotantes (`FloatingSilhouettes`), "¿Por qué Arcade Vault?" (4 feature cards con
  iconos pixel), preview de juegos, banda de stats, "Actividad en vivo" (ticker + top
  jugadores), precios/FAQ y CTA final. Incluye la animación de scroll-reveal
  (`IntersectionObserver`).
- **Mover la Biblioteca** de `/` a **`/juegos`** (nueva ruta que renderiza el componente
  `Library` existente). El componente `Library` no cambia; solo cambia dónde se monta.
- **Datos conectados:** el preview de juegos usa `GAMES.slice(0, 6)` y la lista
  "Top jugadores · HOY" usa `seededScores(...)` de `app/lib/games.ts`. El resto de secciones
  (ticker "últimas puntuaciones", stats, precios, FAQ) se portan como contenido **estático**
  del template.
- **Nav actualizado:** enlaces `Inicio` (→ `/`), `Biblioteca` (→ `/juegos`) y
  `Salón de la Fama` (→ `/salon`). Lógica de resaltado activo reajustada. El logo sigue
  llevando a `/`.
- **Repuntar enlaces internos** que hoy apuntan a `/` como "volver a la Biblioteca":
  Detalle, Reproductor, Salón y el redirect post-login de Auth pasan a `/juegos`.
- **Portar el CSS del Home** desde `references/templates/home-about/styles.css`
  (bloque `HOME PAGE`, líneas ~930–1069) a `app/globals.css`.

**Fuera de alcance:**

- `about.jsx` y sus estilos (`ABOUT PAGE`, líneas 1071+ del template). No se crea ruta
  `/about` ni enlace "Acerca de".
- Cualquier lógica/juego real, persistencia, backend o auth real (siguen fuera, como en spec 01).
- Hacer dinámicos el ticker "últimas puntuaciones", las stats o los precios: quedan estáticos.
- Cambiar el diseño o contenido de las pantallas ya existentes (solo se repunta su enlace de "volver").

---

## Modelo de datos

No introduce nuevas estructuras. Reutiliza lo existente de `app/lib/games.ts`:

- `GAMES: Game[]` → `GAMES.slice(0, 6)` para el preview (`MiniCard` usa `title`, `cat`, `cover`).
- `seededScores(seed, count?): Score[]` → top 5 jugadores del Home (`rank`, `name`, `score`).

Los arrays estáticos del template (features, ticker de últimas puntuaciones, stats, precios,
FAQ) se portan como constantes locales del componente Home, sin tipos nuevos.

---

## Plan de implementación

Antes de tocar código de Next, consultar la guía en `node_modules/next/dist/docs/`
(App Router, componentes cliente) según exige `AGENTS.md`. Cada paso deja la app compilando.

1. **CSS del Home.** Portar el bloque `HOME PAGE` de `references/templates/home-about/styles.css`
   (`.home`, `.home-hero`, `.home-hero-inner`, `.hero-eyebrow`, `.home-title/.line-*`,
   `.home-sub`, `.home-ctas`, `.hero-scroll`, `.home-silos/.silo`, `.home-section`,
   `.section-head/.kicker/.section-title/.section-rule`, `.feature-grid/.feature-card/.ft-*`,
   `.mini-rail/.mini-card/.mini-*`, `.home-stats/.stats-inner/.stat-*`, `.home-final/.final-*`,
   `.reveal`) a `app/globals.css`. **No** portar el bloque `ABOUT PAGE`.
   _Verificación:_ `npm run lint` pasa; las clases existen en globals.css.

2. **Mover Biblioteca a `/juegos`.** Crear `app/juegos/page.tsx` que renderice `<Library />`
   (mismo patrón que hoy usa `app/page.tsx`). El componente `app/components/library.tsx`
   no se modifica.
   _Verificación:_ `/juegos` muestra la Biblioteca completa (buscador, chips, grid, tarjetas → `/juego/[id]`).

3. **Home en `/`.** Reemplazar `app/page.tsx` para que renderice un nuevo componente
   `app/components/home.tsx` (`"use client"`), portando `home.jsx`:
   - Subcomponentes `FloatingSilhouettes`, `FeatureIcon`, `MiniCard` como TSX tipado.
   - Hook de reveal con `IntersectionObserver` en `useEffect` (con `disconnect()` en cleanup).
   - Navegación con `next/navigation` (`useRouter().push` o `<Link>`): "EXPLORAR JUEGOS" y
     "VER TODOS LOS JUEGOS" → `/juegos`; "CREAR CUENTA"/"EMPEZAR GRATIS" → `/auth`;
     mini-cards → `/juego/[id]`; "VER SALÓN" → `/salon`; "INSERTAR MONEDA" (CTA final) → `/juegos`.
   - Preview: `GAMES.slice(0, 6)`. Top jugadores: `seededScores(...).slice(0, 5)`.
     _Verificación:_ `/` muestra la landing completa; el scroll revela las secciones; los botones navegan correctamente.

4. **Nav.** En `app/components/nav.tsx` añadir el enlace `Inicio` (→ `/`), cambiar
   `Biblioteca` para que apunte a `/juegos`, mantener `Salón de la Fama`. Reajustar el
   resaltado: `inicioActive = pathname === "/"`; `libActive = pathname === "/juegos" ||
startsWith("/juego") || startsWith("/jugar")`. Aplicar lo mismo al panel móvil.
   _Verificación:_ en `/` se resalta "Inicio"; en `/juegos`, `/juego/[id]`, `/jugar/[id]` se resalta "Biblioteca"; en `/salon`, "Salón".

5. **Repuntar enlaces internos a `/juegos`.** Cambiar los "volver a la Biblioteca"/redirect
   que hoy van a `/`:
   - `app/juego/[id]/page.tsx:71` ("VOLVER AL VAULT") → `/juegos`.
   - `app/components/game-player.tsx:160` ("VOLVER AL VAULT") → `/juegos`.
   - `app/salon/page.tsx:128` ("VOLVER A LA BIBLIOTECA") → `/juegos`.
   - `app/auth/page.tsx:23` y `:98` (redirect tras login/invitado) → `/juegos`.
     _Verificación:_ desde Detalle, Reproductor, Salón y tras login se llega a la Biblioteca en `/juegos`, no al Home.

---

## Criterios de aceptación

- [ ] `npm run build` y `npm run lint` terminan sin errores ni warnings de TypeScript.
- [ ] `/` muestra el Home: hero, "¿Por qué Arcade Vault?", preview de juegos, stats, "Actividad en vivo", precios y CTA final.
- [ ] Al hacer scroll, las secciones con `.reveal` aparecen con la animación (IntersectionObserver).
- [ ] El preview de juegos muestra 6 tarjetas provenientes de `GAMES.slice(0, 6)` y cada una navega a `/juego/[id]`.
- [ ] "Top jugadores · HOY" muestra 5 filas provenientes de `seededScores(...)`.
- [ ] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS" y "INSERTAR MONEDA" navegan a `/juegos`.
- [ ] "CREAR CUENTA" y "EMPEZAR GRATIS" navegan a `/auth`; "VER SALÓN" navega a `/salon`.
- [ ] `/juegos` muestra la Biblioteca completa (buscador, chips, grid) idéntica a la anterior.
- [ ] El Nav muestra "Inicio", "Biblioteca" y "Salón de la Fama"; resalta el correcto en cada ruta.
- [ ] No existe enlace "Acerca de" ni ruta `/about`.
- [ ] Desde Detalle, Reproductor y Salón, "volver" lleva a `/juegos`; tras login/invitado en Auth se llega a `/juegos`.
- [ ] En viewport ≤ 840px el Home es responsive (grids colapsan) y el menú móvil del Nav funciona.
- [ ] No hay errores de hidratación ni en consola en `/` ni en `/juegos`.

---

## Decisiones

- **Sí:** Home en `/`, Biblioteca en `/juegos`. Se pidió el Home como página principal; `/juegos` es coherente con `/juego/[id]` y `/jugar/[id]`.
- **Sí:** conectar preview a `GAMES.slice(0,6)` y top jugadores a `seededScores`. Consistencia con el resto de la app.
- **No:** hacer dinámicos ticker de "últimas puntuaciones", stats y precios. Son decoración; se portan estáticos para acotar el alcance.
- **Sí:** añadir enlace "Inicio" al Nav además de mantener el logo → `/`. Da un punto de retorno explícito a la landing.
- **No:** implementar `about.jsx` ni enlace "Acerca de". Excluido explícitamente.
- **Sí:** redirect post-login de Auth a `/juegos` (no a `/`). Tras autenticarse el usuario quiere jugar, no volver a la landing.
- **Sí:** reutilizar el componente `Library` existente montándolo en `/juegos`. Evita duplicar código.
- **Sí:** portar el CSS del Home a `globals.css` (no CSS Modules). Coherente con cómo spec 01 gestiona los estilos del template.

---

## Riesgos

| Riesgo                                                                                      | Mitigación                                                                                     |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| El `IntersectionObserver` en SSR (no existe en servidor) rompe el render.                   | Ejecutarlo dentro de `useEffect` (solo cliente) y marcar el Home `"use client"`.               |
| Enlaces internos a `/` olvidados quedan apuntando al Home en vez de la Biblioteca.          | El paso 5 enumera los 5 sitios exactos (con archivo:línea) a repuntar.                         |
| Estilos del Home ausentes en `globals.css` dejan la landing sin formato.                    | Paso 1 porta explícitamente el bloque `HOME PAGE` antes de montar el componente.               |
| Confundir enlaces `<Link>` con handlers `navigate()` del template (que no existen en Next). | Sustituir todo `navigate({name})` por `<Link href>`/`useRouter().push` según el mapa de rutas. |

---

## Verificación end-to-end

1. `npm run dev` y abrir `/`: ver la landing completa; hacer scroll y comprobar el reveal.
2. Pulsar cada CTA y verificar destino (`/juegos`, `/auth`, `/salon`, `/juego/[id]`).
3. En `/juegos` comprobar que la Biblioteca funciona (buscar, filtrar, abrir un juego).
4. Recorrer Nav en cada ruta y verificar el resaltado activo y el menú móvil (≤840px).
5. Desde Detalle/Reproductor/Salón pulsar "volver" y confirmar que llega a `/juegos`; login en `/auth` y confirmar redirect a `/juegos`.
6. `npm run build` y `npm run lint` sin errores.
