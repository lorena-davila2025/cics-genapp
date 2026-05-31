import { useState } from 'react';
import { api } from '../api';

export default function CustomerDelete() {
  const [custId, setCustId]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    setLoading(true); setResult(null); setError(null); setConfirm(false);
    try {
      const data = await api.deleteCustomer(custId.trim());
      setResult(data.message);
      setCustId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Delete Customer</h2>
      <form onSubmit={handleDelete}>
        <div className="form-row">
          <div className="field">
            <label>Customer Number</label>
            <input value={custId} onChange={e => { setCustId(e.target.value); setConfirm(false); }} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem' }}>
            <button className="btn btn-danger" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : confirm ? 'Confirm Delete' : 'Delete'}
            </button>
            {confirm && (
              <button type="button" className="btn btn-secondary"
                onClick={() => setConfirm(false)}>Cancel</button>
            )}
          </div>
        </div>
        {confirm && (
          <div className="alert alert-warn">
            This will permanently delete customer <strong>{parseInt(custId, 10)}</strong> and
            all their policies and claims. Click <em>Confirm Delete</em> to proceed.
          </div>
        )}
      </form>
      {error  && <div className="alert alert-err">{error}</div>}
      {result && <div className="alert alert-ok">{result}</div>}
    </div>
  );
}
