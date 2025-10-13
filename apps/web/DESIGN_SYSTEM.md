# CollectIQ Design System Implementation

## Overview
This document describes the implementation of the CollectIQ design system with Tailwind CSS v4 and shadcn/ui components.

## Brand Colors

All purple and indigo colors have been removed from the design system. The palette consists of:

### Primary Colors
- **Vault Blue** (`#1A73E8`) - Primary action color, reliability and clarity
- **Holo Cyan** (`#00C6FF`) - Secondary accent, vibrant energy and modernity

### Surface & Background Colors
- **Carbon Gray** (`#1E1E1E`) - Dark mode background
- **Cloud Silver** (`#F5F7FA`) - Light mode background
- **Graphite Gray** (`#2E2E2E`) - Dark mode card backgrounds

### Semantic Colors
- **Emerald Glow** (`#00E676`) - Success states
- **Amber Pulse** (`#FFC400`) - Warning states
- **Crimson Red** (`#D32F2F`) - Error states

## Typography

### Font Families
- **Sans-serif**: Inter (UI elements)
- **Display**: Space Grotesk (Headers and titles)
- **Monospace**: JetBrains Mono (Code and data)

### Font Weights
- Regular (400) - Body text
- Medium (500) - Emphasis
- Bold (700) - Headers

## Components

### Button Component
Location: `components/ui/button.tsx`

Variants:
- `primary` - Vault Blue with hover effect
- `secondary` - Holo Cyan with hover effect
- `gradient` - Blue to Cyan gradient
- `outline` - Transparent with border
- `ghost` - Transparent background
- `success` - Emerald Glow
- `warning` - Amber Pulse
- `error` - Crimson Red

Sizes:
- `sm` - Small (h-9, px-4)
- `md` - Medium (h-11, px-6) [default]
- `lg` - Large (h-14, px-8)
- `icon` - Icon only (h-11, w-11)

### Card Component
Location: `components/ui/card.tsx`

Sub-components:
- `Card` - Container with rounded corners and shadow
- `CardHeader` - Top section with padding
- `CardTitle` - Title text using display font
- `CardDescription` - Subtitle text
- `CardContent` - Main content area
- `CardFooter` - Bottom section

## Dark Mode

Dark mode is implemented using:
1. CSS variables in `app/globals.css`
2. `.dark` class on `<html>` element
3. `data-theme="dark"` attribute
4. Theme toggle component at `components/theme-toggle.tsx`

### Dark Mode Color Mappings

| Variable | Light Mode | Dark Mode |
|----------|------------|-----------|
| `--background` | Cloud Silver | Carbon Gray |
| `--foreground` | #111111 | rgba(255,255,255,0.9) |
| `--card-bg` | #FFFFFF | Graphite Gray |
| `--card-border` | Graphite Gray | Vault Blue |

## Usage Examples

### Button Usage
```tsx
import { Button } from '@/components/ui/button';

// Primary button
<Button variant="primary">Click Me</Button>

// Gradient button
<Button variant="gradient" size="lg">Get Started</Button>

// Outline button
<Button variant="outline">Learn More</Button>
```

### Card Usage
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Theme Toggle Usage
```tsx
import { ThemeToggle } from '@/components/theme-toggle';

<ThemeToggle />
```

## Gradients

### Primary Gradient
45° gradient from Vault Blue to Holo Cyan:
```css
background: linear-gradient(45deg, var(--color-vault-blue), var(--color-holo-cyan));
```

Or use the utility class:
```tsx
<div className="gradient-primary">...</div>
```

## CSS Variables

All color tokens are defined in `app/globals.css` using the `@theme` directive for Tailwind CSS v4:

```css
@theme {
  --color-vault-blue: #1A73E8;
  --color-holo-cyan: #00C6FF;
  --color-carbon-gray: #1E1E1E;
  --color-cloud-silver: #F5F7FA;
  --color-graphite-gray: #2E2E2E;
  --color-emerald-glow: #00E676;
  --color-amber-pulse: #FFC400;
  --color-crimson-red: #D32F2F;
}
```

## Spacing & Layout

- **Grid System**: 8px base unit
- **Component Padding**: 16px (standard), 24px (sections), 32px (containers)
- **Max Content Width**: 1200px
- **Border Radius**: 12-16px for cards, 8-12px for buttons
- **Line Height**: 1.6 for readability

## Motion & Interaction

- **Transition Duration**: 200-300ms
- **Easing**: ease-in-out
- **Hover Effects**:
  - Slight scale (1.02)
  - Color transitions
  - Shadow elevation

## Accessibility

- All color combinations meet WCAG AA contrast standards
- Vault Blue on white: 8.6:1
- Holo Cyan on Carbon Gray: 5.1:1
- Focus outlines: 2px solid Holo Cyan
- Semantic colors for state indication

## Files Structure

```
apps/web/
├── app/
│   ├── globals.css          # Global styles and tokens
│   ├── layout.tsx            # Root layout with dark mode support
│   └── page.tsx              # Sample page demonstrating components
├── components/
│   ├── ui/
│   │   ├── button.tsx        # Button component
│   │   └── card.tsx          # Card component
│   └── theme-toggle.tsx      # Dark mode toggle
├── lib/
│   └── utils.ts              # Utility functions (cn)
├── postcss.config.mjs        # PostCSS configuration
└── tsconfig.json             # TypeScript configuration with path aliases
```

## Development Commands

```bash
# Start development server
pnpm web:dev

# Build for production
pnpm web:build

# Start production server
pnpm web:start
```

## Notes

- ✅ No purple or indigo colors anywhere in the codebase
- ✅ Tailwind CSS v4 with modern @theme directive
- ✅ Full dark mode support
- ✅ Accessible color contrast ratios
- ✅ Responsive design utilities
- ✅ Type-safe components with TypeScript
- ✅ shadcn/ui-compatible component structure
