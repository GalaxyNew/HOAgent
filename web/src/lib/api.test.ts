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

  it('allows a request only when a trusted SDK is present', async () => {
    window.__HERMES_PLUGIN_SDK__ = {};
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({
      data: { status: 'ok', service: 'test' },
      meta: { source_ref: 'test', source_hash: '', last_synced_at: null, freshness: 'fresh' },
    }), { status: 200 }));

    await expect(api.health()).resolves.toMatchObject({ data: { status: 'ok' } });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
