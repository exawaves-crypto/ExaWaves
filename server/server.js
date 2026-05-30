import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify((err) => {
  if (err) {
    console.error('❌ Gmail SMTP connection failed:', err.message);
    console.log('   Make sure GMAIL_USER and GMAIL_APP_PASSWORD are set in .env');
  } else {
    console.log('✅ Gmail SMTP connected successfully');
  }
});

// Send certificate email endpoint
app.post('/api/send-certificate', async (req, res) => {
  try {
    const { to, studentName, certificateNumber, pdfBase64 } = req.body;

    if (!to || !studentName || !certificateNumber || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
      from: `"ExaWaves Technology" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Internship Certificate — ${certificateNumber} | ExaWaves Technology`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #922B62; margin: 0;">ExaWaves Technology</h2>
            <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Internship Certification</p>
          </div>

          <div style="background: #fdf2f8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
              Dear <strong style="color: #922B62;">${studentName}</strong>,
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 12px 0 0;">
              Congratulations on successfully completing your internship with <strong>ExaWaves Technology</strong>!
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 12px 0 0;">
              Your certificate is attached to this email as a PDF. You can also verify your certificate anytime using the QR code on it or by visiting our verification portal.
            </p>
          </div>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0; color: #6b7280; font-size: 13px;">Certificate Number</p>
            <p style="margin: 4px 0 0; color: #111827; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">${certificateNumber}</p>
          </div>

          <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
            We wish you the very best in your future endeavors. Keep building amazing things!
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © ${new Date().getFullYear()} ExaWaves Technology. All rights reserved.<br />
            For queries, contact <a href="mailto:exawaves@gmail.com" style="color: #922B62;">exawaves@gmail.com</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Certificate-${certificateNumber}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: `Certificate sent to ${to}` });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

// Send patent letter email endpoint
app.post('/api/send-patent', async (req, res) => {
  try {
    const { to, studentName, patentNumber, pdfBase64 } = req.body;

    if (!to || !studentName || !patentNumber || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
      from: `"ExaWaves Technology" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Patent Letter — ${patentNumber} | ExaWaves Technology`,
      html: `
        <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #faf7f2;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #6B4A0A; margin: 0; font-family: Georgia, serif;">ExaWaves Technology</h2>
            <p style="color: #8a7560; font-size: 13px; margin: 4px 0 0; font-style: italic;">Project Rights & Intellectual Property</p>
          </div>

          <div style="background: #f5f0e8; border: 1px solid #d4c5a9; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <p style="color: #3d2b1f; font-size: 15px; line-height: 1.7; margin: 0;">
              Dear <strong style="color: #6B4A0A;">${studentName}</strong>,
            </p>
            <p style="color: #3d2b1f; font-size: 15px; line-height: 1.7; margin: 12px 0 0;">
              We are pleased to inform you that your Patent Letter has been officially issued by ExaWaves Technology. This document grants you full ownership and intellectual property rights over the projects you completed during your internship.
            </p>
            <p style="color: #3d2b1f; font-size: 15px; line-height: 1.7; margin: 12px 0 0;">
              Your Patent Letter is attached to this email as a PDF. Please retain this document for your records.
            </p>
          </div>

          <div style="background: #f9f6f1; border: 1px solid #d4c5a9; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="margin: 0; color: #8a7560; font-size: 13px;">Patent Reference Number</p>
            <p style="margin: 4px 0 0; color: #2c1810; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">${patentNumber}</p>
          </div>

          <p style="color: #8a7560; font-size: 13px; line-height: 1.6; margin: 0;">
            We wish you the very best in your future endeavors. Your work is your own — build something great with it.
          </p>

          <hr style="border: none; border-top: 1px solid #d4c5a9; margin: 24px 0;" />

          <p style="color: #a09080; font-size: 12px; text-align: center; margin: 0;">
            &copy; ${new Date().getFullYear()} ExaWaves Technology. All rights reserved.<br />
            For queries, contact <a href="mailto:exawaves@gmail.com" style="color: #6B4A0A;">exawaves@gmail.com</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Patent-${patentNumber}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: `Patent letter sent to ${to}` });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

const PORT = process.env.MAIL_SERVER_PORT || 3001;

// Send recommendation letter email endpoint
app.post('/api/send-recommendation', async (req, res) => {
  try {
    const { to, employeeName, refNumber, pdfBase64 } = req.body;

    if (!to || !employeeName || !refNumber || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
      from: `"ExaWaves Technology" <${process.env.GMAIL_USER}>`,
      to,
      subject: `Letter of Recommendation — ${refNumber} | ExaWaves Technology`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff;">
          <div style="height: 6px; background: linear-gradient(90deg, #922B62, #C54B8C, #922B62);"></div>
          
          <div style="padding: 32px 28px;">
            <div style="text-align: center; margin-bottom: 28px;">
              <h2 style="color: #922B62; margin: 0; font-size: 22px;">ExaWaves Technology</h2>
              <p style="color: #9ca3af; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Letter of Recommendation</p>
            </div>

            <div style="background: linear-gradient(135deg, #fdf2f8, #fce7f3); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(197, 75, 140, 0.1);">
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0;">
                Dear <strong style="color: #922B62;">${employeeName}</strong>,
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 12px 0 0;">
                We are delighted to share your official <strong>Letter of Recommendation</strong> from ExaWaves Technology. This letter acknowledges your valuable contributions and professional excellence during your association with us.
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 12px 0 0;">
                Your recommendation letter is attached to this email as a PDF. Please retain this document for your professional records.
              </p>
            </div>

            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Reference Number</p>
              <p style="margin: 4px 0 0; color: #922B62; font-size: 16px; font-weight: 700; letter-spacing: 0.5px;">${refNumber}</p>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0;">
              We truly value the work you've done with us and wish you tremendous success in all your future endeavors. Keep excelling!
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              &copy; ${new Date().getFullYear()} ExaWaves Technology. All rights reserved.<br />
              For queries, contact <a href="mailto:exawaves@gmail.com" style="color: #922B62;">exawaves@gmail.com</a>
            </p>
          </div>

          <div style="height: 4px; background: linear-gradient(90deg, #922B62, #C54B8C, #922B62);"></div>
        </div>
      `,
      attachments: [
        {
          filename: `Recommendation-${refNumber}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: `Recommendation letter sent to ${to}` });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});
app.listen(PORT, () => {
  console.log(`📧 Mail server running on http://localhost:${PORT}`);
});
