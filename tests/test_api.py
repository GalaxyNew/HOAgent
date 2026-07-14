from fastapi.testclient import TestClient
from cockpit.app import READ_SCOPE, create_app
from cockpit.db import connect

def headers(): return {'authorization':'Bearer test-read-token','x-charlie-scopes':READ_SCOPE}
def test_readonly_endpoints_authorize_and_have_real_meta(tmp_path, monkeypatch):
 monkeypatch.setenv('CHARLIE_COCKPIT_READ_TOKEN','test-read-token')
 db=tmp_path/'ops.db'; client=TestClient(create_app(db))
 assert client.get('/api/plugins/charlie-cockpit/v1/health').status_code == 403
 for path in ('health','tasks','agents','business/entities','business/relationships','audit','search?q=Charlie'):
  r=client.get('/api/plugins/charlie-cockpit/v1/'+path,headers=headers()); assert r.status_code == 200
  body=r.json(); assert body['meta']['request_id']; assert 'freshness' in body['meta']; assert 'database' not in body['data']
 assert client.post('/api/plugins/charlie-cockpit/v1/tasks',headers=headers()).status_code == 405
 conn=connect(db)
 conn.execute("INSERT INTO source_cursor VALUES ('s1','test','safe://s1','hash1','2026-01-01T00:00:00Z','stale')")
 conn.close()
 body=client.get('/api/plugins/charlie-cockpit/v1/health',headers=headers()).json()
 assert body['meta']['freshness'] == 'stale' and body['meta']['last_synced_at'] == '2026-01-01T00:00:00Z'
