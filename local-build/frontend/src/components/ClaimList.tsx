import { useState } from 'react';
import { useListClaimsQuery, useLazyGetClaimQuery, useDeleteClaimMutation } from '../store/genappApi';

type PanelMode = 'view' | 'delete';

export default function ClaimList() {
  const [filterInput, setFilterInput] = useState('');
  const [filterArg,   setFilterArg]   = useState<string | undefined>(undefined);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);
  const [mode,        setMode]        = useState<PanelMode>('view');

  const { data: rows, isLoading, isError, error } = useListClaimsQuery(filterArg);
  const [triggerDetail, { data: detail, isFetching: detailFetching, isError: detailErr, error: detailError }] =
    useLazyGetClaimQuery();
  const [deleteClaim, { isLoading: deleting, isError: deleteErr, error: deleteError }] =
    useDeleteClaimMutation();

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setFilterArg(filterInput.trim() || undefined);
    setSelectedId(null);
  }

  function handleClear() {
    setFilterInput('');
    setFilterArg(undefined);
    setSelectedId(null);
  }

  function selectRow(claimNum: string) {
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

  return (
    <div className="card">
      <div className="page-header">
        <h2>Claims{rows && <span className="count"> ({rows.length})</span>}</h2>
        <form className="filter-bar" onSubmit={handleFilter}>
          <div className="field" style={{ flex: '0 0 170px' }}>
            <label>Policy #</label>
            <input value={filterInput} onChange={e => setFilterInput(e.target.value)} placeholder="Filter by policy" />
          </div>
          <button className="btn btn-secondary btn-sm" type="submit" style={{ alignSelf: 'flex-end' }}>Filter</button>
          {filterArg && (
            <button className="btn btn-ghost btn-sm" type="button" style={{ alignSelf: 'flex-end' }} onClick={handleClear}>Clear</button>
          )}
        </form>
      </div>

      {isError && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {isLoading && <div className="empty-state"><span className="spinner" /></div>}
      {rows?.length === 0 && !isLoading && <div className="empty-state">No claims found.</div>}

      {rows && rows.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Claim #</th><th>Policy #</th><th>Date</th><th>Cause</th><th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
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

      {selectedId && (
        <div className="detail-panel">
          <div className="detail-panel-header">
            <span className="detail-panel-title">
              Claim {parseInt(selectedId, 10)} detail
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedId(null); setMode('view'); }}>
              ✕ Close
            </button>
          </div>

          {detailFetching && <span className="spinner" />}
          {detailErr && <div className="alert alert-err">{(detailError as { error?: string }).error ?? 'Request failed'}</div>}

          {detail && !detailFetching && mode === 'view' && (
            <>
              <dl className="kv-grid">
                <div><dt>Claim #</dt>       <dd>{parseInt(detail.claim_num, 10)}</dd></div>
                <div><dt>Policy #</dt>      <dd>{parseInt(detail.policy_num, 10)}</dd></div>
                <div><dt>Claim date</dt>    <dd>{detail.claim_date}</dd></div>
                <div><dt>Paid</dt>          <dd>{detail.paid !== undefined ? parseInt(detail.paid, 10) : '—'}</dd></div>
                <div><dt>Value</dt>         <dd>{parseInt(detail.value, 10)}</dd></div>
                <div><dt>Cause</dt>         <dd>{detail.cause}</dd></div>
                <div><dt>Observations</dt>  <dd>{detail.observations ?? '—'}</dd></div>
              </dl>
              <div className="detail-actions">
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                  onClick={() => setMode('delete')}>Delete</button>
              </div>
            </>
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
