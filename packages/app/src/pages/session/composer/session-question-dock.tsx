import { For, Show, createMemo, onCleanup, onMount, type Component } from "solid-js"
import { createStore } from "solid-js/store"
import { useMutation } from "@tanstack/solid-query"
import { Button } from "@opencode-ai/ui/button"
import { DockPrompt } from "@opencode-ai/ui/dock-prompt"
import { Icon } from "@opencode-ai/ui/icon"
import { showToast } from "@opencode-ai/ui/toast"
import type { QuestionAnswer, QuestionRequest } from "@opencode-ai/sdk/v2"
import { useLanguage } from "@/context/language"
import { useSDK } from "@/context/sdk"

const cache = new Map<string, { answers: QuestionAnswer[]; custom: string[] }>()

export const SessionQuestionDock: Component<{ request: QuestionRequest; onSubmit: () => void }> = (props) => {
  const sdk = useSDK()
  const language = useLanguage()

  const questions = createMemo(() => props.request.questions)
  const total = createMemo(() => questions().length)

  const cached = cache.get(props.request.id)
  const [store, setStore] = createStore({
    answers: cached?.answers ?? ([] as QuestionAnswer[]),
    custom: cached?.custom ?? ([] as string[]),
  })

  let root: HTMLDivElement | undefined
  let replied = false

  const summary = createMemo(() => language.t("ui.question.summary", { count: total() }))

  const measure = () => {
    if (!root) return

    const scroller = document.querySelector(".scroll-view__viewport")
    const head = scroller instanceof HTMLElement ? scroller.firstElementChild : undefined
    const top =
      head instanceof HTMLElement && head.classList.contains("sticky") ? head.getBoundingClientRect().bottom : 0
    if (!top) {
      root.style.removeProperty("--question-prompt-max-height")
      return
    }

    const dock = root.closest('[data-component="session-prompt-dock"]')
    if (!(dock instanceof HTMLElement)) return

    const below = Math.max(0, dock.getBoundingClientRect().bottom - root.getBoundingClientRect().bottom)
    const gap = 8
    const limit = Math.floor(window.innerHeight * 0.8)
    const max = Math.min(limit, Math.max(240, Math.floor(dock.getBoundingClientRect().bottom - top - gap - below)))
    root.style.setProperty("--question-prompt-max-height", `${max}px`)
  }

  onMount(() => {
    let raf: number | undefined
    const update = () => {
      if (raf !== undefined) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        raf = undefined
        measure()
      })
    }

    update()
    window.addEventListener("resize", update)

    const dock = root?.closest('[data-component="session-prompt-dock"]')
    const scroller = document.querySelector(".scroll-view__viewport")
    const observer = new ResizeObserver(update)
    if (dock instanceof HTMLElement) observer.observe(dock)
    if (scroller instanceof HTMLElement) observer.observe(scroller)

    onCleanup(() => {
      window.removeEventListener("resize", update)
      observer.disconnect()
      if (raf !== undefined) cancelAnimationFrame(raf)
    })
  })

  onCleanup(() => {
    if (replied) return
    cache.set(props.request.id, {
      answers: store.answers.map((a) => (a ? [...a] : [])),
      custom: store.custom.map((s) => s ?? ""),
    })
  })

  const fail = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err)
    showToast({ title: language.t("common.requestFailed"), description: message })
  }

  const replyMutation = useMutation(() => ({
    mutationFn: (answers: QuestionAnswer[]) => sdk.client.question.reply({ requestID: props.request.id, answers }),
    onMutate: () => {
      props.onSubmit()
    },
    onSuccess: () => {
      replied = true
      cache.delete(props.request.id)
    },
    onError: fail,
  }))

  const rejectMutation = useMutation(() => ({
    mutationFn: () => sdk.client.question.reject({ requestID: props.request.id }),
    onMutate: () => {
      props.onSubmit()
    },
    onSuccess: () => {
      replied = true
      cache.delete(props.request.id)
    },
    onError: fail,
  }))

  const sending = createMemo(() => replyMutation.isPending || rejectMutation.isPending)

  const reply = async (answers: QuestionAnswer[]) => {
    if (sending()) return
    await replyMutation.mutateAsync(answers)
  }

  const reject = async () => {
    if (sending()) return
    await rejectMutation.mutateAsync()
  }

  const submit = () => {
    const answers = questions().map((_, i) => {
      const selected = store.answers[i] ?? []
      const text = (store.custom[i] ?? "").trim()
      if (text) return [...selected, text]
      return selected
    })
    void reply(answers)
  }

  const pick = (idx: number, answer: string) => {
    if (sending()) return
    setStore("answers", idx, (current = []) => (current.includes(answer) ? [] : [answer]))
  }

  const toggle = (idx: number, answer: string) => {
    if (sending()) return
    setStore("answers", idx, (current = []) => {
      if (current.includes(answer)) return current.filter((item) => item !== answer)
      return [...current, answer]
    })
  }

  return (
    <DockPrompt
      kind="question"
      ref={(el) => (root = el)}
      header={
        <div data-slot="question-header-title">{summary()}</div>
      }
      footer={
        <>
          <Button variant="ghost" size="large" disabled={sending()} onClick={reject}>
            {language.t("ui.common.dismiss")}
          </Button>
          <Button variant="primary" size="large" disabled={sending()} onClick={submit}>
            {language.t("ui.common.submit")}
          </Button>
        </>
      }
    >
      <div data-slot="question-form">
        <For each={questions()}>
          {(q, i) => {
            const multi = () => q.multiple === true
            return (
              <div data-slot="question-group">
                <div data-slot="question-heading">
                  <span data-slot="question-heading-title">{q.header}</span>
                  <span data-slot="question-heading-sub">{q.question}</span>
                  <Show when={multi()}>
                    <span data-slot="question-hint">{language.t("ui.question.multiHint")}</span>
                  </Show>
                </div>
                <div data-slot="question-pills">
                  <For each={q.options}>
                    {(opt) => {
                      const picked = createMemo(() => store.answers[i()]?.includes(opt.label) ?? false)
                      return (
                        <button
                          type="button"
                          data-slot="question-option"
                          data-picked={picked()}
                          role={multi() ? "checkbox" : "radio"}
                          aria-checked={picked()}
                          disabled={sending()}
                          onClick={() => multi() ? toggle(i(), opt.label) : pick(i(), opt.label)}
                        >
                          <span
                            data-slot="question-pill-dot"
                            data-type={multi() ? "checkbox" : "radio"}
                            data-picked={picked()}
                          >
                            <Show when={multi()} fallback={<span data-slot="question-pill-radio-dot" />}>
                              <Icon name="check-small" size="small" />
                            </Show>
                          </span>
                          <span data-slot="question-pill-content">
                            <span data-slot="question-pill-label">{opt.label}</span>
                            <Show when={opt.description}>
                              <span data-slot="question-pill-desc">{opt.description}</span>
                            </Show>
                          </span>
                        </button>
                      )
                    }}
                  </For>
                </div>

                <div data-slot="question-custom-form">
                  <textarea
                    data-slot="question-custom-input"
                    placeholder={language.t("ui.question.custom.placeholder")}
                    value={store.custom[i()] ?? ""}
                    rows={1}
                    disabled={sending()}
                    onKeyDown={(e) => {
                      if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
                        e.preventDefault()
                        e.currentTarget.blur()
                      }
                    }}
                    onInput={(e) => {
                      setStore("custom", i(), e.currentTarget.value)
                      e.currentTarget.style.height = "0px"
                      e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                    }}
                  />
                </div>
              </div>
            )
          }}
        </For>
      </div>
    </DockPrompt>
  )
}
