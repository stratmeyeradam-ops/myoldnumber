// src/stripe.js — Zero-dependency Stripe Checkout using native fetch (No npm stripe SDK required)
import { db } from './db.js';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";

const TIER_AMOUNTS = {
  t5: { name: 'My Old Number - Watcher Plan ($5/mo)', cents: 500 },
  t10: { name: 'My Old Number - Member Plan ($10/mo)', cents: 1000 },
  t20: { name: 'My Old Number - Pro Collector Plan ($20/mo)', cents: 2000 }
};

export async function createCheckoutSession({ userId, userEmail, tierId, origin }) {
  const plan = TIER_AMOUNTS[tierId];
  if (!plan) throw new Error('Invalid tier: ' + tierId);

  const params = new URLSearchParams();
  params.append('mode', 'subscription');
  params.append('payment_method_types[0]', 'card');
  if (userEmail) params.append('customer_email', userEmail);
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][product_data][name]', plan.name);
  params.append('line_items[0][price_data][product_data][description]', 'Continuous phone number monitoring, aging scans, and community board access.');
  params.append('line_items[0][price_data][unit_amount]', String(plan.cents));
  params.append('line_items[0][price_data][recurring][interval]', 'month');
  params.append('line_items[0][quantity]', '1');
  if (userId) params.append('metadata[user_id]', userId);
  params.append('metadata[tier]', tierId);
  params.append('success_url', `${origin}/tracking?session_id={CHECKOUT_SESSION_ID}&success=Subscription+activated+successfully!`);
  params.append('cancel_url', `${origin}/pricing`);

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error?.message || 'Stripe API call failed');
  }

  return data.url;
}

import crypto from "node:crypto";

function verifyWebhook(rawBuffer, header, secret, toleranceSec = 300) {
  if (!secret || !header) return false;
  let t = null; const sigs = [];
  for (const piece of String(header).split(",")) {
    const [k, v] = piece.split("=");
    if (k === "t") t = Number(v);
    if (k === "v1" && v) sigs.push(v);
  }
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.`).update(rawBuffer).digest();
  return sigs.some((s) => {
    const got = Buffer.from(s, "hex");
    return got.length === expected.length && crypto.timingSafeEqual(got, expected);
  });
}

export async function handleWebhookEvent(rawBuffer, sig, secret) {
  if (secret && secret !== "whsec_test") {
    if (!verifyWebhook(rawBuffer, sig, secret)) {
      throw new Error("Invalid Stripe signature");
    }
  }
  const event = JSON.parse(rawBuffer.toString("utf8"));

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    let userId = session?.metadata?.user_id;
    const tier = session?.metadata?.tier;
    const email = (session?.customer_details?.email || session?.customer_email || "").toLowerCase().trim();

    if (!userId && email) {
      const existing = db.prepare("SELECT id FROM users WHERE lower(email) = ?").get(email);
      if (existing) {
        userId = existing.id;
      } else {
        const crypto = await import("node:crypto");
        userId = crypto.randomUUID();
        const name = session.customer_details?.name || email.split("@")[0];
        const dummyHash = crypto.createHash("sha256").update(crypto.randomBytes(32)).digest("hex");
        db.prepare(
          "INSERT INTO users (id, email, password_hash, name, tier, stripe_customer_id, stripe_sub_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).run(userId, email, dummyHash, name, tier || "t5", session.customer || "", session.subscription || "", Date.now());
        console.log("[Stripe] Auto-created user " + userId + " (" + email + ") on tier " + tier);
        try {
          db.prepare("CREATE TABLE IF NOT EXISTS password_resets (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL)").run();
          const token = crypto.randomBytes(32).toString("hex");
          db.prepare("INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)").run(token, userId, Date.now() + 86400000);
          const origin = session?.metadata?.origin || "https://myoldnumber.com";
          const link = origin + "/login?reset=" + token;
          if (process.env.RESEND_API_KEY) {
            fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: process.env.EMAIL_FROM || "My Old Number <noreply@myoldnumber.com>",
                to: [email],
                subject: "Welcome to My Old Number - Activate your membership",
                text: `Thank you for subscribing to My Old Number! Your monitoring tier is active.\n\nSet your account password here to start tracking numbers:\n${link}\n\nWelcome!`
              })
            }).catch(e => console.error("[myoldnumber] welcome mail error:", e.message));
          }
        } catch (e) {
          console.error("[myoldnumber-token-error]", e.message);
        }
      }
    }

    if (userId && tier) {
      db.prepare(
        "UPDATE users SET tier = ?, stripe_customer_id = ?, stripe_sub_id = ? WHERE id = ?"
      ).run(tier, session.customer || "", session.subscription || "", userId);
      console.log("[Stripe] Upgraded user " + userId + " to " + tier);
    }
  }

  return { received: true };
}
