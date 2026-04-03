---
name: web-page
description: Build complete, standalone web pages from scratch. Use when the user asks to create a web page, website, landing page, portfolio, menu page, product page, event page, or any single-page web project. Triggers include "make a web page", "build a website", "create a landing page", "design a page for my restaurant/business/event/portfolio", "make me a homepage", or any request involving building a new HTML page. Do not use for modifying existing app code or building components within a framework project.
---

# Web Page Creation Flow

End-to-end process: requirements gathering, design decisions, implementation, preview, and deployment suggestion.

## Step 1: Fork-Point Questionnaire

Before writing any code, identify decisions that would dramatically change the result. Use the `question` tool to ask about all of them **in a single call**. These are "fork points" -- choices that directly determine visual direction, copy voice, interaction model, and technical structure.

Design the questionnaire around these categories. Skip any question the user already answered in their request.

### 1.1 Page Purpose (determines layout, content blocks, feature set)

- Header: "Page type"
- Examples: Landing/marketing page, Restaurant/cafe/bar, Personal portfolio, Event/invitation, Product showcase, Business homepage, Coming soon, Blog/article

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

### 1.6 Key Features (multi-select -- adds functional/technical requirements)

- Header: "Features"
- Set `multiple: true`
- Examples: Dark/light theme toggle, Contact or inquiry form, Image gallery or carousel, Scroll-triggered animations, Map/location embed, Multi-language, Social links

### 1.7 Branding (captures identity details that must appear in the final page)

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
5. **Technical notes** -- theme toggle approach, form handling method, any external dependencies

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

Choose the lightest format that covers the complexity:

- **Single HTML file** -- for simple pages (landing, coming soon, event). All CSS/JS inline, Google Fonts via `<link>`. Preview and deploy are trivial.
- **Multi-file project with UI library** -- for anything with forms, theme toggle, gallery, multiple sections with complex interactions. Use a mature UI component library to avoid hand-rolling fragile UI. Preferred stacks (pick one based on context):
  - Tailwind CSS + vanilla JS/Alpine.js (lightweight, no build step needed)
  - React/Next.js + Tailwind + shadcn/ui or Radix (when interactivity demands it)
  - Vue + UnoCSS or Tailwind (if user prefers Vue)

When using a UI library, prefer its built-in components (form inputs, modals, selects, toasts) over hand-crafted equivalents -- they handle edge cases (a11y, keyboard, focus trap) that hand-rolled code misses.

### Default Product Stance

These defaults apply unless the user explicitly asks otherwise:

**Usability over spectacle.** The core path (read info -> interact -> submit) must be smooth and uninterrupted. Decorative effects should not compete with the primary flow.

**Mobile-first.** Design for phone screens first, expand to desktop. Use `min-width` media queries. Full-height sections use `min-h-[100dvh]`, not `h-screen` (iOS Safari viewport bug).

**No backend, graceful fallback.** When there's no server, use `localStorage` for persistence, front-end simulated submission with clear feedback (success toast / inline confirmation). Never fake an API endpoint.

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

### Form (if selected in Step 1)

- Use UI library form components when available (input, select, textarea, validation)
- Client-side validation: required/format/range, with friendly inline error messages
- Clear success feedback (in-page confirmation, not a redirect)
- No backend: `localStorage` save + success state, or `mailto:` link, or mention Formspree/Cloudflare Workers
- Ask during questionnaire how submissions should be handled if this is a key fork

## Step 4: Preview

After building the page, **immediately** use `present_file` to show it to the user:

- Single HTML file: `present_file` the `.html` file directly
- Multi-file project: build first if needed, then `present_file` the output `index.html`

This renders a live preview in the preview panel. Ask if the user wants adjustments. Iterate until satisfied.

## Step 5: Deployment Suggestion

Once the user approves the result:

1. Mention the page can be opened locally in any browser
2. Recommend deploying to **Cloudflare Pages** for a public URL -- use the `cloudflare-deploy` skill to handle it
3. Prompt: "Want me to deploy this to Cloudflare Pages so you get a shareable URL?"

For single HTML files: put the file in a directory as `index.html`, then `wrangler pages deploy <directory>`.
For multi-file projects: deploy the build output directory directly.
