# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Marketing/documentation website for [Laurel Proxy](https://github.com/rvanbaalen/laurelproxy) — an HTTP/HTTPS intercepting proxy for developers and AI agents. The site is at https://laurelproxy.robinvanbaalen.nl.

### Related Repos

- **Main app**: [`rvanbaalen/laurelproxy`](https://github.com/rvanbaalen/laurelproxy) — locally at `~/Sites/laurelproxy`
- **Install**: `npm install -g laurel-proxy` (global) or `npx laurel-proxy` (run instantly)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — preview production build locally
- `npx vitest run` — run all tests
- `npx vitest run src/components/TerminalReplay.test.tsx` — run a single test file
- `npx vitest --watch` — run tests in watch mode

## Tech Stack

- **Astro 6** with static site generation (file-based routing under `src/pages/`)
- **React 19** for interactive components (only `TerminalReplay.tsx` currently uses `client:visible`)
- **Tailwind CSS v4** via Vite plugin (not the Astro integration) — configured in `astro.config.mjs`
- **Vitest** with jsdom environment for component tests
- **Pagefind** for client-side search (built at build time via `astro-pagefind`)
- **PostHog** analytics (conditionally loaded when `PUBLIC_POSTHOG_KEY` env var is set)
- **Cloudflare Workers** for deployment (static assets via `wrangler.toml`)

## Architecture

### Layout Hierarchy

`Base.astro` is the root HTML shell (meta tags, fonts, search modal). Two page types use it:

1. **Homepage** (`src/pages/index.astro`) — uses `Base.astro` directly with `Nav` + `Footer`
2. **Docs pages** (`src/pages/docs/**`) — use `DocsLayout.astro` which wraps `Base.astro` and adds the sidebar, table of contents, and prev/next navigation

### Docs Navigation

`src/docs-nav.ts` is the single source of truth for sidebar ordering and prev/next links. When adding/removing/reordering docs pages, update this file. The sidebar (`DocsSidebar.astro`) and prev/next links (`DocsLayout.astro`) both consume it.

### Design System

All custom colors and the mono font are defined as Tailwind theme tokens in `src/styles/global.css` via `@theme`. Use semantic names like `text-primary`, `bg-secondary`, `accent`, `border` — not raw hex values. The site is dark-mode only (hardcoded `class="dark"` on `<html>`).

### Interactive Components

Only `TerminalReplay.tsx` is a React component (animated typing effect on the homepage). Everything else is Astro components. Astro components handle all static rendering; only use React when client-side interactivity is required.

### Node Version

`.node-version` is set to 22 (required for Cloudflare Pages builds).

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
