#!/usr/bin/env bash
#
docker compose exec -ti postgis bash -ec \
  "PGPASSWORD=\$POSTGIS_PASSWORD PGHOST=\$POSTGIS_HOST PGUSER=\$POSTGIS_USER PGDATABASE=\$POSTGIS_DB psql"
