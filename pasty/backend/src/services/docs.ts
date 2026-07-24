const DOCS_API = 'https://docs.googleapis.com/v1'

/**
 * Create a new Google Doc with the given title and text content.
 * Returns document_id and url.
 */
export async function createGoogleDoc(
  accessToken: string,
  title: string,
  text: string,
): Promise<{ document_id: string; url: string }> {
  // Step 1: Create empty document
  const createResp = await fetch(`${DOCS_API}/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  })
  if (!createResp.ok) {
    throw new Error(`Docs create failed: ${await createResp.text()}`)
  }
  const docData = (await createResp.json()) as { documentId: string }
  const documentId = docData.documentId

  // Step 2: Insert text content
  const insertResp = await fetch(
    `${DOCS_API}/documents/${documentId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text,
            },
          },
        ],
      }),
    },
  )
  if (!insertResp.ok) {
    throw new Error(`Docs insert failed: ${await insertResp.text()}`)
  }

  return {
    document_id: documentId,
    url: `https://docs.google.com/document/d/${documentId}`,
  }
}
