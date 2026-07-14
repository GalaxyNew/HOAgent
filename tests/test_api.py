import cockpit.app as appmod
from fastapi.testclient import TestClient
from cockpit.app import DEFAULT_DEV_TOKEN, READ_SCOPE, create_app
from cockpit.db import connect

def headers():
    return {'authorization': f'Bearer {DEFAULT_DEV_TOKEN}'}

def test_readonly_endpoints_authorize_and_have_real_meta(tmp_path, monkeypatch):
    # Clear any token env so the default dev token kicks in
    monkeypatch.delenv('CHARLIE_COCKPIT_TOKEN_SCOPES', raising=False)
    monkeypatch.delenv('CHARLIE_COCKPIT_READ_TOKEN', raising=False)
    db = tmp_path / 'ops.db'
    client = TestClient(create_app(db))

    # No token → 403
    assert client.get('/api/plugins/charlie-cockpit/v1/health').status_code == 403

    # Client-supplied scope header with WRONG token → still 403 (scopes are server-side only)
    r = client.get('/api/plugins/charlie-cockpit/v1/health',
                   headers={'authorization': 'Bearer wrong-token', 'x-charlie-scopes': READ_SCOPE})
    assert r.status_code == 403

    # Valid dev token (no client scope header needed) → 200
    for path in ('health', 'tasks', 'agents', 'business/entities', 'business/relationships', 'audit', 'search?q=Charlie'):
        r = client.get('/api/plugins/charlie-cockpit/v1/' + path, headers=headers())
        assert r.status_code == 200
        body = r.json()
        assert body['meta']['request_id']
        assert 'freshness' in body['meta']
        assert 'database' not in body['data']

    # POST → 405 (read-only)
    assert client.post('/api/plugins/charlie-cockpit/v1/tasks', headers=headers()).status_code == 405

    # Stale freshness detection
    conn = connect(db)
    conn.execute("INSERT INTO source_cursor VALUES ('s1','test','safe://s1','hash1','2026-01-01T00:00:00Z','stale')")
    conn.close()
    body = client.get('/api/plugins/charlie-cockpit/v1/health', headers=headers()).json()
    assert body['meta']['freshness'] == 'stale'
    assert body['meta']['last_synced_at'] == '2026-01-01T00:00:00Z'
