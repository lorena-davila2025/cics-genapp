import { useState, useEffect } from 'react';
import { api } from '../api';

export default function CustomerList() {
  const [rows, setRows]   = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listCustomers()
      .then(setRows)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="card"><div className="alert alert-err">{error}</div></div>;
  if (!rows)  return <div className="card"><span className="spinner" /></div>;

  return (
    <div className="card">
      <h2>All Customers <span style={{ fontWeight: 400, color: 'var(--gray-600)', fontSize: '.875rem' }}>({rows.length})</span></h2>
      {rows.length === 0 ? (
        <p style={{ color: 'var(--gray-600)', fontSize: '.875rem' }}>No customers found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Date of Birth</th>
              <th>Postcode</th>
              <th>Policies</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.customer_num}>
                <td><code>{c.customer_num}</code></td>
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
    </div>
  );
}
