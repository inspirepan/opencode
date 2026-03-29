import z from "zod"
import * as path from "path"
import { readdirSync } from "fs"
import { Tool } from "./tool"
import { Instance } from "../project/instance"
import { Filesystem } from "../util/filesystem"
import DESCRIPTION from "./present.txt"

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".avif"])
const SUPPORTED = new Set([".html", ".htm", ".svg", ".md", ".markdown", ".mmd", ".mermaid", ".pdf", ".pptx", ".ppt", ...IMAGE_EXTS])
const MD_EXTS = new Set([".md", ".markdown"])
const BINARY_EXTS = new Set([".pdf", ...IMAGE_EXTS])
const EXTERNAL_EXTS = new Set([".pptx", ".ppt"])
const MAX_SIZE = 2 * 1024 * 1024
const MAX_BINARY_SIZE = 20 * 1024 * 1024
const MAX_GALLERY_IMAGES = 20
const MAX_GALLERY_SIZE = 30 * 1024 * 1024

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".avif": "image/avif",
}

async function inlineLocal(src: string, dir: string): Promise<string | undefined> {
  if (/^https?:\/\//.test(src) || src.startsWith("data:")) return undefined
  const abs = path.isAbsolute(src) ? src : path.resolve(dir, src)
  const ext = path.extname(abs).toLowerCase()
  const mime = MIME[ext]
  if (!mime) return undefined
  try {
    const bytes = await Filesystem.readBytes(abs)
    return `data:${mime};base64,${bytes.toString("base64")}`
  } catch {
    return undefined
  }
}

async function inlineMdImages(md: string, dir: string): Promise<string> {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let result = md
  let match: RegExpExecArray | null
  while ((match = regex.exec(md)) !== null) {
    const [full, alt, src] = match
    const data = await inlineLocal(src, dir)
    if (data) result = result.replace(full, `![${alt}](${data})`)
  }
  return result
}

async function inlineHtmlImages(html: string, dir: string): Promise<string> {
  const regex = /<img\b([^>]*)\bsrc\s*=\s*"([^"]+)"([^>]*)>/gi
  let result = html
  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    const [full, before, src, after] = match
    const data = await inlineLocal(src, dir)
    if (data) result = result.replace(full, `<img${before}src="${data}"${after}>`)
  }
  return result
}

async function gallery(dir: string) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files: { name: string; path: string; size: number; mtime: number }[] = []
  for (const ent of entries) {
    if (!ent.isFile()) continue
    const ext = path.extname(ent.name).toLowerCase()
    if (!IMAGE_EXTS.has(ext)) continue
    const full = path.join(dir, ent.name)
    const s = Filesystem.stat(full)
    if (!s) continue
    files.push({ name: ent.name, path: full, size: Number(s.size), mtime: Number(s.mtimeMs) })
  }
  files.sort((a, b) => b.mtime - a.mtime)

  const items: { name: string; data: string; mime: string }[] = []
  let total = 0
  for (const f of files) {
    if (items.length >= MAX_GALLERY_IMAGES) break
    if (total + f.size > MAX_GALLERY_SIZE) break
    const ext = path.extname(f.name).toLowerCase()
    const mime = MIME[ext]
    if (!mime) continue
    const bytes = await Filesystem.readBytes(f.path)
    items.push({ name: f.name, data: bytes.toString("base64"), mime })
    total += f.size
  }
  return { items, found: files.length }
}

export const PresentTool = Tool.define("present_file", {
  description: DESCRIPTION,
  parameters: z.object({
    filePath: z.string().describe("The absolute path to the file or directory to present"),
  }),
  async execute(params, ctx) {
    let filepath = params.filePath
    if (!path.isAbsolute(filepath)) {
      filepath = path.resolve(Instance.directory, filepath)
    }

    const stat = Filesystem.stat(filepath)
    if (!stat) throw new Error(`Path not found: ${filepath}`)

    // Directory: scan for images and return gallery
    if (stat.isDirectory()) {
      const title = path.relative(Instance.worktree, filepath) || path.basename(filepath)
      const result = await gallery(filepath)
      if (result.items.length === 0) throw new Error(`No image files found in directory: ${filepath}`)
      const shown = result.items.length
      const omitted = result.found - shown
      return {
        title,
        output: `Presenting directory: ${title} (${shown} image${shown > 1 ? "s" : ""}${omitted > 0 ? `, ${omitted} omitted` : ""})`,
        metadata: {
          filepath,
          content: JSON.stringify(result.items),
          ext: ".gallery",
          binary: false,
          external: false,
          directory: true,
          truncated: omitted > 0,
        },
      }
    }

    const ext = path.extname(filepath).toLowerCase()
    if (!SUPPORTED.has(ext)) {
      throw new Error(
        `Unsupported file type: ${ext}. Supported types: ${[...SUPPORTED].join(", ")}`,
      )
    }

    const title = path.relative(Instance.worktree, filepath)

    // External files (PPTX, PPT): open with system default app
    if (EXTERNAL_EXTS.has(ext)) {
      return {
        title,
        output: `Presenting file: ${title} (opening with system application)`,
        metadata: {
          filepath,
          content: "",
          ext,
          binary: false,
          external: true,
          directory: false,
          truncated: false,
        },
      }
    }

    // Binary files (PDF, images): read as base64
    if (BINARY_EXTS.has(ext)) {
      if (stat.size > MAX_BINARY_SIZE) throw new Error(`File too large (${stat.size} bytes). Maximum: ${MAX_BINARY_SIZE} bytes`)
      const bytes = await Filesystem.readBytes(filepath)
      const base64 = bytes.toString("base64")
      return {
        title,
        output: `Presenting file: ${title}`,
        metadata: {
          filepath,
          content: base64,
          ext,
          binary: true,
          external: false,
          directory: false,
          truncated: false,
        },
      }
    }

    // Text files
    if (stat.size > MAX_SIZE) throw new Error(`File too large (${stat.size} bytes). Maximum: ${MAX_SIZE} bytes`)

    let content = await Filesystem.readText(filepath)

    const dir = path.dirname(filepath)
    if (MD_EXTS.has(ext)) {
      content = await inlineMdImages(content, dir)
    } else if (ext === ".html" || ext === ".htm") {
      content = await inlineHtmlImages(content, dir)
    }

    return {
      title,
      output: `Presenting file: ${title}`,
      metadata: {
        filepath,
        content,
        ext,
        binary: false,
        external: false,
        directory: false,
        truncated: false,
      },
    }
  },
})
