import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  const now = new Date();
  const formatISO = (offsetHours) => new Date(now.getTime() + offsetHours * 3600000).toISOString();

  const baseItems = [
    {
      id: 'APP-501',
      brandId: 'brand-nexus',
      organizationId: 'org-crinoid',
      caption: '✨ Launching our new high-performance activewear line this Friday! Breathable, sustainable, and designed to move with you everywhere. Pre-order link in bio! #NexusLife #Activewear',
      mediaUrls: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram', 'facebook'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
      },
      assignedApprover: {
        id: 'u-3',
        name: 'Karthik',
        role: 'Approver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      status: 'in_review',
      submittedAt: formatISO(-3),
      reviewedAt: formatISO(-2),
      scheduledAt: formatISO(48),
      campaign: 'Spring Active 2026',
      version: 1,
      requiresClientApproval: false,
      steps: [
        {
          stepNumber: 1,
          title: 'Review & Sign-Off',
          assignedRole: 'Approver',
          assignedApproverName: 'Karthik',
          status: 'pending'
        }
      ],
      history: [
        {
          id: 'hist-501-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
          timestamp: formatISO(-3),
          note: 'Submitted post copy and high-res apparel media for campaign review.'
        }
      ],
      comments: [
        {
          id: 'comm-1',
          authorId: 'u-2',
          authorName: 'Priya',
          authorRole: 'Content Creator',
          content: 'Submitted post copy and high-res apparel media for campaign review. @Karthik',
          timestamp: formatISO(-3),
          type: 'comment'
        }
      ]
    },
    {
      id: 'APP-502',
      brandId: 'brand-nexus',
      organizationId: 'org-crinoid',
      caption: '💡 5 Quick Tips for high-converting social media creatives in 2026. Bookmark this carousel for your marketing team!',
      mediaUrls: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram', 'facebook', 'linkedin'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
      },
      assignedApprover: {
        id: 'u-3',
        name: 'Karthik',
        role: 'Approver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      status: 'in_review',
      submittedAt: formatISO(-1),
      scheduledAt: formatISO(72),
      campaign: 'Tech Highlights',
      version: 1,
      requiresClientApproval: false,
      steps: [
        {
          stepNumber: 1,
          title: 'Review & Sign-Off',
          assignedRole: 'Approver',
          assignedApproverName: 'Karthik',
          status: 'pending'
        }
      ],
      history: [
        {
          id: 'hist-502-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
          timestamp: formatISO(-1),
          note: 'Carousel tips ready for review and scheduling.'
        }
      ],
      comments: []
    },
    {
      id: 'APP-504',
      brandId: 'brand-nexus',
      organizationId: 'org-crinoid',
      caption: '🚀 Excited to announce our next-generation social suite! Multi-platform publishing is finally here.',
      mediaUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'],
      mediaType: 'image',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      platforms: ['instagram', 'facebook'],
      author: {
        id: 'u-1',
        name: 'Muthukumar',
        role: 'Social Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      },
      assignedApprover: {
        id: 'u-3',
        name: 'Karthik',
        role: 'Approver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      status: 'approved',
      submittedAt: formatISO(-24),
      reviewedAt: formatISO(-20),
      scheduledAt: formatISO(-18),
      campaign: 'Product Launch 2026',
      version: 1,
      requiresClientApproval: false,
      steps: [
        {
          stepNumber: 1,
          title: 'Internal Review',
          assignedRole: 'Approver',
          assignedApproverName: 'Karthik',
          status: 'approved',
          completedAt: formatISO(-20)
        }
      ],
      history: [
        {
          id: 'hist-504-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
          timestamp: formatISO(-24),
          note: 'Product launch announcement copy submitted.'
        },
        {
          id: 'hist-504-2',
          type: 'decision',
          action: 'Approved (Final Sign-off)',
          user: { id: 'u-3', name: 'Karthik', role: 'Approver' },
          timestamp: formatISO(-20),
          note: 'Looks great! Approved for automated distribution.'
        }
      ],
      comments: [
        {
          id: 'comm-5',
          authorId: 'u-3',
          authorName: 'Karthik',
          authorRole: 'Approver',
          content: 'Looks great! Approved for automated distribution.',
          timestamp: formatISO(-20),
          type: 'decision',
          decision: 'approved'
        }
      ]
    },
    {
      id: 'APP-505',
      brandId: 'brand-nexus',
      organizationId: 'org-crinoid',
      caption: 'Unverified coupon discount code flash sale: Get 70% off with coupon code CRN70 today only!',
      mediaUrls: [],
      mediaType: 'text',
      platforms: ['facebook'],
      author: {
        id: 'u-2',
        name: 'Priya',
        role: 'Content Creator',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80'
      },
      assignedApprover: {
        id: 'u-3',
        name: 'Karthik',
        role: 'Approver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      status: 'rejected',
      submittedAt: formatISO(-30),
      reviewedAt: formatISO(-28),
      campaign: 'Promotions',
      version: 1,
      requiresClientApproval: false,
      steps: [
        {
          stepNumber: 1,
          title: 'Review & Sign-Off',
          assignedRole: 'Approver',
          assignedApproverName: 'Karthik',
          status: 'rejected',
          completedAt: formatISO(-28)
        }
      ],
      history: [
        {
          id: 'hist-505-1',
          type: 'submission',
          action: 'Submitted for Approval',
          user: { id: 'u-2', name: 'Priya', role: 'Content Creator' },
          timestamp: formatISO(-30),
          note: 'Flash sale copy submitted for review.'
        },
        {
          id: 'hist-505-2',
          type: 'decision',
          action: 'Rejected',
          user: { id: 'u-3', name: 'Karthik', role: 'Approver' },
          timestamp: formatISO(-28),
          note: 'Discount codes above 50% violate marketing guidelines without finance sign-off.'
        }
      ],
      comments: [
        {
          id: 'comm-6',
          authorId: 'u-3',
          authorName: 'Karthik',
          authorRole: 'Approver',
          content: 'Rejected: Discount codes above 50% violate marketing guidelines without finance sign-off.',
          timestamp: formatISO(-28),
          type: 'decision',
          decision: 'rejected'
        }
      ]
    }
  ];

  // Also duplicate for brand-crinoid
  const crinoidItems = baseItems.map(item => ({
    ...item,
    id: item.id.replace('APP-', 'CRN-'),
    brandId: 'brand-crinoid'
  }));

  return [...baseItems, ...crinoidItems];
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
const AUTHORIZED_APPROVERS = {
  'brand-nexus': [
    {
      id: 'u-3',
      name: 'Karthik',
      email: 'karthik@crinoid.social',
      role: 'Approver',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      brandId: 'brand-nexus'
    }
  ],
  'brand-crinoid': [
    {
      id: 'u-3',
      name: 'Karthik',
      email: 'karthik@crinoid.social',
      role: 'Approver',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      brandId: 'brand-crinoid'
    }
  ]
};

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
    // 0. POST /api/schedule/validate
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
      const brandApprovers = AUTHORIZED_APPROVERS[brandId] || AUTHORIZED_APPROVERS['brand-nexus'];
      const assignedId = body.assignedApprover?.id;
      const validApprover = brandApprovers.find(a => a.id === assignedId || a.role.toLowerCase() === 'approver');

      if (!validApprover) {
        return sendJson(res, 400, { 
          error: 'Invalid approver. Only users with the authorized Approver role (Karthik) can be assigned.' 
        });
      }

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
          id: body.author?.id || 'u-1',
          name: body.author?.name || 'Muthukumar',
          role: body.author?.role || 'Social Lead',
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
            user: body.author || { id: 'u-1', name: 'Muthukumar', role: 'Social Lead' },
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
        id: userId || 'u-3',
        name: userName || 'Karthik',
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
            id: body.userId || 'u-2',
            name: body.userName || 'Priya',
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

