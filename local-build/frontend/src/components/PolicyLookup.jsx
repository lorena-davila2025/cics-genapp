import { useState } from 'react';
import { api } from '../api';

const TYPE_LABELS = { E: 'Endowment', H: 'House', M: 'Motor', C: 'Commercial' };

function PolicyFields({ data }) {
  const type = data.policy_type?.trim().toUpperCase().charAt(0) || '';

  const common = [
    ['Customer #', parseInt(data.customer_num, 10)],
    ['Policy #', parseInt(data.policy_num, 10)],
    ['Type', data.policy_type],
    ['Issue date', data.issue_date],
    ['Expiry date', data.expiry_date],
    ['Last changed', data.last_changed],
    ['Broker ID', parseInt(data.broker_id, 10)],
    ['Brokers ref', data.brokers_ref],
    ['Payment', data.payment],
  ];

  const typeFields = {
    E: [
      ['With profits', data.with_profits],
      ['Equities', data.equities],
      ['Managed fund', data.managed_fund],
      ['Fund name', data.fund_name],
      ['Term', data.term],
      ['Sum assured', data.sum_assured],
      ['Life assured', data.life_assured],
    ],
    H: [
      ['Property type', data.property_type],
      ['Bedrooms', data.bedrooms],
      ['Value', data.value],
      ['House name', data.house_name],
      ['House number', data.house_number],
      ['Postcode', data.postcode],
    ],
    M: [
      ['Make', data.make],
      ['Model', data.model],
      ['Value', data.value],
      ['Reg number', data.reg_number],
      ['Colour', data.colour],
      ['CC', data.cc],
      ['Manufactured', data.manufactured],
      ['Premium', data.premium],
      ['Accidents', data.accidents],
    ],
    C: [
      ['Address', data.address],
      ['Postcode', data.postcode],
      ['Latitude', data.latitude],
      ['Longitude', data.longitude],
      ['Fire peril', data.fire_peril],
      ['Fire premium', data.fire_premium],
      ['Crime peril', data.crime_peril],
      ['Crime premium', data.crime_premium],
      ['Flood peril', data.flood_peril],
      ['Flood premium', data.flood_premium],
      ['Weather peril', data.weather_peril],
      ['Weather premium', data.weather_premium],
      ['Status code', data.status_code],
    ],
  };

  const rows = [...common, ...(typeFields[type] || [])];

  return (
    <dl className="kv-grid">
      {rows.map(([k, v]) => (
        <>
          <dt key={k + '-k'}>{k}</dt>
          <dd key={k + '-v'}>{v ?? '—'}</dd>
        </>
      ))}
    </dl>
  );
}

export default function PolicyLookup() {
  const [custId, setCustId]   = useState('');
  const [polNum, setPolNum]   = useState('');
  const [polType, setPolType] = useState('H');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  async function lookup(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);
    try {
      const data = await api.getPolicy(custId.trim(), polNum.trim(), polType);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Look up Policy</h2>
      <form onSubmit={lookup}>
        <div className="form-row">
          <div className="field">
            <label>Customer Number</label>
            <input value={custId} onChange={e => setCustId(e.target.value)} required />
          </div>
          <div className="field">
            <label>Policy Number</label>
            <input value={polNum} onChange={e => setPolNum(e.target.value)} required />
          </div>
          <div className="field">
            <label>Policy Type</label>
            <select value={polType} onChange={e => setPolType(e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{k} — {v}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {error  && <div className="alert alert-err">{error}</div>}
      {result && (
        <>
          <hr />
          <PolicyFields data={result} />
        </>
      )}
    </div>
  );
}
