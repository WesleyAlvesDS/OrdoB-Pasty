# 🔌 Skill: Integração com Google APIs

> Padrões de integração com Google Docs, Drive e Gmail aprendidos no Pasty.

---

## Google Docs API

### Fluxo em 2 passos
```typescript
export async function createGoogleDoc(token: string, title: string, text: string) {
  // Passo 1: Cria documento vazio
  const createResp = await fetch(`${DOCS_API}/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ title }),
  })
  const { documentId } = await createResp.json()

  // Passo 2: Insere texto via batchUpdate
  await fetch(`${DOCS_API}/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      requests: [{
        insertText: {
          location: { index: 1 },  // ← Posição inicial do documento
          text,
        },
      }],
    }),
  })

  return { document_id: documentId, url: `https://docs.google.com/document/d/${documentId}` }
}
```

## Google Drive API

### Upload Multipart
```typescript
export async function createGoogleDriveFile(token: string, title: string, text: string) {
  // Multipart manual (mais leve que biblioteca Google)
  const boundary = '-------pasty'
  const metadata = JSON.stringify({ name: `${title}.txt`, mimeType: 'text/plain' })

  const body = [
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: text/plain\r\n\r\n${text}\r\n`,
    `--${boundary}--\r\n`,
  ].join('')

  const resp = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    }
  )

  const { id } = await resp.json()
  return { file_id: id, url: `https://drive.google.com/file/d/${id}/view` }
}
```

## Gmail API

### Draft com Base64URL
```typescript
export async function createGmailDraft(token: string, email: string, subject: string, body: string) {
  // Constrói mensagem RFC 2822
  const message = [
    'From: me',
    `To: ${email}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n')

  // Base64 URL-safe
  const encoded = btoa(new TextEncoder().encode(message)
    .reduce((acc, b) => acc + String.fromCodePoint(b), ''))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const resp = await fetch(`${GMAIL_API}/drafts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: { raw: encoded } }),
  })

  const { id, message: { id: msgId } } = await resp.json()
  return { draft_id: id, message_id: msgId }
}
```

## Lições Aprendidas
- Google Docs precisa de 2 chamadas (create + batchUpdate)
- Drive upload multipart pode ser feito sem biblioteca Google
- Gmail exige base64url (RFC 4648 §5), não base64 comum
- Escopos OAuth necessários: docs, drive.file, gmail.compose
- Sempre tratar erros 401 (token expirado) e 429 (rate limit)
