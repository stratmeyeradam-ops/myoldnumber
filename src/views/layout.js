// src/views/layout.js — Grade-A high-tech responsive layout with verified AdSense and Search Console tags
export function renderLayout({ title, description, path = '/', user = null, content = '' }) {
  const currentYear = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} — My Old Number</title>
  <meta name="description" content="${escapeHtml(description || 'Free reverse phone lookup, North American numbering allocation intelligence, and automated number recycling monitoring.')}">
  <link rel="canonical" href="https://myoldnumber.com${path}">

  <!-- Search Engine & Publisher Verification Stack -->
  <meta name="google-site-verification" content="h-XxXsaNbfY2dWmueZFK5sQSuwXIFelBeB5ByCSWCCg">
  <meta name="google-adsense-account" content="ca-pub-3415300754694996">
  <meta name="msvalidate.01" content="79AA455B3A6A870379DCB6A9DEFF026C">
  <meta name="yandex-verification" content="a1d444bd168e3c86">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="My Old Number">
  <meta property="og:title" content="${escapeHtml(title)} — My Old Number">
  <meta property="og:description" content="${escapeHtml(description || "Free reverse phone lookup, North American numbering allocation intelligence, and automated number recycling monitoring.")}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)} — My Old Number">
  <meta name="twitter:description" content="${escapeHtml(description || "Free reverse phone lookup, North American numbering allocation intelligence, and automated number recycling monitoring.")}">
  <meta name="twitter:image" content="https://myoldnumber.com/images/dialpd.jpg">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"My Old Number","url":"https://myoldnumber.com","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":"https://myoldnumber.com/lookup?number={search_term_string}"},"query-input":"required name=search_term_string"}}</script>
  <meta property="og:url" content="https://myoldnumber.com${path}">
  <meta property="og:image" content="https://myoldnumber.com/images/dialpd.jpg">

  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/icon-180.png">

  <style>
    :root {
      --bg: #0b0d11;
      --card-bg: #12161f;
      --card-border: #1e2638;
      --accent: #2563eb;
      --accent-bright: #38bdf8;
      --accent-glow: rgba(56, 189, 248, 0.15);
      --text: #f1f5f9;
      --muted: #94a3b8;
      --faint: #475569;
      --good: #10b981;
      --warn: #f59e0b;
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    a { color: var(--accent-bright); text-decoration: none; transition: color 0.15s ease; }
    a:hover { color: #7dd3fc; }
    
    header {
      background: rgba(11, 13, 17, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo span {
      background: linear-gradient(135deg, #38bdf8, #2563eb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    nav { display: flex; align-items: center; gap: 24px; font-size: 14px; font-weight: 500; }
    nav a { color: var(--muted); }
    nav a:hover, nav a.active { color: #fff; }
    .btn {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      border: 1px solid #3b82f6;
      box-shadow: 0 4px 14px var(--accent-glow);
      cursor: pointer;
      display: inline-block;
      transition: all 0.2s ease;
    }
    .btn:hover { background: #1e40af; border-color: #60a5fa; color: #fff; }
    .btn-secondary {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid var(--card-border);
      box-shadow: none;
    }
    .btn-secondary:hover { background: #334155; }
    
    main { flex: 1; max-width: 1200px; margin: 0 auto; padding: 40px 20px; width: 100%; }
    
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
    
    footer {
      background: #07090d;
      border-top: 1px solid var(--card-border);
      padding: 48px 20px 32px;
      color: var(--muted);
      font-size: 13px;
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 32px;
      margin-bottom: 36px;
    }
    @media(max-width: 768px) {
      .footer-inner { grid-template-columns: 1fr; }
      nav { display: none; }
    }
    .footer-col h4 { color: #fff; font-size: 14px; margin-bottom: 14px; font-weight: 600; }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .footer-col ul a { color: var(--muted); }
    .footer-col ul a:hover { color: #fff; }
    .footer-bottom {
      max-width: 1200px;
      margin: 0 auto;
      border-top: 1px solid #171d2b;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <a href="/" class="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        <span>My Old Number</span>
      </a>
      <nav>
        <a href="/" class="${path === '/' ? 'active' : ''}">Reverse Lookup</a>
        <a href="/guides" class="${path.startsWith('/guides') ? 'active' : ''}">Guides</a>
        <a href="/tracking" class="${path.startsWith('/tracking') ? 'active' : ''}">Number Monitoring</a>
        <a href="/board" class="${path.startsWith('/board') ? 'active' : ''}">Message Board</a>
        <a href="/pricing" class="${path === '/pricing' ? 'active' : ''}">Pricing</a>
        ${user ? `
          <a href="/account" class="btn btn-secondary">Dashboard (${escapeHtml(user.tier.toUpperCase())})</a>
        ` : `
          <a href="/login" style="color:var(--text);">Sign In</a>
          <a href="/pricing" class="btn">Start Monitoring</a>
        `}
      </nav>
    </div>
  </header>

  <main>
    ${content}
  </main>

  <footer>
    <div class="footer-inner">
      <div class="footer-col">
        <h4>About My Old Number</h4>
        <p style="margin-bottom: 12px; line-height: 1.5;">North American Numbering Plan (NANP) allocation intelligence, thousands-block carrier modeling, and scheduled number monitoring. Built for individuals tracking disconnected, aging, or legacy numbers.</p>
        <p style="font-size: 11.5px; color: var(--faint);">Informational telecom reference. Carrier line statuses, aging, and OCN mappings are modeled estimates and not live carrier OSS records.</p>
      </div>
      <div class="footer-col">
        <h4>Intelligence & Tools</h4>
        <ul>
          <li><a href="/">Reverse Number Lookup</a></li>
          <li><a href="/tracking">Tracked Number Registry</a></li>
          <li><a href="/pricing">Monitoring Plans ($5, $10, $20)</a></li>
          <li><a href="/board">Community Message Board</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Guides & Education</h4>
        <ul>
          <li><a href="/guides/what-happens-to-recycled-numbers">Number Recycling Lifecycle</a></li>
          <li><a href="/guides/nanp-allocation-and-pooling">Thousands-Block Pooling</a></li>
          <li><a href="/guides/reclaiming-a-lost-number">Number Recovery Playbook</a></li>
          <li><a href="/guides/securing-accounts-linked-to-old-numbers">2FA & Abandoned Lines</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Compliance & Ethics</h4>
        <ul>
          <li><a href="/terms">Terms of Service</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/contact">Contact Support</a></li>
          <li><span style="color:var(--faint); font-family:var(--mono);">pub-3415300754694996</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div>&copy; ${currentYear} My Old Number. All rights reserved.</div>
      <div style="font-size: 12px; color: var(--faint);">Zero-Middleware Native Architecture &middot; Nanp LERG Model &middot; Powered by Node 22</div>
    </div>
  </footer>
</body>
</html>`;
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
