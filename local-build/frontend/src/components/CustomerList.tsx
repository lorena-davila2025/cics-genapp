import { useState } from 'react';
import { useListCustomersQuery, useLazyGetCustomerQuery } from '../store/genappApi';

export default function CustomerList() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedId, setSelectedId]   = useState<string | null>(null);

  const { data: rows, isLoading, isError, error } = useListCustomersQuery();
  const [triggerDetail, { data: detail, isFetching: isDetailFetching, isError: isDetailError, error: detailError }] =
    useLazyGetCustomerQuery();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const id = searchInput.trim();
    if (!id) return;
    setSelectedId(id);
    triggerDetail(id);
  }

  function handleRowClick(custNum: string) {
    setSelectedId(custNum);
    setSearchInput(custNum);
    triggerDetail(custNum);
  }

  if (isError) return (
    <div className="card">
      <div className="alert alert-err">{(error as { error?: string }).error ?? 'Request failed'}</div>
    </div>
  );

  return (
    <div className="card">
      <div className="list-header">
        <h2>Customers{rows && <span className="count"> ({rows.length})</span>}</h2>
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="field" style={{ flex: '0 0 160px' }}>
            <label>Customer #</label>
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="e.g. 1" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={isDetailFetching} style={{ alignSelf: 'flex-end' }}>
            {isDetailFetching ? <span className="spinner" /> : 'Look up'}
          </button>
        </form>
      </div>

      {isLoading && <span className="spinner" />}
      {rows?.length === 0 && <p style={{ color: 'var(--gray-600)', fontSize: '.875rem' }}>No customers found.</p>}

      {rows && rows.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>#</th><th>First Name</th><th>Last Name</th>
              <th>Date of Birth</th><th>Postcode</th><th>Policies</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr
                key={c.customer_num}
                className={selectedId === c.customer_num ? 'row-selected' : undefined}
                onClick={() => handleRowClick(c.customer_num)}
                style={{ cursor: 'pointer' }}
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
      )}

      {selectedId && (
        <div className="detail-panel">
          <div className="detail-panel-header">
            <span>Customer detail</span>
            <button
              type="button" className="btn btn-secondary"
              style={{ fontSize: '.75rem', padding: '.2rem .6rem' }}
              onClick={() => { setSelectedId(null); setSearchInput(''); }}
            >
              Close
            </button>
          </div>
          {isDetailFetching && <span className="spinner" />}
          {isDetailError && <div className="alert alert-err">{(detailError as { error?: string }).error ?? 'Request failed'}</div>}
          {detail && !isDetailFetching && (
            <dl className="kv-grid">
              <dt>Customer #</dt><dd>{parseInt(detail.customer_num, 10)}</dd>
              <dt>First name</dt><dd>{detail.first_name}</dd>
              <dt>Last name</dt><dd>{detail.last_name}</dd>
              <dt>Date of birth</dt><dd>{detail.dob}</dd>
              <dt>House name</dt><dd>{detail.house_name || '—'}</dd>
              <dt>House number</dt><dd>{detail.house_num || '—'}</dd>
              <dt>Postcode</dt><dd>{detail.postcode || '—'}</dd>
              <dt>Mobile</dt><dd>{detail.phone_mobile || '—'}</dd>
              <dt>Home phone</dt><dd>{detail.phone_home || '—'}</dd>
              <dt>Email</dt><dd>{detail.email || '—'}</dd>
              <dt>Policies</dt><dd>{detail.num_policies}</dd>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
