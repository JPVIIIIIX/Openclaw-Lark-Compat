import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { afterEach, describe, expect, it } from 'vitest';

const source = readFileSync(new URL('../src/core/version.ts', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const roots: string[] = [];

function runVersionFixture(layout: 'source' | 'dist', metadata?: unknown, parentMetadata?: unknown): string[] {
  const outer = mkdtempSync(join(tmpdir(), 'lark-version-'));
  roots.push(outer);
  const root = join(outer, 'plugin');
  const modulePath = join(root, layout === 'source' ? 'src/core/version.mjs' : 'dist/version.mjs');
  mkdirSync(dirname(modulePath), { recursive: true });
  writeFileSync(
    modulePath,
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2023 },
    }).outputText,
  );
  if (metadata !== undefined) writeFileSync(join(root, 'package.json'), JSON.stringify(metadata));
  if (parentMetadata !== undefined) writeFileSync(join(outer, 'package.json'), JSON.stringify(parentMetadata));

  // 使用独立 Node 进程运行实际 ESM 文件，验证 import.meta.url 和缓存行为。
  const runner = join(outer, 'check.mjs');
  writeFileSync(
    runner,
    `import { getPluginVersion, getUserAgent } from ${JSON.stringify(modulePath)};\n` +
      'console.log(JSON.stringify([getPluginVersion(), getPluginVersion(), getUserAgent()]));\n',
  );
  return JSON.parse(execFileSync(process.execPath, [runner], { encoding: 'utf8' }));
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('plugin version metadata', () => {
  it.each(['source', 'dist'] as const)('reads the plugin package in the %s layout', (layout) => {
    const result = runVersionFixture(layout, packageJson, { name: 'host', version: '99.0.0' });
    expect(result.slice(0, 2)).toEqual([packageJson.version, packageJson.version]);
    expect(result[2].startsWith(`openclaw-lark/${packageJson.version}/`)).toBe(true);
  });

  it('does not report a parent host version when plugin metadata is missing', () => {
    expect(runVersionFixture('dist', undefined, { name: 'host', version: '99.0.0' }).slice(0, 2)).toEqual([
      'unknown',
      'unknown',
    ]);
  });

  it('rejects a non-string plugin version', () => {
    expect(runVersionFixture('dist', { name: packageJson.name, version: 123 })[0]).toBe('unknown');
  });
});
