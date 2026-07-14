# HOAgent

HOAgent 是查理资讯的 Agent 运营控制台项目入口。

当前仓库处于 **M0 治理基线**：仅登记项目边界、进度与协作规范；不包含产品实现代码。

## 开发边界

- 阶段 1 仅实现可重建、默认脱敏的只读投影。
- 权威源保持不变；投影数据可删除并从授权来源重建。
- 禁止提交凭据、Cookie、Token、私人记忆或交易正文。
- 首个开发任务：GitHub Issue #1（T20260714-34）。

详见 [`docs/00-总纲.md`](docs/00-总纲.md) 与 [`docs/PROGRESS.md`](docs/PROGRESS.md)。

## M1 本地运行（仅回环）

```bash
python3 -m venv .venv
.venv/bin/python -m pip install 'fastapi>=0.115,<1' 'uvicorn>=0.30,<1' 'pytest>=8,<9' httpx
.venv/bin/python scripts/migrate.py up --db "$PWD/data/ops.db"
CHARLIE_COCKPIT_READ_TOKEN=dev-only-token OPS_DB="$PWD/data/ops.db" .venv/bin/uvicorn cockpit.app:app --host 127.0.0.1 --port 18734
```

只读 API 前缀：`/api/plugins/charlie-cockpit/v1`。M1 对齐 T20260714-34、DOC-04/05/06 与 DOC-07A/B：投影保持可删除重建，权威源不被写入。
