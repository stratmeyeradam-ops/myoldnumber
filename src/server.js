// src/server.js — Pure native Node 22 HTTP server (Zero-middleware, pure speed)
import http from 'node:http';

import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs';
import { join, extname } from 'node:path';
import { db } from './db.js';
import { hashPassword, verifyPassword, createSession, getSessionUser, deleteSession } from './auth.js';
import { lookupNumber, digitsOnly } from './lib/nanp/lookup.js';
import { GUIDES, getGuideBySlug } from './lib/guides.js';
import { getTier } from './lib/tiers.js';
import { createCheckoutSession, handleWebhookEvent } from './stripe.js';
import { renderLayout } from './views/layout.js';
import { renderHomePage } from './views/home.js';
import { renderPricingPage } from './views/pricing.js';
import { renderGuidesIndex, renderGuideArticle } from './views/guides.js';
import { renderBoardIndex, renderThreadView } from './views/board.js';
import { renderTrackingPage } from './views/tracking.js';
import { renderLoginPage, renderSignupPage, renderAccountPage } from './views/auth.js';

const PORT = process.env.PORT || 4320;
const PUBLIC_DIR = join(process.cwd(), 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon'
};

function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie;
  if (!header) return list;
  header.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (name) list[name] = decodeURIComponent(rest.join('=').trim());
  });
  return list;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(body);
        const data = {};
        for (const [key, val] of params.entries()) data[key] = val;
        resolve(data);
      } else if (contentType.includes('application/json')) {
        try { resolve(JSON.parse(body)); } catch { resolve({}); }
      } else {
        resolve(body);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const pathname = parsed.pathname;
  const method = req.method;

  // Static file serving from public/
  const relPath = pathname.replace(/^\/+/, "");
  const staticPath = join(PUBLIC_DIR, relPath);
  if (relPath && existsSync(staticPath) && !statSync(staticPath).isDirectory()) {
    const ext = extname(staticPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' });
    return createReadStream(staticPath).pipe(res);
  }

  // Session user
  const cookies = parseCookies(req);
  const user = getSessionUser(cookies.session_token);

  function html(content, title, desc = '') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    if (method === 'HEAD') return res.end();
    res.end(renderLayout({ title, description: desc, path: pathname, user, content }));
  }

  function redirect(url, status = 302, setCookie = null) {
    const headers = { Location: url };
    if (setCookie) headers['Set-Cookie'] = setCookie;
    res.writeHead(status, headers);
    res.end();
  }

  const isRead = method === 'GET' || method === 'HEAD';

  try {
    // 1. Home & Lookup
    if (pathname === '/' && isRead) {
      return html(renderHomePage({}), 'Reverse Phone Lookup & Number Allocation Intelligence');
    }

    if (pathname === '/lookup' && isRead) {
      const q = parsed.searchParams.get('q') || '';
      const digits = digitsOnly(q);
      if (digits.length !== 10) {
        return html(renderHomePage({ error: 'Please enter a valid 10-digit North American telephone number.' }), 'Lookup Error');
      }
      const dossier = lookupNumber(digits);
      return html(renderHomePage({ result: dossier }), `Dossier: ${dossier.national}`);
    }

    // 2. Guides
    if (pathname === '/guides' && isRead) {
      return html(renderGuidesIndex(), 'Phone Number Recycling & Recovery Guides');
    }

    if (pathname.startsWith('/guides/') && isRead) {
      const slug = pathname.replace('/guides/', '');
      const guide = getGuideBySlug(slug);
      if (!guide) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Guide not found');
      }
      return html(renderGuideArticle(guide), guide.title, guide.dek);
    }

    // 3. Pricing & Subscriptions
    if (pathname === '/pricing' && isRead) {
      return html(renderPricingPage({ user }), 'Monitoring Subscription Plans ($5, $10, $20)');
    }

    // 4. Message Board
    if (pathname === '/board' && isRead) {
      const categorySlug = parsed.searchParams.get('category');
      const categories = db.prepare('SELECT id, slug, title, description FROM board_categories ORDER BY sort_order ASC').all();
      
      let query = `
        SELECT t.id, t.title, t.slug, t.pinned, t.created_at,
               c.title as category_title, u.name as author_name,
               (SELECT count(*) FROM board_posts p WHERE p.thread_id = t.id) as reply_count
        FROM board_threads t
        JOIN board_categories c ON c.id = t.category_id
        JOIN users u ON u.id = t.user_id
      `;
      let params = [];
      if (categorySlug) {
        query += ' WHERE c.slug = ? ';
        params.push(categorySlug);
      }
      query += ' ORDER BY t.pinned DESC, t.updated_at DESC LIMIT 50';

      const threads = db.prepare(query).all(...params);
      return html(renderBoardIndex({ categories, threads, user }), 'Community Message Board');
    }

    if (pathname.startsWith('/board/thread/') && method === 'GET') {
      const parts = pathname.split('/');
      const threadId = parts[3];
      const thread = db.prepare(`
        SELECT t.id, t.title, t.slug, t.created_at, c.title as category_title, u.name as author_name
        FROM board_threads t
        JOIN board_categories c ON c.id = t.category_id
        JOIN users u ON u.id = t.user_id
        WHERE t.id = ?
      `).get(threadId);

      if (!thread) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Discussion not found');
      }

      const posts = db.prepare(`
        SELECT p.id, p.body, p.created_at, u.name as author_name, u.tier as author_tier
        FROM board_posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.thread_id = ?
        ORDER BY p.created_at ASC
      `).all(threadId);

      return html(renderThreadView({ thread, posts, user }), thread.title);
    }

    if (pathname === '/board/new' && method === 'GET') {
      if (!user) return redirect('/login');
      if (user.tier !== 't10' && user.tier !== 't20') return redirect('/pricing');
      const categories = db.prepare('SELECT id, title FROM board_categories ORDER BY sort_order ASC').all();
      const content = `
        <div class="card" style="max-width: 680px; margin: 0 auto;">
          <h2 style="font-size: 24px; color: #fff; margin-bottom: 16px;">Start a New Discussion</h2>
          <form action="/board/new" method="POST" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px;">Category</label>
              <select name="category_id" required style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px; font-size: 14px; color: #fff;">
                ${categories.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px;">Discussion Title</label>
              <input type="text" name="title" required placeholder="e.g. Experiences recovering an old Verizon number..." style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px; font-size: 14px; color: #fff;">
            </div>
            <div>
              <label style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px;">Post Body</label>
              <textarea name="body" rows="6" required placeholder="Provide details, rate centers, carrier notes..." style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px; font-size: 14px; color: #fff; resize: vertical;"></textarea>
            </div>
            <button type="submit" class="btn" style="padding: 12px 24px;">Publish Thread &rarr;</button>
          </form>
        </div>
      `;
      return html(content, 'New Discussion');
    }

    if (pathname === '/board/new' && method === 'POST') {
      if (!user) return redirect('/login');
      if (user.tier !== 't10' && user.tier !== 't20') return redirect('/pricing');
      const body = await parseBody(req);
      const threadId = 'thr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const slug = (body.title || 'thread').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
      const now = Date.now();

      db.prepare(`
        INSERT INTO board_threads (id, category_id, user_id, title, slug, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(threadId, body.category_id, user.id, body.title, slug, now, now);

      const postId = 'post_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      db.prepare(`
        INSERT INTO board_posts (id, thread_id, user_id, body, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(postId, threadId, user.id, body.body, now);

      return redirect(`/board/thread/${threadId}/${slug}`);
    }

    if (pathname === '/board/reply' && method === 'POST') {
      if (!user) return redirect('/login');
      if (user.tier !== 't10' && user.tier !== 't20') return redirect('/pricing');
      const body = await parseBody(req);
      const postId = 'post_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = Date.now();

      db.prepare(`
        INSERT INTO board_posts (id, thread_id, user_id, body, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(postId, body.thread_id, user.id, body.body, now);

      db.prepare('UPDATE board_threads SET updated_at = ? WHERE id = ?').run(now, body.thread_id);
      return redirect(`/board/thread/${body.thread_id}/reply#${postId}`);
    }

    // 5. Number Tracking & Quotas
    if (pathname === '/tracking' && method === 'GET') {
      const prefillNumber = parsed.searchParams.get('number') || '';
      const tracked = user ? db.prepare('SELECT * FROM tracked_numbers WHERE user_id = ? ORDER BY created_at DESC').all(user.id) : [];
      return html(renderTrackingPage({ 
        user, 
        tracked, 
        prefillNumber,
        error: parsed.searchParams.get('error'), 
        success: parsed.searchParams.get('success') 
      }), 'Number Monitoring Registry');
    }

    if (pathname === '/tracking/add' && method === 'POST') {
      if (!user) return redirect('/login');
      const tier = getTier(user.tier);
      const count = db.prepare('SELECT count(*) as count FROM tracked_numbers WHERE user_id = ?').get(user.id).count;
      if (count >= tier.trackLimit) {
        return redirect('/tracking?error=' + encodeURIComponent(`Your ${tier.name} plan is limited to ${tier.trackLimit} tracked numbers. Please upgrade to track more.`));
      }
      const body = await parseBody(req);
      const digits = digitsOnly(body.number || '');
      if (digits.length !== 10) {
        return redirect('/tracking?error=' + encodeURIComponent('Invalid 10-digit number.'));
      }
      const dossier = lookupNumber(digits);
      const id = 'trk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const now = Date.now();

      db.prepare(`
        INSERT INTO tracked_numbers (id, user_id, digits, national, city, region, carrier, line_type, last_status, status_detail, aging_days, created_at, last_checked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, user.id, digits, dossier.national, dossier.city, dossier.region, dossier.carrier, dossier.lineTypeLabel, dossier.status, dossier.statusDetail, dossier.agingDaysRemaining, now, now);

      return redirect('/tracking?success=' + encodeURIComponent(`Added ${dossier.national} to continuous monitoring watchlist.`));
    }

    if (pathname === '/tracking/remove' && method === 'POST') {
      if (!user) return redirect('/login');
      const body = await parseBody(req);
      db.prepare('DELETE FROM tracked_numbers WHERE id = ? AND user_id = ?').run(body.id, user.id);
      return redirect('/tracking?success=' + encodeURIComponent('Removed number from watchlist.'));
    }

    // 6. Stripe Checkout & Webhook
    if (pathname === '/api/checkout' && method === 'POST') {
      const body = await parseBody(req);
      const tierId = body.tier;
      const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
      try {
        const checkoutUrl = await createCheckoutSession({
          userId: user?.id || null,
          userEmail: user?.email || null,
          tierId,
          origin
        });
        return redirect(checkoutUrl, 303);
      } catch (err) {
        return html(`<div class="card" style="color: #f87171;">Checkout failed: ${escapeHtml(err.message)}</div>`, 'Checkout Error');
      }
    }

    if (pathname === '/api/webhook/stripe' && method === 'POST') {
      const rawBody = await parseBody(req);
      const sig = req.headers['stripe-signature'];
      const secret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
      try {
        await handleWebhookEvent(rawBody, sig, secret);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ received: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // 7. Auth (Login, Signup, Logout, Account)
    if (pathname === '/login' && method === 'GET') {
      return html(renderLoginPage({}), 'Sign In');
    }

    if (pathname === '/login' && method === 'POST') {
      const body = await parseBody(req);
      const row = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(body.email?.toLowerCase().trim());
      if (!row || !verifyPassword(body.password, row.password_hash)) {
        return html(renderLoginPage({ error: 'Invalid email or password.' }), 'Sign In');
      }
      const token = createSession(row.id);
      return redirect('/tracking', 302, `session_token=${token}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`);
    }

    if (pathname === '/signup' && method === 'GET') {
      return html(renderSignupPage({ prefillTier: parsed.searchParams.get('tier') || 'free' }), 'Create Account');
    }

    if (pathname === '/signup' && method === 'POST') {
      const body = await parseBody(req);
      const email = body.email?.toLowerCase().trim();
      if (!email || !body.password || body.password.length < 8) {
        return html(renderSignupPage({ error: 'Password must be at least 8 characters.', prefillEmail: email }), 'Create Account');
      }
      const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
      if (existing) {
        return html(renderSignupPage({ error: 'An account with that email already exists.', prefillEmail: email }), 'Create Account');
      }
      const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const passHash = hashPassword(body.password);
      db.prepare(`
        INSERT INTO users (id, email, password_hash, name, tier, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, email, passHash, body.name?.trim() || 'Member', body.tier || 'free', Date.now());

      const token = createSession(userId);
      return redirect('/tracking', 302, `session_token=${token}; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax`);
    }

    if (pathname === '/account' && method === 'GET') {
      if (!user) return redirect('/login');
      const count = db.prepare('SELECT count(*) as count FROM tracked_numbers WHERE user_id = ?').get(user.id).count;
      return html(renderAccountPage({ user, trackedCount: count }), 'Account Settings');
    }

    if (pathname === '/logout') {
      if (cookies.session_token) deleteSession(cookies.session_token);
      return redirect('/', 302, 'session_token=; Path=/; Max-Age=0');
    }

    // 8. Legal & Terms
    if (pathname === '/terms' || pathname === '/privacy' || pathname === '/contact') {
      const content = `
        <div class="card" style="max-width: 800px; margin: 0 auto; line-height: 1.7; color: #cbd5e1;">
          <h1 style="font-size: 28px; color: #fff; margin-bottom: 16px;">Regulatory, Compliance &amp; Terms</h1>
          <p style="margin-bottom: 14px;"><strong>Informational &amp; Research Tool:</strong> My Old Number is a North American Numbering Plan educational and monitoring platform. Carrier status and OCN information are modeled from published regulatory allocation data.</p>
          <p style="margin-bottom: 14px;"><strong>Not a Consumer Reporting Agency:</strong> Our records are not provided or formatted for FCRA purposes (tenant screening, credit checks, or employment verification).</p>
          <p style="margin-bottom: 14px;"><strong>Publisher Verification:</strong> AdSense Publisher ID <code>pub-3415300754694996</code>.</p>
        </div>
      `;
      return html(content, 'Terms & Compliance');
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');

  } catch (err) {
    console.error('Unhandled server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[My Old Number] Live on http://127.0.0.1:${PORT}`);
});
