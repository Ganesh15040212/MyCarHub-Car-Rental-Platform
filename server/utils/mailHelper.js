import nodemailer from 'nodemailer';

/**
 * Universal email sender helper.
 * Uses SendGrid API via secure HTTPS if SENDGRID_API_KEY is defined in the environment.
 * Otherwise, falls back to local Nodemailer SMTP transport.
 * 
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {Array<{filename: string, content: Buffer|string}>} [options.attachments] - Optional email attachments
 */
export const sendMailHelper = async ({ to, subject, html, attachments = [] }) => {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY?.trim();
  const SENDGRID_FROM = process.env.SENDGRID_FROM?.trim() || 'guestguest615242004@gmail.com';
  const EMAIL_USER = process.env.EMAIL_USER?.trim() || '';
  const EMAIL_PASS = process.env.EMAIL_PASS?.trim() || '';

  // Standardize recipient email address array and deduplicate to prevent SendGrid API duplicate email errors
  // Automatically redirect dead placeholder 'info@mycarhub.com' and old email 'ganeshmanivnr2004@gmail.com' to verified owner email 'guestguest615242004@gmail.com'
  const recipients = Array.from(
    new Set(
      (Array.isArray(to) ? to : to.split(','))
        .map((email) => {
          const clean = email?.trim();
          if (clean === 'info@mycarhub.com' || clean === 'ganeshmanivnr2004@gmail.com') {
            return 'guestguest615242004@gmail.com';
          }
          return clean;
        })
        .filter(Boolean)
    )
  );

  if (recipients.length === 0) {
    console.warn('[Mail Helper] No recipients defined. Skipping email sending.');
    return;
  }

  // Driver 1: SendGrid HTTP API (Production / Live HTTPS)
  if (SENDGRID_API_KEY) {
    console.log(`[Mail Helper] SENDGRID_API_KEY found. Preparing to send email via SendGrid HTTPS API to: ${recipients.join(', ')}`);
    try {
      const fromName = process.env.SENDGRID_FROM_NAME?.trim() || 'My Car Hub Bookings';

      // Map attachments for SendGrid structure (Content must be base64-encoded string)
      const sendGridAttachments = attachments.map((att) => {
        let contentBase64 = '';
        if (Buffer.isBuffer(att.content)) {
          contentBase64 = att.content.toString('base64');
        } else if (typeof att.content === 'string') {
          contentBase64 = Buffer.from(att.content).toString('base64');
        } else if (att.content && typeof att.content === 'object') {
          contentBase64 = typeof att.content.toString === 'function' 
            ? (att.content instanceof Buffer ? att.content.toString('base64') : Buffer.from(att.content).toString('base64'))
            : '';
        }

        // Detect correct mime type
        let mimeType = 'application/octet-stream';
        if (att.filename.endsWith('.pdf')) {
          mimeType = 'application/pdf';
        } else if (att.filename.endsWith('.png')) {
          mimeType = 'image/png';
        } else if (att.filename.endsWith('.jpg') || att.filename.endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        }

        return {
          content: contentBase64,
          filename: att.filename,
          type: mimeType,
          disposition: 'attachment',
        };
      });

      const payload = {
        personalizations: recipients.map((email) => ({
          to: [{ email }],
        })),
        from: {
          email: SENDGRID_FROM,
          name: fromName,
        },
        subject,
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
        attachments: sendGridAttachments.length > 0 ? sendGridAttachments : undefined,
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // If SendGrid returns an error, retrieve the error details
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.errors) {
            errorMessage = errorData.errors.map(err => `${err.message} (${err.field || 'no field'})`).join(', ');
          } else if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          try {
            const rawText = await response.text();
            errorMessage = rawText || errorMessage;
          } catch (textErr) {
            // Quiet fallback
          }
        }
        throw new Error(errorMessage);
      }

      console.log(`[Mail Helper] SendGrid HTTPS API email sent successfully to: ${recipients.join(', ')}`);
      return { success: true };
    } catch (error) {
      console.error('[Mail Helper] Error sending email via SendGrid HTTPS API:', error);
      throw error;
    }
  }

  // Driver 2: Nodemailer SMTP (Local / Development fallback)
  console.log(`[Mail Helper] SENDGRID_API_KEY not found. Falling back to Nodemailer SMTP...`);
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
