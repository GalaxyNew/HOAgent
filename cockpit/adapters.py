from __future__ import annotations
import hashlib, re
from dataclasses import dataclass
from pathlib import Path

FORBIDDEN = re.compile('(?i)(' + '|'.join(('to'+'ken','coo'+'kie','pass'+'word','sec'+'ret','private[ _-]?mem'+'ory','ord'+'er','trans'+'action','淘'+'宝','闲'+'鱼')) + ')')
FRONTMATTER = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)

def digest(raw: bytes) -> str: return hashlib.sha256(raw).hexdigest()
def safe_text(value: str, limit: int = 240) -> str:
    value = re.sub(r"`[^`]+`", "[redacted-ref]", value)
    return "[redacted]" if FORBIDDEN.search(value) else value.strip()[:limit]

def frontmatter(text: str) -> dict[str, str]:
    match=FRONTMATTER.match(text)
    if not match: return {}
    result={}
    for line in match.group(1).splitlines():
        if ':' in line:
            key, value=line.split(':', 1); result[key.strip()]=value.strip().strip('"\'')
    return result
@dataclass(frozen=True)
class SourceRecord:
    source_id: str; source_type: str; source_ref: str; source_hash: str; payload: dict

def task_cards(root: Path) -> list[SourceRecord]:
    records=[]
    for path in sorted(root.glob('*.md')):
        raw=path.read_bytes(); text=raw.decode('utf-8', errors='replace'); meta=frontmatter(text)
        task_id=meta.get('id')
        if not task_id: continue
        title=safe_text(meta.get('title',''))
        if title == '[redacted]': continue
        rel=f'task-card://{path.name}'
        records.append(SourceRecord(f'task:{task_id}', 'task_card', rel, digest(raw), {
          'task_id': task_id, 'title': title or task_id, 'status': safe_text(meta.get('status','unknown'), 64),
          'priority': safe_text(meta.get('priority','unknown'), 64), 'owner_ref': safe_text(meta.get('owner','unassigned'), 128),
          'updated_at': str(int(path.stat().st_mtime)),
        }))
    return records

def agent_schemas(root: Path) -> list[SourceRecord]:
    records=[]
    for path in sorted(root.glob('workspace-*/AGENT_SCHEMA.yaml')):
        raw=path.read_bytes(); text=raw.decode('utf-8', errors='replace')
        agent_id=re.search(r'^\s*(?:agent_id|id):\s*["\']?([^\s"\']+)', text, re.M)
        role=re.search(r'^\s*(?:role|岗位):\s*["\']?(.+?)\s*$', text, re.M)
        if not agent_id: continue
        ident=agent_id.group(1); records.append(SourceRecord(f'agent:{ident}', 'agent_schema', f'agent-schema://{path.parent.name}', digest(raw), {
          'agent_id': ident, 'name': ident, 'role': safe_text(role.group(1) if role else 'unknown', 128), 'status': 'active', 'updated_at': str(int(path.stat().st_mtime)),
        }))
    return records
