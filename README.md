# My Old Number (myoldnumber.com)

**Reverse Phone Lookup, Number Recycling Intelligence & Scheduled Tracking Registry**

A modern, Grade-A, zero-middleware web application built purely with native Node 22 (`node:http`, `node:sqlite`, `node:crypto`).

---

## Features

- **Free Reverse Number Lookup:** Instant allocation dossiers covering all North American (+1) area codes, operating carriers (OCN), rate centers, and modeled carrier aging/quarantine states.
- **Telecom Educational Library:** In-depth technical guides explaining FCC § 52.15 recycling intervals, thousands-block pooling, 2FA security risks on abandoned lines, and number reclamation.
- **Tiered Number Monitoring:**
  - **Free ($0/mo):** Unlimited reverse lookups, full dossiers, all guides, and read-only community board access.
  - **Watcher ($5/mo):** Track 1 number with continuous daily scans and email alerts upon pool return.
  - **Member ($10/mo):** Track up to 3 numbers with 6-hour polling and full posting & discussion privileges on the message board.
  - **Pro Collector ($20/mo):** Track up to 5 numbers with priority hourly scans and full community board posting.
- **Community Message Board:** Read access open to everyone; active posting unlocked for $10 and $20 subscribers.
- **Publisher & Search Console Stack:**
  - Google AdSense Publisher: `pub-3415300754694996` (`/ads.txt` + meta tag)
  - Google Site Verification: `h-XxXsaNbfY2dWmueZFK5sQSuwXIFelBeB5ByCSWCCg`
  - Bing / MS Validate: `79AA455B3A6A870379DCB6A9DEFF026C`
  - Yandex Verification: `a1d444bd168e3c86`

---

## Zero-Middleware Architecture

- **Runtime:** Node.js 22.x+ (Zero npm dependencies required for server runtime).
- **Database:** `node:sqlite` (Native synchronous SQLite engine with WAL mode).
- **Authentication:** `node:crypto` (Scrypt password hashing and 256-bit cryptographically secure session cookies).
- **Billing:** Native HTTP calls to Stripe Checkout Sessions API (`api.stripe.com/v1/checkout/sessions`).

---

## Running Locally

```bash
# Run server
node src/server.js

# Run test suite
node --test tests/*.test.js
```
