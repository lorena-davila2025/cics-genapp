export default function About() {
  return (
    <div className="about">
      <div className="about-header">
        <h2>About GenApp</h2>
        <p className="about-lead">
          This application is a modernised port of IBM's open-source{' '}
          <strong>CICS GenApp</strong> sample — a reference application that
          IBM ships to demonstrate how business applications run on z/OS mainframes.
        </p>
      </div>

      {/* Origin */}
      <div className="about-section">
        <h3>The Original Mainframe Application</h3>
        <p>
          The original GenApp was written in <strong>COBOL</strong> and designed
          to run inside <strong>IBM CICS</strong> (Customer Information Control
          System) — the transaction-processing middleware that powers the majority
          of the world's financial and insurance workloads on IBM Z mainframes.
        </p>
        <p>
          In the mainframe world, a "transaction" is a short-lived COBOL program
          that CICS starts in response to a terminal command or an API call.
          GenApp's transactions manage three business entities:
        </p>
        <ul className="about-list">
          <li><strong>Customers</strong> — personal details of policyholders</li>
          <li><strong>Policies</strong> — insurance products (Endowment, House, Motor, Commercial)</li>
          <li><strong>Claims</strong> — loss events filed against a policy</li>
        </ul>
        <p>
          Data was stored in <strong>VSAM</strong> (Virtual Storage Access Method)
          files — IBM's native key-sequenced file system — and in <strong>Db2 for z/OS</strong>,
          IBM's relational database for mainframes.
        </p>
      </div>

      {/* Migration */}
      <div className="about-section">
        <h3>The Migration</h3>
        <p>
          The goal was to lift the COBOL business logic off the mainframe and run
          it in the cloud, with as few changes to the source code as possible.
          Here is what changed and what stayed the same:
        </p>

        <div className="about-compare">
          <div className="about-compare-col">
            <div className="about-compare-head before">Before — z/OS Mainframe</div>
            <ul>
              <li><strong>Runtime:</strong> IBM CICS TS (transaction server)</li>
              <li><strong>Language:</strong> Enterprise COBOL for z/OS</li>
              <li><strong>Storage:</strong> VSAM + Db2 for z/OS</li>
              <li><strong>Interface:</strong> 3270 terminal / CICS Web Services</li>
              <li><strong>Deployment:</strong> IBM Z hardware or IBM Cloud</li>
            </ul>
          </div>
          <div className="about-compare-col">
            <div className="about-compare-head after">After — Cloud</div>
            <ul>
              <li><strong>Runtime:</strong> GnuCOBOL + Node.js (Express)</li>
              <li><strong>Language:</strong> GnuCOBOL (open-source compiler)</li>
              <li><strong>Storage:</strong> PostgreSQL (Neon serverless)</li>
              <li><strong>Interface:</strong> REST API + React SPA</li>
              <li><strong>Deployment:</strong> Render (API) · Netlify (frontend)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key challenges */}
      <div className="about-section">
        <h3>Key Migration Challenges</h3>
        <ul className="about-list">
          <li>
            <strong>EXEC CICS statements</strong> — CICS-specific verbs
            (<code>EXEC CICS LINK</code>, <code>EXEC CICS RETURN</code>, etc.)
            were replaced with standard GnuCOBOL program calls using a custom
            Python patch script.
          </li>
          <li>
            <strong>EXEC SQL / VSAM</strong> — Embedded SQL was translated from
            Db2 dialect to PostgreSQL via the <strong>ocesql</strong> preprocessor
            (Open COBOL ESQL), which converts <code>EXEC SQL</code> blocks into
            GnuCOBOL dynamic calls at compile time.
          </li>
          <li>
            <strong>Schema mapping</strong> — VSAM record layouts were converted
            to PostgreSQL tables inside a dedicated <code>genapp</code> schema,
            preserving the original field names and sizes.
          </li>
          <li>
            <strong>Program linking</strong> — CICS <code>LINK</code> calls
            (which invoke another CICS transaction) were replaced with GnuCOBOL
            dynamic <code>CALL</code> statements, and shared <code>COMMAREA</code>
            buffers were kept as binary data structures.
          </li>
        </ul>
      </div>

      {/* Architecture */}
      <div className="about-section">
        <h3>Architecture</h3>
        <div className="about-arch">
          <div className="arch-layer">
            <div className="arch-label">Browser</div>
            <div className="arch-box accent">React + Redux Toolkit Query</div>
            <div className="arch-sublabel">Netlify CDN</div>
          </div>
          <div className="arch-arrow">↓ HTTPS / REST</div>
          <div className="arch-layer">
            <div className="arch-label">API</div>
            <div className="arch-box">Node.js · Express</div>
            <div className="arch-sublabel">Render (Docker)</div>
          </div>
          <div className="arch-arrow">↓ spawn</div>
          <div className="arch-layer">
            <div className="arch-label">Business Logic</div>
            <div className="arch-box cobol">GnuCOBOL binaries (original IBM source)</div>
            <div className="arch-sublabel">compiled with ocesql preprocessing</div>
          </div>
          <div className="arch-arrow">↓ libpq / ocesql</div>
          <div className="arch-layer">
            <div className="arch-label">Database</div>
            <div className="arch-box db">PostgreSQL — genapp schema</div>
            <div className="arch-sublabel">Neon serverless</div>
          </div>
        </div>
      </div>

      <div className="about-footer">
        Original source:{' '}
        <a href="https://github.com/cicsdev/cics-genapp" target="_blank" rel="noreferrer">
          github.com/cicsdev/cics-genapp
        </a>{' '}
        — © IBM Corp. 2011, 2020.
        <br />
        Migration &amp; cloud port:{' '}
        <a href="https://github.com/lorena-davila2025/cics-genapp" target="_blank" rel="noreferrer">
          github.com/lorena-davila2025/cics-genapp
        </a>{' '}
        by{' '}
        <a href="https://github.com/lorena-davila2025" target="_blank" rel="noreferrer">
          @lorena-davila2025
        </a>
      </div>
    </div>
  );
}
