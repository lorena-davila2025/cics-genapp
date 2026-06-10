'use strict';

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const { rateLimit } = require('express-rate-limit');

const customersRouter = require('./routes/customers');
const policiesRouter  = require('./routes/policies');
const claimsRouter    = require('./routes/claims');

const app  = express();
const PORT = process.env.PORT || 3002;

// ─── Rate limiters ─────────────────────────────────────────────────────────
// Read endpoints: 120 requests / minute per IP
const readLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
});

// Write endpoints: 20 requests / minute per IP
const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Write rate limit exceeded. Try again in a minute.' },
});

// ─── Middleware ────────────────────────────────────────────────────────────
app.set('trust proxy', 1); // Render sits behind a load balancer
app.use(cors());
app.use(express.json());

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'genapp-api',
        timestamp: new Date().toISOString(),
    });
});

// ─── Temporary debug: test COBOL runner directly ───────────────────────────
app.get('/debug/bin', (_req, res) => {
    const { execSync, spawnSync } = require('child_process');
    const run = (cmd) => { try { return execSync(cmd).toString(); } catch (e) { return e.stderr?.toString() || e.message; } };
    const cobEnv = {
        COB_LIBRARY_PATH: '/app/bin:/usr/local/lib',
        COB_DYNAMIC_CALLS: 'YES',
        LD_LIBRARY_PATH: '/app/bin:/usr/local/lib',
        PGHOST: process.env.PGHOST, PGUSER: process.env.PGUSER,
        PGPASSWORD: process.env.PGPASSWORD, PGDATABASE: process.env.PGDATABASE,
        PGOPTIONS: '--search_path=genapp',
        FIRSTNAME: 'Debug', LASTNAME: 'Test', DOB: '1990-01-01',
        PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    };
    const r = spawnSync('/app/bin/run_cust_add', [], { env: cobEnv, timeout: 10000 });
    res.json({
        stdout:      (r.stdout || '').toString(),
        stderr:      (r.stderr || '').toString(),
        exitCode:    r.status,
        ldconfig_pq: run('ldconfig -p | grep -E "libpq|ocesql"'),
    });
});

// ─── Route-level rate limiting (GET=read limit, mutations=write limit) ─────
const applyLimiter = (req, res, next) =>
    req.method === 'GET' ? readLimiter(req, res, next) : writeLimiter(req, res, next);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/customers', applyLimiter, customersRouter);
app.use('/api/policies',  applyLimiter, policiesRouter);
app.use('/api/claims',    applyLimiter, claimsRouter);

// ─── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ─── Error handler ─────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`GenApp API listening on http://localhost:${PORT}`);
    console.log('Routes:');
    console.log(`  GET    /health`);
    console.log(`  GET    /api/customers/:id`);
    console.log(`  POST   /api/customers`);
    console.log(`  PUT    /api/customers/:id`);
    console.log(`  DELETE /api/customers/:id`);
    console.log(`  GET    /api/policies/customer/:custId?policy_num=N&policy_type=H`);
    console.log(`  POST   /api/policies`);
    console.log(`  DELETE /api/policies/customer/:custId/:polNum?policy_type=H`);
    console.log(`  GET    /api/claims/:claimNum`);
    console.log(`  POST   /api/claims`);
    console.log(`  DELETE /api/claims/:claimNum`);
});
