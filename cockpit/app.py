"""Charlie Cockpit application.

Production path: Hermes Dashboard mounts ``dashboard/plugin_api.py:router``
at ``/api/plugins/charlie-cockpit/v1/``. The dashboard's own middleware
(session-token or OAuth gated mode) handles all authentication.

This module provides:
- ``create_app(db_path)`` — standalone FastAPI app for **tests only** (no auth).
- ``app`` — convenience standalone instance for ``uvicorn cockpit.app:app``.

⚠️ The standalone app has NO authentication. It must NEVER be exposed
   on a network. Production traffic goes through the Hermes Dashboard.
"""
from __future__ import annotations

from pathlib import Path

from dashboard.plugin_api import build_plugin_router, _ensure_migrated, _default_db_path
from fastapi import FastAPI


def create_app(db_path: Path | None = None) -> FastAPI:
    """Create a standalone FastAPI app for tests and local development.

    ⚠️ NO AUTH — pytest and local curl only.
    """
    db = db_path or _default_db_path()
    if db.parent.exists() or db_path:
        db.parent.mkdir(parents=True, exist_ok=True)
    _ensure_migrated(db)
    app = FastAPI(title="Charlie Cockpit (standalone, no auth)", version="0.1.0")
    app.include_router(build_plugin_router(db))
    return app


# Lazy standalone instance for ``uvicorn cockpit.app:app``
app = create_app()
