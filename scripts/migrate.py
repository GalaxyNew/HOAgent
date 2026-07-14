#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from cockpit.db import migrate_down, migrate_up
p=argparse.ArgumentParser(); p.add_argument('action', choices=('up','down')); p.add_argument('--db', required=True); a=p.parse_args()
print((migrate_up if a.action == 'up' else migrate_down)(a.db))
