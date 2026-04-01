# Endorse

Spokesperson or model presenting the product. Person and product share the frame; product is held, worn, or prominently displayed beside the person.

## Composition

- Person zone: 40-50%, positioned left or right, waist-up or half-body crop
- Product zone: 25-35%, held in hand or placed at chest/face height, label facing camera
- Text zone: 15-25%, opposite side of person or anchored bottom
- Decorative zone: minimal -- person and product fill most of the frame

## Spatial Guide

### Variant A: Holding (hand-held products -- bottles, phones, food, cosmetics)

```
+----------------------------+
|                  [badge]   |
|  +---------+               |
|  | PERSON  |   HEADLINE    |
|  | (waist  |   subtext     |
|  |  up)    |               |
|  |   [PRODUCT]             |
|  |   (in hand,             |
|  |    label facing         |
|  |    camera)    [CTA]     |
|  +---------+               |
+----------------------------+
```

### Variant B: Wearing (fashion, accessories, wearables)

```
+----------------------------+
|        [badge/logo]        |
|     +--------------+       |
|     |   PERSON     |       |
|     | (wearing     |       |
|     |  PRODUCT)    |       |
|     +--------------+       |
|   HEADLINE    [price]      |
|   selling points   [CTA]  |
+----------------------------+
```

### Variant C: Beside (large products, appliances, furniture)

```
+----------------------------+
|  HEADLINE                  |
|  subtext                   |
|                            |
|  +------+   +----------+  |
|  |PERSON|   | PRODUCT   |  |
|  |(half  |   | (full     |  |
|  | body) |   |  view)    |  |
|  +------+   +----------+  |
|              [CTA/price]   |
+----------------------------+
```

## Product-Person Interaction Rules

- **Product label/logo MUST face the camera** -- tilt product toward lens even if hand angle is natural
- **Hand should not occlude** product name, key label text, or more than 20% of the product front face
- **Product at eye-to-chest height** for holding variant -- this is the natural attention zone
- **Lighting on product must match person lighting** -- avoid product looking composited
- **Product sharpness >= person sharpness** -- if depth-of-field is used, keep product in focus plane with person

## Best For

- Celebrity/influencer endorsement campaigns
- Beauty product demonstration (model applying/holding)
- Fashion on-model shots (wearing)
- Food/beverage lifestyle (person enjoying product)
- Electronics product launch (person holding phone/device)
- Xiaohongshu and Douyin content-style ads

## Platform Compatibility

| Platform | Fit | Notes |
|----------|-----|-------|
| taobao | Good | Model shots common for apparel and beauty |
| jd | OK | More conservative; use for fashion/beauty categories only |
| douyin | Best | KOL-style endorsement is native to Douyin ads |
| xiaohongshu | Best | Influencer aesthetic is the platform's DNA |
| amazon | OK | Lifestyle images (not main image, which requires white bg) |
| shopee | Good | Model shots boost click-through on mobile feeds |

## Scene Compatibility

| Scene | Fit | Notes |
|-------|-----|-------|
| studio | Best | Clean backdrop isolates person + product; easiest for AI |
| lifestyle | Best | Contextual setting adds story (cafe, vanity, gym) |
| flat-lay | Avoid | Top-down view contradicts person framing |
| abstract | OK | Gradient backdrop can work for beauty/tech |
| seasonal | Good | Seasonal outfit or themed product presentation |
| tech | OK | Dark background works for electronics endorsement |

## Prompt Notes

- **Prioritize studio or simple backgrounds** -- complex environments increase the chance of product distortion
- **Describe hand pose explicitly**: "right hand holding [product] at chest height, fingers wrapped around the lower half, label facing forward"
- **Specify person attributes concisely**: gender, approximate age range, expression, clothing style -- but keep focus on the product interaction
- **For holding variant**: instruct "product occupies 25-35% of frame, clearly visible and in sharp focus, held naturally at [chest/face] height"
- **For wearing variant**: instruct "product is the focal garment/accessory, person serves as mannequin to show fit and drape"
- **Fallback strategy**: if product fidelity is poor in result, switch to Variant C (person beside product) where the product can be rendered independently without hand interaction
- **AI limitation note**: hand-held product fidelity is the hardest scenario for current image models. If the result distorts the product, consider generating person and product separately then requesting an edit/composite, or use Variant C instead
