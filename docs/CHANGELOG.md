# Dandelion Fork Changelog

> Tracks all modifications made on top of upstream `opencode` (`dev` branch).
> Use this when resolving merge conflicts with upstream to understand what we changed and why.

---

## 2026-04-01 — refactor: optimize dandy-agent prompt per Anthropic best practices

### refactor(dandelion): rewrite dandy-agent.txt for clarity, conciseness, and best-practice alignment

**Intent:** Rewrote the Dandy agent system prompt following Anthropic's prompt engineering best practices. Key changes: (1) emphasize Dandy runs on user's computer with boundless capabilities, (2) add Safety section requiring confirmation before high-risk actions, (3) merge Personality/Values/Tone into one section to reduce redundancy, (4) promote Language matching to its own top-level section, (5) reframe capability list as examples instead of exhaustive list, (6) add "why" context to rules, (7) use positive framing ("mirror emoji style") instead of negation, (8) trim question tool examples from 2 to 1, (9) add user-facing action guidance section, (10) remove redundant Guidelines section.

| File | Change |
|------|--------|
| `packages/opencode/src/agent/prompt/dandy-agent.txt` | Full rewrite: add Safety section, merge Personality/Values/Tone, add Language section, add boundless capability framing, add user-action guidance, trim examples, remove redundant Guidelines |

---

## 2026-03-30 — fix: bash tool description not matching user language

### fix(bash): reinforce language-matching requirement for bash tool description

**Intent:** The bash tool's `description` parameter (shown in the UI as "执行命令中 XXX") was sometimes generated in English even when the user was writing in Chinese. The schema `.describe()` and `dandy-agent.txt` both mentioned language matching, but `bash.txt` (the tool's own prompt, closest context to the model) did not, and the schema examples were all English. Added explicit language-matching instruction to `bash.txt` and added Chinese examples to the schema.

| File | Change |
|------|--------|
| `packages/opencode/src/tool/bash.txt` | Add "The description MUST be in the same language the user is writing in" to the description instruction |
| `packages/opencode/src/tool/bash.ts` | Change "Must" to "MUST" in schema describe; add Chinese example outputs alongside English ones |

---

## 2026-03-30 — feat: Exa API key configuration for websearch/codesearch

### feat(exa): support Exa API key configuration via settings UI and environment variable

**Intent:** The upstream websearch and codesearch tools (powered by Exa) were gated behind `ProviderID.opencode` (Zen) or manual env flags. Users with their own Exa API key had no way to enable these tools. Now supports three sources: settings UI (stored in `auth.json`), `EXA_API_KEY` env var, and the existing flags. The settings page shows configuration status with masked key preview, source indicator ("Configured" vs "Environment variable"), and a link to the Exa dashboard for obtaining keys.

| File | Change |
|------|--------|
| `packages/opencode/src/flag/flag.ts` | `OPENCODE_ENABLE_EXA`: add `\|\| !!process.env["EXA_API_KEY"]` to auto-enable when env var is set |
| `packages/opencode/src/tool/registry.ts` | Import `Auth`; pre-fetch `Auth.get("exa")` before tool filter; gate websearch/codesearch on stored key in addition to env flag |
| `packages/opencode/src/tool/websearch.ts` | Import `Auth`; read key from `Auth.get("exa")` first, fallback to `process.env["EXA_API_KEY"]`; add `Authorization: Bearer` header |
| `packages/opencode/src/tool/codesearch.ts` | Same as websearch.ts |
| `packages/opencode/src/server/server.ts` | Add `GET /auth/:providerID/status` endpoint returning `{ configured, mask, source }` — checks both auth.json and env var for exa; returns last 4 chars as mask |
| `packages/app/src/components/settings-general.tsx` | Add `ToolsSection` with Exa API Key configuration: `createResource` fetches status on mount; shows "Configured"/"Environment variable" tag + masked key; save/update/remove buttons; link to Exa dashboard |
| `packages/app/src/i18n/en.ts` | Add `settings.general.section.tools` and all `exaApiKey.*` i18n keys |
| `packages/app/src/i18n/zh.ts` | Add Chinese translations for all new keys |

---

## 2026-03-30 — feat: save attached images to workspace for agent access

### feat(dandelion): persist user-attached images to workspace directory

**Intent:** When a user attaches an image (paste/drag/file picker), the base64 data was only passed inline to the LLM and never saved to disk. The agent had no file path to operate on. Now, image attachments are saved to `Instance.directory` (the workspace) and a synthetic text part is injected telling the agent the file path, while the inline image data is still sent so the model can see it visually.

| File | Change |
|------|--------|
| `packages/opencode/src/session/prompt.ts` | In `createUserMessage`, `data:` case: for non-text image MIME types, extract base64, save to workspace via `Filesystem.write`, and prepend a synthetic text part with the saved file path. Import `Media` for extension lookup. |
| `packages/opencode/src/session/media.ts` | Export `Media.ext(mime)` helper to map MIME type to file extension |

---

## 2026-03-29 — chore: rename bundled baoyu-* skills to remove prefix

### chore(dandelion): remove `baoyu-` prefix from bundled system skills

**Intent:** Clean up skill naming -- the `baoyu-` vendor prefix is unnecessary for bundled skills and clutters the slash command namespace (e.g. `/baoyu-comic` becomes `/comic`).

| File | Change |
|------|--------|
| `packages/desktop-electron/assets/skills/.system/baoyu-*/` | Rename all 13 directories: remove `baoyu-` prefix (e.g. `baoyu-comic/` -> `comic/`) |
| `*/SKILL.md` (all 13 files) | Update frontmatter `name:`, slash commands (`/baoyu-X` -> `/X`), EXTEND.md skill subdirectory paths, relative script paths; rename `.baoyu-skills/` -> `.dandelion/skill-configs/` in all extension/config paths |

---

## 2026-03-29 — i18n: translate Shell to Chinese and add language-matching for tool output

### i18n(dandelion): translate "Shell" UI labels and add language-matching rule for LLM tool output

**Intent:** Non-technical Chinese users see "Shell" in multiple places which is meaningless jargon. Translate to "终端" (terminal) for mode labels and "执行命令" for tool display. Also instruct the LLM to match the user's language in all user-visible tool parameters (bash description, todo content, question text/options) via both the tool schema and the dandy-agent system prompt.

| File | Change |
|------|--------|
| `packages/app/src/i18n/zh.ts` | `command.prompt.mode.shell`, `prompt.mode.shell`: "Shell" -> "终端"; `prompt.placeholder.shell`: "输入 shell 命令..." -> "输入终端命令..." |
| `packages/ui/src/i18n/zh.ts` | `ui.tool.shell`: "Shell" -> "执行命令"; `ui.tool.shell.active`: "执行中" -> "执行命令中" |
| `packages/opencode/src/tool/bash.ts` | `description` parameter `.describe()`: add "Must match the user's language" instruction |
| `packages/opencode/src/agent/prompt/dandy-agent.txt` | Add language-matching rule at top of "Tool usage" section: all user-visible output (bash descriptions, todo items, question text/options) must match the user's language |

---

## 2026-03-29 — present_file: image and directory gallery support

### Commit `de592862` — feat(dandelion): present_file supports images and directory galleries

**Intent:** Allow `present_file` tool to present common image types (png/jpg/gif/webp/bmp/avif) and directories containing images. When a directory is presented, all image files are scanned and displayed as a gallery grid in the preview panel. Re-presenting the same directory updates the gallery, enabling incremental preview during batch image generation.

| File | Change |
|------|--------|
| `packages/opencode/src/tool/present.ts` | Add IMAGE_EXTS to SUPPORTED/BINARY_EXTS; add `gallery()` function to scan directories for images; handle directory input returning gallery metadata with `directory: true`; add `directory: false` to all non-directory return paths for type consistency |
| `packages/opencode/src/tool/present.txt` | Document image file support, directory/gallery support, and batch generation tip |
| `packages/app/src/context/preview.tsx` | Add `directory?: boolean` to `PreviewItem` type |
| `packages/app/src/pages/session.tsx` | Add `directory` to metadata type assertions in present_file watcher and click handler |
| `packages/app/src/pages/session/preview-tab.tsx` | Add `ImageView` component for single image preview; add `GalleryView` component for directory gallery with click-to-enlarge; import `ImagePreview` and `useDialog` |
| `packages/desktop-electron/assets/skills/.system/baoyu-image-gen/SKILL.md` | Add "Presenting Results" section instructing agent to use `present_file` after generation |

### Commit `b2d6a62e` — fix(dandelion): inline HTML images in present_file and reveal files in Finder

**Intent:** Fix two preview UX issues: (1) HTML files with local `<img src>` references show broken images because `srcdoc` iframe can't resolve local paths -- now base64-inlined like Markdown. (2) Preview "open" button was dumping raw content into a new window for galleries/images -- now unified to reveal the file in Finder with highlight.

| File | Change |
|------|--------|
| `packages/opencode/src/tool/present.ts` | Refactor `inlineImages` into `inlineLocal`/`inlineMdImages`/`inlineHtmlImages`; add HTML `<img src>` inlining for `.html`/`.htm` files |
| `packages/app/src/context/platform.tsx` | Add `showInFolder?(path)` to `Platform` type |
| `packages/app/src/pages/session/session-side-panel.tsx` | Unify preview open button: folder icon, `showInFolder` for files, `openPath` for directories |
| `packages/desktop-electron/src/main/ipc.ts` | Add `show-in-folder` IPC handler using `shell.showItemInFolder` |
| `packages/desktop-electron/src/preload/index.ts` | Expose `showInFolder` via preload bridge |
| `packages/desktop-electron/src/preload/types.ts` | Add `showInFolder` to `ElectronAPI` type |
| `packages/desktop-electron/src/renderer/index.tsx` | Wire `showInFolder` to platform |

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

### Commit `e7c2f3c94` — feat(dandelion): show running sessions on new session page

**Intent:** When switching modes via titlebar tabs and landing on the new session page, show currently running sessions (up to 3) above the starter cards. Lets users quickly jump back to an active session without opening the sidebar. A "View all" link appears when there are more than 3, opening the sidebar.

| File | Change |
|------|--------|
| `packages/app/src/components/session/session-new-view.tsx` | Add running sessions section to `DandelionNewView`: filter sessions by `session_status`, show max 3 with spinner + title, "View all" opens sidebar |
| `packages/app/src/i18n/en.ts` | Add `dandelion.home.running`, `dandelion.home.running.more` |
| `packages/app/src/i18n/zh.ts` | Add `dandelion.home.running` (进行中), `dandelion.home.running.more` (查看全部) |

---

## Files touched (summary)

Quick reference of all files modified from upstream, grouped by package:

### `packages/app/`
- `src/app.tsx` — `window.__OPENCODE__` type extension; `PreviewProvider`
- `src/context/platform.tsx` — `Platform.dandelion` type; `showInFolder` method
- `src/context/preview.tsx` — preview data store; `previewTab()`/`previewPath()` helpers
- `src/components/titlebar.tsx` — dandelion tabs with sliding segmented control, hide portals, settings button
- `src/components/session-context-usage.tsx` — unified context tab toggle (no dandelion branch)
- `src/components/session/session-new-view.tsx` — running sessions section, per-mode starter cards in dandelion new session page
- `src/components/session/starters.ts` — per-mode starter card metadata
- `src/components/prompt-input.tsx` — chat mode detection, agent auto-switch, hide agent selector, variant descriptions, per-mode placeholders
- `src/components/prompt-input/placeholder.ts` — dandelion mode parameter for placeholder text
- `src/components/dialog-select-model.tsx` — enlarged popover, provider icons, filter prop
- `src/components/dialog-manage-models.tsx` — provider icons and tags (image/free/latest)
- `src/context/local.tsx` — per-workspace model selection memory
- `src/context/global-sync/child-store.ts` — session fetch limit increase
- `src/context/global-sync/event-reducer.ts` — session total increment on unarchive
- `src/context/server.tsx` — filter empty worktree from projects
- `src/pages/layout/sidebar-workspace.tsx` — load-more limit increase; archived sessions section
- `src/pages/layout/sidebar-items.tsx` — idle session icon swap in dandelion mode
- `src/pages/session/image-gallery.tsx` — image gallery panel for image mode
- `src/pages/session/use-session-commands.tsx` — auto-close panel on last tab close
- `src/pages/home.tsx` — auto-redirect to dandelion workspace
- `src/pages/layout.tsx` — autoselect, sidebar rail skip, width adjustments, project header hide
- `src/pages/directory-layout.tsx` — pass `serverUrl` to `DataProvider`
- `src/pages/session.tsx` — present_file detection, preview+tab sync, mobile preview fallback, external file handling
- `src/pages/session/session-side-panel.tsx` — unified tab system for preview/context/review; auto-close empty panel; Finder reveal button
- `src/components/session/session-header.tsx` — hide status popover, shapes icon for side panel toggle
- `src/pages/session/preview-tab.tsx` — iframe preview with PDF (pdf.js), Markdown, SVG, Mermaid support; image preview; directory gallery view
- `src/pages/session/helpers.ts` — `activeTab` supports `preview://` tabs
- `src/components/settings-general.tsx` — Exa API Key configuration in Tools section
- `src/i18n/en.ts` — dandelion + variant + exa i18n keys
- `src/i18n/zh.ts` — dandelion + variant + exa i18n keys (Chinese)

### `packages/ui/`
- `src/components/logo.tsx` — dandelion seed SVG
- `src/components/icon.tsx` — `shapes`, `circle-plus`, `circle-plus-active` icons
- `src/components/message-part.tsx` — `present_file` tool renderer with clickable filename; `file` part renderer for generated images; active form text for all tools
- `src/components/message-part.css` — `file-part` image styles
- `src/components/basic-tool.tsx` — `activeTitle` support with `ToolStatusTitle`
- `src/components/image-preview.tsx` — download button support
- `src/components/app-icon.tsx` — keynote/powerpoint app icons
- `src/components/app-icons/types.ts` — app icon name registry
- `src/components/tabs.css` — remove redundant tab underline
- `src/context/data.tsx` — `serverUrl` prop for media URL resolution
- `src/components/list.css` — sticky group header gradient fix
- `src/components/select.css` — dropdown max-height increase
- `src/i18n/en.ts` — tool active form translations
- `src/i18n/zh.ts` — tool active form translations (Chinese)
- `src/i18n/zht.ts` — tool active form translations (Traditional Chinese)

### `packages/desktop-electron/`
- `src/main/index.ts` — workspace creation (chat/agent/image), globals, IPC, Dandelion branding
- `src/main/ipc.ts` — getDandelionWorkspace handler; `show-in-folder` IPC
- `src/main/windows.ts` — globals type and injection
- `src/main/skills.ts` — system skills sync on startup
- `src/main/menu.ts` — Dandelion branding
- `src/preload/index.ts` — synchronous workspace path exposure (3 modes); `showInFolder` bridge
- `src/preload/types.ts` — ElectronAPI type; `showInFolder`
- `src/renderer/env.d.ts` — window type declarations
- `src/renderer/index.tsx` — platform dandelion setup; `showInFolder` wiring
- `src/renderer/index.html` — Dandelion title
- `src/renderer/loading.html` — Dandelion title
- `src/renderer/i18n/*.ts` — Dandelion branding in all 14 locales
- `electron-builder.config.ts` — Dandelion product name; skills extraResources
- `assets/skills/.system/` — bundled system skills (pptx, docx, xlsx, pdf, infographic, baoyu-skills suite)

### `packages/opencode/`
- `src/agent/agent.ts` — chat, dandy, image-gen agent definitions
- `src/agent/prompt/chat.txt` — chat agent system prompt
- `src/agent/prompt/dandy.txt` — Dandy persona chat prompt
- `src/agent/prompt/dandy-agent.txt` — Dandy persona agent prompt (with memory system, question tool guide)
- `src/agent/prompt/dandy-image.txt` — Dandy persona image prompt
- `src/provider/provider.ts` — `envKeys()` for API key injection; `PENDING_MODELS` for missing models
- `src/provider/transform.ts` — `responseModalities` for image-capable Google/Vertex models
- `src/session/media.ts` — media file storage module
- `src/session/processor.ts` — `file` event handler for model image output
- `src/session/instruction.ts` — auto-load MEMORY.md from working directory
- `src/server/routes/session.ts` — media file serving endpoint; session unarchive fix
- `src/server/server.ts` — exempt media paths from basic auth; `GET /auth/:providerID/status` endpoint
- `src/flag/flag.ts` — `OPENCODE_ENABLE_EXA` auto-enable on `EXA_API_KEY` env var
- `src/file/index.ts` — show files in @ autocomplete when query is empty
- `src/tool/present.ts` — present_file tool (HTML, SVG, PDF, PPTX)
- `src/tool/present.txt` — tool description
- `src/tool/bash.ts` — inject provider API keys into spawned processes
- `src/tool/registry.ts` — register PresentTool; Exa auth check for websearch/codesearch gate
- `src/tool/websearch.ts` — Auth + env var key reading with Bearer header
- `src/tool/codesearch.ts` — Auth + env var key reading with Bearer header

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

### Commit `74d113265` — fix(dandelion): fix tab slider not tracking agent mode and startup workspace race

**Intent:** Two bugs: (1) the sliding indicator in the titlebar didn't move to the Agent tab when navigating to the agent workspace — the effect was missing `isAgent()` as a dependency; (2) on startup, `home.tsx` was writing workspaces to the persisted store before it finished loading, so the writes were overwritten. Fix by moving all workspace registration to `layout.tsx` autoselect (runs after store is ready) and having tab clicks call `layout.projects.open()` before navigating.

| File | Change |
|------|--------|
| `packages/app/src/components/titlebar.tsx` | Add `isAgent()` to slider effect dependencies; call `layout.projects.open()` on tab click before navigating |
| `packages/app/src/pages/home.tsx` | Remove workspace `open()` calls — defer to `layout.tsx` autoselect |
| `packages/app/src/pages/layout.tsx` | Autoselect now solely handles dandelion startup workspace registration (all three modes) |
| `packages/desktop-electron/src/main/windows.ts` | Add missing `image` field to `Globals.dandelionWorkspaces` type |
| `packages/app/src/components/session/session-new-view.tsx` | Simplify image mode check (remove redundant guard) |

### feat(dandelion): per-workspace model selection memory

**Intent:** Switching models in agent mode was also changing the model in chat mode (and vice versa). Root cause: `models.recent` is a global store (`Persist.global`), and when a workspace had no `workspaceModel` set, the fallback chain reached `recentModel()` which returned whatever was last pushed globally by any workspace.

Fix: (1) Add `workspaceModel` field to per-workspace persisted store, inserted in the fallback chain before `recentModel()`; (2) Fix `migrate` to preserve `workspaceModel` across reloads (was being stripped); (3) Add an effect to capture the initial fallback as `workspaceModel` on first load, so global recent changes never leak across workspaces.

| File | Change |
|------|--------|
| `packages/app/src/context/local.tsx` | Add `workspaceModel` to `Saved` type; fix `migrate` to preserve it; add `workspaceModel()` in fallback chain before `recentModel()`; save workspace model on `model.set()`; init effect captures fallback as workspace default |

### feat(ui): active form text for tool titles during execution

**Intent:** When a tool is executing (pending/running with shimmer animation), show a distinct "active form" text instead of the static tool name. Uses the existing `ToolStatusTitle` component for smooth animated transitions between active and done states. Example: "编写中" (shimmer) -> "写入" (done).

| File | Change |
|------|--------|
| `packages/ui/src/i18n/en.ts` | Add `.active` i18n keys for all tools (e.g. `ui.tool.read.active: "Reading"`, `ui.messagePart.title.write.active: "Writing"`); change `ui.tool.skill` to template `"Loaded skill {{name}}"` |
| `packages/ui/src/i18n/zh.ts` | Add Chinese active forms (e.g. `读取中`, `编写中`, `编辑中`, `执行中`); `ui.tool.skill: "加载技能 {{name}}"`, `ui.tool.skill.active: "加载技能中"`; `ui.tool.patch: "编辑"`, `ui.tool.webfetch: "获取网页"` |
| `packages/ui/src/i18n/zht.ts` | Add Traditional Chinese active forms matching zh.ts pattern |
| `packages/ui/src/components/basic-tool.tsx` | Add `activeTitle?: string` to `TriggerTitle` type; import `ToolStatusTitle`; render `ToolStatusTitle` when `activeTitle` is set, fallback to `TextShimmer` otherwise |
| `packages/ui/src/components/message-part.tsx` | Add `activeTitle?: string` to `ToolInfo` type; update `getToolInfo()` to return `activeTitle` for all tools; update all `ToolRegistry.register()` calls to pass `activeTitle`; replace `TextShimmer` with `ToolStatusTitle` in custom JSX triggers (webfetch, bash, edit, write, apply_patch, skill, present_file); update `contextToolTrigger()` and `ContextToolGroup` list items; refactor skill to use title template with name |

### feat(dandelion): titlebar icon updates and shapes icon

**Intent:** Replace titlebar icons in dandelion mode with more semantically appropriate ones. Sidebar toggle becomes a "history" button (reset icon), new session becomes circle-plus. Side panel toggle uses a new `shapes` icon. Add `dandelion.history` i18n key.

| File | Change |
|------|--------|
| `packages/ui/src/components/icon.tsx` | Add `shapes`, `circle-plus`, `circle-plus-active` icons |
| `packages/app/src/components/titlebar.tsx` | Dandelion mode: sidebar toggle uses `reset` icon with "History" tooltip; new session uses `circle-plus`; upstream icons unchanged |
| `packages/app/src/components/session/session-header.tsx` | Dandelion mode: side panel toggle uses `shapes` icon instead of `review` |
| `packages/app/src/i18n/en.ts` | Add `dandelion.history: "History"` |
| `packages/app/src/i18n/zh.ts` | Add `dandelion.history: "历史记录"` |

### feat(dandelion): PPTX preview card with app icon and reveal in Finder

**Intent:** Instead of directly opening `.pptx`/`.ppt` files with the system app, show a preview card in the right panel with the associated app icon (Keynote on macOS, PowerPoint elsewhere). User clicks the card to open the file. The panel's top-right button changes to a folder icon that reveals the file in Finder.

| File | Change |
|------|--------|
| `packages/app/src/context/preview.tsx` | Add `external?: boolean` to `PreviewItem` type |
| `packages/app/src/pages/session.tsx` | External files: push to preview context (with `external: true`) instead of calling `platform.openPath()` directly; same change for `present-file-click` event handler |
| `packages/app/src/pages/session/preview-tab.tsx` | Add `ExternalCard` component: shows `AppIcon` (keynote/powerpoint based on OS), filename, click-to-open; import `AppIcon` and `usePlatform`; add `isExternal` memo; nested `<Show>` renders card or iframe |
| `packages/app/src/pages/session/session-side-panel.tsx` | Open button: for external items, show `folder` icon with "Reveal in Finder" tooltip; click opens parent directory via `platform.openPath` |
| `packages/ui/src/assets/icons/app/keynote.png` | **Added:** 256x256 Keynote icon extracted from system `/Applications/Keynote.app` |
| `packages/ui/src/assets/icons/app/powerpoint.svg` | **Added:** Official PowerPoint icon SVG from Wikimedia Commons |
| `packages/ui/src/components/app-icon.tsx` | Import and register `keynote` (PNG) and `powerpoint` (SVG) |
| `packages/ui/src/components/app-icons/types.ts` | Add `"keynote"` and `"powerpoint"` to `iconNames` |
| `packages/app/src/i18n/en.ts` | Add `dandelion.preview.openExternal`, `dandelion.preview.openFolder` |
| `packages/app/src/i18n/zh.ts` | Add `dandelion.preview.openExternal` (点击使用默认应用打开), `dandelion.preview.openFolder` (在访达中显示) |

### feat(dandelion): Dandy persona and per-mode system prompts

**Intent:** Give the Dandelion app its own AI identity ("Dandy") with per-mode system prompts tailored for non-technical users. Replaces the upstream coding-oriented provider prompts with a single unified persona. Also adds a `dandy` agent for the agent workspace (same permissions as `build`, but with the Dandy prompt instead of per-model provider prompts), auto-loads `MEMORY.md` from the working directory, and adds a persistent memory system to the agent prompt.

| File | Change |
|------|--------|
| `packages/opencode/src/agent/prompt/dandy.txt` | **Added:** Chat mode prompt — Dandy persona, pure conversation, no tools |
| `packages/opencode/src/agent/prompt/dandy-agent.txt` | **Added:** Agent mode prompt — Dandy persona, tool guidance, present_file usage, persistent memory system, workspace awareness |
| `packages/opencode/src/agent/prompt/dandy-image.txt` | **Added:** Image mode prompt — Dandy persona, creative image generation focus |
| `packages/opencode/src/agent/agent.ts` | Add `dandy` agent (build permissions + Dandy prompt); update `chat` prompt to `PROMPT_DANDY`; add `PROMPT_DANDY_IMAGE` to `image-gen` |
| `packages/app/src/components/prompt-input.tsx` | Auto-select `dandy` agent in dandelion agent workspace |
| `packages/opencode/src/session/instruction.ts` | Auto-load `MEMORY.md` from working directory into system prompt |

### Commit 15c5ad56 — fix: show files in @ autocomplete when query is empty

**Intent:** Improve the `@` autocomplete behavior in the editor. When the query is empty, it now correctly returns the first batch of files (respecting the limit) instead of returning nothing or just directories.

| File | Change |
|------|--------|
| `packages/opencode/src/file/index.ts` | `File.search()`: return sliced files when query is empty and kind is `file` or `all` |

### Commit 32094910 — fix(ui): redesign shapes icon layout and optical balance

**Intent:** Refine the `shapes` icon used for the dandelion side panel toggle. Rebalanced the positions and sizes of the square, triangle, diamond, and circle for better optical alignment.

| File | Change |
|------|--------|
| `packages/ui/src/components/icon.tsx` | Redraw `shapes` icon SVG paths |

### Commit 566c7cbf — fix(dandelion): hide status popover in dandelion mode

**Intent:** Simplify the UI for non-technical users by hiding the status popover (which contains developer-centric info like provider status) in dandelion mode.

| File | Change |
|------|--------|
| `packages/app/src/components/session/session-header.tsx` | Wrap `StatusPopover` in `!platform.dandelion` guard |

### rebrand(dandelion): rename all UI-facing "OpenCode" text to "Dandelion"

**Intent:** Replace all user-visible "OpenCode" branding in the desktop-electron package with "Dandelion". Internal identifiers (appId, env vars, protocol scheme, binary names, server auth) are left unchanged.

| File | Change |
|------|--------|
| `packages/desktop-electron/src/main/index.ts` | `APP_NAMES` values and `app.setName()` fallback: OpenCode -> Dandelion |
| `packages/desktop-electron/src/main/windows.ts` | Window title: OpenCode -> Dandelion |
| `packages/desktop-electron/src/main/menu.ts` | Mac menu app label and Help > Documentation label: OpenCode -> Dandelion |
| `packages/desktop-electron/electron-builder.config.ts` | `productName` and `protocols.name` for all channels: OpenCode -> Dandelion |
| `packages/desktop-electron/package.json` | `author.name`: OpenCode -> Dandelion |
| `packages/desktop-electron/src/renderer/index.html` | `<title>`: OpenCode -> Dandelion |
| `packages/desktop-electron/src/renderer/loading.html` | `<title>`: OpenCode -> Dandelion |
| `packages/desktop-electron/src/renderer/i18n/*.ts` | All 14 locale files: updater messages and CLI messages: OpenCode -> Dandelion |
| `packages/desktop-electron/README.md` | Title and description: OpenCode -> Dandelion |

### feat(dandelion): add office document and infographic skills with expanded starters

**Intent:** Expand agent mode from 3 starters to 6 by adding skills for common non-developer tasks: Word documents, spreadsheets, PDFs, and infographics. Skills bundled as system skills that sync to the agent workspace on launch. Replace the "Data Processing" starter with "Infographics" since PDF and spreadsheet starters now cover data extraction.

| File | Change |
|------|--------|
| `packages/desktop-electron/assets/skills/.system/docx/SKILL.md` | Added: Word document skill (from anthropics-skills) -- create/edit/format .docx files with docx-js |
| `packages/desktop-electron/assets/skills/.system/xlsx/SKILL.md` | Added: Spreadsheet skill (from anthropics-skills) -- create/edit/analyze .xlsx with openpyxl/pandas |
| `packages/desktop-electron/assets/skills/.system/pdf/SKILL.md` | Added: PDF skill (from anthropics-skills) -- read/create/merge/split/fill PDFs |
| `packages/desktop-electron/assets/skills/.system/pdf/forms.md` | Added: PDF forms reference guide |
| `packages/desktop-electron/assets/skills/.system/pdf/reference.md` | Added: PDF advanced reference |
| `packages/desktop-electron/assets/skills/.system/baoyu-infographic/` | Added: Infographic skill (from baoyu-skills) -- 21 layouts x 20 styles, 45 reference files |
| `packages/app/src/components/session/starters.ts` | Agent mode: add docx, xlsx, pdf, infographic starters; remove data starter; now 6 total |
| `packages/app/src/i18n/en.ts` | Add starter translations for docx, xlsx, pdf, infographic; remove data starter keys |
| `packages/app/src/i18n/zh.ts` | Add starter translations for docx, xlsx, pdf, infographic; remove data starter keys |

### feat: inject provider API keys into bash tool environment

**Intent:** Skills like baoyu-infographic depend on external image generation APIs (OpenAI, Gemini, DashScope, Replicate). Users already configure these API keys through the opencode provider system, but bash child processes couldn't access them. Now the bash tool automatically injects resolved provider API keys as environment variables (e.g. `OPENAI_API_KEY`, `GEMINI_API_KEY`) into spawned processes. Only injects vars matching `_KEY` or `_TOKEN` suffix patterns, skips non-key vars (account IDs, project names), and respects existing env vars (no override).

| File | Change |
|------|--------|
| `packages/opencode/src/provider/provider.ts` | Add `Provider.envKeys()`: collects resolved API keys from all active providers, maps to their env var names, filters to key/token vars only |
| `packages/opencode/src/tool/bash.ts` | Import `Provider`; call `envKeys()` in parallel with plugin shell.env; merge into spawn environment between `process.env` and `shellEnv.env` |

### fix(dandelion): starter examples overflow hidden when expanded

**Intent:** When clicking a starter card in the empty conversation view, the expanded example buttons were cut off at the bottom because `items-center` on a flex container causes content to overflow symmetrically (both top and bottom) when it exceeds the container height. Replace with `overflow-y-auto` + `my-auto` to keep vertical centering when content fits, but allow scrolling when it doesn't.

| File | Change |
|------|--------|
| `packages/app/src/components/session/session-new-view.tsx` | `DandelionNewView`: replace `items-center` with `overflow-y-auto` on outer flex; add `my-auto` on inner content div |

### Commit `9e32b9322` — feat(dandelion): bundle baoyu-skills suite as system skills

**Intent:** Expand bundled system skills from 4 to 14 by adding the baoyu-skills suite. Remove 3 risky skills (danger-gemini-web, danger-x-to-markdown, post-to-x) that could cause unintended side effects.

| File | Change |
|------|--------|
| `packages/desktop-electron/assets/skills/.system/baoyu-*/` | Added: 10 baoyu-skills (image-gen, comic, cover-image, article-illustrator, xhs-images, slide-deck, compress-image, format-markdown, url-to-markdown) with SKILL.md, references, and scripts |

### Commit `8ee032f64` — feat(dandelion): mode-specific placeholder text for prompt input

**Intent:** Each mode (chat/agent/image) gets its own placeholder text with rotating example prompts drawn from the starter cards, replacing the generic upstream placeholder.

| File | Change |
|------|--------|
| `packages/app/src/components/prompt-input.tsx` | Build `DANDELION_EXAMPLES` from starters; extend `promptPlaceholder()` with dandelion param; derive `dandelionMode` memo |
| `packages/app/src/components/prompt-input/placeholder.ts` | Add dandelion mode parameter to placeholder function |
| `packages/app/src/i18n/en.ts` | Add per-mode simple/normal placeholder i18n keys |
| `packages/app/src/i18n/zh.ts` | Add per-mode simple/normal placeholder i18n keys (Chinese) |

### Commit `def46dd44` — docs(dandelion): add question tool usage guide to dandy-agent prompt

**Intent:** Add AskUserQuestion tool usage instructions to the dandy-agent prompt, covering when to use it, how to write good questions, parameter details, and JSON examples.

| File | Change |
|------|--------|
| `packages/opencode/src/agent/prompt/dandy-agent.txt` | Add "Asking the user questions" subsection under Tool usage with examples |

### fix(dandelion): increase session list limit and auto-close empty side panel

**Intent:** Two UX improvements: (1) Load 50 sessions at a time instead of 5 so users see their full history without clicking "load more"; (2) Auto-close the right side panel in dandelion mode when all tabs are closed (covers edge cases not handled by the per-button close logic).

| File | Change |
|------|--------|
| `packages/app/src/context/global-sync/child-store.ts` | Initial session fetch limit: 5 -> 50 |
| `packages/app/src/pages/layout/sidebar-workspace.tsx` | Load-more increment: 5 -> 50 (both `SortableWorkspace` and `LocalWorkspace`) |
| `packages/app/src/pages/session/session-side-panel.tsx` | Add `createEffect` to auto-close panel when no tabs and no context open (dandelion non-image mode) |

### fix(dandelion): populate empty bundled skill SKILL.md files with actual content

**Intent:** All `baoyu-*` bundled skills except `baoyu-infographic` had 0-byte `SKILL.md` files, causing the skill loader to silently skip them (no frontmatter to parse). Agent sessions could not discover skills like `baoyu-image-gen`, `baoyu-cover-image`, etc.

Fix: copy full skill content (SKILL.md, references/, scripts/, prompts/) from upstream baoyu-skills source. Also add 3 previously missing skills: `baoyu-danger-gemini-web`, `baoyu-danger-x-to-markdown`, `baoyu-post-to-x`.

| File | Change |
|------|--------|
| `packages/desktop-electron/assets/skills/.system/baoyu-*/` | Populate all empty SKILL.md files with full content; add missing reference/script/prompt files |
| `packages/desktop-electron/assets/skills/.system/baoyu-danger-gemini-web/` | **Added:** Gemini web API skill (browser cookie auth image gen) |
| `packages/desktop-electron/assets/skills/.system/baoyu-danger-x-to-markdown/` | **Added:** Twitter/X thread to markdown skill |
| `packages/desktop-electron/assets/skills/.system/baoyu-post-to-x/` | **Added:** Post to Twitter/X skill |
