/**
 * Copyright (c) 2026 ByteDance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 *
 * 插件版本号管理
 *
 * 从 package.json 读取版本号并生成 User-Agent 字符串。
 */

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

/** 缓存的版本号 */
let cachedVersion: string | undefined;

/**
 * 获取插件版本号（从 package.json 读取）
 *
 * @returns 版本号字符串，如 "2026.2.28.5"；读取失败返回 "unknown"
 */
export function getPluginVersion(): string {
  if (cachedVersion) return cachedVersion;

  const moduleDir = dirname(fileURLToPath(import.meta.url));
  // 打包后位于 dist/，源码位于 src/core/；只检查这两种已知布局。
  for (const relativeRoot of ['..', '../..']) {
    try {
      const raw = readFileSync(join(moduleDir, relativeRoot, 'package.json'), 'utf8');
      const pkg = JSON.parse(raw) as { name?: string; version?: unknown };
      // 不把宿主或其他父目录包的版本误报为插件版本。
      if (pkg.name === 'openclaw-lark-compat' && typeof pkg.version === 'string' && pkg.version.trim()) {
        cachedVersion = pkg.version.trim();
        return cachedVersion;
      }
    } catch {
      // 当前候选文件不存在或无法解析时，继续检查另一个布局。
    }
  }

  cachedVersion = 'unknown';
  return cachedVersion;
}

/**
 * 获取当前运行平台名称
 *
 * @returns `mac` | `linux` | `windows`
 */
export function getPlatform(): string {
  switch (process.platform) {
    case 'darwin':
      return 'mac';
    case 'win32':
      return 'windows';
    default:
      return 'linux';
  }
}

/**
 * 生成 User-Agent 字符串
 *
 * @returns User-Agent 字符串，格式：`openclaw-lark/{version}/{platform}`
 *
 * @example
 * ```typescript
 * getUserAgent() // => "openclaw-lark/2026.2.28.5/mac"
 * ```
 */
export function getUserAgent(): string {
  return `openclaw-lark/${getPluginVersion()}/${getPlatform()}`;
}
