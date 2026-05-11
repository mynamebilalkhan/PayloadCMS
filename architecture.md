# Architecture: PayloadCMS App

## Overview

A Payload CMS 3.76 + Next.js 15 App Router project for managing site pages with a dynamic block architecture. The codebase has two page-authoring paths:

- A **runtime versioned block system** where block schemas live in the database. Pages store block instances that pin to immutable schema versions, so schema changes do not break existing content.
- A **Payload-native page authoring path** in `Pages.ts` that adds a `hero` group and a Payload `blocks` field for configured blocks such as `Testimonials`.

Both paths are rendered by the frontend route. The runtime block system has been extended with four features: conditional field logic, advanced validation rules, visual UI metadata (tabbed/grid admin layout), and nested/composable blocks. The admin panel supports **Live Preview** — an embedded iframe that re-renders the frontend on every document save so editors can preview draft content in real time. The frontend shell (header, footer) is managed via **Payload Globals** and rendered in the async App Router layout.

**Stack:**
- Backend: Payload CMS 3.76.0 with PostgreSQL adapter
- Frontend: Next.js 15 (App Router)
- Database: PostgreSQL (via `postgresAdapter`)
- Package manager: pnpm 10.x (ESM module, Node 18.20.2+ or 20.9+)
- Runtime: React 19.2.1, TypeScript 5.7.3, Tailwind CSS 4.x
- Rich text: Payload Lexical editor
- Media processing: Sharp

---

## Collections

### 1. `block-definitions` — Master Registry
**File:** `src/collections/BlockDefinitions.ts`

One document per unique block type (e.g., "Hero Banner").

| Field | Type | Notes |
|-------|------|-------|
| `name` | text | Human-readable name |
| `slug` | text (unique) | Kebab-case machine ID, e.g. `hero-banner` — auto-normalized |
| `description` | textarea | Shown to content editors |
| `category` | select | `layout`, `content`, `media`, `navigation`, etc. |
| `icon` | text | Optional icon name or emoji |
| `currentVersion` | relationship → block-definition-versions | Auto-updated pointer to latest version |
| `isDeprecated` | checkbox | Prevents new pages from using block |
| `previewComponent` | text | Optional path to React preview component |

**Hooks:** `beforeChange` normalizes slug to kebab-case.

---

### 2. `block-definition-versions` — Immutable Schema Snapshots
**File:** `src/collections/BlockDefinitionVersions.ts`

Write-once schema snapshots. Each schema change creates a new version document; existing versions are never mutated (`update` access: `false`).

| Field | Type | Notes |
|-------|------|-------|
| `blockDefinition` | relationship → block-definitions | Parent block type |
| `versionNumber` | number | Auto-assigned sequential (1, 2, 3…) |
| `versionLabel` | text (read-only) | Display label, e.g. `v3` |
| `schema` | json | `BlockSchema` field definitions |
| `changelog` | textarea | Optional notes on what changed |
| `isStable` | checkbox | Unstable versions hidden from page builder |
| `blockSlug` | text (read-only) | Denormalized from parent for fast renderer lookups |

**Hooks:**
- `beforeValidate`: auto-assigns version number, validates schema via `validateBlockSchema()`, denormalizes parent slug, auto-wraps bare array schemas as `{ fields: [...] }`
- `afterChange`: updates parent `BlockDefinition.currentVersion` pointer on creation (passes `req` to share DB transaction)

---

### 3. `pages` — Page Content
**File:** `src/collections/Pages.ts`

Page metadata plus authoring fields for both the runtime block system and the newer Payload-native content model.

**Meta fields:** `title`, `slug` (auto-normalized), `status` (`draft` / `published` / `archived`)

**SEO group:** `seo.metaTitle`, `seo.metaDescription`, `seo.ogImage` (upload), `seo.noIndex`

**Top-level runtime `dbLayout` array (rendered by `DynamicRenderer`):**

| Field | Type | Notes |
|-------|------|-------|
| `blockDefinition` | relationship → block-definitions | Which block type |
| `blockVersion` | relationship → block-definition-versions | Pinned version (locked after first save) |
| `instanceId` | text (read-only) | Stable unique ID |
| `label` | text | Optional editor label |
| `data` | json | Field values conforming to pinned schema |
| `hidden` | checkbox | Hide on frontend without deleting |
| `anchor` | text | HTML anchor ID for deep-linking |

**Key design:** Pages pin to a specific `blockVersion` per instance. Schema updates create new versions and do not mutate already-authored page instances.

**Payload-native fields also present on each page:**

| Field | Type | Notes |
|-------|------|-------|
| `hero` | group | Shared hero field from `src/heros/config.ts`; rendered via `<RenderHero />` |
| `contentBlocks` | blocks array | Payload blocks field allowing `Testimonials`; rendered via `<RenderContentBlocks />` |

**Access and hooks:**
- Public reads are limited to `status: 'published'`; authenticated users can read drafts.
- `beforeChange` normalizes slugs to lowercase path-safe strings.

---

### Payload-Native Hero Field
**File:** `src/heros/config.ts`

The `hero` group supports four render types:

| Type | Renderer |
|------|----------|
| `none` | No hero |
| `highImpact` | `src/heros/HighImpact/index.tsx` |
| `mediumImpact` | `src/heros/MediumImpact/index.tsx` |
| `lowImpact` | `src/heros/LowImpact/index.tsx` |

Hero content includes Lexical rich text, up to two CTA links via `linkGroup()`, and a required media upload for high/medium impact variants. `src/heros/RenderHero.tsx` selects the renderer by `hero.type` and is rendered at the top of every page via `<RenderHero hero={page.hero} />`.

---

### Payload-Native Testimonials Block
**File:** `src/blocks/Generic/Testimonials/config.ts`

`Testimonials` is a standard Payload `Block` with an `items` array. Each item stores `name`, `company`, and `testimonial`. It is registered in the `contentBlocks` Payload blocks field in `Pages.ts` and rendered on the frontend by `RenderContentBlocks`.

### RenderContentBlocks
**File:** `src/blocks/RenderContentBlocks.tsx`

`RenderContentBlocks({ blocks })` renders the Payload-native `contentBlocks` array. It switches on `block.blockType` and delegates to the appropriate view component. Currently handles `'testimonials'` blocks; unknown block types render nothing (no crash). Rendered at the bottom of every page below `DynamicRenderer`.

---

### 4. `media` — Image & File Uploads
**File:** `src/collections/Media.ts`

Public image uploads with required `alt` text and optional `caption`. Image resizing is handled via Sharp. Image sizes: `thumbnail` (400×300), `card` (768×1024), `tablet` (1024×auto). Uploads are limited to `image/*` and use `thumbnail` as the admin thumbnail.

---

### 5. `users` — Authentication
Inline in `payload.config.ts`. Email + name fields; used to authenticate API calls.

---

## Globals

Payload Globals are singleton documents — one record per global, edited in the admin panel and fetched server-side on every frontend request.

### Header Global
**File:** `src/globals/Header.ts`

Controls the site-wide navigation bar.

| Field | Type | Notes |
|-------|------|-------|
| `logo` | upload → media | Optional logo image |
| `navigationItems` | array | Top-level nav items (see below) |
| `ctaButton` | group | `text` + `url` for the primary CTA in the nav |
| `stickyHeader` | checkbox (default: true) | Keeps header fixed on scroll |

**Navigation item fields:**

| Field | Type | Notes |
|-------|------|-------|
| `label` | text (required) | Link label |
| `url` | text | Relative or absolute URL — optional when children are present |
| `openInNewTab` | checkbox | |
| `children` | array | Dropdown items: `label` (required), `url` (required), `openInNewTab` |

Nav items with a non-empty `children` array render as dropdown menus on desktop and accordions on mobile. Parent items with children but no `url` act as pure dropdown triggers with no navigation of their own.

---

### Footer Global
**File:** `src/globals/Footer.ts`

Controls the site-wide footer.

| Field | Type | Notes |
|-------|------|-------|
| `logo` | upload → media | Optional footer logo |
| `columns` | array | Link columns: `heading` + `links[]` (label + url + openInNewTab) |
| `socialLinks` | array | Platform select (`twitter`, `linkedin`, `github`, `youtube`, `instagram`, `facebook`) + `url` |
| `copyright` | text | Copyright line |

---

### Globals barrel export
**File:** `src/globals/index.ts`

```ts
export { Header } from './Header'
export { Footer } from './Footer'
```

Both are registered in `payload.config.ts` under `globals: [Header, Footer]`.

---

## Frontend Layout

### Root Layout
**File:** `src/app/(frontend)/layout.tsx`

An `async` server component that:
1. Calls `getGlobals()` — parallel `Promise.all` fetch of the `header` and `footer` globals via `payload.findGlobal({ slug, depth: 1 })`
2. Falls back to empty objects `{}` if the globals fetch fails (DB unavailable during cold-start)
3. Renders the full page shell: `<SiteHeader>` → `<main>{children}</main>` → `<SiteFooter>`

```tsx
export default async function FrontendLayout({ children }) {
  const { header, footer } = await getGlobals()
  return (
    <html lang="en"><body className="antialiased">
      <SiteHeader logo={header.logo} navigationItems={header.navigationItems}
        ctaButton={header.ctaButton} stickyHeader={header.stickyHeader} />
      <main>{children}</main>
      <SiteFooter logo={footer.logo} columns={footer.columns}
        copyright={footer.copyright} socialLinks={footer.socialLinks} />
    </body></html>
  )
}
```

Also imports `@/blocks/registry-setup` here to ensure all block components are registered before any page renders.

---

### SiteHeader Component
**File:** `src/components/layout/Header.tsx`

`'use client'` — needs `useState` for mobile menu and dropdown state.

**Props (`SiteHeaderProps`):** `logo`, `navigationItems`, `ctaButton`, `stickyHeader`

**Desktop nav:** Items with `children` render a button that toggles a `role="menu"` dropdown panel. An invisible `fixed inset-0` backdrop div closes any open dropdown on outside click without a `useEffect` listener. Items without children render as plain `<a>` links; items with a URL only and no children render as standard links; items with no URL and no children render as a `<span>`.

**Mobile nav:** A hamburger button (hidden on `lg+`) toggles a full-width drawer below the header bar. Items with children render as accordions with a `border-l-2` indented sub-list. Navigating to any link closes the drawer automatically.

**State:**
- `mobileOpen: boolean` — drawer visibility
- `openDropdown: number | null` — index of the currently open desktop dropdown
- `openMobileSection: number | null` — index of the currently expanded mobile accordion

**ChevronDown** icon accepts a `className` prop for the `rotate-180` open/close animation.

---

### SiteFooter Component
**File:** `src/components/layout/Footer.tsx`

Server component (no interactivity needed).

Renders a four-area footer: brand column (logo + tagline), dynamic link columns from the `columns` global field, a social links row, and a copyright bar. The `SocialIcon` sub-component switches on `platform` to render the correct SVG for six platforms: Twitter/X, LinkedIn, GitHub, YouTube, Instagram, Facebook.

---

## Block Components

All runtime block components follow the same pattern:

```ts
export function MyBlock({ data, anchor }: BlockComponentProps<MyData>) { ... }
export const mySchema = { fields: [...] }
```

The schema export is used by `seed.ts` to register the block definition in the database. The component export is registered in the `BlockRegistry` via `registry-setup.ts`.

### HeroBanner
**File:** `src/blocks/HeroBanner/index.tsx`

Full-width two-column hero section.

| Field | Notes |
|-------|-------|
| `badge` | Announcement pill above the heading |
| `heading` | Main heading text (required) |
| `headingHighlight` | Word or phrase rendered in indigo with a highlight underbar |
| `description` | Subheading paragraph |
| `primaryCtaLabel` / `primaryCtaUrl` | Filled indigo CTA button |
| `secondaryCtaLabel` / `secondaryCtaUrl` | Ghost outline button with play icon |
| `mockupImage` | Optional screenshot — falls back to CSS `DashboardMockup` component |
| `socialProofText` | Text beside avatar stack and star rating |

Visual details: ambient blobs (`blur-3xl`), floating notification cards (deployment success + collaborator joined), glow behind the mockup card. `DashboardMockup` is a pure decorative component built entirely with Tailwind height/color classes — no inline styles.

---

### RichText
**File:** `src/blocks/RichText/index.tsx`

| Field | Notes |
|-------|-------|
| `content` | HTML string rendered via `dangerouslySetInnerHTML` |
| `alignment` | `left` / `center` / `right` — controls text alignment and container margin |

Applies Tailwind `prose` with custom overrides: indigo-tinted links, blockquote background fill, code pill styling, colored list markers. `max-w-3xl` inner container constrains line length; `center` alignment applies `mx-auto` to center the block.

---

### CardGrid
**File:** `src/blocks/CardGrid/index.tsx`

| Field | Notes |
|-------|-------|
| `heading` | Section heading |
| `subheading` | Optional paragraph below the heading |
| `columns` | Select: `'2'` / `'3'` / `'4'` (string values matching the seed schema) |
| `cards[]` | `title` (required), `description`, `image`, `linkUrl`, `linkLabel` |

Cards display a colored accent bar at the top (cycling through 6 colors: indigo, violet, sky, emerald, amber, rose). When no image is provided, a matching colored icon circle appears. Cards hover-lift (`-translate-y-1`) and deepen shadow. A link arrow appears at the bottom when `linkUrl` + `linkLabel` are set.

---

### Features
**File:** `src/blocks/Features/index.tsx`

Icon-based feature grid with 5 layout variants.

| Field | Notes |
|-------|-------|
| `variant` | `default` / `minimal` / `dark` / `gradient` / `cards` |
| `sectionLabel` | Small tag rendered above the heading |
| `heading` | Section heading |
| `subheading` | Optional subtitle paragraph |
| `columns` | `'2'` / `'3'` / `'4'` — responsive grid columns |
| `features[]` | `title`, `description`, `icon` (16 named SVG icons) |

Icon map `iconPaths` covers 16 inline SVG options: `zap`, `shield`, `layers`, `globe`, `code`, `chart`, `settings`, `star`, `heart`, `check`, `rocket`, `puzzle`, `users`, `mail`, `lock`, `cpu`. Unknown names fall back to `zap`.

---

### CTA
**File:** `src/blocks/CTA/index.tsx`

Call-to-action section with 6 style variants and two layout modes.

| Field | Notes |
|-------|-------|
| `variant` | `default` / `minimal` / `dark` / `gradient` / `brand` / `glass` |
| `layout` | `centered` / `split` |
| `eyebrow` | Small label above heading |
| `heading` | Main heading text |
| `description` | Supporting paragraph |
| `primaryCtaLabel` / `primaryCtaUrl` | Primary action button |
| `secondaryCtaLabel` / `secondaryCtaUrl` | Secondary ghost/outline button |

The `glass` variant uses `backdrop-blur-xl bg-white/5 border-white/10`. Gradient and brand variants add decorative ambient glow blobs (`blur-3xl opacity-20`).

---

### Testimonials
**File:** `src/blocks/Testimonials/index.tsx`

Customer testimonial grid. Server component — no client state needed.

| Field | Notes |
|-------|-------|
| `variant` | `default` / `featured` / `dark` |
| `sectionLabel` | Tag above heading |
| `heading` | Section heading |
| `subheading` | Optional subtitle |
| `testimonials[]` | `quote`, `name`, `title`, `company`, `rating` (select `'3'`/`'4'`/`'5'`) |

`featured` variant: first testimonial rendered large in the left column; items 1–2 stacked in the right column. Star rating clamped to 1–5 range. Avatar initials fallback: first letter of each name word.

---

### FAQ
**File:** `src/blocks/FAQ/index.tsx`

Accordion FAQ block. `'use client'` — uses `useState` for open/close accordion state.

| Field | Notes |
|-------|-------|
| `variant` | `default` / `minimal` / `dark` |
| `layout` | `single-column` / `two-column` |
| `sectionLabel` | Small tag above heading |
| `heading` | Section heading |
| `subheading` | Optional subtitle |
| `items[]` | `question`, `answer` |

`flush` variant: `border-0 border-b rounded-none` — divider lines only. Two-column layout uses `grid sm:grid-cols-2`. `ChevronIcon` animates `rotate-180` when open. Only one item open at a time; clicking an open item closes it.

---

### Pricing
**File:** `src/blocks/Pricing/index.tsx`

Pricing plan cards with highlighted plan support and 4 style variants.

| Field | Notes |
|-------|-------|
| `variant` | `default` / `gradient` / `dark` / `minimal` |
| `sectionLabel` | Tag above heading |
| `heading` | Section heading |
| `subheading` | Optional subtitle |
| `plans[]` | `name`, `description`, `price`, `period`, `badge`, `highlighted` (boolean), `features[]` (`{ text }[]`), `ctaLabel`, `ctaUrl` |

The variant map has parallel keys for highlighted vs non-highlighted plans: `card`/`cardHL`, `cta`/`ctaHL`, etc. Grid columns auto-determined by `plans.length`. `CheckIcon` uses `stroke` (not `fill`) for a clean checkmark.

---

### Block Registration
**File:** `src/blocks/registry-setup.ts`

```ts
registry.register('hero-banner',  HeroBannerBlock)
registry.register('rich-text',    RichTextBlock)
registry.register('card-grid',    CardGridBlock)
registry.register('features',     FeaturesBlock)
registry.register('cta',          CTABlock)
registry.register('testimonials', TestimonialsBlock)
registry.register('faq',          FAQBlock)
registry.register('pricing',      PricingBlock)
```

Imported once in `src/app/(frontend)/layout.tsx`.

---

## Type System

**File:** `src/validation/types.ts`

### Core schema types

```ts
interface BlockSchema {
  fields: BlockField[]
  layout?: 'default' | 'sidebar' | 'tabs'
}

type FieldType =
  | 'text' | 'textarea' | 'richtext'
  | 'number' | 'checkbox'
  | 'select' | 'multiselect'
  | 'date' | 'image' | 'file' | 'url' | 'email' | 'color'
  | 'array' | 'group' | 'relationship' | 'json'
  | 'blocks'
```

### Conditional logic types

```ts
type ConditionOperator =
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'greater_than' | 'less_than'
  | 'in' | 'not_in'
  | 'exists' | 'empty'

interface ConditionRule {
  field: string           // dot-notation path to sibling field value
  operator: ConditionOperator
  value?: unknown         // not required for 'exists' / 'empty'
}
```

### Validation rules

```ts
interface ValidationRules {
  required?: boolean
  minLength?: number; maxLength?: number   // text, textarea, url, email
  min?: number; max?: number               // number
  minRows?: number; maxRows?: number       // array
  regex?: RegExp                           // text, textarea, url, email
  step?: number                            // number — value must be a multiple of step
  integerOnly?: boolean                    // number
  uniqueItems?: boolean                    // array — no duplicate rows (shallow JSON equality)
  maxSelections?: number                   // multiselect
  maxFileSize?: number                     // file, image — max bytes
  allowedMimeTypes?: string[]              // file
}
```

### UI metadata

```ts
type UIWidth = 'full' | 'half' | 'third' | 'quarter'

interface UIMetadata {
  tab?: string        // tab name (default 'General')
  section?: string    // section within tab (default 'General')
  width?: UIWidth     // grid column width
  collapsed?: boolean // start collapsed in admin
  order?: number      // sort order within section
}
```

### BaseField

```ts
interface BaseField {
  name: string
  type: FieldType
  label?: string
  required?: boolean
  conditions?: ConditionRule[]
  conditionMode?: 'AND' | 'OR'       // default 'AND'
  validation?: ValidationRules
  ui?: UIMetadata
  admin?: { description?; readOnly?; hidden?; placeholder?; condition? }
}
```

Type-specific interfaces extend `BaseField` with their own constraints:

| Interface | Key additions |
|-----------|---------------|
| `TextField` | `minLength`, `maxLength` |
| `NumberField` | `min`, `max` |
| `SelectField` | `options: { label, value }[]` |
| `MultiSelectField` | `options`, `maxSelections` |
| `ArrayField` | nested `fields`, `minRows`, `maxRows` |
| `GroupField` | nested `fields` |
| `RelationshipField` | `collection`, `hasMany` |
| `FileField` | `allowedMimeTypes` |
| `DateField` | `timeFormat` |
| `BlocksField` | `allowedBlocks?`, `minBlocks?`, `maxBlocks?` |

### Nested block types

```ts
interface BlocksField extends BaseField {
  type: 'blocks'
  allowedBlocks?: string[]   // slugs of block definitions that can be nested
  minBlocks?: number
  maxBlocks?: number
}

interface NestedBlockValue {
  id?: string
  blockType: string          // slug of the nested block definition
  data: BlockData
}
```

`BlockField` is a union of all typed field interfaces. `BlockData` is `Record<string, unknown>`.

---

## Validation Layer

### Schema Validation
**File:** `src/validation/schemaValidator.ts`

`validateBlockSchema(schema: unknown): ValidationResult`

- Checks `fields` array is non-empty
- Validates field names (alphanumeric + underscore, starts with letter), types, and labels
- Type-specific rules: select options, number min/max, nested field recursion, duplicate name detection
- Validates `conditions` array: operator values, field name presence
- Validates `validation` object: numeric types, regex compilability, boolean flags
- Validates `ui` object: width values, numeric order
- For `blocks` fields: validates `allowedBlocks` slug array, `minBlocks`/`maxBlocks` types
- Returns `{ valid, errors, warnings }`

### Data Validation
**File:** `src/validation/dataValidator.ts`

`validateBlockData(schema: BlockSchema, data: BlockData): DataValidationResult`

- Validates instance data against its schema (required fields, type coercion, nested array/group/blocks recursion)
- `mergeValidation(field): ValidationRules` — merges direct field props with `field.validation.*`; the `validation` object takes precedence when both specify the same constraint
- Applies extended rules: `regex` match, `step` multiple check, `integerOnly` via `Number.isInteger`, `uniqueItems` via JSON-serialized dedup, `maxSelections`, `maxFileSize`
- For `blocks` fields: validates `minBlocks`/`maxBlocks` counts and `allowedBlocks` membership
- Returns `{ valid, errors: [{ path, message }] }`

### Condition Evaluation
**File:** `src/validation/evaluateConditions.ts`

`evaluateConditions(conditions: ConditionRule[], mode: 'AND' | 'OR', formData: Record<string, unknown>): boolean`

- Returns `true` when the field should be **visible** (conditions pass)
- Uses `getValueByPath()` for dot-notation field paths
- `equals`/`not_equals` use loose equality (`==`) to handle string/number coercion
- `in`/`not_in` cast `value` to array
- `exists` checks `!= null && !== ''`; `empty` is its inverse
- With `AND` mode: all conditions must pass; with `OR` mode: any condition suffices

---

## Builder & Schema Persistence

### Normalizer
**File:** `src/builder/normalizer.ts`

`normaliseSchema(raw: RawSchemaInput): BlockSchema`

Leniently pre-processes raw input before strict validation:
- Coerces unknown field types → `'text'`
- Normalizes option shorthand strings → `{ label, value }` objects
- Recursively handles nested fields
- Passes through `conditions`, `conditionMode`, `validation`, `ui` unchanged
- For `blocks` fields: passes through `allowedBlocks`, `minBlocks`, `maxBlocks`

### Form Layout Builder
**File:** `src/builder/buildFormLayout.ts`

`buildFormLayout(schema: BlockSchema): FormLayout`

Groups schema fields (excluding `admin.hidden`) into a tab → section → field hierarchy:
- Fields without `ui.tab` fall into the `'General'` tab
- Fields without `ui.section` fall into the `'General'` section
- Fields are sorted by `ui.order` within each section
- Returns `FormLayout` — an ordered array of `FormTab` objects, each containing `FormSection` objects, each containing `FormFieldEntry` objects

`hasUIMetadata(schema: BlockSchema): boolean`

Returns `true` only when at least one field has `ui.tab`, `ui.section`, `ui.width`, or `ui.order` set. `collapsed`-only metadata does not trigger the tabbed layout. This guard ensures backward compatibility — schemas without layout metadata continue rendering in the flat column layout.

`widthToStyle(width: UIWidth): string`

Maps width values to CSS calc strings:
| Width | CSS |
|-------|-----|
| `'full'` | `'100%'` |
| `'half'` | `'calc(50% - 8px)'` |
| `'third'` | `'calc(33.333% - 11px)'` |
| `'quarter'` | `'calc(25% - 12px)'` |

### Schema Save
**File:** `src/builder/saveSchema.ts`

**`saveSchemaLocally(payload, request)`** — Server-side (hooks, route handlers):
1. Normalizes via `normaliseSchema()`
2. Validates via `validateBlockSchema()`
3. Finds or creates `BlockDefinition` by slug
4. Creates immutable `BlockDefinitionVersion`
5. Returns `{ success, definitionId, versionId, versionNumber, errors, warnings }`

Note: `definitionId` and `versionId` are returned as strings via `String(id)`. For Postgres, relationship fields require integer IDs — use `parseInt(id, 10)` before passing to `payload.create()`.

**`saveSchemaViaHttp(request, options)`** — For external tools (CLI, browser): POSTs to `/api/blocks/save` with Bearer token auth.

---

## Renderer System

### Block Registry
**File:** `src/renderer/registry.ts`

Singleton `BlockRegistry` maps slugs to React components:

```ts
registry.register('hero-banner', HeroBannerBlock)
registry.get('hero-banner')        // → component or undefined
registry.has('hero-banner')        // → boolean
registry.list()                    // → string[]
registry.registerMany({ ... })
```

**Registration:** `src/blocks/registry-setup.ts` — import once in the frontend entry point (`src/app/(frontend)/layout.tsx`).

Current registered runtime block components:

| Slug | Component |
|------|-----------|
| `hero-banner` | `HeroBannerBlock` |
| `rich-text` | `RichTextBlock` |
| `card-grid` | `CardGridBlock` |
| `features` | `FeaturesBlock` |
| `cta` | `CTABlock` |
| `testimonials` | `TestimonialsBlock` |
| `faq` | `FAQBlock` |
| `pricing` | `PricingBlock` |

### DynamicRenderer
**File:** `src/renderer/DynamicRenderer.tsx`

`DynamicRenderer({ layout, customFallback })`

Iterates over a page's `dbLayout` array:
1. Looks up component in registry by `blockDefinition.slug`
2. Renders component with `data`, `schema`, `instanceId`, `anchor` props
3. Falls back to `FallbackRenderer` for unregistered slugs
4. Skips `hidden` blocks; applies `anchor` as HTML `id`

### NestedBlocksRenderer
**File:** `src/renderer/DynamicRenderer.tsx`

`NestedBlocksRenderer({ blocks, depth?, maxDepth?, customFallback? })`

Renders the value of a `blocks` schema field from inside a block component. Block components that contain a `blocks` data field call this utility to render their children via the same registry.

- Enforces a maximum nesting depth (`maxDepth`, default 3) — returns `null` and warns in dev when exceeded
- Looks up each nested block's component from the registry by `blockType`
- Falls back to `FallbackRenderer` for unregistered nested block types

```tsx
import { NestedBlocksRenderer } from '@/renderer'

export function SectionBlock({ data }) {
  return (
    <section>
      <h2>{data.title}</h2>
      <NestedBlocksRenderer blocks={data.children} />
    </section>
  )
}
```

### FieldRenderer
**File:** `src/renderer/FieldRenderer.tsx`

`FieldRenderer({ value, fieldType, label, schema })`

Renders individual field values by type:
- `text/textarea` → `<span>`/`<p>`
- `url/email` → `<a>` links
- `image` → `<img>`
- `richtext` → `dangerouslySetInnerHTML`
- `array` / `group` → recursive rendering
- `color` → colored swatch
- `json` → `<pre>` block

### FallbackRenderer
**File:** `src/renderer/FallbackRenderer.tsx`

Renders block data when no registered component exists. Dev mode shows a warning banner; always renders fields via `FieldRenderer` so the page never breaks.

---

## API Routes

### `POST /api/blocks/save`
**File:** `src/app/api/blocks/save/route.ts`

Saves / publishes block schemas to the DB. Requires Bearer token auth.

```ts
// Request
{ blockSlug, name?, description?, category?, schema: BlockSchema, changelog? }

// Response (201)
{ success, definitionId, versionId, versionNumber, errors?, warnings? }
```

### `POST /api/blocks/preview`
**File:** `src/app/api/blocks/preview/route.ts`

Validates block instance data and returns the schema/data pair for an admin preview client. Requires Payload session auth.

```ts
// Request
{ blockSlug, versionId, data: Record<string, unknown> }

// Response
{ valid: true, schema: BlockSchema, data: Record<string, unknown> }
```

### `GET /api/draft`
**File:** `src/app/api/draft/route.ts`

Enables Next.js Draft Mode so the frontend can render unpublished pages inside the admin Live Preview iframe. Requires an authenticated Payload session — unauthenticated requests receive a 401.

1. Authenticates the caller via `payload.auth({ headers })`
2. Calls `draftMode().enable()` — sets the `__prerender_bypass` cookie
3. Redirects to `/<slug>` (the actual frontend page)

Called automatically by the `livePreview.url` function in `payload.config.ts` when the admin panel opens the Live Preview iframe.

### `GET /api/exit-draft`
**File:** `src/app/api/exit-draft/route.ts`

Clears the Draft Mode cookie and redirects back to the page. Visiting `/api/exit-draft?slug=about-us` restores normal published-only rendering for the current browser session.

---

### Payload REST API
**File:** `src/app/(payload)/api/[...slug]/route.ts`

Payload's generated REST handlers expose collection and auth endpoints through the App Router.

```ts
export const GET = REST_GET(config)
export const POST = REST_POST(config)
export const DELETE = REST_DELETE(config)
export const PATCH = REST_PATCH(config)
export const OPTIONS = REST_OPTIONS(config)
```

### Payload GraphQL API
**File:** `src/app/(payload)/api/graphql/route.ts`

GraphQL is enabled with `GRAPHQL_POST(config)` and the playground GET route. The generated schema is written to `generated-schema.graphql`.

---

## Frontend Routing

### `[[...slug]]` Catch-All Page
**File:** `src/app/(frontend)/[[...slug]]/page.tsx`

| Path | Resolved slug |
|------|--------------|
| `/` | `"/"` |
| `/about-us` | `"about-us"` |
| `/docs/intro` | `"docs/intro"` |

- Checks `draftMode().isEnabled` from `next/headers` on every request
- Fetches page with `depth: 3`; omits the `status: 'published'` filter when draft mode is active so unpublished pages are visible in the admin preview
- Generates metadata from `page.seo.metaTitle`, `page.seo.metaDescription`, and `page.seo.noIndex` (always uses published data, ignores draft mode)
- Renders all three content areas in order: `<RenderHero hero={page.hero} />`, `<DynamicRenderer layout={page.dbLayout} />`, `<RenderContentBlocks blocks={page.contentBlocks} />`
- Renders `<LivePreviewListener serverURL={...} />` only when `isDraftMode` is true — zero overhead on public page loads
- Page component returns a `<>` fragment — the outer `<main>` is provided by `layout.tsx`
- `generateStaticParams()` pre-renders up to 200 published pages and returns `[]` if the DB is unavailable during build/dev cold-start

---

## Payload Configuration

**File:** `payload.config.ts`

```ts
buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: '— Block System' },
    livePreview: {
      url: ({ data }) => `${process.env.NEXT_PUBLIC_SERVER_URL}/api/draft?slug=${data?.slug}`,
      collections: ['pages'],
      breakpoints: [
        { label: 'Mobile',  name: 'mobile',  width: 375,  height: 667  },
        { label: 'Tablet',  name: 'tablet',  width: 768,  height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900  },
      ],
    },
  },
  collections: [BlockDefinitions, BlockDefinitionVersions, Pages, Media, Users],
  globals: [Header, Footer],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URI ?? 'postgresql://localhost:5432/payload_dynamic_blocks',
    },
  }),
  sharp,
  secret: process.env.PAYLOAD_SECRET ?? 'CHANGE_ME_IN_PRODUCTION',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql') },
})
```

### Next.js Configuration
**File:** `next.config.mjs`

Next is wrapped with `withPayload(nextConfig)`. Image optimization currently allows remote images from `http://localhost`.

---

## Custom Admin Field Components

Payload 3.x supports replacing any field's admin UI with a custom React component via `admin.components.Field`. These components use `'use client'` and the `@payloadcms/ui` hooks to read/write field values.

**Import map:** `src/app/(payload)/admin/importMap.js` — auto-generated by `pnpm payload generate:importmap`. Maps component string paths (e.g. `'@/components/BlockDataField#BlockDataField'`) to actual React component references.

---

### SchemaBuilderField
**Files:** `src/components/SchemaBuilderField/`

Visual schema builder for the `schema` field in `block-definition-versions`. Replaces the raw JSON textarea so editors can add/configure fields one at a time.

Registered in `BlockDefinitionVersions.ts`:
```ts
admin: {
  components: { Field: '@/components/SchemaBuilderField#SchemaBuilderField' },
}
```

**Hydration pattern** — differentiates create vs edit mode:
```ts
const hasExistingValue = value !== undefined && value !== null
const [hydrated, setHydrated] = useState(!hasExistingValue)
// hydrated = true in create mode → sync effect fires immediately
// hydrated = false in edit mode → wait for value to arrive, then parse once
```

| File | Purpose |
|------|---------|
| `index.tsx` | Root component; owns `FieldDef[]` state, syncs to Payload field via `setValue({ fields })` |
| `FieldRow.tsx` | Single field card: name (auto-slugified), type dropdown (18 types), label, required; always-visible `OptionsEditor`/`NestedFieldsEditor`/blocks config for matching types; four expandable sub-panels for advanced options |
| `OptionsEditor.tsx` | Editable `{label, value}` pairs for `select`/`multiselect` field types |
| `NestedFieldsEditor.tsx` | Recursive nested field list for `array`/`group` types; reuses `FieldRow`, max depth 3 |

**FieldDef (internal state):**
```ts
interface FieldDef {
  name: string; type: FieldType; label: string; required: boolean
  options?: { label: string; value: string }[]   // select, multiselect
  fields?: FieldDef[]                             // array, group (recursive)
  min?: number; max?: number                      // number
  minLength?: number; maxLength?: number          // text, textarea
  minRows?: number; maxRows?: number              // array
  collection?: string; hasMany?: boolean          // relationship
  allowedMimeTypes?: string                       // file
  timeFormat?: boolean                            // date
  allowedBlocks?: string[]                        // blocks
  minBlocks?: number; maxBlocks?: number          // blocks
  conditions?: ConditionRule[]
  conditionMode?: 'AND' | 'OR'
  validation?: ValidationRules
  ui?: UIMetadata
  admin?: { description?; placeholder?; readOnly?; hidden? }
}
```

Serialised output: `{ fields: FieldDef[] }` — matches `BlockSchema` exactly.

**FieldRow expandable panels (always collapsed by default):**

1. **Advanced options** — existing type-specific inputs (options, nested fields, number bounds, mime types, etc.)
2. **Validation Rules** — `regex`, `step`, `integerOnly`, `maxSelections`, `uniqueItems`, `maxFileSize`
3. **UI Layout** — `tab`, `section`, `width` (select), `order`, `collapsed` checkbox
4. **Conditional Visibility** — conditions list (field path + operator + value per rule), AND/OR mode toggle; `exists`/`empty` operators hide the value input

**Blocks field (type `'blocks'`):** When `type === 'blocks'` is selected, an always-visible panel appears for `allowedBlocks` slugs (comma-separated input) and `minBlocks`/`maxBlocks` numeric inputs, independent of the expandable advanced panel.

---

### BlockDataField
**Files:** `src/components/BlockDataField/`

Schema-driven dynamic form for the `data` field in each `pages` layout block instance. Replaces the raw JSON textarea so editors fill in typed inputs that match the pinned schema version.

Registered in `Pages.ts`:
```ts
admin: {
  components: { Field: '@/components/BlockDataField#BlockDataField' },
}
```

**How it works:**
1. Watches sibling `blockVersion` field via `useFormFields` — path derived as `path.replace(/\.data$/, '.blockVersion')`
2. Fetches schema from `/api/block-definition-versions/:id?depth=0` when `blockVersion` changes
3. Strips orphaned keys (keys in saved `data` not present in new schema) using `useRef` to avoid stale closures
4. Renders `SchemaForm` → `FieldInput` → type-specific inputs

| File | Purpose |
|------|---------|
| `index.tsx` | Root; watches blockVersion, fetches schema, cleans orphaned keys, calls `setValue` |
| `SchemaForm.tsx` | Iterates `schema.fields[]`; evaluates conditions per field; renders flat column or tabbed/grid layout |
| `FieldInput.tsx` | Switch on `field.type` → appropriate HTML input; handles all 18 field types |
| `ArrayFieldInput.tsx` | Repeatable row list with Add/Remove; each row rendered via `SchemaForm` recursively |
| `GroupFieldInput.tsx` | Nested object rendered via `SchemaForm` |
| `MediaPickerInput.tsx` | Full media upload + library picker (see below) |
| `BlocksFieldInput.tsx` | Nested block instance list with Add/Remove/Reorder; fetches schemas for allowed block slugs |

**SchemaForm layout logic:**

- If `hasUIMetadata(schema)` is `true`: renders a tabbed layout built from `buildFormLayout(schema)`. Each tab contains sections; each section renders fields in a `flex-wrap` grid where `widthToStyle(field.ui.width)` sets the inline width. The tab bar is hidden when there is only one tab; section headers are hidden for trivial single `'General'` sections.
- Otherwise: renders fields in a flat column (unchanged behavior for schemas without UI metadata).

In both layouts, `evaluateConditions(field.conditions, field.conditionMode, currentData)` is called before rendering each field. If it returns `false`, the field is skipped (not rendered). Its saved value is preserved in `data`; only orphaned keys absent from the schema are cleaned.

**BlocksFieldInput behavior:**

- On mount, batch-fetches schemas for all `allowedBlocks` slugs via `GET /api/block-definitions?where[slug][in][0]=slug1&where[slug][in][1]=slug2&depth=2`
- Stores schemas in `Record<string, BlockSchema | null>` where `null` = fetched but not found
- Each block instance renders as a collapsible card with a `SchemaForm` inside
- "Add Block" button opens a dropdown listing allowed slugs; selecting one appends a new `NestedBlockValue` with a generated `id`
- Supports collapse toggle, move up/down, and remove per block instance
- Dropdown closes on outside click via a `useEffect` click-outside handler

**Two-step upload flow in `MediaPickerInput`:**
1. User selects file → local preview via `URL.createObjectURL()` + inline alt text input shown
2. User enters alt text → clicks Upload → POST with `_payload: JSON.stringify({ alt })` (Payload 3.x multipart format)
3. Upload button disabled until alt text is non-empty
4. On success: stores media document ID as field value; shows thumbnail preview
5. "Choose from library" button: modal grid fetching `/api/media?limit=50`

---

## Admin Layout

**File:** `src/app/(payload)/layout.tsx`

```tsx
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'

const Layout = ({ children }) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)
```

Uses pre-built CSS (`@payloadcms/next/css`) — no Sass required.

---

## Seed Script

**File:** `src/scripts/seed.ts`

Run with `pnpm seed`. Loads `.env` via `import 'dotenv/config'` (tsx does not auto-load env files).

### What it does

1. **Registers 8 block definitions** — calls `saveSchemaLocally()` for every registered block. Schemas are imported directly from the component files so the seed stays in sync with the components. If a definition already exists, its name/description/category is updated and a new version is created; otherwise it is created fresh.

   | Slug | Category |
   |------|----------|
   | `hero-banner` | layout |
   | `rich-text` | content |
   | `card-grid` | content |
   | `features` | content |
   | `cta` | content |
   | `testimonials` | content |
   | `faq` | content |
   | `pricing` | content |

2. **Creates the home page demo** — after all definitions succeed, checks if a page with `slug: '/'` already exists:
   - **Exists with ≥ 4 blocks** → skips update (already seeded)
   - **Exists with < 4 blocks** → updates with the full 6-block demo (catches legacy 3-block seed)
   - **Doesn't exist** → creates it (`status: published`)

   The demo page uses preset data (`[preset][0].data`) for each block:

   | Order | Block | Preset |
   |-------|-------|--------|
   | 1 | Hero Banner | `heroBannerPresets[0]` — centered gradient hero |
   | 2 | Features | `featuresPresets[0]` — SaaS features, 3-column grid |
   | 3 | Testimonials | `testimonialsPresets[0]` — 6-card default grid |
   | 4 | Pricing | `pricingPresets[0]` — 3-tier SaaS pricing |
   | 5 | FAQ | `faqPresets[0]` — product FAQ, single column |
   | 6 | CTA | `ctaPresets[0]` — bottom-of-page CTA |

   Relationship fields (`blockDefinition`, `blockVersion`) require integer IDs for the Postgres adapter. The `definitionId` and `versionId` strings returned by `saveSchemaLocally()` are converted with `parseInt()` (via `toId()` helper) before being passed to `payload.create()`.

---

## Project File Structure

```
payload/
├── payload.config.ts
├── package.json
├── next.config.mjs
├── postcss.config.mjs
├── architecture.md
│
└── src/
    ├── app/
    │   ├── (frontend)/
    │   │   ├── [[...slug]]/page.tsx     # Catch-all page renderer
    │   │   ├── layout.tsx               # Async frontend layout — fetches globals, renders shell
    │   │   └── globals.css
    │   ├── (payload)/
    │   │   ├── admin/[[...segments]]/   # Payload admin UI
    │   │   ├── api/[...slug]/route.ts   # Payload API catch-all
    │   │   ├── api/graphql/route.ts     # Payload GraphQL route
    │   │   └── layout.tsx               # Admin root layout (RootLayout)
    │   └── api/
    │       ├── blocks/
    │       │   ├── save/route.ts        # POST /api/blocks/save
    │       │   └── preview/route.ts     # POST /api/blocks/preview
    │       ├── draft/route.ts           # GET  /api/draft   — enables Next.js Draft Mode
    │       └── exit-draft/route.ts      # GET  /api/exit-draft — disables Draft Mode
    │
    ├── collections/
    │   ├── BlockDefinitions.ts
    │   ├── BlockDefinitionVersions.ts
    │   ├── Pages.ts
    │   ├── Media.ts
    │   └── index.ts
    │
    ├── globals/
    │   ├── Header.ts                    # Navigation, logo, CTA button, sticky toggle
    │   ├── Footer.ts                    # Link columns, social links, copyright
    │   └── index.ts
    │
    ├── heros/
    │   ├── config.ts                    # Payload-native hero group field
    │   ├── RenderHero.tsx               # Selects hero renderer by type
    │   ├── HighImpact/index.tsx
    │   ├── MediumImpact/index.tsx
    │   └── LowImpact/index.tsx
    │
    ├── fields/
    │   ├── defaultLexical.ts            # Shared Lexical editor config
    │   ├── link.ts                      # Link group field
    │   └── linkGroup.ts                 # CTA links array field
    │
    ├── hooks/
    │   ├── populateBlockData.ts
    │   ├── populatePublishedAt.ts
    │   └── revalidateRedirects.ts
    │
    ├── validation/
    │   ├── types.ts                     # BlockSchema, field types, ConditionRule, ValidationRules, UIMetadata, BlocksField, NestedBlockValue
    │   ├── schemaValidator.ts           # validateBlockSchema()
    │   ├── dataValidator.ts             # validateBlockData(), mergeValidation()
    │   ├── evaluateConditions.ts        # evaluateConditions()
    │   └── index.ts
    │
    ├── builder/
    │   ├── normalizer.ts                # normaliseSchema()
    │   ├── saveSchema.ts                # saveSchemaLocally() & HTTP
    │   ├── buildFormLayout.ts           # buildFormLayout(), hasUIMetadata(), widthToStyle()
    │   └── index.ts
    │
    ├── renderer/
    │   ├── registry.ts                  # BlockRegistry singleton
    │   ├── DynamicRenderer.tsx          # DynamicRenderer + NestedBlocksRenderer
    │   ├── FieldRenderer.tsx            # Field-by-field rendering
    │   ├── FallbackRenderer.tsx         # Fallback for missing blocks
    │   ├── types.ts
    │   └── index.ts
    │
    ├── components/
    │   ├── LivePreviewListener.tsx      # 'use client' wrapper for RefreshRouteOnSave
    │   ├── layout/
    │   │   ├── Header.tsx               # SiteHeader — 'use client', desktop dropdown + mobile accordion
    │   │   └── Footer.tsx               # SiteFooter — server component, social icons
    │   ├── SchemaBuilderField/
    │   │   ├── index.tsx
    │   │   ├── FieldRow.tsx
    │   │   ├── OptionsEditor.tsx
    │   │   └── NestedFieldsEditor.tsx
    │   └── BlockDataField/
    │       ├── index.tsx
    │       ├── SchemaForm.tsx
    │       ├── FieldInput.tsx
    │       ├── ArrayFieldInput.tsx
    │       ├── GroupFieldInput.tsx
    │       ├── MediaPickerInput.tsx
    │       └── BlocksFieldInput.tsx
    │
    ├── scripts/
    │   └── seed.ts                      # Creates block definitions + home page
    │
    └── blocks/
        ├── types.ts                     # Shared BlockPreset interface
        ├── registry-setup.ts            # Central block registration (8 blocks)
        ├── RenderContentBlocks.tsx      # Renders Payload-native contentBlocks array
        ├── Generic/Testimonials/config.ts
        ├── HeroBanner/
        │   ├── index.tsx                # Two-column hero; 5 variants; DashboardMockup
        │   └── presets.ts               # heroBannerPresets[]
        ├── RichText/
        │   └── index.tsx                # Prose block with prose + alignment
        ├── CardGrid/
        │   └── index.tsx                # Feature card grid, 6-color accents, subheading
        ├── Features/
        │   ├── index.tsx                # Icon feature grid; 5 variants; 16 named SVG icons
        │   └── presets.ts               # featuresPresets[]
        ├── CTA/
        │   ├── index.tsx                # CTA section; 6 variants; centered/split layouts
        │   └── presets.ts               # ctaPresets[]
        ├── Testimonials/
        │   ├── index.tsx                # Testimonial grid; default/featured/dark variants
        │   └── presets.ts               # testimonialsPresets[]
        ├── FAQ/
        │   ├── index.tsx                # Accordion FAQ; 'use client'; single/two-column
        │   └── presets.ts               # faqPresets[]
        └── Pricing/
            ├── index.tsx                # Pricing cards; highlighted plan; 4 variants
            └── presets.ts               # pricingPresets[]
```

---

## Key Architectural Patterns

### 1. Write-Once Versioning
Block schemas are immutable version documents. Schema updates create a new version; pages pin to a specific version and never auto-upgrade. Old content renders unchanged even if the schema evolves or the block is deprecated.

### 2. Registry Pattern
`BlockRegistry` singleton maps block slugs to React components at runtime. No build-time code generation. If a component is missing, `FallbackRenderer` renders the data field-by-field — the page never crashes.

### 3. Validation Split
- **Schema validation** (strict): structure, types, constraints, conditions, validation rules, UI metadata
- **Data validation** (against schema): instance values at save/preview time, with `mergeValidation()` merging direct field props with `validation.*`
- **Normalization** (lenient): pre-processes raw input before strict validation

### 4. Depth-Based Relationship Fetching
Pages fetched with `depth: 3` populate `blockDefinition` + `blockVersion` in a single query — no N+1 queries at render time.

### 5. Custom Field Components (Admin UI)
Payload 3.x allows replacing any field's admin UI with a React component via `admin.components.Field`. Custom components use `useField` to read/write values and `useFormFields` to watch sibling fields. Components are registered in `importMap.js` (auto-generated) and referenced by string path in the collection config.

### 6. Transaction-Safe Hooks
`afterChange` hooks pass `req` to all `payload.update()` calls so they share the same DB transaction. This prevents FK violations when the version INSERT and definition UPDATE must be atomic.

### 7. Conditional Field Visibility
Fields with `conditions` are evaluated live in `SchemaForm` before rendering. Conditions read sibling field values via dot-notation paths. Hidden fields are not rendered but their saved values are preserved — only keys absent from the schema are cleaned. This separates display logic from persistence.

### 8. Progressive UI Enhancement
`SchemaForm` checks `hasUIMetadata(schema)` before rendering. Schemas without any layout-affecting `ui` metadata continue rendering in the original flat column layout with zero behavior change. Only schemas that deliberately set `ui.tab`, `ui.section`, `ui.width`, or `ui.order` activate the tabbed grid layout.

### 9. Live Preview via Next.js Draft Mode
The admin Live Preview embeds the frontend in an iframe. `livePreview.url` points to `/api/draft?slug=<slug>`, which authenticates the user, sets the Next.js Draft Mode bypass cookie, and redirects to the real page. The page detects `draftMode().isEnabled` and skips the `status: 'published'` filter so unpublished content is visible. `LivePreviewListener` (a `'use client'` component rendered only in draft mode) calls `router.refresh()` on every Payload `postMessage` save event, triggering a server re-render. Public visitors never load `LivePreviewListener` and always see only published content.

### 10. Nested/Composable Blocks
The `'blocks'` field type enables block composition. `BlocksFieldInput` fetches nested block schemas at runtime using Payload REST batch queries. `NestedBlocksRenderer` on the frontend renders nested blocks via the same registry as top-level blocks, with a configurable depth cap (default 3) to prevent infinite recursion.

### 11. Server-Side Global Fetch for Layout Shell
The frontend layout is an `async` server component that fetches both globals in a single `Promise.all` before rendering. Because Next.js deduplicates `fetch` calls within a render pass and Payload caches at the DB level, this adds negligible overhead. The layout falls back to empty objects so header/footer always render (empty) even if the DB is unreachable during cold-start.

### 13. Variant-Driven Styling
Each prebuilt block defines an internal `V` constant mapping variant names to Tailwind class sets:

```ts
const V = {
  default:  { outer: 'bg-white',       heading: 'text-gray-900', ... },
  dark:     { outer: 'bg-gray-950',    heading: 'text-white',    ... },
  gradient: { outer: 'bg-gradient-to-br from-indigo-50 to-violet-50', ... },
} satisfies Record<FeaturesVariant, Record<string, string>>

const v = V[variant] ?? V.default
```

The `satisfies` constraint catches missing keys at compile time without widening the type. All style decisions live in one place — the rendering JSX just references `v.outer`, `v.heading`, etc. with no conditionals scattered through markup.

### 14. Preset System
**File:** `src/blocks/types.ts`

```ts
export interface BlockPreset {
  id: string
  name: string
  description?: string
  data: Record<string, unknown>
}
```

Each block exports a `*Presets: BlockPreset[]` array from its `presets.ts` file with 3–5 realistic presets covering different variants. Presets serve two purposes:
1. **Seed data** — `seed.ts` imports `[preset][0].data` for the demo home page
2. **Admin quick-start** — presets can be surfaced in the page builder UI to let editors pick a starting point

Preset data is plain JSON that matches the block's schema exactly, so it passes `validateBlockData()` without modification.

### 12. Client/Server Component Boundary for Interactive Navigation
`SiteHeader` is `'use client'` for dropdown/accordion state. `SiteFooter` and the layout wrapper are server components. The layout passes pre-fetched global data as props — the client component never fetches its own data. An invisible `fixed inset-0` backdrop div closes open dropdowns on outside click without a `useEffect` global event listener, keeping the interaction model simple and memory-leak-free.

---

## Data Flow

### Creating a Block Definition

```
POST /api/blocks/save
  → normaliseSchema()
  → validateBlockSchema()
  → find/create BlockDefinition (by slug)
  → create BlockDefinitionVersion (v1)
  → afterChange: update BlockDefinition.currentVersion → v1
```

### Rendering a Page

```
GET /about-us
  → layout.tsx: getGlobals() → header + footer via payload.findGlobal()
  → getPage("about-us") with depth: 3
  → generateMetadata() from page.seo
  → <SiteHeader logo=... navigationItems=... ctaButton=... stickyHeader=... />
  → <RenderHero hero={page.hero} />
      → selects HighImpact / MediumImpact / LowImpact by hero.type
  → <DynamicRenderer layout={page.dbLayout} />
      → registry.get(blockDefinition.slug)
      → <HeroBannerBlock /> / <RichTextBlock /> / <CardGridBlock />
         <FeaturesBlock /> / <CTABlock /> / <TestimonialsBlock />
         <FAQBlock /> / <PricingBlock />
         or <FallbackRenderer /> if unregistered
      → if block contains a 'blocks' field:
         → <NestedBlocksRenderer blocks={data.children} />
  → <RenderContentBlocks blocks={page.contentBlocks} />
      → switch on block.blockType → <TestimonialsBlockView />
  → <SiteFooter columns=... socialLinks=... copyright=... />
```

### Schema Evolution (Backward-Compatible)

```
POST /api/blocks/save (updated schema)
  → creates BlockDefinitionVersion v2
  → BlockDefinition.currentVersion → v2

New pages → use v2 automatically
Old pages → still pinned to v1, render with original schema, no migration needed
```

### Live Preview

```
Editor clicks "Live Preview" in admin
  → livePreview.url builds: /api/draft?slug=about-us
  → iframe loads /api/draft?slug=about-us
      → payload.auth() — 401 if not logged in
      → draftMode().enable() — sets __prerender_bypass cookie
      → redirect(/about-us)
  → page.tsx runs with isDraftMode = true
      → getPage(slug, isDraft=true) — no status filter, returns any status
      → renders <LivePreviewListener serverURL="..." />
  → editor edits a field → Payload auto-saves
      → window.postMessage fired into iframe
      → LivePreviewListener calls router.refresh()
      → server re-renders page.tsx → updated content shown in iframe
```

### Admin Data Entry with Conditions

```
Editor opens page block instance
  → BlockDataField fetches schema for pinned blockVersion
  → SchemaForm checks hasUIMetadata(schema)
      → flat layout (no ui metadata) or tabbed grid layout
  → per field: evaluateConditions(field.conditions, mode, currentData)
      → false → field not rendered (value preserved in data)
      → true  → FieldInput rendered
  → onChange → setValue → Payload field value updated
```

---

## Environment Variables

```env
DATABASE_URI=postgresql://user:pass@localhost:5432/payload_dynamic_blocks
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_SECRET=your-secret-here
```

## Scripts

```bash
pnpm dev                 # Start Next dev server
pnpm build               # Production build
pnpm start               # Start production server
pnpm dev:prod            # Clean build and run production server locally
pnpm lint                # Next lint
pnpm lint:fix            # Next lint with fixes
pnpm payload             # Run Payload CLI
pnpm generate:importmap  # Regenerate Payload admin import map
pnpm generate:types      # Regenerate payload-types.ts
pnpm seed                # Seed block definitions + create home page (slug: /)
pnpm migrate:create      # Create DB migration
pnpm migrate:run         # Apply migrations
pnpm migrate:status      # Check migration status
```
