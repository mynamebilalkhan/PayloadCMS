# Architecture: Payload Dynamic Blocks CMS

## Overview

A Payload CMS 3.76 + Next.js 15 App Router project implementing a **runtime dynamic block system** — similar to Gutenberg, but with block schemas stored in the database rather than hardcoded TypeScript. Pages compose layouts from block instances pinned to specific schema versions, enabling safe schema evolution without breaking existing content.

**Stack:**
- Backend: Payload CMS 3.76 with PostgreSQL adapter
- Frontend: Next.js 15 (App Router)
- Database: PostgreSQL (via `postgresAdapter`)
- Package Manager: pnpm (ESM module, Node 18.20+ or 20.9+)
- Runtime: React 19.2.1, TypeScript 5.7.3, Tailwind CSS 4.x

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

### 3. `pages` — Dynamic Page Layouts
**File:** `src/collections/Pages.ts`

Page metadata plus a dynamic `layout` array of block instances.

**Meta fields:** `title`, `slug` (auto-normalized), `status` (`draft` / `published` / `archived`)

**SEO group:** `metaTitle`, `metaDescription`, `ogImage` (upload), `noIndex`

**Layout array (block instances):**

| Field | Type | Notes |
|-------|------|-------|
| `blockDefinition` | relationship → block-definitions | Which block type |
| `blockVersion` | relationship → block-definition-versions | Pinned version (locked after first save) |
| `instanceId` | text (read-only) | Stable unique ID |
| `label` | text | Optional editor label |
| `data` | json | Field values conforming to pinned schema |
| `hidden` | checkbox | Hide on frontend without deleting |
| `anchor` | text | HTML anchor ID for deep-linking |

**Key design:** Pages pin to a specific `blockVersion` per instance — schema updates never break existing content.

---

### 4. `media` — Image & File Uploads
**File:** `src/collections/Media.ts`

Image resizing via Sharp. Image sizes: `thumbnail` (400×300), `card` (768×1024), `tablet` (1024×auto).

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

Validates block instance data and returns schema for admin preview. Requires Payload session auth.

```ts
// Request
{ blockSlug, versionId, data: Record<string, unknown> }

// Response
{ valid: true, schema: BlockSchema, data: Record<string, unknown> }
```

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
- Passes layout to `<DynamicRenderer />`
- `generateStaticParams()` pre-renders all published pages

---

## Payload Configuration

**File:** `payload.config.ts`

```ts
buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  collections: [BlockDefinitions, BlockDefinitionVersions, Pages, Media, Users],
  editor: lexicalEditor({}),
  db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } }),
  sharp,
  secret: process.env.PAYLOAD_SECRET,
})
```

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
├── next.config.js
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
  → <DynamicRenderer layout={...} />
      → registry.get(blockDefinition.slug)
      → <HeroBannerBlock data={...} schema={...} />
         or <FallbackRenderer /> if unregistered
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

## Environment Variables

```env
DATABASE_URI=postgresql://user:pass@localhost:5432/payload_dynamic_blocks
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_SECRET=your-secret-here
```

## Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm seed             # Seed initial block definitions
pnpm migrate:create   # Create DB migration
pnpm migrate:run      # Apply migrations
```
