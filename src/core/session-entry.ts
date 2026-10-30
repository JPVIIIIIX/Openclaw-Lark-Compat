/**
 * Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 *
 * Read scoped session metadata through the host SDK, independent of storage format.
 */
import type { OpenClawConfig } from 'openclaw/plugin-sdk/core';
import { resolveDefaultAgentId } from 'openclaw/plugin-sdk/agent-runtime';
import { getSessionEntryAsync, resolveStorePath } from 'openclaw/plugin-sdk/session-store-runtime';
import { larkLogger } from './lark-logger';

const log = larkLogger('session-entry');

export async function readFeishuSessionEntry(
  cfg: OpenClawConfig,
  agentId: string,
  sessionKey: string,
): Promise<Record<string, unknown> | undefined> {
  const key = sessionKey.trim().toLowerCase();
  const candidates = [{ agentId, sessionKey: key }];
  // Preserve the official plugin's legacy default-agent key fallback. Explicit
  // multi-agent setups may have no default; the routed agent still works then.
  try {
    const defaultAgentId = resolveDefaultAgentId(cfg);
    const fallbackKey = key.replace(/^(agent):[^:]+:/, `$1:${defaultAgentId}:`);
    if (fallbackKey !== key) candidates.push({ agentId: defaultAgentId, sessionKey: fallbackKey });
  } catch {
    // The primary lookup does not require a default agent.
  }

  const configured = cfg as { session?: { store?: string }; sessions?: { store?: string } };
  const store = configured.session?.store ?? configured.sessions?.store;
  for (const candidate of candidates) {
    try {
      const entry = await getSessionEntryAsync({
        ...candidate,
        storePath: resolveStorePath(store, { agentId: candidate.agentId }),
        readConsistency: 'latest',
      });
      if (entry) return entry as unknown as Record<string, unknown>;
    } catch (error) {
      log.warn('session metadata read failed', { agentId: candidate.agentId, error: String(error) });
    }
  }
  return undefined;
}
