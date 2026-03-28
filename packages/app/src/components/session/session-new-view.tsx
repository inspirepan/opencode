import { For, Show, createMemo, createSignal } from "solid-js"
import { DateTime } from "luxon"
import { useSync } from "@/context/sync"
import { useSDK } from "@/context/sdk"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { usePrompt } from "@/context/prompt"
import { Icon } from "@opencode-ai/ui/icon"
import { Mark } from "@opencode-ai/ui/logo"
import { getDirectory, getFilename } from "@opencode-ai/util/path"
import { starters, type Starter, type DandelionMode } from "./starters"

const MAIN_WORKTREE = "main"
const CREATE_WORKTREE = "create"
const ROOT_CLASS = "size-full flex flex-col"

interface NewSessionViewProps {
  worktree: string
}

export function NewSessionView(props: NewSessionViewProps) {
  const sync = useSync()
  const sdk = useSDK()
  const language = useLanguage()
  const platform = usePlatform()

  const sandboxes = createMemo(() => sync.project?.sandboxes ?? [])
  const options = createMemo(() => [MAIN_WORKTREE, ...sandboxes(), CREATE_WORKTREE])
  const current = createMemo(() => {
    const selection = props.worktree
    if (options().includes(selection)) return selection
    return MAIN_WORKTREE
  })
  const projectRoot = createMemo(() => sync.project?.worktree ?? sdk.directory)
  const isWorktree = createMemo(() => {
    const project = sync.project
    if (!project) return false
    return sdk.directory !== project.worktree
  })

  const label = (value: string) => {
    if (value === MAIN_WORKTREE) {
      if (isWorktree()) return language.t("session.new.worktree.main")
      const branch = sync.data.vcs?.branch
      if (branch) return language.t("session.new.worktree.mainWithBranch", { branch })
      return language.t("session.new.worktree.main")
    }

    if (value === CREATE_WORKTREE) return language.t("session.new.worktree.create")

    return getFilename(value)
  }

  if (platform.dandelion) return <DandelionNewView />

  return (
    <div class={ROOT_CLASS}>
      <div class="h-12 shrink-0" aria-hidden />
      <div class="flex-1 px-6 pb-30 flex items-center justify-center text-center">
        <div class="w-full max-w-200 flex flex-col items-center text-center gap-4">
          <div class="flex flex-col items-center gap-6">
            <Mark class="w-10" />
            <div class="text-20-medium text-text-strong">{language.t("session.new.title")}</div>
          </div>
          <div class="w-full flex flex-col gap-4 items-center">
            <div class="flex items-start justify-center gap-3 min-h-5">
              <div class="text-12-medium text-text-weak select-text leading-5 min-w-0 max-w-160 break-words text-center">
                {getDirectory(projectRoot())}
                <span class="text-text-strong">{getFilename(projectRoot())}</span>
              </div>
            </div>
            <div class="flex items-start justify-center gap-1.5 min-h-5">
              <Icon name="branch" size="small" class="mt-0.5 shrink-0" />
              <div class="text-12-medium text-text-weak select-text leading-5 min-w-0 max-w-160 break-words text-center">
                {label(current())}
              </div>
            </div>
            <Show when={sync.project}>
              {(project) => (
                <div class="flex items-start justify-center gap-3 min-h-5">
                  <div class="text-12-medium text-text-weak leading-5 min-w-0 max-w-160 break-words text-center">
                    {language.t("session.new.lastModified")}&nbsp;
                    <span class="text-text-strong">
                      {DateTime.fromMillis(project().time.updated ?? project().time.created)
                        .setLocale(language.intl())
                        .toRelative()}
                    </span>
                  </div>
                </div>
              )}
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}

function DandelionNewView() {
  const sdk = useSDK()
  const language = useLanguage()
  const platform = usePlatform()
  const prompt = usePrompt()
  const [active, setActive] = createSignal<string | null>(null)

  const mode = createMemo<DandelionMode>(() => {
    const ws = platform.dandelion?.workspaces
    if (!ws) return "agent"
    if (sdk.directory === ws.chat) return "chat"
    if (sdk.directory === ws.image) return "image"
    return "agent"
  })

  const items = createMemo(() => starters[mode()])

  const select = (text: string) => {
    prompt.set([{ type: "text", content: text, start: 0, end: text.length }], text.length)
  }

  return (
    <div class={ROOT_CLASS}>
      <div class="h-12 shrink-0" aria-hidden />
      <div class="flex-1 px-6 pb-30 flex items-center justify-center">
        <div class="w-full max-w-180 flex flex-col items-center gap-8">
          <div class="flex flex-col items-center gap-3">
            <Mark class="w-10" />
            <div class="text-16-medium text-text-strong">{language.t(`dandelion.home.${mode()}.title`)}</div>
            <div class="text-13-regular text-text-weak">{language.t(`dandelion.home.${mode()}.subtitle`)}</div>
          </div>
          <div class="w-full grid grid-cols-3 gap-3">
            <For each={items()}>
              {(item) => (
                <StarterCard
                  starter={item}
                  active={active() === item.id}
                  onClick={() => setActive(active() === item.id ? null : item.id)}
                />
              )}
            </For>
          </div>
          <Show when={active()}>
            {(id) => {
              const skill = () => items().find((s) => s.id === id())
              return (
                <Show when={skill()}>
                  {(s) => (
                    <div class="w-full flex flex-col gap-2">
                      <For each={s().examples}>
                        {(key) => (
                          <button
                            class="w-full text-left px-4 py-3 rounded-lg bg-surface-base hover:bg-surface-base-hover transition-colors flex items-center gap-3"
                            onClick={() => select(language.t(key))}
                          >
                            <Icon name="speech-bubble" size="small" class="shrink-0 text-icon-base" />
                            <span class="text-14-regular text-text-base">{language.t(key)}</span>
                          </button>
                        )}
                      </For>
                    </div>
                  )}
                </Show>
              )
            }}
          </Show>
        </div>
      </div>
    </div>
  )
}

function StarterCard(props: { starter: Starter; active: boolean; onClick: () => void }) {
  const language = useLanguage()
  return (
    <button
      class="flex flex-col gap-3 p-4 rounded-xl text-left transition-colors"
      classList={{
        "bg-surface-raised-base hover:bg-surface-raised-base-hover": !props.active,
        "bg-surface-raised-base-hover ring-1 ring-border-base": props.active,
      }}
      onClick={props.onClick}
    >
      <div class="size-9 rounded-lg bg-surface-base flex items-center justify-center">
        <Icon name={props.starter.icon} size="normal" class="text-icon-base" />
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-14-medium text-text-strong">{language.t(props.starter.title)}</div>
        <div class="text-12-regular text-text-weak">{language.t(props.starter.description)}</div>
      </div>
    </button>
  )
}
