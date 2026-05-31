import { useState } from 'react';
import { api } from '../api';

const TYPE_LABELS = { E: 'Endowment', H: 'House', M: 'Motor', C: 'Commercial' };

export default function PolicyDelete() {
  const [custId, setCustId]   = useState('');
  const [polNum, setPolNum]   = useState('');
  const [polType, setPolType] = useState('H');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    setLoading(true); setResult(null); setError(null); setConfirm(false);
    try {
      const data = await api.deletePolicy(custId.trim(), polNum.trim(), polType);
      setResult(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Delete Policy</h2>
      <form onSubmit={handleDelete}>
        <div className="form-row">
          <div className="field">
            <label>Customer Number</label>
            <input value={custId} onChange={e => { setCustId(e.target.value); setConfirm(false); }} required />
          </div>
          <div className="field">
            <label>Policy Number</label>
            <input value={polNum} onChange={e => { setPolNum(e.target.value); setConfirm(false); }} required />
          </div>
          <div className="field">
            <label>Policy Type</label>
            <select value={polType} onChange={e => { setPolType(e.target.value); setConfirm(false); }}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{k} — {v}</option>
              ))}
            </select>
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
            Delete policy <strong>{parseInt(polNum, 10)}</strong> for customer{' '}
            <strong>{parseInt(custId, 10)}</strong>? This also removes any linked claims.
          </div>
        )}
      </form>
      {error  && <div className="alert alert-err">{error}</div>}
      {result && <div className="alert alert-ok">{result}</div>}
    </div>
  );
}
