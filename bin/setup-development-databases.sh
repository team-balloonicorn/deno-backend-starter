#!/bin/sh

set -eu

export PGHOST=localhost
export PGUSER=postgres
export PGPASSWORD=postgres

exec_sql() {
  PGOPTIONS="--client-min-messages=warning" \
    psql -X -1 -v ON_ERROR_STOP=1 \
    --pset pager=off \
    -d "$1" \
    --file "$2"
}

recreate() {
  local database_name="$1"

  echo
  echo "Resetting $database_name"

  dropdb "$database_name" --force --if-exists
  createdb "$database_name"

  for file in sql/migrations/*/up.sql;
  do
    echo "> $file"
    exec_sql "$database_name" "$file"
  done
}

recreate "deno_starter"
recreate "deno_starter_test"

echo
echo Inserting development seed data
exec_sql "deno_starter" "sql/development_seeds.sql"
