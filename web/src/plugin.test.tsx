import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./CharlieCockpitPage', () => ({
  CharlieCockpitPage: () => null,
}));

describe('charlie-cockpit library plugin registration', () => {
  beforeEach(() => {
    vi.resetModules();
    delete (window as Window & { __HERMES_PLUGINS__?: unknown }).__HERMES_PLUGINS__;
  });

  afterEach(() => {
    delete (window as Window & { __HERMES_PLUGINS__?: unknown }).__HERMES_PLUGINS__;
  });

  it('does not throw when window.__HERMES_PLUGINS__ is undefined', async () => {
    await expect(import('./plugin')).resolves.toBeDefined();
  });

  it('registers the plugin exactly once with the correct name and a non-empty component', async () => {
    const register = vi.fn();
    (window as Window & { __HERMES_PLUGINS__?: { register: typeof register } }).__HERMES_PLUGINS__ = { register };

    await import('./plugin');

    expect(register).toHaveBeenCalledTimes(1);
    const [name, component] = register.mock.calls[0];
    expect(name).toBe('charlie-cockpit');
    expect(component).toBeTruthy();
    expect(component).toEqual(expect.any(Function));
  });
});
