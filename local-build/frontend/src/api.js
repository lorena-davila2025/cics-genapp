const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw Object.assign(new Error(json.error || 'Request failed'), { data: json, status: res.status });
  return json;
}

export const api = {
  // Customers
  listCustomers: () => request('GET', '/customers'),
  getCustomer: (id) => request('GET', `/customers/${id}`),
  createCustomer: (data) => request('POST', '/customers', data),
  updateCustomer: (id, data) => request('PUT', `/customers/${id}`, data),
  deleteCustomer: (id) => request('DELETE', `/customers/${id}`),

  // Policies
  listPolicies: (custNum) => request('GET', `/policies${custNum ? `?cust_num=${custNum}` : ''}`),
  getPolicy: (custId, polNum, polType) =>
    request('GET', `/policies/customer/${custId}?policy_num=${polNum}&policy_type=${polType}`),
  createPolicy: (data) => request('POST', '/policies', data),
  deletePolicy: (custId, polNum, polType) =>
    request('DELETE', `/policies/customer/${custId}/${polNum}?policy_type=${polType}`),

  // Claims
  listClaims: (polNum) => request('GET', `/claims${polNum ? `?policy_num=${polNum}` : ''}`),
  getClaim: (claimNum) => request('GET', `/claims/${claimNum}`),
  createClaim: (data) => request('POST', '/claims', data),
  deleteClaim: (claimNum) => request('DELETE', `/claims/${claimNum}`),
};
