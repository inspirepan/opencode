# Simple AI Desktop Implementation Plan

> **For Claude:** Use the executing-plans skill to implement this plan task-by-task.

**Goal:** Transform OpenCode into a simple AI desktop app for non-technical users. Three modes: Chat (pure conversation), Agent (with tools), and Image (AI image generation). Clean UI with no developer-specific panels (file tree, terminal, diff). Fixed workspace, guided onboarding, prompt templates, and content preview panels.

**Architecture:** Fork OpenCode, modify `packages/app/` (UI layer), `packages/opencode/` (agent + image output pipeline), and `packages/desktop-electron/` (Electron shell). Reuse the existing agent/tool/session/provider infrastructure. The left sidebar rail becomes a mode switcher (Chat/Agent/Image), each mode maps to a pre-configured agent with its own default model, session list, and preview panel type.

**Tech Stack:** SolidJS, Electron, TypeScript, `@opencode-ai/ui` (design system), AI SDK v5 (`@ai-sdk/google` for Gemini image models)

---

## Key Design Decisions

### Mode Architecture

Each mode is a "workspace" backed by a fixed directory under `~/.myai/`:

| Mode | Directory | Agent | Default Model | Tools | Preview Panel |
|------|-----------|-------|---------------|-------|---------------|
| Chat | `~/.myai/chat/` | `chat` (all tools denied) | User's choice | None | None |
| Agent | `~/.myai/agent/` | `build` (default) | User's choice | All | Optional |
| Image | `~/.myai/image/` | `image` (all tools denied) | `gemini-3-pro-image` | None | Image gallery |

### UI Layout (after transformation)

```
[macOS window controls]
+------------------+----------------------------------------+------------------+
| Left Rail (~80px)| Chat Area                              | Preview Panel    |
|                  |                                        | (when applicable)|
| [icon] Chat      | [Session Header: model selector]      |                  |
| [icon] Agent     |                                        | Image: gallery   |
| [icon] Image     | [Message Timeline]                     | Agent: (future)  |
|                  |                                        |                  |
|------------------| [Prompt Input]                         |                  |
| Session List     | [Agent/Model selector bar]             |                  |
|                  |                                        |                  |
| - Session 1      |                                        |                  |
| - Session 2      |                                        |                  |
| - ...            |                                        |                  |
|                  |                                        |                  |
| [Settings]       |                                        |                  |
+------------------+----------------------------------------+------------------+
```

### What Gets Removed

- Top search bar (code search)
- Right-side icons (file tree, terminal, diff panel toggles)
- File tree panel (`SessionSidePanel`)
- Terminal panel (`TerminalPanel`)
- Diff/Review panel (`SessionReviewTab`)
- Workspace/project picker and management
- Branch/git info in new session view
- `plan` agent (merged concept: Agent mode is the "build" agent)

### What Gets Added

- Mode switcher in left rail (Chat / Agent / Image)
- `chat` agent (no tools)
- `image` agent (no tools, image model)
- Prompt template buttons on new session view
- Image gallery in preview panel
- First-launch onboarding (configure provider + API key)
- Auto-create workspace directories on startup

---

## Phase 1: Backend - Image Output Pipeline

### Task 1: Add `responseModalities` for image-capable models

**Files:**
- Modify: `packages/opencode/src/provider/provider.ts`

**Intent:** When a model has `output.image` capability (like `gemini-3-pro-image`), pass `responseModalities: ["TEXT", "IMAGE"]` to `@ai-sdk/google` so the model actually returns images.

**Steps:**
1. In the provider options builder, detect models with `capabilities.output.image`
2. For Google/Vertex providers, add `responseModalities: ["TEXT", "IMAGE"]` to provider options
3. Verify: check that the option is passed through to `streamText` calls
4. Commit: `feat(provider): enable image output for capable models`

**Acceptance criteria:**
- `gemini-3-pro-image` requests include `responseModalities: ["TEXT", "IMAGE"]`
- Non-image models are unaffected

### Task 2: Handle `file` events in session processor

**Files:**
- Modify: `packages/opencode/src/session/processor.ts`

**Intent:** The AI SDK emits `type: "file"` events when a model returns images. Currently these are dropped as "unhandled". Add a handler that stores them as `FilePart` on the assistant message.

**Steps:**
1. In the `fullStream` switch statement, add `case "file":`
2. Create a `FilePart` from the event data (base64 -> `data:` URL, mimeType from event)
3. Call `Session.appendPart()` to persist the file part
4. Verify: send a message to an image model, check that `file` parts appear in the session data
5. Commit: `feat(session): handle file events from model image output`

**Acceptance criteria:**
- Image output from `gemini-3-pro-image` is stored as `FilePart` in the session
- Text output still works normally alongside images
- No regression for non-image models

### Task 3: Add `chat` and `image` agents

**Files:**
- Modify: `packages/opencode/src/agent/agent.ts`

**Intent:** Add two new built-in agents: `chat` (no tools, pure conversation) and `image` (no tools, for image generation models).

**Steps:**
1. Add `chat` agent definition with `"*": "deny"` permissions
2. Add `image` agent definition with `"*": "deny"` permissions
3. Both should be `mode: "primary"`, `native: true`
4. Commit: `feat(agent): add chat and image agents`

**Acceptance criteria:**
- `chat` agent allows no tool use
- `image` agent allows no tool use
- Both appear in agent list
- Existing `build` agent unchanged

---

## Phase 2: Frontend - Image Rendering

### Task 4: Render `file` parts in assistant messages

**Files:**
- Modify: `packages/ui/src/components/message-part.tsx`

**Intent:** Currently only `text`, `reasoning`, `tool`, and `compaction` parts have renderers. Add a renderer for `file` type parts so images from model output display inline in the chat.

**Steps:**
1. Register a `file` part renderer in the part component registry
2. For `image/*` mime types: render `<img>` with the data URL, max-width constrained, border-radius
3. For non-image files: render a file badge/link (fallback)
4. Add click-to-expand behavior (open in dialog or full-size view)
5. Style: `max-w-md rounded-lg cursor-pointer` or similar
6. Commit: `feat(ui): render image file parts in assistant messages`

**Acceptance criteria:**
- Images from model output render inline in chat
- Images have reasonable max dimensions
- Click to view full size
- Non-image file parts show a fallback

---

## Phase 3: UI Cleanup - Remove Developer Features

### Task 5: Remove top bar developer elements

**Files:**
- Modify: `packages/app/src/components/titlebar.tsx`
- Modify: `packages/app/src/components/session/session-header.tsx` (if search bar is here)

**Intent:** Remove the code search bar (center top) and the right-side panel toggle icons (file tree, terminal, diff review toggles).

**Steps:**
1. Remove search input from titlebar
2. Remove file tree / terminal / diff panel toggle buttons
3. Keep window controls (macOS traffic lights) and basic navigation
4. Commit: `feat(app): remove developer toolbar elements`

**Acceptance criteria:**
- Top bar is clean, no code search or panel toggles
- Window controls still work

### Task 6: Remove file tree, terminal, and diff panels from session page

**Files:**
- Modify: `packages/app/src/pages/session.tsx`

**Intent:** Stop rendering `SessionSidePanel` (file tree), `TerminalPanel`, and `SessionReviewTab` (diff). The session page becomes just: header + message timeline + composer.

**Steps:**
1. Remove `<SessionSidePanel>` rendering
2. Remove `<TerminalPanel>` rendering
3. Remove `<SessionReviewTab>` and review-related resize handles
4. Remove associated state management (review panel width, terminal height, file tree width)
5. Keep all providers in the tree (TerminalProvider, FileProvider, CommentsProvider) -- the prompt input depends on them existing even if the panels aren't shown
6. Verify: session page renders cleanly with only chat
7. Commit: `feat(app): remove file tree, terminal, and diff panels`

**Acceptance criteria:**
- Session page shows only message timeline + input
- No file tree, terminal, or diff UI
- Prompt input still works (providers are still mounted)

### Task 7: Simplify desktop menu

**Files:**
- Modify: `packages/desktop-electron/src/main/menu.ts`

**Intent:** Remove menu items for features that no longer exist.

**Steps:**
1. Remove: file tree toggle, terminal toggle, review panel toggle
2. Remove: workspace-related menu items
3. Keep: quit, copy, paste, zoom, new session, sidebar toggle, settings
4. Commit: `feat(desktop): simplify menu`

**Acceptance criteria:**
- No menu items reference removed features
- Basic app menus work

---

## Phase 4: UI Restructure - Mode Switcher & Sidebar

### Task 8: Transform left rail into mode switcher

**Files:**
- Modify: `packages/app/src/pages/layout/sidebar-shell.tsx`
- Modify: `packages/app/src/pages/layout.tsx`

**Intent:** Replace the current left rail (workspace icons, add project, settings) with three mode buttons: Chat, Agent, Image. Each mode switches to its corresponding workspace directory and agent configuration.

**Steps:**
1. Replace rail content with three mode buttons (icon + label, ~80px wide rail)
2. Each button: icon on top, label below (e.g., chat bubble icon + "Chat")
3. Active mode highlighted
4. Clicking a mode: navigate to that mode's workspace directory, set default agent
5. Keep settings icon at bottom of rail
6. Commit: `feat(app): mode switcher in left rail`

**Acceptance criteria:**
- Three modes visible in left rail with icons and labels
- Clicking switches to that mode's workspace/session list
- Active mode visually indicated

### Task 9: Simplify sidebar session list

**Files:**
- Modify: `packages/app/src/pages/layout/sidebar-project.tsx`
- Modify: `packages/app/src/pages/layout/sidebar-workspace.tsx`

**Intent:** Remove workspace sections, project management, drag-to-reorder. The sidebar shows only the session list for the current mode with a "New Session" button.

**Steps:**
1. Remove workspace expand/collapse, rename, delete UI
2. Remove project icon, project context menu, project path display
3. Keep: session list, session click-to-navigate, session context menu (rename, delete)
4. Keep: "New Session" button
5. Commit: `feat(app): simplify sidebar to session list only`

**Acceptance criteria:**
- Sidebar shows only "New Session" + session list
- No workspace/project management UI
- Sessions still navigable and manageable (rename, delete)

### Task 10: Fixed workspace auto-setup

**Files:**
- Modify: `packages/desktop-electron/src/renderer/index.tsx`
- Modify: `packages/app/src/pages/layout.tsx` (or routing logic)

**Intent:** On startup, auto-create `~/.myai/{chat,agent,image}/` directories if they don't exist. Skip the home/project picker page. Navigate directly to the last-used mode.

**Steps:**
1. On app init, ensure workspace directories exist (use Node fs via Electron main process IPC)
2. Skip the home route (`/`), redirect to last-used mode's workspace
3. Remove the home/project picker page from routing
4. Store last-used mode in electron-store
5. Commit: `feat: auto-setup workspaces and skip project picker`

**Acceptance criteria:**
- First launch creates `~/.myai/chat/`, `~/.myai/agent/`, `~/.myai/image/`
- App opens directly to a session page, no project picker
- Remembers last-used mode across restarts

---

## Phase 5: New Session View & Prompt Templates

### Task 11: Replace new session view with prompt templates

**Files:**
- Modify: `packages/app/src/components/session/session-new-view.tsx`

**Intent:** Replace the developer-oriented new session view (project path, branch, last modified) with a welcoming view showing prompt template buttons. Templates vary by mode.

**Steps:**
1. Remove project path, branch info, last modified timestamp
2. Add welcome message per mode:
   - Chat: "Start a conversation"
   - Agent: "What would you like to build?"
   - Image: "Describe the image you want"
3. Add template button grid below welcome message
4. Each button: short label, clicking fills the prompt input via `usePrompt()` setter
5. Template data structure: `{ label: string, prompt: string, icon?: string }[]`
6. Per-mode template lists:
   - Chat: "Explain a concept", "Write an email", "Summarize text", "Translate"
   - Agent: "Create a PPT", "Build a webpage", "Analyze data", "Write a script"
   - Image: "Landscape photo", "Logo design", "Illustration", "Product shot", "Portrait", "Poster"
7. Commit: `feat(app): prompt template buttons on new session view`

**Acceptance criteria:**
- New session shows welcome message + template buttons
- Clicking a template fills the prompt input
- Different templates per mode

---

## Phase 6: Image Gallery Preview Panel

### Task 12: Add image gallery to preview panel

**Files:**
- Create: `packages/app/src/pages/session/image-gallery.tsx`
- Modify: `packages/app/src/pages/session.tsx` (conditionally render gallery panel)

**Intent:** In Image mode, the right-side preview panel shows a gallery of all images generated in the current session. Grid layout with thumbnails, click to expand.

**Steps:**
1. Create `image-gallery.tsx`:
   - Read all message parts for current session
   - Filter `FilePart` with `image/*` mime type
   - Render as thumbnail grid (CSS grid, 2-3 columns)
   - Each thumbnail: image, generation prompt below, timestamp
   - Click: open full-size in dialog
2. In session page: conditionally render the gallery panel when in Image mode
3. Reuse the existing side panel resize handle and toggle mechanism from the review panel
4. Commit: `feat(app): image gallery preview panel`

**Acceptance criteria:**
- Image mode sessions show gallery in right panel
- All generated images from session appear as thumbnails
- Click to view full size
- Gallery updates as new images are generated

---

## Phase 7: First-Launch Onboarding

### Task 13: Create onboarding flow

**Files:**
- Create: `packages/app/src/pages/onboarding.tsx`
- Modify: `packages/app/src/app.tsx` (route + conditional redirect)

**Intent:** First-time users see a guided setup: pick a provider, enter API key, select default model. After setup, they go directly to Chat mode.

**Steps:**
1. Create onboarding page with steps:
   - Step 1: Welcome message + "Get Started" button
   - Step 2: Select provider (OpenAI / Anthropic / Google, with logos)
   - Step 3: Enter API key (with link to "how to get one")
   - Step 4: Test connection + select default model
   - Step 5: Done, go to Chat
2. Store "onboarding completed" flag in electron-store
3. On app start: if flag is not set, redirect to onboarding
4. Settings page should allow re-configuring later
5. Commit: `feat(app): first-launch onboarding flow`

**Acceptance criteria:**
- First launch shows onboarding
- User can configure provider + API key
- After onboarding, goes to Chat mode
- Subsequent launches skip onboarding

---

## Phase 8: Polish

### Task 14: App branding

**Files:**
- Modify: `packages/desktop-electron/src/main/index.ts` (window title)
- Modify: `packages/desktop-electron/src/renderer/index.html` (page title)

**Intent:** Update app name and title to reflect the new product identity.

**Steps:**
1. Change window title
2. Update HTML title
3. Commit: `feat(desktop): update branding`

### Task 15: Image mode model configuration

**Files:**
- Modify: `packages/app/src/components/session/session-header.tsx` or composer bar

**Intent:** In Image mode, allow configuring image-specific parameters (resolution, aspect ratio) alongside model selection.

**Steps:**
1. When in Image mode, show resolution/aspect ratio options near model selector
2. Options: 1024x1024, 1536x1024 (landscape), 1024x1536 (portrait)
3. Pass these as provider options to the model
4. Commit: `feat(app): image mode resolution config`

**Acceptance criteria:**
- Image mode shows resolution options
- Selected resolution is passed to the model

---

## Execution Order

```
Phase 1 (Backend):  Task 1 -> Task 2 -> Task 3
Phase 2 (Render):   Task 4
Phase 3 (Cleanup):  Task 5 -> Task 6 -> Task 7
Phase 4 (Restructure): Task 8 -> Task 9 -> Task 10
Phase 5 (Templates): Task 11
Phase 6 (Gallery):  Task 12
Phase 7 (Onboarding): Task 13
Phase 8 (Polish):   Task 14 -> Task 15
```

Phase 1-2 and Phase 3 can be done in parallel.
Phase 4 depends on Phase 3.
Phase 5-8 can be done in any order after Phase 4.

## Estimated Total

- **Backend changes**: ~80 lines (provider + processor + agents)
- **UI removal**: ~200 lines deleted/modified
- **UI restructure**: ~300 lines modified
- **New features**: ~400 lines new (templates, gallery, onboarding)
- **Total**: ~600-800 lines of net change
