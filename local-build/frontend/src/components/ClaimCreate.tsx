import { useState } from 'react';
import { useCreateClaimMutation } from '../store/genappApi';
import type { Claim } from '../types';

type ClaimForm = Required<Pick<Claim, 'policy_num' | 'claim_date' | 'paid' | 'value' | 'cause' | 'observations'>>;

const EMPTY: ClaimForm = {
  policy_num: '', claim_date: '', paid: '', value: '',
  cause: '', observations: '',
};

export default function ClaimCreate() {
  const [form, setForm] = useState<ClaimForm>(EMPTY);
  const [createClaim, { isLoading, isError, error, data: result }] = useCreateClaimMutation();

  function set(field: keyof ClaimForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const outcome = await createClaim(form);
    if (!('error' in outcome)) setForm(EMPTY);
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
        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? <span className="spinner" /> : 'Create Claim'}
        </button>
      </form>

      {isError && <div className="alert alert-err" style={{ marginTop: '1rem' }}>{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {result && (
        <div className="alert alert-ok" style={{ marginTop: '1rem' }}>
          Claim created — number: <strong>{parseInt(result.claim_num, 10)}</strong>
        </div>
      )}
    </div>
  );
}
