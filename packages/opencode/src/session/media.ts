import path from "path"
import { Global } from "@/global"
import { Filesystem } from "@/util/filesystem"
import type { SessionID } from "./schema"

const MIME_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
  "image/bmp": ".bmp",
  "image/tiff": ".tiff",
}

export namespace Media {
  export function ext(mime: string) {
    return MIME_EXT[mime] ?? ".bin"
  }

  export function dir(sessionID: SessionID) {
    return path.join(Global.Path.data, "media", sessionID)
  }

  export async function save(input: { sessionID: SessionID; base64: string; mime: string }) {
    const ext = MIME_EXT[input.mime] ?? ".bin"
    const filename = `${Date.now()}${ext}`
    const dest = path.join(dir(input.sessionID), filename)
    await Filesystem.write(dest, Buffer.from(input.base64, "base64"))
    return { mime: input.mime, filename, url: `/session/${input.sessionID}/media/${filename}` }
  }
}
