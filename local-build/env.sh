#!/bin/bash
# Source this before running any compiled GenApp programs:
# example of env credentials
#   source env.sh

export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=genapp
export PGUSER=genapp
export PGPASSWORD=Futur3!R3ady
export PGOPTIONS='--search_path=genapp'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export COB_LIBRARY_PATH="${SCRIPT_DIR}/bin"
export COB_DYNAMIC_CALLS=YES

echo "GenApp environment set (db=genapp, lib=$(echo $COB_LIBRARY_PATH))"
