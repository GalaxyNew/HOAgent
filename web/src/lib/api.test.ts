import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

describe('trusted Dashboard host boundary', () => {
  const originalSdk = window.__HERMES_PLUGIN_SDK__;

  beforeEach(() => {
    delete window.__HERMES_PLUGIN_SDK__;
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    if (originalSdk) window.__HERMES_PLUGIN_SDK__ = originalSdk;
    else delete window.__HERMES_PLUGIN_SDK__;
    vi.unstubAllGlobals();
  });

  it('fails closed without a trusted SDK and makes zero API requests', async () => {
    await expect(api.health()).rejects.toMatchObject({
      code: 403,
      kind: 'host-unavailable',
      message: '仅支持 Hermes Dashboard 宿主访问',
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fails closed for an empty SDK object and makes zero API requests', async () => {
    window.__HERMES_PLUGIN_SDK__ = {} as typeof window.__HERMES_PLUGIN_SDK__;

    await expect(api.health()).rejects.toMatchObject({
      code: 403,
      kind: 'host-unavailable',
      message: '仅支持 Hermes Dashboard 宿主访问',
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fails closed when SDK fetchJSON is not a function and makes zero API requests', async () => {
    window.__HERMES_PLUGIN_SDK__ = { fetchJSON: null } as unknown as typeof window.__HERMES_PLUGIN_SDK__;

    await expect(api.health()).rejects.toMatchObject({
      code: 403,
      kind: 'host-unavailable',
      message: '仅支持 Hermes Dashboard 宿主访问',
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses only trusted SDK fetchJSON when it is present', async () => {
    const fetchJSON = vi.fn().mockResolvedValue({
      data: { status: 'ok', service: 'test' },
      meta: { source_ref: 'test', source_hash: '', last_synced_at: null, freshness: 'fresh' },
    });
    window.__HERMES_PLUGIN_SDK__ = { fetchJSON };

    await expect(api.health()).resolves.toMatchObject({ data: { status: 'ok' } });
    expect(fetchJSON).toHaveBeenCalledWith('/api/plugins/charlie-cockpit/v1/health');
    expect(fetch).not.toHaveBeenCalled();
  });
});
