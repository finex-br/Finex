#!/bin/bash
set -e

# Force password authentication
echo "host all all 0.0.0.0/0 md5" > "$PGDATA/pg_hba.conf"
echo "local all all md5" >> "$PGDATA/pg_hba.conf"

# Ensure password is set
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
EOSQL
