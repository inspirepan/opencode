# Step 3: Prompt Template

Save to `prompts/kv.md`:

```markdown
---
type: product-ad-poster
platform: [confirmed platform]
category: [confirmed category]
product_images:
  - filename: product-{slug}.{ext}
    usage: product
references:
  - ref_id: 01
    filename: refs/ref-01-{slug}.{ext}
    usage: style | layout | palette
---

# Product Context
Product name: [name from user input]
Category: [confirmed category]
Selling points: [key selling points extracted from input]
Price info: [price/discount if provided, or "not specified"]
Target audience: [inferred target audience]

# Visual Design
Use case: product-mockup
Platform: [confirmed platform]
Layout: [confirmed layout]
Scene: [confirmed scene]
Promotion: [confirmed promotion]
Mood: [confirmed mood]
Text level: [confirmed text level]
Aspect ratio: [confirmed ratio]
Language: [confirmed language]

# Product Presentation
Primary request: E-commerce key visual for [product name]
Subject: [product description -- shape, color, material, packaging, label text]
Product position: [per layout type -- centered/left/right; endorse: held by person / worn / beside; collage: largest block center-left; closeup: fills frame; compare: in State B or on divider]
Product area: [per layout type -- percentage; endorse: 25-35% with person 40-50%; collage: main block 30-40%; closeup: 80-95%; compare: 20-30% in one state]
Constraints: Product MUST match the reference image exactly. Preserve shape, color, label, and packaging detail. No distortion or stylistic alteration of the product.

# Scene Application
[Based on scene type:]
- studio: "Clean [gradient direction] background from [color A] to [color B]. Subtle contact shadow. Professional product photography lighting."
- lifestyle: "[Context description]. Product in natural use scenario. Warm, aspirational lighting. Depth-of-field blur on background."
- flat-lay: "Top-down arrangement on [surface]. Product centered, surrounded by [category-specific props]. Even diffused lighting."
- abstract: "Modern [color] gradient background with geometric shapes. Floating decorative elements. Clean, tech-forward atmosphere."
- seasonal: "[Season/holiday] themed. [Seasonal decorative elements]. Product as focal point amid [seasonal props]."
- tech: "Dark gradient background. Subtle [glow color] edge lighting on product. Light particle effects. Futuristic atmosphere."

# Mood Application
[Based on mood level:]
- premium: "Low contrast, muted tones, desaturated 20-30%. Restrained elegance. Quiet luxury feel. Generous whitespace."
- balanced: "Standard contrast, normal saturation. Professional, clean. Balanced visual weight."
- energetic: "High contrast, vivid saturated colors, increased 20-30%. Dynamic energy. Bold visual impact. Attention-grabbing."

# Text Elements
[Based on text level:]
- minimal: "Product name: [exact name]. Clean bold typography, high contrast. No other text."
- standard: "Product name: [exact name]. Selling points: [1-2 short phrases as badges or bullets]. Clear hierarchy."
- rich: "Product name: [exact name]. Selling points: [phrases]. Price: [price display with currency]. CTA: [button text]. Full commercial layout."

# Promotion Elements
[Based on promotion type:]
- brand: "No promotional badges. Clean, elegant presentation. Brand tone."
- discount: "Discount badge: [percentage or amount]. Original price crossed out, sale price in red/accent. Urgency accent."
- new-launch: "'NEW' or 'New Arrival' badge. Fresh aesthetic. Launch energy."
- bestseller: "'Hot' or 'Best Seller' badge. Warm social proof elements."
- limited: "'Limited Time' badge. Countdown or scarcity cues. Urgency-driven."
- bundle: "Multiple products displayed. 'Value Set' or savings messaging."

# Platform Constraints
[Based on platform, load from references/platforms.md:]
- Safe zones: [platform-specific margins]
- Background: [platform requirement]
- Text rules: [platform-specific text constraints]

# Composition
Layout composition:
- [Layout-specific structure from references/layouts/{layout}.md]

Color scheme: [category color tendency + mood adjustment + brand colors if set]
Style/medium: [commercial product photography / lifestyle editorial / tech product shot]
Lighting/mood: [per scene and mood combination]
Avoid: stock-photo vibe; cluttered layout; distorted product; illegible text; oversaturated neon; tacky lens flare

[If endorse layout, add:]
# Person-Product Interaction
Person: [gender, age range, expression, clothing style]
Interaction: [holding at chest height / wearing / standing beside]
Product visibility: Product label/logo faces camera. Hand does not occlude more than 20% of product front face. Product in sharp focus plane.
Person framing: Waist-up crop, [left/right] side of frame
Fallback note: If product distortion occurs, regenerate with "beside" variant (person and product side by side, not hand-held)

[If collage layout, add:]
# Collage Arrangement
Surface: [kraft paper / wooden desk / marble counter / cork board]
Main block: Product photo, largest (30-40%), [position], [tilt degrees]
Block 2: [detail close-up / in-use scene], [position], [size]
Block 3: [additional angle / ingredient / context], [position], [size]
Decorative: [masking tape on corners / drop shadows / handwritten annotations / stickers]
Annotations: "[casual text in target language]"

[If closeup layout, add:]
# Detail Focus
Focus area: [specific part of product to show -- texture, ingredient, mechanism, pattern, cross-section]
Crop: Tight macro, product detail fills 80-95% of frame
Depth-of-field: Sharp focus on [detail area], gentle bokeh falloff at edges
Lighting: Directional [side/top] lighting to reveal [texture/depth/grain]
Text: Brand name or tagline only, small, in corner -- never overlay on detail area

[If compare layout, add:]
# Comparison Setup
State A (left/top): [description of before/without/old state -- colors, mood, condition]
State B (right/bottom): [description of after/with/new state -- colors, mood, condition]
Divider: [clean line / gradient fade / diagonal slash / "VS" badge / arrow]
Labels: "[Before] / [After]" or equivalent in target language
Product placement: [in State B / centered on divider at 20-30% frame size]
Framing: Identical angle and distance for both states; only the [condition/feature] changes

[Product image section -- REQUIRED, see below]
[Reference style section -- if provided]
```

## Product Image Handling -- CRITICAL

Product images are the primary visual input. The generated KV MUST preserve exact product appearance.

**MUST add `product_images` field in YAML frontmatter** when product images are saved:

```yaml
product_images:
  - filename: product-down-jacket.png
    usage: product
```

**In prompt body, ALWAYS include**:

```
# Product Reference -- MUST PRESERVE

CRITICAL: The product in the generated image MUST exactly match the provided product image.

## Product Details -- REQUIRED:
- [Shape]: [Specific shape description, e.g., "Rectangular box with rounded corners"]
- [Color]: [Exact colors, e.g., "Matte black body with gold trim"]
- [Material]: [Surface description, e.g., "Frosted glass with metallic cap"]
- [Label/Text]: [Any text on product, e.g., "Brand name 'XYZ' in white serif font on front"]
- [Packaging]: [Package details if visible]

## Fidelity requirement:
The product must look like the same physical item. Preserve proportions, colors, textures, and any visible text/labels exactly.
```

## Style Reference Handling

When style reference images (competitor ads, mood boards) are provided:

**Add to frontmatter `references` list** when files saved to `refs/`:

```yaml
references:
  - ref_id: 01
    filename: refs/ref-01-competitor-ad.jpg
    usage: style
```

**In prompt body**:

```
# Reference Style -- MUST INCORPORATE

CRITICAL: Apply these visual characteristics from the reference images.

## From Ref 1 ([filename]) -- REQUIRED elements:
- [Layout pattern]: [Specific description, e.g., "Product left 40%, text block right with bullet points"]
- [Color scheme]: [Specific colors, e.g., "Coral #FF6B6B background, white text, gold accents"]
- [Badge style]: [Promo element style, e.g., "Angled red ribbon in top-right with white '20% OFF'"]
- [Typography]: [Text treatment, e.g., "Bold sans-serif product name, lighter weight selling points"]

## Integration approach:
[Specific instruction on how to combine reference style with the product and dimensions]
```

**Key rules**:
- Each visual element gets its own bullet with "MUST" or "REQUIRED"
- Descriptions must be specific enough to reproduce
- After generation, verify product fidelity and reference style; if not, strengthen and regenerate

## Content-Driven Design

- Product info and selling points drive text content
- Category guides decorative elements and color choices
- Platform constraints override creative preferences where mandatory
- Promotion type determines badge and urgency elements

## gpt-image-gen Prompt Integration

When calling image generation, structure the final prompt following gpt-image-gen conventions:

```
Use case: product-mockup
Asset type: e-commerce KV / product advertisement
Primary request: [product name] advertisement for [platform]
Scene/background: [scene description]
Subject: [product description from reference]
Style/medium: commercial product photography
Composition/framing: [layout description, product and text zones]
Lighting/mood: [scene + mood combination]
Color palette: [category colors + brand colors + mood adjustment]
Text (verbatim): "[exact product name]" "[selling points]" "[price if applicable]"
Constraints: product must match reference exactly; [platform constraints]; no distortion
Avoid: stock-photo vibe; cluttered layout; tacky effects; oversaturated; harsh bloom
Quality: high
```

This maps cleanly to gpt-image-gen's augmentation template while carrying all product-ad-poster dimensional information.
