import { describe, expect, it } from 'vitest';
import { getFreshnessConfig } from './freshness';

describe('SourceMeta freshness contract', () => {
  it('renders an unknown freshness state as 未知 rather than 空', () => {
    const config = getFreshnessConfig('unknown');

    expect(config.label).toBe('未知');
    expect(config.label).not.toBe('空');
  });
});
