---
name: image-gen
description: AI image generation with OpenAI, Google, DashScope and Replicate APIs. Supports text-to-image, reference images, aspect ratios. Sequential by default; parallel generation available on request. Use when user asks to generate, create, or draw images.
---

# Image Generation (AI SDK)

Official API-based image generation. Supports OpenAI, Google, DashScope (阿里通义万象) and Replicate providers.

## Script Directory

**Agent Execution**:
1. `SKILL_DIR` = this SKILL.md file's directory
2. Script path = `${SKILL_DIR}/scripts/main.ts`

## Preferences (EXTEND.md)

Use Bash to check EXTEND.md existence (priority order):

```bash
# Check project-level first
test -f .dandelion/skill-configs/image-gen/EXTEND.md && echo "project"

# Then user-level (cross-platform: $HOME works on macOS/Linux/WSL)
test -f "$HOME/.dandelion/skill-configs/image-gen/EXTEND.md" && echo "user"
```

┌──────────────────────────────────────────────────┬───────────────────┐
│                       Path                       │     Location      │
├──────────────────────────────────────────────────┼───────────────────┤
│ .dandelion/skill-configs/image-gen/EXTEND.md          │ Project directory │
├──────────────────────────────────────────────────┼───────────────────┤
│ $HOME/.dandelion/skill-configs/image-gen/EXTEND.md    │ User home         │
└──────────────────────────────────────────────────┴───────────────────┘

┌───────────┬───────────────────────────────────────────────────────────────────────────┐
│  Result   │                                  Action                                   │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Found     │ Read, parse, apply settings                                               │
├───────────┼───────────────────────────────────────────────────────────────────────────┤
│ Not found │ Use defaults                                                              │
└───────────┴───────────────────────────────────────────────────────────────────────────┘

**EXTEND.md Supports**: Default provider | Default quality | Default aspect ratio | Default image size | Default batch size | Default models

Schema: `references/config/preferences-schema.md`

## Usage

```bash
# Basic
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image cat.png

# With aspect ratio
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A landscape" --image out.png --ar 16:9

# High quality
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --quality 2k

# From prompt files
npx -y bun ${SKILL_DIR}/scripts/main.ts --promptfiles system.md content.md --image out.png

# With reference images (Google multimodal or OpenAI edits)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "Make blue" --image out.png --ref source.png

# With reference images (explicit provider/model)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "Make blue" --image out.png --provider google --model gemini-3-pro-image-preview --ref source.png

# Specific provider
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider openai

# DashScope (阿里通义万象)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "一只可爱的猫" --image out.png --provider dashscope

# Replicate (google/nano-banana-pro)
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate

# Replicate with specific model
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate --model google/nano-banana
```

## Options

| Option | Description |
|--------|-------------|
| `--prompt <text>`, `-p` | Prompt text |
| `--promptfiles <files...>` | Read prompt from files (concatenated) |
| `--image <path>` | Output image path (required) |
| `--provider google\|openai\|dashscope\|replicate` | Force provider (default: google) |
| `--model <id>`, `-m` | Model ID (`--ref` with OpenAI requires GPT Image model, e.g. `gpt-image-1.5`) |
| `--ar <ratio>` | Aspect ratio (e.g., `16:9`, `1:1`, `4:3`) |
| `--size <WxH>` | Size (e.g., `1024x1024`) |
| `--quality normal\|2k` | Quality preset (default: 2k) |
| `--imageSize 1K\|2K\|4K` | Image size for Google (default: from quality) |
| `--ref <files...>` | Reference images. Supported by Google multimodal and OpenAI edits (GPT Image models). If provider omitted: Google first, then OpenAI |
| `--n <count>` | Number of images |
| `--json` | JSON output |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_API_KEY` | Google API key |
| `DASHSCOPE_API_KEY` | DashScope API key (阿里云) |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `OPENAI_IMAGE_MODEL` | OpenAI model override |
| `GOOGLE_IMAGE_MODEL` | Google model override |
| `DASHSCOPE_IMAGE_MODEL` | DashScope model override (default: z-image-turbo) |
| `REPLICATE_IMAGE_MODEL` | Replicate model override (default: google/nano-banana-pro) |
| `OPENAI_BASE_URL` | Custom OpenAI endpoint |
| `GOOGLE_BASE_URL` | Custom Google endpoint |
| `DASHSCOPE_BASE_URL` | Custom DashScope endpoint |
| `REPLICATE_BASE_URL` | Custom Replicate endpoint |

**Load Priority**: CLI args > EXTEND.md > env vars > `<cwd>/.dandelion/skill-configs/.env` > `~/.dandelion/skill-configs/.env`

## Discovering Providers from OpenCode Config

When the required API keys are not set in the environment, discover them from OpenCode's configuration. This supports any third-party provider (not just native Google/OpenAI).

**Step 1**: Read the config file (strip JSONC comments when parsing):

```bash
cat ~/.config/opencode/opencode.jsonc
```

**Step 2**: Find providers with image-capable models — look for models whose `modalities.output` includes `"image"`.

**Step 3**: Map the provider's `npm` package to the script's `--provider` flag and env vars:

| Config `npm` value | Script `--provider` | API key env var | Base URL env var |
|---|---|---|---|
| `@ai-sdk/google` | `google` | `GOOGLE_API_KEY` | `GOOGLE_BASE_URL` |
| `@ai-sdk/openai` or `@ai-sdk/openai-compatible` | `openai` | `OPENAI_API_KEY` | `OPENAI_BASE_URL` |

Extract from the provider config object:
- `options.apiKey` → set as the API key env var
- `options.baseURL` or `api` → set as the base URL env var

**Step 4**: Pass as inline env vars when calling the script:

```bash
GOOGLE_API_KEY=<key> GOOGLE_BASE_URL=<url> npx -y bun ${SKILL_DIR}/scripts/main.ts --provider google --model <model-id> ...
```

**Multiple providers available**: If multiple image-capable providers are found, prefer whichever has a native API key already set in the environment. If none do, ask the user which provider to use.

## Replicate Model Configuration

When using `--provider replicate`, the model can be configured in the following ways (highest priority first):

1. CLI flag: `--model <owner/name>`
2. EXTEND.md: `default_model.replicate`
3. Env var: `REPLICATE_IMAGE_MODEL`
4. Built-in default: `google/nano-banana-pro`

Supported model formats:

- `owner/name` (recommended for official models), e.g. `google/nano-banana-pro`
- `owner/name:version` (community models by version), e.g. `stability-ai/sdxl:<version>`

Examples:

```bash
# Use Replicate default model
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate

# Override model explicitly
npx -y bun ${SKILL_DIR}/scripts/main.ts --prompt "A cat" --image out.png --provider replicate --model google/nano-banana
```

## Provider Selection

1. `--ref` provided + no `--provider` → auto-select Google first, then OpenAI, then Replicate
2. `--provider` specified → use it (if `--ref`, must be `google`, `openai`, or `replicate`)
3. Only one API key available → use that provider
4. Multiple available → default to Google

## Quality Presets

| Preset | Google imageSize | OpenAI Size | Use Case |
|--------|------------------|-------------|----------|
| `normal` | 1K | 1024px | Quick previews |
| `2k` (default) | 2K | 2048px | Covers, illustrations, infographics |

**Google imageSize**: Can be overridden with `--imageSize 1K|2K|4K`

## Aspect Ratios

Supported: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `2.35:1`

- Google multimodal: uses `imageConfig.aspectRatio`
- Google Imagen: uses `aspectRatio` parameter
- OpenAI: maps to closest supported size

## Generation Mode

Batch size controls how many images are generated in parallel per round. After each round completes, call `present_file` to show results before starting the next round.

**Batch size resolution** (highest priority first):
1. User explicitly requests parallel/batch in the conversation
2. EXTEND.md `default_batch_size`
3. Default: `1` (sequential)

| Batch Size | Behavior |
|------------|----------|
| `1` (default) | Generate one image, present, repeat |
| `2-8` | Generate N images in parallel per round, present round results, continue next round |

**Workflow** (for a total of T images with batch size B):

```
Round 1: launch min(B, remaining) subagents in parallel → wait all → present_file
Round 2: launch min(B, remaining) subagents in parallel → wait all → present_file
...repeat until all T images are generated
```

**Constraints**:
- Max batch size: `8` (clamp silently if larger)
- Each subagent runs via Task tool with `run_in_background=true`; collect via `TaskOutput`
- When batch size is `1`, run directly without subagents (no Task overhead)

## Presenting Results

After generating images, always use the `present_file` tool to show results to the user:

- **Single image**: call `present_file` with the output image path
- **Multiple images**: save all images to the same directory, then call `present_file` with the directory path to display them as a gallery
- **Batch generation**: you can present the output directory early (after the first image), then re-present the same directory after more images are generated to refresh the gallery

## Error Handling

- Missing API key → error with setup instructions
- Generation failure → auto-retry once
- Invalid aspect ratio → warning, proceed with default
- Reference images with unsupported provider/model → error with fix hint (switch to Google multimodal or OpenAI GPT Image edits)

## Extension Support

Custom configurations via EXTEND.md. See **Preferences** section for paths and supported options.
