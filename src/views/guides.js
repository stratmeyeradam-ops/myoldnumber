// src/views/guides.js — Grade-A educational directory and article reader
import { GUIDES } from '../lib/guides.js';

export function renderGuidesIndex() {
  return `
    <div style="text-align: center; max-width: 800px; margin: 0 auto 48px;">
      <div style="display:inline-flex; align-items:center; gap:8px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 999px; padding: 6px 16px; margin-bottom: 20px;">
        <span style="font-size: 13px; font-weight: 600; color: #38bdf8; text-transform: uppercase;">Telecom Intelligence &amp; Playbooks</span>
      </div>
      <h1 style="font-size: 40px; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin-bottom: 16px;">
        Phone Number Recycling &amp; Recovery Guides
      </h1>
      <p style="font-size: 16px; color: var(--muted); line-height: 1.6;">
        In-depth technical explainers on how telephone numbers age, move through carrier thousands-block pools, and how to recover or protect personal lines.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px; margin-bottom: 64px;">
      ${GUIDES.map(g => `
        <div class="card" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <img src="${g.image}" alt="${escapeHtml(g.title)}" style="width: 100%; height: 200px; object-fit: cover; border-bottom: 1px solid var(--card-border);">
            <div style="padding: 24px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">${escapeHtml(g.kicker)}</span>
                <span style="font-size: 12px; color: var(--faint);">${escapeHtml(g.readTime)}</span>
              </div>
              <h2 style="font-size: 21px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 12px;">
                <a href="/guides/${g.slug}" style="color: #fff;">${escapeHtml(g.title)}</a>
              </h2>
              <p style="color: var(--muted); font-size: 14px; line-height: 1.5;">
                ${escapeHtml(g.dek)}
              </p>
            </div>
          </div>
          <div style="padding: 0 24px 24px;">
            <a href="/guides/${g.slug}" style="font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
              Read Full Article &rarr;
            </a>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderGuideArticle(guide) {
  return `
    <div style="max-width: 820px; margin: 0 auto 56px;">
      <a href="/guides" style="font-size: 13px; color: var(--muted); display: inline-flex; align-items: center; gap: 6px; margin-bottom: 24px;">
        &larr; Back to all guides
      </a>

      <div style="font-size: 13px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 8px;">
        ${escapeHtml(guide.kicker)} &middot; ${escapeHtml(guide.readTime)}
      </div>

      <h1 style="font-size: 42px; font-weight: 800; color: #fff; letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 16px;">
        ${escapeHtml(guide.title)}
      </h1>

      <p style="font-size: 18px; color: #94a3b8; line-height: 1.6; margin-bottom: 32px; font-style: italic;">
        ${escapeHtml(guide.dek)}
      </p>

      <div style="border-radius: 12px; overflow: hidden; margin-bottom: 40px; border: 1px solid var(--card-border);">
        <img src="${guide.image}" alt="${escapeHtml(guide.title)}" style="width: 100%; height: auto; display: block; max-height: 420px; object-fit: cover;">
      </div>

      <div style="display: flex; flex-direction: column; gap: 32px; font-size: 16px; line-height: 1.7; color: #cbd5e1;">
        ${guide.sections.map(sec => `
          <div>
            <h2 style="font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 14px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
              ${escapeHtml(sec.heading)}
            </h2>
            ${sec.body.map(p => `<p style="margin-bottom: 14px;">${escapeHtml(p)}</p>`).join('')}
          </div>
        `).join('')}
      </div>

      <!-- Action callout -->
      <div class="card" style="margin-top: 48px; background: #0f1624; border-color: #2b3952; text-align: center; padding: 36px 24px;">
        <h3 style="font-size: 22px; color: #fff; margin-bottom: 10px;">Looking to recover or track a specific phone number?</h3>
        <p style="color: var(--muted); font-size: 14px; max-width: 580px; margin: 0 auto 20px;">
          Use our free reverse lookup engine to audit its thousands-block allocation, or subscribe to automated monitoring for instant pool return alerts.
        </p>
        <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
          <a href="/" class="btn btn-secondary">Free Number Lookup</a>
          <a href="/pricing" class="btn">View Monitoring Tiers &rarr;</a>
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
