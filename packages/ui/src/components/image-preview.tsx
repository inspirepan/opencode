import { Dialog as Kobalte } from "@kobalte/core/dialog"
import { Show, createSignal, onCleanup, onMount } from "solid-js"
import { useI18n } from "../context/i18n"
import { IconButton } from "./icon-button"

export interface ImagePreviewProps {
  src: string
  alt?: string
  download?: boolean
}

const MIN_SCALE = 1
const MAX_SCALE = 8
const MIN_W = 300
const MIN_H = 200

type Edge = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se"

export function ImagePreview(props: ImagePreviewProps) {
  const i18n = useI18n()

  // image zoom / pan
  const [scale, setScale] = createSignal(1)
  const [tx, setTx] = createSignal(0)
  const [ty, setTy] = createSignal(0)
  const [smooth, setSmooth] = createSignal(false)
  const [dragging, setDragging] = createSignal(false)

  // floating window geometry
  const w0 = Math.min(window.innerWidth * 0.75, 1000)
  const h0 = Math.min(window.innerHeight * 0.75, 700)
  const [ww, setWw] = createSignal(w0)
  const [wh, setWh] = createSignal(h0)
  const [wx, setWx] = createSignal((window.innerWidth - w0) / 2)
  const [wy, setWy] = createSignal((window.innerHeight - h0) / 2)

  let body!: HTMLDivElement
  let img!: HTMLImageElement
  let last = { x: 0, y: 0 }
  let gap = 0
  const ptrs = new Map<number, PointerEvent>()

  // ── zoom helpers ──

  const reset = () => {
    setSmooth(true)
    setScale(1)
    setTx(0)
    setTy(0)
  }

  const zoomed = () => scale() > 1.05

  const zoomAt = (next: number, cx: number, cy: number) => {
    next = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE)
    const s = scale()
    if (next === s) return
    const ox = (body.clientWidth - img.offsetWidth) / 2
    const oy = (body.clientHeight - img.offsetHeight) / 2
    const ix = cx - ox
    const iy = cy - oy
    const px = (ix - tx()) / s
    const py = (iy - ty()) / s
    setTx(ix - px * next)
    setTy(iy - py * next)
    setScale(next)
  }

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    setSmooth(false)
    const rect = body.getBoundingClientRect()
    zoomAt(scale() * (e.deltaY > 0 ? 0.9 : 1.1), e.clientX - rect.left, e.clientY - rect.top)
  }

  const onDbl = (e: MouseEvent) => {
    if (zoomed()) return reset()
    setSmooth(true)
    const rect = body.getBoundingClientRect()
    zoomAt(2.5, e.clientX - rect.left, e.clientY - rect.top)
  }

  // image pan + pinch (pointer events on body)
  const onDown = (e: PointerEvent) => {
    ptrs.set(e.pointerId, e)
    body.setPointerCapture(e.pointerId)
    if (ptrs.size === 2) {
      setDragging(false)
      const [a, b] = [...ptrs.values()]
      gap = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      setSmooth(false)
    } else if (ptrs.size === 1 && zoomed()) {
      setDragging(true)
      last = { x: e.clientX, y: e.clientY }
      setSmooth(false)
    }
  }

  const onMove = (e: PointerEvent) => {
    ptrs.set(e.pointerId, e)
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()]
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
      if (gap > 0) {
        const rect = body.getBoundingClientRect()
        zoomAt(scale() * (d / gap), (a.clientX + b.clientX) / 2 - rect.left, (a.clientY + b.clientY) / 2 - rect.top)
      }
      gap = d
      return
    }
    if (dragging() && ptrs.size === 1) {
      setTx(tx() + e.clientX - last.x)
      setTy(ty() + e.clientY - last.y)
      last = { x: e.clientX, y: e.clientY }
    }
  }

  const onUp = (e: PointerEvent) => {
    ptrs.delete(e.pointerId)
    if (ptrs.size < 2) gap = 0
    if (ptrs.size === 0) {
      setDragging(false)
      if (!zoomed()) reset()
    }
  }

  // ── window drag (header) ──

  let origin = { x: 0, y: 0, wx: 0, wy: 0, ww: 0, wh: 0 }
  let headerMoved = false
  let headerBtn: Element | null = null

  const onHeaderDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    headerMoved = false
    headerBtn = (e.target as Element).closest("button")
    origin = { x: e.clientX, y: e.clientY, wx: wx(), wy: wy(), ww: ww(), wh: wh() }
    document.addEventListener("pointermove", onHeaderMove)
    document.addEventListener("pointerup", onHeaderUp)
  }

  const onHeaderMove = (e: PointerEvent) => {
    const dx = e.clientX - origin.x
    const dy = e.clientY - origin.y
    if (!headerMoved && Math.abs(dx) + Math.abs(dy) < 5) return
    headerMoved = true
    setWx(origin.wx + dx)
    setWy(origin.wy + dy)
  }

  const onHeaderUp = () => {
    document.removeEventListener("pointermove", onHeaderMove)
    document.removeEventListener("pointerup", onHeaderUp)
    if (!headerMoved && headerBtn) (headerBtn as HTMLElement).click()
    headerBtn = null
  }

  // ── window resize (edges / corners) ──

  let side: Edge | null = null

  const onEdgeDown = (dir: Edge, e: PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    side = dir
    origin = { x: e.clientX, y: e.clientY, wx: wx(), wy: wy(), ww: ww(), wh: wh() }
    document.addEventListener("pointermove", onEdgeMove)
    document.addEventListener("pointerup", onEdgeUp)
  }

  const onEdgeMove = (e: PointerEvent) => {
    if (!side) return
    const dx = e.clientX - origin.x
    const dy = e.clientY - origin.y
    if (side.includes("e")) setWw(Math.max(MIN_W, origin.ww + dx))
    if (side.includes("s")) setWh(Math.max(MIN_H, origin.wh + dy))
    if (side.includes("w")) {
      const nw = Math.max(MIN_W, origin.ww - dx)
      setWx(origin.wx + origin.ww - nw)
      setWw(nw)
    }
    if (side.includes("n")) {
      const nh = Math.max(MIN_H, origin.wh - dy)
      setWy(origin.wy + origin.wh - nh)
      setWh(nh)
    }
  }

  const onEdgeUp = () => {
    side = null
    document.removeEventListener("pointermove", onEdgeMove)
    document.removeEventListener("pointerup", onEdgeUp)
  }

  // ── lifecycle ──

  onMount(() => body.addEventListener("wheel", onWheel, { passive: false }))
  onCleanup(() => {
    body.removeEventListener("wheel", onWheel)
    document.removeEventListener("pointermove", onHeaderMove)
    document.removeEventListener("pointerup", onHeaderUp)
    document.removeEventListener("pointermove", onEdgeMove)
    document.removeEventListener("pointerup", onEdgeUp)
  })

  const handleDownload = async () => {
    const res = await fetch(props.src)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = props.alt ?? "image"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div data-component="image-preview">
      <div
        data-slot="image-preview-container"
        style={{
          left: `${wx()}px`,
          top: `${wy()}px`,
          width: `${ww()}px`,
          height: `${wh()}px`,
        }}
      >
        <Kobalte.Content
          data-slot="image-preview-content"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div data-slot="image-preview-header" onPointerDown={onHeaderDown}>
            <Show when={props.download}>
              <IconButton
                data-slot="image-preview-download"
                icon="download"
                variant="ghost"
                aria-label="Download"
                onClick={handleDownload}
              />
            </Show>
            <Kobalte.CloseButton
              data-slot="image-preview-close"
              as={IconButton}
              icon="close"
              variant="ghost"
              aria-label={i18n.t("ui.common.close")}
            />
          </div>
          <div
            ref={body!}
            data-slot="image-preview-body"
            onDblClick={onDbl}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ cursor: zoomed() ? (dragging() ? "grabbing" : "grab") : "zoom-in" }}
          >
            <img
              ref={img!}
              src={props.src}
              alt={props.alt ?? i18n.t("ui.imagePreview.alt")}
              data-slot="image-preview-image"
              draggable={false}
              style={{
                transform: `translate(${tx()}px, ${ty()}px) scale(${scale()})`,
                "transform-origin": "0 0",
                transition: smooth() ? "transform 0.3s ease" : "none",
              }}
            />
          </div>
        </Kobalte.Content>
        <div data-slot="resize-n" onPointerDown={[onEdgeDown, "n"]} />
        <div data-slot="resize-s" onPointerDown={[onEdgeDown, "s"]} />
        <div data-slot="resize-e" onPointerDown={[onEdgeDown, "e"]} />
        <div data-slot="resize-w" onPointerDown={[onEdgeDown, "w"]} />
        <div data-slot="resize-nw" onPointerDown={[onEdgeDown, "nw"]} />
        <div data-slot="resize-ne" onPointerDown={[onEdgeDown, "ne"]} />
        <div data-slot="resize-sw" onPointerDown={[onEdgeDown, "sw"]} />
        <div data-slot="resize-se" onPointerDown={[onEdgeDown, "se"]} />
      </div>
    </div>
  )
}
