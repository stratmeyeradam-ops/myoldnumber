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
  params.append('customer_email', userEmail);
  params.append('line_items[0][price_data][currency]', 'usd');
  params.append('line_items[0][price_data][product_data][name]', plan.name);
  params.append('line_items[0][price_data][product_data][description]', 'Continuous phone number monitoring, aging scans, and community board access.');
  params.append('line_items[0][price_data][unit_amount]', String(plan.cents));
  params.append('line_items[0][price_data][recurring][interval]', 'month');
  params.append('line_items[0][quantity]', '1');
  params.append('metadata[user_id]', userId);
  params.append('metadata[tier]', tierId);
  params.append('success_url', `${origin}/tracking?success=Subscription+activated+successfully!`);
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

export async function handleWebhookEvent(rawBody, sig, secret) {
  // Simple payload parsing for native webhook handling
  const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object;
    const userId = session?.metadata?.user_id;
    const tier = session?.metadata?.tier;
    if (userId && tier) {
      db.prepare(`
        UPDATE users 
        SET tier = ?, stripe_customer_id = ?, stripe_sub_id = ?
        WHERE id = ?
      `).run(tier, session.customer || '', session.subscription || '', userId);
      console.log(`[Stripe] Upgraded user ${userId} to ${tier}`);
    }
  }

  return { received: true };
}
