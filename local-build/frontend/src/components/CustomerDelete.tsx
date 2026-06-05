import { useState } from 'react';
import { useDeleteCustomerMutation } from '../store/genappApi';

export default function CustomerDelete() {
  const [custId, setCustId]   = useState('');
  const [confirm, setConfirm] = useState(false);
  const [deleteCustomer, { isLoading, isError, error, data: result }] = useDeleteCustomerMutation();

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm) { setConfirm(true); return; }
    setConfirm(false);
    const outcome = await deleteCustomer(custId.trim());
    if (!('error' in outcome)) setCustId('');
  }

  return (
    <div className="card">
      <h2>Delete Customer</h2>
      <form onSubmit={handleDelete}>
        <div className="form-row">
          <div className="field">
            <label>Customer Number</label>
            <input value={custId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCustId(e.target.value); setConfirm(false); }} required />
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
            This will permanently delete customer <strong>{parseInt(custId, 10)}</strong> and
            all their policies and claims. Click <em>Confirm Delete</em> to proceed.
          </div>
        )}
      </form>
      {isError  && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {result   && <div className="alert alert-ok">{result.message}</div>}
    </div>
  );
}
