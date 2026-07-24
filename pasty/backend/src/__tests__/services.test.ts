import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ─── Helpers ──────────────────────────────────────────────────

function mockFetch(response: {
  ok: boolean
  json?: unknown
  text?: string
  status?: number
}) {
  return vi.mocked(global.fetch).mockResolvedValueOnce({
    ok: response.ok,
    status: response.status ?? 200,
    json: async () => response.json,
    text: async () => response.text ?? '',
  } as Response)
}

// ─── Tests ────────────────────────────────────────────────────

describe('Google Services', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation(async () => {
      return { ok: true, json: async () => ({}) } as Response
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createGoogleDoc', () => {
    it('creates a document and inserts text', async () => {
      // Step 1: Create document
      mockFetch({
        ok: true,
        json: { documentId: 'doc-123' },
      })
      // Step 2: Insert text
      mockFetch({ ok: true, json: {} })

      const { createGoogleDoc } = await import('../services/docs.js')
      const result = await createGoogleDoc('token', 'My Doc', 'Hello World')

      expect(result.document_id).toBe('doc-123')
      expect(result.url).toBe('https://docs.google.com/document/d/doc-123')
    })

    it('throws when document creation fails', async () => {
      mockFetch({ ok: false, text: 'Forbidden', status: 403 })

      const { createGoogleDoc } = await import('../services/docs.js')
      await expect(
        createGoogleDoc('bad-token', 'My Doc', 'Hello'),
      ).rejects.toThrow('Docs create failed: Forbidden')
    })

    it('throws when text insertion fails', async () => {
      mockFetch({ ok: true, json: { documentId: 'doc-123' } })
      mockFetch({ ok: false, text: 'Rate limited', status: 429 })

      const { createGoogleDoc } = await import('../services/docs.js')
      await expect(
        createGoogleDoc('token', 'My Doc', 'Hello'),
      ).rejects.toThrow('Docs insert failed: Rate limited')
    })
  })

  describe('createGoogleDriveFile', () => {
    it('uploads a text file to Drive', async () => {
      mockFetch({
        ok: true,
        json: { id: 'file-123' },
      })

      const { createGoogleDriveFile } = await import('../services/drive.js')
      const result = await createGoogleDriveFile('token', 'My Note', 'Text content')

      expect(result.file_id).toBe('file-123')
      expect(result.url).toBe('https://drive.google.com/file/d/file-123/view')
    })

    it('throws when upload fails', async () => {
      mockFetch({ ok: false, text: 'Quota exceeded', status: 403 })

      const { createGoogleDriveFile } = await import('../services/drive.js')
      await expect(
        createGoogleDriveFile('token', 'Note', 'content'),
      ).rejects.toThrow('Drive upload failed: Quota exceeded')
    })
  })

  describe('createGmailDraft', () => {
    it('creates a Gmail draft', async () => {
      mockFetch({
        ok: true,
        json: { id: 'draft-123', message: { id: 'msg-456' } },
      })

      const { createGmailDraft } = await import('../services/gmail.js')
      const result = await createGmailDraft(
        'token',
        'user@example.com',
        'Subject',
        'Body text',
      )

      expect(result.draft_id).toBe('draft-123')
      expect(result.message_id).toBe('msg-456')
    })

    it('throws when draft creation fails', async () => {
      mockFetch({ ok: false, text: 'Auth error', status: 401 })

      const { createGmailDraft } = await import('../services/gmail.js')
      await expect(
        createGmailDraft('token', 'user@example.com', 'Sub', 'Body'),
      ).rejects.toThrow('Gmail draft failed: Auth error')
    })
  })
})
