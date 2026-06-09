'use strict';

const { Pool } = require('pg');

const pool = new Pool({
    host:     process.env.PGHOST     || 'localhost',
    port:     parseInt(process.env.PGPORT || '5432'),
    database: process.env.PGDATABASE || 'genapp',
    user:     process.env.PGUSER     || 'genapp',
    password: process.env.PGPASSWORD || 'qwerty0512',
    options:  '--search_path=genapp',
    ssl:      process.env.PGHOST && process.env.PGHOST !== 'localhost'
                ? { rejectUnauthorized: false }
                : false,
});

module.exports = pool;
