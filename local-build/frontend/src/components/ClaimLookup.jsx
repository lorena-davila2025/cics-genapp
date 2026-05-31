import { useState } from 'react';
import { api } from '../api';

export default function ClaimLookup() {
  const [claimId, setClaimId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  async function lookup(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await api.getClaim(claimId.trim());
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Look up Claim</h2>
      <form onSubmit={lookup}>
        <div className="form-row">
          <div className="field">
            <label>Claim Number</label>
            <input value={claimId} onChange={e => setClaimId(e.target.value)} required />
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
            <dt>Claim #</dt><dd>{parseInt(result.claim_num, 10)}</dd>
            <dt>Policy #</dt><dd>{parseInt(result.policy_num, 10)}</dd>
            <dt>Claim date</dt><dd>{result.claim_date}</dd>
            <dt>Paid</dt><dd>{parseInt(result.paid, 10)}</dd>
            <dt>Value</dt><dd>{parseInt(result.value, 10)}</dd>
            <dt>Cause</dt><dd>{result.cause}</dd>
            <dt>Observations</dt><dd>{result.observations}</dd>
          </dl>
        </>
      )}
    </div>
  );
}
