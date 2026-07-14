var D;
const w = (D = window.__HERMES_PLUGIN_SDK__) == null ? void 0 : D.React, { useState: f, useEffect: P, useCallback: A, createContext: I, useContext: j } = w, H = w.Fragment, e = w.createElement, s = w.createElement, E = I(null);
function L() {
  const t = j(E);
  if (!t) throw new Error("CharlieCockpitPage must provide NavigationContext");
  return t;
}
const $ = [
  { view: "overview", label: "总览", icon: "📊" },
  { view: "tasks", label: "任务", icon: "📋" },
  { view: "agents", label: "Agent", icon: "🤖" },
  { view: "business", label: "业务", icon: "🏢" },
  { view: "audit", label: "审计", icon: "📜" },
  { view: "search", label: "搜索", icon: "🔍" }
];
function R() {
  const { view: t, navigate: a } = L();
  return /* @__PURE__ */ s("aside", { className: "fixed inset-y-0 left-0 z-40 w-56 border-r border-slate-800 bg-slate-900/80 backdrop-blur-xl", children: [
    /* @__PURE__ */ s("div", { className: "flex h-14 items-center gap-2 border-b border-slate-800 px-5", children: [
      /* @__PURE__ */ e("span", { className: "text-lg", children: "✦" }),
      /* @__PURE__ */ e("span", { className: "text-sm font-semibold tracking-tight text-slate-100", children: "Charlie Cockpit" })
    ] }),
    /* @__PURE__ */ e("nav", { className: "space-y-0.5 p-3", children: $.map((n) => /* @__PURE__ */ s(
      "button",
      {
        type: "button",
        onClick: () => a(n.view),
        className: `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${t === n.view ? "bg-indigo-500/10 text-indigo-300" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}`,
        children: [
          /* @__PURE__ */ e("span", { className: "text-base", children: n.icon }),
          n.label
        ]
      },
      n.view
    )) }),
    /* @__PURE__ */ e("div", { className: "absolute bottom-0 w-full border-t border-slate-800 p-4", children: /* @__PURE__ */ s("p", { className: "text-xs text-slate-600", children: [
      "HOAgent · 只读模式",
      /* @__PURE__ */ e("br", {}),
      "v0.1.0 MVP"
    ] }) })
  ] });
}
function M({ children: t }) {
  return /* @__PURE__ */ s("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ e(R, {}),
    /* @__PURE__ */ e("main", { className: "pl-56", children: /* @__PURE__ */ e("div", { className: "mx-auto max-w-7xl px-8 py-6", children: t }) })
  ] });
}
function m(t, a = []) {
  const [n, r] = f({
    data: null,
    meta: null,
    status: "idle",
    error: null
  }), i = A(() => {
    r((l) => ({ ...l, status: "loading" })), t().then((l) => {
      r({
        data: l.data,
        meta: l.meta,
        status: "success",
        error: null
      });
    }).catch((l) => {
      r({
        data: null,
        meta: null,
        status: "error",
        error: l
      });
    });
  }, a);
  return P(() => {
    i();
  }, [i]), { ...n, refetch: i };
}
const O = "/api/plugins/charlie-cockpit/v1";
function S() {
  if (typeof window > "u") return null;
  const t = window.__HERMES_PLUGIN_SDK__;
  return t && typeof t.fetchJSON == "function" ? t : null;
}
async function p(t) {
  if (!S())
    throw new k(403, "host-unavailable", "仅支持 Hermes Dashboard 宿主访问");
  try {
    return await S().fetchJSON(`${O}${t}`);
  } catch (a) {
    const n = typeof a == "object" && a && "status" in a ? Number(a.status) : 0;
    throw n === 401 || n === 403 ? new k(n, "forbidden", "无访问权限：请在受信任的 Dashboard 宿主中打开") : new k(n, "offline", "无法连接服务");
  }
}
class k extends Error {
  constructor(a, n, r) {
    super(r), this.code = a, this.kind = n;
  }
}
const o = {
  health: () => p("/health"),
  tasks: () => p("/tasks"),
  agents: () => p("/agents"),
  entities: () => p("/business/entities"),
  relationships: () => p("/business/relationships"),
  audit: () => p("/audit"),
  search: (t) => p(`/search?q=${encodeURIComponent(t)}`)
};
function b({
  status: t,
  error: a,
  empty: n,
  children: r
}) {
  if (t === "loading")
    return /* @__PURE__ */ s("div", { className: "flex items-center justify-center py-16", children: [
      /* @__PURE__ */ e("div", { className: "h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" }),
      /* @__PURE__ */ e("span", { className: "ml-3 text-sm text-slate-400", children: "加载中…" })
    ] });
  if (t === "error" && a) {
    const i = a.kind === "forbidden", l = a.kind === "host-unavailable", d = a.kind === "offline";
    return /* @__PURE__ */ s("div", { className: "flex flex-col items-center justify-center py-16", children: [
      /* @__PURE__ */ e("div", { className: `h-12 w-12 rounded-full ${i || l ? "bg-red-500/10" : d ? "bg-slate-500/10" : "bg-amber-500/10"} flex items-center justify-center`, children: /* @__PURE__ */ e("span", { className: "text-2xl", children: i || l ? "🔒" : d ? "📡" : "⚠️" }) }),
      /* @__PURE__ */ e("p", { className: "mt-3 text-sm font-medium text-slate-200", children: l ? "仅支持 Hermes Dashboard 宿主访问" : i ? "403 禁止访问" : d ? "服务离线" : "请求出错" }),
      /* @__PURE__ */ e("p", { className: "mt-1 text-xs text-slate-500", children: a.message })
    ] });
  }
  return t === "success" && n ? /* @__PURE__ */ s("div", { className: "flex flex-col items-center justify-center py-16", children: [
    /* @__PURE__ */ e("div", { className: "h-12 w-12 rounded-full bg-slate-500/10 flex items-center justify-center", children: /* @__PURE__ */ e("span", { className: "text-2xl", children: "📭" }) }),
    /* @__PURE__ */ e("p", { className: "mt-3 text-sm text-slate-400", children: "暂无数据" })
  ] }) : /* @__PURE__ */ e(H, { children: r });
}
const C = {
  fresh: { label: "新鲜", color: "text-emerald-400" },
  stale: { label: "过期", color: "text-amber-400" },
  empty: { label: "空", color: "text-slate-500" },
  error: { label: "错误", color: "text-red-400" },
  offline: { label: "离线", color: "text-slate-600" },
  conflict: { label: "冲突", color: "text-orange-400" }
};
function U({ freshness: t }) {
  const a = C[t] ?? C.empty;
  return /* @__PURE__ */ s("span", { className: `inline-flex items-center gap-1 text-xs font-medium ${a.color}`, children: [
    /* @__PURE__ */ e("span", { className: "h-1.5 w-1.5 rounded-full bg-current" }),
    a.label
  ] });
}
function x({ meta: t }) {
  if (!t) return null;
  const a = t.last_synced_at ? new Date(t.last_synced_at).toLocaleString("zh-CN") : "—";
  return /* @__PURE__ */ s("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400", children: [
    /* @__PURE__ */ e(U, { freshness: t.freshness }),
    /* @__PURE__ */ s("span", { children: [
      "来源: ",
      /* @__PURE__ */ e("code", { className: "text-slate-300", children: t.source_ref })
    ] }),
    t.source_hash && /* @__PURE__ */ s("span", { children: [
      "哈希: ",
      /* @__PURE__ */ e("code", { className: "text-slate-300", children: t.source_hash.slice(0, 8) })
    ] }),
    /* @__PURE__ */ s("span", { children: [
      "同步: ",
      a
    ] })
  ] });
}
function z() {
  var N, v, y, c, u;
  const t = m(() => o.health()), a = m(() => o.tasks()), n = m(() => o.agents()), r = m(() => o.audit()), i = ((N = a.data) == null ? void 0 : N.length) ?? 0, l = ((v = n.data) == null ? void 0 : v.length) ?? 0, d = ((y = r.data) == null ? void 0 : y.length) ?? 0, h = ((c = t.data) == null ? void 0 : c.status) === "ok", _ = [
    { label: "服务状态", value: h ? "运行中" : "未知", icon: "⚡" },
    { label: "任务", value: String(i), icon: "📋" },
    { label: "Agent", value: String(l), icon: "🤖" },
    { label: "审计事件", value: String(d), icon: "📜" }
  ];
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ e("h1", { className: "text-xl font-semibold text-slate-100", children: "总览" }),
    /* @__PURE__ */ e("p", { className: "mt-1 text-sm text-slate-500", children: "HOAgent 运营控制台 · 只读视图" }),
    /* @__PURE__ */ e("div", { className: "mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4", children: _.map((g) => /* @__PURE__ */ s(
      "div",
      {
        className: "group rounded-xl border border-slate-800 bg-slate-900/40 p-5",
        children: [
          /* @__PURE__ */ s("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ e("span", { className: "text-2xl", children: g.icon }),
            g.label === "服务状态" && /* @__PURE__ */ e("span", { className: `h-2 w-2 rounded-full ${h ? "bg-emerald-400" : "bg-slate-600"} animate-pulse` })
          ] }),
          /* @__PURE__ */ e("p", { className: "mt-3 text-2xl font-semibold text-slate-100", children: g.value }),
          /* @__PURE__ */ e("p", { className: "text-xs text-slate-500 group-hover:text-slate-400", children: g.label })
        ]
      },
      g.label
    )) }),
    /* @__PURE__ */ s("div", { className: "mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4", children: [
      /* @__PURE__ */ e("h2", { className: "text-sm font-medium text-slate-300", children: "服务健康" }),
      /* @__PURE__ */ e("div", { className: "mt-3", children: /* @__PURE__ */ s(b, { status: t.status, error: t.error, children: [
        /* @__PURE__ */ s("div", { className: "flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ e("span", { className: `h-2.5 w-2.5 rounded-full ${h ? "bg-emerald-400" : "bg-red-400"}` }),
          /* @__PURE__ */ e("span", { className: "text-slate-200", children: ((u = t.data) == null ? void 0 : u.service) ?? "—" }),
          /* @__PURE__ */ e("span", { className: "text-slate-500", children: "·" }),
          /* @__PURE__ */ e("span", { className: "text-slate-400", children: h ? "OK" : "异常" })
        ] }),
        t.meta && /* @__PURE__ */ e("div", { className: "mt-3", children: /* @__PURE__ */ e(x, { meta: t.meta }) })
      ] }) })
    ] }),
    a.meta && /* @__PURE__ */ e("div", { className: "mt-4", children: /* @__PURE__ */ e(x, { meta: a.meta }) })
  ] });
}
function F() {
  const { data: t, meta: a, status: n, error: r } = m(() => o.tasks()), i = !t || t.length === 0;
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ e("h1", { className: "text-xl font-semibold text-slate-100", children: "任务" }),
    /* @__PURE__ */ e("p", { className: "mt-1 text-sm text-slate-500", children: "全部任务投影（只读）" }),
    /* @__PURE__ */ e("div", { className: "mt-4", children: /* @__PURE__ */ e(x, { meta: a }) }),
    /* @__PURE__ */ e("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-800", children: /* @__PURE__ */ e(b, { status: n, error: r, empty: i, children: /* @__PURE__ */ s("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ s("tr", { className: "border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500", children: [
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "任务 ID" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "标题" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "状态" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "优先级" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "负责人" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "更新时间" })
      ] }) }),
      /* @__PURE__ */ e("tbody", { className: "divide-y divide-slate-800/60", children: t == null ? void 0 : t.map((l) => /* @__PURE__ */ s("tr", { className: "hover:bg-slate-800/30", children: [
        /* @__PURE__ */ e("td", { className: "px-4 py-3 font-mono text-xs text-slate-400", children: l.task_id }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-200", children: l.title ?? "—" }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3", children: /* @__PURE__ */ e(G, { status: l.status }) }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-400", children: l.priority ?? "—" }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-400", children: l.owner_ref ?? "—" }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-xs text-slate-500", children: l.updated_at ? new Date(l.updated_at).toLocaleString("zh-CN") : "—" })
      ] }, l.task_id)) })
    ] }) }) })
  ] });
}
function G({ status: t }) {
  const n = {
    done: "bg-emerald-500/10 text-emerald-400",
    completed: "bg-emerald-500/10 text-emerald-400",
    in_progress: "bg-blue-500/10 text-blue-400",
    blocked: "bg-red-500/10 text-red-400",
    review: "bg-amber-500/10 text-amber-400",
    pending: "bg-slate-500/10 text-slate-400"
  }[t == null ? void 0 : t.toLowerCase()] ?? "bg-slate-500/10 text-slate-400";
  return /* @__PURE__ */ e("span", { className: `inline-block rounded px-2 py-0.5 text-xs font-medium ${n}`, children: t ?? "—" });
}
function B() {
  const { data: t, meta: a, status: n, error: r } = m(() => o.agents()), i = !t || t.length === 0;
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ e("h1", { className: "text-xl font-semibold text-slate-100", children: "Agent" }),
    /* @__PURE__ */ e("p", { className: "mt-1 text-sm text-slate-500", children: "已注册 Agent 清单（只读）" }),
    /* @__PURE__ */ e("div", { className: "mt-4", children: /* @__PURE__ */ e(x, { meta: a }) }),
    /* @__PURE__ */ e("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-800", children: /* @__PURE__ */ e(b, { status: n, error: r, empty: i, children: /* @__PURE__ */ s("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ s("tr", { className: "border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500", children: [
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "Agent ID" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "名称" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "角色" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "状态" })
      ] }) }),
      /* @__PURE__ */ e("tbody", { className: "divide-y divide-slate-800/60", children: t == null ? void 0 : t.map((l) => /* @__PURE__ */ s("tr", { className: "hover:bg-slate-800/30", children: [
        /* @__PURE__ */ e("td", { className: "px-4 py-3 font-mono text-xs text-slate-400", children: l.agent_id }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-200", children: l.name ?? "—" }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-400", children: l.role ?? "—" }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3", children: /* @__PURE__ */ e("span", { className: `inline-block rounded px-2 py-0.5 text-xs font-medium ${l.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"}`, children: l.status ?? "—" }) })
      ] }, l.agent_id)) })
    ] }) }) })
  ] });
}
function K() {
  var n, r;
  const t = m(() => o.entities()), a = m(() => o.relationships());
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ e("h1", { className: "text-xl font-semibold text-slate-100", children: "业务" }),
    /* @__PURE__ */ e("p", { className: "mt-1 text-sm text-slate-500", children: "业务实体与关系（只读）" }),
    /* @__PURE__ */ s("div", { className: "mt-6", children: [
      /* @__PURE__ */ s("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ e("h2", { className: "text-sm font-medium text-slate-300", children: "实体" }),
        t.meta && /* @__PURE__ */ e(x, { meta: t.meta })
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-2 overflow-hidden rounded-xl border border-slate-800", children: /* @__PURE__ */ e(b, { status: t.status, error: t.error, empty: !t.data || t.data.length === 0, children: /* @__PURE__ */ s("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ s("tr", { className: "border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500", children: [
          /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "实体 ID" }),
          /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "名称" }),
          /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "类型" })
        ] }) }),
        /* @__PURE__ */ e("tbody", { className: "divide-y divide-slate-800/60", children: (n = t.data) == null ? void 0 : n.map((i) => /* @__PURE__ */ s("tr", { className: "hover:bg-slate-800/30", children: [
          /* @__PURE__ */ e("td", { className: "px-4 py-3 font-mono text-xs text-slate-400", children: i.entity_id }),
          /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-200", children: i.name ?? "—" }),
          /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-400", children: i.entity_kind ?? "—" })
        ] }, i.entity_id)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ s("div", { className: "mt-6", children: [
      /* @__PURE__ */ s("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ e("h2", { className: "text-sm font-medium text-slate-300", children: "关系" }),
        a.meta && /* @__PURE__ */ e(x, { meta: a.meta })
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-2 overflow-hidden rounded-xl border border-slate-800", children: /* @__PURE__ */ e(b, { status: a.status, error: a.error, empty: !a.data || a.data.length === 0, children: /* @__PURE__ */ s("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ s("tr", { className: "border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500", children: [
          /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "关系 ID" }),
          /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "来源" }),
          /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "目标" }),
          /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "类型" }),
          /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "生效时间" })
        ] }) }),
        /* @__PURE__ */ e("tbody", { className: "divide-y divide-slate-800/60", children: (r = a.data) == null ? void 0 : r.map((i) => /* @__PURE__ */ s("tr", { className: "hover:bg-slate-800/30", children: [
          /* @__PURE__ */ e("td", { className: "px-4 py-3 font-mono text-xs text-slate-400", children: i.relationship_id }),
          /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-200", children: i.left_entity_id ?? "—" }),
          /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-200", children: i.right_entity_id ?? "—" }),
          /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-400", children: i.relation_type ?? "—" }),
          /* @__PURE__ */ e("td", { className: "px-4 py-3 text-xs text-slate-500", children: i.effective_from ? new Date(i.effective_from).toLocaleDateString("zh-CN") : "—" })
        ] }, i.relationship_id)) })
      ] }) }) })
    ] })
  ] });
}
function V() {
  const { data: t, meta: a, status: n, error: r } = m(() => o.audit()), i = !t || t.length === 0;
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ e("h1", { className: "text-xl font-semibold text-slate-100", children: "审计" }),
    /* @__PURE__ */ e("p", { className: "mt-1 text-sm text-slate-500", children: "审计事件流（只读）" }),
    /* @__PURE__ */ e("div", { className: "mt-4", children: /* @__PURE__ */ e(x, { meta: a }) }),
    /* @__PURE__ */ e("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-800", children: /* @__PURE__ */ e(b, { status: n, error: r, empty: i, children: /* @__PURE__ */ s("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ s("tr", { className: "border-b border-slate-800 bg-slate-900/60 text-xs uppercase tracking-wide text-slate-500", children: [
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "事件 ID" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "结果" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "动作" }),
        /* @__PURE__ */ e("th", { className: "px-4 py-3 text-left font-medium", children: "发生时间" })
      ] }) }),
      /* @__PURE__ */ e("tbody", { className: "divide-y divide-slate-800/60", children: t == null ? void 0 : t.map((l) => /* @__PURE__ */ s("tr", { className: "hover:bg-slate-800/30", children: [
        /* @__PURE__ */ e("td", { className: "px-4 py-3 font-mono text-xs text-slate-400", children: l.audit_id }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-400", children: l.result ?? "—" }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-slate-200", children: l.action ?? "—" }),
        /* @__PURE__ */ e("td", { className: "px-4 py-3 text-xs text-slate-500", children: l.occurred_at ? new Date(l.occurred_at).toLocaleString("zh-CN") : "—" })
      ] }, l.audit_id)) })
    ] }) }) })
  ] });
}
function q() {
  const [t, a] = f(""), [n, r] = f(null), [i, l] = f(null), [d, h] = f("idle"), [_, N] = f(null), v = (c) => {
    c.preventDefault(), t.trim() && (h("loading"), o.search(t).then((u) => {
      r(u.data), l(u.meta), h("success"), N(null);
    }).catch((u) => {
      r(null), l(null), h("error"), N(u);
    }));
  }, y = d === "success" && (!n || n.length === 0);
  return /* @__PURE__ */ s("div", { children: [
    /* @__PURE__ */ e("h1", { className: "text-xl font-semibold text-slate-100", children: "搜索" }),
    /* @__PURE__ */ e("p", { className: "mt-1 text-sm text-slate-500", children: "全文检索知识库（只读）" }),
    /* @__PURE__ */ s("form", { onSubmit: v, className: "mt-4 flex gap-2", children: [
      /* @__PURE__ */ e(
        "input",
        {
          type: "text",
          value: t,
          onChange: (c) => a(c.target.value),
          placeholder: "输入关键词…",
          className: "flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        }
      ),
      /* @__PURE__ */ e(
        "button",
        {
          type: "submit",
          disabled: d === "loading",
          className: "rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-50",
          children: d === "loading" ? "搜索中…" : "搜索"
        }
      )
    ] }),
    i && /* @__PURE__ */ e("div", { className: "mt-4", children: /* @__PURE__ */ e(x, { meta: i }) }),
    d !== "idle" && /* @__PURE__ */ e("div", { className: "mt-4 space-y-2", children: /* @__PURE__ */ e(b, { status: d, error: _, empty: y, children: n == null ? void 0 : n.map((c) => /* @__PURE__ */ s(
      "div",
      {
        className: "rounded-lg border border-slate-800 bg-slate-900/40 p-4",
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm font-medium text-slate-200", children: c.title_masked ?? "(无标题)" }),
          c.summary_masked && /* @__PURE__ */ e("p", { className: "mt-1 text-xs text-slate-400 line-clamp-2", children: c.summary_masked }),
          /* @__PURE__ */ s("div", { className: "mt-2 flex gap-3 text-xs text-slate-600", children: [
            /* @__PURE__ */ s("span", { children: [
              "chunk: ",
              /* @__PURE__ */ e("code", { children: c.chunk_id })
            ] }),
            /* @__PURE__ */ s("span", { children: [
              "doc: ",
              /* @__PURE__ */ e("code", { children: c.document_id })
            ] }),
            c.tags && /* @__PURE__ */ s("span", { children: [
              "标签: ",
              c.tags
            ] })
          ] })
        ]
      },
      c.chunk_id
    )) }) })
  ] });
}
const J = {
  overview: z,
  tasks: F,
  agents: B,
  business: K,
  audit: V,
  search: q
};
function T() {
  const [t, a] = f("overview"), n = J[t];
  return /* @__PURE__ */ e(E.Provider, { value: { view: t, navigate: a }, children: /* @__PURE__ */ e(M, { children: /* @__PURE__ */ e(n, {}) }) });
}
typeof window < "u" && window.HERMES_PLUGINS && window.HERMES_PLUGINS.register("charlie-cockpit", T);
export {
  T as CharlieCockpitPage
};
