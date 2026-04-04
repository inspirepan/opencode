import { For, Show, createEffect, createMemo } from "solid-js"
import { createMediaQuery } from "@solid-primitives/media"
import { DateTime } from "luxon"
import { useNavigate } from "@solidjs/router"
import { base64Encode } from "@opencode-ai/util/encode"
import { useSync } from "@/context/sync"
import { useSDK } from "@/context/sdk"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { useLayout } from "@/context/layout"

import { Icon } from "@opencode-ai/ui/icon"
import { Spinner } from "@opencode-ai/ui/spinner"
import { Mark } from "@opencode-ai/ui/logo"
import { getDirectory, getFilename } from "@opencode-ai/util/path"
import { starters, activeStarter, setActiveStarter, type Starter, type DandelionMode } from "./starters"

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
  const sync = useSync()
  const language = useLanguage()
  const platform = usePlatform()
  const layout = useLayout()
  const navigate = useNavigate()
  let scrollRef!: HTMLDivElement
  const xl = createMediaQuery("(min-width: 1280px)")
  const sidebarVisible = createMemo(() => (xl() ? layout.sidebar.opened() : layout.mobileSidebar.opened()))

  createEffect(() => {
    if (!activeStarter()) return
    requestAnimationFrame(() => {
      scrollRef?.scrollTo({ top: scrollRef.scrollHeight, behavior: "smooth" })
    })
  })

  const mode = createMemo<DandelionMode>(() => {
    const ws = platform.dandelion?.workspaces
    if (!ws) return "agent"
    if (sdk.directory === ws.chat) return "chat"
    if (sdk.directory === ws.image) return "image"
    return "agent"
  })

  const items = createMemo(() => starters[mode()])

  const recent = createMemo(() =>
    [...sync.data.session]
      .sort((a, b) => (b.time.updated ?? b.time.created) - (a.time.updated ?? a.time.created))
      .slice(0, 3),
  )

  const slug = createMemo(() => base64Encode(sdk.directory))

  return (
    <div class={ROOT_CLASS}>
      <div class="h-12 shrink-0" aria-hidden />
      <div ref={(el) => (scrollRef = el)} class="flex-1 px-6 overflow-y-auto flex justify-center" classList={{ "pb-60": !!activeStarter(), "pb-30": !activeStarter() }} style={{ "scrollbar-gutter": "stable" }}>
        <div class="w-full max-w-180 flex flex-col items-center gap-3 pt-6">
          <div class="flex flex-col items-center">
            <Mark class="w-8" />
          </div>
          <Show when={recent().length > 0}>
            <div class="w-full flex flex-col gap-1.5">
              <div class="px-1">
                <span class="text-11-medium text-text-weak">{language.t("dandelion.home.recent")}</span>
              </div>
              <div class="flex flex-col gap-1">
                <For each={recent()}>
                  {(session) => {
                    const status = () => sync.data.session_status[session.id]
                    const busy = () => status() && status()!.type !== "idle"
                    return (
                      <button
                        data-component="recent-card"
                        class="w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 cursor-default bg-surface-card"
                        onClick={() => {
                          layout.sidebar.open()
                          navigate(`/${slug()}/session/${session.id}`)
                        }}
                      >
                        <Show when={busy()} fallback={<Icon name="speech-bubble" size="small" class="shrink-0 text-icon-weak" />}>
                          <Spinner class="size-[14px] shrink-0" />
                        </Show>
                        <span class="text-13-regular text-text-base truncate flex-1">{session.title}</span>
                        <Icon name="chevron-right" size="small" class="shrink-0 text-icon-weak" />
                      </button>
                    )
                  }}
                </For>
                <Show when={sync.data.session.length > 3 && !sidebarVisible()}>
                  <button
                    data-component="recent-card"
                    class="w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 cursor-default bg-surface-card"
                    onClick={() => {
                      layout.sidebar.open()
                      layout.mobileSidebar.show()
                    }}
                  >
                    <Icon name="chevron-right" size="small" class="shrink-0 text-icon-weak" />
                    <span class="text-13-regular text-text-weak">{language.t("dandelion.home.recent.more")}</span>
                  </button>
                </Show>
              </div>
            </div>
          </Show>
          <div class="w-full px-1 mt-6">
            <span class="text-11-medium text-text-weak">{language.t("dandelion.home.starters")}</span>
          </div>
          <div class="w-full grid grid-cols-3 gap-2">
            <For each={items()}>
              {(item) => (
                <StarterCard
                  starter={item}
                  active={activeStarter()?.id === item.id}
                  onClick={() => setActiveStarter(activeStarter()?.id === item.id ? null : item)}
                />
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  )
}

function StarterCard(props: { starter: Starter; active: boolean; onClick: () => void }) {
  const language = useLanguage()
  return (
    <button
      data-component="starter-card"
      class="flex flex-col gap-1.5 p-2.5 rounded-xl text-left bg-surface-card"
      style={{
        "box-shadow": props.active
          ? `0 0 0 1px rgba(3, 7, 18, 0.1), 0 2px 4px rgba(3, 7, 18, 0.08), 0 1px 2px rgba(3, 7, 18, 0.06)`
          : `0 0 0 1px rgba(3, 7, 18, 0.05), 0 1px 2px rgba(3, 7, 18, 0.04)`,
      }}
      onClick={props.onClick}
    >
      <div
        class="size-7 rounded-sm flex items-center justify-center"
        classList={{ "bg-surface-base": !props.starter.color }}
        style={props.starter.color ? { background: props.starter.color.bg } : undefined}
      >
        <Icon
          name={props.starter.icon}
          size="small"
          class={props.starter.color ? "" : "text-icon-base"}
          style={props.starter.color ? { color: props.starter.color.icon } : undefined}
        />
      </div>
      <div class="flex flex-col gap-1">
        <div class="text-13-medium text-text-strong">{language.t(props.starter.title)}</div>
        <div class="text-11-regular text-text-weak leading-5">{language.t(props.starter.description)}</div>
      </div>
    </button>
  )
}
