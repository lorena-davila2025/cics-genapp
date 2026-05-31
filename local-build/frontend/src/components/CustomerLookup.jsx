import { useState } from 'react';
import { api } from '../api';

function fmtNum(s) {
  return s ? String(parseInt(s, 10)) : s;
}

export default function CustomerLookup() {
  const [custId, setCustId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function lookup(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await api.getCustomer(custId.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Look up Customer</h2>
      <form onSubmit={lookup}>
        <div className="form-row">
          <div className="field">
            <label>Customer Number</label>
            <input
              value={custId}
              onChange={e => setCustId(e.target.value)}
              placeholder="e.g. 1"
              required
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-err">{error}</div>}

      {result && (
        <>
          <hr />
          <dl className="kv-grid">
            <dt>Customer #</dt><dd>{fmtNum(result.customer_num)}</dd>
            <dt>First name</dt><dd>{result.first_name}</dd>
            <dt>Last name</dt><dd>{result.last_name}</dd>
            <dt>Date of birth</dt><dd>{result.dob}</dd>
            <dt>House name</dt><dd>{result.house_name || '—'}</dd>
            <dt>House number</dt><dd>{result.house_num || '—'}</dd>
            <dt>Postcode</dt><dd>{result.postcode || '—'}</dd>
            <dt>Mobile</dt><dd>{result.phone_mobile || '—'}</dd>
            <dt>Home phone</dt><dd>{result.phone_home || '—'}</dd>
            <dt>Email</dt><dd>{result.email || '—'}</dd>
            <dt>Policies</dt><dd>{result.num_policies}</dd>
          </dl>
        </>
      )}
    </div>
  );
}
