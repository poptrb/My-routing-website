#!/usr/bin/env bash

set -eo pipefail

#ADMIN_USERNAME=''
#ADMIN_PASSWORD=''

login() {
  curl -c cookie.txt -fsSLX POST \
    https://localhost/api/auth/jwt/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=$ADMIN_USERNAME&password=$ADMIN_PASSWORD"
}

create_token() {
  NEW_HASH=$(openssl rand -base64 20)
  curl -b cookie.txt -fsSLX POST \
    https://localhost/api/create_token \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d "{\"token_hash\": \"$NEW_HASH\"}" > /dev/null && \
    echo "${NEW_HASH}"
}

login
create_token

