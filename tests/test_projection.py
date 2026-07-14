from cockpit.adapters import SourceRecord
from cockpit.db import connect, migrate_up
from cockpit.projection import project, rebuild

def task(hash_='a'):
 return SourceRecord('task:T1','task_card','task-card://T1.md',hash_,{'task_id':'T1','title':'Safe task','status':'IN_PROGRESS','priority':'P1','owner_ref':'fullstack','updated_at':'1'})
def test_idempotent_and_rebuild(tmp_path):
 db=tmp_path/'ops.db'; migrate_up(db)
 assert project(db,[task()]) == {'applied':1,'skipped':0,'conflicts':0}
 assert project(db,[task()]) == {'applied':0,'skipped':1,'conflicts':0}
 assert rebuild(db,[task()]) == {'applied':1,'skipped':0,'conflicts':0}
 conn=connect(db); assert conn.execute('SELECT COUNT(*) FROM task').fetchone()[0] == 1
 assert conn.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'; assert conn.execute('PRAGMA foreign_key_check').fetchall() == []

def test_conflict_is_recorded_without_overwriting(tmp_path):
 db=tmp_path/'ops.db'; migrate_up(db)
 changed=SourceRecord('task:T1','task_card','task-card://T1.md','changed',{'task_id':'T1','title':'Changed','status':'IN_PROGRESS','priority':'P1','owner_ref':'fullstack','updated_at':'2'})
 result=project(db,[task(),changed])
 assert result == {'applied':1,'skipped':0,'conflicts':1}
 conn=connect(db)
 assert conn.execute("SELECT COUNT(*) FROM projection_conflict WHERE status='open'").fetchone()[0] == 1
 assert conn.execute('SELECT title FROM task WHERE task_id=?', ('T1',)).fetchone()[0] == 'Safe task'
