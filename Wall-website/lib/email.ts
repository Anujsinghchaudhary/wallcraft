import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'WallCraft <noreply@wallcraft.com>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'WallCraft'

interface OrderEmailData {
  to: string
  orderNumber: string
  wallpaperTitle: string
  downloadToken: string
  expiresAt: Date
  price: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const downloadUrl = `${APP_URL}/api/download/${data.downloadToken}`
  const expiryDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(data.expiresAt)

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Your ${APP_NAME} Purchase - ${data.wallpaperTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #141414; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ✨ ${APP_NAME}
              </h1>
              <p style="margin: 10px 0 0; color: #888888; font-size: 14px;">
                Premium Live Wallpapers
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #ffffff; font-size: 24px; font-weight: 600;">
                Thank you for your purchase! 🎉
              </h2>
              
              <p style="margin: 0 0 30px; color: #aaaaaa; font-size: 16px; line-height: 1.6;">
                Your order has been confirmed and your live wallpaper is ready to download.
              </p>
              
              <!-- Order Details -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background-color: #1a1a1a; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Order Number
                    </p>
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                      ${data.orderNumber}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 20px 20px; border-top: 1px solid #2a2a2a;">
                    <p style="margin: 20px 0 8px; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Wallpaper
                    </p>
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                      ${data.wallpaperTitle}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 20px 20px; border-top: 1px solid #2a2a2a;">
                    <p style="margin: 20px 0 8px; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Amount Paid
                    </p>
                    <p style="margin: 0; color: #22c55e; font-size: 18px; font-weight: 700;">
                      ${data.price}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Download Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" 
                       style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #c99033 0%, #d9b270 100%); color: #000000; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 14px rgba(201, 144, 51, 0.4);">
                      Download Your Wallpaper
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Expiry Notice -->
              <p style="margin: 30px 0 0; color: #666666; font-size: 13px; text-align: center;">
                ⏰ This download link expires on:<br>
                <strong style="color: #aaaaaa;">${expiryDate}</strong>
              </p>
              
              <!-- Dashboard Link -->
              <p style="margin: 20px 0 0; color: #666666; font-size: 13px; text-align: center;">
                You can also download your purchases anytime from your 
                <a href="${APP_URL}/dashboard" style="color: #c99033;">dashboard</a>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 13px;">
                Need help? Contact us at support@wallcraft.com
              </p>
              <p style="margin: 0; color: #444444; font-size: 12px;">
                © ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send exception:', error)
    return { success: false, error }
  }
}

interface WelcomeEmailData {
  to: string
  name: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: `Welcome to ${APP_NAME}! 🎨`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #141414; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
              <h1 style="margin: 0 0 20px; color: #ffffff; font-size: 28px;">
                Welcome to ${APP_NAME}! ✨
              </h1>
              <p style="margin: 0; color: #aaaaaa; font-size: 16px; line-height: 1.6;">
                Hey ${data.name || 'there'},<br><br>
                Thanks for joining us! Discover premium live wallpapers designed specifically for iPhone.
              </p>
              <a href="${APP_URL}/wallpapers" 
                 style="display: inline-block; margin-top: 30px; padding: 14px 40px; background: linear-gradient(135deg, #c99033 0%, #d9b270 100%); color: #000000; text-decoration: none; font-weight: 600; border-radius: 10px;">
                Browse Wallpapers
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #0a0a0a; text-align: center;">
              <p style="margin: 0; color: #444444; font-size: 12px;">
                © ${new Date().getFullYear()} ${APP_NAME}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    })

    if (error) {
      console.error('Welcome email error:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Welcome email exception:', error)
    return { success: false, error }
  }
}
