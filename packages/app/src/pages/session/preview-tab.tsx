import { createEffect, createMemo, createSignal, onCleanup, Show, type Accessor } from "solid-js"
import { Marked } from "marked"
import { renderMermaidSVG } from "beautiful-mermaid"
import { usePreview } from "@/context/preview"
import { useLanguage } from "@/context/language"
import { monoFontFamily, useSettings } from "@/context/settings"

const MD_EXTS = new Set([".md", ".markdown"])
const MERMAID_EXTS = new Set([".mmd", ".mermaid"])
const PDF_EXTS = new Set([".pdf"])

const SANS = '"Inter","Inter Fallback",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif'

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

export function PreviewTab(props: { resizing?: Accessor<boolean> }) {
  const preview = usePreview()
  const language = useLanguage()
  const settings = useSettings()

  const item = createMemo(() => preview.current())
  const mono = createMemo(() => monoFontFamily(settings.appearance.font()))
  const isPdf = createMemo(() => item()?.ext === ".pdf" && item()?.binary)

  // PDF: create blob URL from base64
  const [pdfUrl, setPdfUrl] = createSignal("")
  createEffect(() => {
    const current = item()
    if (!current || !isPdf()) {
      setPdfUrl("")
      return
    }
    const bytes = Uint8Array.from(atob(current.content), (c) => c.charCodeAt(0))
    const blob = new Blob([bytes], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    setPdfUrl(url)
    onCleanup(() => URL.revokeObjectURL(url))
  })

  const srcdoc = createMemo(() => {
    const current = item()
    if (!current || isPdf()) return ""
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
          font: "Inter",
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
        <Show
          when={isPdf()}
          fallback={
            <iframe
              class="flex-1 w-full border-none bg-white"
              classList={{ "pointer-events-none": !!props.resizing?.() }}
              sandbox="allow-scripts allow-same-origin"
              srcdoc={srcdoc()}
            />
          }
        >
          <iframe
            class="flex-1 w-full border-none"
            classList={{ "pointer-events-none": !!props.resizing?.() }}
            src={pdfUrl()}
          />
        </Show>
      </Show>
    </div>
  )
}
