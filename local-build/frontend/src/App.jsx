import { useState } from 'react';
import CustomerLookup from './components/CustomerLookup';
import CustomerCreate from './components/CustomerCreate';
import CustomerUpdate from './components/CustomerUpdate';
import CustomerDelete from './components/CustomerDelete';
import PolicyLookup   from './components/PolicyLookup';
import PolicyCreate   from './components/PolicyCreate';
import PolicyDelete   from './components/PolicyDelete';
import ClaimLookup    from './components/ClaimLookup';
import ClaimCreate    from './components/ClaimCreate';
import ClaimDelete    from './components/ClaimDelete';

const TABS = [
  { id: 'cust-lookup', label: 'Lookup',  section: 'Customers' },
  { id: 'cust-create', label: 'Create',  section: 'Customers' },
  { id: 'cust-update', label: 'Update',  section: 'Customers' },
  { id: 'cust-delete', label: 'Delete',  section: 'Customers' },
  { id: 'pol-lookup',  label: 'Lookup',  section: 'Policies'  },
  { id: 'pol-create',  label: 'Create',  section: 'Policies'  },
  { id: 'pol-delete',  label: 'Delete',  section: 'Policies'  },
  { id: 'clm-lookup',  label: 'Lookup',  section: 'Claims'    },
  { id: 'clm-create',  label: 'Create',  section: 'Claims'    },
  { id: 'clm-delete',  label: 'Delete',  section: 'Claims'    },
];

export default function App() {
  const [tab, setTab] = useState('cust-lookup');

  const activeSection = TABS.find(t => t.id === tab)?.section;

  return (
    <>
      <header>
        <h1>GenApp</h1>
        <span className="badge">CICS / GnuCOBOL / PostgreSQL</span>
        <nav>
          {TABS.map(t => (
            <button
              key={t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.section !== activeSection && t.section + ' '}
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {tab === 'cust-lookup' && <CustomerLookup />}
        {tab === 'cust-create' && <CustomerCreate />}
        {tab === 'cust-update' && <CustomerUpdate />}
        {tab === 'cust-delete' && <CustomerDelete />}
        {tab === 'pol-lookup'  && <PolicyLookup />}
        {tab === 'pol-create'  && <PolicyCreate />}
        {tab === 'pol-delete'  && <PolicyDelete />}
        {tab === 'clm-lookup'  && <ClaimLookup />}
        {tab === 'clm-create'  && <ClaimCreate />}
        {tab === 'clm-delete'  && <ClaimDelete />}
      </main>
    </>
  );
}
