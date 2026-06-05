import type { Customer, Policy, Claim } from '../types';

export const CUSTOMERS: Customer[] = [
  { customer_num: '1', first_name: 'Alice', last_name: 'Smith',  dob: '19801015', postcode: 'SW1A 1AA', num_policies: '2' },
  { customer_num: '2', first_name: 'Bob',   last_name: 'Jones',  dob: '19750320', postcode: 'EC1A 1BB', num_policies: '0' },
  { customer_num: '3', first_name: 'Carol', last_name: 'Taylor', dob: '19920807', postcode: 'N1 9GU',   num_policies: '1' },
];

export const CUSTOMER_DETAIL: Customer = {
  customer_num: '1',
  first_name: 'Alice', last_name: 'Smith', dob: '19801015',
  postcode: 'SW1A 1AA', num_policies: '2',
  house_name: 'Rose Cottage', house_num: '5',
  phone_mobile: '07700900000', phone_home: '02071234567',
  email: 'alice@example.com',
};

export const POLICIES: Policy[] = [
  { policy_num: '10', customer_num: '1', policy_type: 'House',  policy_type_code: 'H', issue_date: '2024-01-01', expiry_date: '2025-01-01', payment: '500' },
  { policy_num: '11', customer_num: '1', policy_type: 'Motor',  policy_type_code: 'M', issue_date: '2023-06-15', expiry_date: '2024-06-15', payment: '750' },
  { policy_num: '12', customer_num: '2', policy_type: 'Endowment', policy_type_code: 'E', issue_date: '2022-03-01', expiry_date: '2032-03-01', payment: '200' },
];

export const POLICY_DETAIL: Policy = {
  policy_num: '10', customer_num: '1',
  policy_type: 'H', issue_date: '2024-01-01', expiry_date: '2025-01-01',
  property_type: 'Detached', bedrooms: '3', value: '250000',
  house_name: 'Rose Cottage', house_number: '5', postcode: 'SW1A 1AA',
};

export const CLAIMS: Claim[] = [
  { claim_num: '100', policy_num: '10', claim_date: '2024-06-01', cause: 'Fire damage',  value: '5000' },
  { claim_num: '101', policy_num: '10', claim_date: '2024-08-15', cause: 'Water leak',   value: '2000' },
  { claim_num: '102', policy_num: '11', claim_date: '2024-09-10', cause: 'Theft',        value: '8000' },
];

export const CLAIM_DETAIL: Claim = {
  claim_num: '100', policy_num: '10',
  claim_date: '2024-06-01', paid: '5000', value: '5000',
  cause: 'Fire damage', observations: 'Kitchen fire, partial damage',
};
