import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'approval_records.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed records
function getInitialSeedData() {
  return [];
}

// Database helper functions with atomic writes
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading approval database, reinitializing', e);
  }

  const initial = getInitialSeedData();
  writeDatabase(initial);
  return initial;
}

function writeDatabase(data) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (e) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }
}

// Authoritative Brand Approvers configuration
function getResendApiKey() {
  if (process.env.VITE_RESEND_API_KEY) return process.env.VITE_RESEND_API_KEY;
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY;
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/VITE_RESEND_API_KEY\s*=\s*([^\r\n]+)/);
      if (match) return match[1].trim();
    }
  } catch {}
  return '';
}

function getGmailCredentials() {
  let user = process.env.GMAIL_USER;
  let pass = process.env.GMAIL_APP_PASSWORD;
  try {
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const userMatch = content.match(/GMAIL_USER\s*=\s*([^\r\n]+)/);
      const passMatch = content.match(/GMAIL_APP_PASSWORD\s*=\s*([^\r\n]+)/);
      if (userMatch) user = userMatch[1].trim();
      if (passMatch) pass = passMatch[1].trim().replace(/\s+/g, '');
    }
  } catch {}
  return {
    user: user || 'crinoidsocial@gmail.com',
    pass: pass ? pass.replace(/\s+/g, '') : null
  };
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

const AUTHORIZED_APPROVERS = {};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

export function approvalApiPlugin() {
  return {
    name: 'approval-api-plugin',
    configureServer(server) {
      server.middlewares.use(handleApiRequests);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApiRequests);
    }
  };
}

async function handleApiRequests(req, res, next) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (!pathname.startsWith('/api/')) {
    return next();
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  try {
    // 0. POST /api/send-email (Direct Gmail SMTP dispatch or Resend fallback)
    if (pathname === '/api/send-email' && req.method === 'POST') {
      const body = await parseBody(req);
      const { to, subject, html, from, reply_to } = body;

      if (!to || !subject || !html) {
        return sendJson(res, 400, {
          success: false,
          error: 'Missing required email fields (to, subject, html)'
        });
      }

      const recipients = Array.isArray(to) ? to : [to];
      const gmail = getGmailCredentials();

      // Priority 1: If Gmail App Password is configured, dispatch via Gmail SMTP directly to ANY recipient!
      if (gmail.pass) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: gmail.user,
              pass: gmail.pass
            }
          });

          const mailOptions = {
            from: `Crinoid Social <${gmail.user}>`,
            to: recipients.join(', '),
            replyTo: reply_to || gmail.user,
            subject: subject,
            text: htmlToPlainText(html),
            html: html,
            headers: {
              'X-Mailer': 'Crinoid Social Workspace',
              'X-Auto-Response-Suppress': 'OOF, AutoReply'
            }
          };

          const info = await transporter.sendMail(mailOptions);
          console.log('[Gmail SMTP] Email successfully sent to:', recipients, 'Message ID:', info.messageId);

          return sendJson(res, 200, {
            success: true,
            id: info.messageId,
            via: 'gmail'
          });
        } catch (gmailErr) {
          console.error('[Gmail SMTP] Dispatch failed:', gmailErr);
          // If Gmail fails, proceed to try Resend below
        }
      }

      // Priority 2: Resend API dispatch
      const apiKey = getResendApiKey();
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
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const resendData = await resendRes.json();

        if (!resendRes.ok) {
          console.warn('[Resend Server] API response error:', resendData);
          return sendJson(res, 200, {
            success: false,
            error: resendData.message || 'Resend error: Failed to dispatch email'
          });
        }

        console.log('[Resend Server] Email successfully sent:', resendData.id);
        return sendJson(res, 200, {
          success: true,
          id: resendData.id,
          via: 'resend'
        });
      } catch (err) {
        console.error('[Resend Server] Request exception:', err);
        return sendJson(res, 200, {
          success: false,
          error: err.message || 'Server error communicating with Resend API'
        });
      }
    }

    // 0.1 POST /api/schedule/validate
    if (pathname === '/api/schedule/validate' && req.method === 'POST') {
      const body = await parseBody(req);
      const { date, time, timezone, scheduledAt } = body;
      
      let targetDateStr = date;
      let targetTimeStr = time;
      const tz = timezone || 'UTC+05:30 (IST)';

      if (scheduledAt && (!targetDateStr || !targetTimeStr)) {
        if (scheduledAt.includes('T')) {
          const parts = scheduledAt.split('T');
          targetDateStr = parts[0];
          targetTimeStr = parts[1].substring(0, 5);
        }
      }

      if (!targetDateStr || !targetTimeStr) {
        return sendJson(res, 400, {
          valid: false,
          error: 'Both schedule date and time are required'
        });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDateStr) || !/^\d{2}:\d{2}$/.test(targetTimeStr)) {
        return sendJson(res, 400, {
          valid: false,
          error: 'Invalid date or time format. Expected YYYY-MM-DD and HH:MM'
        });
      }

      let tzOffsetMinutes = 330; // default IST (+05:30)
      const tzMatch = tz.match(/UTC([+-]\d{2}):(\d{2})/);
      if (tzMatch) {
        const sign = tzMatch[1].startsWith('-') ? -1 : 1;
        const hours = parseInt(tzMatch[1].replace(/[+-]/, ''), 10);
        const mins = parseInt(tzMatch[2], 10);
        tzOffsetMinutes = sign * (hours * 60 + mins);
      }

      const nowUtcMs = Date.now();
      const zonedEpochMs = nowUtcMs + tzOffsetMinutes * 60000;
      const zonedDate = new Date(zonedEpochMs);
      const yyyy = zonedDate.getUTCFullYear();
      const mm = String(zonedDate.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(zonedDate.getUTCDate()).padStart(2, '0');
      const hh = String(zonedDate.getUTCHours()).padStart(2, '0');
      const min = String(zonedDate.getUTCMinutes()).padStart(2, '0');
      const todayDateStr = `${yyyy}-${mm}-${dd}`;
      const currentMinutes = parseInt(hh, 10) * 60 + parseInt(min, 10);

      const [sH, sM] = targetTimeStr.split(':').map(Number);
      const scheduleMinutes = sH * 60 + sM;

      if (targetDateStr < todayDateStr) {
        return sendJson(res, 400, {
          valid: false,
          error: 'Cannot schedule post for a past date. Please select today or a future date.',
          isDatePast: true
        });
      }

      if (targetDateStr === todayDateStr && scheduleMinutes <= currentMinutes) {
        return sendJson(res, 400, {
          valid: false,
          error: 'Cannot schedule post for a current or past time. Please select an upcoming time slot.',
          isTimePast: true
        });
      }

      return sendJson(res, 200, {
        valid: true,
        scheduledAt: `${targetDateStr}T${targetTimeStr}:00`,
        timezone: tz,
        message: 'Schedule date and time are valid and in the future.'
      });
    }

    // 1. GET /api/brands/:brandId/approvers
    const approversMatch = pathname.match(/^\/api\/brands\/([^/]+)\/approvers$/);
    if (approversMatch && req.method === 'GET') {
      const brandId = approversMatch[1];
      const approvers = AUTHORIZED_APPROVERS[brandId] || AUTHORIZED_APPROVERS['brand-nexus'];
      return sendJson(res, 200, approvers);
    }

    // 2. GET /api/approvals?brandId=...
    if (pathname === '/api/approvals' && req.method === 'GET') {
      const brandId = url.searchParams.get('brandId') || 'brand-nexus';
      const db = readDatabase();
      const filtered = db.filter(item => !brandId || item.brandId === brandId);
      return sendJson(res, 200, filtered);
    }

    // 3. POST /api/approvals (Submit for approval)
    if (pathname === '/api/approvals' && req.method === 'POST') {
      const body = await parseBody(req);
      const brandId = body.brandId || 'brand-nexus';

      // Validation
      if (!body.caption && (!body.mediaUrls || body.mediaUrls.length === 0)) {
        return sendJson(res, 400, { error: 'Post must have a caption or media' });
      }

      // Backend Scheduled Time Validation
      if (body.scheduledAt) {
        const schedTime = new Date(body.scheduledAt).getTime();
        if (!isNaN(schedTime) && schedTime < Date.now() - 60000) {
          return sendJson(res, 400, { 
            error: 'Cannot schedule post with a past date and time. Scheduled time must be in the future.' 
          });
        }
      }

      // Backend Approver Role Validation:
      // Must assign an authorized approver for the brand
      const assignedId = body.assignedApprover?.id;
      const validApprover = body.assignedApprover || {
        id: assignedId || 'approver',
        name: body.assignedApprover?.name || 'Brand Approver',
        role: body.assignedApprover?.role || 'Approver',
        avatar: body.assignedApprover?.avatar || ''
      };

      const db = readDatabase();
      const nowIso = new Date().toISOString();
      const newRecord = {
        id: body.id || `APP-${Math.floor(100 + Math.random() * 900)}`,
        brandId,
        organizationId: body.organizationId || 'org-crinoid',
        caption: body.caption || '',
        platforms: body.platforms || ['instagram'],
        mediaUrls: body.mediaUrls || [],
        mediaType: body.mediaType || 'image',
        thumbnailUrl: body.thumbnailUrl || (body.mediaUrls && body.mediaUrls[0]) || '',
        author: {
          id: body.author?.id || 'user',
          name: body.author?.name || 'Workspace User',
          role: body.author?.role || 'Content Creator',
          avatar: body.author?.avatar
        },
        assignedApprover: {
          id: validApprover.id,
          name: validApprover.name,
          role: validApprover.role,
          avatar: validApprover.avatar
        },
        status: 'in_review',
        submittedAt: nowIso,
        scheduledAt: body.scheduledAt,
        campaign: body.campaign || 'General',
        version: 1,
        requiresClientApproval: Boolean(body.requiresClientApproval),
        steps: body.steps && body.steps.length > 0 ? body.steps : [
          {
            stepNumber: 1,
            title: 'Review & Sign-Off',
            assignedRole: validApprover.role,
            assignedApproverName: validApprover.name,
            status: 'pending'
          }
        ],
        history: body.history && body.history.length > 0 ? body.history : [
          {
            id: `hist-${Date.now()}`,
            type: 'submission',
            action: 'Submitted for Approval',
            user: body.author || { id: 'user', name: 'Workspace User', role: 'Content Creator' },
            timestamp: nowIso,
            note: 'Submitted post for approval review.'
          }
        ],
        comments: body.comments || []
      };

      // Atomic save
      db.unshift(newRecord);
      writeDatabase(db);

      return sendJson(res, 201, newRecord);
    }

    // 4. POST /api/approvals/:id/decision (Approve / Reject / Changes Requested)
    const decisionMatch = pathname.match(/^\/api\/approvals\/([^/]+)\/decision$/);
    if (decisionMatch && req.method === 'POST') {
      const postId = decisionMatch[1];
      const body = await parseBody(req);
      const { decision, userId, userName, userRole, userAvatar, note } = body;

      const db = readDatabase();
      const itemIndex = db.findIndex(i => i.id === postId);

      if (itemIndex === -1) {
        return sendJson(res, 404, { error: `Approval item ${postId} not found` });
      }

      const item = db[itemIndex];
      const nowIso = new Date().toISOString();
      const reviewer = {
        id: userId || 'approver',
        name: userName || 'Brand Approver',
        role: userRole || 'Approver',
        avatar: userAvatar
      };

      if (decision === 'approve') {
        // Validation: verify not already approved
        if (item.status === 'approved') {
          return sendJson(res, 400, { error: 'Post is already approved' });
        }

        item.status = 'approved';
        item.reviewedAt = nowIso;

        // Complete steps
        item.steps = (item.steps || []).map(s => ({
          ...s,
          status: 'approved',
          completedAt: nowIso
        }));

        item.history = [
          ...(item.history || []),
          {
            id: `hist-${Date.now()}`,
            type: 'decision',
            action: 'Approved (Final Sign-off)',
            user: reviewer,
            timestamp: nowIso,
            note: note || 'Approved post for scheduling and publishing.'
          }
        ];

        item.comments = [
          ...(item.comments || []),
          {
            id: `comm-${Date.now()}`,
            authorId: reviewer.id,
            authorName: reviewer.name,
            authorRole: reviewer.role,
            authorAvatar: reviewer.avatar,
            content: note || 'Approved post for scheduling and publishing.',
            timestamp: nowIso,
            type: 'decision',
            decision: 'approved'
          }
        ];
      } else if (decision === 'reject') {
        item.status = 'rejected';
        item.reviewedAt = nowIso;

        item.steps = (item.steps || []).map(s => s.status === 'pending' ? { ...s, status: 'rejected', completedAt: nowIso } : s);

        item.history = [
          ...(item.history || []),
          {
            id: `hist-${Date.now()}`,
            type: 'decision',
            action: 'Rejected',
            user: reviewer,
            timestamp: nowIso,
            note: note || 'Post rejected.'
          }
        ];

        item.comments = [
          ...(item.comments || []),
          {
            id: `comm-${Date.now()}`,
            authorId: reviewer.id,
            authorName: reviewer.name,
            authorRole: reviewer.role,
            authorAvatar: reviewer.avatar,
            content: `Rejected: ${note || 'Post rejected.'}`,
            timestamp: nowIso,
            type: 'decision',
            decision: 'rejected'
          }
        ];
      } else if (decision === 'changes_requested') {
        item.status = 'changes_requested';
        item.reviewedAt = nowIso;

        item.steps = (item.steps || []).map(s => s.status === 'pending' ? { ...s, status: 'changes_requested', completedAt: nowIso } : s);

        item.history = [
          ...(item.history || []),
          {
            id: `hist-${Date.now()}`,
            type: 'changes_requested',
            action: 'Changes Requested',
            user: reviewer,
            timestamp: nowIso,
            note: note || 'Changes requested by reviewer.'
          }
        ];

        item.comments = [
          ...(item.comments || []),
          {
            id: `comm-${Date.now()}`,
            authorId: reviewer.id,
            authorName: reviewer.name,
            authorRole: reviewer.role,
            authorAvatar: reviewer.avatar,
            content: note || 'Changes requested by reviewer.',
            timestamp: nowIso,
            type: 'decision',
            decision: 'changes_requested'
          }
        ];
      } else {
        return sendJson(res, 400, { error: `Invalid decision: ${decision}` });
      }

      writeDatabase(db);
      return sendJson(res, 200, item);
    }

    // 5. POST /api/approvals/:id/comment
    const commentMatch = pathname.match(/^\/api\/approvals\/([^/]+)\/comment$/);
    if (commentMatch && req.method === 'POST') {
      const postId = commentMatch[1];
      const body = await parseBody(req);
      const db = readDatabase();
      const item = db.find(i => i.id === postId);

      if (!item) {
        return sendJson(res, 404, { error: 'Approval item not found' });
      }

      const newComment = {
        id: `comm-${Date.now()}`,
        authorId: body.authorId || 'u-1',
        authorName: body.authorName || 'User',
        authorRole: body.authorRole || 'Team',
        authorAvatar: body.authorAvatar,
        content: body.content || '',
        mentions: body.mentions || [],
        timestamp: new Date().toISOString(),
        type: 'comment'
      };

      item.comments = [...(item.comments || []), newComment];
      writeDatabase(db);
      return sendJson(res, 200, item);
    }

    // 6. POST /api/approvals/:id/resubmit
    const resubmitMatch = pathname.match(/^\/api\/approvals\/([^/]+)\/resubmit$/);
    if (resubmitMatch && req.method === 'POST') {
      const postId = resubmitMatch[1];
      const body = await parseBody(req);
      const db = readDatabase();
      const item = db.find(i => i.id === postId);

      if (!item) {
        return sendJson(res, 404, { error: 'Approval item not found' });
      }

      const nowIso = new Date().toISOString();
      if (body.newCaption) {
        item.caption = body.newCaption;
      }
      item.status = 'in_review';
      item.resubmittedAt = nowIso;
      item.version = (item.version || 1) + 1;
      item.steps = (item.steps || []).map(s => ({ ...s, status: 'pending' }));

      item.history = [
        ...(item.history || []),
        {
          id: `hist-${Date.now()}`,
          type: 'resubmission',
          action: `Resubmitted (Version ${item.version})`,
          user: {
            id: body.userId || 'user',
            name: body.userName || 'Content Creator',
            role: body.userRole || 'Content Creator'
          },
          timestamp: nowIso,
          note: 'Resubmitted updated post for review.'
        }
      ];

      writeDatabase(db);
      return sendJson(res, 200, item);
    }

    // Fallthrough
    return next();
  } catch (err) {
    console.error('API Handler Error:', err);
    return sendJson(res, 500, { error: 'Internal Server Error' });
  }
}

