import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateShippingFee,
  isValidBDPhone,
  normalizeBDPhone,
  formatBDT,
  BANGLADESH_DIVISIONS
} from '@skincare/shared';

describe('Bangladesh Localization Utilities', () => {
  it('should validate Bangladeshi mobile phone numbers correctly', () => {
    assert.strictEqual(isValidBDPhone('01712345678'), true);
    assert.strictEqual(isValidBDPhone('+8801712345678'), true);
    assert.strictEqual(isValidBDPhone('8801812345678'), true);
    assert.strictEqual(isValidBDPhone('01912345678'), true);
    assert.strictEqual(isValidBDPhone('01312345678'), true);

    // Invalid numbers
    assert.strictEqual(isValidBDPhone('01212345678'), false); // invalid operator code
    assert.strictEqual(isValidBDPhone('123456'), false);
    assert.strictEqual(isValidBDPhone('0171234567890'), false); // too long
  });

  it('should normalize Bangladeshi phone numbers to international standard +880', () => {
    assert.strictEqual(normalizeBDPhone('01712345678'), '+8801712345678');
    assert.strictEqual(normalizeBDPhone('+8801712345678'), '+8801712345678');
    assert.strictEqual(normalizeBDPhone('8801812345678'), '+8801812345678');
  });

  it('should calculate accurate delivery fees based on geographic district in Bangladesh', () => {
    // Inside Dhaka standard: ৳60
    assert.strictEqual(calculateShippingFee('dhaka-city', 1000, false), 60);

    // Outside Dhaka (Chittagong, Sylhet, Rajshahi, etc.): ৳120
    assert.strictEqual(calculateShippingFee('chittagong-sadar', 1000, false), 120);
    assert.strictEqual(calculateShippingFee('sylhet-sadar', 1500, false), 120);

    // Free delivery threshold: ৳2,500
    assert.strictEqual(calculateShippingFee('dhaka-city', 2500, false), 0);
    assert.strictEqual(calculateShippingFee('chittagong-sadar', 3000, false), 0);

    // Express priority inside Dhaka (+৳80) -> ৳140
    assert.strictEqual(calculateShippingFee('dhaka-city', 1000, true), 140);
  });

  it('should format Bangladeshi Taka (৳ BDT) with commas', () => {
    assert.strictEqual(formatBDT(1350), '৳1,350');
    assert.strictEqual(formatBDT(750), '৳750');
    assert.strictEqual(formatBDT(25000), '৳25,000');
  });

  it('should contain all 8 divisions and 64 districts in Bangladesh geography dataset', () => {
    assert.strictEqual(BANGLADESH_DIVISIONS.length, 8);
    const totalDistricts = BANGLADESH_DIVISIONS.reduce((acc, div) => acc + div.districts.length, 0);
    assert.strictEqual(totalDistricts, 64);
  });
});
