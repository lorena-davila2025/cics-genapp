import { useState } from 'react';
import { useListPoliciesQuery } from '../store/genappApi';

export default function PolicyList() {
  const [filterInput, setFilterInput] = useState('');
  const [filterArg,   setFilterArg]   = useState<string | undefined>(undefined);

  const { data: rows, isLoading, isError, error } = useListPoliciesQuery(filterArg);

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
      <h2>All Policies</h2>
      <form onSubmit={handleFilter} style={{ marginBottom: '1rem' }}>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>Filter by Customer #</label>
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
        <p style={{ color: 'var(--gray-600)', fontSize: '.875rem' }}>No policies found.</p>
      )}
      {rows && rows.length > 0 && (
        <>
          <p style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginBottom: '.5rem' }}>{rows.length} result{rows.length !== 1 ? 's' : ''}</p>
          <table>
            <thead>
              <tr>
                <th>Policy #</th>
                <th>Customer #</th>
                <th>Type</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.policy_num}>
                  <td><code>{p.policy_num}</code></td>
                  <td><code>{p.customer_num}</code></td>
                  <td><span className="pill pill-ok">{p.policy_type}</span></td>
                  <td>{p.issue_date}</td>
                  <td>{p.expiry_date}</td>
                  <td>{p.payment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
