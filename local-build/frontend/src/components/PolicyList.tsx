import { useState } from 'react';
import { useListPoliciesQuery, useLazyGetPolicyQuery } from '../store/genappApi';
import type { Policy, PolicyType } from '../types';

const TYPE_LABELS: Record<PolicyType, string> = { E: 'Endowment', H: 'House', M: 'Motor', C: 'Commercial' };

function PolicyDetail({ data }: { data: Policy }) {
  const type = data.policy_type?.trim().toUpperCase().charAt(0) ?? '';

  const common: [string, string | number | undefined][] = [
    ['Customer #', parseInt(data.customer_num, 10)],
    ['Policy #',   parseInt(data.policy_num, 10)],
    ['Type',       data.policy_type],
    ['Issue date', data.issue_date],
    ['Expiry date',data.expiry_date],
    ['Last changed', data.last_changed],
    ['Broker ID',  data.broker_id !== undefined ? parseInt(data.broker_id, 10) : undefined],
    ['Brokers ref',data.brokers_ref],
    ['Payment',    data.payment],
  ];

  const typeFields: Record<string, [string, string | undefined][]> = {
    E: [
      ['With profits', data.with_profits], ['Equities', data.equities],
      ['Managed fund', data.managed_fund], ['Fund name', data.fund_name],
      ['Term', data.term], ['Sum assured', data.sum_assured], ['Life assured', data.life_assured],
    ],
    H: [
      ['Property type', data.property_type], ['Bedrooms', data.bedrooms],
      ['Value', data.value], ['House name', data.house_name],
      ['House number', data.house_number], ['Postcode', data.postcode],
    ],
    M: [
      ['Make', data.make], ['Model', data.model], ['Value', data.value],
      ['Reg number', data.reg_number], ['Colour', data.colour], ['CC', data.cc],
      ['Manufactured', data.manufactured], ['Premium', data.premium], ['Accidents', data.accidents],
    ],
    C: [
      ['Address', data.address], ['Postcode', data.postcode],
      ['Latitude', data.latitude], ['Longitude', data.longitude],
      ['Fire peril', data.fire_peril], ['Fire premium', data.fire_premium],
      ['Crime peril', data.crime_peril], ['Crime premium', data.crime_premium],
      ['Flood peril', data.flood_peril], ['Flood premium', data.flood_premium],
      ['Weather peril', data.weather_peril], ['Weather premium', data.weather_premium],
      ['Status code', data.status_code],
    ],
  };

  return (
    <dl className="kv-grid">
      {[...common, ...(typeFields[type] ?? [])].map(([k, v]) => (
        <>
          <dt key={String(k) + '-k'}>{k}</dt>
          <dd key={String(k) + '-v'}>{v ?? '—'}</dd>
        </>
      ))}
    </dl>
  );
}

export default function PolicyList() {
  const [filterInput, setFilterInput] = useState('');
  const [filterArg,   setFilterArg]   = useState<string | undefined>(undefined);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const { data: rows, isLoading, isError, error } = useListPoliciesQuery(filterArg);
  const [triggerDetail, { data: detail, isFetching: isDetailFetching, isError: isDetailError, error: detailError }] =
    useLazyGetPolicyQuery();

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setFilterArg(filterInput.trim() || undefined);
    setSelectedKey(null);
  }

  function handleClear() {
    setFilterInput('');
    setFilterArg(undefined);
    setSelectedKey(null);
  }

  function handleRowClick(p: Policy) {
    const typeCode = (p.policy_type_code ?? p.policy_type.trim().charAt(0)) as PolicyType;
    const key = `${p.customer_num}-${p.policy_num}-${typeCode}`;
    setSelectedKey(key);
    triggerDetail({ custId: p.customer_num, polNum: p.policy_num, polType: typeCode });
  }

  const selectedRow = rows?.find(p => {
    const typeCode = (p.policy_type_code ?? p.policy_type.trim().charAt(0)) as PolicyType;
    return `${p.customer_num}-${p.policy_num}-${typeCode}` === selectedKey;
  });

  return (
    <div className="card">
      <div className="list-header">
        <h2>Policies{rows && <span className="count"> ({rows.length})</span>}</h2>
        <form className="search-bar" onSubmit={handleFilter}>
          <div className="field" style={{ flex: '0 0 180px' }}>
            <label>Filter by Customer #</label>
            <input
              value={filterInput}
              onChange={e => setFilterInput(e.target.value)}
              placeholder="leave blank for all"
            />
          </div>
          <button className="btn btn-secondary" type="submit" style={{ alignSelf: 'flex-end' }}>Filter</button>
          {filterArg && (
            <button className="btn btn-secondary" type="button" style={{ alignSelf: 'flex-end' }} onClick={handleClear}>Clear</button>
          )}
        </form>
      </div>

      {isError && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {isLoading && <span className="spinner" />}
      {rows?.length === 0 && <p style={{ color: 'var(--gray-600)', fontSize: '.875rem' }}>No policies found.</p>}

      {rows && rows.length > 0 && (
        <>
          <p style={{ fontSize: '.8rem', color: 'var(--gray-600)', marginBottom: '.5rem' }}>
            {rows.length} result{rows.length !== 1 ? 's' : ''} — click a row for full detail
          </p>
          <table>
            <thead>
              <tr>
                <th>Policy #</th><th>Customer #</th><th>Type</th>
                <th>Issue Date</th><th>Expiry Date</th><th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => {
                const typeCode = (p.policy_type_code ?? p.policy_type.trim().charAt(0)) as PolicyType;
                const key = `${p.customer_num}-${p.policy_num}-${typeCode}`;
                return (
                  <tr
                    key={key}
                    className={selectedKey === key ? 'row-selected' : undefined}
                    onClick={() => handleRowClick(p)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td><code>{p.policy_num}</code></td>
                    <td><code>{p.customer_num}</code></td>
                    <td><span className="pill pill-ok">{TYPE_LABELS[typeCode] ?? p.policy_type}</span></td>
                    <td>{p.issue_date}</td>
                    <td>{p.expiry_date}</td>
                    <td>{p.payment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      {selectedKey && (
        <div className="detail-panel">
          <div className="detail-panel-header">
            <span>
              Policy {selectedRow ? parseInt(selectedRow.policy_num, 10) : ''} detail
            </span>
            <button
              type="button" className="btn btn-secondary"
              style={{ fontSize: '.75rem', padding: '.2rem .6rem' }}
              onClick={() => setSelectedKey(null)}
            >
              Close
            </button>
          </div>
          {isDetailFetching && <span className="spinner" />}
          {isDetailError && <div className="alert alert-err">{(detailError as { error?: string }).error ?? 'Request failed'}</div>}
          {detail && !isDetailFetching && <PolicyDetail data={detail} />}
        </div>
      )}
    </div>
  );
}
