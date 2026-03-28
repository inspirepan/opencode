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
- `src/pages/directory-layout.tsx` — pass `serverUrl` to `DataProvider`
- `src/pages/session.tsx` — present_file detection, preview+tab sync, mobile preview fallback, external file handling
- `src/pages/session/session-side-panel.tsx` — unified tab system for preview/context/review; open-in-new-window for PDF
- `src/pages/session/preview-tab.tsx` — iframe preview with PDF (pdf.js), Markdown, SVG, Mermaid support
- `src/pages/session/helpers.ts` — `activeTab` supports `preview://` tabs
- `src/i18n/en.ts` — dandelion + variant i18n keys
- `src/i18n/zh.ts` — dandelion + variant i18n keys (Chinese)

### `packages/ui/`
- `src/components/logo.tsx` — dandelion seed SVG
- `src/components/message-part.tsx` — `present_file` tool renderer with clickable filename; `file` part renderer for generated images
- `src/components/message-part.css` — `file-part` image styles
- `src/components/image-preview.tsx` — download button support
- `src/context/data.tsx` — `serverUrl` prop for media URL resolution
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
- `src/provider/transform.ts` — `responseModalities` for image-capable Google/Vertex models
- `src/session/media.ts` — media file storage module
- `src/session/processor.ts` — `file` event handler for model image output
- `src/server/routes/session.ts` — media file serving endpoint
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

### Commit `7a9b28b0` — feat(dandelion): auto-close right panel when last tab is closed

**Intent:** In dandelion mode, closing the last tab (preview or context) in the right panel should auto-close the panel itself. Three close paths needed to be covered: X button click, middle-click, and Cmd+W keyboard shortcut.

| File | Change |
|------|--------|
| `packages/app/src/pages/session/session-side-panel.tsx` | Preview tab close: add `view().reviewPanel.close()` when `openedTabs` is empty and context not open; Context tab close (onClick + onMiddleClick): add same check gated behind `dandelion()` |
| `packages/app/src/pages/session/use-session-commands.tsx` | `tab.close` command (Cmd+W): add auto-close panel check gated behind `platform.dandelion` |

### style(ui): remove redundant underline from active review panel tabs

**Intent:** Active tabs in the right panel had both a pill background and a bottom underline indicator, which is visually redundant. Remove the underline to keep only the pill background, consistent with the file tree panel's pill tab style.

| File | Change |
|------|--------|
| `packages/ui/src/components/tabs.css` | Remove `&::after { opacity: 1; transform: scaleX(1) }` from `#review-panel` selected tab; remove `::after` underline from drag preview |

### feat: image generation pipeline (Gemini file output)

**Intent:** Full pipeline for model-generated images: backend stores images to disk instead of embedding base64 in SQLite, serves them via HTTP endpoint, and frontend renders them inline in chat with click-to-preview and download.

| File | Change |
|------|--------|
| `packages/opencode/src/provider/transform.ts` | In `options()`: add `responseModalities: ["TEXT", "IMAGE"]` for Google/Vertex models with `capabilities.output.image`; set `includeThoughts: true` but skip `thinkingLevel`/`thinkingBudget` for image models (not supported). In `variants()` and `smallOptions()`: return empty for image models |
| `packages/opencode/src/session/media.ts` | **Added:** `Media` module — writes image files to `Global.Path.data/media/<sessionID>/`, returns relative HTTP URL |
| `packages/opencode/src/session/processor.ts` | Add `case "file":` handler in `fullStream` switch — saves via `Media.save()`, persists `FilePart` with relative URL; skip thought/sketch images by stream position (reasoning phase before content) |
| `packages/opencode/src/server/routes/session.ts` | Add `GET /:sessionID/media/:filename` endpoint — serves image files with proper Content-Type and immutable caching |
| `packages/opencode/src/server/server.ts` | Exempt `/media/` paths from basic auth — `<img src>` cannot send Authorization headers |
| `packages/ui/src/context/data.tsx` | Add optional `serverUrl` prop to `DataProvider` for constructing media URLs |
| `packages/ui/src/components/message-part.tsx` | Register `PART_MAPPING["file"]` — renders image `FilePart` inline in assistant messages; click opens `ImagePreview` with download |
| `packages/ui/src/components/message-part.css` | Add `[data-component="file-part"]` styles (max-width, border-radius, cursor) |
| `packages/ui/src/components/image-preview.tsx` | Add `download` prop; when set, shows download button in header |
| `packages/app/src/pages/directory-layout.tsx` | Pass `serverUrl` from `useServer()` into `DataProvider` |

### fix: Gemini thought image filtering and image model reasoning controls

**Intent:** Two fixes for Gemini image generation:
1. **Thought image filter was broken** — the `file` stream event from AI SDK has no `providerMetadata`, so the old check `providerMetadata?.google?.thought === true` never fired. Replace with stream-position heuristic: skip `file` events that arrive during the reasoning phase (after `reasoning-start`, before any `text-start`/`tool-call`).
2. **Image models don't support reasoning intensity** — Gemini image models (e.g. `gemini-3-pro-image-preview`) accept `includeThoughts: true` but reject `thinkingLevel`/`thinkingBudget`. Remove intensity controls from `options()`, `variants()`, and `smallOptions()` for image-capable models.

| File | Change |
|------|--------|
| `packages/opencode/src/session/processor.ts` | Replace broken `providerMetadata` check with `thinking && !content` state tracking; add `thinking`/`content` flags set by `reasoning-start`, `text-start`, `tool-call`, reset on `start-step` |
| `packages/opencode/src/provider/transform.ts` | `options()`: keep `includeThoughts: true` but skip `thinkingLevel` for image models; `variants()`: return `{}` for image models; `smallOptions()`: return `{}` for image models |

### feat(app): image generation tag on model selector + inject missing model

**Intent:** Show a "Image Gen" / "图片生成" tag on image-capable models in the model selector list. Also inject `gemini-3-pro-image-preview` which is missing from models.dev (pending upstream PR).

| File | Change |
|------|--------|
| `packages/app/src/components/dialog-select-model.tsx` | Show `<Tag>` for models with `capabilities.output.image`; widen popover from `w-72` to `w-96`; add `min-w-0` on name span for proper truncation |
| `packages/app/src/i18n/en.ts` | Add `model.tag.image: "Image Gen"` |
| `packages/app/src/i18n/zh.ts` | Add `model.tag.image: "图片生成"` |
| `packages/opencode/src/provider/provider.ts` | Add `PENDING_MODELS` array to inject models missing from models.dev; inject `gemini-3-pro-image-preview` with correct specs |

---

## 2026-03-27 — Archived sessions viewer

### feat: view and restore archived sessions in sidebar

**Intent:** Archived conversations were invisible after archiving -- no way to view or restore them. Add an "Archived" button pinned at the bottom of the sidebar panel. Users can click it to see archived sessions and click unarchive to restore them. Also swap the idle session icon to `circle-check` in dandelion mode.

| File | Change |
|------|--------|
| `packages/opencode/src/session/index.ts` | `setArchived`: use `?? null` so `undefined` correctly sets `time_archived = NULL` in DB (enables unarchive) |
| `packages/opencode/src/server/routes/session.ts` | Session update route: convert `archived: 0` to `undefined` via `\|\| undefined` so sending `0` triggers unarchive |
| `packages/app/src/pages/layout/sidebar-workspace.tsx` | Add exported `ArchivedSection` component: archive icon + button pinned at sidebar bottom via `mt-auto`, fetches archived sessions via experimental API on expand, renders each with unarchive button |
| `packages/app/src/pages/layout.tsx` | Import `ArchivedSection`; render at bottom of sidebar panel; add `h-full` to SidebarPanel root for correct flex layout |
| `packages/app/src/pages/layout/sidebar-items.tsx` | In dandelion mode, swap idle session icon from `dash` to `circle-check` |
| `packages/app/src/context/global-sync/event-reducer.ts` | Increment `sessionTotal` when a previously-unknown root session appears via `session.updated` (covers unarchive case) |
| `packages/app/src/i18n/en.ts` | Add `common.unarchive`, `sidebar.archived`, `sidebar.archived.empty` |
| `packages/app/src/i18n/zh.ts` | Add `common.unarchive`, `sidebar.archived`, `sidebar.archived.empty` (Chinese) |

---

## 2026-03-28 — Remember last dandelion mode

### fix(dandelion): remember last used mode (chat/agent) across restarts

**Intent:** App always opened in Agent mode on startup because `home.tsx` hardcoded `workspaces.agent`. Now persists the last selected mode to `localStorage` under key `dandelion-mode` and restores it on next launch (defaults to `chat` if no prior selection).

| File | Change |
|------|--------|
| `packages/app/src/pages/home.tsx` | Read `localStorage.getItem("dandelion-mode")` to pick workspace; default to `chat` |
| `packages/app/src/components/titlebar.tsx` | Write `localStorage.setItem("dandelion-mode", ...)` on tab click |

### feat(dandelion): add image generation mode tab

**Intent:** Third workspace mode for AI image generation. Has its own workspace (`~/.dandelion/spaces/image/`), `image-gen` agent (no tools, no system prompt), and a filtered model selector that only shows models with `capabilities.output.image`. Shows a warning banner when no image-capable models are configured.

| File | Change |
|------|--------|
| `packages/desktop-electron/src/main/index.ts` | Add `image` path to `DANDELION_WORKSPACES`; `mkdirSync` in `ensureDandelionWorkspaces` |
| `packages/desktop-electron/src/preload/index.ts` | Add `image` path to `DANDELION_WORKSPACES` |
| `packages/desktop-electron/src/renderer/env.d.ts` | Add `image: string` to `__DANDELION__.workspaces` type |
| `packages/app/src/context/platform.tsx` | Add `image: string` to `dandelion.workspaces` type |
| `packages/opencode/src/agent/agent.ts` | Add `image-gen` agent: `mode: "primary"`, `"*": "deny"`, no prompt |
| `packages/app/src/components/titlebar.tsx` | Add Image tab button with `photo` icon and sliding indicator support |
| `packages/app/src/pages/home.tsx` | Support `"image"` in `dandelion-mode` localStorage |
| `packages/app/src/pages/layout.tsx` | Open all three workspaces on autoselect; navigate to last used |
| `packages/app/src/components/prompt-input.tsx` | Detect image mode; auto-select `image-gen` agent; pass `imageFilter` to model selector; show no-models warning banner |
| `packages/app/src/components/dialog-select-model.tsx` | Add `filter` prop to `ModelList` and `ModelSelectorPopover` |
| `packages/app/src/i18n/en.ts` | Add `dandelion.mode.image`, `dandelion.image.noModels` |
| `packages/app/src/i18n/zh.ts` | Add `dandelion.mode.image`, `dandelion.image.noModels` (Chinese) |

### fix(app): guard empty worktree in server projects store

**Intent:** Persisted server project store could contain entries with empty `worktree`, crashing layout context init when `globalSync.child("")` is called. Filter out empty entries and prevent storing them.

| File | Change |
|------|--------|
| `packages/app/src/context/layout.tsx` | Add `?? []` guards and `.filter(p => p.worktree)` on `server.projects.list()` calls |
| `packages/app/src/context/server.tsx` | Filter empty worktree from `projectsList`; guard `open()` against empty directory |

### feat(dandelion): image mode model filtering and empty state

**Intent:** In image mode, the model selector must only show image-capable models. When current model doesn't support images, display "Select Model" instead of fallback text LLM. Empty popover shows guidance to connect provider or manage models.

| File | Change |
|------|--------|
| `packages/app/src/components/prompt-input.tsx` | `effectiveModel()` memo hides non-image models; `empty` prop for popover with connect + manage buttons |
| `packages/app/src/components/dialog-select-model.tsx` | `empty` JSX prop on `ModelList`/`ModelSelectorPopover`; `<Show>` fallback when list is empty |

### style(dandelion): add tags to model management dialog

**Intent:** Model management dialog now shows provider icons and tags (Image Gen, Free, Latest) consistent with the model selector list.

| File | Change |
|------|--------|
| `packages/app/src/components/dialog-manage-models.tsx` | Add `ProviderIcon`, `Tag`, `Show` imports; render provider icon + image/free/latest tags per model |

### feat(dandelion): image gallery panel for image mode

**Intent:** Right-side panel in image mode shows a gallery grid of all generated images from the current session. Auto-opens when entering a session. Images are clickable for full preview with download. Metadata (resolution, parameters) fields reserved for future implementation.

| File | Change |
|------|--------|
| `packages/app/src/pages/session/image-gallery.tsx` | **Added:** Gallery component — extracts `FilePart` images from session messages, renders responsive 2-col grid with click-to-preview |
| `packages/app/src/pages/session/session-side-panel.tsx` | Add `imageMode` detection; gallery tab trigger and content; auto-open panel with gallery tab in image mode |
| `packages/app/src/i18n/en.ts` | Add `dandelion.image.gallery`, `dandelion.image.gallery.empty` |
| `packages/app/src/i18n/zh.ts` | Add `dandelion.image.gallery` (图库), `dandelion.image.gallery.empty` |

### feat(dandelion): built-in system skills + per-mode starter cards UI

**Intent:** Two features in one commit: (1) Bundle system skills (SKILL.md) into the Electron app and sync to `~/.dandelion/spaces/agent/.agents/skills/.system/` on startup with checksum invalidation; (2) Replace the empty conversation page with per-mode starter cards (chat/agent/image each get 3 category cards with example prompts). Starters are decoupled from skills -- only the agent-mode pptx card corresponds to an actual bundled skill.

| File | Change |
|------|--------|
| `packages/desktop-electron/assets/skills/.system/pptx/` | Added: bundled pptx system skill (SKILL.md, editing.md, pptxgenjs.md) |
| `packages/desktop-electron/src/main/skills.ts` | Added: `syncSystemSkills()` -- walk/fingerprint/sync bundled skills to agent workspace |
| `packages/desktop-electron/src/main/index.ts` | Call `syncSystemSkills(DANDELION_WORKSPACES.agent)` on startup |
| `packages/desktop-electron/electron-builder.config.ts` | Add `assets/skills/` -> `skills/` in `extraResources` |
| `packages/app/src/components/session/starters.ts` | Added: per-mode starter card metadata (id, icon, i18n keys, examples) |
| `packages/app/src/components/session/session-new-view.tsx` | Add `DandelionNewView` with mode detection, starter cards grid, expandable example prompts |
| `packages/app/src/i18n/en.ts` | Add `dandelion.home.{chat,agent,image}.*` and `dandelion.starter.*` keys |
| `packages/app/src/i18n/zh.ts` | Add Chinese translations for all new keys |

### feat(dandelion): per-workspace model selection memory

**Intent:** Switching models in agent mode was also changing the model in chat mode (and vice versa). Root cause: `models.recent` is a global store (`Persist.global`), and when a workspace had no `workspaceModel` set, the fallback chain reached `recentModel()` which returned whatever was last pushed globally by any workspace.

Fix: (1) Add `workspaceModel` field to per-workspace persisted store, inserted in the fallback chain before `recentModel()`; (2) Fix `migrate` to preserve `workspaceModel` across reloads (was being stripped); (3) Add an effect to capture the initial fallback as `workspaceModel` on first load, so global recent changes never leak across workspaces.

| File | Change |
|------|--------|
| `packages/app/src/context/local.tsx` | Add `workspaceModel` to `Saved` type; fix `migrate` to preserve it; add `workspaceModel()` in fallback chain before `recentModel()`; save workspace model on `model.set()`; init effect captures fallback as workspace default |
