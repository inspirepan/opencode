# Step 2: Confirm Options

## Purpose

Validate all 6 dimensions + platform + aspect ratio.

## Skip Conditions

| Condition | Skipped Questions | Still Asked |
|-----------|-------------------|-------------|
| `--quick` flag | 6 dimensions | **Platform + Aspect** (unless specified) |
| All 6 + `--platform` + `--aspect` | All | None |
| `quick_mode: true` in EXTEND.md | 6 dimensions | **Platform + Aspect** (unless specified) |
| Otherwise | None | All questions |

**Important**: Platform and aspect ratio are ALWAYS asked unless explicitly specified via CLI flags. User presets in EXTEND.md are shown as recommended option, not auto-selected.

## Quick Mode Output

When skipping 6 dimensions:

```
Quick Mode: Auto-selected dimensions
- Category: [category] ([reason])
- Layout: [layout] ([reason])
- Scene: [scene] ([reason])
- Promotion: [promotion] ([reason])
- Mood: [mood] ([reason])
- Text: [text] ([reason])

[Then ask Platform + Aspect]
```

## Confirmation Flow

**Language**: Auto-determined (user's input language > saved preference > product description language). No need to ask.

**CRITICAL -- Localized User-Facing Text**: Translate ALL `question`, `label`, and `description` values into the user's language at runtime. Append the English slug in parentheses so the response can be parsed back. The templates below are English references; never show them to the user as-is.

Present ALL options in a **single AskUserQuestion call** (4 questions max).

Skip any question where the dimension is already specified via CLI flag.

### Q1: Category + Layout (skip if both specified)

```yaml
header: "Category"
question: "Product category and layout?"
multiSelect: false
options:
  - label: "[auto-category] / [auto-layout] (Recommended)"
    description: "[category reason] + [layout reason based on product and platform]"
  - label: "food / hero"
    description: "Food product, centered hero presentation"
  - label: "beauty / split"
    description: "Beauty product, product + copy split layout"
  - label: "electronics / float"
    description: "Electronics, floating product with tech elements"
```

If only one is specified, show only the unspecified dimension's options.

### Q2: Scene + Promotion (skip if both specified)

```yaml
header: "Scene"
question: "Background scene and promotion type?"
multiSelect: false
options:
  - label: "[auto-scene] / [auto-promotion] (Recommended)"
    description: "[scene reason] + [promotion reason]"
  - label: "studio / brand"
    description: "Clean studio background, brand showcase"
  - label: "lifestyle / new-launch"
    description: "In-use scenario, new product launch"
  - label: "seasonal / discount"
    description: "Seasonal theme, discount promotion"
```

### Q3: Platform + Aspect (skip if both specified)

```yaml
header: "Platform"
question: "Target platform and aspect ratio?"
multiSelect: false
options:
  - label: "[preferred-platform] / [platform-default-aspect] (Recommended)"
    description: "[platform name] default settings"
  - label: "taobao / 1:1"
    description: "Taobao/Tmall, square main image"
  - label: "xiaohongshu / 3:4"
    description: "Xiaohongshu, portrait lifestyle"
  - label: "douyin / 9:16"
    description: "Douyin, vertical feed ad"
```

### Q4: Mood + Text (skip if both specified)

```yaml
header: "Settings"
question: "Mood and text density?"
multiSelect: false
options:
  - label: "[auto-mood] / [auto-text] (Recommended)"
    description: "Auto-selected: [mood reason], [text reason]"
  - label: "premium / minimal"
    description: "Elegant restraint, product name only"
  - label: "balanced / standard"
    description: "Professional, product name + selling points"
  - label: "energetic / rich"
    description: "Bold promotional, full copy with price and CTA"
```

*Note*: "Other" (auto-added) allows typing custom combo. Parse `/`-separated values.

## After Response

Proceed to Step 3 with confirmed dimensions.
