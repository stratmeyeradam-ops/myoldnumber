// src/views/auth.js — Clean login, register, and account management views
export function renderLoginPage({ error = null }) {
  return `
    <div class="card" style="max-width: 440px; margin: 40px auto; border-color: #26334d;">
      <h1 style="font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 8px;">Sign In to Account</h1>
      <p style="color: var(--muted); font-size: 13.5px; margin-bottom: 24px;">Access your tracked phone numbers and community board.</p>

      ${error ? `<div style="color: #f87171; font-size: 13px; margin-bottom: 16px;">&bull; ${escapeHtml(error)}</div>` : ''}

      <form action="/login" method="POST" style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px;">Email Address</label>
          <input type="email" name="email" required style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px; font-size: 14px; color: #fff; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px;">Password</label>
          <input type="password" name="password" required style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px; font-size: 14px; color: #fff; outline: none;">
        </div>

        <button type="submit" class="btn" style="width: 100%; padding: 12px; margin-top: 8px;">Sign In &rarr;</button>
      </form>

      <div style="margin-top: 24px; text-align: center; font-size: 13px; color: var(--muted);">
        Don't have an account? <a href="/signup" style="font-weight: 600;">Create one here</a>
      </div>
    </div>
  `;
}

export function renderSignupPage({ error = null, prefillEmail = '', prefillTier = 'free' }) {
  return `
    <div class="card" style="max-width: 440px; margin: 40px auto; border-color: #26334d;">
      <h1 style="font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 8px;">Create an Account</h1>
      <p style="color: var(--muted); font-size: 13.5px; margin-bottom: 24px;">Start monitoring numbers and participate in the message board.</p>

      ${error ? `<div style="color: #f87171; font-size: 13px; margin-bottom: 16px;">&bull; ${escapeHtml(error)}</div>` : ''}

      <form action="/signup" method="POST" style="display: flex; flex-direction: column; gap: 16px;">
        <input type="hidden" name="tier" value="${escapeHtml(prefillTier)}">

        <div>
          <label style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px;">Your Name / Handle</label>
          <input type="text" name="name" required placeholder="e.g. Alex M." style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px; font-size: 14px; color: #fff; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px;">Email Address</label>
          <input type="email" name="email" value="${escapeHtml(prefillEmail)}" required style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px; font-size: 14px; color: #fff; outline: none;">
        </div>

        <div>
          <label style="display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px;">Password</label>
          <input type="password" name="password" minlength="8" required style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px; font-size: 14px; color: #fff; outline: none;">
        </div>

        <button type="submit" class="btn" style="width: 100%; padding: 12px; margin-top: 8px;">Create Account &rarr;</button>
      </form>

      <div style="margin-top: 24px; text-align: center; font-size: 13px; color: var(--muted);">
        Already have an account? <a href="/login" style="font-weight: 600;">Sign in here</a>
      </div>
    </div>
  `;
}

export function renderAccountPage({ user, trackedCount = 0 }) {
  return `
    <div style="max-width: 680px; margin: 0 auto;">
      <h1 style="font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 24px;">Account Settings</h1>

      <div class="card" style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; color: #fff; margin-bottom: 16px;">Profile Details</h3>
        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 14px;">
          <div><span style="color: var(--muted);">Name:</span> <strong style="color: #fff;">${escapeHtml(user.name)}</strong></div>
          <div><span style="color: var(--muted);">Email:</span> <strong style="color: #fff;">${escapeHtml(user.email)}</strong></div>
          <div><span style="color: var(--muted);">Active Subscription:</span> <span style="font-weight: 700; color: #38bdf8; text-transform: uppercase;">${escapeHtml(user.tier)}</span></div>
          <div><span style="color: var(--muted);">Tracked Numbers:</span> <strong style="color: #fff;">${trackedCount} Active</strong></div>
        </div>
      </div>

      <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h4 style="color: #fff; font-size: 16px; margin-bottom: 4px;">Subscription &amp; Billing</h4>
          <p style="color: var(--muted); font-size: 13px;">Manage your Stripe payment methods or adjust your monitoring plan.</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <a href="/pricing" class="btn">Change Tier</a>
          <a href="/logout" class="btn btn-secondary">Sign Out</a>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
