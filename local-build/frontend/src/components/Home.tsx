type NavAction = (tab: string) => void;

export default function Home({ onNavigate }: { onNavigate: NavAction }) {
  return (
    <div className="home">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-eyebrow">IBM CICS GenApp — Modernised</div>
        <h1 className="home-hero-title">Insurance Management System</h1>
        <p className="home-hero-sub">
          A cloud-native port of IBM's mainframe sample application. The original
          COBOL business logic still runs — recompiled with GnuCOBOL and exposed
          through a REST API instead of CICS transactions.
        </p>
      </div>

      {/* Quick-nav cards */}
      <div className="home-cards">
        <button className="home-card" onClick={() => onNavigate('customers-browse')}>
          <div className="home-card-icon">👤</div>
          <div>
            <div className="home-card-title">Customers</div>
            <div className="home-card-desc">
              Create, search and manage policyholders. Each customer record stores
              personal details and links to their insurance policies.
            </div>
          </div>
          <span className="home-card-arrow">→</span>
        </button>

        <button className="home-card" onClick={() => onNavigate('policies-browse')}>
          <div className="home-card-icon">📋</div>
          <div>
            <div className="home-card-title">Policies</div>
            <div className="home-card-desc">
              Browse and issue insurance policies across four product types:
              Endowment, House, Motor and Commercial.
            </div>
          </div>
          <span className="home-card-arrow">→</span>
        </button>

        <button className="home-card" onClick={() => onNavigate('claims-browse')}>
          <div className="home-card-icon">📁</div>
          <div>
            <div className="home-card-title">Claims</div>
            <div className="home-card-desc">
              File and track insurance claims tied to a customer's policy.
              Each claim captures the date, amount and current status.
            </div>
          </div>
          <span className="home-card-arrow">→</span>
        </button>
      </div>

      {/* Stack strip */}
      <div className="home-stack">
        <span className="home-stack-label">Running on</span>
        {['GnuCOBOL', 'Node.js', 'PostgreSQL', 'React', 'Render', 'Netlify', 'Neon'].map(t => (
          <span key={t} className="home-stack-badge">{t}</span>
        ))}
      </div>
    </div>
  );
}
