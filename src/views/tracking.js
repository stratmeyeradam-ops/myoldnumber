// src/views/tracking.js — Grade-A user dashboard for managing tracked numbers and quotas
import { getTier } from '../lib/tiers.js';

export function renderTrackingPage({ user = null, tracked = [], error = null, success = null, prefillNumber = '' }) {
  if (!user) {
    return `
      <div style="text-align: center; max-width: 600px; margin: 40px auto;">
        <h1 style="font-size: 32px; color: #fff; margin-bottom: 16px;">Automated Number Tracking</h1>
        <p style="color: var(--muted); font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          Continuous monitoring for carrier recycling windows and thousands-block pool returns. Sign in or pick a subscription plan to begin monitoring your phone numbers.
        </p>
        <div style="display: flex; gap: 14px; justify-content: center;">
          <a href="/login" class="btn btn-secondary">Sign In</a>
          <a href="/pricing" class="btn">View Monitoring Plans &rarr;</a>
        </div>
      </div>
    `;
  }

  const tier = getTier(user.tier);
  const usedSlots = tracked.length;
  const maxSlots = tier.trackLimit;
  const canAdd = usedSlots < maxSlots;

  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; border-bottom: 1px solid var(--card-border); padding-bottom: 24px;">
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">Tracking Registry</div>
        <h1 style="font-size: 32px; font-weight: 800; color: #fff; letter-spacing: -0.02em;">Monitored Phone Numbers</h1>
        <div style="color: var(--muted); font-size: 14px; margin-top: 4px;">
          Account: <strong style="color: #fff;">${escapeHtml(user.email)}</strong> &middot; Plan: <strong style="color: #38bdf8;">${escapeHtml(tier.name)}</strong>
        </div>
      </div>
      <div>
        <a href="/pricing" class="btn btn-secondary" style="font-size: 13px;">Manage / Upgrade Plan</a>
      </div>
    </div>

    ${error ? `<div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; font-size: 14px;">&bull; ${escapeHtml(error)}</div>` : ''}
    ${success ? `<div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #6ee7b7; padding: 12px 16px; border-radius: 8px; margin-bottom: 24px; font-size: 14px;">&check; ${escapeHtml(success)}</div>` : ''}

    <!-- Quota Bar -->
    <div class="card" style="margin-bottom: 32px; background: #101521; border-color: #242f44;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 14px; font-weight: 600; color: #fff;">Tracking Quota Utilization</span>
        <span style="font-size: 13px; font-family: var(--mono); color: #38bdf8;">${usedSlots} / ${maxSlots} Slots Used</span>
      </div>
      <div style="width: 100%; height: 8px; background: #1e293b; border-radius: 999px; overflow: hidden;">
        <div style="width: ${maxSlots > 0 ? (usedSlots / maxSlots) * 100 : 0}%; height: 100%; background: linear-gradient(90deg, #38bdf8, #2563eb);"></div>
      </div>
      ${maxSlots === 0 ? `
        <div style="margin-top: 12px; font-size: 13px; color: var(--warn);">
          &bull; The Free plan does not include tracking slots. <a href="/pricing" style="text-decoration: underline; color: #fff;">Upgrade to Watcher ($5), Member ($10), or Pro ($20)</a> to add numbers.
        </div>
      ` : ''}
    </div>

    <!-- Add Number Form -->
    ${canAdd ? `
      <div class="card" style="margin-bottom: 32px; border-color: #2a374f;">
        <h3 style="font-size: 17px; color: #fff; margin-bottom: 12px;">Add a Number to Monitor</h3>
        <form action="/tracking/add" method="POST" style="display: flex; gap: 12px; flex-wrap: wrap;">
          <input 
            type="tel" 
            name="number" 
            placeholder="10-digit number (e.g. 402-531-2040)" 
            value="${escapeHtml(prefillNumber)}"
            required 
            style="flex: 1; min-width: 240px; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 12px 16px; font-size: 15px; color: #fff; font-family: var(--mono); outline: none;"
          />
          <button type="submit" class="btn" style="padding: 12px 24px;">Start Tracking &rarr;</button>
        </form>
      </div>
    ` : ''}

    <!-- Monitored Numbers List -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div style="padding: 16px 20px; border-bottom: 1px solid var(--card-border); font-size: 14px; font-weight: 700; color: #fff; background: rgba(255,255,255,0.02);">
        Active Watchlist
      </div>
      ${tracked.length === 0 ? `
        <div style="padding: 48px 24px; text-align: center; color: var(--muted); font-size: 14px;">
          You are not currently monitoring any numbers.
        </div>
      ` : `
        <div>
          ${tracked.map((t, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: ${idx === tracked.length - 1 ? 'none' : '1px solid var(--card-border)'}; flex-wrap: wrap; gap: 16px;">
              <div>
                <div style="font-size: 20px; font-weight: 800; color: #fff; font-family: var(--mono);">${escapeHtml(t.national)}</div>
                <div style="font-size: 13px; color: var(--muted); margin-top: 2px;">
                  ${escapeHtml(t.city || 'Unknown')}, ${escapeHtml(t.region || '')} &middot; OCN: ${escapeHtml(t.carrier || 'Modeled')} &middot; ${escapeHtml(t.line_type || 'Wireless')}
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 20px;">
                <div style="text-align: right;">
                  <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; background: ${t.last_status === 'available' ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)'}; color: ${t.last_status === 'available' ? '#10b981' : '#38bdf8'};">
                    ${escapeHtml(t.last_status ? t.last_status.toUpperCase() : 'MONITORED')}
                  </span>
                  <div style="font-size: 11px; color: var(--faint); margin-top: 4px;">Last polled: ${new Date(t.last_checked_at).toLocaleDateString()}</div>
                </div>
                <form action="/tracking/remove" method="POST" onsubmit="return confirm('Stop tracking this number?');">
                  <input type="hidden" name="id" value="${t.id}">
                  <button type="submit" style="background: none; border: none; color: #ef4444; font-size: 13px; cursor: pointer; text-decoration: underline;">Remove</button>
                </form>
              </div>
            </div>
          `).join('')}
        </div>
      `}
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
