import { describe, expect, it } from 'vitest';
import pluginSource from './plugin.tsx?raw';

describe('Dashboard plugin registration contract', () => {
  it('uses the Hermes registry rather than the legacy global', () => {
    expect(pluginSource).toContain('window.__HERMES_PLUGINS__.register');
    expect(pluginSource).not.toContain('window.HERMES_PLUGINS');
  });
});
