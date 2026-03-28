import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"
import { app } from "electron"

const MARKER = ".dandelion-system-skills.marker"

function walk(dir: string): string[] {
  const result: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) result.push(...walk(full))
    else result.push(full)
  }
  return result.sort()
}

function fingerprint(dir: string): string {
  const hash = createHash("sha256")
  hash.update("v1")
  for (const file of walk(dir)) {
    hash.update(relative(dir, file))
    hash.update(readFileSync(file))
  }
  return hash.digest("hex")
}

function source(): string {
  // In development, assets are relative to project root
  // In production, they're in process.resourcesPath
  if (app.isPackaged) return join(process.resourcesPath, "skills", ".system")
  return join(__dirname, "..", "..", "assets", "skills", ".system")
}

export function syncSystemSkills(agent: string) {
  const src = source()
  if (!existsSync(src)) return

  const target = join(agent, ".agents", "skills", ".system")
  const marker = join(target, MARKER)

  const hash = fingerprint(src)

  if (existsSync(marker)) {
    try {
      if (readFileSync(marker, "utf-8").trim() === hash) return
    } catch {}
  }

  // Remove stale .system directory
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true })
  }

  // Copy all files from source to target
  mkdirSync(target, { recursive: true })
  for (const file of walk(src)) {
    const rel = relative(src, file)
    const dest = join(target, rel)
    mkdirSync(join(dest, ".."), { recursive: true })
    writeFileSync(dest, readFileSync(file))
  }

  // Write marker
  writeFileSync(marker, hash)
}
