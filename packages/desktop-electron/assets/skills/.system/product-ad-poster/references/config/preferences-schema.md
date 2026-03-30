---
name: preferences-schema
description: EXTEND.md YAML schema for product-ad-poster user preferences
---

# Preferences Schema

## Full Schema

```yaml
---
version: 1

preferred_platform: null    # taobao|jd|douyin|xiaohongshu|amazon|shopee|generic or null
preferred_category: null     # food|beauty|fashion|electronics|home|lifestyle|sports|kids or null
preferred_layout: null       # hero|split|diagonal|float|grid|banner or null for auto
preferred_scene: null        # studio|lifestyle|flat-lay|abstract|seasonal|tech or null for auto
preferred_promotion: null    # brand|discount|new-launch|bestseller|limited|bundle or null for auto
preferred_mood: balanced     # premium|balanced|energetic
preferred_text: standard     # minimal|standard|rich

brand_colors:
  primary: null              # Hex color or null (e.g., "#E4393C")
  accent: null               # Hex color or null

default_aspect: null         # 1:1|3:4|4:3|16:9|9:16 or null (use platform default)
default_output_dir: independent  # independent|same-dir
quick_mode: false            # Skip confirmation when true
language: null               # zh|en|ja|ko|auto (null = auto-detect)
---
```

## Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `version` | int | 1 | Schema version |
| `preferred_platform` | string | null | Platform name or null |
| `preferred_category` | string | null | Category name or null for auto |
| `preferred_layout` | string | null | Layout name or null for auto |
| `preferred_scene` | string | null | Scene name or null for auto |
| `preferred_promotion` | string | null | Promotion type or null for auto |
| `preferred_mood` | string | balanced | Mood level |
| `preferred_text` | string | standard | Text density level |
| `brand_colors.primary` | string | null | Primary brand color (hex) |
| `brand_colors.accent` | string | null | Accent color (hex) |
| `default_aspect` | string | null | Aspect ratio or null for platform default |
| `default_output_dir` | string | independent | Output directory strategy |
| `quick_mode` | bool | false | Skip confirmation step |
| `language` | string | null | Output language (null = auto-detect) |

## Category Options

| Value | Description |
|-------|-------------|
| `food` | Food, beverages, snacks, ingredients |
| `beauty` | Skincare, makeup, cosmetics, fragrance |
| `fashion` | Clothing, shoes, bags, accessories, jewelry |
| `electronics` | Phones, laptops, gadgets, peripherals |
| `home` | Furniture, kitchenware, bedding, decor |
| `lifestyle` | Stationery, books, candles, gifts |
| `sports` | Fitness gear, sportswear, outdoor equipment |
| `kids` | Baby products, toys, children's clothing |

## Layout Options

| Value | Description |
|-------|-------------|
| `hero` | Product centered, dominant visual, text overlay |
| `split` | Product and text in separate zones (L/R or T/B) |
| `diagonal` | Dynamic angled composition |
| `float` | Product floating with shadow/glow, decorative elements |
| `grid` | Multiple products or variants in grid |
| `banner` | Horizontal emphasis, wide format |

## Scene Options

| Value | Description |
|-------|-------------|
| `studio` | Clean solid/gradient background, minimal props |
| `lifestyle` | Contextual environment, in-use scenario |
| `flat-lay` | Top-down arrangement with props |
| `abstract` | Geometric shapes, gradients, modern feel |
| `seasonal` | Holiday/seasonal themed decorations |
| `tech` | Dark background, glow effects, futuristic |

## Promotion Options

| Value | Description |
|-------|-------------|
| `brand` | Clean brand presentation, no price elements |
| `discount` | Prominent discount badge, price display |
| `new-launch` | "NEW" badge, launch aesthetic |
| `bestseller` | "HOT" / popularity badge, social proof |
| `limited` | Urgency elements, countdown, scarcity |
| `bundle` | Multiple products, value messaging |

## Mood Options

| Value | Description |
|-------|-------------|
| `premium` | Low contrast, muted tones, elegant restraint |
| `balanced` | Standard contrast, professional, versatile |
| `energetic` | High contrast, vivid colors, promotional energy |

## Text Options

| Value | Description |
|-------|-------------|
| `minimal` | Product name only |
| `standard` | Product name + 1-2 selling points |
| `rich` | Product name + selling points + price/discount + CTA |

## Platform Options

| Value | Default Aspect | Key Constraint |
|-------|---------------|----------------|
| `taobao` | 1:1 | Clean studio main image |
| `jd` | 1:1 | White background main, tech-polished |
| `douyin` | 9:16 | Vibrant, attention-grabbing |
| `xiaohongshu` | 3:4 | Lifestyle aesthetic, soft tones |
| `amazon` | 1:1 | Pure white background REQUIRED for main |
| `shopee` | 1:1 | Bold promo, orange/red theme |
| `generic` | 1:1 | Balanced defaults |

## Example: Minimal Preferences

```yaml
---
version: 1
preferred_platform: taobao
preferred_category: null
preferred_mood: balanced
preferred_text: standard
quick_mode: false
---
```

## Example: Full Preferences

```yaml
---
version: 1
preferred_platform: xiaohongshu
preferred_category: beauty
preferred_layout: hero
preferred_scene: null
preferred_promotion: null
preferred_mood: premium
preferred_text: standard
brand_colors:
  primary: "#D4A574"
  accent: "#8B6F47"
default_aspect: "3:4"
default_output_dir: independent
quick_mode: true
language: zh
---
```
