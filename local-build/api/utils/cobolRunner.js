'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const BIN_DIR = path.join(__dirname, '../../bin');
const COB_LIBRARY_PATH = BIN_DIR;

/**
 * Spawn a compiled COBOL runner executable and parse its KEY: VALUE stdout.
 *
 * @param {string} executable  - filename in bin/ (e.g. 'run_cust_inq')
 * @param {Object} envVars     - extra environment variables for the runner
 * @returns {{ data: Object, stderr: string, exitCode: number }}
 */
function runCobol(executable, envVars = {}) {
    const result = spawnSync(
        path.join(BIN_DIR, executable),
        [],
        {
            env: {
                ...process.env,
                COB_LIBRARY_PATH: `${COB_LIBRARY_PATH}:/usr/local/lib`,
                COB_DYNAMIC_CALLS: 'YES',
                LD_LIBRARY_PATH: `${COB_LIBRARY_PATH}:/usr/local/lib`,
                PGHOST:     process.env.PGHOST     || 'localhost',
                PGPORT:     process.env.PGPORT     || '5432',
                PGDATABASE: process.env.PGDATABASE || 'genapp',
                PGUSER:     process.env.PGUSER     || 'genapp',
                PGPASSWORD: process.env.PGPASSWORD || 'qwerty0512',
                PGOPTIONS:  '--search_path=genapp',
                ...envVars,
            },
            timeout: 10000,
        }
    );

    if (result.error) throw result.error;

    const stdout = (result.stdout || '').toString();
    const stderr = (result.stderr || '').toString();

    // Parse KEY: VALUE lines into a plain object.
    // The first colon on each line is the delimiter; value may contain colons.
    const data = {};
    for (const line of stdout.split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
            const key   = line.substring(0, colonIdx).trim().toLowerCase();
            const value = line.substring(colonIdx + 1).trim();
            data[key] = value;
        }
    }

    return { data, stderr, exitCode: result.status };
}

module.exports = { runCobol };
