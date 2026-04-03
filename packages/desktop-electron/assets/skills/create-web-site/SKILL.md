---
name: create-web-site
description: Build complete websites from scratch, from static pages to full-stack apps with backend. Use when the user asks to create a web page, website, landing page, portfolio, web app, or any web project. Triggers include "make a website", "build a web app", "create a landing page", "design a page for my restaurant/business/event/portfolio", "make me a homepage", or any request involving building a new web project. Do not use for modifying existing app code or building components within a framework project.
---

# Web Site Creation Flow

End-to-end process: requirements gathering, design decisions, implementation, preview, and deployment.

## Step 1: Multi-Round Requirements Gathering

Before writing any code, gather requirements through **multiple rounds** of progressively deeper questions. The number of rounds is not fixed -- it depends on project complexity. Each round focuses on a theme and ends with a gate question that lets the user decide whether to continue or jump straight to implementation.

**Rules for every round:**

- Use the `question` tool to ask **all questions in that round in a single call** (5-6 questions per round is ideal)
- Skip any question the user already answered in their request
- At the start of each round, briefly tell the user: (1) what this round covers, (2) what upcoming rounds you have in mind
- The **last question** of every round must be the **gate question** (see below)
- If the user selects "Don't ask more -- go build it" at any point, stop asking and proceed to Step 2, filling gaps with sensible defaults

### Gate Question (last question of every round)

- Header: "Next step"
- Question: "What else should we nail down? (I'll keep asking focused rounds)"
- Options (adapt based on what rounds remain and what the user might need):
  - 1-2 suggested next-round topics, e.g. "Page features & interactions", "Data model & backend design", "Visual design & style"
  - "Something else (I'll describe)"
  - "Don't ask more -- go build it (fill in the blanks yourself)"

### Round 1 -- Basics & Direction

**Intro message example:** "Let me first understand the big picture. After this round I'll follow up with more focused rounds on features, backend, and design -- you can skip ahead at any time."

Question categories:

#### Page Purpose

- Header: "Page type"
- Examples: Landing/marketing page, Restaurant/cafe/bar, Personal portfolio, Event/invitation, Product showcase, Business homepage, Coming soon, Blog/article, Web app with data

#### Target Audience & Context

- Header: "Audience"
- Who will visit this page? What's the primary action you want them to take?
- Examples: Potential customers browsing on mobile, Hiring managers reviewing a portfolio, Friends/family receiving an invitation, General public discovering a product

#### Branding & Identity

- Header: "Branding"
- Ask if the user has: business/project name, tagline, brand colors, logo, existing domain
- If not provided, invent contextually appropriate ones during implementation

#### Available Materials

- Header: "Materials"
- What can you provide? (multi-select)
- Examples: Written copy/text content, Product photos/images, Logo files, Brand guidelines, Reference sites for inspiration, Nothing yet -- generate everything

#### Content Language

- Header: "Language"
- What language should the page content be in?
- Examples: English, Chinese (Simplified), Chinese (Traditional), Japanese, Multi-language

#### Gate Question

Suggest next rounds based on what seems needed. Typical suggestions: "Page features & interactions", "Data & backend design", "Visual design & style".

### Round 2+ -- Dynamic Follow-Up Rounds

After Round 1, plan subsequent rounds based on the project's needs. **Do not use a fixed list of rounds.** Instead, assess what the project requires and propose rounds accordingly.

Below is a **library of round templates**. Pick the ones relevant to the project, reorder them, combine them, or invent new ones as needed. Each template lists example question categories -- use 5-6 per round.

---

#### Template: Page Features & Interactions

When to use: Almost always (unless the project is trivially simple).

- **Sections** -- What sections should the page have? (Hero, About, Features, Testimonials, Pricing, Team, FAQ, Footer, etc.)
- **Key Features** (multi-select) -- Dark/light theme toggle, Contact form, Image gallery/carousel, Scroll animations, Map embed, Social links, Search/filter, Admin panel
- **Forms & Input** -- What forms are needed? What data do they collect? (Contact, newsletter, reservation, RSVP, login/register, none)
- **Domain-Specific Features** -- Tailor to the page type:
  - Restaurant: menu display, reservation, hours/location, cuisine type
  - Portfolio: work categories, case study format, resume download
  - Event: date/venue, RSVP/ticketing, countdown, schedule
  - E-commerce: product cards, cart, checkout
  - Blog: categories, author profiles, comments
- **Content Management** -- All static/hardcoded, or does the owner need to update content? (Menu/catalog updates, blog feed, user-generated content, real-time data)

---

#### Template: Data Model & Backend Design

When to use: When the user selected any backend need beyond "static page only" in Round 1.

- **Data Entities** -- What are the main things the system stores? (e.g. menu items, reservations, blog posts, user profiles) Ask the user to describe them or confirm your inferred list.
- **Relationships** -- How do entities relate? (e.g. a user has many posts, a menu item belongs to a category)
- **Access Patterns** -- Who reads/writes what? Public read vs. admin write? User-specific data?
- **Auth Requirements** -- No auth, simple admin password, full user accounts, OAuth providers?
- **API Surface** -- What endpoints are needed? Confirm the CRUD operations you plan to build.
- **Storage Choice** -- Confirm: D1 (structured data), KV (simple key-value), R2 (file uploads), Durable Objects (real-time)

---

#### Template: Visual Design & Style

When to use: Almost always. **Before asking these questions, load the design skill reference table (see "Design Skill Loading" below) and read the most likely matching design skill file.** Use the design skill's vocabulary, principles, and specific options to craft more informed questions.

- **Visual Style** -- Minimalist/clean, Bold/brutalist, Soft/organic, Luxury/refined, Playful/colorful, Editorial/magazine, Retro/vintage, Dark/moody. If you've loaded a design skill, offer its specific sub-styles as options.
- **Color Direction** -- Warm earthy (beige/terracotta/olive), Cool neutrals (slate/steel/blue-gray), Monochrome, Vibrant saturated, Soft pastels, Dark base with bright accent
- **Content Tone** -- Formal/professional, Friendly/approachable, Edgy/cool, Playful/fun, Poetic/atmospheric, Minimal/let-visuals-speak
- **Animation Level** -- Static/clean (hover only), Subtle polish (fade-ins, smooth transitions), Rich (scroll reveals, parallax, staggered entrances), Highly dynamic (3D, complex interactions)
- **Typography Preference** -- Classic serif headings + sans body, All sans-serif/geometric, Monospace/technical, Display/decorative headings, No preference (let me decide)
- **Reference & Inspiration** -- Any websites or designs to reference? Specific URLs, general descriptions ("like Apple's product pages"), or screenshots

---

#### Template: Technical Details

When to use: For complex projects, or when the user explicitly wants to discuss hosting, performance, or SEO.

- **SEO Requirements** -- Meta tags, Open Graph, structured data, sitemap
- **Performance Targets** -- Fast first paint, image optimization, lazy loading, CDN strategy
- **Analytics** -- Google Analytics, Plausible, Cloudflare Analytics, none
- **Domain & Hosting** -- Custom domain, Cloudflare Pages, Workers deployment
- **Accessibility** -- WCAG level target, screen reader testing, keyboard navigation depth

---

### Design Skill Loading

Before asking visual design questions, load the relevant design skill to inform your questions with specific terminology and options from that skill.

| User's likely style direction | Skill to load | What it provides |
|---|---|---|
| Minimalist / clean | `minimalist-skill` | Warm monochrome, typographic contrast, flat bento grids, no gradients or heavy shadows |
| Luxury / refined / high-end | `soft-skill` | Agency-grade fonts, spacing, shadows, card structures, animations that feel expensive |
| Bold / brutalist / industrial | `brutalist-skill` | Swiss type + military terminal aesthetic, rigid grids, extreme contrast, analog degradation |
| Any style (general quality) | `frontend-design` | Distinctive, production-grade interfaces avoiding generic AI aesthetics |
| Any style (technical rigor) | `taste-skill` | Metric-based design rules, strict component architecture, CSS hardware acceleration |
| Redesign of existing page | `redesign-skill` | Audits current design, identifies generic patterns, applies high-end standards |

**How to use:**

1. After Round 1, if the user gave any style hints (e.g. "clean", "dark", "luxury"), load the matching skill **before** composing the design round questions
2. If no style hint yet, load `frontend-design` as the default and use it to craft informed style options
3. Use the loaded skill's specific vocabulary in your question options (e.g. if `brutalist-skill` mentions "Swiss type + military terminal", offer that as a concrete option)
4. Multiple skills can be combined during implementation (e.g. `taste-skill` for technical rigor + `soft-skill` for aesthetic direction)

### Adaptive Questioning

- Tailor questions to the request. User says "restaurant page" -> include cuisine/menu/reservation in the features round. User says "portfolio" -> include work categories and contact. User says "event" -> include date/venue and RSVP.
- If the user already specified style ("dark minimalist portfolio"), skip those questions in the design round.
- If the user provides very detailed initial requirements, compress or skip rounds.
- If the gate question reveals the user wants to discuss a topic not covered by any template, create an ad-hoc round for that topic.
- For simple projects (e.g. "make me a coming soon page"), two rounds (basics + design) may be enough. For complex apps, four or five rounds may be appropriate.

The goal: after all rounds complete (or the user opts out), every major fork is resolved. Gaps left by early opt-out should be fillable with sensible defaults.

## Step 2: Design Blueprint

Synthesize all gathered answers into a brief blueprint. Present it to the user before coding so they can course-correct.

1. **Palette** -- primary, secondary, accent, background, surface, text (as CSS custom properties with hex values)
2. **Typography** -- display font + body font (from Google Fonts), size scale, weight choices
3. **Sections** -- ordered list of page sections with rough content description (e.g. "Hero: full-bleed image with overlaid headline and CTA")
4. **Motion plan** -- specific techniques to use (e.g. "intersection-observer fade-up on scroll for feature cards")
5. **Tech stack** -- static HTML or Hono + Workers; which CF bindings (D1/KV/DO) if any; data model summary
6. **Technical notes** -- theme toggle approach, form handling method, any external dependencies

Keep the blueprint to 10-15 lines. This is a checkpoint, not a spec document.

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
