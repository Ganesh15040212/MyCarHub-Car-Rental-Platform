import express from 'express';
import Feedback from '../models/Feedback.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Helper to send contact message email alert
const sendFeedbackEmail = async (feedbackData) => {
  const EMAIL_USER = process.env.EMAIL_USER?.trim() || '';
  const EMAIL_PASS = process.env.EMAIL_PASS?.trim() || '';
  const OWNER_EMAIL = process.env.OWNER_EMAIL?.trim() || '';

  if (!EMAIL_USER || !EMAIL_PASS) {
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
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"My Car Hub Portal" <${EMAIL_USER}>`,
      to: OWNER_EMAIL || 'info@mycarhub.com',
      subject: `✉️ New Contact Message from ${feedbackData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1e1e1; border-radius: 12px; padding: 24px; background-color: #fcfcfc;">
          <div style="text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #030213; margin: 0; font-size: 28px;">My Car Hub</h1>
            <p style="color: #0056b3; margin: 5px 0 0 0; font-weight: bold; font-size: 14px;">NEW CONTACT FORM SUBMISSION</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 30%; border-bottom: 1px solid #f0f0f0;"><strong>Sender Name:</strong></td>
                <td style="padding: 8px 0; color: #111; border-bottom: 1px solid #f0f0f0;">${feedbackData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #f0f0f0;"><strong>Email Address:</strong></td>
                <td style="padding: 8px 0; color: #111; border-bottom: 1px solid #f0f0f0;">
                  ${feedbackData.email ? `<a href="mailto:${feedbackData.email}" style="color: #0056b3; text-decoration: none;">${feedbackData.email}</a>` : 'Not provided'}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; border-bottom: 1px solid #f0f0f0;"><strong>Phone Number:</strong></td>
                <td style="padding: 8px 0; color: #111; border-bottom: 1px solid #f0f0f0;">
                  <a href="tel:${feedbackData.phone}" style="color: #0056b3; text-decoration: none;">${feedbackData.phone}</a>
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 20px; background-color: #f7f9fc; border: 1px dashed #d1d9e6; border-radius: 8px; padding: 15px;">
            <strong style="color: #030213; font-size: 14px; display: block; margin-bottom: 8px;">Message:</strong>
            <p style="color: #333; margin: 0; line-height: 1.6; white-space: pre-wrap;">${feedbackData.message}</p>
          </div>

          <div style="text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            This email was sent from the My Car Hub Platform Contact page form.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Quiet error handling
  }
};

// GET all feedbacks (Sorted latest first)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new feedback/contact entry
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const feedback = new Feedback({
      name,
      email: email || '',
      phone,
      message,
      status: 'Unread',
    });

    const createdFeedback = await feedback.save();

    // Trigger feedback email alert asynchronously
    sendFeedbackEmail(createdFeedback);

    res.status(201).json(createdFeedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) feedback status to Read
router.put('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (feedback) {
      feedback.status = req.body.status || feedback.status;
      const updatedFeedback = await feedback.save();
      res.json(updatedFeedback);
    } else {
      res.status(404).json({ message: 'Feedback record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE feedback
router.delete('/:id', async (req, res) => {
  try {
    const result = await Feedback.deleteOne({ _id: req.params.id });
    if (result.deletedCount > 0) {
      res.json({ message: 'Feedback removed successfully' });
    } else {
      res.status(404).json({ message: 'Feedback record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
