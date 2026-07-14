import { useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { StateContainer } from '@/components/StateContainer';
import { SourceMetaCard } from '@/components/SourceMeta';
import type { SourceMeta } from '@/types/api';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [meta, setMeta] = useState<SourceMeta | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<ApiError | null>(null);

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus('loading');
    api.search(query)
      .then((res) => {
        setResults(res.data);
        setMeta(res.meta);
        setStatus('success');
        setError(null);
      })
      .catch((err: ApiError) => {
        setResults(null);
        setMeta(null);
        setStatus('error');
        setError(err);
      });
  };

  const empty = status === 'success' && (!results || results.length === 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-100">搜索</h1>
      <p className="mt-1 text-sm text-slate-500">全文检索知识库（只读）</p>

      <form onSubmit={doSearch} className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入关键词…"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400 disabled:opacity-50"
        >
          {status === 'loading' ? '搜索中…' : '搜索'}
        </button>
      </form>

      {meta && (
        <div className="mt-4">
          <SourceMetaCard meta={meta} />
        </div>
      )}

      {status !== 'idle' && (
        <div className="mt-4 space-y-2">
          <StateContainer status={status} error={error} empty={empty}>
            {results?.map((r: any) => (
              <div
                key={r.chunk_id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 p-4"
              >
                <p className="text-sm font-medium text-slate-200">
                  {r.title_masked ?? '(无标题)'}
                </p>
                {r.summary_masked && (
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                    {r.summary_masked}
                  </p>
                )}
                <div className="mt-2 flex gap-3 text-xs text-slate-600">
                  <span>chunk: <code>{r.chunk_id}</code></span>
                  <span>doc: <code>{r.document_id}</code></span>
                  {r.tags && <span>标签: {r.tags}</span>}
                </div>
              </div>
            ))}
          </StateContainer>
        </div>
      )}
    </div>
  );
}
