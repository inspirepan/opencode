import { createEffect, createMemo, createSignal, For, onCleanup, Show, type Accessor } from "solid-js"
import { Marked } from "marked"
import { renderMermaidSVG } from "beautiful-mermaid"
import * as pdfjsLib from "pdfjs-dist"
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { AppIcon } from "@opencode-ai/ui/app-icon"
import { ImagePreview } from "@opencode-ai/ui/image-preview"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { usePreview } from "@/context/preview"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { monoFontFamily, useSettings } from "@/context/settings"

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const MD_EXTS = new Set([".md", ".markdown"])
const MERMAID_EXTS = new Set([".mmd", ".mermaid"])
const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".avif"])

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".avif": "image/avif",
}

const SANS = '"Geist","Geist Fallback",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'

function mdStyle(mono: string): string {
  return `
html,body{margin:0;padding:0;font-family:${SANS};color:#1a1a1a;background:#fff;line-height:1.6}
body{max-width:720px;margin:0 auto;padding:24px 32px}
h1,h2,h3,h4,h5,h6{margin-top:1.4em;margin-bottom:0.6em;line-height:1.3}
h1{font-size:1.8em;border-bottom:1px solid #e5e5e5;padding-bottom:0.3em}
h2{font-size:1.4em;border-bottom:1px solid #e5e5e5;padding-bottom:0.25em}
h3{font-size:1.2em}
a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}
code{font-family:${mono};font-size:0.9em;background:#f3f3f3;padding:0.15em 0.35em;border-radius:4px}
pre{background:#f6f6f6;border-radius:6px;padding:14px 18px;overflow-x:auto}
pre code{background:none;padding:0}
blockquote{margin:0;padding:0.5em 1em;border-left:3px solid #d0d0d0;color:#555}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px 12px;text-align:left}th{background:#f6f6f6}
img{max-width:100%;height:auto}
hr{border:none;border-top:1px solid #e5e5e5;margin:1.5em 0}
ul,ol{padding-left:1.6em}
`.trim()
}

const parser = new Marked()

function md(src: string): string {
  return parser.parse(src, { async: false }) as string
}

async function renderPdfPages(base64: string, scale = 2): Promise<string[]> {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext("2d")!
    await page.render({ canvasContext: ctx, viewport }).promise
    pages.push(canvas.toDataURL("image/png"))
    page.cleanup()
  }
  pdf.destroy()
  return pages
}

function slidesHtml(pages: string[]): string {
  const total = pages.length
  const imgs = pages.map((uri, i) =>
    `<div style="position:relative;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.08),0 4px 16px rgba(0,0,0,0.06);border-radius:4px;overflow:hidden;width:100%;max-width:100%">` +
    `<img src="${uri}" style="width:100%;display:block" alt="Page ${i + 1}" />` +
    `<div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.45);color:#fff;padding:2px 10px;font-size:12px;border-radius:4px;font-family:${SANS}">Page ${i + 1} / ${total}</div>` +
    `</div>`
  ).join("")
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#f5f5f5;font-family:${SANS}}body{padding:16px;display:flex;flex-direction:column;align-items:center;gap:16px}</style></head><body>${imgs}</body></html>`
}

function ExternalCard(props: { path: string; ext: string }) {
  const platform = usePlatform()
  const language = useLanguage()
  const name = props.path.split("/").pop() ?? props.path
  const icon = () => platform.os === "macos" ? "keynote" as const : "powerpoint" as const

  return (
    <div class="flex-1 flex items-center justify-center bg-background-stronger">
      <button
        type="button"
        onClick={() => platform.openPath?.(props.path)}
        class="flex flex-col items-center gap-4 px-10 py-8 bg-background-base border border-border-weak-base rounded-xl cursor-pointer transition-shadow transition-colors hover:shadow-md hover:border-border-base"
        style={{ "max-width": "320px" }}
      >
        <div class="size-10 [&_[data-component=app-icon]]:size-10">
          <AppIcon id={icon()} />
        </div>
        <div class="text-center">
          <div
            class="text-14-medium text-text-strong"
            style={{ "word-break": "break-all", "max-width": "240px" }}
          >
            {name}
          </div>
          <div class="text-12-regular text-text-weak mt-1.5">
            {language.t("dandelion.preview.openExternal")}
          </div>
        </div>
      </button>
    </div>
  )
}

type GalleryEntry = { name: string; data: string; mime: string }

function GalleryView(props: { content: string; path: string }) {
  const dialog = useDialog()

  const entries = createMemo(() => {
    try {
      return JSON.parse(props.content) as GalleryEntry[]
    } catch {
      return []
    }
  })

  const src = (entry: GalleryEntry) => `data:${entry.mime};base64,${entry.data}`

  return (
    <div class="h-full overflow-y-auto">
      <Show
        when={entries().length > 0}
        fallback={
          <div class="h-full flex items-center justify-center">
            <div class="text-12-regular text-text-weak">No images</div>
          </div>
        }
      >
        <div class="grid grid-cols-2 gap-2 p-3">
          <For each={entries()}>
            {(entry) => (
              <div
                class="relative rounded-lg overflow-hidden cursor-pointer bg-background-stronger hover:ring-2 hover:ring-border-base transition-shadow"
                onClick={() => dialog.show(() => <ImagePreview src={src(entry)} alt={entry.name} download />)}
              >
                <img
                  src={src(entry)}
                  alt={entry.name}
                  class="w-full object-cover aspect-square"
                  loading="lazy"
                />
                <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1.5">
                  <div class="text-11-regular text-white truncate">{entry.name}</div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

function ImageView(props: { content: string; ext: string }) {
  const dialog = useDialog()
  const mime = () => MIME[props.ext] ?? "image/png"
  const src = () => `data:${mime()};base64,${props.content}`

  return (
    <div
      class="flex-1 flex items-center justify-center bg-background-stronger p-4 cursor-pointer"
      onClick={() => dialog.show(() => <ImagePreview src={src()} alt="preview" download />)}
    >
      <img
        src={src()}
        alt="preview"
        class="max-w-full max-h-full object-contain rounded"
      />
    </div>
  )
}

export function PreviewTab(props: { path?: string; resizing?: Accessor<boolean> }) {
  const preview = usePreview()
  const language = useLanguage()
  const settings = useSettings()

  const item = createMemo(() => (props.path ? preview.get(props.path) : undefined))
  const mono = createMemo(() => monoFontFamily(settings.appearance.font()))
  const isPdf = createMemo(() => item()?.ext === ".pdf" && item()?.binary)
  const isExternal = createMemo(() => !!item()?.external)
  const isImage = createMemo(() => IMAGE_EXTS.has(item()?.ext ?? "") && item()?.binary)
  const isGallery = createMemo(() => !!item()?.directory)
  const isUrl = createMemo(() => !!item()?.url)

  // PDF: render pages as images via pdf.js
  const [pdfSrcdoc, setPdfSrcdoc] = createSignal("")
  createEffect(() => {
    const current = item()
    if (!current || !isPdf()) {
      setPdfSrcdoc("")
      return
    }
    void renderPdfPages(current.content).then((pages) => {
      setPdfSrcdoc(slidesHtml(pages))
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      setPdfSrcdoc(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:${SANS};color:#c00;padding:24px}</style></head><body><h3>PDF render error</h3><pre>${msg}</pre></body></html>`)
    })
  })

  const srcdoc = createMemo(() => {
    const current = item()
    if (!current || isPdf() || isImage() || isGallery()) return ""
    if (current.ext === ".svg") {
      return `<!DOCTYPE html><html><head><style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden}svg{max-width:100%;max-height:100%;height:auto;width:auto}</style></head><body>${current.content}</body></html>`
    }
    if (MD_EXTS.has(current.ext)) {
      const html = md(current.content)
      return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${mdStyle(mono())}</style></head><body>${html}</body></html>`
    }
    if (MERMAID_EXTS.has(current.ext)) {
      try {
        const svg = renderMermaidSVG(current.content, {
          bg: "#ffffff",
          fg: "#1a1a1a",
          font: "Geist",
          transparent: true,
          padding: 40,
        })
        return `<!DOCTYPE html><html><head><style>html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden}svg{max-width:100%;max-height:100%;height:auto;width:auto}</style></head><body>${svg}</body></html>`
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:${SANS};color:#c00;padding:24px}</style></head><body><h3>Mermaid render error</h3><pre>${msg}</pre></body></html>`
      }
    }
    return current.content
  })

  return (
    <div class="h-full flex flex-col">
      <Show
        when={item()}
        fallback={
          <div class="flex-1 flex items-center justify-center text-center">
            <div class="text-12-regular text-text-weak px-6">
              {language.t("dandelion.preview.empty")}
            </div>
          </div>
        }
      >
        <Show when={isGallery()}>
          <GalleryView content={item()!.content} path={item()!.path} />
        </Show>
        <Show when={isImage() && !isGallery()}>
          <ImageView content={item()!.content} ext={item()!.ext} />
        </Show>
        <Show when={isExternal() && !isImage() && !isGallery()}>
          <ExternalCard path={item()!.path} ext={item()!.ext} />
        </Show>
        <Show when={isUrl()}>
          <iframe
            class="flex-1 w-full border-none bg-white"
            classList={{ "pointer-events-none": !!props.resizing?.() }}
            src={item()!.url}
          />
        </Show>
        <Show when={!isExternal() && !isImage() && !isGallery() && !isUrl()}>
          <iframe
            class="flex-1 w-full border-none bg-white"
            classList={{ "pointer-events-none": !!props.resizing?.() }}
            sandbox="allow-scripts allow-same-origin"
            srcdoc={isPdf() ? pdfSrcdoc() : srcdoc()}
          />
        </Show>
      </Show>
    </div>
  )
}
