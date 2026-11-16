import nodemailer from 'nodemailer';

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (req.body && typeof req.body === 'string') {
    try { return Promise.resolve(JSON.parse(req.body)); } catch { return Promise.resolve({}); }
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, statusCode, data) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/gi, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&bull;/gi, '• ')
    .replace(/&copy;/gi, '©')
    .replace(/&rarr;/gi, '->')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed' });
  }

  const body = await parseBody(req);
  const { to, subject, html, text, from, reply_to } = body || {};

  if (!to || !subject || !html) {
    return sendJson(res, 400, {
      success: false,
      error: 'Missing required email fields (to, subject, html)'
    });
  }

  const plainText = text || htmlToPlainText(html);
  const recipients = Array.isArray(to) ? to : [to];

  // Priority 1: Gmail SMTP Dispatch
  const gmailUser = process.env.GMAIL_USER || 'crinoidsocial@gmail.com';
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

  if (gmailPass) {
    let transporter = null;
    try {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      });

      const mailOptions = {
        from: `Crinoid Social <${gmailUser}>`,
        to: recipients.join(', '),
        replyTo: `Crinoid Social <${gmailUser}>`,
        subject: subject,
        text: plainText,
        html: html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[Vercel Serverless - Gmail SMTP] Email dispatched:', info.messageId);

      if (transporter && typeof transporter.close === 'function') {
        transporter.close();
      }

      return sendJson(res, 200, {
        success: true,
        id: info.messageId,
        via: 'gmail'
      });
    } catch (gmailErr) {
      console.error('[Vercel Serverless - Gmail SMTP] Error:', gmailErr);
      if (transporter && typeof transporter.close === 'function') {
        try { transporter.close(); } catch {}
      }
      // Fallback to Resend below if Gmail fails
    }
  }

  // Priority 2: Resend API Dispatch
  const resendApiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY || '';

  if (resendApiKey) {
    try {
      const payload = {
        from: from || 'Crinoid Social <onboarding@resend.dev>',
        to: recipients,
        subject,
        text: plainText,
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
        return sendJson(res, 200, {
          success: false,
          error: resendData.message || 'Resend error: Failed to dispatch email'
        });
      }

      return sendJson(res, 200, {
        success: true,
        id: resendData.id,
        via: 'resend'
      });
    } catch (err) {
      console.error('[Vercel Serverless - Resend API] Exception:', err);
      return sendJson(res, 500, {
        success: false,
        error: err.message || 'Server error communicating with email dispatch service'
      });
    }
  }

  return sendJson(res, 500, {
    success: false,
    error: 'No email service configured. Please provide GMAIL_APP_PASSWORD or VITE_RESEND_API_KEY.'
  });
}
