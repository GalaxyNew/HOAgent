from fastapi.testclient import TestClient
from cockpit.app import create_app

def test_readonly_endpoints_have_meta(tmp_path):
    client=TestClient(create_app(tmp_path/'ops.db'))
    for path in ('health','tasks','agents','business/entities','business/relationships','audit','search?q=Charlie'):
        r=client.get('/api/plugins/charlie-cockpit/v1/'+path)
        assert r.status_code == 200
        body=r.json(); assert body['meta']['request_id']; assert 'freshness' in body['meta']
    assert client.post('/api/plugins/charlie-cockpit/v1/tasks').status_code == 405
