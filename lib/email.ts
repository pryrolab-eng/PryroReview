// Uses Resend REST API directly via fetch to avoid @react-email/render
// bundling issues with Next.js 13 webpack

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not set — skipping email')
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[email] Resend error:', err)
    }
  } catch (err) {
    console.error('[email] Failed to send:', err)
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail(
    email,
    'Welcome to Pryro Review 🇷🇼',
    `<p>Hi ${name}, welcome to Rwanda's most trusted review platform. Browse companies and write your first verified review today.</p>`
  )
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyUrl: string
) {
  await sendEmail(
    email,
    'Verify your Pryro Review account',
    `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <h2 style="font-size: 24px; font-weight: 900; color: #18181b; margin: 0 0 8px;">
        Verify your email
      </h2>
      <p style="color: #71717a; font-size: 14px; margin: 0 0 24px;">
        Hi ${name}, click the button below to verify your email address and activate your Pryro Review account.
      </p>
      <a
        href="${verifyUrl}"
        style="display: inline-block; background: #18181b; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-size: 14px; font-weight: 600;"
      >
        Verify Email Address
      </a>
      <p style="color: #a1a1aa; font-size: 12px; margin: 24px 0 0;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
    `
  )
}

export async function sendClaimApprovedEmail(
  email: string,
  name: string,
  companyName: string
) {
  await sendEmail(
    email,
    'Your company claim has been approved ✓',
    `<p>Hi ${name}, your claim for <strong>${companyName}</strong> has been approved. You can now respond to reviews.</p>`
  )
}

export async function sendClaimRejectedEmail(
  email: string,
  name: string,
  companyName: string
) {
  await sendEmail(
    email,
    'Update on your company claim',
    `<p>Hi ${name}, your claim for <strong>${companyName}</strong> could not be approved. Contact us if you believe this is an error.</p>`
  )
}

export async function sendReviewDeletedEmail(
  email: string,
  name: string,
  companyName: string
) {
  await sendEmail(
    email,
    'Your review has been removed',
    `<p>Hi ${name}, your review for <strong>${companyName}</strong> was removed by our moderation team for violating our guidelines.</p>`
  )
}
