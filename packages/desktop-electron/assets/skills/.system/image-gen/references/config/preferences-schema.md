---
name: preferences-schema
description: EXTEND.md YAML schema for baoyu-image-gen user preferences
---

# Preferences Schema

## Full Schema

```yaml
---
version: 1

default_provider: null      # google|openai|dashscope|replicate|null (null = auto-detect)

default_quality: null       # normal|2k|null (null = use default: 2k)

default_aspect_ratio: null  # "16:9"|"1:1"|"4:3"|"3:4"|"2.35:1"|null

default_image_size: null    # 1K|2K|4K|null (Google only, overrides quality)

default_batch_size: null    # 1-8|null (null = 1, sequential)
                            # 1 = generate one, present, repeat
                            # 2-8 = generate N in parallel per batch, present, continue

default_model:
  google: null              # e.g., "gemini-3-pro-image-preview"
  openai: null              # e.g., "gpt-image-1.5"
  dashscope: null           # e.g., "z-image-turbo"
  replicate: null           # e.g., "google/nano-banana-pro"
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `default_provider` | string\|null | null | Default provider (null = auto-detect) |
| `default_quality` | string\|null | null | Default quality (null = 2k) |
| `default_aspect_ratio` | string\|null | null | Default aspect ratio |
| `default_image_size` | string\|null | null | Google image size (overrides quality) |
| `default_batch_size` | int\|null | null | Batch size per parallel round (null/1 = sequential, 2-8 = parallel) |
| `default_model.google` | string\|null | null | Google default model |
| `default_model.openai` | string\|null | null | OpenAI default model |
| `default_model.dashscope` | string\|null | null | DashScope default model |
| `default_model.replicate` | string\|null | null | Replicate default model |

## Examples

**Minimal**:
```yaml
---
version: 1
default_provider: google
default_quality: 2k
---
```

**Batch mode** (generate 2 images per round, present after each round):
```yaml
---
version: 1
default_provider: google
default_batch_size: 2
---
```

**Full**:
```yaml
---
version: 1
default_provider: google
default_quality: 2k
default_aspect_ratio: "16:9"
default_image_size: 2K
default_batch_size: 4
default_model:
  google: "gemini-3-pro-image-preview"
  openai: "gpt-image-1.5"
  dashscope: "z-image-turbo"
  replicate: "google/nano-banana-pro"
---
```
