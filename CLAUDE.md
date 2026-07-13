# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js version

This project uses **Next.js 16.2.10 with React 19.2.4** — a version with breaking changes from older Next.js you may know. As stated in `AGENTS.md`, read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js code, and heed deprecation notices. Do not assume App Router APIs, config shapes, or conventions match your training data.

## Project

Arcade Vault is a platform to play games online and compete for the highest score. The codebase is currently a fresh App Router scaffold (`app/layout.tsx`, `app/page.tsx`) — feature code has not been built yet.

Development follows **Spec Driven Design** using the `/spec` and `/spec-impl` skills from [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills) (installed via `npx skills@latest add Klerith/fernando-skills`). Prefer defining a spec before implementing features.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

There is no test runner configured yet.

## Architecture & conventions

- **App Router** under `app/`. `app/layout.tsx` is the root layout (loads Geist fonts, sets `<html>`/`<body>` shell); route UI lives in `app/**/page.tsx`.
- **TypeScript strict mode** is on. Import alias `@/*` maps to the repo root (`./`), e.g. `import x from "@/app/..."`.
- **Tailwind CSS v4** — configured entirely in CSS. Theme tokens are declared with `@theme inline` in `app/globals.css`; there is no `tailwind.config.js`. PostCSS uses `@tailwindcss/postcss`.
- Dark mode is driven by `prefers-color-scheme` via CSS variables (`--background`, `--foreground`) in `globals.css`, surfaced to Tailwind as `--color-*` tokens.
- ESLint uses the flat-config `eslint.config.mjs` extending `next/core-web-vitals` and `next/typescript`.
