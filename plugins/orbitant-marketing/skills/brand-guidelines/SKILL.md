---
name: orbitant-brand-guidelines
description: |
  Applies Orbitant's official brand colors and typography to any artifact that
  benefits from Orbitant's look-and-feel. Use when brand colors, style guidelines,
  visual formatting, or company design standards apply. Activate when creating
  presentations, documents, diagrams, or any visual content for Orbitant —
  even if the user doesn't explicitly mention "brand" or "styling".
version: "1.0.0"
license: Apache-2.0
metadata:
  author: orbitant
  tags: branding, design, visual-identity, styling, colors, typography
  forked_from: davila7/claude-code-templates
---

# Orbitant Brand Styling

## Overview

Apply Orbitant's official brand identity and style to any artifact.

**Keywords**: branding, corporate identity, visual identity, styling, brand colors, typography, Orbitant brand, visual formatting, visual design, presentations, documents

## Brand Guidelines

### Colors

**Primary Colors:**

- Blue: `#4567ED` — Primary brand color
- Lila (Purple): `#7C87F7` — Secondary accent
- Cyan: `#24C1CC` — Tertiary accent
- Green: `#24CC83` — Success/positive accent

**Neutral Colors:**

- Black: `#0C0D0E` — Primary text and dark backgrounds
- White: `#F5F5F5` — Light backgrounds and text on dark
- Dark Grey: `#4A4A4F` — Secondary text
- Grey: `#7C7C83` — Muted elements
- Light Grey: `#E5E5E6` — Subtle backgrounds, borders

**Gradients:**

- Blue-Lila: `linear-gradient(135deg, #7C87F7 0%, #4567ED 100%)` — Primary gradient
- Blue-Cyan: `linear-gradient(132deg, #24C1CC -4.81%, #4567ED 97.75%)` — Secondary gradient
- Corporate: `linear-gradient(106deg, #4567ED 2.4%, #7C87F7 25%, #6AA4F0 48.56%, #24C1CC 75%, #24CC83 100%)` — Full brand spectrum

### Typography

- **Headings**: System font stack (Arial, Helvetica, sans-serif) — clean and modern
- **Body Text**: System font stack with `font-weight: 300` for readability
- **Sizing**: Fluid typography using clamp() for responsive scaling

**Heading Sizes (desktop):**

- H1: 48px
- H2: 40px
- H3: 32px
- H4: 24px
- Body: 16px

## Features

### Smart Color Application

- Use Blue (`#4567ED`) as the primary accent color
- Use Lila (`#7C87F7`) for secondary elements and hover states
- Use gradients for hero sections, buttons, and key CTAs
- Use neutral colors for text and backgrounds

### Text Styling

- Headings: Bold, dark (`#0C0D0E`)
- Body text: Light weight (300), dark grey (`#4A4A4F`)
- Links/CTAs: Blue (`#4567ED`) or gradient backgrounds

### Shape and Accent Colors

- Primary shapes/buttons: Blue or Blue-Lila gradient
- Secondary accents: Cyan (`#24C1CC`)
- Success states: Green (`#24CC83`)
- Backgrounds: White (`#F5F5F5`) or Light Grey (`#E5E5E6`)

## Technical Details

### Color Application

- Use hex values for solid colors
- Use CSS gradients for gradient backgrounds
- Maintain sufficient contrast (WCAG AA minimum)
- Dark text on light backgrounds, light text on dark/gradient backgrounds

### Font Management

- Uses system font stack for maximum compatibility
- No custom font installation required
- Maintains readability across all platforms

## Usage Examples

### Presentation Slides

- Title slides: Corporate gradient background, white text
- Content slides: White background, dark text, blue accents
- Section dividers: Blue-Lila gradient

### Documents

- Headers: Blue (`#4567ED`)
- Body: Dark Grey (`#4A4A4F`)
- Highlights: Lila (`#7C87F7`) or Cyan (`#24C1CC`)

### Diagrams

- Primary elements: Blue (`#4567ED`)
- Secondary elements: Lila (`#7C87F7`)
- Connectors: Grey (`#7C7C83`)
- Highlights: Cyan (`#24C1CC`) or Green (`#24CC83`)
