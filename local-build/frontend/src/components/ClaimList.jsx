import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ClaimList() {
  const [polFilter, setPolFilter] = useState('');
  const [rows, setRows]           = useState(null);
  const [error, setError]         = useState(null);

  function load(pol) {
    setRows(null); setError(null);
    api.listClaims(pol || undefined)
      .then(setRows)
      .catch(err => setError(err.message));
  }

  useEffect(() => { load(''); }, []);

  function handleFilter(e) {
    e.preventDefault();
    load(polFilter.trim());
  }

  return (
    <div className="card">
      <h2>All Claims</h2>
      <form onSubmit={handleFilter} style={{ marginBottom: '1rem' }}>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>Filter by Policy #</label>
            <input
              value={polFilter}
              onChange={e => setPolFilter(e.target.value)}
              placeholder="leave blank for all"
            />
          </div>
          <button className="btn btn-secondary" type="submit">Filter</button>
          {polFilter && (
            <button className="btn btn-secondary" type="button"
              onClick={() => { setPolFilter(''); load(''); }}>Clear</button>
          )}
        </div>
      </form>

      {error && <div className="alert alert-err">{error}</div>}
      {!rows && !error && <span className="spinner" />}
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
