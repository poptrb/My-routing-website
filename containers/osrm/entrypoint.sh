#!/usr/bin/env bash
#
set -euo pipefail

DATA_DIR="/data"

pushd "${DATA_DIR}" > /dev/null
osrm-extract -p /opt/car.lua "${DATA_DIR}/map.osm"
osrm-partition "${DATA_DIR}/map.osrm"
osrm-customize "${DATA_DIR}/map.osrm"
osrm-routed --algorithm mld "${DATA_DIR}/map.osrm"
popd
