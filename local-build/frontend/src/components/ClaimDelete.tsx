import { useState } from 'react';
import { useDeleteClaimMutation } from '../store/genappApi';

export default function ClaimDelete() {
  const [claimId, setClaimId] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [deleteClaim, { isLoading, isError, error, data: result }] = useDeleteClaimMutation();

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    setConfirm(false);
    const outcome = await deleteClaim(claimId.trim());
    if (!('error' in outcome)) setClaimId('');
  }

  return (
    <div className="card">
      <h2>Delete Claim</h2>
      <form onSubmit={handleDelete}>
        <div className="form-row">
          <div className="field">
            <label>Claim Number</label>
            <input value={claimId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setClaimId(e.target.value); setConfirm(false); }} required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '.5rem' }}>
            <button className="btn btn-danger" type="submit" disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : confirm ? 'Confirm Delete' : 'Delete'}
            </button>
            {confirm && (
              <button type="button" className="btn btn-secondary" onClick={() => setConfirm(false)}>Cancel</button>
            )}
          </div>
        </div>
        {confirm && (
          <div className="alert alert-warn">
            Permanently delete claim <strong>{parseInt(claimId, 10) || claimId}</strong>?
          </div>
        )}
      </form>
      {isError  && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {result   && <div className="alert alert-ok">{result.message}</div>}
    </div>
  );
}
