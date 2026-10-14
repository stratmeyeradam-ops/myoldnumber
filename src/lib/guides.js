// src/lib/guides.js — Definitive educational guides on telephone numbering, recycling & carrier aging
export const GUIDES = [
  {
    slug: 'what-happens-to-recycled-numbers',
    title: 'The Lifecycle of a Disconnected Phone Number',
    image: '/images/life-of-number.jpg',
    kicker: 'Number Lifecycle',
    dek: 'When you let a number go, where does it actually go? From carrier aging quarantine to thousands-block pools.',
    readTime: '6 min read',
    sections: [
      {
        heading: '1. The Immediate Disconnect',
        body: [
          'When you cancel service or port out, the switch removes the subscriber routing entry. Calls to the number immediately hit a intercept tone ("The number you have dialed is no longer in service").',
          'At this point, the number is not dead. It enters a federally mandated and carrier-enforced quarantine interval known as aging.'
        ]
      },
      {
        heading: '2. The Aging Quarantine (45–90 Days)',
        body: [
          'Under FCC numbering rules (47 CFR § 52.15), carriers are permitted to hold a residential or wireless number in aging status for up to 90 days. For commercial or business lines, this window can extend up to 365 days under specific tariff filings.',
          'The purpose of aging is collision mitigation: clearing residual spam, automated debt collection calls, and errant two-factor authentication SMS messages so they do not instantly harass the next assignee.'
        ]
      },
      {
        heading: '3. Return to the Provider Inventory or Pool',
        body: [
          'Once the aging clock expires, if the thousands-block (NPA-NXX-X) is retained by the operating company (OCN), the number returns to the carrier’s general unassigned inventory pool to be handed out to the next customer who activates a SIM card or eSIM.',
          'If the entire block was donated back to Somos / Pooling Administration, the block may be reassigned to an entirely different competitive local exchange carrier (CLEC) or wireless provider.'
        ]
      }
    ]
  },
  {
    slug: 'nanp-allocation-and-pooling',
    title: 'Thousands-Block Pooling & Rate Center Architecture',
    image: '/images/dialpd.jpg',
    kicker: 'Telecom Architecture',
    dek: 'How NANPA, Somos, and LERG rate centers determine who controls a block of 1,000 phone numbers.',
    readTime: '8 min read',
    sections: [
      {
        heading: 'The 10-Digit Hierarchy',
        body: [
          'North American phone numbers follow the format NPA-NXX-XXXX. The NPA is the Area Code (3 digits). The NXX is the Central Office switch code (3 digits). The remaining 4 digits represent the individual line.',
          'Historically, a carrier wanting to serve even one subscriber in a town was assigned an entire NXX — 10,000 numbers at once. This created massive artificial number exhaustion in the 1990s.'
        ]
      },
      {
        heading: 'Thousands-Block Pooling',
        body: [
          'Under modern pooling rules, NXX blocks are divided into ten 1,000-number blocks (NPA-NXX-0 through NPA-NXX-9). Block holders are designated in the Local Exchange Routing Guide (LERG).',
          'When monitoring an old number for re-acquisition, identifying the OCN (Operating Company Number) of the specific thousands-block is the single most critical step in knowing which carrier will eventually re-issue it.'
        ]
      }
    ]
  },
  {
    slug: 'reclaiming-a-lost-number',
    title: 'Practical Strategies for Reclaiming an Old Number',
    image: '/images/esim.jpg',
    kicker: 'Recovery Playbook',
    dek: 'Actionable steps to track when a number exits aging and the exact methods to request it from the block holder.',
    readTime: '7 min read',
    sections: [
      {
        heading: 'Check Current Status First',
        body: [
          'Before attempting recovery, run a reverse lookup on My Old Number to determine whether the line is active, in carrier quarantine (aging), or in the unassigned pool.',
          'If the number is in active service with another individual, direct carrier re-assignment is impossible without a voluntary private transfer or purchase agreement.'
        ]
      },
      {
        heading: 'Timing the Re-Assignment Window',
        body: [
          'When an aging number transitions to pool-available, many carriers allow custom number selection during new prepaid or postpaid SIM/eSIM activation if you specify the rate center and exact digits.',
          'Subscribers on our $5, $10, and $20 tracking tiers receive priority notifications the moment a modeled status changes, allowing them to initiate provider outreach immediately.'
        ]
      }
    ]
  },
  {
    slug: 'securing-accounts-linked-to-old-numbers',
    title: 'Security Risks: Two-Factor Authentication on Abandoned Numbers',
    image: '/images/sim-tray.jpg',
    kicker: 'Account Security',
    dek: 'Why leaving an old phone number attached to email, banking, or crypto accounts invites catastrophic takeover.',
    readTime: '5 min read',
    sections: [
      {
        heading: 'The Zombie 2FA Vulnerability',
        body: [
          'Over 60% of people who change phone numbers forget to remove the old number from at least one critical web account. When that number is recycled and assigned to a stranger months later, that stranger can initiate SMS password resets on services like PayPal, Venmo, or Apple ID.',
          'Always audit password managers and service profiles before discontinuing any cellular line.'
        ]
      }
    ]
  }
];

export function getGuideBySlug(slug) {
  return GUIDES.find(g => g.slug === slug);
}
