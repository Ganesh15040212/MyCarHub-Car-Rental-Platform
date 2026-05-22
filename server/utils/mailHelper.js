import nodemailer from 'nodemailer';

/**
 * Universal email sender helper.
 * Uses Resend API via secure HTTPS if RESEND_API_KEY is defined in the environment.
 * Otherwise, falls back to local Nodemailer SMTP transport.
 * 
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {Array<{filename: string, content: Buffer|string}>} [options.attachments] - Optional email attachments
 */
export const sendMailHelper = async ({ to, subject, html, attachments = [] }) => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
  const EMAIL_USER = process.env.EMAIL_USER?.trim() || '';
  const EMAIL_PASS = process.env.EMAIL_PASS?.trim() || '';

  // Standardize recipient email address array
  const recipients = Array.isArray(to)
    ? to
    : to.split(',').map((email) => email.trim()).filter(Boolean);

  if (recipients.length === 0) {
    console.warn('[Mail Helper] No recipients defined. Skipping email sending.');
    return;
  }

  // Driver 1: Resend HTTP API (Production / Live HTTPS)
  if (RESEND_API_KEY) {
    console.log(`[Mail Helper] RESEND_API_KEY found. Preparing to send email via Resend HTTPS API to: ${recipients.join(', ')}`);
    try {
      const fromEmail = process.env.RESEND_FROM?.trim() || 'onboarding@resend.dev';
      const fromName = process.env.RESEND_FROM_NAME?.trim() || 'My Car Hub';

      // Map attachments for Resend API structure (Content must be base64-encoded string)
      const resendAttachments = attachments.map((att) => {
        let contentBase64 = '';
        if (Buffer.isBuffer(att.content)) {
          contentBase64 = att.content.toString('base64');
        } else if (typeof att.content === 'string') {
          contentBase64 = Buffer.from(att.content).toString('base64');
        } else if (att.content && typeof att.content === 'object') {
          // Fallback if content has toString/toString('base64')
          contentBase64 = typeof att.content.toString === 'function' 
            ? (att.content instanceof Buffer ? att.content.toString('base64') : Buffer.from(att.content).toString('base64'))
            : '';
        }
        return {
          filename: att.filename,
          content: contentBase64,
        };
      });

      const payload = {
        from: `"${fromName}" <${fromEmail}>`,
        to: recipients,
        subject,
        html,
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
      }

      console.log(`[Mail Helper] Resend HTTPS API email sent successfully! ID: ${responseData.id}`);
      return responseData;
    } catch (error) {
      console.error('[Mail Helper] Error sending email via Resend HTTPS API:', error);
      throw error;
    }
  }

  // Driver 2: Nodemailer SMTP (Local / Development fallback)
  console.log(`[Mail Helper] RESEND_API_KEY not found. Falling back to Nodemailer SMTP...`);
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('[Mail Helper] Nodemailer SMTP fallback skipped: EMAIL_USER or EMAIL_PASS is missing in environment variables.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"My Car Hub Bookings" <${EMAIL_USER}>`,
      to: recipients.join(', '),
      subject,
      html,
      attachments: attachments.map((att) => ({
        filename: att.filename,
        content: att.content,
      })),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail Helper] Nodemailer SMTP email sent successfully! MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Mail Helper] Error sending email via Nodemailer SMTP:', error);
    throw error;
  }
};
