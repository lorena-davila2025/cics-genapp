import { useState } from 'react';
import {
  useListCustomersQuery,
  useLazyGetCustomerQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '../store/genappApi';
import type { Customer } from '../types';

type CustomerForm = Required<Pick<Customer,
  'first_name' | 'last_name' | 'dob' | 'house_name' | 'house_num' |
  'postcode' | 'phone_mobile' | 'phone_home' | 'email'>>;

const EMPTY_FORM: CustomerForm = {
  first_name: '', last_name: '', dob: '',
  house_name: '', house_num: '', postcode: '',
  phone_mobile: '', phone_home: '', email: '',
};

type PanelMode = 'view' | 'edit' | 'delete';

export default function CustomerList() {
  // Filters (all client-side — full list loads on mount)
  const [custNumFilter,  setCustNumFilter]  = useState('');
  const [nameFilter,     setNameFilter]     = useState('');
  const [dobFilter,      setDobFilter]      = useState('');
  const [postcodeFilter, setPostcodeFilter] = useState('');
  const [minPolicies,    setMinPolicies]    = useState('');

  // Selection + panel
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode,       setMode]       = useState<PanelMode>('view');
  const [editForm,   setEditForm]   = useState<CustomerForm>(EMPTY_FORM);

  const { data: rows, isLoading, isError, error } = useListCustomersQuery();
  const [triggerDetail, { data: detail, isFetching: detailFetching, isError: detailErr, error: detailError }] =
    useLazyGetCustomerQuery();
  const [updateCustomer, { isLoading: saving, isError: saveErr, error: saveError, data: saveResult }] =
    useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: deleting, isError: deleteErr, error: deleteError }] =
    useDeleteCustomerMutation();

  function setField(field: keyof CustomerForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setEditForm(f => ({ ...f, [field]: e.target.value }));
  }

  function selectRow(custNum: string) {
    if (selectedId === custNum) { closePanel(); return; }
    setSelectedId(custNum);
    setMode('view');
    triggerDetail(custNum);
  }

  function startEdit() {
    setMode('edit');
    setEditForm(detail ? {
      first_name:   detail.first_name    || '',
      last_name:    detail.last_name     || '',
      dob:          detail.dob           || '',
      house_name:   detail.house_name    || '',
      house_num:    detail.house_num     || '',
      postcode:     detail.postcode      || '',
      phone_mobile: detail.phone_mobile  || '',
      phone_home:   detail.phone_home    || '',
      email:        detail.email         || '',
    } : EMPTY_FORM);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    const outcome = await updateCustomer({ id: selectedId, data: editForm });
    if (!('error' in outcome)) {
      setMode('view');
      triggerDetail(selectedId);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    const outcome = await deleteCustomer(selectedId);
    if (!('error' in outcome)) closePanel();
  }

  function closePanel() {
    setSelectedId(null);
    setMode('view');
  }

  function clearFilters() {
    setCustNumFilter('');
    setNameFilter('');
    setDobFilter('');
    setPostcodeFilter('');
    setMinPolicies('');
  }

  const hasFilters = custNumFilter || nameFilter || dobFilter || postcodeFilter || minPolicies;

  const filtered = rows?.filter(c => {
    if (custNumFilter.trim() && !c.customer_num.includes(custNumFilter.trim())) return false;
    if (nameFilter.trim()) {
      const q = nameFilter.trim().toLowerCase();
      if (!c.first_name.toLowerCase().includes(q) && !c.last_name.toLowerCase().includes(q)) return false;
    }
    if (dobFilter.trim() && !(c.dob || '').includes(dobFilter.trim())) return false;
    if (postcodeFilter.trim() && !(c.postcode || '').toLowerCase().includes(postcodeFilter.trim().toLowerCase())) return false;
    if (minPolicies.trim() && parseInt(c.num_policies, 10) < parseInt(minPolicies, 10)) return false;
    return true;
  });

  if (isError) return (
    <div className="card">
      <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>
    </div>
  );

  return (
    <div className="card">
      <div className="page-header">
        <h2>Customers</h2>
        {rows && <span className="count">{filtered?.length ?? rows.length} of {rows.length}</span>}
      </div>

      <form className="filter-section" onSubmit={e => e.preventDefault()}>
        <div className="field">
          <label htmlFor="cust-filter-num">Customer #</label>
          <input id="cust-filter-num" value={custNumFilter} onChange={e => setCustNumFilter(e.target.value)} placeholder="e.g. 42" />
        </div>
        <div className="field">
          <label htmlFor="cust-filter-name">Name</label>
          <input id="cust-filter-name" value={nameFilter} onChange={e => setNameFilter(e.target.value)} placeholder="First or last name" />
        </div>
        <div className="field">
          <label htmlFor="cust-filter-dob">Date of birth</label>
          <input id="cust-filter-dob" value={dobFilter} onChange={e => setDobFilter(e.target.value)} placeholder="e.g. 1980" />
        </div>
        <div className="field">
          <label htmlFor="cust-filter-postcode">Postcode</label>
          <input id="cust-filter-postcode" value={postcodeFilter} onChange={e => setPostcodeFilter(e.target.value)} placeholder="e.g. SW1" />
        </div>
        <div className="field">
          <label htmlFor="cust-filter-min-policies">Min policies</label>
          <input id="cust-filter-min-policies" type="number" min="0" value={minPolicies} onChange={e => setMinPolicies(e.target.value)} placeholder="e.g. 1" />
        </div>
        <div className="filter-actions">
          <button className="btn btn-secondary btn-sm" type="submit">Search</button>
          {hasFilters && <button className="btn btn-ghost btn-sm" type="button" onClick={clearFilters}>Clear</button>}
        </div>
      </form>

      {isLoading && <div className="empty-state"><span className="spinner" /></div>}
      {filtered?.length === 0 && !isLoading && <div className="empty-state">No customers match the current filters.</div>}

      {filtered && filtered.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>First Name</th><th>Last Name</th>
                <th>Date of Birth</th><th>Postcode</th><th>Policies</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.customer_num}
                  className={selectedId === c.customer_num ? 'row-selected' : undefined}
                  onClick={() => selectRow(c.customer_num)}
                >
                  <td><code>{parseInt(c.customer_num, 10)}</code></td>
                  <td>{c.first_name}</td>
                  <td>{c.last_name}</td>
                  <td>{c.dob}</td>
                  <td>{c.postcode}</td>
                  <td>{c.num_policies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Detail panel ── */}
      {selectedId && (
        <div className="detail-panel">
          <div className="detail-panel-header">
            <span className="detail-panel-title">
              Customer {detail ? parseInt(detail.customer_num, 10) : selectedId}
            </span>
            {mode === 'view' && !detailFetching && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={startEdit}
                  disabled={!detail}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }}
                  onClick={() => setMode('delete')}>Delete</button>
              </>
            )}
            <button className="btn btn-ghost btn-sm" onClick={closePanel}>✕</button>
          </div>

          {detailFetching && <span className="spinner" />}
          {detailErr && <div className="alert alert-err">{(detailError as { error?: string }).error ?? 'Request failed'}</div>}

          {/* View */}
          {detail && !detailFetching && mode === 'view' && (
            <dl className="kv-grid">
              <div><dt>First name</dt><dd>{detail.first_name}</dd></div>
              <div><dt>Last name</dt><dd>{detail.last_name}</dd></div>
              <div><dt>Date of birth</dt><dd>{detail.dob}</dd></div>
              <div><dt>House name</dt><dd>{detail.house_name || '—'}</dd></div>
              <div><dt>House number</dt><dd>{detail.house_num || '—'}</dd></div>
              <div><dt>Postcode</dt><dd>{detail.postcode || '—'}</dd></div>
              <div><dt>Mobile</dt><dd>{detail.phone_mobile || '—'}</dd></div>
              <div><dt>Home phone</dt><dd>{detail.phone_home || '—'}</dd></div>
              <div><dt>Email</dt><dd>{detail.email || '—'}</dd></div>
              <div><dt>Policies</dt><dd>{detail.num_policies}</dd></div>
            </dl>
          )}

          {/* Edit */}
          {mode === 'edit' && (
            <form className="inline-form" onSubmit={handleSave}>
              <div className="form-row">
                <div className="field"><label>First name</label>
                  <input value={editForm.first_name} onChange={setField('first_name')} placeholder="e.g. John" /></div>
                <div className="field"><label>Last name</label>
                  <input value={editForm.last_name} onChange={setField('last_name')} placeholder="e.g. Smith" /></div>
                <div className="field"><label>DOB (YYYYMMDD)</label>
                  <input value={editForm.dob} onChange={setField('dob')} placeholder="e.g. 19800115" /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>House name</label>
                  <input value={editForm.house_name} onChange={setField('house_name')} placeholder="e.g. Rose Cottage" /></div>
                <div className="field"><label>House number</label>
                  <input value={editForm.house_num} onChange={setField('house_num')} placeholder="e.g. 42" /></div>
                <div className="field"><label>Postcode</label>
                  <input value={editForm.postcode} onChange={setField('postcode')} placeholder="e.g. SW1A 1AA" /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Mobile</label>
                  <input value={editForm.phone_mobile} onChange={setField('phone_mobile')} placeholder="e.g. 07700 900000" /></div>
                <div className="field"><label>Home phone</label>
                  <input value={editForm.phone_home} onChange={setField('phone_home')} placeholder="e.g. 020 7946 0000" /></div>
                <div className="field"><label>Email</label>
                  <input value={editForm.email} onChange={setField('email')} placeholder="e.g. john.smith@example.com" /></div>
              </div>
              <div className="detail-actions">
                <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Save changes'}
                </button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setMode('view')}>Cancel</button>
              </div>
              {saveErr && <div className="alert alert-err" style={{ marginTop: '.75rem' }}>{(saveError as { error?: string }).error ?? 'Request failed'}</div>}
              {saveResult && <div className="alert alert-ok" style={{ marginTop: '.75rem' }}>{saveResult.message}</div>}
            </form>
          )}

          {/* Delete */}
          {mode === 'delete' && (
            <>
              <div className="alert alert-warn">
                Permanently delete customer <strong>{parseInt(selectedId, 10)}</strong>?
                This also removes all their policies and claims.
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
