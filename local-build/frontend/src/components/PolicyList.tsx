import { useState } from 'react';
import { useListPoliciesQuery, useLazyGetPolicyQuery, useDeletePolicyMutation } from '../store/genappApi';
import type { Policy, PolicyType } from '../types';

const TYPE_LABELS: Record<PolicyType, string> = { E: 'Endowment', H: 'House', M: 'Motor', C: 'Commercial' };

type PanelMode = 'view' | 'delete';

function PolicyDetail({ data }: { data: Policy }) {
  const type = data.policy_type?.trim().toUpperCase().charAt(0) ?? '';

  const common: [string, string | number | undefined][] = [
    ['Customer #',  parseInt(data.customer_num, 10)],
    ['Policy #',    parseInt(data.policy_num, 10)],
    ['Type',        data.policy_type],
    ['Issue date',  data.issue_date],
    ['Expiry date', data.expiry_date],
    ['Last changed',data.last_changed],
    ['Broker ID',   data.broker_id !== undefined ? parseInt(data.broker_id, 10) : undefined],
    ['Brokers ref', data.brokers_ref],
    ['Payment',     data.payment],
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
        <div key={String(k)}>
          <dt>{k}</dt>
          <dd>{v ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function PolicyList() {
  // Server-side filter
  const [custInput,  setCustInput]  = useState('');
  const [filterArg,  setFilterArg]  = useState<string | undefined>(undefined);

  // Client-side filters
  const [typeFilter,     setTypeFilter]     = useState<PolicyType | ''>('');
  const [issueDateFrom,  setIssueDateFrom]  = useState('');
  const [issueDateTo,    setIssueDateTo]    = useState('');
  const [expiryDateFrom, setExpiryDateFrom] = useState('');
  const [expiryDateTo,   setExpiryDateTo]   = useState('');

  // Selection + panel
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [mode,        setMode]        = useState<PanelMode>('view');

  const { data: rows, isLoading, isError, error } = useListPoliciesQuery(filterArg);
  const [triggerDetail, { data: detail, isFetching: detailFetching, isError: detailErr, error: detailError }] =
    useLazyGetPolicyQuery();
  const [deletePolicy, { isLoading: deleting, isError: deleteErr, error: deleteError }] =
    useDeletePolicyMutation();

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    setFilterArg(custInput.trim() || undefined);
    setSelectedKey(null);
  }

  function clearFilters() {
    setCustInput('');
    setFilterArg(undefined);
    setTypeFilter('');
    setIssueDateFrom('');
    setIssueDateTo('');
    setExpiryDateFrom('');
    setExpiryDateTo('');
    setSelectedKey(null);
  }

  function rowKey(p: Policy) {
    const code = (p.policy_type_code ?? p.policy_type.trim().charAt(0)) as PolicyType;
    return `${p.customer_num}-${p.policy_num}-${code}`;
  }

  function selectRow(p: Policy) {
    const key = rowKey(p);
    if (selectedKey === key) { setSelectedKey(null); return; }
    const typeCode = (p.policy_type_code ?? p.policy_type.trim().charAt(0)) as PolicyType;
    setSelectedKey(key);
    setMode('view');
    triggerDetail({ custId: p.customer_num, polNum: p.policy_num, polType: typeCode });
  }

  async function handleDelete() {
    if (!detail) return;
    const typeCode = (detail.policy_type_code ?? detail.policy_type.trim().charAt(0)) as PolicyType;
    const outcome = await deletePolicy({
      custId: detail.customer_num,
      polNum: detail.policy_num,
      polType: typeCode,
    });
    if (!('error' in outcome)) {
      setSelectedKey(null);
      setMode('view');
    }
  }

  const hasClientFilters = typeFilter || issueDateFrom || issueDateTo || expiryDateFrom || expiryDateTo;
  const hasAnyFilter = custInput || filterArg || hasClientFilters;

  const filtered = rows?.filter(p => {
    if (typeFilter) {
      const code = (p.policy_type_code ?? p.policy_type.trim().charAt(0)) as PolicyType;
      if (code !== typeFilter) return false;
    }
    if (issueDateFrom  && p.issue_date  < issueDateFrom)  return false;
    if (issueDateTo    && p.issue_date  > issueDateTo)    return false;
    if (expiryDateFrom && p.expiry_date < expiryDateFrom) return false;
    if (expiryDateTo   && p.expiry_date > expiryDateTo)   return false;
    return true;
  });

  const selectedRow = filtered?.find(p => rowKey(p) === selectedKey);

  return (
    <div className="card">
      <div className="page-header">
        <h2>Policies</h2>
        {rows && <span className="count">{filtered?.length ?? rows.length} of {rows.length}</span>}
      </div>

      <form className="filter-section" onSubmit={handleFilter}>
        <div className="field">
          <label>Customer #</label>
          <input value={custInput} onChange={e => setCustInput(e.target.value)} placeholder="All customers" />
        </div>
        <div className="field">
          <label>Policy type</label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as PolicyType | '')}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{k} — {v}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Issue date from</label>
          <input type="date" value={issueDateFrom} onChange={e => setIssueDateFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>Issue date to</label>
          <input type="date" value={issueDateTo} onChange={e => setIssueDateTo(e.target.value)} />
        </div>
        <div className="field">
          <label>Expiry date from</label>
          <input type="date" value={expiryDateFrom} onChange={e => setExpiryDateFrom(e.target.value)} />
        </div>
        <div className="field">
          <label>Expiry date to</label>
          <input type="date" value={expiryDateTo} onChange={e => setExpiryDateTo(e.target.value)} />
        </div>
        <div className="filter-actions">
          <button className="btn btn-secondary btn-sm" type="submit">Apply</button>
          {hasAnyFilter && (
            <button className="btn btn-ghost btn-sm" type="button" onClick={clearFilters}>Clear</button>
          )}
        </div>
      </form>

      {isError && <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {isLoading && <div className="empty-state"><span className="spinner" /></div>}
      {filtered?.length === 0 && !isLoading && <div className="empty-state">No policies match the current filters.</div>}

      {filtered && filtered.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Policy #</th><th>Customer #</th><th>Type</th>
                <th>Issue Date</th><th>Expiry Date</th><th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const key = rowKey(p);
                const typeCode = (p.policy_type_code ?? p.policy_type.trim().charAt(0)) as PolicyType;
                return (
                  <tr
                    key={key}
                    className={selectedKey === key ? 'row-selected' : undefined}
                    onClick={() => selectRow(p)}
                  >
                    <td><code>{parseInt(p.policy_num, 10)}</code></td>
                    <td><code>{parseInt(p.customer_num, 10)}</code></td>
                    <td><span className="pill pill-ok">{TYPE_LABELS[typeCode] ?? p.policy_type}</span></td>
                    <td>{p.issue_date}</td>
                    <td>{p.expiry_date}</td>
                    <td>{p.payment || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail panel ── */}
      {selectedKey && (
        <div className="detail-panel">
          <div className="detail-panel-header">
            <span className="detail-panel-title">
              Policy {selectedRow ? parseInt(selectedRow.policy_num, 10) : '…'}
            </span>
            {mode === 'view' && !detailFetching && detail && (
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                onClick={() => setMode('delete')}>Delete</button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedKey(null); setMode('view'); }}>✕</button>
          </div>

          {detailFetching && <span className="spinner" />}
          {detailErr && <div className="alert alert-err">{(detailError as { error?: string }).error ?? 'Request failed'}</div>}

          {detail && !detailFetching && mode === 'view' && <PolicyDetail data={detail} />}

          {mode === 'delete' && detail && (
            <>
              <div className="alert alert-warn">
                Delete policy <strong>{parseInt(detail.policy_num, 10)}</strong> for customer{' '}
                <strong>{parseInt(detail.customer_num, 10)}</strong>?
                This also removes any linked claims.
              </div>
              <div className="detail-actions">
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <span className="spinner" /> : 'Confirm delete'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setMode('view')}>Cancel</button>
              </div>
              {deleteErr && <div className="alert alert-err" style={{ marginTop: '.75rem' }}>{(deleteError as { error?: string }).error ?? 'Request failed'}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
