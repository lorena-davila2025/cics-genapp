import { useState } from 'react';
import CustomerList   from './components/CustomerList.tsx';
import CustomerLookup from './components/CustomerLookup.tsx';
import CustomerCreate from './components/CustomerCreate.tsx';
import CustomerUpdate from './components/CustomerUpdate.tsx';
import CustomerDelete from './components/CustomerDelete.tsx';
import PolicyList     from './components/PolicyList.tsx';
import PolicyLookup   from './components/PolicyLookup.tsx';
import PolicyCreate   from './components/PolicyCreate.tsx';
import PolicyDelete   from './components/PolicyDelete.tsx';
import ClaimList      from './components/ClaimList.tsx';
import ClaimLookup    from './components/ClaimLookup.tsx';
import ClaimCreate    from './components/ClaimCreate.tsx';
import ClaimDelete    from './components/ClaimDelete.tsx';

const SECTIONS = [
  {
    id: 'Customers',
    tabs: [
      { id: 'customers-list',   label: 'List'   },
      { id: 'customers-lookup', label: 'Lookup' },
      { id: 'customers-create', label: 'Create' },
      { id: 'customers-update', label: 'Update' },
      { id: 'customers-delete', label: 'Delete' },
    ],
  },
  {
    id: 'Policies',
    tabs: [
      { id: 'policies-list',   label: 'List'   },
      { id: 'policies-lookup', label: 'Lookup' },
      { id: 'policies-create', label: 'Create' },
      { id: 'policies-delete', label: 'Delete' },
    ],
  },
  {
    id: 'Claims',
    tabs: [
      { id: 'claims-list',   label: 'List'   },
      { id: 'claims-lookup', label: 'Lookup' },
      { id: 'claims-create', label: 'Create' },
      { id: 'claims-delete', label: 'Delete' },
    ],
  },
];

export default function App() {
  const [tab, setTab] = useState('customers-list');

  return (
    <>
      <header>
        <h1>GenApp</h1>
        <span className="badge">CICS / GnuCOBOL / PostgreSQL</span>
        <nav>
          {SECTIONS.map(section => (
            <div key={section.id} className="nav-group">
              <span className="nav-group-label">{section.id}</span>
              <div className="nav-group-buttons">
                {section.tabs.map(t => (
                  <button
                    key={t.id}
                    className={tab === t.id ? 'active' : ''}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'customers-list'   && <CustomerList />}
        {tab === 'customers-lookup' && <CustomerLookup />}
        {tab === 'customers-create' && <CustomerCreate />}
        {tab === 'customers-update' && <CustomerUpdate />}
        {tab === 'customers-delete' && <CustomerDelete />}
        {tab === 'policies-list'    && <PolicyList />}
        {tab === 'policies-lookup'  && <PolicyLookup />}
        {tab === 'policies-create'  && <PolicyCreate />}
        {tab === 'policies-delete'  && <PolicyDelete />}
        {tab === 'claims-list'    && <ClaimList />}
        {tab === 'claims-lookup'  && <ClaimLookup />}
        {tab === 'claims-create'  && <ClaimCreate />}
        {tab === 'claims-delete'  && <ClaimDelete />}
      </main>
    </>
  );
}
