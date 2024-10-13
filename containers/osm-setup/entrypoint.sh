#!/usr/bin/env bash

set -euo pipefail

# https://github.com/jameschevalier/cities?tab=readme-ov-file
#
pushd /data/osm > /dev/null

[ ! -f ./romania-map.osm.pbf ] && \
    echo 'Downloading Romania map...' && \
    curl -fsSL https://download.geofabrik.de/europe/romania-latest.osm.pbf -o romania-map.osm.pbf

OSM_IDS=('2366996' '377733')
for OSM_ID in "${OSM_IDS[@]}"; do
    [ ! -f "./${OSM_ID}.poly" ] && \
      echo "Downloading polygon ${OSM_ID}..."
      curl -fsSL "https://polygons.openstreetmap.fr/get_poly.py?id=${OSM_ID}&params=0" \
        -o "./${OSM_ID}.poly"

    [ ! -f "./${OSM_ID}.osm" ] && \
      echo "Extracting bounding region from polygon ${OSM_ID}..." && \
      osmconvert romania-map.osm.pbf \
        -B="./${OSM_ID}.poly" \
        --complete-ways \
        --complete-multipolygons \
        --out-osm > \
        "./${OSM_ID}.osm"
done

if [ ! -f "./map.osm" ]; then
  echo "Joining all extracts for OSRM export..."
  OSM_LIST=()
  for OSM_ID in "${OSM_IDS[@]}"; do
    OSM_LIST+=("./${OSM_ID}.osm")
  done
  osmconvert "${OSM_LIST[@]}" --out-osm > "./map.osm"
fi


popd > /dev/null

echo 'Finished processing Ilfov, Bucuresti regions from Romania osm file!'
