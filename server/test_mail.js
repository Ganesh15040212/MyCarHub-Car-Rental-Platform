import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const EMAIL_USER = process.env.EMAIL_USER?.trim() || '';
const EMAIL_PASS = process.env.EMAIL_PASS?.trim() || '';

console.log('EMAIL_USER:', EMAIL_USER);
console.log('EMAIL_PASS length:', EMAIL_PASS.length);

async function testMail() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('EMAIL_USER or EMAIL_PASS missing');
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

    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Transporter connection verified successfully!');

    const mailOptions = {
      from: `"My Car Hub Test" <${EMAIL_USER}>`,
      to: 'guestguest615242004@gmail.com',
      subject: 'Test Email from My Car Hub',
      html: '<h3>Hello! If you see this, email sending works perfectly!</h3>',
    };

    console.log('Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully! Message ID:', info.messageId);
  } catch (error) {
    console.error('SMTP test failed:', error);
  }
}

testMail();
