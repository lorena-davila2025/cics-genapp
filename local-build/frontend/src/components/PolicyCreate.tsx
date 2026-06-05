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
          <input value={form.fund_name ?? ''} onChange={set('fund_name')} /></div>
        <div className="field"><label>Term (years)</label>
          <input value={form.term ?? ''} onChange={set('term')} /></div>
        <div className="field"><label>Sum assured</label>
          <input value={form.sum_assured ?? ''} onChange={set('sum_assured')} /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Life assured</label>
          <input value={form.life_assured ?? ''} onChange={set('life_assured')} /></div>
        <div className="field"><label>With profits (Y/N)</label>
          <input value={form.with_profits ?? ''} onChange={set('with_profits')} maxLength={1} /></div>
        <div className="field"><label>Equities (Y/N)</label>
          <input value={form.equities ?? ''} onChange={set('equities')} maxLength={1} /></div>
        <div className="field"><label>Managed fund (Y/N)</label>
          <input value={form.managed_fund ?? ''} onChange={set('managed_fund')} maxLength={1} /></div>
      </div>
    </>
  );
}

function HouseFields({ form, set }: { form: PolicyForm; set: SetField }) {
  return (
    <div className="form-row">
      <div className="field"><label>Property type</label>
        <input value={form.property_type ?? ''} onChange={set('property_type')} /></div>
      <div className="field"><label>Bedrooms</label>
        <input value={form.bedrooms ?? ''} onChange={set('bedrooms')} /></div>
      <div className="field"><label>Value</label>
        <input value={form.value ?? ''} onChange={set('value')} /></div>
      <div className="field"><label>House name</label>
        <input value={form.house_name ?? ''} onChange={set('house_name')} /></div>
      <div className="field"><label>House number</label>
        <input value={form.house_number ?? ''} onChange={set('house_number')} /></div>
      <div className="field"><label>Postcode</label>
        <input value={form.postcode ?? ''} onChange={set('postcode')} /></div>
    </div>
  );
}

function MotorFields({ form, set }: { form: PolicyForm; set: SetField }) {
  return (
    <>
      <div className="form-row">
        <div className="field"><label>Make</label>
          <input value={form.make ?? ''} onChange={set('make')} /></div>
        <div className="field"><label>Model</label>
          <input value={form.model ?? ''} onChange={set('model')} /></div>
        <div className="field"><label>Value</label>
          <input value={form.value ?? ''} onChange={set('value')} /></div>
        <div className="field"><label>Reg number</label>
          <input value={form.reg_number ?? ''} onChange={set('reg_number')} /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Colour</label>
          <input value={form.colour ?? ''} onChange={set('colour')} /></div>
        <div className="field"><label>CC</label>
          <input value={form.cc ?? ''} onChange={set('cc')} /></div>
        <div className="field"><label>Manufactured</label>
          <input value={form.manufactured ?? ''} onChange={set('manufactured')} /></div>
        <div className="field"><label>Premium</label>
          <input value={form.premium ?? ''} onChange={set('premium')} /></div>
        <div className="field"><label>Accidents</label>
          <input value={form.accidents ?? ''} onChange={set('accidents')} /></div>
      </div>
    </>
  );
}

function CommercialFields({ form, set }: { form: PolicyForm; set: SetField }) {
  return (
    <>
      <div className="form-row">
        <div className="field"><label>Address</label>
          <input value={form.address ?? ''} onChange={set('address')} /></div>
        <div className="field"><label>Postcode</label>
          <input value={form.postcode ?? ''} onChange={set('postcode')} /></div>
        <div className="field"><label>Property type</label>
          <input value={form.property_type ?? ''} onChange={set('property_type')} /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Fire peril</label>
          <input value={form.fire_peril ?? ''} onChange={set('fire_peril')} /></div>
        <div className="field"><label>Fire premium</label>
          <input value={form.fire_premium ?? ''} onChange={set('fire_premium')} /></div>
        <div className="field"><label>Crime peril</label>
          <input value={form.crime_peril ?? ''} onChange={set('crime_peril')} /></div>
        <div className="field"><label>Crime premium</label>
          <input value={form.crime_premium ?? ''} onChange={set('crime_premium')} /></div>
      </div>
      <div className="form-row">
        <div className="field"><label>Flood peril</label>
          <input value={form.flood_peril ?? ''} onChange={set('flood_peril')} /></div>
        <div className="field"><label>Flood premium</label>
          <input value={form.flood_premium ?? ''} onChange={set('flood_premium')} /></div>
        <div className="field"><label>Weather peril</label>
          <input value={form.weather_peril ?? ''} onChange={set('weather_peril')} /></div>
        <div className="field"><label>Weather premium</label>
          <input value={form.weather_premium ?? ''} onChange={set('weather_premium')} /></div>
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
            <input value={form.customer_num ?? ''} onChange={set('customer_num')} required /></div>
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
            <input value={form.broker_id ?? ''} onChange={set('broker_id')} /></div>
          <div className="field"><label>Brokers ref</label>
            <input value={form.brokers_ref ?? ''} onChange={set('brokers_ref')} /></div>
          <div className="field"><label>Payment</label>
            <input value={form.payment ?? ''} onChange={set('payment')} /></div>
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
