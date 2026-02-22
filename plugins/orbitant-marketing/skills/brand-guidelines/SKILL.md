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

Apply Orbitant's official brand identity and style to any artifact. When in doubt, default to Blue Plasma as the primary accent and Stellar White as the background.

## Brand Colors

### Primary

| Name | Hex | Usage |
|------|-----|-------|
| Void Black | `#0D0D0D` | Primary text, dark backgrounds |
| Stellar White | `#F5F5F5` | Light backgrounds, text on dark |
| Blue Plasma | `#4567ED` | Primary brand color, links, CTAs, headings |

### Secondary

| Name | Hex | Usage |
|------|-----|-------|
| Quantum Green | `#24CC83` | Success states, positive accents |
| Cosmic Lavender | `#7C87F7` | Secondary accents, hover states |

### Neutral

| Name | Hex | Usage |
|------|-----|-------|
| Dark Grey | `#4A4A4F` | Body text, secondary text |
| Grey | `#7C7C83` | Muted elements, connectors |
| Light Grey | `#E5E5E6` | Subtle backgrounds, borders |

### Gradients

- **Blue-Lila**: `linear-gradient(135deg, #7C87F7 0%, #4567ED 100%)` — primary gradient for hero sections, buttons
- **Blue-Cyan**: `linear-gradient(132deg, #24C1CC -4.81%, #4567ED 97.75%)` — secondary gradient
- **Corporate**: `linear-gradient(106deg, #4567ED 2.4%, #7C87F7 25%, #6AA4F0 48.56%, #24C1CC 75%, #24CC83 100%)` — full brand spectrum for title slides, key CTAs

## Typography

### Font families

| Context | Font | Notes |
|---------|------|-------|
| Headings and body (web, documents) | **IBM Plex Sans** | Primary brand typeface |
| Alternative / creative contexts | **Satoshi** | Clean geometric sans-serif |
| Google Slides presentations | **Lexend** | Optimised for readability on screen |

### Heading sizes (desktop)

- H1: 48px
- H2: 40px
- H3: 32px
- H4: 24px
- Body: 16px

Use `font-weight: 300` for body text. Headings use bold weight. Use fluid typography (`clamp()`) for responsive scaling when applicable.

## How to Apply

### Presentation slides

- **Title slides**: Corporate gradient background, Stellar White text
- **Content slides**: Stellar White background, Void Black text, Blue Plasma accents
- **Section dividers**: Blue-Lila gradient background, Stellar White text
- **Font**: Use Lexend for Google Slides; IBM Plex Sans for other tools

### Documents

- **Headers**: Blue Plasma (`#4567ED`)
- **Body text**: Dark Grey (`#4A4A4F`), weight 300
- **Highlights / callouts**: Cosmic Lavender (`#7C87F7`) or Quantum Green (`#24CC83`)
- **Font**: IBM Plex Sans

### Diagrams (Mermaid, Excalidraw, etc.)

- **Primary elements** (main nodes, active states): Blue Plasma (`#4567ED`)
- **Secondary elements** (supporting nodes): Cosmic Lavender (`#7C87F7`)
- **Connectors / arrows**: Grey (`#7C7C83`)
- **Highlights / success states**: Quantum Green (`#24CC83`)
- **Backgrounds**: Stellar White (`#F5F5F5`) or transparent

### General rules

- Use hex values for solid colors, CSS gradients for gradient backgrounds
- Maintain sufficient contrast (WCAG AA minimum)
- Dark text on light backgrounds, light text on dark/gradient backgrounds
- When only one accent color is needed, use Blue Plasma

## Logo variants

Orbitant has three logo variants. Use the appropriate one depending on context:

| Variant | When to use |
|---------|-------------|
| **Imagotipo** | Full logo (icon + wordmark) — default for most contexts |
| **Logotipo** | Wordmark only — when the icon is already visible or space is tight |
| **Isotipo** | Icon only — favicons, small spaces, profile pictures |
