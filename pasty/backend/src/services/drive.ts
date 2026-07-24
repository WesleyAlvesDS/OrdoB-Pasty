/**
 * Upload a text file to Google Drive.
 * Returns file_id and url.
 */
export async function createGoogleDriveFile(
  accessToken: string,
  title: string,
  text: string,
): Promise<{ file_id: string; url: string }> {
  const boundary = '-------pasty'
  const metadata = JSON.stringify({
    name: `${title}.txt`,
    mimeType: 'text/plain',
  })
  const encoder = new TextEncoder()

  // Build multipart body manually
  const bodyParts = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Type: text/plain\r\n\r\n${text}\r\n`,
    `--${boundary}--\r\n`,
  ]

  const body = bodyParts.join('')

  const resp = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  )

  if (!resp.ok) {
    throw new Error(`Drive upload failed: ${await resp.text()}`)
  }

  const fileData = (await resp.json()) as { id: string }
  return {
    file_id: fileData.id,
    url: `https://drive.google.com/file/d/${fileData.id}/view`,
  }
}
