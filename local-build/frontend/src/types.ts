// ── Customer ──────────────────────────────────────────────────────────────
// Matches genapp.customer table.
// list responses include: customer_num … num_policies
// detail responses add:   house_name, house_num, phone_mobile, phone_home, email
export interface Customer {
  customer_num:  string;
  first_name:    string;
  last_name:     string;
  dob:           string;
  postcode:      string;
  num_policies:  string;
  // detail only
  house_name?:   string;
  house_num?:    string;
  phone_mobile?: string;
  phone_home?:   string;
  email?:        string;
}

// ── Policy ────────────────────────────────────────────────────────────────
// PolicyBase — fields shared by both the API response and the create input.
// Normalised names used throughout (no legacy cust_num / pol_type).
export type PolicyType = 'E' | 'H' | 'M' | 'C';

interface PolicyBase {
  customer_num:  string;
  issue_date:    string;
  expiry_date:   string;
  broker_id?:    string;
  brokers_ref?:  string;
  payment?:      string;
  // Endowment (genapp.endowment)
  with_profits?: string;
  equities?:     string;
  managed_fund?: string;
  fund_name?:    string;
  term?:         string;
  sum_assured?:  string;
  life_assured?: string;
  // House (genapp.house)
  property_type?: string;
  bedrooms?:      string;
  value?:         string;
  house_name?:    string;
  house_number?:  string;
  postcode?:      string;
  // Motor (genapp.motor)
  make?:          string;
  model?:         string;
  reg_number?:    string;
  colour?:        string;
  cc?:            string;
  manufactured?:  string;   // yearOfManufacture in DB
  premium?:       string;
  accidents?:     string;
  // Commercial (genapp.commercial)
  address?:         string;
  customer_name?:   string; // DB 'customer' column — insured entity name
  latitude?:        string; // latitudeN in DB
  longitude?:       string; // longitudeW in DB
  fire_peril?:      string;
  fire_premium?:    string;
  crime_peril?:     string;
  crime_premium?:   string;
  flood_peril?:     string;
  flood_premium?:   string;
  weather_peril?:   string;
  weather_premium?: string;
  status_code?:     string;
}

// Policy response — GET /api/policies and GET /api/policies/customer/:id
export interface Policy extends PolicyBase {
  policy_num:        string;
  policy_type:       string;       // human-readable label in list; code in detail
  policy_type_code?: string;       // single-letter code, list responses only
  last_changed?:     string;
}

// Policy create input — POST /api/policies
// Extends PolicyBase; policy_type is strict (PolicyType) rather than free string
export interface CreatePolicyInput extends PolicyBase {
  policy_type: PolicyType;
}

// ── Claim ─────────────────────────────────────────────────────────────────
// Matches genapp.claim table.
// list responses include: claim_num, policy_num, claim_date, cause, value
// detail responses add:   paid, observations
export interface Claim {
  claim_num:     string;
  policy_num:    string;
  claim_date:    string;
  cause:         string;
  value:         string;
  // detail only
  paid?:         string;
  observations?: string;
}
