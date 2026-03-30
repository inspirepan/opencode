# Auto-Selection Rules

When a dimension is omitted, select based on product signals.

## Auto Category Selection

| Signals | Category |
|---------|----------|
| Food, drink, snack, tea, coffee, ingredient, seasoning | `food` |
| Skincare, makeup, cosmetic, serum, cream, SPF, fragrance | `beauty` |
| Clothing, shoes, bag, accessory, jewelry, watch | `fashion` |
| Phone, laptop, headphone, camera, gadget, charger, cable | `electronics` |
| Furniture, kitchenware, bedding, storage, decor, lamp | `home` |
| Stationery, book, candle, plant, gift, travel gear | `lifestyle` |
| Fitness, outdoor, sportswear, yoga, running, cycling | `sports` |
| Baby, toy, kids clothing, maternity, stroller | `kids` |

## Auto Layout Selection

| Signals | Layout |
|---------|--------|
| Single hero product, brand campaign, premium feel | `hero` |
| Product + detailed copy, feature comparison | `split` |
| Dynamic energy, fashion, youth-oriented | `diagonal` |
| Light product, creative display, tech gadget | `float` |
| Multiple SKUs, color variants, bundle display | `grid` |
| Wide format, platform banner, horizontal ad slot | `banner` |
| Spokesperson, model, influencer, person holding/wearing product, KOL endorsement | `endorse` |
| Magazine style, mood board, multi-photo storytelling, 种草, editorial collage | `collage` |
| Texture detail, material close-up, macro, craftsmanship, ingredient texture | `closeup` |
| Before-after, transformation, comparison, versus, upgrade, old vs new | `compare` |

Platform influence:
- `amazon` main image -> prefer `hero` (clean white background requirement)
- `xiaohongshu` -> prefer `hero` or `split` (lifestyle-aesthetic)
- `douyin` -> prefer `hero` or `diagonal` (vertical, attention-grabbing)
- `xiaohongshu` with person/model mention -> prefer `endorse` (influencer-native)

## Auto Scene Selection

| Signals | Scene |
|---------|-------|
| Product-only shot, detail focus, white/clean background | `studio` |
| In-use scenario, home/outdoor context, aspirational | `lifestyle` |
| Multiple items, arrangement, accessories, recipe | `flat-lay` |
| Geometric, modern brand, gradient, pattern-based | `abstract` |
| Holiday sale, seasonal collection, festival theme | `seasonal` |
| Digital product, gadget, futuristic, AI-related | `tech` |

Category influence:
- `food` -> prefer `lifestyle` or `flat-lay`
- `beauty` -> prefer `studio` or `lifestyle`
- `electronics` -> prefer `tech` or `studio`
- `fashion` -> prefer `lifestyle` or `studio`
- `home` -> prefer `lifestyle`

## Auto Promotion Selection

| Signals | Promotion |
|---------|-----------|
| Brand story, premium showcase, no price mentioned | `brand` |
| Percentage off, sale, coupon, price drop | `discount` |
| New product, launch, just arrived, first release | `new-launch` |
| Top seller, popular, #1, trending, best rated | `bestseller` |
| Flash sale, countdown, limited stock, today only | `limited` |
| Set, combo, buy X get Y, value pack | `bundle` |

Default: `brand` (safest for unknown intent)

## Auto Mood Selection

| Signals | Mood |
|---------|------|
| Luxury, premium, high-end, elegant, refined, designer | `premium` |
| General, everyday, standard, reliable, professional | `balanced` |
| Sale, promo, flash, event, festival, clearance, hype | `energetic` |

Category influence:
- `beauty` luxury line -> prefer `premium`
- `electronics` flagship -> prefer `premium`
- Any discount/limited promotion -> prefer `energetic`

Default: `balanced`

## Auto Text Selection

| Signals | Text Level |
|---------|------------|
| Brand campaign, visual-first, image ad | `minimal` |
| Standard product listing, moderate info | `standard` |
| Promotion with price, multi-feature, comparison | `rich` |

Promotion influence:
- `brand` -> prefer `minimal`
- `discount`, `limited`, `bundle` -> prefer `rich`
- `new-launch`, `bestseller` -> prefer `standard`

Default: `standard`
