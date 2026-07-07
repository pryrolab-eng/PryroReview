import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendResetPasswordEmail(email: string, resetUrl: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[mail] EMAIL_USER or EMAIL_PASS not set in environment variables')
    throw new Error('Email credentials not configured')
  }

  console.log(`[mail] Sending reset email to ${email}`)

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
        <tr><td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background:#2563eb;padding:24px 32px;">
                <span style="color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">pryro</span>
                <span style="color:#bfdbfe;font-size:14px;font-weight:600;margin-left:4px;">Review</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#18181b;">Reset Your Password</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#71717a;line-height:1.6;">
                  We received a request to reset your PryroReview account password. Click the button below to set a new password.
                </p>
                <a href="${resetUrl}"
                  style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:9999px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
                  Reset Password
                </a>
                <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">
                  This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e4e4e7;">
                <p style="margin:0;font-size:12px;color:#a1a1aa;">
                  If you didn't request this, ignore this email. &copy; ${new Date().getFullYear()} PryroReview
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"PryroReview" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your PryroReview password',
      html,
    })
    console.log(`[mail] Email sent: ${info.messageId}`)
  } catch (err) {
    console.error('[mail] Failed to send email:', err)
    throw err
  }
}
