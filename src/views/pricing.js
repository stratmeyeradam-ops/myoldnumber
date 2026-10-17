// src/views/pricing.js — Grade-A high-tech pricing table ($5, $10, $20) with direct Stripe Checkout integration
import { TIERS } from '../lib/tiers.js';

export function renderPricingPage({ user = null }) {
  return `
    <div style="text-align: center; max-width: 800px; margin: 0 auto 56px;">
      <div style="display:inline-flex; align-items:center; gap:8px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 999px; padding: 6px 16px; margin-bottom: 20px;">
        <span style="font-size: 13px; font-weight: 600; color: #38bdf8; text-transform: uppercase;">Subscriptions &amp; Tracking Quotas</span>
      </div>
      <h1 style="font-size: 42px; font-weight: 800; color: #fff; letter-spacing: -0.02em; margin-bottom: 16px;">
        Continuous Phone Number Monitoring
      </h1>
      <p style="font-size: 16px; color: var(--muted); line-height: 1.6;">
        Choose the tracking tier that fits your needs. Monitor disconnected numbers, receive priority alerts upon pool availability, and join our telecom community message board.
      </p>
    </div>

    <!-- Pricing Cards Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; margin-bottom: 64px;">
      
      <!-- Free -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-color: #242e42;">
        <div>
          <h3 style="font-size: 20px; color: #fff; margin-bottom: 8px;">Free Tier</h3>
          <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">For instant one-off reverse lookups and research.</p>
          <div style="font-size: 38px; font-weight: 800; color: #fff; margin-bottom: 24px;">$0 <span style="font-size: 14px; font-weight: 400; color: var(--muted);">/month</span></div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 13.5px; color: #cbd5e1; margin-bottom: 32px;">
            <li>&check; Unlimited reverse number lookups</li>
            <li>&check; Full NANP allocation dossiers</li>
            <li>&check; Access to all telecom guides</li>
            <li>&check; Read-only message board access</li>
            <li style="color: var(--faint);">&times; Automated number tracking</li>
            <li style="color: var(--faint);">&times; Community board posting</li>
          </ul>
        </div>
        <a href="/" class="btn btn-secondary" style="text-align: center; width: 100%;">Use Free Lookup</a>
      </div>

      <!-- $5 Watcher -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-color: #242e42;">
        <div>
          <h3 style="font-size: 20px; color: #fff; margin-bottom: 8px;">Watcher</h3>
          <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">For recovering a single specific personal number.</p>
          <div style="font-size: 38px; font-weight: 800; color: #fff; margin-bottom: 24px;">$5 <span style="font-size: 14px; font-weight: 400; color: var(--muted);">/month</span></div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 13.5px; color: #cbd5e1; margin-bottom: 32px;">
            <li style="font-weight: 600; color: #38bdf8;">&check; Track 1 active phone number</li>
            <li>&check; Daily automated aging &amp; pool scans</li>
            <li>&check; Instant email alert on status changes</li>
            <li>&check; Unlimited reverse lookups</li>
            <li>&check; Read-only message board access</li>
            <li style="color: var(--faint);">&times; Community board posting</li>
          </ul>
        </div>
        <a href="https://buy.stripe.com/14A8wO0LJ2sF4QJeHi0kE0o" class="btn" style="width: 100%; text-align: center; display: inline-block;">Subscribe for $5/mo</a>
      </div>

      <!-- $10 Member (Featured) -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #38bdf8; position: relative; background: #131a29; box-shadow: 0 16px 36px rgba(56, 189, 248, 0.15);">
        <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #2563eb; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 3px 12px; border-radius: 999px; letter-spacing: 0.05em;">Most Popular</div>
        <div>
          <h3 style="font-size: 20px; color: #fff; margin-bottom: 8px;">Member</h3>
          <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">Multiple numbers + full community access.</p>
          <div style="font-size: 38px; font-weight: 800; color: #fff; margin-bottom: 24px;">$10 <span style="font-size: 14px; font-weight: 400; color: var(--muted);">/month</span></div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 13.5px; color: #cbd5e1; margin-bottom: 32px;">
            <li style="font-weight: 600; color: #38bdf8;">&check; Track up to 3 numbers simultaneously</li>
            <li>&check; 6-hour polling schedule</li>
            <li style="font-weight: 600; color: #10b981;">&check; Full Message Board posting &amp; replies</li>
            <li>&check; Instant email change notifications</li>
            <li>&check; Unlimited reverse lookups</li>
          </ul>
        </div>
        <a href="https://buy.stripe.com/fZudR88ebffr6YR1Uw0kE0p" class="btn" style="width: 100%; text-align: center; display: inline-block; background: linear-gradient(135deg, #38bdf8, #2563eb);">Subscribe for $10/mo</a>
      </div>

      <!-- $20 Pro Collector -->
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-color: #242e42;">
        <div>
          <h3 style="font-size: 20px; color: #fff; margin-bottom: 8px;">Pro Collector</h3>
          <p style="font-size: 13px; color: var(--muted); margin-bottom: 20px;">For collectors, vanity lines, and high-priority monitoring.</p>
          <div style="font-size: 38px; font-weight: 800; color: #fff; margin-bottom: 24px;">$20 <span style="font-size: 14px; font-weight: 400; color: var(--muted);">/month</span></div>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 12px; font-size: 13.5px; color: #cbd5e1; margin-bottom: 32px;">
            <li style="font-weight: 600; color: #38bdf8;">&check; Track up to 5 numbers simultaneously</li>
            <li>&check; Priority hourly scan queue</li>
            <li>&check; Full Message Board posting &amp; replies</li>
            <li>&check; Direct carrier OCN concierge guidance</li>
            <li>&check; Priority customer support</li>
          </ul>
        </div>
        <a href="https://buy.stripe.com/28E4gygKH8R3erjbv60kE0q" class="btn" style="width: 100%; text-align: center; display: inline-block;">Subscribe for $20/mo</a>
      </div>

    </div>

    <!-- Assurance Band -->
    <div class="card" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; background: #0c1017;">
      <div>
        <h4 style="color: #fff; font-size: 16px; margin-bottom: 4px;">Zero-Lock In &middot; Cancel Anytime</h4>
        <p style="color: var(--muted); font-size: 13px;">Manage your subscription directly with one-click cancellation via Stripe Customer Portal.</p>
      </div>
      <div style="display: flex; gap: 16px;">
        <span style="font-size: 12px; color: var(--faint); font-family: var(--mono);">&bull; 256-Bit SSL Encrypted</span>
        <span style="font-size: 12px; color: var(--faint); font-family: var(--mono);">&bull; Real-Time Webhooks</span>
      </div>
    </div>
  `;
}
