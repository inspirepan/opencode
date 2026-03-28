import { createMemo, For, Show } from "solid-js"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { useData } from "@opencode-ai/ui/context/data"
import { ImagePreview } from "@opencode-ai/ui/image-preview"
import { useSync } from "@/context/sync"
import { useLanguage } from "@/context/language"
import { useSessionLayout } from "./session-layout"

type Image = {
  src: string
  alt: string
  id: string
}

export function ImageGallery() {
  const sync = useSync()
  const data = useData()
  const dialog = useDialog()
  const language = useLanguage()
  const { params } = useSessionLayout()

  const images = createMemo(() => {
    const sid = params.id
    if (!sid) return []
    const base = data.serverUrl ?? ""
    const msgs = sync.data.message[sid] ?? []
    const out: Image[] = []
    for (const msg of msgs) {
      const parts = sync.data.part[msg.id] ?? []
      for (const p of parts) {
        if (p.type !== "file") continue
        if (!p.mime.startsWith("image/")) continue
        const url = p.url.startsWith("data:") ? p.url : base + p.url
        out.push({ src: url, alt: p.filename ?? "image", id: p.id })
      }
    }
    return out
  })

  return (
    <div class="h-full overflow-y-auto">
      <Show
        when={images().length > 0}
        fallback={
          <div class="h-full flex items-center justify-center pb-32">
            <div class="text-12-regular text-text-weak">{language.t("dandelion.image.gallery.empty")}</div>
          </div>
        }
      >
        <div class="grid grid-cols-2 gap-2 p-3">
          <For each={images()}>
            {(img) => (
              <div
                class="relative rounded-lg overflow-hidden cursor-pointer bg-background-stronger hover:ring-2 hover:ring-border-base transition-shadow"
                onClick={() => dialog.show(() => <ImagePreview src={img.src} alt={img.alt} download />)}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  class="w-full object-cover aspect-square"
                  loading="lazy"
                />
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
