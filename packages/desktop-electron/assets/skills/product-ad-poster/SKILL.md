---
name: product-ad-poster
description: Generates e-commerce posters, product images, and advertising key visuals (KV) with guided 6-dimension workflow (category, layout, scene, promotion, mood, text) across 8 product categories and 7 e-commerce platforms. Supports product photos and reference images as input to preserve product fidelity. MUST use this skill whenever the user wants to create any e-commerce related image, including but not limited to: product posters (海报), product main images (主图), detail banners (详情页), promotional ads (广告图), campaign visuals (活动图), platform listing images, product showcase images, social commerce content images, or key visuals (KV). Trigger phrases include "generate product image", "create ad image", "make poster", "make e-commerce banner", "design product KV", "product photo", "listing image", "e-commerce poster", and Chinese equivalents like "生成电商图", "电商海报", "做海报", "做主图", "做详情页", "设计广告图", "产品图", "商品图", "带货图", "种草图", "宣传图", "推广图", "促销海报", "活动海报". Do not use for article cover images, blog illustrations, or non-commerce creative work.
---

# E-commerce KV Generator

Generate advertising key visuals for e-commerce products with 6-dimensional customization.

## Usage

```bash
# Product image + description
/product-ad-poster --product product.png "lightweight down jacket, winter warmth, 199 yuan"

# Specify platform and category
/product-ad-poster --product shoe.jpg --platform xiaohongshu --category fashion

# Quick mode: skip confirmation
/product-ad-poster --product face-cream.png --quick

# With reference ad images
/product-ad-poster --product laptop.png --ref competitor-ad.jpg

# Text-only input (no product image)
/product-ad-poster --category food --promotion discount --platform taobao
[paste product info]

# Full specification
/product-ad-poster --product tea.png --platform douyin --category food --layout hero --scene lifestyle --promotion new-launch --mood premium --text standard
```

## Options

| Option | Description |
|--------|-------------|
| `--product <files...>` | Product images (primary input, passed as `--ref` to image-gen) |
| `--ref <files...>` | Style reference images (competitor ads, mood boards) |
| `--platform <name>` | taobao, jd, douyin, xiaohongshu, amazon, shopee, generic |
| `--category <name>` | food, beauty, fashion, electronics, home, lifestyle, sports, kids |
| `--layout <name>` | hero, split, diagonal, float, grid, banner, endorse, collage, closeup, compare |
| `--scene <name>` | studio, lifestyle, flat-lay, abstract, seasonal, tech |
| `--promotion <name>` | brand, discount, new-launch, bestseller, limited, bundle |
| `--mood <name>` | premium, balanced, energetic |
| `--text <level>` | minimal, standard, rich |
| `--aspect <ratio>` | Platform default, or: 1:1, 3:4, 4:3, 16:9, 9:16 |
| `--lang <code>` | Text language (zh, en, ja, etc.) |
| `--quick` | Skip confirmation, use auto-selection |

## Six Dimensions

| Dimension | Values | Default |
|-----------|--------|---------|
| **Category** | food, beauty, fashion, electronics, home, lifestyle, sports, kids | auto |
| **Layout** | hero, split, diagonal, float, grid, banner, endorse, collage, closeup, compare | auto |
| **Scene** | studio, lifestyle, flat-lay, abstract, seasonal, tech | auto |
| **Promotion** | brand, discount, new-launch, bestseller, limited, bundle | auto |
| **Mood** | premium, balanced, energetic | balanced |
| **Text** | minimal, standard, rich | standard |

Auto-selection rules: [references/auto-selection.md](references/auto-selection.md)

## Platform Defaults

| Platform | Aspect | Style Tendency |
|----------|--------|----------------|
| taobao | 1:1 | Clean studio, price-prominent |
| jd | 1:1 | Tech-polished, feature-focused |
| douyin | 9:16 | Vibrant, lifestyle-driven |
| xiaohongshu | 3:4 | Lifestyle-aesthetic, soft tones |
| amazon | 1:1 | White background, minimal |
| shopee | 1:1 | Bold colors, promo-heavy |
| generic | 1:1 | Balanced defaults |

Details: [references/platforms.md](references/platforms.md)

## Galleries

**Categories**: food, beauty, fashion, electronics, home, lifestyle, sports, kids
> Details: [references/categories/](references/categories/)

**Layouts**: hero, split, diagonal, float, grid, banner, endorse, collage, closeup, compare
> Details: [references/layouts/](references/layouts/)

**Visual Elements**: promo badges, decorative props, CTA buttons
> Details: [references/visual-elements.md](references/visual-elements.md)

## File Structure

Output directory per `default_output_dir` preference:
- `independent` (default): `product-ad-poster/{product-slug}/`
- `same-dir`: `{input-dir}/`

```
<output-dir>/
├── product-{slug}.{ext}      # Product images
├── refs/                      # Reference images (if provided)
│   ├── ref-01-{slug}.{ext}
│   └── ref-01-{slug}.md      # Description file
├── prompts/kv.md              # Generation prompt
└── kv.png                     # Output image
```

**Slug**: 2-4 words, kebab-case. Conflict: append `-YYYYMMDD-HHMMSS`

## Workflow

### Progress Checklist

```
E-commerce KV Progress:
- [ ] Step 0: Check preferences (EXTEND.md) - BLOCKING
- [ ] Step 1: Analyze product + save images + determine output dir
- [ ] Step 2: Confirm options (6 dimensions + platform) -- unless --quick
- [ ] Step 3: Create prompt
- [ ] Step 4: Generate image
- [ ] Step 5: Completion report
```

### Flow

```
Input -> [Step 0: Preferences] -+- Found -> Continue
                                +- Not found -> First-Time Setup - BLOCKING -> Save EXTEND.md -> Continue
        |
Analyze Product + Save Images -> [Output Dir] -> [Confirm: 6 Dimensions + Platform] -> Prompt -> Generate -> Complete
                                                          |
                                                 (skip if --quick or all specified)
```

### Step 0: Load Preferences - BLOCKING

Check EXTEND.md existence (priority: project -> user):
```bash
test -f .dandelion/skill-configs/product-ad-poster/EXTEND.md && echo "project"
test -f "$HOME/.dandelion/skill-configs/product-ad-poster/EXTEND.md" && echo "user"
```

| Result | Action |
|--------|--------|
| Found | Load, display summary -> Continue |
| Not found | Run first-time setup ([references/config/first-time-setup.md](references/config/first-time-setup.md)) -> Save -> Continue |

**CRITICAL**: If not found, complete setup BEFORE any other steps or questions.

### Step 1: Analyze Product

1. **Save product images** (if provided via `--product`) -> save to `product-{slug}.{ext}`
2. **Save reference images** (if provided via `--ref`) -> save to `refs/ref-NN-{slug}.{ext}`
3. **Save source content** (if pasted, save to `source.md`)
4. **Analyze product**: category, selling points, target audience, price info, brand tone
5. **Deep analyze references**: Extract layout patterns, color schemes, text placement, promo badge styles
6. **Detect language**: User input language > saved preference > product description language
7. **Determine output directory**: Per File Structure rules

### Step 2: Confirm Options

Full confirmation flow: [references/workflow/confirm-options.md](references/workflow/confirm-options.md)

| Condition | Skipped | Still Asked |
|-----------|---------|-------------|
| `--quick` or `quick_mode: true` | 6 dimensions | Platform + aspect (unless specified) |
| All 6 + `--platform` + `--aspect` | All | None |

### Step 3: Create Prompt

Save to `prompts/kv.md`. Template: [references/workflow/prompt-template.md](references/workflow/prompt-template.md)

**CRITICAL - Product Images**:
- Product images saved to output dir -> Add to prompt frontmatter `product_images` list
- These are passed via `--ref` to image-gen to preserve product appearance
- Prompt MUST include explicit instructions: "Preserve the exact product appearance from the reference image"

**CRITICAL - Reference Images in Frontmatter**:
- Style refs saved to `refs/` -> Add to frontmatter `references` list
- Before writing -> Verify: `test -f refs/ref-NN-{slug}.{ext}`

### Step 4: Generate Image

1. **Read base prompt**: [references/base-prompt.md](references/base-prompt.md)
2. **Read category-specific guide**: `references/categories/{category}.md`
3. **Check image generation skills**; if multiple, ask preference
4. **Process product images**: Pass via `--ref` parameter (product fidelity is critical)
5. **Process style references** from prompt frontmatter
6. **Generate**: Call image-gen skill with prompt files, output path, aspect ratio
7. On failure: auto-retry once

### Step 5: Completion Report

```
KV Generated!

Product: [product name]
Platform: [platform] | Aspect: [ratio]
Category: [category] | Layout: [layout] | Scene: [scene]
Promotion: [promotion] | Mood: [mood] | Text: [text]
Language: [lang]
Product Images: [N images]
References: [N images or "none"]
Location: [directory path]

Files:
- product-{slug}.{ext}
- prompts/kv.md
- kv.png
```

## Image Modification

| Action | Steps |
|--------|-------|
| **Regenerate** | Backup -> Update prompt file FIRST -> Regenerate |
| **Change dimension** | Backup -> Confirm new value -> Update prompt -> Regenerate |
| **Platform variant** | Keep prompt, change platform/aspect -> Generate new file |

## Composition Principles

- **Product is hero**: Product occupies 40-60% of visual area by default (varies by layout: 80-95% closeup, 25-35% endorse, 30-40% collage, 20-30% compare), sharp and prominent
- **Text hierarchy**: Price/discount most prominent, then product name, then selling points
- **Visual flow**: Eye moves from product -> key message -> CTA
- **Platform compliance**: Respect platform-specific text and layout constraints

## Extension Support

Custom configurations via EXTEND.md. See **Step 0** for paths.

Supports: Brand colors | Preferred platform | Preferred category | Default layout | Quick mode | Language

Schema: [references/config/preferences-schema.md](references/config/preferences-schema.md)

## References

**Dimensions**: [auto-selection.md](references/auto-selection.md)
**Platforms**: [platforms.md](references/platforms.md)
**Visual Elements**: [visual-elements.md](references/visual-elements.md)
**Categories**: [references/categories/](references/categories/)
**Layouts**: [references/layouts/](references/layouts/)
**Workflow**: [confirm-options.md](references/workflow/confirm-options.md) | [prompt-template.md](references/workflow/prompt-template.md)
**Config**: [preferences-schema.md](references/config/preferences-schema.md) | [first-time-setup.md](references/config/first-time-setup.md)
