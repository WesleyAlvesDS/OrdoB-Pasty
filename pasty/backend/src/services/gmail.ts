const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me'

/** Build a base64url-encoded RFC 2822 email message. */
function buildDraftMessage(
  userEmail: string,
  subject: string,
  body: string,
): string {
  const message = [
    'From: me',
    `To: ${userEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n')

  // Base64url encode
  const bytes = new TextEncoder().encode(message)
  const binary = Array.from(bytes)
    .map((b) => String.fromCodePoint(b))
    .join('')
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Create a Gmail draft with the given subject and body.
 * Returns draft_id and message_id.
 */
export async function createGmailDraft(
  accessToken: string,
  userEmail: string,
  subject: string,
  body: string,
): Promise<{ draft_id: string; message_id: string }> {
  const encodedMessage = buildDraftMessage(userEmail, subject, body)

  const resp = await fetch(`${GMAIL_API}/drafts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: { raw: encodedMessage },
    }),
  })

  if (!resp.ok) {
    throw new Error(`Gmail draft failed: ${await resp.text()}`)
  }

  const draftData = (await resp.json()) as { id: string; message: { id: string } }
  return {
    draft_id: draftData.id,
    message_id: draftData.message.id,
  }
}
