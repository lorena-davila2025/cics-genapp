import { useState } from 'react';
import { useListClaimsQuery, useLazyGetClaimQuery } from '../store/genappApi';

export default function ClaimList() {
  const [filterInput, setFilterInput] = useState('');
  const [filterArg,   setFilterArg]   = useState<string | undefined>(undefined);
  const [selectedId,  setSelectedId]  = useState<string | null>(null);

  const { data: rows, isLoading, isError, error } = useListClaimsQuery(filterArg);
  const [triggerDetail, { data: detail, isFetching: isDetailFetching, isError: isDetailError, error: detailError }] =
    useLazyGetClaimQuery();

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

  function handleRowClick(claimNum: string) {
    setSelectedId(claimNum);
    triggerDetail(claimNum);
  }

  return (
    <div className="card">
      <div className="list-header">
        <h2>Claims{rows && <span className="count"> ({rows.length})</span>}</h2>
        <form className="search-bar" onSubmit={handleFilter}>
          <div className="field" style={{ flex: '0 0 180px' }}>
            <label>Filter by Policy #</label>
            <input
              value={filterInput}
              onChange={e => setFilterInput(e.target.value)}
              placeholder="leave blank for all"
            />
          </div>
          <button className="btn btn-secondary" type="submit" style={{ alignSelf: 'flex-end' }}>Filter</button>
          {filterArg && (
            <button className="btn btn-secondary" type="button" style={{ alignSelf: 'flex-end' }} onClick={handleClear}>Clear</button>
          )}
        </form>
      </div>

      {isError && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {isLoading && <span className="spinner" />}
      {rows?.length === 0 && <p style={{ color: 'var(--gray-600)', fontSize: '.875rem' }}>No claims found.</p>}

      {rows && rows.length > 0 && (
        <>
          <p style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginBottom: '.5rem' }}>
            {rows.length} result{rows.length !== 1 ? 's' : ''} — click a row for full detail
          </p>
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
                  onClick={() => handleRowClick(c.claim_num)}
                  style={{ cursor: 'pointer' }}
                >
                  <td><code>{c.claim_num}</code></td>
                  <td><code>{c.policy_num}</code></td>
                  <td>{c.claim_date}</td>
                  <td>{c.cause}</td>
                  <td>{c.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {selectedId && (
        <div className="detail-panel">
          <div className="detail-panel-header">
            <span>Claim {parseInt(selectedId, 10)} detail</span>
            <button
              type="button" className="btn btn-secondary"
              style={{ fontSize: '.75rem', padding: '.2rem .6rem' }}
              onClick={() => setSelectedId(null)}
            >
              Close
            </button>
          </div>
          {isDetailFetching && <span className="spinner" />}
          {isDetailError && <div className="alert alert-err">{(detailError as { error?: string }).error ?? 'Request failed'}</div>}
          {detail && !isDetailFetching && (
            <dl className="kv-grid">
              <dt>Claim #</dt>   <dd>{parseInt(detail.claim_num, 10)}</dd>
              <dt>Policy #</dt>  <dd>{parseInt(detail.policy_num, 10)}</dd>
              <dt>Claim date</dt><dd>{detail.claim_date}</dd>
              <dt>Paid</dt>      <dd>{detail.paid !== undefined ? parseInt(detail.paid, 10) : '—'}</dd>
              <dt>Value</dt>     <dd>{parseInt(detail.value, 10)}</dd>
              <dt>Cause</dt>     <dd>{detail.cause}</dd>
              <dt>Observations</dt><dd>{detail.observations ?? '—'}</dd>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
