# PIM Design System — Nest UI Kit

Central documentation for shared UI styles. All new pages and components should use these tokens and components for consistency.

**Source:** [Nest UI Kit (Figma)](https://www.figma.com/design/CHACynbUiJMgOrwgNWdsoz/%F0%9F%92%A0-Nest-UI-Kit?node-id=30589-3386)

---

## Buttons

### Sizes

| Size   | Height | Usage                          |
|--------|--------|---------------------------------|
| Large  | 48px   | Hero CTAs, main actions        |
| Medium | 40px   | Default for most actions       |
| Small  | 32px   | Inline, toolbar, tight layouts |
| XSmall | 24px   | Icon-only, compact UI         |

### Intents

- **Brand** — Primary app actions (reddish-orange primary, dark blue secondary/alt/ghost).
- **Negative** — Destructive or caution (red).
- **Positive** — Success / confirmation (green).

### Variants

| Variant   | Brand | Negative | Positive |
|-----------|--------|----------|----------|
| Primary   | ✓      | ✓        | ✓        |
| Secondary | ✓      | ✓        | —        |
| Alt       | ✓      | —        | —        |
| Ghost     | ✓      | ✓        | —        |

### States

- **Default** — Rest state.
- **Hover** — Darker / tinted background.
- **Active** — Darker on press.
- **Focus** — Visible outline (blue for brand, red for negative, green for positive).
- **Disabled** — Muted colors, non-interactive.

### Token reference

Tokens used by buttons are in `src/styles/design-tokens.css`:

- **Brand primary:** `--color-brand-primary`, `--color-brand-primary-hover`, `--color-brand-primary-active`, `--color-brand-primary-disabled`
- **Brand secondary/alt/ghost:** `--color-brand-secondary` (dark blue), `--color-brand-secondary-muted`
- **Negative:** `--color-negative-primary`, `--color-negative-primary-hover`, etc.
- **Positive:** `--color-positive-primary`, etc.
- **Neutral:** `--color-foreground-default`, `--color-foreground-disabled`, `--color-background-default`, `--color-border-subtle`

### Usage

**1. Button component (preferred)**

```tsx
import { Button } from "./components/ui/Button";

<Button intent="brand" variant="primary" size="medium" onClick={...}>
  Create product
</Button>
<Button intent="negative" variant="ghost" size="small">Delete</Button>
```

**2. CSS classes**

Use when you need a plain `<button>` with design-system styles:

```html
<button class="btn btn--brand btn--primary btn--medium">Save</button>
<button class="btn btn--negative btn--secondary btn--small">Cancel</button>
<button class="btn btn--brand btn--ghost btn--medium" aria-label="Back">← Back</button>
```

Class pattern: `btn btn--{intent} btn--{variant} btn--{size}`.  
Optional: `btn--icon-only` for square/round icon buttons.

### Icon-only buttons

Use `size="xsmall"` or `size="small"` and pass only an icon (no children).  
Or use class `btn btn--icon-only btn--{size}` with an icon inside.

---

## Design tokens (global)

Defined in `src/styles/design-tokens.css` and imported in `src/index.css`. Use CSS variables in all new styles:

- **Colors:** `--color-*` for brand, negative, positive, foreground, background, border.
- **Typography:** `--font-heading`, `--font-body`, `--body-medium-size`, etc.
- **Spacing:** `--space-*` if added later.

Import design tokens and buttons in your CSS via the global entry; no need to import in each component unless you scope to a single component.

---

## Checklist for new pages

1. Use `<Button>` from `src/components/ui/Button` for all actions (primary, secondary, cancel, etc.).
2. Use design tokens from `src/styles/design-tokens.css` for colors, type, and spacing.
3. Reuse button classes (`.btn`, `.btn--brand`, `.btn--primary`, etc.) when not using the component.
4. Match intents: Brand = primary flow, Negative = delete/danger, Positive = confirm/success.
5. Pick size from Nest UI Kit: 48 / 40 / 32 / 24 px height as documented above.
