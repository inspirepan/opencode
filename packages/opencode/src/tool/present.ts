import z from "zod"
import * as path from "path"
import { Tool } from "./tool"
import { Instance } from "../project/instance"
import { Filesystem } from "../util/filesystem"
import DESCRIPTION from "./present.txt"

const SUPPORTED = new Set([".html", ".htm", ".svg", ".md", ".markdown", ".mmd", ".mermaid", ".pdf", ".pptx", ".ppt"])
const MD_EXTS = new Set([".md", ".markdown"])
const BINARY_EXTS = new Set([".pdf"])
const EXTERNAL_EXTS = new Set([".pptx", ".ppt"])
const MAX_SIZE = 2 * 1024 * 1024
const MAX_BINARY_SIZE = 20 * 1024 * 1024

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
}

async function inlineImages(md: string, dir: string): Promise<string> {
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let result = md
  let match: RegExpExecArray | null
  while ((match = regex.exec(md)) !== null) {
    const [full, alt, src] = match
    if (/^https?:\/\//.test(src) || src.startsWith("data:")) continue
    const abs = path.isAbsolute(src) ? src : path.resolve(dir, src)
    const ext = path.extname(abs).toLowerCase()
    const mime = MIME[ext]
    if (!mime) continue
    try {
      const bytes = await Filesystem.readBytes(abs)
      const base64 = bytes.toString("base64")
      result = result.replace(full, `![${alt}](data:${mime};base64,${base64})`)
    } catch {
      // skip unreadable files
    }
  }
  return result
}

export const PresentTool = Tool.define("present_file", {
  description: DESCRIPTION,
  parameters: z.object({
    filePath: z.string().describe("The absolute path to the file to present"),
  }),
  async execute(params, ctx) {
    let filepath = params.filePath
    if (!path.isAbsolute(filepath)) {
      filepath = path.resolve(Instance.directory, filepath)
    }

    const ext = path.extname(filepath).toLowerCase()
    if (!SUPPORTED.has(ext)) {
      throw new Error(
        `Unsupported file type: ${ext}. Supported types: ${[...SUPPORTED].join(", ")}`,
      )
    }

    const stat = Filesystem.stat(filepath)
    if (!stat) throw new Error(`File not found: ${filepath}`)
    if (stat.isDirectory()) throw new Error(`Path is a directory, not a file: ${filepath}`)

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
          truncated: false,
        },
      }
    }

    // Binary files (PDF): read as base64
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
          truncated: false,
        },
      }
    }

    // Text files
    if (stat.size > MAX_SIZE) throw new Error(`File too large (${stat.size} bytes). Maximum: ${MAX_SIZE} bytes`)

    let content = await Filesystem.readText(filepath)

    if (MD_EXTS.has(ext)) {
      content = await inlineImages(content, path.dirname(filepath))
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
        truncated: false,
      },
    }
  },
})
