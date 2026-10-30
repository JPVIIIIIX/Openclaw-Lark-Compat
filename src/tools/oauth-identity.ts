/** Verify the authorizing user without treating unavailable identity as a mismatch. */
export type TokenIdentity =
  | { valid: true; actualOpenId: string }
  | { valid: false; reason: 'mismatch'; actualOpenId: string }
  | { valid: false; reason: 'unavailable'; actualOpenId?: undefined };

export async function verifyTokenIdentity(
  brand: string,
  accessToken: string,
  expectedOpenId: string,
): Promise<TokenIdentity> {
  const domain = brand === 'lark' ? 'https://open.larksuite.com' : 'https://open.feishu.cn';
  for (let attempt = 0; attempt < 3; attempt++) {
    let retryable: boolean;
    try {
      const res = await fetch(`${domain}/open-apis/authen/v1/user_info`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(10_000),
      });
      const body = await res.text();
      retryable = res.status === 429 || res.status >= 500 || /ratelimit triggered/i.test(body);
      if (!retryable) {
        if (!res.ok) return { valid: false, reason: 'unavailable' };
        const data = JSON.parse(body) as { code?: number; data?: { open_id?: unknown } };
        const actualOpenId = data.data?.open_id;
        if (data.code !== 0 || typeof actualOpenId !== 'string' || !actualOpenId) {
          return { valid: false, reason: 'unavailable' };
        }
        return actualOpenId === expectedOpenId
          ? { valid: true, actualOpenId }
          : { valid: false, reason: 'mismatch', actualOpenId };
      }
    } catch {
      // Network, timeout and malformed-response failures never establish identity.
      retryable = true;
    }
    if (retryable && attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
  }
  return { valid: false, reason: 'unavailable' };
}
