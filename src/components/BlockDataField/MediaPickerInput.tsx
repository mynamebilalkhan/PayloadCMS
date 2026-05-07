'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MediaDoc {
  id: string | number
  url?: string
  filename?: string
  alt?: string
  width?: number
  height?: number
  thumbnailURL?: string
  sizes?: Record<string, { url?: string }>
}

type Props = {
  value: string | number | null | undefined
  onChange: (id: string | number | null) => void
  readOnly?: boolean
  fieldType?: 'image' | 'file'
}

function resolveUrl(doc: MediaDoc): string | undefined {
  return doc.sizes?.thumbnail?.url ?? doc.thumbnailURL ?? doc.url
}

/** Pending upload: file chosen but not yet submitted */
interface PendingUpload {
  file: File
  localPreview: string // object URL for preview
  alt: string
}

export function MediaPickerInput({ value, onChange, readOnly, fieldType = 'image' }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<MediaDoc | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [library, setLibrary] = useState<MediaDoc[]>([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingUpload | null>(null)

  // Fetch preview when a saved value exists
  useEffect(() => {
    if (!value) { setPreview(null); return }
    setLoading(true)
    fetch(`/api/media/${value}?depth=0`)
      .then((r) => r.ok ? r.json() : null)
      .then((doc) => setPreview(doc ?? null))
      .catch(() => setPreview(null))
      .finally(() => setLoading(false))
  }, [value])

  // Clean up object URL when pending changes
  useEffect(() => {
    return () => {
      if (pending?.localPreview) URL.revokeObjectURL(pending.localPreview)
    }
  }, [pending])

  // Fetch media library when modal opens
  useEffect(() => {
    if (!showLibrary) return
    setLibraryLoading(true)
    fetch('/api/media?limit=50&depth=0')
      .then((r) => r.ok ? r.json() : { docs: [] })
      .then((res) => setLibrary(res.docs ?? []))
      .catch(() => setLibrary([]))
      .finally(() => setLibraryLoading(false))
  }, [showLibrary])

  // Step 1 — file chosen: show alt text prompt before uploading
  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so same file can be re-selected later
    if (fileInputRef.current) fileInputRef.current.value = ''

    const localPreview = URL.createObjectURL(file)
    const defaultAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    setPending({ file, localPreview, alt: defaultAlt })
    setError(null)
  }

  // Step 2 — user confirms alt + uploads
  async function handleUploadConfirm() {
    if (!pending) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', pending.file)
    // Payload 3.x: extra collection fields must be in _payload JSON
    formData.append('_payload', JSON.stringify({ alt: pending.alt || pending.file.name }))

    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) {
        const msg =
          json?.errors?.[0]?.message ??
          json?.message ??
          `Upload failed (${res.status})`
        throw new Error(msg)
      }
      const doc: MediaDoc = json.doc
      setPreview(doc)
      onChange(doc.id)
      setPending(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setUploading(false)
    }
  }

  function cancelPending() {
    setPending(null)
    setError(null)
  }

  function selectFromLibrary(doc: MediaDoc) {
    setPreview(doc)
    onChange(doc.id)
    setShowLibrary(false)
  }

  function clear() {
    setPreview(null)
    onChange(null)
    setPending(null)
  }

  const previewUrl = preview ? resolveUrl(preview) : undefined
  const isImage = fieldType === 'image'

  return (
    <div>
      {/* ── Step 1 pending: alt text prompt ─────────────── */}
      {pending && (
        <div
          style={{
            border: '1px solid var(--theme-elevation-300, #d1d5db)',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            marginBottom: '0.5rem',
            background: 'var(--theme-elevation-50, #f9fafb)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            {/* Local preview */}
            {isImage && (
              <img
                src={pending.localPreview}
                alt="preview"
                style={{
                  width: '5rem',
                  height: '5rem',
                  objectFit: 'cover',
                  borderRadius: '0.25rem',
                  flexShrink: 0,
                  border: '1px solid var(--theme-elevation-200, #e5e7eb)',
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--theme-text, #111827)',
                  marginBottom: '0.375rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {pending.file.name}
              </p>

              {/* Alt text input */}
              <label
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--theme-elevation-500, #6b7280)',
                  display: 'block',
                  marginBottom: '0.25rem',
                }}
              >
                Alt Text <span style={{ color: 'var(--theme-error-500, #ef4444)' }}>*</span>
              </label>
              <input
                type="text"
                value={pending.alt}
                placeholder="Describe the image for accessibility…"
                autoFocus
                onChange={(e) => setPending({ ...pending, alt: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleUploadConfirm() }
                  if (e.key === 'Escape') cancelPending()
                }}
                style={{
                  width: '100%',
                  padding: '0.375rem 0.5rem',
                  border: '1px solid var(--theme-elevation-300, #d1d5db)',
                  borderRadius: '0.25rem',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: 'var(--theme-elevation-0, #fff)',
                  color: 'var(--theme-text, #111827)',
                }}
              />

              {/* Confirm / cancel */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleUploadConfirm}
                  disabled={uploading || !pending.alt.trim()}
                  style={{
                    padding: '0.35rem 0.875rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#fff',
                    background: uploading || !pending.alt.trim()
                      ? 'var(--theme-elevation-300, #d1d5db)'
                      : 'var(--theme-success-500, #10b981)',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: uploading || !pending.alt.trim() ? 'default' : 'pointer',
                  }}
                >
                  {uploading ? 'Uploading…' : '↑ Upload'}
                </button>
                <button
                  type="button"
                  onClick={cancelPending}
                  disabled={uploading}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8125rem',
                    color: 'var(--theme-elevation-600, #4b5563)',
                    background: 'transparent',
                    border: '1px solid var(--theme-elevation-300, #d1d5db)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Saved selection preview ──────────────────────── */}
      {!pending && value && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
            border: '1px solid var(--theme-elevation-200, #d1d5db)',
            borderRadius: '0.375rem',
            background: 'var(--theme-elevation-50, #f9fafb)',
            marginBottom: '0.5rem',
          }}
        >
          {isImage && previewUrl && (
            <img
              src={previewUrl}
              alt={preview?.alt ?? ''}
              style={{
                width: '4rem',
                height: '4rem',
                objectFit: 'cover',
                borderRadius: '0.25rem',
                flexShrink: 0,
                border: '1px solid var(--theme-elevation-150, #e5e7eb)',
              }}
            />
          )}
          {isImage && !previewUrl && (
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '0.25rem',
                background: 'var(--theme-elevation-150, #e5e7eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
            >
              {loading ? '…' : '🖼'}
            </div>
          )}
          {!isImage && (
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.25rem',
                background: 'var(--theme-elevation-150, #e5e7eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                flexShrink: 0,
              }}
            >
              📄
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'var(--theme-text, #111827)',
              }}
            >
              {preview?.alt || preview?.filename || String(value)}
            </p>
            {preview?.width && preview?.height && (
              <p style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-400, #9ca3af)', margin: 0 }}>
                {preview.width} × {preview.height}px
              </p>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-400, #9ca3af)', margin: 0, fontFamily: 'monospace' }}>
              ID: {value}
            </p>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={clear}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                color: 'var(--theme-error-500, #ef4444)',
                background: 'transparent',
                border: '1px solid var(--theme-error-300, #fca5a5)',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              ✕ Remove
            </button>
          )}
        </div>
      )}

      {/* ── Action buttons (only when no pending upload) ── */}
      {!readOnly && !pending && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.4rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--theme-text, #111827)',
              background: 'var(--theme-elevation-0, #fff)',
              border: '1px solid var(--theme-elevation-300, #d1d5db)',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            {value ? '↑ Replace' : '↑ Upload'}
          </button>

          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            style={{
              padding: '0.4rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--theme-text, #111827)',
              background: 'var(--theme-elevation-0, #fff)',
              border: '1px solid var(--theme-elevation-300, #d1d5db)',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Choose from library
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={isImage ? 'image/*' : '*/*'}
            style={{ display: 'none' }}
            onChange={handleFileChosen}
          />
        </div>
      )}

      {error && (
        <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--theme-error-500, #ef4444)' }}>
          {error}
        </p>
      )}

      {/* ── Library modal ─────────────────────────────────── */}
      {showLibrary && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowLibrary(false)}
        >
          <div
            style={{
              background: 'var(--theme-bg, #1a1a2e)',
              borderRadius: '0.5rem',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                borderBottom: '1px solid var(--theme-elevation-200, #333)',
                flexShrink: 0,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--theme-text, #fff)' }}>
                Media Library
              </span>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--theme-elevation-500, #6b7280)', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {libraryLoading && (
                <p style={{ textAlign: 'center', color: 'var(--theme-elevation-400, #9ca3af)', fontSize: '0.875rem' }}>
                  Loading media…
                </p>
              )}
              {!libraryLoading && library.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--theme-elevation-400, #9ca3af)', fontSize: '0.875rem' }}>
                  No media found. Upload an image first.
                </p>
              )}
              {!libraryLoading && library.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {library.map((doc) => {
                    const thumb = resolveUrl(doc)
                    const isSelected = String(doc.id) === String(value)
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => selectFromLibrary(doc)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem',
                          border: isSelected ? '2px solid var(--theme-success-500, #10b981)' : '2px solid transparent',
                          borderRadius: '0.375rem',
                          background: isSelected ? 'var(--theme-success-50, rgba(16,185,129,0.1))' : 'var(--theme-elevation-100, #2a2a3e)',
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={doc.alt ?? doc.filename ?? ''}
                            style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '0.25rem' }}
                          />
                        ) : (
                          <div style={{ width: '100%', aspectRatio: '1', background: 'var(--theme-elevation-200, #444)', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                            📄
                          </div>
                        )}
                        <span style={{ fontSize: '0.7rem', color: 'var(--theme-elevation-500, #9ca3af)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                          {doc.alt || doc.filename || String(doc.id)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
