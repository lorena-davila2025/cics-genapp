import { useState } from 'react';
import { useLazyGetCustomerQuery } from '../store/genappApi';

function fmtNum(s: string): string {
  return s ? String(parseInt(s, 10)) : s;
}

export default function CustomerLookup() {
  const [custId, setCustId] = useState('');
  const [trigger, { data: result, isLoading, isError, error }] = useLazyGetCustomerQuery();

  function lookup(e: React.FormEvent) {
    e.preventDefault();
    trigger(custId.trim());
  }

  return (
    <div className="card">
      <h2>Look up Customer</h2>
      <form onSubmit={lookup}>
        <div className="form-row">
          <div className="field">
            <label>Customer Number</label>
            <input
              value={custId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustId(e.target.value)}
              placeholder="e.g. 1"
              required
            />
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
            <dt>Customer #</dt><dd>{fmtNum(result.customer_num)}</dd>
            <dt>First name</dt><dd>{result.first_name}</dd>
            <dt>Last name</dt><dd>{result.last_name}</dd>
            <dt>Date of birth</dt><dd>{result.dob}</dd>
            <dt>House name</dt><dd>{result.house_name || '—'}</dd>
            <dt>House number</dt><dd>{result.house_num || '—'}</dd>
            <dt>Postcode</dt><dd>{result.postcode || '—'}</dd>
            <dt>Mobile</dt><dd>{result.phone_mobile || '—'}</dd>
            <dt>Home phone</dt><dd>{result.phone_home || '—'}</dd>
            <dt>Email</dt><dd>{result.email || '—'}</dd>
            <dt>Policies</dt><dd>{result.num_policies}</dd>
          </dl>
        </>
      )}
    </div>
  );
}
