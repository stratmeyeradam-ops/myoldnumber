import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupNumber, digitsOnly } from '../src/lib/nanp/lookup.js';
import { getTier, TIERS } from '../src/lib/tiers.js';
import { hashPassword, verifyPassword } from '../src/auth.js';
import { GUIDES } from '../src/lib/guides.js';

test('NANP digits normalization', () => {
  assert.equal(digitsOnly('(402) 531-2040'), '4025312040');
  assert.equal(digitsOnly('+1 402-531-2040'), '4025312040');
  assert.equal(digitsOnly('1-402-531-2040'), '4025312040');
});

test('NANP reverse lookup returns authentic allocation data', () => {
  const result = lookupNumber('4025312040');
  assert.equal(result.valid, true);
  assert.equal(result.national, '(402) 531-2040');
  assert.equal(result.city, 'Omaha');
  assert.equal(result.region, 'NE');
  assert.equal(result.country, 'United States');
  assert.equal(result.rateCenter, 'OMAHA');
  assert.ok(result.carrier.length > 0);
  assert.ok(result.block.startsWith('402-531'));
});

test('Tier quotas and message board access rules', () => {
  assert.equal(TIERS.free.trackLimit, 0);
  assert.equal(TIERS.free.canPostBoard, false);

  assert.equal(TIERS.t5.trackLimit, 1);
  assert.equal(TIERS.t5.canPostBoard, false);

  assert.equal(TIERS.t10.trackLimit, 3);
  assert.equal(TIERS.t10.canPostBoard, true);

  assert.equal(TIERS.t20.trackLimit, 5);
  assert.equal(TIERS.t20.canPostBoard, true);
});

test('Native password hashing and verification', () => {
  const hash = hashPassword('SecretPass123!');
  assert.equal(verifyPassword('SecretPass123!', hash), true);
  assert.equal(verifyPassword('WrongPass', hash), false);
});

test('Guides directory completeness', () => {
  assert.ok(GUIDES.length >= 4);
  for (const g of GUIDES) {
    assert.ok(g.slug);
    assert.ok(g.title);
    assert.ok(g.image);
    assert.ok(g.sections.length > 0);
  }
});
