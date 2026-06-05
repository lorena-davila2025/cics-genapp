import { useState } from 'react';
import CustomerList   from './components/CustomerList.tsx';
import CustomerCreate from './components/CustomerCreate.tsx';
import PolicyList     from './components/PolicyList.tsx';
import PolicyCreate   from './components/PolicyCreate.tsx';
import ClaimList      from './components/ClaimList.tsx';
import ClaimCreate    from './components/ClaimCreate.tsx';

type TabId =
  | 'customers-browse' | 'customers-new'
  | 'policies-browse'  | 'policies-new'
  | 'claims-browse'    | 'claims-new';

const NAV: { section: string; items: { id: TabId; label: string; icon: string }[] }[] = [
  {
    section: 'Customers',
    items: [
      { id: 'customers-browse', label: 'Browse', icon: '≡' },
      { id: 'customers-new',    label: 'New',    icon: '+' },
    ],
  },
  {
    section: 'Policies',
    items: [
      { id: 'policies-browse', label: 'Browse', icon: '≡' },
      { id: 'policies-new',    label: 'New',    icon: '+' },
    ],
  },
  {
    section: 'Claims',
    items: [
      { id: 'claims-browse', label: 'Browse', icon: '≡' },
      { id: 'claims-new',    label: 'New',    icon: '+' },
    ],
  },
];

export default function App() {
  const [tab, setTab] = useState<TabId>('customers-browse');

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>GenApp</h1>
          <span className="stack-tag">CICS · GnuCOBOL · PostgreSQL</span>
        </div>

        {NAV.map(({ section, items }) => (
          <div key={section} className="sidebar-section">
            <p className="sidebar-section-label">{section}</p>
            {items.map(item => (
              <button
                key={item.id}
                className={`sidebar-item${tab === item.id ? ' active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                <span className="item-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-footer">
          GenApp v1.0<br />
          Local build
        </div>
      </aside>

      <div className="content-area">
        <div className="content-inner">
          {tab === 'customers-browse' && <CustomerList />}
          {tab === 'customers-new'    && <CustomerCreate />}
          {tab === 'policies-browse'  && <PolicyList />}
          {tab === 'policies-new'     && <PolicyCreate />}
          {tab === 'claims-browse'    && <ClaimList />}
          {tab === 'claims-new'       && <ClaimCreate />}
        </div>
      </div>
    </>
  );
}
