import { useState } from 'react';
import { useListClaimsQuery } from '../store/genappApi';

export default function ClaimList() {
  const [filterInput, setFilterInput] = useState('');
  const [filterArg,   setFilterArg]   = useState<string | undefined>(undefined);

  const { data: rows, isLoading, isError, error } = useListClaimsQuery(filterArg);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setFilterArg(filterInput.trim() || undefined);
  }

  function handleClear() {
    setFilterInput('');
    setFilterArg(undefined);
  }

  return (
    <div className="card">
      <h2>All Claims</h2>
      <form onSubmit={handleFilter} style={{ marginBottom: '1rem' }}>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>Filter by Policy #</label>
            <input
              value={filterInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterInput(e.target.value)}
              placeholder="leave blank for all"
            />
          </div>
          <button className="btn btn-secondary" type="submit">Filter</button>
          {filterArg && (
            <button className="btn btn-secondary" type="button" onClick={handleClear}>Clear</button>
          )}
        </div>
      </form>

      {isError && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {isLoading && <span className="spinner" />}
      {rows && rows.length === 0 && (
        <p style={{ color: 'var(--gray-600)', fontSize: '.875rem' }}>No claims found.</p>
      )}
      {rows && rows.length > 0 && (
        <>
          <p style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginBottom: '.5rem' }}>{rows.length} result{rows.length !== 1 ? 's' : ''}</p>
          <table>
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Policy #</th>
                <th>Date</th>
                <th>Cause</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.claim_num}>
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
    </div>
  );
}
