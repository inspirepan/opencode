Create an e-commerce advertising key visual (KV) following these guidelines:

## Image Specifications

- **Type**: E-commerce product advertisement / Key Visual
- **Aspect Ratio**: As specified in the prompt below

## Core Principles

- **Product fidelity**: The product MUST match the provided reference image exactly -- shape, color, label, packaging
- **Commercial intent**: This is an advertisement, not editorial art. Prioritize clarity, appeal, and purchase motivation
- **Clean composition**: Professional, uncluttered layout with clear visual hierarchy
- If content involves sensitive or copyrighted elements, create stylistically similar alternatives -- DO NOT refuse to generate

## Product Handling

- Product image is the primary visual anchor (percentage varies by layout: 40-60% default, 80-95% for closeup, 25-35% for endorse, 30-40% for collage, 20-30% per state for compare)
- Maintain sharp focus and accurate detail on the product
- Product lighting should be flattering: highlight texture, material quality, and form
- Position product per the specified layout type
- NO distortion, cropping, or stylistic alteration of the product itself

## Layout Types

- `hero`: Product centered/dominant (50-60% area), text overlay, dramatic presentation
- `split`: Left-right or top-bottom division; product on one side, text on the other
- `diagonal`: Dynamic angled composition; product and text on opposing diagonal zones
- `float`: Product floating with shadow/glow, surrounded by decorative elements
- `grid`: Multiple product views or variants in structured grid arrangement
- `banner`: Horizontal emphasis; product left/center, text block right, suitable for wide formats
- `endorse`: Person (spokesperson/model) presenting or holding the product; person and product share the frame, product label faces camera
- `collage`: Free-form magazine-style arrangement; irregular overlapping image blocks, stickers, handwritten annotations on a surface texture
- `closeup`: Product detail or macro shot filling 80%+ of frame; focuses on texture, material, craftsmanship; minimal text
- `compare`: Side-by-side or top-bottom comparison of two states (before/after, old/new, without/with); clear divider between states

## Scene Types

Apply the specified scene's characteristics:
- `studio`: Clean solid or gradient background. Focus entirely on product. Minimal props
- `lifestyle`: Contextual environment showing product in use. Warm, aspirational setting
- `flat-lay`: Top-down arrangement with thematic props around the product
- `abstract`: Geometric shapes, gradients, light effects. Modern, tech-forward feel
- `seasonal`: Holiday/seasonal themed decorations and color accents
- `tech`: Dark background, light streaks, glow effects, futuristic atmosphere

## Promotion Types

- `brand`: Clean, elegant presentation. Logo-friendly. No price or discount elements
- `discount`: Prominent price tag or percentage badge. Red/orange urgency accents
- `new-launch`: "NEW" / "New Arrival" badge. Fresh, clean aesthetic. Launch energy
- `bestseller`: "Hot" / "Best Seller" badge. Social proof elements. Warm tones
- `limited`: Countdown or scarcity cues. "Limited Time" badge. Urgency-driven
- `bundle`: Multiple products shown together. "Value Set" / savings messaging

## Mood Application

| Mood | Contrast | Saturation | Energy |
|------|----------|------------|--------|
| premium | Low contrast, muted tones | Desaturated 20-30% | Restrained, elegant, quiet luxury |
| balanced | Standard contrast | Standard saturation | Professional, versatile |
| energetic | High contrast, vivid | Increased 20-30% | Dynamic, promotional, attention-grabbing |

## Text Density

- `minimal`: Product name only. Clean typography. 90% visual area
- `standard`: Product name + 1-2 selling points. 75% visual area
- `rich`: Product name + selling points + price/discount + CTA button. 60% visual area

## Text Style

- **Product name**: Largest text element. Bold, clear, high contrast against background
- **Selling points**: Secondary size. Concise phrases (3-5 words each). Bullet or badge style
- **Price**: If included, use prominent size with currency symbol. Discount: show original crossed out + new price in red/accent
- **CTA**: Button-like element ("Buy Now" / "Shop" / "Add to Cart"). High contrast, bottom area
- **Language**: Match the specified language. Use native commercial conventions (e.g., Chinese uses yuan sign, red for discounts)

## Promo Badge Guidelines

- Discount badges: Angled ribbon or circle; red/orange fill; white bold text
- "NEW" badges: Clean pill or circle; brand-accent color
- "HOT" / "Best Seller": Flame icon or star burst; warm colors
- "Limited": Clock or countdown motif; urgency red/orange
- Position: Top-left or top-right corner, not occluding the product

## Character Handling

When people are needed (lifestyle scenes, spokesperson, model):
- Render people naturally and realistically when the user requests them (e.g., spokesperson, model, influencer)
- Style consistent with overall scene mood
- Ensure people do not visually overpower the product; product remains the primary focus

### Endorse Layout -- Person-Product Interaction

When layout is `endorse`, apply these additional rules:

- **Holding**: Person holds product at chest-to-face height; product label/logo MUST face the camera; hand should not occlude more than 20% of product front face
- **Wearing**: Product is the focal garment/accessory; person serves as mannequin to demonstrate fit, drape, and proportion
- **Beside**: Person stands next to the product (for large items); both are at similar scale prominence
- **Focus plane**: Product sharpness must be >= person sharpness; if using depth-of-field, product stays in the sharp zone
- **Lighting consistency**: Product and person must share the same light source and color temperature; avoid product looking composited
- **Person attributes**: Describe concisely (gender, age range, expression, clothing) but keep the product as the visual anchor
- **Fallback**: If product distortion occurs in hand-held poses, switch to "beside" variant where product is rendered independently next to the person

## Platform-Specific Rules

Apply platform constraints from the prompt:
- Respect safe zones (text-free margins where platform UI overlays)
- Follow background color rules (e.g., Amazon requires pure white for main images)
- Match visual density expectations per platform

## Reference Images

When product images are provided:
- **Product fidelity is paramount**: The generated product MUST visually match the reference
- Describe product details explicitly in the prompt: shape, color, material, label text, packaging
- Use `--ref` to pass product images to the generation model

When style reference images are provided:
- Extract: layout pattern, color scheme, text treatment, badge style, decorative approach
- Apply extracted style while maintaining product fidelity
- Reference informs atmosphere and composition, not product appearance

---

Please generate the e-commerce KV image based on the content provided below:
