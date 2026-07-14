#!/usr/bin/env python3
import argparse, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cockpit.adapters import agent_schemas, task_cards
from cockpit.db import migrate_up
from cockpit.projection import project, rebuild
p=argparse.ArgumentParser(description='Project approved safe source metadata only.')
p.add_argument('--db', required=True); p.add_argument('--task-root', required=True); p.add_argument('--agent-root', required=True); p.add_argument('--rebuild', action='store_true')
a=p.parse_args(); db=Path(a.db); migrate_up(db)
records=task_cards(Path(a.task_root))+agent_schemas(Path(a.agent_root))
print(('REBUILD' if a.rebuild else 'PROJECT'), project(db, records) if not a.rebuild else rebuild(db, records))
