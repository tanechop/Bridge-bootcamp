import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

dotenv.config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const jobPublicInclude = {
  _count: { select: { applications: true } },
  postedBy: { select: { id: true, name: true, email: true } },
} as const;

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      if (i === retries - 1) throw err;
      console.log(`DB connection attempt ${i + 1} failed, retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  throw new Error('Unreachable');
}

function stripPassword<T extends { password?: string }>(user: T | null): Omit<T, 'password'> | null {
  if (!user) return null;
  const { password: _p, ...rest } = user;
  return rest;
}

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json());

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'Job Seeker',
      },
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { idToken, accessToken } = req.body;
  try {
    let email: string | undefined;
    let name: string | undefined;

    if (idToken) {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload?.email;
      name = payload?.name;
    } else if (accessToken) {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      email = response.data.email;
      name = response.data.name;
    }

    if (!email) return res.status(400).json({ error: 'Invalid Google token' });

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          password: await bcrypt.hash(Math.random().toString(36), 10),
          role: 'Job Seeker',
        },
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Google login failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        seekerProfile: true,
        recruiterProfile: true,
      },
    });
    res.json(stripPassword(user));
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to load profile' });
  }
});

function pickSeekerProfileBody(body: Record<string, unknown>) {
  const keys = ['title', 'city', 'yearsExp', 'skills', 'cvUploaded', 'profileCompletion', 'avatar', 'education', 'preferences'] as const;
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

function pickRecruiterProfileBody(body: Record<string, unknown>) {
  const keys = ['company', 'industry', 'companySize', 'website', 'hqLocation', 'logoUploaded'] as const;
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
}

function calculateProfileCompletion(profile: any) {
  let score = 0;
  if (profile.title && profile.title.trim()) score += 10;
  if (profile.city && profile.city.trim()) score += 10;
  if (profile.yearsExp && profile.yearsExp.trim()) score += 10;
  if (profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0) score += 20;
  
  if (profile.education && typeof profile.education === 'object') {
    const hasValues = Object.values(profile.education).some(v => v !== null && v !== undefined && v !== '');
    if (hasValues) score += 20;
  }
  
  if (profile.preferences && typeof profile.preferences === 'object') {
    const hasValues = Object.values(profile.preferences).some(v => v !== null && v !== undefined && v !== '');
    if (hasValues) score += 10;
  }
  
  if (profile.cvUploaded) score += 20;
  return score;
}

// --- PROFILE ROUTES ---

app.post('/api/profiles/seeker', authenticateToken, async (req: any, res) => {
  try {
    const data = pickSeekerProfileBody(req.body);
    
    // Auto-calculate completion if not explicitly provided or to override it
    data.profileCompletion = calculateProfileCompletion(data);

    const profile = await prisma.seekerProfile.upsert({
      where: { userId: req.user.userId },
      update: data as any,
      create: { ...data, userId: req.user.userId } as any,
    });
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/profiles/recruiter', authenticateToken, async (req: any, res) => {
  try {
    const data = pickRecruiterProfileBody(req.body);
    const profile = await prisma.recruiterProfile.upsert({
      where: { userId: req.user.userId },
      update: data as any,
      create: { ...data, userId: req.user.userId, company: String(data.company || 'Company') } as any,
    });
    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- JOB ROUTES ---

app.get('/api/jobs/mine', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== 'Recruiter' && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only recruiters can list their own posts' });
    }
    const me = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { recruiterProfile: true },
    });
    const company = me?.recruiterProfile?.company;
    const whereMine: Prisma.JobWhereInput = {
      moderationStatus: { not: 'Removed' },
    };
    if (req.user.role !== 'Admin') {
      whereMine.OR = [{ postedByUserId: req.user.userId }];
      if (company) {
        whereMine.OR.push({ postedByUserId: null, company });
      }
    }
    const jobs = await withRetry(() =>
      prisma.job.findMany({
        where: whereMine,
        orderBy: { posted: 'desc' },
        include: jobPublicInclude,
      })
    );
    res.json(jobs);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to load jobs' });
  }
});

app.get('/api/jobs', async (_req, res) => {
  try {
    const jobs = await withRetry(() =>
      prisma.job.findMany({
        where: { moderationStatus: { not: 'Removed' } },
        orderBy: { posted: 'desc' },
        include: jobPublicInclude,
      })
    );
    res.json(jobs);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to load jobs' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: parseInt(req.params.id, 10), moderationStatus: { not: 'Removed' } },
      include: jobPublicInclude,
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to load job' });
  }
});

app.post('/api/jobs', authenticateToken, async (req: any, res) => {
  try {
    if (req.user.role !== 'Recruiter' && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only recruiters can post jobs' });
    }
    const {
      title,
      company,
      location,
      type,
      sector,
      salary,
      description,
      requirements,
      responsibilities,
      skills,
      minEducation,
      minExperience,
      deadline,
      companyId,
    } = req.body;

    const job = await prisma.job.create({
      data: {
        title: String(title ?? ''),
        company: String(company ?? ''),
        location: String(location ?? ''),
        type: String(type ?? 'Full-time'),
        sector: String(sector ?? ''),
        salary: salary != null ? String(salary) : null,
        description: String(description ?? ''),
        requirements: Array.isArray(requirements) ? requirements : [],
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        skills: Array.isArray(skills) ? skills : [],
        minEducation: minEducation != null ? String(minEducation) : null,
        minExperience: minExperience != null ? String(minExperience) : null,
        deadline: deadline ? new Date(deadline) : null,
        companyId: companyId != null ? parseInt(String(companyId), 10) : null,
        postedByUserId: req.user.userId,
      },
      include: jobPublicInclude,
    });
    res.status(201).json(job);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Could not create job' });
  }
});

// --- APPLICATION ROUTES ---

app.get('/api/applications', authenticateToken, async (req: any, res) => {
  try {
    let where: Prisma.ApplicationWhereInput = {};
    if (req.user.role === 'Job Seeker') {
      where.userId = req.user.userId;
    } else if (req.user.role === 'Recruiter') {
      where.job = { postedByUserId: req.user.userId };
    }

    if (req.query.jobId) {
      const jobId = parseInt(req.query.jobId as string, 10);
      where = { ...where, jobId };
      if (req.user.role === 'Recruiter') {
        const job = await prisma.job.findFirst({
          where: { id: jobId, postedByUserId: req.user.userId },
        });
        if (!job) {
          return res.status(403).json({ error: 'You can only view applicants for your own job posts' });
        }
      }
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: true,
        user: {
          include: { seekerProfile: true },
        },
      },
      orderBy: { appliedOn: 'desc' },
    });
    res.json(applications);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Failed to load applications' });
  }
});

function mapPaymentMethod(method: string | undefined): string {
  if (method === 'orange') return 'Orange Money';
  if (method === 'mtn') return 'MTN Money';
  return method ? String(method) : 'Unknown';
}

app.post('/api/applications', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Job Seeker') {
    return res.status(403).json({ error: 'Only job seekers can apply' });
  }
  const { jobId, paymentMethod } = req.body;
  const jid = parseInt(String(jobId), 10);
  if (Number.isNaN(jid)) {
    return res.status(400).json({ error: 'Invalid job id' });
  }

  try {
    const job = await prisma.job.findFirst({ where: { id: jid, moderationStatus: { not: 'Removed' } } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const reference = `ATS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const methodLabel = mapPaymentMethod(paymentMethod);

    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          userId: req.user.userId,
          jobId: jid,
          paymentStatus: 'Pending',
          cvStatus: 'Pending',
        },
      });
      await tx.payment.create({
        data: {
          userId: req.user.userId,
          jobId: jid,
          method: methodLabel,
          amount: '2,000 XAF',
          reference,
          status: 'Pending',
        },
      });
      return application;
    });

    res.status(201).json({ application: result, paymentReference: reference });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(409).json({ error: 'You have already applied to this job' });
    }
    res.status(400).json({ error: e.message || 'Could not submit application' });
  }
});

app.patch('/api/applications/:id', authenticateToken, async (req: any, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  try {
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { job: true, user: true },
    });
    if (!existing) return res.status(404).json({ error: 'Application not found' });

    const { recruiterInterest, cvStatus } = req.body as { recruiterInterest?: string; cvStatus?: string };

    if (req.user.role === 'Recruiter') {
      if (existing.job.postedByUserId !== req.user.userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const data: Prisma.ApplicationUpdateInput = {};
      if (recruiterInterest != null) {
        data.recruiterInterest = String(recruiterInterest);
        if (recruiterInterest === 'Interested') {
          data.contactAccessStatus = 'Pending';
        }
      }
      if (cvStatus != null) data.cvStatus = String(cvStatus);
      const updated = await prisma.application.update({ where: { id }, data, include: { job: true, user: { include: { seekerProfile: true } } } });
      return res.json(updated);
    }

    if (req.user.role === 'Admin') {
      const data: Prisma.ApplicationUpdateInput = {};
      if (recruiterInterest != null) data.recruiterInterest = String(recruiterInterest);
      if (cvStatus != null) data.cvStatus = String(cvStatus);
      const updated = await prisma.application.update({ where: { id }, data, include: { job: true, user: { include: { seekerProfile: true } } } });
      return res.json(updated);
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Update failed' });
  }
});

// --- ADMIN ROUTES ---

app.get('/api/admin/stats', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  try {
    const [totalUsers, jobSeekers, recruiters, activeJobPosts, pendingPayments, pendingCVReviews] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'Job Seeker' } }),
      prisma.user.count({ where: { role: 'Recruiter' } }),
      prisma.job.count({ where: { moderationStatus: { not: 'Removed' } } }),
      prisma.payment.count({ where: { status: 'Pending' } }),
      prisma.application.count({ where: { cvStatus: 'Pending', paymentStatus: 'Validated' } }),
    ]);

    res.json({
      totalUsers,
      jobSeekers,
      recruiters,
      pendingPayments,
      pendingCVReviews,
      activeJobPosts,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/registrations-by-month', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const users = await prisma.user.findMany({ select: { createdAt: true, role: true } });
    const byKey = new Map<string, { seekers: number; recruiters: number }>();
    for (const u of users) {
      const d = u.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byKey.has(key)) byKey.set(key, { seekers: 0, recruiters: 0 });
      const b = byKey.get(key)!;
      if (u.role === 'Recruiter') b.recruiters += 1;
      else if (u.role === 'Job Seeker') b.seekers += 1;
    }
    const sorted = [...byKey.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const payload = sorted.map(([key, v]) => {
      const monthIdx = parseInt(key.split('-')[1], 10) - 1;
      return { month: monthNames[monthIdx] ?? key, monthKey: key, seekers: v.seekers, recruiters: v.recruiters };
    });
    res.json(payload);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/activity', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const [recentUsers, recentJobs, recentApps] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, role: true, createdAt: true } }),
      prisma.job.findMany({ orderBy: { posted: 'desc' }, take: 5, select: { id: true, title: true, company: true, posted: true } }),
      prisma.application.findMany({
        orderBy: { appliedOn: 'desc' },
        take: 5,
        include: { user: { select: { name: true } }, job: { select: { title: true } } },
      }),
    ]);

    type Item = { id: string; text: string; time: string };
    const items: Item[] = [];
    const fmt = (d: Date) => {
      const diff = Date.now() - d.getTime();
      if (diff < 120000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
      return d.toLocaleDateString();
    };

    for (const u of recentUsers) {
      items.push({
        id: `u-${u.id}`,
        text: `New user registered: ${u.name} (${u.role})`,
        time: fmt(u.createdAt),
      });
    }
    for (const j of recentJobs) {
      items.push({
        id: `j-${j.id}`,
        text: `Job post: ${j.title} at ${j.company}`,
        time: fmt(j.posted),
      });
    }
    for (const a of recentApps) {
      items.push({
        id: `a-${a.id}`,
        text: `${a.user?.name ?? 'User'} applied to ${a.job?.title ?? 'a job'}`,
        time: fmt(a.appliedOn),
      });
    }

    items.sort((a, b) => {
      const order = (t: string) => (t === 'Just now' ? 0 : t.includes('mins') ? 1 : 2);
      return order(a.time) - order(b.time);
    });

    res.json(items.slice(0, 12));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/users', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/admin/users/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status required' });
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { status: String(status) },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });
    res.json(user);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Update failed' });
  }
});

app.get('/api/admin/payments', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const rows = await prisma.payment.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    const jobIds = [...new Set(rows.map((r) => r.jobId).filter(Boolean))] as number[];
    const jobs = jobIds.length ? await prisma.job.findMany({ where: { id: { in: jobIds } } }) : [];
    const jobMap = new Map(jobs.map((j) => [j.id, j]));
    const payload = rows.map((p) => {
      const job = p.jobId ? jobMap.get(p.jobId) : undefined;
      return {
        id: p.id,
        applicant: p.user.name,
        job: job?.title ?? '—',
        company: job?.company ?? '—',
        method: p.method,
        amount: p.amount,
        ref: p.reference,
        submittedAt: p.submittedAt.toISOString(),
        status: p.status,
        userId: p.userId,
        jobId: p.jobId,
      };
    });
    res.json(payload);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/admin/payments/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['Validated', 'Rejected', 'Pending'].includes(String(status))) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const pay = await prisma.payment.findUnique({ where: { id } });
    if (!pay) return res.status(404).json({ error: 'Payment not found' });

    const appWhere: Prisma.ApplicationWhereInput = { userId: pay.userId };
    if (pay.jobId != null) appWhere.jobId = pay.jobId;

    await prisma.$transaction([
      prisma.payment.update({ where: { id }, data: { status: String(status) } }),
      prisma.application.updateMany({
        where: appWhere,
        data: {
          paymentStatus: status === 'Validated' ? 'Validated' : status === 'Rejected' ? 'Rejected' : 'Pending',
        },
      }),
    ]);

    const updated = await prisma.payment.findUnique({ where: { id } });
    res.json(updated);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Update failed' });
  }
});

app.get('/api/admin/cv-access-requests', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const apps = await prisma.application.findMany({
      where: { contactAccessStatus: 'Pending' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: { include: { postedBy: { select: { name: true } } } },
      },
      orderBy: { appliedOn: 'desc' },
    });
    const mapped = apps.map((a) => ({
      id: a.id,
      recruiter: a.job.postedBy?.name ?? 'Recruiter',
      company: a.job.company,
      candidate: a.user.name,
      job: a.job.title,
      dateInterest: a.appliedOn.toISOString(),
      status: 'Pending' as const,
    }));
    res.json(mapped);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/admin/cv-access-requests/:applicationId', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  const applicationId = parseInt(req.params.applicationId, 10);
  const { decision } = req.body;
  if (!['Granted', 'Denied'].includes(String(decision))) {
    return res.status(400).json({ error: 'decision must be Granted or Denied' });
  }
  try {
    const next = decision === 'Granted' ? 'Granted' : 'Denied';
    await prisma.application.update({
      where: { id: applicationId },
      data: { contactAccessStatus: next },
    });
    res.json({ ok: true, contactAccessStatus: next });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Update failed' });
  }
});

app.get('/api/admin/reports', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const [payments, jobs] = await Promise.all([
      prisma.payment.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.job.findMany({
        where: { moderationStatus: { not: 'Removed' } },
        include: { _count: { select: { applications: true } } },
        orderBy: { posted: 'desc' },
        take: 20,
      }),
    ]);

    const payMap = Object.fromEntries(payments.map((p) => [p.status, p._count._all]));
    const topJobs = jobs
      .map((j) => ({ id: j.id, title: j.title, company: j.company, applicants: j._count.applications }))
      .sort((a, b) => b.applicants - a.applicants)
      .slice(0, 8);

    const recruiterStats = await prisma.job.groupBy({
      by: ['postedByUserId'],
      where: { postedByUserId: { not: null } },
      _count: { _all: true },
    });
    const recruiterIds = recruiterStats.map((r) => r.postedByUserId).filter(Boolean) as number[];
    const names = await prisma.user.findMany({ where: { id: { in: recruiterIds } }, select: { id: true, name: true } });
    const nameById = new Map(names.map((n) => [n.id, n.name]));

    const topRecruiters = recruiterStats
      .map((r) => {
        const uid = r.postedByUserId!;
        let applicants = 0;
        for (const j of jobs) {
          if (j.postedByUserId === uid) applicants += j._count.applications;
        }
        return { name: nameById.get(uid) ?? `User #${uid}`, posts: r._count._all, applicants };
      })
      .sort((a, b) => b.applicants - a.applicants)
      .slice(0, 10);

    const users = await prisma.user.findMany({ select: { createdAt: true, role: true } });
    const byKey = new Map<string, { seekers: number; recruiters: number }>();
    for (const u of users) {
      const d = u.createdAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byKey.has(key)) byKey.set(key, { seekers: 0, recruiters: 0 });
      const b = byKey.get(key)!;
      if (u.role === 'Recruiter') b.recruiters += 1;
      else if (u.role === 'Job Seeker') b.seekers += 1;
    }
    const sorted = [...byKey.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRegistrations = sorted.map(([key, v]) => {
      const monthIdx = parseInt(key.split('-')[1], 10) - 1;
      return { month: monthNames[monthIdx] ?? key, seekers: v.seekers, recruiters: v.recruiters };
    });

    res.json({
      monthlyRegistrations,
      topJobs,
      topRecruiters,
      paymentStats: {
        validated: payMap['Validated'] ?? 0,
        pending: payMap['Pending'] ?? 0,
        rejected: payMap['Rejected'] ?? 0,
        totalCollectedLabel: `${(payMap['Validated'] ?? 0) * 2000} XAF (est.)`,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/jobs', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  try {
    const jobs = await prisma.job.findMany({
      where: { moderationStatus: { not: 'Removed' } },
      include: {
        _count: { select: { applications: true } },
        postedBy: { select: { name: true } },
      },
      orderBy: { posted: 'desc' },
    });
    res.json(
      jobs.map((j) => ({
        id: j.id,
        title: j.title,
        recruiter: j.postedBy?.name ?? '—',
        company: j.company,
        posted: j.posted.toISOString(),
        applicants: j._count.applications,
        status: j.moderationStatus,
      }))
    );
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/api/admin/jobs/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  const id = parseInt(req.params.id, 10);
  const { moderationStatus } = req.body;
  if (!moderationStatus) return res.status(400).json({ error: 'moderationStatus required' });
  try {
    const job = await prisma.job.update({
      where: { id },
      data: { moderationStatus: String(moderationStatus) },
      include: jobPublicInclude,
    });
    res.json(job);
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Update failed' });
  }
});

app.delete('/api/admin/jobs/:id', authenticateToken, async (req: any, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Admin only' });
  const id = parseInt(req.params.id, 10);
  try {
    await prisma.job.update({ where: { id }, data: { moderationStatus: 'Removed' } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message || 'Delete failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
