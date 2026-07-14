import sqlite3
from cockpit.db import connect, migrate_down, migrate_up

def test_up_down_and_integrity(tmp_path):
    db=tmp_path/'ops.db'
    assert migrate_up(db) == '001_stage1'
    conn=connect(db)
    assert conn.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    assert conn.execute('PRAGMA foreign_key_check').fetchall() == []
    assert conn.execute('PRAGMA journal_mode').fetchone()[0].lower() == 'wal'
    conn.close()
    assert migrate_down(db) == '001_stage1'
    conn=sqlite3.connect(db)
    assert conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='task'").fetchone() is None
