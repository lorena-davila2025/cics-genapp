import { useState } from 'react';
import { api } from '../api';

export default function CustomerUpdate() {
  const [custId, setCustId] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function load(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await api.getCustomer(custId.trim());
      setForm({
        first_name: data.first_name || '',
        last_name:  data.last_name  || '',
        dob:        data.dob        || '',
        house_name: data.house_name || '',
        house_num:  data.house_num  || '',
        postcode:   data.postcode   || '',
        phone_mobile: data.phone_mobile || '',
        phone_home:   data.phone_home   || '',
        email:        data.email        || '',
      });
      setLoaded(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function save(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await api.updateCustomer(custId.trim(), form);
      setResult(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Update Customer</h2>

      {!loaded && (
        <form onSubmit={load}>
          <div className="form-row">
            <div className="field">
              <label>Customer Number</label>
              <input value={custId} onChange={e => setCustId(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-secondary" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Load'}
              </button>
            </div>
          </div>
          {error && <div className="alert alert-err">{error}</div>}
        </form>
      )}

      {loaded && (
        <form onSubmit={save}>
          <p style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginBottom: '.75rem' }}>
            Editing customer <strong>{parseInt(custId, 10)}</strong> &nbsp;
            <button type="button" className="btn btn-secondary"
              style={{ fontSize: '.75rem', padding: '.2rem .6rem' }}
              onClick={() => { setLoaded(false); setResult(null); setError(null); }}>
              Change
            </button>
          </p>
          <div className="form-row">
            <div className="field"><label>First name</label>
              <input value={form.first_name} onChange={set('first_name')} /></div>
            <div className="field"><label>Last name</label>
              <input value={form.last_name} onChange={set('last_name')} /></div>
            <div className="field"><label>DOB (YYYYMMDD)</label>
              <input value={form.dob} onChange={set('dob')} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>House name</label>
              <input value={form.house_name} onChange={set('house_name')} /></div>
            <div className="field"><label>House number</label>
              <input value={form.house_num} onChange={set('house_num')} /></div>
            <div className="field"><label>Postcode</label>
              <input value={form.postcode} onChange={set('postcode')} /></div>
          </div>
          <div className="form-row">
            <div className="field"><label>Mobile</label>
              <input value={form.phone_mobile} onChange={set('phone_mobile')} /></div>
            <div className="field"><label>Home phone</label>
              <input value={form.phone_home} onChange={set('phone_home')} /></div>
            <div className="field"><label>Email</label>
              <input value={form.email} onChange={set('email')} /></div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Save Changes'}
          </button>
          {error  && <div className="alert alert-err" style={{ marginTop: '1rem' }}>{error}</div>}
          {result && <div className="alert alert-ok" style={{ marginTop: '1rem' }}>{result}</div>}
        </form>
      )}
    </div>
  );
}
