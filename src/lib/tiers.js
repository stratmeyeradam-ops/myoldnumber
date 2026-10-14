// src/lib/tiers.js — Clean subscription tier definitions & limits
export const TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceCents: 0,
    trackLimit: 0,
    canReadBoard: true,
    canPostBoard: false,
    pollFrequency: 'None',
    description: 'Unlimited reverse lookup, full allocation dossiers, and read access to all guides & community discussions.'
  },
  t5: {
    id: 't5',
    name: 'Watcher ($5/mo)',
    price: 5,
    priceCents: 500,
    trackLimit: 1,
    canReadBoard: true,
    canPostBoard: false,
    pollFrequency: 'Daily',
    description: 'Track 1 phone number continuously with daily status checks and email alerts upon pool return.'
  },
  t10: {
    id: 't10',
    name: 'Member ($10/mo)',
    price: 10,
    priceCents: 1000,
    trackLimit: 3,
    canReadBoard: true,
    canPostBoard: true,
    pollFrequency: 'Every 6 Hours',
    description: 'Track up to 3 numbers with frequent polling and full posting & discussion access on the message board.'
  },
  t20: {
    id: 't20',
    name: 'Pro Collector ($20/mo)',
    price: 20,
    priceCents: 2000,
    trackLimit: 5,
    canReadBoard: true,
    canPostBoard: true,
    pollFrequency: 'Hourly Priority',
    description: 'Track up to 5 numbers with priority hourly scans, priority email notifications, and community posting privileges.'
  }
};

export function getTier(tierId) {
  return TIERS[tierId] || TIERS.free;
}
