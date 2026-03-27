import { Dialog as Kobalte } from "@kobalte/core/dialog"
import { Show } from "solid-js"
import { useI18n } from "../context/i18n"
import { IconButton } from "./icon-button"

export interface ImagePreviewProps {
  src: string
  alt?: string
  download?: boolean
}

export function ImagePreview(props: ImagePreviewProps) {
  const i18n = useI18n()

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
      <div data-slot="image-preview-container">
        <Kobalte.Content data-slot="image-preview-content">
          <div data-slot="image-preview-header">
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
          <div data-slot="image-preview-body">
            <img src={props.src} alt={props.alt ?? i18n.t("ui.imagePreview.alt")} data-slot="image-preview-image" />
          </div>
        </Kobalte.Content>
      </div>
    </div>
  )
}
