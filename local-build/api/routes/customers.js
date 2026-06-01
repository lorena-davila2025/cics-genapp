'use strict';

const express = require('express');
const router  = express.Router();
const { runCobol } = require('../utils/cobolRunner');
const pool = require('../utils/db');

/**
 * Translate a COBOL CA-RETURN-CODE string to an HTTP status code.
 * '00' -> 200 success
 * '01' -> 404 not found (customer/policy does not exist)
 * '02' -> 404 (some programs also use 02 for not found)
 * anything else -> 500 internal error
 */
function httpStatus(cobolStatus) {
    if (cobolStatus === '00') return 200;
    if (cobolStatus === '01' || cobolStatus === '02') return 404;
    return 500;
}

// ─── GET /api/customers  (list all) ───────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT customernumber, firstname, lastname, dateofbirth, postcode,
                    (SELECT COUNT(*) FROM genapp.policy p
                     WHERE p.customernumber = c.customernumber) AS num_policies
             FROM genapp.customer c
             ORDER BY customernumber`
        );
        res.json(rows.map(r => ({
            customer_num:  String(r.customernumber).padStart(10, '0'),
            first_name:    r.firstname?.trim(),
            last_name:     r.lastname?.trim(),
            dob:           r.dateofbirth,
            postcode:      r.postcode?.trim(),
            num_policies:  String(r.num_policies),
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/customers/:id ────────────────────────────────────────────────
router.get('/:id', (req, res) => {
    const custNum = req.params.id;

    if (!/^\d+$/.test(custNum)) {
        return res.status(400).json({ error: 'Customer number must be numeric' });
    }

    let result;
    try {
        result = runCobol('run_cust_inq', { CUST_NUM: custNum });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr, exitCode } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(200).json({
            customer_num:  data.customer_num,
            first_name:    data.firstname,
            last_name:     data.lastname,
            dob:           data.dob,
            house_name:    data.house_name,
            house_num:     data.house_num,
            postcode:      data.postcode,
            phone_mobile:  data.phone_mobile,
            phone_home:    data.phone_home,
            email:         data.email,
            num_policies:  data.num_policies,
        });
    }

    const httpCode = httpStatus(status);
    const message  = httpCode === 404 ? 'Customer not found' : 'COBOL error';
    return res.status(httpCode).json({ error: message, cobol_status: status, stderr });
});

// ─── POST /api/customers ──────────────────────────────────────────────────
router.post('/', (req, res) => {
    const {
        first_name, last_name, dob,
        house_name = '', house_num = '',
        postcode = '',
        phone_mobile = '', phone_home = '',
        email = '',
    } = req.body;

    if (!first_name || !last_name || !dob) {
        return res.status(400).json({ error: 'first_name, last_name and dob are required' });
    }

    let result;
    try {
        result = runCobol('run_cust_add', {
            FIRSTNAME:    first_name,
            LASTNAME:     last_name,
            DOB:          dob,
            HOUSE_NAME:   house_name,
            HOUSE_NUM:    house_num,
            POSTCODE:     postcode,
            PHONE_MOBILE: phone_mobile,
            PHONE_HOME:   phone_home,
            EMAIL:        email,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(201).json({
            customer_num: data.customer_num,
            message: 'Customer created successfully',
        });
    }

    return res.status(500).json({ error: 'Failed to create customer', cobol_status: status, stderr });
});

// ─── PUT /api/customers/:id ───────────────────────────────────────────────
router.put('/:id', (req, res) => {
    const custNum = req.params.id;

    if (!/^\d+$/.test(custNum)) {
        return res.status(400).json({ error: 'Customer number must be numeric' });
    }

    const {
        first_name = '', last_name = '', dob = '',
        house_name = '', house_num = '',
        postcode = '',
        phone_mobile = '', phone_home = '',
        email = '',
    } = req.body;

    let result;
    try {
        result = runCobol('run_cust_upd', {
            CUST_NUM:     custNum,
            FIRSTNAME:    first_name,
            LASTNAME:     last_name,
            DOB:          dob,
            HOUSE_NAME:   house_name,
            HOUSE_NUM:    house_num,
            POSTCODE:     postcode,
            PHONE_MOBILE: phone_mobile,
            PHONE_HOME:   phone_home,
            EMAIL:        email,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(200).json({ message: 'Customer updated successfully' });
    }

    const httpCode = httpStatus(status);
    const message  = httpCode === 404 ? 'Customer not found' : 'Failed to update customer';
    return res.status(httpCode).json({ error: message, cobol_status: status, stderr });
});

// ─── DELETE /api/customers/:id ────────────────────────────────────────────
router.delete('/:id', (req, res) => {
    const custNum = req.params.id;

    if (!/^\d+$/.test(custNum)) {
        return res.status(400).json({ error: 'Customer number must be numeric' });
    }

    let result;
    try {
        result = runCobol('run_cust_del', { CUST_NUM: custNum });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to spawn COBOL runner', detail: err.message });
    }

    const { data, stderr } = result;
    const status = data.status || '99';

    if (status === '00') {
        return res.status(200).json({ message: 'Customer deleted successfully' });
    }

    return res.status(500).json({ error: 'Failed to delete customer', cobol_status: status, stderr });
});

module.exports = router;
