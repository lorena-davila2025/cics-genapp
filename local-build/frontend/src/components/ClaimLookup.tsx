import { useState } from 'react';
import { useLazyGetClaimQuery } from '../store/genappApi';

export default function ClaimLookup() {
  const [claimId, setClaimId] = useState('');
  const [trigger, { data: result, isLoading, isError, error }] = useLazyGetClaimQuery();

  function lookup(e: React.FormEvent) {
    e.preventDefault();
    trigger(claimId.trim());
  }

  return (
    <div className="card">
      <h2>Look up Claim</h2>
      <form onSubmit={lookup}>
        <div className="form-row">
          <div className="field">
            <label>Claim Number</label>
            <input value={claimId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimId(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {isError && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {result && (
        <>
          <hr />
          <dl className="kv-grid">
            <dt>Claim #</dt><dd>{parseInt(result.claim_num, 10)}</dd>
            <dt>Policy #</dt><dd>{parseInt(result.policy_num, 10)}</dd>
            <dt>Claim date</dt><dd>{result.claim_date}</dd>
            <dt>Paid</dt><dd>{result.paid !== undefined ? parseInt(result.paid, 10) : '—'}</dd>
            <dt>Value</dt><dd>{parseInt(result.value, 10)}</dd>
            <dt>Cause</dt><dd>{result.cause}</dd>
            <dt>Observations</dt><dd>{result.observations ?? '—'}</dd>
          </dl>
        </>
      )}
    </div>
  );
}
