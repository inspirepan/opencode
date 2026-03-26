import { createStore } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"

export type PreviewItem = {
  path: string
  content: string
  ext: string
  binary?: boolean
}

const PREFIX = "preview://"

export const previewTab = (path: string) => `${PREFIX}${path}`
export const previewPath = (tab: string) => (tab.startsWith(PREFIX) ? tab.slice(PREFIX.length) : undefined)

export const { use: usePreview, provider: PreviewProvider } = createSimpleContext({
  name: "Preview",
  init: () => {
    const [store, set] = createStore({
      items: [] as PreviewItem[],
    })

    return {
      items: () => store.items,
      get: (path: string) => store.items.find((i) => i.path === path),
      present(item: PreviewItem) {
        const idx = store.items.findIndex((i) => i.path === item.path)
        if (idx >= 0) {
          set("items", idx, item)
        } else {
          set("items", [...store.items, item])
        }
      },
      close(path: string) {
        set("items", store.items.filter((i) => i.path !== path))
      },
      clear() {
        set("items", [])
      },
    }
  },
})
