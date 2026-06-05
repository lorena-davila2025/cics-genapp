import { useState } from 'react';
import { useLazyGetPolicyQuery } from '../store/genappApi';
import type { Policy, PolicyType } from '../types';

const TYPE_LABELS: Record<PolicyType, string> = { E: 'Endowment', H: 'House', M: 'Motor', C: 'Commercial' };

function PolicyFields({ data }: { data: Policy }) {
  const type = data.policy_type?.trim().toUpperCase().charAt(0) ?? '';

  const common: [string, string | number | undefined][] = [
    ['Customer #', parseInt(data.customer_num, 10)],
    ['Policy #', parseInt(data.policy_num, 10)],
    ['Type', data.policy_type],
    ['Issue date', data.issue_date],
    ['Expiry date', data.expiry_date],
    ['Last changed', data.last_changed],
    ['Broker ID', data.broker_id !== undefined ? parseInt(data.broker_id, 10) : undefined],
    ['Brokers ref', data.brokers_ref],
    ['Payment', data.payment],
  ];

  const typeFields: Record<string, [string, string | undefined][]> = {
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

  const rows = [...common, ...(typeFields[type] ?? [])];

  return (
    <dl className="kv-grid">
      {rows.map(([k, v]) => (
        <>
          <dt key={String(k) + '-k'}>{k}</dt>
          <dd key={String(k) + '-v'}>{v ?? '—'}</dd>
        </>
      ))}
    </dl>
  );
}

export default function PolicyLookup() {
  const [custId, setCustId]   = useState('');
  const [polNum, setPolNum]   = useState('');
  const [polType, setPolType] = useState('H');
  const [trigger, { data: result, isLoading, isError, error }] = useLazyGetPolicyQuery();

  function lookup(e: React.FormEvent) {
    e.preventDefault();
    trigger({ custId: custId.trim(), polNum: polNum.trim(), polType });
  }

  return (
    <div className="card">
      <h2>Look up Policy</h2>
      <form onSubmit={lookup}>
        <div className="form-row">
          <div className="field">
            <label>Customer Number</label>
            <input value={custId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustId(e.target.value)} required />
          </div>
          <div className="field">
            <label>Policy Number</label>
            <input value={polNum} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPolNum(e.target.value)} required />
          </div>
          <div className="field">
            <label>Policy Type</label>
            <select value={polType} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPolType(e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{k} — {v}</option>
              ))}
            </select>
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
          <PolicyFields data={result} />
        </>
      )}
    </div>
  );
}
