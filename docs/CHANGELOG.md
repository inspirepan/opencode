# Dandelion Fork Changelog

> Tracks all modifications made on top of upstream `opencode` (`dev` branch).
> Use this when resolving merge conflicts with upstream to understand what we changed and why.

---

## 2026-03-25 — Initial Dandelion transformation

Base: upstream `dev` @ `9a64bdb5` (fix: beta resolver typecheck + build smoke check)

### Commit `ff8d8786` — feat(dandelion): auto-open fixed workspace on startup

**Intent:** Skip the project picker on launch. Auto-create and navigate to a fixed workspace directory so non-technical users land directly in a chat session.

| File | Change |
|------|--------|
| `packages/desktop-electron/src/main/index.ts` | Add `mkdirSync` for workspace dir on startup; pass path via globals; register IPC handler |
| `packages/desktop-electron/src/main/ipc.ts` | Add `getDandelionWorkspace` to IPC deps and handler |
| `packages/desktop-electron/src/main/windows.ts` | Add `dandelionWorkspaces` to `Globals` type; inject via `window.__OPENCODE__` |
| `packages/desktop-electron/src/preload/index.ts` | Compute workspace path synchronously via `os.homedir()`; expose via `contextBridge` as `window.__DANDELION__` |
| `packages/desktop-electron/src/preload/types.ts` | Add `getDandelionWorkspace` to `ElectronAPI` |
| `packages/desktop-electron/src/renderer/env.d.ts` | Declare `window.__DANDELION__` type |
| `packages/desktop-electron/src/renderer/index.tsx` | Read `window.__DANDELION__` and set `platform.dandelion` |
| `packages/app/src/app.tsx` | Extend `window.__OPENCODE__` global type |
| `packages/app/src/context/platform.tsx` | Add `dandelion` property to `Platform` type |
| `packages/app/src/pages/home.tsx` | Auto-redirect to dandelion workspace instead of showing project picker |
| `packages/app/src/pages/layout.tsx` | Autoselect uses fixed workspace; hide project header in sidebar |

### Commit `7e3968a4` — chore: add implementation plan and gitignore build artifacts

| File | Change |
|------|--------|
| `docs/plans/2026-03-25-simple-ai-desktop.md` | Added: full transformation plan document |
| `.gitignore` | Added: `packages/opencode/src/provider/models-snapshot.js` (predev build artifact) |
| `packages/opencode/src/provider/models-snapshot.d.ts` | Added: type declaration for build-generated model snapshot |

### Commit `5117e3f1` — feat(dandelion): dual workspace tabs, chat agent, and UI cleanup

**Intent:** Two workspace modes (Chat / Agent) as tabs in the titlebar. Each mode has its own session list. Chat mode uses a dedicated no-tools agent. UI cleaned up: sidebar rail removed, search bar hidden, settings moved to titlebar.

| File | Change |
|------|--------|
| `packages/app/src/context/platform.tsx` | Refactor `defaultWorkspace: string` → `dandelion: { workspaces: { chat, agent } }` |
| `packages/app/src/components/titlebar.tsx` | Add Chat/Agent tab buttons with icons and i18n; hide center portal (search); show settings gear on right; import `base64Encode`, `decode64` |
| `packages/app/src/components/prompt-input.tsx` | Detect chat mode via `sdk.directory`; auto-select `chat` agent; hide agent selector in chat mode |
| `packages/app/src/pages/layout.tsx` | Skip sidebar rail in dandelion mode (render panel directly); adjust `side()`/`panel()` widths (no rail); fix `--main-left` and border offsets; open both workspaces on autoselect |
| `packages/app/src/pages/home.tsx` | Update redirect to use `dandelion.workspaces.agent` |
| `packages/app/src/i18n/en.ts` | Add `dandelion.mode.chat`, `dandelion.mode.agent` |
| `packages/app/src/i18n/zh.ts` | Add `dandelion.mode.chat` (聊天), `dandelion.mode.agent` (智能体) |
| `packages/desktop-electron/src/main/index.ts` | Two workspace dirs: `~/.dandelion/spaces/{chat,agent}/`; create both on startup |
| `packages/desktop-electron/src/main/ipc.ts` | Return type updated to `{ chat, agent }` |
| `packages/desktop-electron/src/main/windows.ts` | Globals type updated to `dandelionWorkspaces` |
| `packages/desktop-electron/src/preload/index.ts` | Expose both workspace paths |
| `packages/desktop-electron/src/preload/types.ts` | Return type updated |
| `packages/desktop-electron/src/renderer/env.d.ts` | Type updated for dual workspaces |
| `packages/desktop-electron/src/renderer/index.tsx` | Pass `dandelion.workspaces` to platform |
| `packages/opencode/src/agent/agent.ts` | Add `chat` agent: `mode: "primary"`, `"*": "deny"` permissions, custom prompt |
| `packages/opencode/src/agent/prompt/chat.txt` | Added: chat agent system prompt (friendly conversation, no tools) |

---

## Files touched (summary)

Quick reference of all files modified from upstream, grouped by package:

### `packages/app/`
- `src/app.tsx` — `window.__OPENCODE__` type extension; `PreviewProvider`
- `src/context/platform.tsx` — `Platform.dandelion` type
- `src/context/preview.tsx` — preview data store; `previewTab()`/`previewPath()` helpers
- `src/components/titlebar.tsx` — dandelion tabs with sliding segmented control, hide portals, settings button
- `src/components/session-context-usage.tsx` — unified context tab toggle (no dandelion branch)
- `src/components/prompt-input.tsx` — chat mode detection, agent auto-switch, hide agent selector, variant descriptions
- `src/components/dialog-select-model.tsx` — enlarged popover, provider icons
- `src/pages/home.tsx` — auto-redirect to dandelion workspace
- `src/pages/layout.tsx` — autoselect, sidebar rail skip, width adjustments, project header hide
- `src/pages/session.tsx` — present_file detection, preview+tab sync, mobile preview fallback, external file handling
- `src/pages/session/session-side-panel.tsx` — unified tab system for preview/context/review; open-in-new-window for PDF
- `src/pages/session/preview-tab.tsx` — iframe preview with PDF (pdf.js), Markdown, SVG, Mermaid support
- `src/pages/session/helpers.ts` — `activeTab` supports `preview://` tabs
- `src/i18n/en.ts` — dandelion + variant i18n keys
- `src/i18n/zh.ts` — dandelion + variant i18n keys (Chinese)

### `packages/ui/`
- `src/components/logo.tsx` — dandelion seed SVG
- `src/components/message-part.tsx` — `present_file` tool renderer with clickable filename
- `src/components/list.css` — sticky group header gradient fix
- `src/components/select.css` — dropdown max-height increase
- `src/i18n/en.ts` — `ui.tool.present` translation
- `src/i18n/zh.ts` — `ui.tool.present` translation (Chinese)

### `packages/desktop-electron/`
- `src/main/index.ts` — workspace creation, globals, IPC
- `src/main/ipc.ts` — getDandelionWorkspace handler
- `src/main/windows.ts` — globals type and injection
- `src/preload/index.ts` — synchronous workspace path exposure
- `src/preload/types.ts` — ElectronAPI type
- `src/renderer/env.d.ts` — window type declarations
- `src/renderer/index.tsx` — platform dandelion setup

### `packages/opencode/`
- `src/agent/agent.ts` — chat agent definition
- `src/agent/prompt/chat.txt` — chat agent system prompt
- `src/tool/present.ts` — present_file tool (HTML, SVG, PDF, PPTX)
- `src/tool/present.txt` — tool description
- `src/tool/registry.ts` — register PresentTool

### Root
- `.gitignore` — models-snapshot.js
- `Makefile` — test orchestration targets
- `CLAUDE.md` — testing commands, dandelion mode notes
- `docs/plans/2026-03-25-simple-ai-desktop.md` — transformation plan

---

## 2026-03-26 — Preview panel and present tool

### feat(dandelion): preview panel replaces review tab; new `present` tool

**Intent:** Transform the right-side panel from a code review/diff viewer into a visual preview panel for office assistant mode. AI can now present HTML files to the user via a `present` tool, rendered live in an iframe.

#### Changes

### `packages/opencode/`
- `src/tool/present.ts` — **Added:** `present` tool definition (reads file, returns content for preview; supports `.html`, `.htm`, `.svg`)
- `src/tool/present.txt` — **Added:** tool description/prompt
- `src/tool/registry.ts` — Register `PresentTool` in the tool list

### `packages/app/`
- `src/context/preview.tsx` — **Added:** preview context (stores multiple presented items with close support, tracks active preview)
- `src/pages/session/preview-tab.tsx` — **Added:** preview tab component (iframe with srcdoc, open-in-new-window)
- `src/pages/session/session-side-panel.tsx` — In dandelion mode: multi-tab preview (each presented file gets its own closable tab), hide file tree, hide file/context tabs
- `src/pages/session/session-header.tsx` — In dandelion mode: hide terminal toggle, hide file tree toggle, repurpose review toggle as preview toggle
- `src/pages/session.tsx` — In dandelion mode: hide terminal panel; add effect to detect `present` tool completions and push to preview context
- `src/app.tsx` — Add `PreviewProvider` to `SessionProviders`
- `src/i18n/en.ts` — Add dandelion preview i18n keys
- `src/i18n/zh.ts` — Add dandelion preview i18n keys (Chinese)

### `packages/ui/`
- `src/components/message-part.tsx` — Register `present` tool renderer (BasicTool with open-file icon)
- `src/i18n/en.ts` — Add `ui.tool.present` translation
- `src/i18n/zh.ts` — Add `ui.tool.present` translation (Chinese)

### feat(dandelion): add PDF support to present_file and clean up

**Intent:** Extend `present_file` to handle PDF files. PDFs are read as binary, base64-encoded in metadata, and rendered client-side. Mermaid diagram background set to transparent.

| File | Change |
|------|--------|
| `packages/opencode/src/tool/present.ts` | Add `.pdf` to supported types; binary reading path with base64 encoding; 20MB limit for binary files; `binary` flag in metadata |
| `packages/opencode/src/tool/present.txt` | Document PDF support and all supported file types |
| `packages/app/src/context/preview.tsx` | Add `binary?: boolean` to `PreviewItem` type |
| `packages/app/src/pages/session/preview-tab.tsx` | PDF rendering via blob URL; Mermaid `transparent: true`; conditional iframe for PDF vs srcdoc |
| `packages/app/src/pages/session.tsx` | Pass `binary` flag through present_file detection |

### feat(dandelion): support PPTX/PPT via system default application

**Intent:** PPTX/PPT files cannot be rendered in-browser. Instead, `present_file` marks them as `external` and the frontend calls `platform.openPath()` to open with the system default app (Keynote, PowerPoint, etc.).

| File | Change |
|------|--------|
| `packages/opencode/src/tool/present.ts` | Add `.pptx`/`.ppt` to supported types; `EXTERNAL_EXTS` set; return `external: true` in metadata; `external` field on all branches |
| `packages/opencode/src/tool/present.txt` | Document PPTX/PPT support |
| `packages/app/src/pages/session.tsx` | Detect `external` flag and call `platform.openPath()` instead of pushing to preview |

### feat(dandelion): use pdf.js for modern PDF preview rendering

**Intent:** Replace Chromium's built-in PDF viewer (gray toolbar, non-customizable) with pdf.js canvas rendering for a modern page-by-page viewer (white cards, soft shadows, page numbers on light gray background).

| File | Change |
|------|--------|
| `packages/app/package.json` | Add `pdfjs-dist@4.10.38` (v4.x for Electron Chromium compatibility) |
| `packages/app/src/pages/session/preview-tab.tsx` | `renderPdfPages()`: pdf.js renders each page to canvas at 2x scale, exports as PNG data URI; `slidesHtml()`: assembles claude.ai-style page viewer; load worker via Vite `?url` import |

### feat(dandelion): make present_file filename clickable to open preview

**Intent:** The filename shown in the `present_file` tool call display should be clickable to open/switch the preview panel, matching the pattern used by the `task` tool for session links.

| File | Change |
|------|--------|
| `packages/ui/src/components/message-part.tsx` | Custom trigger JSX for `present_file` (like `task` tool); subtitle as `<span class="clickable">` with `onClick`; dispatches `present-file-click` CustomEvent |
| `packages/app/src/pages/session.tsx` | Listen for `present-file-click` event; open preview panel or call `platform.openPath()` for external files; cleanup on unmount |

### refactor(dandelion): unify right panel tab system

**Intent:** Dandelion mode had a separate tab system (`preview.active()` / `preview.setActive()`) that conflicted with the upstream `layout.tabs`. This caused the titlebar toggle button, context usage button, and tab switching to all break. Unify both modes under a single `layout.tabs` system.

**Architecture change:** Preview items now use `preview://path` tab keys (like `file://path` for file tabs). The preview context only stores data (content/ext); all tab state (open/close/active) is managed by `layout.tabs`. The dandelion-specific `createEffect` that forced panel open/close is removed.

| File | Change |
|------|--------|
| `packages/app/src/context/preview.tsx` | Remove `active`/`setActive`/`current`; add `get(path)` lookup; export `previewTab()` and `previewPath()` helpers for `preview://` prefix |
| `packages/app/src/pages/session/helpers.ts` | `createSessionTabs.activeTab`: support non-file tabs in `openedTabs` (e.g. `preview://`) |
| `packages/app/src/pages/session/session-side-panel.tsx` | Remove dandelion effect and forked `Tabs value/onChange`; unified `activeTab()` for both modes; preview tabs rendered from `openedTabs()` with `previewPath()` |
| `packages/app/src/components/session-context-usage.tsx` | Remove dandelion-specific branch; both modes use same `openSessionContext` path |
| `packages/app/src/pages/session/preview-tab.tsx` | Accept `path` prop; look up item via `preview.get(path)` instead of `preview.current()` |
| `packages/app/src/pages/session.tsx` | After `preview.present()`, also call `tabs().open(previewTab(...))` + `tabs().setActive(...)` |

### chore: add Makefile and CLAUDE.md for test orchestration

**Intent:** Provide a single `make test` entry point so agents and developers can run all checks (typecheck, unit, e2e) without remembering per-package commands. Document testing workflow and dandelion mode in CLAUDE.md.

| File | Change |
|------|--------|
| `Makefile` | **Added:** targets `check`, `test`, `test-e2e`, `test-all` |
| `CLAUDE.md` | **Added:** testing commands, dandelion mode notes for agent context |

### Commit `2b8915fe` — feat(ui): replace logo with dandelion seed SVG

**Intent:** Replace the default opencode logo with a dandelion seed icon across Mark, Splash, and Logo exports.

| File | Change |
|------|--------|
| `packages/ui/src/components/logo.tsx` | Replace all three SVG exports with dandelion seed paths; extract shared `Seed` component |

### Commit `b62cddb5` — feat(dandelion): replace mode switch buttons with sliding segmented control

**Intent:** Improve the Chat/Agent mode switcher in the titlebar from plain buttons to a polished segmented control with a sliding indicator.

| File | Change |
|------|--------|
| `packages/app/src/components/titlebar.tsx` | Segmented control with sliding indicator via refs; `bg-background-stronger` container; 200ms position transition |

### Commit `ce6ae225` — fix(dandelion): hide empty preview panel and use PreviewTab on mobile

**Intent:** Desktop: don't show the preview side panel when there are no items. Mobile: replace git review content with PreviewTab in dandelion mode.

| File | Change |
|------|--------|
| `packages/app/src/pages/session/session-side-panel.tsx` | Auto-close review panel when no preview items (dandelion desktop) |
| `packages/app/src/pages/session.tsx` | Mobile: rename "changes" to "preview" tab; swap review content for `<PreviewTab />` |

### Commit `3a3aea28` — fix(dandelion): decode base64 PDF before opening in new window

**Intent:** Fix "open in new window" for PDF previews — base64 content needs to be decoded to a binary Blob before creating an object URL.

| File | Change |
|------|--------|
| `packages/app/src/pages/session/session-side-panel.tsx` | Detect binary PDF; decode base64 to `Uint8Array`; create Blob with `application/pdf` mime |

### Commit `85537da0` — feat(dandelion): polish model selector and variant dropdown UI

**Intent:** Improve model/variant selection UX: hide agent selector in all dandelion modes, add descriptive variant options, enlarge model selector popover, add provider icons.

| File | Change |
|------|--------|
| `packages/app/src/components/dialog-select-model.tsx` | Double popover height (h-80 -> h-160, capped at 70vh); add provider icons to model list items |
| `packages/app/src/components/prompt-input.tsx` | Hide agent selector in all dandelion modes; two-line variant options with i18n descriptions |
| `packages/app/src/i18n/en.ts` | Add variant description i18n keys |
| `packages/app/src/i18n/zh.ts` | Add variant description i18n keys (Chinese) |
| `packages/ui/src/components/list.css` | Fix sticky group header gradient overlap (16px -> 6px) |
| `packages/ui/src/components/select.css` | Increase dropdown max-height (12rem -> 20rem) |

### Commit `e2a5c091` — refactor(dandelion): unify right panel tab system

**Intent:** Dandelion mode had a separate tab system (`preview.active()` / `preview.setActive()`) that conflicted with the upstream `layout.tabs`. Unify both modes under a single `layout.tabs` system so the titlebar toggle, context usage button, and tab switching all work correctly.

| File | Change |
|------|--------|
| `packages/app/src/context/preview.tsx` | Remove `active`/`setActive`/`current`; add `get(path)` lookup; export `previewTab()`/`previewPath()` helpers |
| `packages/app/src/pages/session/helpers.ts` | `activeTab`: support non-file tabs in `openedTabs` (e.g. `preview://`) |
| `packages/app/src/pages/session/session-side-panel.tsx` | Remove dandelion effect and forked Tabs value; unified `activeTab()` for both modes |
| `packages/app/src/components/session-context-usage.tsx` | Remove dandelion-specific branch; both modes use same `openSessionContext` path |
| `packages/app/src/pages/session/preview-tab.tsx` | Accept `path` prop; look up item via `preview.get(path)` |
| `packages/app/src/pages/session.tsx` | After `preview.present()`, sync with `tabs().open(previewTab(...))` + `tabs().setActive(...)` |

---

## 2026-03-27 — Bug fixes

### fix(app): stop slash popover Enter from falling through to submit

**Intent:** Fix blank-page crash when selecting a custom slash command (skill/mcp) by pressing Enter. This is an upstream bug — the popover keydown handler calls `closePopover()` which synchronously sets `store.popover = null` via SolidJS reactive updates. SolidJS's event delegation then re-enters `handleKeyDown` where the popover guard no longer protects, so the Enter falls through to `handleSubmit`, creating an unintended session/command send.

**Note:** Upstream `dev` has the same bug (the Escape handler already uses `stopPropagation` but the nav/Enter branches do not). This fix adds `stopPropagation()` to all popover keydown exit paths, matching the Escape pattern.

| File | Change |
|------|--------|
| `packages/app/src/components/prompt-input.tsx` | Add `event.stopPropagation()` to Tab, at-popover Enter, and slash-popover Enter branches inside the `if (store.popover)` block |
