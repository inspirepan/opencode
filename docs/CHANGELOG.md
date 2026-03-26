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
- `src/app.tsx` — `window.__OPENCODE__` type extension
- `src/context/platform.tsx` — `Platform.dandelion` type
- `src/components/titlebar.tsx` — dandelion tabs, hide portals, settings button
- `src/components/prompt-input.tsx` — chat mode detection, agent auto-switch, hide agent selector
- `src/pages/home.tsx` — auto-redirect to dandelion workspace
- `src/pages/layout.tsx` — autoselect, sidebar rail skip, width adjustments, project header hide
- `src/i18n/en.ts` — dandelion i18n keys
- `src/i18n/zh.ts` — dandelion i18n keys (Chinese)

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

### Root
- `.gitignore` — models-snapshot.js
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

### chore: add Makefile and CLAUDE.md for test orchestration

**Intent:** Provide a single `make test` entry point so agents and developers can run all checks (typecheck, unit, e2e) without remembering per-package commands. Document testing workflow and dandelion mode in CLAUDE.md.

| File | Change |
|------|--------|
| `Makefile` | **Added:** targets `check`, `test`, `test-e2e`, `test-all` |
| `CLAUDE.md` | **Added:** testing commands, dandelion mode notes for agent context |
