import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyTokenIdentity } from '../src/tools/oauth-identity';
import { buildAuthIdentityUnavailableCard } from '../src/tools/oauth-cards';
const response = (id: string) => new Response(JSON.stringify({ code: 0, data: { open_id: id } }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
describe('OAuth identity verification', () => {
  it('accepts only the expected identity', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response('expected')));
    expect(await verifyTokenIdentity('feishu', 'secret', 'expected')).toEqual({
      valid: true,
      actualOpenId: 'expected',
    });
  });
  it('distinguishes a confirmed different account', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response('other')));
    expect(await verifyTokenIdentity('feishu', 'secret', 'expected')).toEqual({
      valid: false,
      reason: 'mismatch',
      actualOpenId: 'other',
    });
  });
  it('retries a plain-text rate limit and verifies the recovered identity', async () => {
    vi.useFakeTimers();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('ratelimit triggered'))
      .mockResolvedValueOnce(response('expected'));
    vi.stubGlobal('fetch', fetch);
    const result = verifyTokenIdentity('feishu', 'secret', 'expected');
    await vi.runAllTimersAsync();
    expect((await result).valid).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('fails closed after bounded retries without claiming mismatch', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockImplementation(async () => new Response('ratelimit triggered', { status: 429 }));
    vi.stubGlobal('fetch', fetch);
    const result = verifyTokenIdentity('feishu', 'secret', 'expected');
    await vi.runAllTimersAsync();
    expect(await result).toEqual({ valid: false, reason: 'unavailable' });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('does not accept a missing identity', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{"code":0,"data":{}}')));
    expect(await verifyTokenIdentity('feishu', 'secret', 'expected')).toEqual({ valid: false, reason: 'unavailable' });
  });
  it('shows an actionable unavailable message', () => {
    expect(JSON.stringify(buildAuthIdentityUnavailableCard())).toContain('本次授权未保存');
  });
});
