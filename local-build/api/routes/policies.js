'use strict';

const express = require('express');
const router  = express.Router();
const { runCobol } = require('../utils/cobolRunner');
const pool = require('../utils/db');

/**
 * Map a COBOL return code to an HTTP status.
 */
function httpStatus(cobolStatus) {
    if (cobolStatus === '00') return 200;
    if (cobolStatus === '01' || cobolStatus === '02') return 404;
    return 500;
}

/**
 * Map policy type query param to the single-letter code used by run_pol_inq.
 * Accepts: endowment/e, house/h, motor/m, commercial/c  (case-insensitive)
 */
function resolvePolicyType(raw) {
    if (!raw) return null;
    const up = raw.toUpperCase();
    if (up === 'E' || up === 'ENDOWMENT')  return 'E';
    if (up === 'H' || up === 'HOUSE')      return 'H';
    if (up === 'M' || up === 'MOTOR')      return 'M';
    if (up === 'C' || up === 'COMMERCIAL') return 'C';
    return null;
}

// ─── GET /api/policies  (list all, optional ?cust_num=N filter) ─────────────
router.get('/', async (req, res) => {
    try {
        const custNum = req.query.cust_num;
        const params  = custNum ? [parseInt(custNum, 10)] : [];
        const where   = custNum ? 'WHERE p.customernumber = $1' : '';
        const { rows } = await pool.query(
            `SELECT p.policynumber, p.customernumber, p.policytype,
                    p.issuedate, p.expirydate, p.payment
             FROM genapp.policy p
             ${where}
             ORDER BY p.policynumber`,
            params
        );
        const toDate = v => v ? new Date(v).toISOString().slice(0, 10) : null;
        const TYPE_NAME = { E: 'Endowment', H: 'House', M: 'Motor', C: 'Commercial' };
        res.json(rows.map(r => ({
            policy_num:       String(r.policynumber).padStart(10, '0'),
            customer_num:     String(r.customernumber).padStart(10, '0'),
            policy_type:      TYPE_NAME[r.policytype?.trim()] || r.policytype?.trim(),
            policy_type_code: r.policytype?.trim(),
            issue_date:       toDate(r.issuedate),
            expiry_date:      toDate(r.expirydate),
            payment:          String(r.payment ?? ''),
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/policies/customer/:custId ─────────────────────────────────────
// Query params:
//   policy_num  (required) - the policy number to retrieve
//   policy_type (required) - E/H/M/C  or full name
//
// Example: GET /api/policies/customer/5000?policy_num=1&policy_type=H
router.get('/customer/:custId', (req, res) => {
    const custId    = req.params.custId;
    const polNum    = req.query.policy_num;
    const polType   = resolvePolicyType(req.query.policy_type);

    if (!/^\d+$/.test(custId)) {
        return res.status(400).json({ error: 'Customer number must be numeric' });
    }
    if (!polNum || !/^\d+$/.test(polNum)) {
        return res.status(400).json({ error: 'policy_num query parameter is required and must be numeric' });
    }
    if (!polType) {
        return res.status(400).json({
            error: 'policy_type query parameter is required',
            valid_values: ['E (endowment)', 'H (house)', 'M (motor)', 'C (commercial)'],
        });
    }

    let result;
    try {
        result = runCobol('run_pol_inq', {
            CUST_NUM: custId,
            POL_NUM:  polNum,
            POL_TYPE: polType,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status !== '00') {
        const httpCode = httpStatus(status);
        const message  = httpCode === 404 ? 'Policy not found' : 'COBOL error';
        return res.status(httpCode).json({ error: message, cobol_status: status, stderr });
    }

    // Build a common response that always includes shared fields
    const response = {
        customer_num:  data.customer_num,
        policy_num:    data.policy_num,
        policy_type:   data.pol_type,
        issue_date:    data.issue_date,
        expiry_date:   data.expiry_date,
        last_changed:  data.last_changed,
        broker_id:     data.broker_id,
        brokers_ref:   data.brokers_ref,
        payment:       data.payment,
    };

    // Add type-specific fields
    switch (polType) {
        case 'E':
            Object.assign(response, {
                with_profits:  data.with_profits,
                equities:      data.equities,
                managed_fund:  data.managed_fund,
                fund_name:     data.fund_name,
                term:          data.term,
                sum_assured:   data.sum_assured,
                life_assured:  data.life_assured,
            });
            break;
        case 'H':
            Object.assign(response, {
                property_type: data.property_type,
                bedrooms:      data.bedrooms,
                value:         data.value,
                house_name:    data.house_name,
                house_number:  data.house_number,
                postcode:      data.postcode,
            });
            break;
        case 'M':
            Object.assign(response, {
                make:          data.make,
                model:         data.model,
                value:         data.value,
                reg_number:    data.reg_number,
                colour:        data.colour,
                cc:            data.cc,
                manufactured:  data.manufactured,
                premium:       data.premium,
                accidents:     data.accidents,
            });
            break;
        case 'C':
            Object.assign(response, {
                address:         data.address,
                postcode:        data.postcode,
                latitude:        data.latitude,
                longitude:       data.longitude,
                fire_peril:      data.fire_peril,
                fire_premium:    data.fire_premium,
                crime_peril:     data.crime_peril,
                crime_premium:   data.crime_premium,
                flood_peril:     data.flood_peril,
                flood_premium:   data.flood_premium,
                weather_peril:   data.weather_peril,
                weather_premium: data.weather_premium,
                status_code:     data.status_code,
            });
            break;
    }

    return res.status(200).json(response);
});

// ─── POST /api/policies ──────────────────────────────────────────────────
router.post('/', (req, res) => {
    const { cust_num, pol_type, issue_date, expiry_date,
            broker_id = '0', brokers_ref = '', payment = '0' } = req.body;

    if (!cust_num || !pol_type || !issue_date || !expiry_date) {
        return res.status(400).json({
            error: 'cust_num, pol_type, issue_date, expiry_date are required',
        });
    }

    const type = resolvePolicyType(pol_type);
    if (!type) {
        return res.status(400).json({
            error: 'pol_type must be E, H, M or C',
            valid_values: ['E (endowment)', 'H (house)', 'M (motor)', 'C (commercial)'],
        });
    }

    const env = {
        CUST_NUM:    cust_num,
        POL_TYPE:    type,
        ISSUE_DATE:  issue_date,
        EXPIRY_DATE: expiry_date,
        BROKER_ID:   broker_id,
        BROKERS_REF: brokers_ref,
        PAYMENT:     payment,
    };

    const b = req.body;
    if (type === 'E') {
        Object.assign(env, {
            WITH_PROFITS: b.with_profits || ' ',
            EQUITIES:     b.equities     || ' ',
            MANAGED_FUND: b.managed_fund || ' ',
            FUND_NAME:    b.fund_name    || '',
            TERM:         b.term         || '0',
            SUM_ASSURED:  b.sum_assured  || '0',
            LIFE_ASSURED: b.life_assured || '',
        });
    } else if (type === 'H') {
        Object.assign(env, {
            PROPERTY_TYPE: b.property_type || '',
            BEDROOMS:      b.bedrooms      || '0',
            VALUE:         b.value         || '0',
            HOUSE_NAME:    b.house_name    || '',
            HOUSE_NUMBER:  b.house_number  || '',
            POSTCODE:      b.postcode      || '',
        });
    } else if (type === 'M') {
        Object.assign(env, {
            MAKE:         b.make         || '',
            MODEL:        b.model        || '',
            VALUE:        b.value        || '0',
            REG_NUMBER:   b.reg_number   || '',
            COLOUR:       b.colour       || '',
            CC:           b.cc           || '0',
            MANUFACTURED: b.manufactured || '',
            PREMIUM:      b.premium      || '0',
            ACCIDENTS:    b.accidents    || '0',
        });
    } else if (type === 'C') {
        Object.assign(env, {
            ADDRESS:         b.address         || '',
            POSTCODE:        b.postcode        || '',
            LATITUDE:        b.latitude        || '',
            LONGITUDE:       b.longitude       || '',
            CUSTOMER_NAME:   b.customer_name   || '',
            PROPERTY_TYPE:   b.property_type   || '',
            FIRE_PERIL:      b.fire_peril      || '0',
            FIRE_PREMIUM:    b.fire_premium    || '0',
            CRIME_PERIL:     b.crime_peril     || '0',
            CRIME_PREMIUM:   b.crime_premium   || '0',
            FLOOD_PERIL:     b.flood_peril     || '0',
            FLOOD_PREMIUM:   b.flood_premium   || '0',
            WEATHER_PERIL:   b.weather_peril   || '0',
            WEATHER_PREMIUM: b.weather_premium || '0',
            STATUS_CODE:     b.status_code     || '0',
        });
    }

    let result;
    try {
        result = runCobol('run_pol_add', env);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(201).json({
            policy_num: data.policy_num,
            message: 'Policy created successfully',
        });
    }
    if (status === '70') {
        return res.status(404).json({ error: 'Customer not found', cobol_status: status });
    }
    return res.status(500).json({ error: 'Failed to create policy', cobol_status: status, stderr });
});

// ─── DELETE /api/policies/customer/:custId/:polNum ───────────────────────
// Query param: policy_type (required)
router.delete('/customer/:custId/:polNum', (req, res) => {
    const custId  = req.params.custId;
    const polNum  = req.params.polNum;
    const polType = resolvePolicyType(req.query.policy_type);

    if (!/^\d+$/.test(custId)) {
        return res.status(400).json({ error: 'Customer number must be numeric' });
    }
    if (!/^\d+$/.test(polNum)) {
        return res.status(400).json({ error: 'Policy number must be numeric' });
    }
    if (!polType) {
        return res.status(400).json({
            error: 'policy_type query parameter is required',
            valid_values: ['E (endowment)', 'H (house)', 'M (motor)', 'C (commercial)'],
        });
    }

    let result;
    try {
        result = runCobol('run_pol_del', {
            CUST_NUM: custId,
            POL_NUM:  polNum,
            POL_TYPE: polType,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(200).json({ message: 'Policy deleted successfully' });
    }
    return res.status(500).json({ error: 'Failed to delete policy', cobol_status: status, stderr });
});

module.exports = router;
