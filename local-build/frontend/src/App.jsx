import { useState } from 'react';
import CustomerList   from './components/CustomerList';
import CustomerLookup from './components/CustomerLookup';
import CustomerCreate from './components/CustomerCreate';
import CustomerUpdate from './components/CustomerUpdate';
import CustomerDelete from './components/CustomerDelete';
import PolicyList     from './components/PolicyList';
import PolicyLookup   from './components/PolicyLookup';
import PolicyCreate   from './components/PolicyCreate';
import PolicyDelete   from './components/PolicyDelete';
import ClaimList      from './components/ClaimList';
import ClaimLookup    from './components/ClaimLookup';
import ClaimCreate    from './components/ClaimCreate';
import ClaimDelete    from './components/ClaimDelete';

const SECTIONS = [
  {
    id: 'Customers',
    tabs: [
      { id: 'cust-list',   label: 'List'   },
      { id: 'cust-lookup', label: 'Lookup' },
      { id: 'cust-create', label: 'Create' },
      { id: 'cust-update', label: 'Update' },
      { id: 'cust-delete', label: 'Delete' },
    ],
  },
  {
    id: 'Policies',
    tabs: [
      { id: 'pol-list',   label: 'List'   },
      { id: 'pol-lookup', label: 'Lookup' },
      { id: 'pol-create', label: 'Create' },
      { id: 'pol-delete', label: 'Delete' },
    ],
  },
  {
    id: 'Claims',
    tabs: [
      { id: 'clm-list',   label: 'List'   },
      { id: 'clm-lookup', label: 'Lookup' },
      { id: 'clm-create', label: 'Create' },
      { id: 'clm-delete', label: 'Delete' },
    ],
  },
];

export default function App() {
  const [tab, setTab] = useState('cust-list');

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
        {tab === 'cust-list'   && <CustomerList />}
        {tab === 'cust-lookup' && <CustomerLookup />}
        {tab === 'cust-create' && <CustomerCreate />}
        {tab === 'cust-update' && <CustomerUpdate />}
        {tab === 'cust-delete' && <CustomerDelete />}
        {tab === 'pol-list'    && <PolicyList />}
        {tab === 'pol-lookup'  && <PolicyLookup />}
        {tab === 'pol-create'  && <PolicyCreate />}
        {tab === 'pol-delete'  && <PolicyDelete />}
        {tab === 'clm-list'    && <ClaimList />}
        {tab === 'clm-lookup'  && <ClaimLookup />}
        {tab === 'clm-create'  && <ClaimCreate />}
        {tab === 'clm-delete'  && <ClaimDelete />}
      </main>
    </>
  );
}
