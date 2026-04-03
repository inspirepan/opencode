import { For, Show, createMemo, onCleanup, onMount, type Component } from "solid-js"
import { createStore } from "solid-js/store"
import { useMutation } from "@tanstack/solid-query"
import { Button } from "@opencode-ai/ui/button"
import { DockPrompt } from "@opencode-ai/ui/dock-prompt"
import { Icon } from "@opencode-ai/ui/icon"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { showToast } from "@opencode-ai/ui/toast"
import type { QuestionAnswer, QuestionRequest } from "@opencode-ai/sdk/v2"
import { useLanguage } from "@/context/language"
import { useSDK } from "@/context/sdk"

const cache = new Map<string, { answers: QuestionAnswer[]; custom: string[]; customOn: boolean[] }>()

export const SessionQuestionDock: Component<{ request: QuestionRequest; onSubmit: () => void }> = (props) => {
  const sdk = useSDK()
  const language = useLanguage()

  const questions = createMemo(() => props.request.questions)
  const total = createMemo(() => questions().length)

  const cached = cache.get(props.request.id)
  const [store, setStore] = createStore({
    answers: cached?.answers ?? ([] as QuestionAnswer[]),
    custom: cached?.custom ?? ([] as string[]),
    customOn: cached?.customOn ?? ([] as boolean[]),
    editing: -1,
  })

  let root: HTMLDivElement | undefined
  let replied = false

  const summary = createMemo(() => `${total()} ${language.t("ui.tool.questions")}`)

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
    const max = Math.max(240, Math.floor(dock.getBoundingClientRect().bottom - top - gap - below))
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
      customOn: store.customOn.map((b) => b ?? false),
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

  const submit = () => void reply(questions().map((_, i) => store.answers[i] ?? []))

  const customUpdate = (idx: number, value: string, selected?: boolean) => {
    const sel = selected ?? store.customOn[idx] === true
    const prev = (store.custom[idx] ?? "").trim()
    const next = value.trim()

    setStore("custom", idx, value)
    if (!sel) return

    if (questions()[idx]?.multiple) {
      setStore("answers", idx, (current = []) => {
        const removed = prev ? current.filter((item) => item.trim() !== prev) : current
        if (!next) return removed
        if (removed.some((item) => item.trim() === next)) return removed
        return [...removed, next]
      })
      return
    }

    setStore("answers", idx, next ? [next] : [])
  }

  const pick = (idx: number, answer: string) => {
    if (sending()) return
    setStore("answers", idx, [answer])
    setStore("customOn", idx, false)
    if (store.editing === idx) setStore("editing", -1)
  }

  const toggle = (idx: number, answer: string) => {
    if (sending()) return
    setStore("answers", idx, (current = []) => {
      if (current.includes(answer)) return current.filter((item) => item !== answer)
      return [...current, answer]
    })
  }

  const customOpen = (idx: number) => {
    if (sending()) return
    if (!store.customOn[idx]) setStore("customOn", idx, true)
    setStore("editing", idx)
    customUpdate(idx, store.custom[idx] ?? "", true)
  }

  const customToggle = (idx: number) => {
    if (sending()) return
    const multi = questions()[idx]?.multiple

    if (!multi) {
      setStore("customOn", idx, true)
      setStore("editing", idx)
      customUpdate(idx, store.custom[idx] ?? "", true)
      return
    }

    const next = !store.customOn[idx]
    setStore("customOn", idx, next)
    if (next) {
      setStore("editing", idx)
      customUpdate(idx, store.custom[idx] ?? "", true)
      return
    }

    const value = (store.custom[idx] ?? "").trim()
    if (value) setStore("answers", idx, (current = []) => current.filter((item) => item.trim() !== value))
    if (store.editing === idx) setStore("editing", -1)
  }

  const commitCustom = (idx: number) => {
    if (store.editing === idx) setStore("editing", -1)
    customUpdate(idx, store.custom[idx] ?? "")
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
                <div data-slot="question-text">{q.question}</div>
                <Show when={multi()} fallback={<div data-slot="question-hint">{language.t("ui.question.singleHint")}</div>}>
                  <div data-slot="question-hint">{language.t("ui.question.multiHint")}</div>
                </Show>
                <div data-slot="question-pills">
                  <For each={q.options}>
                    {(opt) => {
                      const picked = () => store.answers[i()]?.includes(opt.label) ?? false
                      const pill = (
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
                          <span data-slot="question-pill-label">{opt.label}</span>
                        </button>
                      )
                      return (
                        <Show when={opt.description} fallback={pill}>
                          <Tooltip value={opt.description} placement="top">
                            {pill}
                          </Tooltip>
                        </Show>
                      )
                    }}
                  </For>

                  {/* custom answer pill */}
                  <Show when={store.editing !== i()}>
                    <button
                      type="button"
                      data-slot="question-option"
                      data-custom="true"
                      data-picked={store.customOn[i()] === true}
                      role={multi() ? "checkbox" : "radio"}
                      aria-checked={store.customOn[i()] === true}
                      disabled={sending()}
                      onClick={() => customOpen(i())}
                    >
                      <span
                        data-slot="question-pill-dot"
                        data-type={multi() ? "checkbox" : "radio"}
                        data-picked={store.customOn[i()] === true}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          customToggle(i())
                        }}
                      >
                        <Show when={multi()} fallback={<span data-slot="question-pill-radio-dot" />}>
                          <Icon name="check-small" size="small" />
                        </Show>
                      </span>
                      <span data-slot="question-pill-label">
                        {(store.custom[i()] ?? "").trim() || language.t("ui.messagePart.option.typeOwnAnswer")}
                      </span>
                    </button>
                  </Show>
                </div>

                {/* custom answer input */}
                <Show when={store.editing === i()}>
                  <form
                    data-slot="question-custom-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      commitCustom(i())
                    }}
                  >
                    <textarea
                      ref={(el) =>
                        setTimeout(() => {
                          el.focus()
                          el.style.height = "0px"
                          el.style.height = `${el.scrollHeight}px`
                        }, 0)
                      }
                      data-slot="question-custom-input"
                      placeholder={language.t("ui.question.custom.placeholder")}
                      value={store.custom[i()] ?? ""}
                      rows={1}
                      disabled={sending()}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.preventDefault()
                          commitCustom(i())
                          return
                        }
                        if (e.key !== "Enter" || e.shiftKey) return
                        e.preventDefault()
                        commitCustom(i())
                      }}
                      onInput={(e) => {
                        customUpdate(i(), e.currentTarget.value)
                        e.currentTarget.style.height = "0px"
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                      }}
                    />
                  </form>
                </Show>
              </div>
            )
          }}
        </For>
      </div>
    </DockPrompt>
  )
}
