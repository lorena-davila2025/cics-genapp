import { useState } from 'react';
import { useDeletePolicyMutation } from '../store/genappApi';
import type { PolicyType } from '../types';

const TYPE_LABELS: Record<PolicyType, string> = { E: 'Endowment', H: 'House', M: 'Motor', C: 'Commercial' };

export default function PolicyDelete() {
  const [custId, setCustId]   = useState('');
  const [polNum, setPolNum]   = useState('');
  const [polType, setPolType] = useState('H');
  const [confirm, setConfirm] = useState(false);
  const [deletePolicy, { isLoading, isError, error, data: result }] = useDeletePolicyMutation();

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    setConfirm(false);
    await deletePolicy({ custId: custId.trim(), polNum: polNum.trim(), polType });
  }

  return (
    <div className="card">
      <h2>Delete Policy</h2>
      <form onSubmit={handleDelete}>
        <div className="form-row">
          <div className="field">
            <label>Customer Number</label>
            <input value={custId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCustId(e.target.value); setConfirm(false); }} required />
          </div>
          <div className="field">
            <label>Policy Number</label>
            <input value={polNum} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPolNum(e.target.value); setConfirm(false); }} required />
          </div>
          <div className="field">
            <label>Policy Type</label>
            <select value={polType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setPolType(e.target.value); setConfirm(false); }}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{k} — {v}</option>
              ))}
            </select>
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
            Delete policy <strong>{parseInt(polNum, 10)}</strong> for customer{' '}
            <strong>{parseInt(custId, 10)}</strong>? This also removes any linked claims.
          </div>
        )}
      </form>
      {isError  && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {result   && <div className="alert alert-ok">{result.message}</div>}
    </div>
  );
}
