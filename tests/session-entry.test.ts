import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ read: vi.fn(), defaultAgent: vi.fn() }));
vi.mock('openclaw/plugin-sdk/session-store-runtime', () => ({
  getSessionEntryAsync: mocks.read,
  resolveStorePath: (store: string | undefined, opts: { agentId: string }) =>
    (store ?? '/synthetic/{agentId}/sessions').replace('{agentId}', opts.agentId),
}));
vi.mock('openclaw/plugin-sdk/agent-runtime', () => ({ resolveDefaultAgentId: mocks.defaultAgent }));
import { readFeishuSessionEntry } from '../src/core/session-entry';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.defaultAgent.mockReturnValue('main');
});
describe('scoped SDK session metadata', () => {
  it('reads the routed agent with latest consistency and normalized identity', async () => {
    mocks.read.mockResolvedValue({ verboseLevel: 'full' });
    expect(await readFeishuSessionEntry({}, 'hr', ' AGENT:HR:chat ')).toEqual({ verboseLevel: 'full' });
    expect(mocks.read).toHaveBeenCalledExactlyOnceWith({
      agentId: 'hr',
      sessionKey: 'agent:hr:chat',
      storePath: '/synthetic/hr/sessions',
      readConsistency: 'latest',
    });
  });
  it('resolves the legacy fallback in its own agent store', async () => {
    mocks.read.mockResolvedValueOnce(undefined).mockResolvedValueOnce({ model: 'synthetic-model', inputTokens: 12 });
    expect(await readFeishuSessionEntry({}, 'hr', 'agent:hr:chat')).toEqual({
      model: 'synthetic-model',
      inputTokens: 12,
    });
    expect(mocks.read).toHaveBeenLastCalledWith({
      agentId: 'main',
      sessionKey: 'agent:main:chat',
      storePath: '/synthetic/main/sessions',
      readConsistency: 'latest',
    });
  });
  it('still reads explicit agents when the host has no default agent', async () => {
    mocks.defaultAgent.mockImplementation(() => {
      throw new Error('AgentSelectionRequired');
    });
    mocks.read.mockResolvedValue({ model: 'synthetic-model' });
    expect(await readFeishuSessionEntry({}, 'hr', 'agent:hr:chat')).toEqual({ model: 'synthetic-model' });
    expect(mocks.read).toHaveBeenCalledOnce();
  });
  it('degrades to absent display metadata if the store cannot be read', async () => {
    mocks.read.mockRejectedValue(new Error('synthetic read failure'));
    expect(await readFeishuSessionEntry({}, 'main', 'agent:main:chat')).toBeUndefined();
  });
});
