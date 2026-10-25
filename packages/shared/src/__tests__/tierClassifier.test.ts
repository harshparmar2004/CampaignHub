import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { computeContactTier } from '../utils/tierClassifier.js';

describe('computeContactTier logic', () => {
  test('should classify as lead when contact has 0 parties and no spend', () => {
    const tier = computeContactTier({
      tags: ['Guest'],
      parties_attended: 0,
      total_spend_inr: 0,
    });
    assert.equal(tier, 'lead');
  });

  test('should classify as regular when contact has attended 1 party', () => {
    assert.equal(computeContactTier({ parties_attended: 1 }), 'regular');
  });

  test('should classify as vip when contact has attended 2 or more parties (repeat attendee)', () => {
    assert.equal(computeContactTier({ parties_attended: 2 }), 'vip');
    assert.equal(computeContactTier({ parties_attended: 3 }), 'vip');
    assert.equal(computeContactTier({ parties_attended: 7 }), 'vip');
  });

  test('should classify as vip when spend >= 3000', () => {
    assert.equal(computeContactTier({ parties_attended: 0, total_spend_inr: 3000 }), 'vip');
    assert.equal(computeContactTier({ parties_attended: 1, total_spend_inr: 12000 }), 'vip');
  });

  test('should classify as vip if explicitly tagged VIP or VVIP regardless of attendance', () => {
    assert.equal(computeContactTier({ tags: ['vip'], parties_attended: 0 }), 'vip');
    assert.equal(computeContactTier({ tags: ['VVIP', 'Investor'], parties_attended: 0 }), 'vip');
  });

  test('should classify as inactive if contact is unsubscribed', () => {
    assert.equal(
      computeContactTier({
        unsubscribed: true,
        tags: ['VIP'],
        parties_attended: 10,
      }),
      'inactive'
    );
  });
});
