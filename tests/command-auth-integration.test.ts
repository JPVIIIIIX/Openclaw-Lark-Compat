import { describe, expect, it, vi } from 'vitest';
import type { OpenClawConfig } from 'openclaw/plugin-sdk/core';
import { resolveCommandAuthorizedFromAuthorizers } from 'openclaw/plugin-sdk/command-auth-native';
import { resolveSenderCommandAuthorization } from '../src/messaging/inbound/command-auth';

// Use the real host policy and authorizer functions; no live Feishu requests.
describe('official Feishu authorization with OpenClaw 2026.10.9', () => {
  const base = {
    rawBody: '/status',
    cfg: {} as OpenClawConfig,
    isGroup: false,
    dmPolicy: 'allowlist',
    configuredAllowFrom: ['ou_owner'],
    senderId: 'ou_owner',
    channelId: 'feishu',
    conversationId: 'oc_synthetic_test',
    accountId: 'synthetic',
    isSenderAllowed: (id: string, allow: string[]) => !!id && (allow.includes(id) || allow.includes('*')),
    shouldComputeCommandAuthorized: () => true,
    resolveCommandAuthorizedFromAuthorizers,
  };

  it('allows the configured owner and rejects a stranger in direct messages', async () => {
    const readAllowFromStore = vi.fn(async () => ['ou_stranger']);
    expect((await resolveSenderCommandAuthorization({ ...base, readAllowFromStore })).commandAuthorized).toBe(true);
    expect(
      (await resolveSenderCommandAuthorization({ ...base, senderId: 'ou_stranger', readAllowFromStore }))
        .commandAuthorized,
    ).toBe(false);
    expect(readAllowFromStore).not.toHaveBeenCalled();
  });

  it('never uses direct-message pairing approvals to authorize group commands', async () => {
    const readAllowFromStore = vi.fn(async () => ['ou_stranger']);
    expect(
      (
        await resolveSenderCommandAuthorization({
          ...base,
          isGroup: true,
          dmPolicy: 'pairing',
          configuredGroupAllowFrom: [],
          senderId: 'ou_stranger',
          readAllowFromStore,
        })
      ).commandAuthorized,
    ).toBe(false);
    expect(readAllowFromStore).not.toHaveBeenCalled();
  });

  it('honors explicit group sender authorization', async () => {
    expect(
      (
        await resolveSenderCommandAuthorization({
          ...base,
          isGroup: true,
          configuredGroupAllowFrom: ['ou_group'],
          senderId: 'ou_group',
          readAllowFromStore: async () => [],
        })
      ).commandAuthorized,
    ).toBe(true);
  });

  it('rejects an empty sender even with wildcard authorization', async () => {
    expect(
      (
        await resolveSenderCommandAuthorization({
          ...base,
          configuredAllowFrom: ['*'],
          senderId: '',
          readAllowFromStore: async () => [],
        })
      ).commandAuthorized,
    ).toBe(false);
  });

  it('accepts a direct-message pairing approval in pairing mode', async () => {
    expect(
      (
        await resolveSenderCommandAuthorization({
          ...base,
          dmPolicy: 'pairing',
          configuredAllowFrom: [],
          senderId: 'ou_paired',
          readAllowFromStore: async () => ['ou_paired'],
        })
      ).commandAuthorized,
    ).toBe(true);
  });
});
