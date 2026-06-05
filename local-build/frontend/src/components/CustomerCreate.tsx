import { useState } from 'react';
import { useCreateCustomerMutation } from '../store/genappApi';
import type { Customer } from '../types';

type CustomerForm = Required<Pick<Customer, 'first_name' | 'last_name' | 'dob' | 'house_name' | 'house_num' | 'postcode' | 'phone_mobile' | 'phone_home' | 'email'>>;

const EMPTY: CustomerForm = {
  first_name: '', last_name: '', dob: '',
  house_name: '', house_num: '', postcode: '',
  phone_mobile: '', phone_home: '', email: '',
};

export default function CustomerCreate() {
  const [form, setForm] = useState<CustomerForm>(EMPTY);
  const [createCustomer, { isLoading, isError, error, data: result }] = useCreateCustomerMutation();

  function set(field: keyof CustomerForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const outcome = await createCustomer(form);
    if (!('error' in outcome)) setForm(EMPTY);
  }

  return (
    <div className="card">
      <h2>Create Customer</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="field">
            <label>First name *</label>
            <input value={form.first_name} onChange={set('first_name')} placeholder="e.g. John" required />
          </div>
          <div className="field">
            <label>Last name *</label>
            <input value={form.last_name} onChange={set('last_name')} placeholder="e.g. Smith" required />
          </div>
          <div className="field">
            <label>Date of birth * (YYYYMMDD)</label>
            <input value={form.dob} onChange={set('dob')} placeholder="19800115" required />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>House name</label>
            <input value={form.house_name} onChange={set('house_name')} placeholder="e.g. Rose Cottage" />
          </div>
          <div className="field">
            <label>House number</label>
            <input value={form.house_num} onChange={set('house_num')} placeholder="e.g. 42" />
          </div>
          <div className="field">
            <label>Postcode</label>
            <input value={form.postcode} onChange={set('postcode')} placeholder="e.g. SW1A 1AA" />
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Mobile</label>
            <input value={form.phone_mobile} onChange={set('phone_mobile')} placeholder="e.g. 07700 900000" />
          </div>
          <div className="field">
            <label>Home phone</label>
            <input value={form.phone_home} onChange={set('phone_home')} placeholder="e.g. 020 7946 0000" />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={form.email} onChange={set('email')} type="email" placeholder="e.g. john.smith@example.com" />
          </div>
        </div>
        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? <span className="spinner" /> : 'Create Customer'}
        </button>
      </form>

      {isError && <div className="alert alert-err" style={{ marginTop: '1rem' }}>{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {result && (
        <div className="alert alert-ok" style={{ marginTop: '1rem' }}>
          Customer created — number: <strong>{parseInt(result.customer_num, 10)}</strong>
        </div>
      )}
    </div>
  );
}
