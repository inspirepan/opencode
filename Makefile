.PHONY: check test test-e2e test-all

# Fast: typecheck all packages in parallel via turbo
check:
	bun turbo typecheck

# Medium: typecheck + unit tests (no server needed)
test:
	bun turbo typecheck
	cd packages/opencode && bun test
	cd packages/app && bun test:unit

# E2E only (requires backend running on :4096)
test-e2e:
	cd packages/app && bun test:e2e

# Full: typecheck + unit + e2e (starts backend automatically)
test-all:
	bun turbo typecheck
	cd packages/opencode && bun test
	cd packages/app && bun test:unit
	@echo "Starting backend for e2e..."
	cd packages/opencode && bun run --conditions=browser ./src/index.ts serve --port 4096 &
	@sleep 3
	cd packages/app && bun test:e2e; status=$$?; kill %1 2>/dev/null; exit $$status
