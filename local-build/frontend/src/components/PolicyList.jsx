import { useState, useEffect } from 'react';
import { api } from '../api';

export default function PolicyList() {
  const [custFilter, setCustFilter] = useState('');
  const [rows, setRows]             = useState(null);
  const [error, setError]           = useState(null);

  function load(cust) {
    setRows(null); setError(null);
    api.listPolicies(cust || undefined)
      .then(setRows)
      .catch(err => setError(err.message));
  }

  useEffect(() => { load(''); }, []);

  function handleFilter(e) {
    e.preventDefault();
    load(custFilter.trim());
  }

  return (
    <div className="card">
      <h2>All Policies</h2>
      <form onSubmit={handleFilter} style={{ marginBottom: '1rem' }}>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ maxWidth: 200 }}>
            <label>Filter by Customer #</label>
            <input
              value={custFilter}
              onChange={e => setCustFilter(e.target.value)}
              placeholder="leave blank for all"
            />
          </div>
          <button className="btn btn-secondary" type="submit">Filter</button>
          {custFilter && (
            <button className="btn btn-secondary" type="button"
              onClick={() => { setCustFilter(''); load(''); }}>Clear</button>
          )}
        </div>
      </form>

      {error && <div className="alert alert-err">{error}</div>}
      {!rows && !error && <span className="spinner" />}
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
