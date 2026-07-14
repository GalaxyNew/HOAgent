# Changelog

本文件记录 HOAgent 面向用户的交付变更。

## 2026-07-15 — T-36 Charlie Cockpit 只读 Web MVP

### 新增
- 在 Hermes Dashboard 中提供 Charlie Cockpit 只读运营页面：总览、任务、Agent、业务、审计与搜索。
- 通过宿主 SDK 的 `fetchJSON` 获取只读投影数据；不包含写操作、独立登录或令牌回退。

### 修复
- 插件构建为适配 Dashboard classic script 注入的 IIFE，确保运行时完成注册。
- M07：将导航与内容限制在插件根容器内，移除 viewport fixed 侧栏和全局根节点/滚动条样式，避免覆盖 Hermes 宿主导航。

### 验证摘要
- Vitest 7/7、TypeScript typecheck、IIFE build、敏感扫描通过。
- 真实 Hermes Dashboard 中插件注册成功，六个只读页面可访问；M07 增量异构评审结论为 Critical=0、Major=0、Minor=0。

## 2026-07-15 — T-02 Charlie Cockpit 参考风格视觉重设计

### 变更
- 集中化 Charlie Cockpit 视觉令牌：灰绿画布、白卡、墨绿文字、青绿主色、暖橙状态色。
- 样式严格限定在 `.charlie-cockpit` 作用域，不污染 Hermes 宿主。
- 为错误态和空态添加恢复操作（重试 / 刷新数据），连接六类页面的 `refetch` 和搜索的 `runSearch`。
- 修复 `--cc-muted-soft` 对比度从 3.35:1 提升到 5.92–6.38:1（WCAG AA）。
- 新增 `freshness="unknown"` 前后端类型对齐与语义化徽标，避免后端返回 unknown 时前端误显示为"空"。

### 验证摘要
- Vitest 9/9、TypeScript typecheck、Vite build、敏感扫描通过。
- UX 定向复核 PASS（Major=0、Minor=0）。
- 异构增量评审（zhipu/glm-5-turbo）Critical=0、Major=0、Minor=0。
- Hermes 独立浏览器 E3：六页导航、真实数据（5 任务+21 Agent）、恢复按钮真实触发 API、Console error=0、API 200、裸 API 401。
