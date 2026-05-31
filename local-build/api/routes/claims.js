'use strict';

const express = require('express');
const router  = express.Router();
const { runCobol } = require('../utils/cobolRunner');

function httpStatus(cobolStatus) {
    if (cobolStatus === '00') return 200;
    if (cobolStatus === '01' || cobolStatus === '02') return 404;
    return 500;
}

// ─── GET /api/claims/:claimNum ────────────────────────────────────────────
router.get('/:claimNum', (req, res) => {
    const claimNum = req.params.claimNum;

    if (!/^\d+$/.test(claimNum)) {
        return res.status(400).json({ error: 'Claim number must be numeric' });
    }

    let result;
    try {
        result = runCobol('run_clm_inq', { CLAIM_NUM: claimNum });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(200).json({
            claim_num:    data.claim_num,
            policy_num:   data.policy_num,
            claim_date:   (data.claim_date || '').trim(),
            paid:         data.paid,
            value:        data.value,
            cause:        (data.cause || '').trim(),
            observations: (data.observations || '').trim(),
        });
    }

    const httpCode = httpStatus(status);
    const message  = httpCode === 404 ? 'Claim not found' : 'COBOL error';
    return res.status(httpCode).json({ error: message, cobol_status: status, stderr });
});

// ─── POST /api/claims ────────────────────────────────────────────────────
// Body: policy_num (required), claim_date, paid, value, cause, observations
router.post('/', (req, res) => {
    const {
        policy_num,
        claim_date   = '',
        paid         = '0',
        value        = '0',
        cause        = '',
        observations = '',
    } = req.body;

    if (!policy_num) {
        return res.status(400).json({ error: 'policy_num is required' });
    }

    let result;
    try {
        result = runCobol('run_clm_add', {
            POL_NUM:      policy_num,
            CLAIM_DATE:   claim_date,
            PAID:         paid,
            VALUE:        value,
            CAUSE:        cause,
            OBSERVATIONS: observations,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(201).json({
            claim_num: data.claim_num,
            message: 'Claim created successfully',
        });
    }
    if (status === '70') {
        return res.status(404).json({ error: 'Policy not found', cobol_status: status });
    }
    return res.status(500).json({ error: 'Failed to create claim', cobol_status: status, stderr });
});

// ─── DELETE /api/claims/:claimNum ─────────────────────────────────────────
router.delete('/:claimNum', (req, res) => {
    const claimNum = req.params.claimNum;

    if (!/^\d+$/.test(claimNum)) {
        return res.status(400).json({ error: 'Claim number must be numeric' });
    }

    let result;
    try {
        result = runCobol('run_clm_del', { CLAIM_NUM: claimNum });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(200).json({ message: 'Claim deleted successfully' });
    }
    return res.status(500).json({ error: 'Failed to delete claim', cobol_status: status, stderr });
});

module.exports = router;
