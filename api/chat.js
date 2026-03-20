export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { documents, messages, ...rest } = req.body

    // Build the first user message with document content if documents exist
    let enrichedMessages = [...messages]

    if (documents && documents.length > 0) {
      const docContents = []

      for (const doc of documents) {
        try {
          const response = await fetch(doc.url)
          const contentType = response.headers.get('content-type') || ''
          const buffer = await response.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')

          if (contentType.includes('pdf')) {
            docContents.push({
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64
              },
              cache_control: { type: 'ephemeral' }
            })
          } else if (contentType.includes('image')) {
            const mediaType = contentType.includes('png') ? 'image/png'
              : contentType.includes('gif') ? 'image/gif'
              : contentType.includes('webp') ? 'image/webp'
              : 'image/jpeg'
            docContents.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64
              }
            })
          } else {
            // Text-based files (txt, csv, docx content, etc.)
            const text = Buffer.from(buffer).toString('utf-8')
            if (text && text.length > 0) {
              docContents.push({
                type: 'text',
                text: `--- Dokument: ${doc.name} ---\n${text.slice(0, 50000)}`
              })
            }
          }
        } catch (e) {
          docContents.push({
            type: 'text',
            text: `[Kunne ikke lese dokument: ${doc.name}]`
          })
        }
      }

      if (docContents.length > 0) {
        // Find first user message and prepend document content
        const firstUserIdx = enrichedMessages.findIndex(m => m.role === 'user')
        if (firstUserIdx !== -1) {
          const userContent = enrichedMessages[firstUserIdx].content
          enrichedMessages[firstUserIdx] = {
            role: 'user',
            content: [
              ...docContents,
              { type: 'text', text: typeof userContent === 'string' ? userContent : userContent.map(c => c.text).join('\n') }
            ]
          }
        }
      }
    }

    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        ...rest,
        messages: enrichedMessages
      })
    })

    const data = await apiResponse.json()

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to contact Claude API' })
  }
}
