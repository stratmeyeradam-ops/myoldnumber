// src/views/home.js — Grade-A high-tech hero, reverse lookup tool, dossier display, and educational grid
export function renderHomePage({ result = null, error = null }) {
  return `
    <div style="text-align: center; max-width: 840px; margin: 0 auto 48px;">
      <div style="display:inline-flex; align-items:center; gap:8px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 999px; padding: 6px 16px; margin-bottom: 20px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 10px #38bdf8;"></span>
        <span style="font-size: 13px; font-weight: 600; color: #38bdf8; letter-spacing: 0.03em; text-transform: uppercase;">NANP Allocation &amp; Aging Intelligence</span>
      </div>
      <h1 style="font-size: 46px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 18px; color: #fff;">
        Trace, Understand, and Monitor <br><span style="background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Your Old Phone Number</span>
      </h1>
      <p style="font-size: 17px; color: var(--muted); line-height: 1.6; max-width: 680px; margin: 0 auto;">
        Free reverse phone lookup across all North American area codes. Discover carrier switches, rate centers, thousands-block pooling status, and carrier recycling aging intervals.
      </p>
    </div>

    <!-- Search Form -->
    <div class="card" style="max-width: 680px; margin: 0 auto 56px; border: 1px solid #2a3449; background: #111622; box-shadow: 0 12px 36px rgba(0,0,0,0.4);">
      <form action="/lookup" method="GET" style="display: flex; gap: 12px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 260px; position: relative;">
          <input 
            type="tel" 
            name="q" 
            placeholder="Enter 10-digit number (e.g. 402-531-2040)" 
            value="${result ? result.digits : ''}" 
            required 
            style="width: 100%; background: #0b0d13; border: 1px solid #2d3748; border-radius: 8px; padding: 14px 16px; font-size: 16px; color: #fff; font-family: var(--mono); outline: none; transition: border-color 0.2s;"
            onfocus="this.style.borderColor='#38bdf8'"
            onblur="this.style.borderColor='#2d3748'"
          />
        </div>
        <button type="submit" class="btn" style="padding: 14px 28px; font-size: 15px; border-radius: 8px;">
          Lookup Dossier &rarr;
        </button>
      </form>
      ${error ? `<div style="margin-top: 14px; color: #f87171; font-size: 14px;">&bull; ${escapeHtml(error)}</div>` : ''}
      <div style="margin-top: 14px; font-size: 12px; color: var(--faint); display: flex; align-items: center; justify-content: space-between;">
        <span>Free instant lookup &middot; No account required</span>
        <span>Covers US, Canada &amp; Caribbean (+1)</span>
      </div>
    </div>

    ${result ? renderDossier(result) : ''}

    <!-- Visual Feature Highlights -->
    <div style="margin-bottom: 64px;">
      <div style="text-align: center; margin-bottom: 36px;">
        <h2 style="font-size: 28px; font-weight: 700; color: #fff; letter-spacing: -0.01em;">How Telecom Number Recycling Works</h2>
        <p style="color: var(--muted); font-size: 15px;">Numbers don't vanish when disconnected. They move through standardized regulatory workflows.</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        <div class="card" style="overflow: hidden; padding: 0;">
          <img src="/images/life-of-number.jpg" alt="Number Recycling Lifecycle" style="width: 100%; height: 180px; object-fit: cover; border-bottom: 1px solid var(--card-border);">
          <div style="padding: 24px;">
            <div style="font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">Lifecycle Intelligence</div>
            <h3 style="font-size: 20px; color: #fff; margin-bottom: 10px;">Carrier Aging Quarantines</h3>
            <p style="color: var(--muted); font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
              Under FCC § 52.15, residential and cellular numbers must age between 45 and 90 days before becoming eligible for re-assignment.
            </p>
            <a href="/guides/what-happens-to-recycled-numbers" style="font-size: 14px; font-weight: 600;">Read the Guide &rarr;</a>
          </div>
        </div>

        <div class="card" style="overflow: hidden; padding: 0;">
          <img src="/images/dialpd.jpg" alt="Thousands-Block Pooling" style="width: 100%; height: 180px; object-fit: cover; border-bottom: 1px solid var(--card-border);">
          <div style="padding: 24px;">
            <div style="font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">Architecture</div>
            <h3 style="font-size: 20px; color: #fff; margin-bottom: 10px;">Thousands-Block Pooling</h3>
            <p style="color: var(--muted); font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
              Carriers receive numbers in blocks of 1,000 (NPA-NXX-X). Tracking block ownership lets you pinpoint the exact provider holding the number.
            </p>
            <a href="/guides/nanp-allocation-and-pooling" style="font-size: 14px; font-weight: 600;">Explore Architecture &rarr;</a>
          </div>
        </div>

        <div class="card" style="overflow: hidden; padding: 0;">
          <img src="/images/esim.jpg" alt="Reclaiming a Lost Number" style="width: 100%; height: 180px; object-fit: cover; border-bottom: 1px solid var(--card-border);">
          <div style="padding: 24px;">
            <div style="font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 6px;">Recovery Playbook</div>
            <h3 style="font-size: 20px; color: #fff; margin-bottom: 10px;">Automated Number Monitoring</h3>
            <p style="color: var(--muted); font-size: 14px; line-height: 1.5; margin-bottom: 16px;">
              Subscribe to track 1, 3, or 5 numbers for $5, $10, or $20/month. We monitor pooling status and alert you the moment a line exits aging.
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
              <a href="https://buy.stripe.com/14A8wO0LJ2sF4QJeHi0kE0o" class="btn" style="padding: 8px 12px; font-size: 13px;">Watcher — $5/mo</a>
              <a href="https://buy.stripe.com/fZudR88ebffr6YR1Uw0kE0p" class="btn" style="padding: 8px 12px; font-size: 13px; background: linear-gradient(135deg, #38bdf8, #2563eb);">Member — $10/mo</a>
              <a href="https://buy.stripe.com/28E4gygKH8R3erjbv60kE0q" class="btn" style="padding: 8px 12px; font-size: 13px;">Pro — $20/mo</a>
            </div>
            <a href="/pricing" style="font-size: 14px; font-weight: 600;">Compare All Plans &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderDossier(r) {
  const isAvailable = r.status === 'available';
  const statusColor = isAvailable ? '#10b981' : (r.status === 'aging' ? '#f59e0b' : '#38bdf8');

  return `
    <div class="card" style="margin-bottom: 56px; border: 1px solid #2e3c54; background: #0f141f; position: relative; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; border-bottom: 1px solid #1e2638; padding-bottom: 20px; margin-bottom: 24px;">
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">NANP Allocation Dossier</div>
          <div style="font-size: 32px; font-weight: 800; color: #fff; font-family: var(--mono);">${escapeHtml(r.national)}</div>
          <div style="color: var(--muted); font-size: 14px; margin-top: 4px;">
            ${escapeHtml(r.city)}, ${escapeHtml(r.region)} &middot; ${escapeHtml(r.country)} &middot; Timezone: ${escapeHtml(r.timezoneAbbr || r.timezone)}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.4); padding: 8px 16px; border-radius: 8px; border: 1px solid #26334a;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${statusColor};"></span>
            <span style="font-weight: 700; color: ${statusColor}; font-size: 14px;">${escapeHtml(r.statusLabel)}</span>
          </div>
          <div style="font-size: 11px; color: var(--faint); margin-top: 6px;">Model Confidence: ${(r.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 28px;">
        <div style="background: #090c12; padding: 14px 16px; border-radius: 8px; border: 1px solid #1a2233;">
          <div style="font-size: 12px; color: var(--muted);">Operating Carrier (OCN)</div>
          <div style="font-size: 16px; font-weight: 600; color: #fff; margin-top: 4px;">${escapeHtml(r.carrier)} <span style="font-size: 12px; color: var(--faint); font-family: var(--mono);">(OCN ${escapeHtml(r.ocn)})</span></div>
          <div style="font-size: 11px; color: #38bdf8; margin-top: 2px;">MODELED LERG HOLDER</div>
        </div>

        <div style="background: #090c12; padding: 14px 16px; border-radius: 8px; border: 1px solid #1a2233;">
          <div style="font-size: 12px; color: var(--muted);">Line Type</div>
          <div style="font-size: 16px; font-weight: 600; color: #fff; margin-top: 4px;">${escapeHtml(r.lineTypeLabel)}</div>
          <div style="font-size: 11px; color: #38bdf8; margin-top: 2px;">INFERRED SPECIFICATION</div>
        </div>

        <div style="background: #090c12; padding: 14px 16px; border-radius: 8px; border: 1px solid #1a2233;">
          <div style="font-size: 12px; color: var(--muted);">Thousands-Block Pool</div>
          <div style="font-size: 16px; font-weight: 600; color: #fff; margin-top: 4px; font-family: var(--mono);">${escapeHtml(r.block)}</div>
          <div style="font-size: 11px; color: var(--good); margin-top: 2px;">EXACT CALCULATION</div>
        </div>

        <div style="background: #090c12; padding: 14px 16px; border-radius: 8px; border: 1px solid #1a2233;">
          <div style="font-size: 12px; color: var(--muted);">Rate Center &amp; LATA</div>
          <div style="font-size: 16px; font-weight: 600; color: #fff; margin-top: 4px;">${escapeHtml(r.rateCenter)} / ${escapeHtml(r.lata)}</div>
          <div style="font-size: 11px; color: var(--good); margin-top: 2px;">PUBLISHED NPA TABLE</div>
        </div>
      </div>

      <div style="background: rgba(30, 41, 59, 0.4); border-radius: 8px; padding: 18px 20px; border: 1px solid #233047; margin-bottom: 24px;">
        <div style="font-weight: 600; color: #fff; margin-bottom: 6px; font-size: 14px;">Status Summary &amp; Recommendations:</div>
        <p style="color: var(--muted); font-size: 13.5px; line-height: 1.5; margin-bottom: 12px;">${escapeHtml(r.statusDetail)}</p>
        <ul style="padding-left: 20px; font-size: 13px; color: #cbd5e1;">
          ${r.recommendations.map(rec => `<li>${escapeHtml(rec)}</li>`).join('')}
        </ul>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
        <div style="font-size: 12px; color: var(--faint);">
          Want automated alerts if this number transitions to pool-available?
        </div>
        <a href="/tracking?number=${encodeURIComponent(r.digits)}" class="btn" style="padding: 10px 20px;">
          Track This Number &rarr;
        </a>
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
