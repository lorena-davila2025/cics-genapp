import { useState } from 'react';
import { api } from '../api';

export default function ClaimDelete() {
  const [claimId, setClaimId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    setLoading(true); setResult(null); setError(null); setConfirm(false);
    try {
      const data = await api.deleteClaim(claimId.trim());
      setResult(data.message);
      setClaimId('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Delete Claim</h2>
      <form onSubmit={handleDelete}>
        <div className="form-row">
          <div className="field">
            <label>Claim Number</label>
            <input value={claimId} onChange={e => { setClaimId(e.target.value); setConfirm(false); }} required />
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
            Permanently delete claim <strong>{parseInt(claimId, 10) || claimId}</strong>?
          </div>
        )}
      </form>
      {error  && <div className="alert alert-err">{error}</div>}
      {result && <div className="alert alert-ok">{result}</div>}
    </div>
  );
}
