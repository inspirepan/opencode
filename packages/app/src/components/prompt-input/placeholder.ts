type PromptPlaceholderInput = {
  mode: "normal" | "shell"
  dandelion?: "chat" | "agent" | "image"
  commentCount: number
  example: string
  suggest: boolean
  t: (key: string, params?: Record<string, string>) => string
}

export function promptPlaceholder(input: PromptPlaceholderInput) {
  if (input.dandelion) {
    return input.t(`dandelion.placeholder.${input.dandelion}.simple`)
  }
  if (input.mode === "shell") return input.t("prompt.placeholder.shell")
  if (input.commentCount > 1) return input.t("prompt.placeholder.summarizeComments")
  if (input.commentCount === 1) return input.t("prompt.placeholder.summarizeComment")
  if (!input.suggest) return input.t("prompt.placeholder.simple")
  return input.t("prompt.placeholder.normal", { example: input.example })
}
