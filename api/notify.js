export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to, fromName, taskName, comment } = req.body

  if (!to || !comment) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: { name: 'Tre musketerer', email: 'noreply@dh-todo-navy.vercel.app' },
        to: [{ email: to }],
        subject: `${fromName} nevnte deg i "${taskName}"`,
        htmlContent: `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #2C1F1A; font-size: 18px; margin-bottom: 16px;">Tre musketerer</h2>
            <p style="color: #1A1210; font-size: 14px; line-height: 1.6;">
              <strong>${fromName}</strong> nevnte deg i oppgaven <strong>"${taskName}"</strong>:
            </p>
            <div style="background: #FAF7F3; border-left: 3px solid #C8563A; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; color: #1A1210; line-height: 1.5;">
              ${comment}
            </div>
            <a href="https://dh-todo-navy.vercel.app" style="display: inline-block; background: #C8563A; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
              Åpne appen
            </a>
            <p style="color: #B8A090; font-size: 12px; margin-top: 24px; font-style: italic;">
              En for alle — alle for en
            </p>
          </div>
        `
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send notification' })
  }
}
