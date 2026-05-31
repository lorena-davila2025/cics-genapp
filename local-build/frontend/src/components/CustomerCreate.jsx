import { useState } from 'react';
import { api } from '../api';

const EMPTY = {
  first_name: '', last_name: '', dob: '',
  house_name: '', house_num: '', postcode: '',
  phone_mobile: '', phone_home: '', email: '',
};

export default function CustomerCreate() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await api.createCustomer(form);
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
      <h2>Create Customer</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="field">
            <label>First name *</label>
            <input value={form.first_name} onChange={set('first_name')} required />
          </div>
          <div className="field">
            <label>Last name *</label>
            <input value={form.last_name} onChange={set('last_name')} required />
          </div>
          <div className="field">
            <label>Date of birth * (YYYYMMDD)</label>
            <input value={form.dob} onChange={set('dob')} placeholder="19800115" required />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>House name</label>
            <input value={form.house_name} onChange={set('house_name')} />
          </div>
          <div className="field">
            <label>House number</label>
            <input value={form.house_num} onChange={set('house_num')} />
          </div>
          <div className="field">
            <label>Postcode</label>
            <input value={form.postcode} onChange={set('postcode')} />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Mobile</label>
            <input value={form.phone_mobile} onChange={set('phone_mobile')} />
          </div>
          <div className="field">
            <label>Home phone</label>
            <input value={form.phone_home} onChange={set('phone_home')} />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={form.email} onChange={set('email')} type="email" />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Create Customer'}
        </button>
      </form>

      {error && <div className="alert alert-err" style={{ marginTop: '1rem' }}>{error}</div>}
      {result && (
        <div className="alert alert-ok" style={{ marginTop: '1rem' }}>
          Customer created — number: <strong>{parseInt(result.customer_num, 10)}</strong>
        </div>
      )}
    </div>
  );
}
