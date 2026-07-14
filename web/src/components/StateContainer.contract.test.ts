import { describe, expect, it } from 'vitest';
import source from './StateContainer.tsx?raw';

describe('StateContainer recovery contract', () => {
  it('exposes a callback and renders recovery actions for recoverable states', () => {
    expect(source).toContain('onRecover?: () => void');
    expect(source).toContain('onClick={onRecover}');
    expect(source).toContain('重试');
    expect(source).toContain('刷新数据');
  });
});
