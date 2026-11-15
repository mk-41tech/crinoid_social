import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { to, subject, html, from, reply_to } = req.body || {};

  if (!to || !subject || !html) {
    return res.status(400).json({
      success: false,
      error: 'Missing required email fields (to, subject, html)'
    });
  }

  const recipients = Array.isArray(to) ? to : [to];

  // Priority 1: Gmail SMTP Dispatch
  const gmailUser = process.env.GMAIL_USER || 'crinoidsocial@gmail.com';
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      const mailOptions = {
        from: `Crinoid Social <${gmailUser}>`,
        to: recipients.join(', '),
        replyTo: reply_to || gmailUser,
        subject: subject,
        html: html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[Vercel Serverless - Gmail SMTP] Email dispatched:', info.messageId);

      return res.status(200).json({
        success: true,
        id: info.messageId,
        via: 'gmail'
      });
    } catch (gmailErr) {
      console.error('[Vercel Serverless - Gmail SMTP] Error:', gmailErr);
      // Fallback to Resend if Gmail dispatch fails
    }
  }

  // Priority 2: Resend API Dispatch
  const resendApiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY || '';

  try {
    const payload = {
      from: from || 'Crinoid Social <onboarding@resend.dev>',
      to: recipients,
      subject,
      html
    };
    if (reply_to) {
      payload.reply_to = reply_to;
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.warn('[Vercel Serverless - Resend API] Error:', resendData);
      return res.status(200).json({
        success: false,
        error: resendData.message || 'Resend error: Failed to dispatch email'
      });
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      via: 'resend'
    });
  } catch (err) {
    console.error('[Vercel Serverless - Resend API] Exception:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error communicating with email dispatch service'
    });
  }
}

