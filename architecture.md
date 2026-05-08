# Architecture: PayloadCMS App

## Overview

A Payload CMS 3.76 + Next.js 15 App Router project for managing site pages with a dynamic block architecture. The codebase currently has two page-authoring paths:

- A **runtime versioned block system** where block schemas live in the database. Pages store block instances that pin to immutable schema versions, so schema changes do not break existing content.
- A newer **Payload-native page authoring path** in `Pages.ts` that adds a `hero` group and a Payload `blocks` field for configured blocks such as `Testimonials`.

The runtime block path is the one currently rendered by the frontend route. The Payload-native hero/static block fields are configured in the CMS but are not yet wired into `src/app/(frontend)/[[...slug]]/page.tsx`.

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

**Payload-native fields also present on each page (all three now rendered):**

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

## Type System

**File:** `src/validation/types.ts`

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

interface BaseField {
  name: string
  type: FieldType
  label?: string
  required?: boolean
  admin?: { description?; readOnly?; hidden?; placeholder?; condition? }
}
```

Type-specific interfaces extend `BaseField` with their own constraints (e.g., `SelectField` adds `options`, `ArrayField` adds nested `fields` + `minRows`/`maxRows`).

---

## Validation Layer

### Schema Validation
**File:** `src/validation/schemaValidator.ts`

`validateBlockSchema(schema: unknown): ValidationResult`

- Checks `fields` array is non-empty
- Validates field names (alphanumeric + underscore, starts with letter), types, and labels
- Type-specific rules: select options, number min/max, nested field recursion, duplicate name detection
- Returns `{ valid, errors, warnings }`

### Data Validation
**File:** `src/validation/dataValidator.ts`

`validateBlockData(schema: BlockSchema, data: BlockData): DataValidationResult`

- Validates instance data against its schema (required fields, type coercion, nested array/group recursion)
- Returns `{ valid, errors: [{ path, message }] }`

---

## Builder & Schema Persistence

### Normalizer
**File:** `src/builder/normalizer.ts`

`normaliseSchema(raw: RawSchemaInput): BlockSchema`

Leniently pre-processes raw input before strict validation:
- Coerces unknown field types → `'text'`
- Normalizes option shorthand strings → `{ label, value }` objects
- Recursively handles nested fields

### Schema Save
**File:** `src/builder/saveSchema.ts`

**`saveSchemaLocally(payload, request)`** — Server-side (hooks, route handlers):
1. Normalizes via `normaliseSchema()`
2. Validates via `validateBlockSchema()`
3. Finds or creates `BlockDefinition` by slug
4. Creates immutable `BlockDefinitionVersion`
5. Returns `{ success, definitionId, versionId, versionNumber, errors, warnings }`

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

### DynamicRenderer
**File:** `src/renderer/DynamicRenderer.tsx`

`DynamicRenderer({ layout, customFallback })`

Iterates over a page's layout array:
1. Looks up component in registry by `blockDefinition.slug`
2. Renders component with `data` and `schema` props
3. Falls back to `FallbackRenderer` for unregistered slugs
4. Skips `hidden` blocks; applies `anchor` as HTML `id`

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

- Fetches page with `depth: 3` (populates nested relationships)
- Filters by `status: 'published'`
- Generates metadata from `page.seo.metaTitle`, `page.seo.metaDescription`, and `page.seo.noIndex`
- Renders all three content areas in order: `<RenderHero hero={page.hero} />`, `<DynamicRenderer layout={page.dbLayout} />`, `<RenderContentBlocks blocks={page.contentBlocks} />`
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
  },
  collections: [BlockDefinitions, BlockDefinitionVersions, Pages, Media, Users],
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
| `FieldRow.tsx` | Single field card: name (auto-slugified), type dropdown (17 types), label, required; always-visible `OptionsEditor`/`NestedFieldsEditor` for matching types; advanced options behind toggle |
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
  admin?: { description?; placeholder?; readOnly?; hidden? }
}
```

Serialised output: `{ fields: FieldDef[] }` — matches `BlockSchema` exactly.

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
| `SchemaForm.tsx` | Iterates `schema.fields[]`, renders `FieldInput` per field |
| `FieldInput.tsx` | Switch on `field.type` → appropriate HTML input; imports `MediaPickerInput` for `image`/`file` |
| `ArrayFieldInput.tsx` | Repeatable row list with Add/Remove; each row rendered via `SchemaForm` recursively |
| `GroupFieldInput.tsx` | Nested object rendered via `SchemaForm` |
| `MediaPickerInput.tsx` | Full media upload + library picker (see below) |

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
    │   │   ├── layout.tsx               # Frontend root layout
    │   │   └── globals.css
    │   ├── (payload)/
    │   │   ├── admin/[[...segments]]/   # Payload admin UI
    │   │   ├── api/[...slug]/route.ts   # Payload API catch-all
    │   │   ├── api/graphql/route.ts     # Payload GraphQL route
    │   │   └── layout.tsx               # Admin root layout (RootLayout)
    │   └── api/
    │       └── blocks/
    │           ├── save/route.ts        # POST /api/blocks/save
    │           └── preview/route.ts     # POST /api/blocks/preview
    │
    ├── collections/
    │   ├── BlockDefinitions.ts
    │   ├── BlockDefinitionVersions.ts
    │   ├── Pages.ts
    │   ├── Media.ts
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
    ├── utilities/
    │   ├── deepMerge.ts
    │   ├── generateMeta.ts
    │   ├── getDocument.ts
    │   ├── getGlobals.ts
    │   ├── getMediaUrl.ts
    │   ├── getRedirects.ts
    │   └── ...
    │
    ├── validation/
    │   ├── types.ts                     # BlockSchema & field types
    │   ├── schemaValidator.ts           # validateBlockSchema()
    │   ├── dataValidator.ts             # validateBlockData()
    │   └── index.ts
    │
    ├── builder/
    │   ├── normalizer.ts                # normaliseSchema()
    │   ├── saveSchema.ts                # saveSchemaLocally() & HTTP
    │   └── index.ts
    │
    ├── renderer/
    │   ├── registry.ts                  # BlockRegistry singleton
    │   ├── DynamicRenderer.tsx          # Main page renderer
    │   ├── FieldRenderer.tsx            # Field-by-field rendering
    │   ├── FallbackRenderer.tsx         # Fallback for missing blocks
    │   ├── types.ts
    │   └── index.ts
    │
    ├── components/
    │   ├── SchemaBuilderField/
    │   │   ├── index.tsx                # Root schema builder component
    │   │   ├── FieldRow.tsx             # Single field editor card
    │   │   ├── OptionsEditor.tsx        # select/multiselect options list
    │   │   └── NestedFieldsEditor.tsx   # Recursive nested fields (array/group)
    │   └── BlockDataField/
    │       ├── index.tsx                # Root data form component
    │       ├── SchemaForm.tsx           # Renders schema.fields[]
    │       ├── FieldInput.tsx           # Switch on field.type
    │       ├── ArrayFieldInput.tsx      # Repeatable row editor
    │       ├── GroupFieldInput.tsx      # Nested object editor
    │       └── MediaPickerInput.tsx     # Upload + library picker for image/file
    │
    └── blocks/
        ├── HeroBanner/index.tsx
        ├── RichText/index.tsx
        ├── CardGrid/index.tsx
        ├── Generic/Testimonials/config.ts
        ├── RenderContentBlocks.tsx      # Renders Payload-native contentBlocks array
        └── registry-setup.ts           # Central block registration
```

---

## Key Architectural Patterns

### 1. Write-Once Versioning
Block schemas are immutable version documents. Schema updates create a new version; pages pin to a specific version and never auto-upgrade. Old content renders unchanged even if the schema evolves or the block is deprecated.

### 2. Registry Pattern
`BlockRegistry` singleton maps block slugs to React components at runtime. No build-time code generation. If a component is missing, `FallbackRenderer` renders the data field-by-field — the page never crashes.

### 3. Validation Split
- **Schema validation** (strict): structure, types, constraints
- **Data validation** (against schema): instance values at save/preview time
- **Normalization** (lenient): pre-processes raw input before strict validation

### 4. Depth-Based Relationship Fetching
Pages fetched with `depth: 3` populate `blockDefinition` + `blockVersion` in a single query — no N+1 queries at render time.

### 5. Custom Field Components (Admin UI)
Payload 3.x allows replacing any field's admin UI with a React component via `admin.components.Field`. Custom components use `useField` to read/write values and `useFormFields` to watch sibling fields. Components are registered in `importMap.js` (auto-generated) and referenced by string path in the collection config.

### 6. Transaction-Safe Hooks
`afterChange` hooks pass `req` to all `payload.update()` calls so they share the same DB transaction. This prevents FK violations when the version INSERT and definition UPDATE must be atomic.

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
  → getPage("about-us") with depth: 3
  → generateMetadata() from page.seo
  → <RenderHero hero={page.hero} />
      → selects HighImpact / MediumImpact / LowImpact by hero.type
  → <DynamicRenderer layout={page.dbLayout} />
      → registry.get(blockDefinition.slug)
      → <HeroBannerBlock data={...} schema={...} />
         or <FallbackRenderer /> if unregistered
  → <RenderContentBlocks blocks={page.contentBlocks} />
      → switch on block.blockType → <TestimonialsBlockView />
```

### Schema Evolution (Backward-Compatible)

```
POST /api/blocks/save (updated schema)
  → creates BlockDefinitionVersion v2
  → BlockDefinition.currentVersion → v2

New pages → use v2 automatically
Old pages → still pinned to v1, render with original schema, no migration needed
```

---

## Current Integration Notes

- `src/app/(frontend)/[[...slug]]/page.tsx` renders all three content areas per page: hero (Payload-native), `dbLayout` (runtime versioned blocks via `DynamicRenderer`), and `contentBlocks` (Payload-native via `RenderContentBlocks`).
- `src/blocks/registry-setup.ts` contains temporary debug `fetch()` instrumentation around registry initialization. The actual registered runtime components are `hero-banner`, `rich-text`, and `card-grid`.
- Some hero renderers import app-shell components/providers such as `@/components/Link`, `@/components/Media`, `@/components/RichText`, and `@/providers/HeaderTheme`. Those supporting files are not present in the project tree and may require follow-up integration work before the hero path builds cleanly.
- `src/hooks/populateBlockData.ts` references `@/blocks/Homepage/populateRatings`, which does not exist and is not currently attached to `Pages.ts`.

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
pnpm seed                # Seed initial block definitions
pnpm migrate:create      # Create DB migration
pnpm migrate:run         # Apply migrations
pnpm migrate:status      # Check migration status
```
