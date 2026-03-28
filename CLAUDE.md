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

# Packaging (Electron DMG)

```bash
cd packages/desktop-electron
bun run build                  # electron-vite build (main + preload + renderer)
CSC_IDENTITY_AUTO_DISCOVERY=false bun run package:mac   # build dmg + zip without code signing
```

Output goes to `packages/desktop-electron/dist/`. The ad-hoc signed app requires right-click -> Open on first launch (no Apple Developer certificate). Set `OPENCODE_CHANNEL=dev|beta|prod` to control productName and appId (defaults to `dev`).
