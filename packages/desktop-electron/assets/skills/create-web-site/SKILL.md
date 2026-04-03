---
name: create-web-site
description: Build complete websites from scratch, from static pages to full-stack apps with backend. Use when the user asks to create a web page, website, landing page, portfolio, web app, or any web project. Triggers include "make a website", "build a web app", "create a landing page", "design a page for my restaurant/business/event/portfolio", "make me a homepage", or any request involving building a new web project. Do not use for modifying existing app code or building components within a framework project.
---

# Web Site Creation Flow

End-to-end process: requirements gathering, design decisions, implementation, preview, and deployment.

## Step 1: Fork-Point Questionnaire

Before writing any code, identify decisions that would dramatically change the result. Use the `question` tool to ask about all of them **in a single call**. These are "fork points" -- choices that directly determine visual direction, copy voice, interaction model, and technical structure.

Design the questionnaire around these categories. Skip any question the user already answered in their request.

### 1.1 Page Purpose (determines layout, content blocks, feature set)

- Header: "Page type"
- Examples: Landing/marketing page, Restaurant/cafe/bar, Personal portfolio, Event/invitation, Product showcase, Business homepage, Coming soon, Blog/article, Web app with data

### 1.2 Visual Style (determines palette range, typography, spacing, density, animation ceiling)

- Header: "Visual style"
- Examples: Minimalist/clean, Bold/brutalist, Soft/organic, Luxury/refined, Playful/colorful, Editorial/magazine, Retro/vintage, Dark/moody

### 1.3 Color Direction (combined with style, locks the full palette)

- Header: "Color mood"
- Examples: Warm earthy (beige/terracotta/olive), Cool neutrals (slate/steel/blue-gray), Monochrome (black/white/gray), Vibrant saturated, Soft pastels, Dark base with bright accent

### 1.4 Content Tone (determines heading style, CTA copy, overall voice)

- Header: "Content tone"
- Examples: Formal/professional, Friendly/approachable, Edgy/cool, Playful/fun, Poetic/atmospheric, Minimal/let-visuals-speak

### 1.5 Animation Level (determines CSS-only vs. scroll-triggered vs. complex motion)

- Header: "Animation level"
- Examples: Static/clean (hover states only), Subtle polish (fade-ins, smooth transitions), Rich animations (scroll reveals, parallax, staggered entrances), Highly dynamic (3D, complex interactions)

### 1.6 Backend Needs (determines static-only vs. Hono + Workers)

- Header: "Backend"
- Examples: None (static page only), Simple data storage (contact form, guestbook, likes), User accounts / auth, API integration (third-party services), Full CRUD app (manage content, lists, records)
- This is the most important fork: it determines whether the project is a single HTML file or a Hono + Workers project

### 1.7 Key Features (multi-select -- adds functional/technical requirements)

- Header: "Features"
- Set `multiple: true`
- Examples: Dark/light theme toggle, Contact or inquiry form, Image gallery or carousel, Scroll-triggered animations, Map/location embed, Multi-language, Social links, Admin panel

### 1.8 Branding (captures identity details that must appear in the final page)

- Header: "Branding"
- Ask if the user has: business/project name, tagline, brand colors, logo
- If not provided, invent contextually appropriate ones during implementation

### Adaptive Questioning

Tailor questions to the request. Examples:
- User says "restaurant page" -> add a question about cuisine type and whether they need an online menu/reservation form
- User says "portfolio" -> ask about work categories and whether to include a contact section
- User says "event page" -> ask about date/venue and whether to include RSVP/ticketing
- If the user already specified style ("dark minimalist portfolio"), skip 1.2 and 1.3

The goal: after this single question round, every major fork is resolved. No ambiguity should remain that would cause you to guess wrong during implementation.

## Step 2: Design Blueprint

Synthesize answers into a brief blueprint. Present it to the user before coding so they can course-correct.

1. **Palette** -- primary, secondary, accent, background, surface, text (as CSS custom properties with hex values)
2. **Typography** -- display font + body font (from Google Fonts), size scale, weight choices
3. **Sections** -- ordered list of page sections with rough content description (e.g. "Hero: full-bleed image with overlaid headline and CTA")
4. **Motion plan** -- specific techniques to use (e.g. "intersection-observer fade-up on scroll for feature cards")
5. **Tech stack** -- static HTML or Hono + Workers; which CF bindings (D1/KV/DO) if any; data model summary
6. **Technical notes** -- theme toggle approach, form handling method, any external dependencies

Keep the blueprint to 10-15 lines. This is a checkpoint, not a spec document.

## Design Skill Reference

Based on the visual style chosen in Step 1, load a matching design skill to guide aesthetic execution. These skills live alongside this one and provide detailed rules for typography, color, layout, motion, and anti-patterns:

| User's style choice | Skill to load | What it provides |
|---|---|---|
| Minimalist / clean | `minimalist-skill` | Warm monochrome, typographic contrast, flat bento grids, no gradients or heavy shadows |
| Luxury / refined / high-end | `soft-skill` | Agency-grade fonts, spacing, shadows, card structures, animations that feel expensive |
| Bold / brutalist / industrial | `brutalist-skill` | Swiss type + military terminal aesthetic, rigid grids, extreme contrast, analog degradation |
| Any style (general quality) | `frontend-design` | Distinctive, production-grade interfaces avoiding generic AI aesthetics |
| Any style (technical rigor) | `taste-skill` | Metric-based design rules, strict component architecture, CSS hardware acceleration |
| Redesign of existing page | `redesign-skill` | Audits current design, identifies generic patterns, applies high-end standards |

**How to use:** After the questionnaire resolves the visual direction, load the most relevant design skill and follow its rules during implementation. If no style maps cleanly, `frontend-design` is the safe default. Multiple design skills can be combined (e.g. `taste-skill` for technical rigor + `soft-skill` for aesthetic direction).

## Step 3: Implementation

### Format Decision

Choose the format based on backend needs from the questionnaire:

- **Single HTML file** -- for purely static pages with no data persistence (landing, coming soon, event). All CSS/JS inline, Google Fonts via `<link>`. Preview and deploy are trivial.
- **Hono + Cloudflare Workers project** -- for anything requiring data storage, forms that persist, user accounts, or API calls. This is the default for any non-trivial site.

### Hono + Workers Project Structure

When backend is needed, scaffold this structure:

```
project-name/
  src/
    index.ts          # Hono app entry point
    routes/
      api.ts          # API routes (CRUD, form handlers)
    db/
      schema.sql      # D1 schema (if using D1)
  public/             # Static assets (HTML, CSS, JS, images)
    index.html
    styles.css
    app.js
  wrangler.jsonc      # Workers config with bindings
  package.json
```

**wrangler.jsonc template:**

```jsonc
{
  "name": "project-name",
  "main": "src/index.ts",
  "compatibility_date": "2025-01-01",
  "assets": { "directory": "./public" },
  // Add bindings as needed:
  "d1_databases": [
    { "binding": "DB", "database_name": "project-db", "database_id": "local" }
  ],
  "kv_namespaces": [
    { "binding": "KV", "id": "local" }
  ]
}
```

**Hono app template (src/index.ts):**

```typescript
import { Hono } from "hono"

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// API routes
app.get("/api/items", async (c) => {
  const result = await c.env.DB.prepare("SELECT * FROM items ORDER BY created_at DESC").all()
  return c.json(result.results)
})

app.post("/api/items", async (c) => {
  const body = await c.req.json()
  await c.env.DB.prepare("INSERT INTO items (name, value) VALUES (?, ?)").bind(body.name, body.value).run()
  return c.json({ ok: true })
})

export default app
```

**package.json template:**

```json
{
  "name": "project-name",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "db:init": "wrangler d1 execute project-db --local --file=src/db/schema.sql"
  },
  "dependencies": {
    "hono": "^4"
  },
  "devDependencies": {
    "wrangler": "^4"
  }
}
```

### Choosing CF Bindings

Pick the simplest binding that covers the use case:

| Need | Binding | When to use |
|---|---|---|
| Structured data, queries, relations | **D1** (SQLite) | Forms, CRUD, content management, anything with tables |
| Simple key-value, config, cache | **KV** | Feature flags, settings, session tokens, counters |
| Real-time state, WebSocket, coordination | **Durable Objects** | Chat rooms, collaborative editing, rate limiting |
| File/blob storage | **R2** | Image uploads, file attachments, backups |

**Prefer D1 as the default storage.** It covers most use cases (forms, lists, content) and is easiest to reason about. Only reach for KV/DO/R2 when D1 is a poor fit.

### Local Development

All Hono + Workers projects use `wrangler dev` for local testing:

```bash
# Install dependencies
bun install  # or npm install

# Initialize D1 locally (if using D1)
bun run db:init

# Start local dev server
bun run dev
# -> http://localhost:8787
```

`wrangler dev` runs miniflare locally, which simulates D1, KV, DO, and R2 with real local storage. No Cloudflare account needed for local development.

### Default Product Stance

These defaults apply unless the user explicitly asks otherwise:

**Usability over spectacle.** The core path (read info -> interact -> submit) must be smooth and uninterrupted. Decorative effects should not compete with the primary flow.

**Mobile-first.** Design for phone screens first, expand to desktop. Use `min-width` media queries. Full-height sections use `min-h-[100dvh]`, not `h-screen` (iOS Safari viewport bug).

**Colors: restrained with a clear accent.** One primary accent color for key actions and states. Neutral base. Avoid rainbow palettes. Accent saturation < 80%.

**Typography: readable over decorative.** Display and body fonts should create clear hierarchy without sacrificing legibility. Source from Google Fonts.

**Animation for feedback and rhythm.** Button press response, submit success, section entrance on scroll -- these are useful. Full-screen cinematic animations are opt-in, not default.

**Anti-misoperation.** Submit buttons get debounce/disable-on-click. Destructive actions get confirmation. Errors show inline, next to the field that caused them.

**Keyboard accessible.** Tab can complete the entire flow. Focus styles are visible. Contrast ratios meet WCAG AA, especially in dark themes.

**Real content.** Contextual names, plausible numbers, on-brand copy. Never "Lorem ipsum", "John Doe", "Acme Corp", or `example@email.com`.

**Placeholder images:** `https://picsum.photos/seed/{contextual-word}/W/H`

### Theme Toggle (if selected in Step 1)

- Toggle via `data-theme="light|dark"` attribute on `<html>` (or CSS class)
- Define both palettes as CSS custom property sets (or Tailwind dark mode)
- Persist choice in `localStorage`; respect `prefers-color-scheme` as initial default
- Place toggle in header/nav with sun/moon icon or similar

### Form Handling

- **With backend (Hono + Workers):** POST to an API route, store in D1, return JSON response. Show success/error feedback inline.
- **Static page:** `localStorage` save + success state, or `mailto:` link. Mention Cloudflare Workers as an upgrade path.
- Client-side validation: required/format/range, with friendly inline error messages
- Clear success feedback (in-page confirmation, not a redirect)

## Step 4: Preview

After building the page, **immediately** use `present_file` to show it to the user:

- Single HTML file: `present_file` the `.html` file directly
- Hono + Workers project: run `bun run dev` first, then tell the user to open `http://localhost:8787` in their browser

Ask if the user wants adjustments. Iterate until satisfied.

## Step 5: Deployment

Once the user approves the result:

1. Mention the site works locally (`open index.html` for static, `bun run dev` for Workers)
2. For deploying to Cloudflare, tell the user to activate the `cloudflare-deploy` skill for detailed deployment guidance
3. Prompt: "Want to deploy this to Cloudflare for a public URL? Activate the `cloudflare-deploy` skill and I'll walk you through it."
