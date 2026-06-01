# General Insurance Application (GenApp) — Local Build

> Fork of [cicsdev/cics-genapp](https://github.com/cicsdev/cics-genapp).
> The original GenApp runs on IBM CICS/Db2/z/OS. This fork migrates it to run
> locally on macOS/Linux using **GnuCOBOL + ocesql + PostgreSQL**, with a REST
> API (Express) and a React frontend — no mainframe required.

---

## Table of contents

- [Original architecture](#original-architecture)
- [Modernized architecture](#modernized-architecture)
- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [API reference](#api-reference)
- [Repository layout](#repository-layout)
- [License](#license)

---

## Original architecture

The original GenApp is a four-tier COBOL application running on z/OS, driven
by 3270 green-screen terminals.

```
┌────────────────────────────────────────────────────────────────────┐
│                         z/OS Mainframe                             │
│                                                                    │
│   3270 Terminal                                                    │
│       │                                                            │
│       ▼                                                            │
│  ┌─────────────────────────────────────────────┐                  │
│  │            CICS Transaction Server           │                  │
│  │                                             │                  │
│  │  ┌──────────────────────────────────────┐  │                  │
│  │  │         Business Logic Layer          │  │                  │
│  │  │  LGACUS01  LGUCUS01  LGICUS01        │  │                  │
│  │  │  LGAPOL01  LGUPOL01  LGIPOL01        │  │                  │
│  │  │  LGDPOL01  LGACLS01                  │  │                  │
│  │  └──────────┬───────────────┬───────────┘  │                  │
│  │             │               │               │                  │
│  │  ┌──────────▼────┐  ┌──────▼────────────┐  │                  │
│  │  │  DB2 Programs │  │  VSAM Programs    │  │                  │
│  │  │  LGACDB01/02  │  │  LGACVS01         │  │                  │
│  │  │  LGICDB01     │  │  LGAPVS01         │  │                  │
│  │  │  LGUCDB01     │  │  LGUPVS01         │  │                  │
│  │  │  LGAPDB01     │  │  LGUCVS01         │  │                  │
│  │  │  LGIPDB01     │  │  LGDPVS01         │  │                  │
│  │  │  LGUPDB01     │  └──────┬────────────┘  │                  │
│  │  │  LGDPDB01     │         │               │                  │
│  │  └──────┬────────┘         │               │                  │
│  │         │          ┌───────▼───────┐       │                  │
│  │  ┌──────▼──────┐   │  VSAM Files  │       │                  │
│  │  │  IBM Db2    │   └───────────────┘       │                  │
│  │  └─────────────┘                           │                  │
│  │                                             │                  │
│  │  ┌──────────────────────────────────────┐  │                  │
│  │  │  Error Handler: LGSTSQ               │  │                  │
│  │  │  (writes to CICS transient data queue)│  │                  │
│  │  └──────────────────────────────────────┘  │                  │
│  └─────────────────────────────────────────────┘                  │
└────────────────────────────────────────────────────────────────────┘
```

**Transaction flow (original):**
1. 3270 terminal sends transaction code to CICS
2. CICS dispatches to the appropriate business-logic program
3. Business logic calls the DB2 or VSAM data-layer program
4. DB2 program executes embedded SQL against IBM Db2
5. Errors are routed to LGSTSQ, which writes them to a transient data queue

---

## Modernized architecture

This fork replaces every mainframe component with open-source equivalents
while keeping the original COBOL business logic intact.

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React + Vite  (localhost:5173)                          │   │
│  │  10 screens: Customer ×4 · Policy ×3 · Claims ×3        │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         │  fetch /api/*                         │
└─────────────────────────┼────────────────────────────────────────┘
                          │  Vite dev proxy → :3002
┌─────────────────────────▼────────────────────────────────────────┐
│  Express API  (localhost:3002)                                   │
│                                                                  │
│  routes/customers.js   GET·POST·PUT·DELETE /api/customers        │
│  routes/policies.js    GET·POST·DELETE     /api/policies         │
│  routes/claims.js      GET·POST·DELETE     /api/claims           │
│                                                                  │
│  utils/cobolRunner.js  — spawns compiled COBOL executable,       │
│                          marshals JSON commarea via stdin/stdout  │
└─────────────────────────┬────────────────────────────────────────┘
                          │  child_process.spawn
┌─────────────────────────▼────────────────────────────────────────┐
│  COBOL Runner executables  (bin/run_*)                           │
│                                                                  │
│  run_cust_inq/add/upd/del   run_pol_inq/add/del                  │
│  run_clm_inq/add/del                                             │
│                                                                  │
│  Each runner reads a JSON commarea from stdin, calls the         │
│  corresponding GnuCOBOL shared library via dynamic CALL,         │
│  and writes the result to stdout.                                │
└───────────┬──────────────────────────┬───────────────────────────┘
            │  GnuCOBOL dynamic CALL   │
┌───────────▼──────────────────────────▼───────────────────────────┐
│  GnuCOBOL shared libraries  (bin/*.dylib)                        │
│                                                                  │
│  Ported from base/src (via patch_cics.py):                       │
│    lgacdb01/02  lgicdb01  lgucdb01   (customer)                  │
│    lgapdb01     lgipdb01  lgupdb01   lgdpdb01  (policy)          │
│                                                                  │
│  New programs (cobol/):                                          │
│    lgdcdb01  (customer delete)                                   │
│    lgaclm01  lgicm01  lgdclm01  (claims)                         │
│                                                                  │
│  CICS stubs replace: LGSTSQ · LGACVS01 · LGAPVS01 · LGUPVS01   │
│                      LGUCVS01 · LGDPVS01                         │
└─────────────────────────┬────────────────────────────────────────┘
                          │  ocesql embedded SQL
┌─────────────────────────▼────────────────────────────────────────┐
│  PostgreSQL 18  (localhost:5432 · database: genapp)              │
│                                                                  │
│  customer  →  endowment / house / motor / commercial  →  claim   │
│  (all FK relationships preserved; DELETE cascades)               │
└──────────────────────────────────────────────────────────────────┘
```

**Build pipeline** (`make all` + `make api-runners`):
```
base/src/*.cbl
    │
    ▼  patch_cics.py  (strip CICS constructs, inject EXEC SQL CONNECT)
local-build/src/*.cbl
    │
    ▼  ocesql  (preprocess embedded SQL → plain COBOL)
local-build/gen/*.cbl
    │
    ▼  cobc  (GnuCOBOL compiler)
local-build/bin/*.dylib  +  bin/run_*
```

---

## Features

### Original GenApp features

| Domain | Operation | COBOL program |
|---|---|---|
| **Customer** | Add customer | LGACDB01 / LGACDB02 |
| **Customer** | Query customer | LGICDB01 |
| **Customer** | Update customer | LGUCDB01 |
| **Customer** | Dedicated security (MD5 hashed passwords, separate table) | LGACDB02 |
| **Policy** | Add policy (Endowment / House / Motor / Commercial) | LGAPDB01 |
| **Policy** | Query policy | LGIPDB01 |
| **Policy** | Update policy | LGUPDB01 |
| **Policy** | Delete policy | LGDPDB01 |
| **Claims** | Query claim | *(VSAM-based in original)* |
| **Error handling** | Centralised error handler with SQL codes → transient data queue | LGSTSQ |
| **Data storage** | Hybrid: IBM Db2 (relational) + VSAM files | — |

### Added in this fork

| Domain | Operation | Notes |
|---|---|---|
| **Customer** | Delete customer | New: `lgdcdb01`; cascades to all policies and claims via FK |
| **Policy** | Create policy (all 4 types) via REST + UI | New runner + UI form with type-specific fields |
| **Policy** | Delete policy via REST + UI | New runner + two-click confirmation |
| **Claims** | Add claim | New: `lgaclm01`; returns new claim number |
| **Claims** | Query claim | New: `lgicm01` |
| **Claims** | Delete claim | New: `lgdclm01` |
| **Interface** | REST API (Express, 12 endpoints) | Replaces 3270 terminal |
| **Interface** | React web UI (10 screens) | Replaces 3270 terminal |
| **Data storage** | PostgreSQL (replaces Db2 + VSAM) | Single relational store |

---

## Requirements

### Original (mainframe)

| Requirement | Details |
|---|---|
| z/OS environment | IBM mainframe running z/OS |
| IBM CICS TS | v4.1 or later |
| IBM Db2 | For relational data storage |
| IBM COBOL compiler | With Language Environment |
| VSAM files | For certain data storage operations |
| RACF user ID | Authorized for Db2 objects and CICS region |
| 3270 terminal | Or terminal emulator |
| USS (optional) | Rocket Git v2.26.2+ for direct clone to z/OS |

### This fork (local)

| Tool | Version | macOS install |
|---|---|---|
| [GnuCOBOL](https://gnucobol.sourceforge.io/) | ≥ 3.2 | `brew install gnucobol` |
| [ocesql](https://github.com/opensourcecobol/open-cobol-ESQL) | ≥ 1.5 | build from source |
| [PostgreSQL](https://www.postgresql.org/) | 18 | `brew install postgresql@18` |
| [Node.js](https://nodejs.org/) | ≥ 20 | `brew install node` |
| [pnpm](https://pnpm.io/) | ≥ 9 | `npm i -g pnpm` |
| Python 3 | ≥ 3.8 | pre-installed on macOS |

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/lorena-davila2025/cics-genapp.git
cd cics-genapp
```

### 2. Create the database

```bash
createdb genapp
psql genapp < local-build/db/genapp_postgres.sql
```

This creates the `genapp` schema with all tables (customer, policy subtypes,
claim) and loads a small seed dataset.

### 3. Build the COBOL programs

```bash
cd local-build
make all           # stubs + all DB shared libraries → bin/*.dylib
make api-runners   # stdin/stdout runner executables → bin/run_*
```

Expected output: 6 stub `.dylib` files + 12 DB `.dylib` files + 10 `run_*`
executables in `bin/`.

### 4. Set environment variables

```bash
source local-build/env.sh
```

This sets `COB_LIBRARY_PATH` (so GnuCOBOL finds the `.dylib` files at
runtime) and the `PG*` variables for the database connection.

> Re-run `source local-build/env.sh` in any new terminal before starting the
> API server.

### 5. Start the API server

```bash
cd local-build/api
pnpm install
node server.js
# → Listening on http://localhost:3002
```

### 6. Start the frontend

Open a new terminal:

```bash
cd local-build/frontend
pnpm install
pnpm dev
# → http://localhost:5173
```

Open `http://localhost:5173` in your browser. The Vite dev server proxies
`/api/*` requests to the Express server on port 3002.

---

## API reference

### Customers

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/customers` | List all customers |
| `GET` | `/api/customers/:id` | Lookup customer by number |
| `POST` | `/api/customers` | Create customer, returns `{ customer_num }` |
| `PUT` | `/api/customers/:id` | Update customer fields |
| `DELETE` | `/api/customers/:id` | Delete customer (cascades all policies and claims) |

### Policies

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/policies` | List all policies |
| `GET` | `/api/policies?cust_num=N` | List policies for a customer |
| `GET` | `/api/policies/customer/:custId?policy_num=N&policy_type=E` | Lookup a single policy |
| `POST` | `/api/policies` | Create policy (`pol_type`: `E` / `H` / `M` / `C`) |
| `DELETE` | `/api/policies/customer/:custId/:polNum?policy_type=E` | Delete policy |

### Claims

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/claims` | List all claims |
| `GET` | `/api/claims?policy_num=N` | List claims for a policy |
| `GET` | `/api/claims/:claimNum` | Lookup a single claim |
| `POST` | `/api/claims` | Create claim, returns `{ claim_num }` |
| `DELETE` | `/api/claims/:claimNum` | Delete claim |

---

## Repository layout

```
cics-genapp/
├── base/                        # Original CICS/Db2 COBOL source (unchanged)
└── local-build/
    ├── db/
    │   └── genapp_postgres.sql  # Schema + seed data
    ├── scripts/
    │   └── patch_cics.py        # Transforms original source for GnuCOBOL
    ├── cics/                    # CICS stub programs (compiled to dylib)
    ├── copybook/                # COBOL copybooks (LGCMAREA, LGPOLICY, SQLCA…)
    ├── cobol/                   # New COBOL programs (no original source)
    │   ├── lgdcdb01.cbl         # Customer DELETE
    │   ├── lgaclm01.cbl         # Claim INSERT
    │   ├── lgicm01.cbl          # Claim SELECT
    │   └── lgdclm01.cbl         # Claim DELETE
    ├── Makefile                 # patch → ocesql → cobc pipeline
    ├── env.sh                   # Runtime environment variables
    ├── api/
    │   ├── cobol/               # Runner source (run_*.cbl)
    │   ├── routes/              # customers.js · policies.js · claims.js
    │   ├── utils/cobolRunner.js # Spawns COBOL executables, marshals JSON
    │   └── server.js            # Express entry point (port 3002)
    ├── frontend/
    │   └── src/
    │       ├── api.js           # Fetch wrapper for all endpoints
    │       ├── App.jsx          # 10-tab navigation
    │       ├── index.css        # Design system (no UI framework)
    │       └── components/      # One component per screen
    └── test/
        └── testdb.cbl           # Smoke-test COBOL runner
```

---

## License

Original GenApp code: [Eclipse Public License 2.0](LICENSE) — © IBM.
Local-build additions in this fork: same license.
