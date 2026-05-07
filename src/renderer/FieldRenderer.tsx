import React from 'react'
import type { FieldRendererProps } from './types'
import type { BlockSchema, BlockData } from '@/validation/types'

// ─── Individual field renderers ───────────────────────────────────────────────

function TextValue({ value }: { value: string }) {
  return <span className="field-text">{value}</span>
}

function TextareaValue({ value }: { value: string }) {
  return (
    <p className="field-textarea whitespace-pre-wrap">{value}</p>
  )
}

function NumberValue({ value }: { value: number }) {
  return <span className="field-number">{value}</span>
}

function CheckboxValue({ value }: { value: boolean }) {
  return (
    <span className="field-checkbox" aria-checked={value} role="checkbox">
      {value ? '✓' : '✗'}
    </span>
  )
}

function SelectValue({ value }: { value: string }) {
  return <span className="field-select">{value}</span>
}

function MultiSelectValue({ value }: { value: string[] }) {
  return (
    <ul className="field-multiselect list-disc list-inside">
      {value.map((v, i) => (
        <li key={i}>{v}</li>
      ))}
    </ul>
  )
}

function DateValue({ value }: { value: string }) {
  const formatted = new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return <time className="field-date" dateTime={value}>{formatted}</time>
}

function UrlValue({ value }: { value: string }) {
  return (
    <a className="field-url underline text-blue-600" href={value} target="_blank" rel="noreferrer">
      {value}
    </a>
  )
}

function EmailValue({ value }: { value: string }) {
  return (
    <a className="field-email underline text-blue-600" href={`mailto:${value}`}>
      {value}
    </a>
  )
}

function ImageValue({ value }: { value: Record<string, unknown> }) {
  const url =
    typeof value === 'string'
      ? value
      : (value as { url?: string })?.url

  const alt =
    typeof value === 'object' && value !== null
      ? String((value as { alt?: unknown }).alt ?? '')
      : ''

  if (!url) return null

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="field-image max-w-full h-auto" src={url} alt={alt} />
  )
}

function RichTextValue({ value }: { value: unknown }) {
  // Lexical serialised JSON — basic HTML passthrough for now.
  // Replace with @payloadcms/richtext-lexical JSX serialiser in production.
  if (typeof value === 'string') {
    return (
      <div
        className="field-richtext prose"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    )
  }
  // Serialised Lexical root node
  return (
    <div className="field-richtext prose">
      <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}

function ArrayValue({
  value,
  schema,
}: {
  value: BlockData[]
  schema?: BlockSchema
}) {
  return (
    <ul className="field-array space-y-2">
      {value.map((row, i) => (
        <li key={i} className="border rounded p-2">
          {schema?.fields ? (
            schema.fields.map((field) => (
              <FieldRenderer
                key={field.name}
                fieldType={field.type}
                value={row[field.name]}
                label={field.label ?? field.name}
              />
            ))
          ) : (
            <pre className="text-xs">{JSON.stringify(row, null, 2)}</pre>
          )}
        </li>
      ))}
    </ul>
  )
}

function GroupValue({
  value,
  schema,
}: {
  value: BlockData
  schema?: BlockSchema
}) {
  return (
    <div className="field-group space-y-1">
      {schema?.fields ? (
        schema.fields.map((field) => (
          <FieldRenderer
            key={field.name}
            fieldType={field.type}
            value={value[field.name]}
            label={field.label ?? field.name}
          />
        ))
      ) : (
        <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
      )}
    </div>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * FieldRenderer — renders a single field value based on its type.
 * Used by FallbackRenderer and simple block implementations.
 */
export function FieldRenderer({ value, fieldType, label, schema }: FieldRendererProps) {
  if (value === null || value === undefined || value === '') return null

  const content = (() => {
    switch (fieldType) {
      case 'text':
        return <TextValue value={String(value)} />
      case 'textarea':
        return <TextareaValue value={String(value)} />
      case 'richtext':
        return <RichTextValue value={value} />
      case 'number':
        return <NumberValue value={Number(value)} />
      case 'checkbox':
        return <CheckboxValue value={Boolean(value)} />
      case 'select':
        return <SelectValue value={String(value)} />
      case 'multiselect':
        return <MultiSelectValue value={value as string[]} />
      case 'date':
        return <DateValue value={String(value)} />
      case 'url':
        return <UrlValue value={String(value)} />
      case 'email':
        return <EmailValue value={String(value)} />
      case 'image':
        return (
          <ImageValue
            value={value as Record<string, unknown>}
          />
        )
      case 'array':
        return (
          <ArrayValue
            value={value as BlockData[]}
            schema={schema}
          />
        )
      case 'group':
        return (
          <GroupValue
            value={value as BlockData}
            schema={schema}
          />
        )
      case 'color':
        return (
          <span
            className="field-color inline-block w-5 h-5 rounded border"
            style={{ backgroundColor: String(value) }}
            title={String(value)}
          />
        )
      case 'json':
        return (
          <pre className="field-json text-xs bg-gray-50 rounded p-2 overflow-auto">
            {JSON.stringify(value, null, 2)}
          </pre>
        )
      default:
        return <span className="field-unknown">{String(value)}</span>
    }
  })()

  return (
    <div className={`field field-type-${fieldType} mb-1`}>
      {label && (
        <span className="field-label text-xs font-semibold text-gray-500 mr-1">{label}:</span>
      )}
      {content}
    </div>
  )
}
