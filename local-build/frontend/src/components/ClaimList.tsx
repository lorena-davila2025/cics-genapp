import { useState } from 'react';
import { useListClaimsQuery, useLazyGetClaimQuery, useDeleteClaimMutation } from '../store/genappApi';

type PanelMode = 'view' | 'delete';

export default function ClaimList() {
  // Server-side filter
  const [polInput,   setPolInput]   = useState('');
  const [filterArg,  setFilterArg]  = useState<string | undefined>(undefined);

  // Client-side filters
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [causeFilter, setCauseFilter] = useState('');

  // Selection + panel
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode,       setMode]       = useState<PanelMode>('view');

  const { data: rows, isLoading, isError, error } = useListClaimsQuery(filterArg);
  const [triggerDetail, { data: detail, isFetching: detailFetching, isError: detailErr, error: detailError }] =
    useLazyGetClaimQuery();
  const [deleteClaim, { isLoading: deleting, isError: deleteErr, error: deleteError }] =
    useDeleteClaimMutation();

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setFilterArg(polInput.trim() || undefined);
    setSelectedId(null);
  }

  function clearFilters() {
    setPolInput('');
    setFilterArg(undefined);
    setDateFrom('');
    setDateTo('');
    setCauseFilter('');
    setSelectedId(null);
  }

  function selectRow(claimNum: string) {
    if (selectedId === claimNum) { setSelectedId(null); return; }
    setSelectedId(claimNum);
    setMode('view');
    triggerDetail(claimNum);
  }

  async function handleDelete() {
    if (!selectedId) return;
    const outcome = await deleteClaim(selectedId);
    if (!('error' in outcome)) {
      setSelectedId(null);
      setMode('view');
    }
  }

  const hasAnyFilter = polInput || filterArg || dateFrom || dateTo || causeFilter;

  const filtered = rows?.filter(c => {
    if (dateFrom    && c.claim_date < dateFrom) return false;
    if (dateTo      && c.claim_date > dateTo)   return false;
    if (causeFilter.trim()) {
      if (!c.cause.toLowerCase().includes(causeFilter.trim().toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="card">
      <div className="page-header">
        <h2>Claims</h2>
        {rows && <span className="count">{filtered?.length ?? rows.length} of {rows.length}</span>}
      </div>

      <form className="filter-section" onSubmit={handleFilter}>
        <div className="field">
          <label>Policy #</label>
          <input value={polInput} onChange={e => setPolInput(e.target.value)} placeholder="All policies" />
        </div>
        <div className="field">
          <label>Cause contains</label>
          <input value={causeFilter} onChange={e => setCauseFilter(e.target.value)} placeholder="e.g. fire" />
        </div>
        <div className="field">
          <label>Date from</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>Date to</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="filter-actions">
          <button className="btn btn-secondary btn-sm" type="submit">Apply</button>
          {hasAnyFilter && (
            <button className="btn btn-ghost btn-sm" type="button" onClick={clearFilters}>Clear</button>
          )}
        </div>
      </form>

      {isError && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {isLoading && <div className="empty-state"><span className="spinner" /></div>}
      {filtered?.length === 0 && !isLoading && <div className="empty-state">No claims match the current filters.</div>}

      {filtered && filtered.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Claim #</th><th>Policy #</th><th>Date</th><th>Cause</th><th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.claim_num}
                  className={selectedId === c.claim_num ? 'row-selected' : undefined}
                  onClick={() => selectRow(c.claim_num)}
                >
                  <td><code>{parseInt(c.claim_num, 10)}</code></td>
                  <td><code>{parseInt(c.policy_num, 10)}</code></td>
                  <td>{c.claim_date}</td>
                  <td>{c.cause}</td>
                  <td>{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail panel ── */}
      {selectedId && (
        <div className="detail-panel">
          <div className="detail-panel-header">
            <span className="detail-panel-title">Claim {parseInt(selectedId, 10)}</span>
            {mode === 'view' && (
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                onClick={() => setMode('delete')}>Delete</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedId(null); setMode('view'); }}>✕</button>
          </div>

          {detailFetching && <span className="spinner" />}
          {detailErr && <div className="alert alert-err">{(detailError as { error?: string }).error ?? 'Request failed'}</div>}

          {detail && !detailFetching && mode === 'view' && (
            <dl className="kv-grid">
              <div><dt>Claim #</dt>       <dd>{parseInt(detail.claim_num, 10)}</dd></div>
              <div><dt>Policy #</dt>      <dd>{parseInt(detail.policy_num, 10)}</dd></div>
              <div><dt>Claim date</dt>    <dd>{detail.claim_date}</dd></div>
              <div><dt>Paid</dt>          <dd>{detail.paid !== undefined ? parseInt(detail.paid, 10) : '—'}</dd></div>
              <div><dt>Value</dt>         <dd>{parseInt(detail.value, 10)}</dd></div>
              <div><dt>Cause</dt>         <dd>{detail.cause}</dd></div>
              <div><dt>Observations</dt>  <dd>{detail.observations ?? '—'}</dd></div>
            </dl>
          )}

          {mode === 'delete' && (
            <>
              <div className="alert alert-warn">
                Permanently delete claim <strong>{parseInt(selectedId, 10)}</strong>?
              </div>
              <div className="detail-actions">
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <span className="spinner" /> : 'Confirm delete'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setMode('view')}>Cancel</button>
              </div>
              {deleteErr && <div className="alert alert-err" style={{ marginTop: '.75rem' }}>{(deleteError as { error?: string }).error ?? 'Request failed'}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
