import { useState } from 'react';
import { useCreatePolicyMutation } from '../store/genappApi';
import type { CreatePolicyInput, PolicyType } from '../types';

const TYPE_LABELS: Record<PolicyType, string> = { E: 'Endowment', H: 'House', M: 'Motor', C: 'Commercial' };

type PolicyForm = CreatePolicyInput;
type SetField = (field: keyof PolicyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;

function EndowmentFields({ form, set }: { form: PolicyForm; set: SetField }) {
  return (
    <>
      <div className="form-row">
        <div className="field"><label>Fund name</label>
          <input value={form.fund_name ?? ''} onChange={set('fund_name')} placeholder="e.g. Managed Growth Fund" /></div>
        <div className="field"><label>Term (years)</label>
          <input value={form.term ?? ''} onChange={set('term')} placeholder="e.g. 20" /></div>
        <div className="field"><label>Sum assured</label>
          <input value={form.sum_assured ?? ''} onChange={set('sum_assured')} placeholder="e.g. 50000" /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Life assured</label>
          <input value={form.life_assured ?? ''} onChange={set('life_assured')} placeholder="e.g. Jane Smith" /></div>
        <div className="field"><label>With profits (Y/N)</label>
          <input value={form.with_profits ?? ''} onChange={set('with_profits')} maxLength={1} placeholder="Y or N" /></div>
        <div className="field"><label>Equities (Y/N)</label>
          <input value={form.equities ?? ''} onChange={set('equities')} maxLength={1} placeholder="Y or N" /></div>
        <div className="field"><label>Managed fund (Y/N)</label>
          <input value={form.managed_fund ?? ''} onChange={set('managed_fund')} maxLength={1} placeholder="Y or N" /></div>
      </div>
    </>
  );
}

function HouseFields({ form, set }: { form: PolicyForm; set: SetField }) {
  return (
    <div className="form-row">
      <div className="field"><label>Property type</label>
        <input value={form.property_type ?? ''} onChange={set('property_type')} placeholder="e.g. Detached" /></div>
      <div className="field"><label>Bedrooms</label>
        <input value={form.bedrooms ?? ''} onChange={set('bedrooms')} placeholder="e.g. 3" /></div>
      <div className="field"><label>Value</label>
        <input value={form.value ?? ''} onChange={set('value')} placeholder="e.g. 250000" /></div>
      <div className="field"><label>House name</label>
        <input value={form.house_name ?? ''} onChange={set('house_name')} placeholder="e.g. Rose Cottage" /></div>
      <div className="field"><label>House number</label>
        <input value={form.house_number ?? ''} onChange={set('house_number')} placeholder="e.g. 42" /></div>
      <div className="field"><label>Postcode</label>
        <input value={form.postcode ?? ''} onChange={set('postcode')} placeholder="e.g. SW1A 1AA" /></div>
    </div>
  );
}

function MotorFields({ form, set }: { form: PolicyForm; set: SetField }) {
  return (
    <>
      <div className="form-row">
        <div className="field"><label>Make</label>
          <input value={form.make ?? ''} onChange={set('make')} placeholder="e.g. Toyota" /></div>
        <div className="field"><label>Model</label>
          <input value={form.model ?? ''} onChange={set('model')} placeholder="e.g. Corolla" /></div>
        <div className="field"><label>Value</label>
          <input value={form.value ?? ''} onChange={set('value')} placeholder="e.g. 15000" /></div>
        <div className="field"><label>Reg number</label>
          <input value={form.reg_number ?? ''} onChange={set('reg_number')} placeholder="e.g. AB12 CDE" /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Color</label>
          <input value={form.colour ?? ''} onChange={set('colour')} placeholder="e.g. Blue" /></div>
        <div className="field"><label>CC</label>
          <input value={form.cc ?? ''} onChange={set('cc')} placeholder="e.g. 1800" /></div>
        <div className="field"><label>Manufactured</label>
          <input value={form.manufactured ?? ''} onChange={set('manufactured')} placeholder="e.g. 2020" /></div>
        <div className="field"><label>Premium</label>
          <input value={form.premium ?? ''} onChange={set('premium')} placeholder="e.g. 800.00" /></div>
        <div className="field"><label>Accidents</label>
          <input value={form.accidents ?? ''} onChange={set('accidents')} placeholder="e.g. 0" /></div>
      </div>
    </>
  );
}

function CommercialFields({ form, set }: { form: PolicyForm; set: SetField }) {
  return (
    <>
      <div className="form-row">
        <div className="field"><label>Address</label>
          <input value={form.address ?? ''} onChange={set('address')} placeholder="e.g. 10 Business Park, London" /></div>
        <div className="field"><label>Postcode</label>
          <input value={form.postcode ?? ''} onChange={set('postcode')} placeholder="e.g. EC1A 1BB" /></div>
        <div className="field"><label>Property type</label>
          <input value={form.property_type ?? ''} onChange={set('property_type')} placeholder="e.g. Office" /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Fire peril</label>
          <input value={form.fire_peril ?? ''} onChange={set('fire_peril')} placeholder="Y or N" /></div>
        <div className="field"><label>Fire premium</label>
          <input value={form.fire_premium ?? ''} onChange={set('fire_premium')} placeholder="e.g. 1200.00" /></div>
        <div className="field"><label>Crime peril</label>
          <input value={form.crime_peril ?? ''} onChange={set('crime_peril')} placeholder="Y or N" /></div>
        <div className="field"><label>Crime premium</label>
          <input value={form.crime_premium ?? ''} onChange={set('crime_premium')} placeholder="e.g. 600.00" /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Flood peril</label>
          <input value={form.flood_peril ?? ''} onChange={set('flood_peril')} placeholder="Y or N" /></div>
        <div className="field"><label>Flood premium</label>
          <input value={form.flood_premium ?? ''} onChange={set('flood_premium')} placeholder="e.g. 800.00" /></div>
        <div className="field"><label>Weather peril</label>
          <input value={form.weather_peril ?? ''} onChange={set('weather_peril')} placeholder="Y or N" /></div>
        <div className="field"><label>Weather premium</label>
          <input value={form.weather_premium ?? ''} onChange={set('weather_premium')} placeholder="e.g. 500.00" /></div>
      </div>
    </>
  );
}

export default function PolicyCreate() {
  const [form, setForm] = useState<PolicyForm>({ customer_num: '', policy_type: 'H', issue_date: '', expiry_date: '' });
  const [createPolicy, { isLoading, isError, error, data: result }] = useCreatePolicyMutation();

  function set(field: keyof PolicyForm): (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createPolicy(form);
  }

  const type = form.policy_type;

  return (
    <div className="card">
      <h2>Create Policy</h2>
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="field"><label>Customer Number *</label>
            <input value={form.customer_num ?? ''} onChange={set('customer_num')} placeholder="e.g. 100" required /></div>
          <div className="field"><label>Policy Type *</label>
            <select value={type} onChange={set('policy_type')}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{k} — {v}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field"><label>Issue date * (YYYY-MM-DD)</label>
            <input value={form.issue_date ?? ''} onChange={set('issue_date')} placeholder="2024-01-01" required /></div>
          <div className="field"><label>Expiry date * (YYYY-MM-DD)</label>
            <input value={form.expiry_date ?? ''} onChange={set('expiry_date')} placeholder="2025-01-01" required /></div>
          <div className="field"><label>Broker ID</label>
            <input value={form.broker_id ?? ''} onChange={set('broker_id')} placeholder="e.g. 999" /></div>
          <div className="field"><label>Brokers ref</label>
            <input value={form.brokers_ref ?? ''} onChange={set('brokers_ref')} placeholder="e.g. BR2024-001" /></div>
          <div className="field"><label>Payment</label>
            <input value={form.payment ?? ''} onChange={set('payment')} placeholder="e.g. 500.00" /></div>
        </div>

        {type === 'E' && <EndowmentFields form={form} set={set} />}
        {type === 'H' && <HouseFields form={form} set={set} />}
        {type === 'M' && <MotorFields form={form} set={set} />}
        {type === 'C' && <CommercialFields form={form} set={set} />}

        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? <span className="spinner" /> : 'Create Policy'}
        </button>
      </form>

      {isError && <div className="alert alert-err" style={{ marginTop: '1rem' }}>{(error as { error?: string }).error ?? 'Request failed'}</div>}
      {result && (
        <div className="alert alert-ok" style={{ marginTop: '1rem' }}>
          Policy created — number: <strong>{parseInt(result.policy_num, 10)}</strong>
        </div>
      )}
    </div>
  );
}
