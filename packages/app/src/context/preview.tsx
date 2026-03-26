import { createStore } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"

export type PreviewItem = {
  path: string
  content: string
  ext: string
}

export const { use: usePreview, provider: PreviewProvider } = createSimpleContext({
  name: "Preview",
  init: () => {
    const [store, set] = createStore({
      items: [] as PreviewItem[],
      active: undefined as string | undefined,
    })

    return {
      items: () => store.items,
      active: () => store.active,
      current: () => store.items.find((i) => i.path === store.active),
      present(item: PreviewItem) {
        const idx = store.items.findIndex((i) => i.path === item.path)
        if (idx >= 0) {
          set("items", idx, item)
        } else {
          set("items", [...store.items, item])
        }
        set("active", item.path)
      },
      setActive(path: string) {
        set("active", path)
      },
      close(path: string) {
        const next = store.items.filter((i) => i.path !== path)
        set("items", next)
        if (store.active === path) {
          set("active", next.length > 0 ? next[next.length - 1]!.path : undefined)
        }
      },
      clear() {
        set("items", [])
        set("active", undefined)
      },
    }
  },
})
