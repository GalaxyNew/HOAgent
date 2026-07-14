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
