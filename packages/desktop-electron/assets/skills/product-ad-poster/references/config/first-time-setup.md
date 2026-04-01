---
name: first-time-setup
description: First-time setup flow for product-ad-poster preferences
---

# First-Time Setup

## Overview

When no EXTEND.md is found, guide user through preference setup.

**BLOCKING OPERATION**: This setup MUST complete before ANY other workflow steps. Do NOT:
- Ask about product images
- Ask about dimensions (category, layout, scene)
- Proceed to product analysis

ONLY ask the questions in this setup flow, save EXTEND.md, then continue.

## Setup Flow

```
No EXTEND.md found
        |
        v
+---------------------+
| AskUserQuestion     |
| (all questions)     |
+---------------------+
        |
        v
+---------------------+
| Create EXTEND.md    |
+---------------------+
        |
        v
    Continue to Step 1
```

## Questions

**Language**: Use user's input language or saved language preference.

**CRITICAL -- Localized User-Facing Text**: Translate ALL `question`, `label`, and `description` values into the user's language at runtime. Append the English slug in parentheses so the response can be parsed back. The templates below are English references; never show them to the user as-is.

Use AskUserQuestion with ALL questions in ONE call:

### Question 1: Primary Platform

```yaml
header: "Platform"
question: "Primary e-commerce platform?"
options:
  - label: "Generic (Recommended)"
    description: "Balanced defaults, multi-platform use"
  - label: "Taobao/Tmall"
    description: "Chinese domestic e-commerce, 1:1 main images"
  - label: "Xiaohongshu"
    description: "Lifestyle aesthetic, 3:4 images, soft tones"
  - label: "Amazon"
    description: "White background, product-only main images"
```

### Question 2: Primary Category

```yaml
header: "Category"
question: "Primary product category?"
options:
  - label: "Auto-select (Recommended)"
    description: "Detect from product info each time"
  - label: "food"
    description: "Food, drinks, ingredients"
  - label: "beauty"
    description: "Skincare, makeup, cosmetics"
  - label: "fashion"
    description: "Clothing, shoes, accessories"
```

### Question 3: Default Mood

```yaml
header: "Mood"
question: "Default visual mood?"
options:
  - label: "balanced (Recommended)"
    description: "Professional, versatile for most products"
  - label: "premium"
    description: "Elegant, restrained -- luxury/high-end products"
  - label: "energetic"
    description: "Bold, vibrant -- promotions and sales events"
```

### Question 4: Brand Colors

```yaml
header: "Brand"
question: "Brand color for accent elements?"
options:
  - label: "No brand color (Recommended)"
    description: "Auto-select based on category and mood"
  - label: "Red"
    description: "Classic e-commerce accent (Chinese platforms)"
  - label: "Black/Gold"
    description: "Premium/luxury accent"
```

Note: User can type custom hex color via "Other".

### Question 5: Quick Mode

```yaml
header: "Quick"
question: "Enable quick mode by default?"
options:
  - label: "No (Recommended)"
    description: "Confirm dimension choices each time"
  - label: "Yes"
    description: "Skip confirmation, use auto-selection"
```

### Question 6: Save Location

```yaml
header: "Save"
question: "Where to save preferences?"
options:
  - label: "Project (Recommended)"
    description: ".dandelion/skill-configs/ (this project only)"
  - label: "User"
    description: "~/.dandelion/skill-configs/ (all projects)"
```

## Save Locations

| Choice | Path | Scope |
|--------|------|-------|
| Project | `.dandelion/skill-configs/product-ad-poster/EXTEND.md` | Current project |
| User | `~/.dandelion/skill-configs/product-ad-poster/EXTEND.md` | All projects |

## After Setup

1. Create directory if needed
2. Write EXTEND.md with frontmatter
3. Confirm: "Preferences saved to [path]"
4. Continue to Step 1

## EXTEND.md Template

```yaml
---
version: 1
preferred_platform: [selected platform or generic]
preferred_category: [selected category or null]
preferred_mood: [balanced/premium/energetic]
preferred_layout: null
preferred_scene: null
preferred_promotion: null
preferred_text: standard
brand_colors:
  primary: null
  accent: null
default_aspect: null
default_output_dir: independent
quick_mode: [true/false]
language: null
---
```

## Modifying Preferences Later

Users can edit EXTEND.md directly or delete it to re-trigger setup.
Full schema: `preferences-schema.md`
