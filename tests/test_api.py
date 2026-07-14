from fastapi.testclient import TestClient
from cockpit.app import create_app
from cockpit.db import connect

def test_readonly_endpoints_return_real_meta(tmp_path):
    """Standalone app (no auth) — all read endpoints return real JSON with meta."""
    db = tmp_path / 'ops.db'
    client = TestClient(create_app(db))

    for path in ('health', 'tasks', 'agents', 'business/entities', 'business/relationships', 'audit', 'search?q=Charlie'):
        r = client.get('/api/plugins/charlie-cockpit/v1/' + path)
        assert r.status_code == 200
        body = r.json()
        assert body['meta']['request_id']
        assert 'freshness' in body['meta']
        assert 'database' not in body['data']

    # POST → 405 (read-only)
    assert client.post('/api/plugins/charlie-cockpit/v1/tasks').status_code == 405

    # Stale freshness detection
    conn = connect(db)
    conn.execute("INSERT INTO source_cursor VALUES ('s1','test','safe://s1','hash1','2026-01-01T00:00:00Z','stale')")
    conn.close()
    body = client.get('/api/plugins/charlie-cockpit/v1/health').json()
    assert body['meta']['freshness'] == 'stale'
    assert body['meta']['last_synced_at'] == '2026-01-01T00:00:00Z'

def test_unknown_freshness_returns_unknown(tmp_path):
    """sync_state='unknown' maps to freshness='unknown' in API meta."""
    db = tmp_path / 'ops.db'
    client = TestClient(create_app(db))
    conn = connect(db)
    conn.execute("INSERT INTO source_cursor VALUES ('s2','test','safe://s2','hash2','2026-01-01T00:00:00Z','unknown')")
    conn.close()
    body = client.get('/api/plugins/charlie-cockpit/v1/health').json()
    assert body['meta']['freshness'] == 'unknown'
    assert body['meta']['last_synced_at'] == '2026-01-01T00:00:00Z'

def test_no_auth_logic_in_app():
    """Verify the standalone app has zero auth dependencies or token logic."""
    import inspect
    from dashboard import plugin_api
    source = inspect.getsource(plugin_api)
    # No token, scope, Authorization, or Bearer in production plugin code
    assert 'DEFAULT_DEV_TOKEN' not in source
    assert 'require_read_scope' not in source
    assert '_load_token_scopes' not in source
    assert 'CHARLIE_COCKPIT_TOKEN_SCOPES' not in source
    assert 'CHARLIE_COCKPIT_READ_TOKEN' not in source
    # No Depends() auth gate
    from fastapi import Depends
    router = plugin_api.build_plugin_router()
    for route in router.routes:
        deps = getattr(route, 'dependencies', [])
        assert len(deps) == 0, f"Route {route.path} has unexpected dependencies"
