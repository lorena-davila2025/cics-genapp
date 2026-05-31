import { useState } from 'react';
import { api } from '../api';

const EMPTY = {
  policy_num: '', claim_date: '', paid: '', value: '',
  cause: '', observations: '',
};

export default function ClaimCreate() {
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await api.createClaim(form);
      setResult(data);
      setForm(EMPTY);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Create Claim</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="field"><label>Policy Number *</label>
            <input value={form.policy_num} onChange={set('policy_num')} required /></div>
          <div className="field"><label>Claim date (YYYY-MM-DD)</label>
            <input value={form.claim_date} onChange={set('claim_date')} placeholder="2024-06-15" /></div>
          <div className="field"><label>Paid</label>
            <input value={form.paid} onChange={set('paid')} /></div>
          <div className="field"><label>Value</label>
            <input value={form.value} onChange={set('value')} /></div>
        </div>
        <div className="form-row">
          <div className="field"><label>Cause</label>
            <input value={form.cause} onChange={set('cause')} /></div>
          <div className="field"><label>Observations</label>
            <input value={form.observations} onChange={set('observations')} /></div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Create Claim'}
        </button>
      </form>

      {error && <div className="alert alert-err" style={{ marginTop: '1rem' }}>{error}</div>}
      {result && (
        <div className="alert alert-ok" style={{ marginTop: '1rem' }}>
          Claim created — number: <strong>{parseInt(result.claim_num, 10)}</strong>
        </div>
      )}
    </div>
  );
}
