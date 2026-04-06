# Testing

Do not run tests from repo root via `bun test`. Use the Makefile targets:

```bash
make check      # typecheck all packages (fast, ~10s)
make test       # typecheck + unit tests (no server needed)
make test-e2e   # e2e only (needs backend on :4096)
make test-all   # typecheck + unit + e2e (starts backend automatically)
```

Individual package commands:

```bash
cd packages/opencode && bun typecheck    # backend typecheck
cd packages/opencode && bun test         # backend unit tests
cd packages/app && bun typecheck         # frontend typecheck
cd packages/app && bun test:unit         # frontend unit tests
cd packages/app && bun test:e2e          # e2e (needs backend on :4096)
```

After modifying shared UI files (layout.tsx, titlebar.tsx, etc.), always run at least `make test` to verify both dandelion and upstream paths typecheck correctly. The e2e tests only cover the upstream web path (non-dandelion); dandelion UI must be verified manually via `cd packages/desktop-electron && bun run dev`.

# Dandelion Mode

All dandelion-specific UI is gated behind `platform.dandelion` (truthy only in Electron). The existing e2e tests run in Playwright (Chromium) where `platform.dandelion` is `undefined`, so they test the upstream code path only.

# Starter & Skill Requirements Gathering

Agent-mode starters use short, open-ended queries (defined in `packages/app/src/i18n/{en,zh}.ts`) that trigger a requirements-gathering flow before execution. The pattern:

1. **System prompt** (`packages/opencode/src/agent/prompt/dandy-agent.txt`, "Creative tasks" section) defines the general principle: brief creative requests → ask 3-5 key dimensions via question tool before starting.
2. **Each skill** has a "Handling Brief Requests" section listing its specific dimensions. When adding a new agent starter with a corresponding skill, add this section.
3. **Starter queries** should be 1 sentence, not detailed specs — the skill's questionnaire handles the details.

| Starter | Skill | Dimensions |
|---------|-------|------------|
| webpage | `create-web-site` | Multi-round adaptive questionnaire (already complete) |
| pptx | `pptx` | purpose, audience, scope, style, content |
| xlsx | `xlsx` | purpose, structure, data source, features |
| infographic | `infographic` | topic, purpose, audience (skill Step 3-4 adds layout/style) |
| poster | `product-ad-poster` | product, materials (skill Step 2 adds platform + 6 dimensions) |
| files | _(none)_ | No questionnaire (tasks are concrete actions) |

The question UI (`session-question-dock.tsx`) shows pill options with inline descriptions + a free-text input for supplementary notes. The input is NOT a mutually exclusive "custom answer" option — it supplements the pill selection.

# Packaging (Electron DMG)

```bash
cd packages/desktop-electron
bun run build                  # electron-vite build (main + preload + renderer)
CSC_IDENTITY_AUTO_DISCOVERY=false bun run package:mac   # build dmg + zip without code signing
```

Output goes to `packages/desktop-electron/dist/`. The ad-hoc signed app requires right-click -> Open on first launch (no Apple Developer certificate). Set `OPENCODE_CHANNEL=dev|beta|prod` to control productName and appId (defaults to `dev`).

## Cross-arch packaging (e.g. building x64 on Apple Silicon)

The `opencode-cli` sidecar in `resources/` is a platform-native binary. When cross-compiling (e.g. `--x64` on an arm64 host), you **must** replace it with the correct architecture before packaging, otherwise the app will hang on the loading screen because the sidecar cannot execute.

```bash
cd packages/opencode
# Cross-compile the CLI for x64 (Bun supports cross-compilation via compile target)
# Use the build script or a targeted Bun.build() with target "bun-darwin-x64-baseline"
bun run build    # builds all targets; grab dist/opencode-darwin-x64-baseline/bin/opencode

cd ../desktop-electron
cp ../opencode/dist/opencode-darwin-x64-baseline/bin/opencode resources/opencode-cli
codesign --force --sign - resources/opencode-cli
CSC_IDENTITY_AUTO_DISCOVERY=false bunx electron-builder --mac --x64 --config electron-builder.config.ts -c.mac.identity=-
```

After packaging, restore the arm64 sidecar for local dev: `cp ../opencode/dist/opencode-darwin-arm64/bin/opencode resources/opencode-cli`

Checklist for cross-arch builds:
- `resources/opencode-cli` must match the target arch (`file resources/opencode-cli` to verify)
- The `@electron/rebuild` step in electron-builder handles most native `.node` modules, but verify with `find dist/mac/*.app -name '*.node' -exec file {} \;`

# Checking Orphan Child Processes

After exiting Electron dev mode (`bun run dev`), check for leaked child processes:

```bash
ps aux | grep -E '(opencode-cli|workerd)' | grep -v grep
```

If any remain, kill them: `pkill -f opencode-cli && pkill -f workerd`

The sidecar cleanup logic lives in `packages/desktop-electron/src/main/index.ts` (`killSidecar()`) and `packages/desktop-electron/src/main/cli.ts` (`spawnCommand()`, `detached` flag + `treeKill`).
