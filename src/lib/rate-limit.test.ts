import { beforeEach, describe, expect, it } from 'vitest';

import { checkRateLimit, clearExpiredEntries, resetRateLimit } from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(async () => {
    await resetRateLimit('test@example.com');
    await resetRateLimit('other@example.com');
  });

  it('allows first attempt', async () => {
    const result = await checkRateLimit('test@example.com');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks after 5 attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit('test@example.com');
    }
    const result = await checkRateLimit('test@example.com');
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('tracks identifiers independently', async () => {
    for (let i = 0; i < 4; i++) {
      await checkRateLimit('test@example.com');
    }
    const other = await checkRateLimit('other@example.com');
    expect(other.allowed).toBe(true);
    expect(other.remaining).toBe(4);
  });

  it('resets after successful login', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit('test@example.com');
    }
    await resetRateLimit('test@example.com');
    const result = await checkRateLimit('test@example.com');
    expect(result.remaining).toBe(4);
  });
});

describe('clearExpiredEntries', () => {
  it('does not throw', () => {
    expect(() => clearExpiredEntries()).not.toThrow();
  });
});

describe('checkRateLimit with custom namespace', () => {
  beforeEach(async () => {
    await resetRateLimit('user@test.com', 'password-reset');
    await resetRateLimit('user@test.com', 'login');
  });

  it('tracks namespaces independently', async () => {
    for (let i = 0; i < 5; i++) {
      await checkRateLimit('user@test.com', 'login');
    }
    const result = await checkRateLimit('user@test.com', 'password-reset');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('resets namespace-specific entries', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit('user@test.com', 'password-reset');
    }
    await resetRateLimit('user@test.com', 'password-reset');
    const result = await checkRateLimit('user@test.com', 'password-reset');
    expect(result.remaining).toBe(4);
  });
});

describe('checkRateLimit with custom config', () => {
  beforeEach(async () => {
    await resetRateLimit('custom@test.com', 'test-custom');
  });

  it('respects custom maxAttempts', async () => {
    for (let i = 0; i < 3; i++) {
      await checkRateLimit('custom@test.com', 'test-custom', { maxAttempts: 3 });
    }
    const result = await checkRateLimit('custom@test.com', 'test-custom', { maxAttempts: 3 });
    expect(result.allowed).toBe(false);
  });

  it('respects custom windowMs', async () => {
    const result = await checkRateLimit('custom@test.com', 'test-custom', {
      maxAttempts: 10,
      windowMs: 50,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9);
  });
});
