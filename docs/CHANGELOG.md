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
