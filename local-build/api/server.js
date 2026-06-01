'use strict';

const express    = require('express');
const cors       = require('cors');
const path       = require('path');

const customersRouter = require('./routes/customers');
const policiesRouter  = require('./routes/policies');
const claimsRouter    = require('./routes/claims');

const app  = express();
const PORT = process.env.PORT || 3002;

// ─── Middleware ────────────────────────────────────────────────────────────
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

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/customers', customersRouter);
app.use('/api/policies',  policiesRouter);
app.use('/api/claims',    claimsRouter);

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
