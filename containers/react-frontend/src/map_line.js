import * as polyline from '@mapbox/polyline'
import {useCallback, useEffect, useState} from 'react';
import {Layer, Source} from 'react-map-gl';

const lineLayerStyle = {
  id: "route",
  type: "line",
  paint: {
    'line-color': '#b3ffb3',
    'line-width': 4
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
}

const locationLayerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 6,
    'circle-color': '#ffff66'
  }
};

const getExcludedFromGeoJSON = (excludePoints) => {
   // Build excludeLocations from GeoJSON FeatureCollection
   const excludeLocations = excludePoints.features.map((f) => {
     return ({
       lat: f.geometry.coordinates[1],
       lon: f.geometry.coordinates[0]
     })
   });

  return excludeLocations
}

export const getRouteGeoJSON = async(pointList, excludePoints) => {
  if (pointList.length < 2) {
    return null
  }

  const locations = pointList.map((x) => {
    return {
      lat: x.latitude,
      lon: x.longitude
    };
  });

  console.log({
    locations: locations,
    exclude_locations: getExcludedFromGeoJSON(excludePoints),
    costing: 'auto',
    direction_options: {
      units: 'kilometres'
    }
  })
  const route_response = await fetch("http://localhost:8002/optimized_route?json=", {
    method: 'POST',
    body: JSON.stringify({
      locations: locations,
      exclude_locations: getExcludedFromGeoJSON(excludePoints),
      costing: 'auto',
      direction_options: {
        units: 'kilometres'
      }
    })
  });

  const data = await route_response.json()
  return data
}


export const decodeRouteGeoJSON = (data) => {
    if (!data) {
      return
    };
    if (data.trip && data.trip.legs) {

      const routeFeatures = data.trip.legs.map((leg) => {
        return ({
          type: 'Feature',
          geometry: polyline.toGeoJSON(leg.shape, 6)
        })
      });

      return ({
        type: 'FeatureCollection',
        features: routeFeatures
      });
    }
    return
};

export function MapLine({pointList, excludePoints}) {

  const [routeGeoJSON, setRouteGeoJSON] = useState();
  const [locationGeoJSON, setLocationGeoJSON]= useState();

  const showRoute = useCallback(async() => {
    const data = await getRouteGeoJSON(pointList, excludePoints);
    const geoJSON = decodeRouteGeoJSON(data);
    console.log(data)
    if (geoJSON) {
      setRouteGeoJSON(geoJSON);
    };
  }, [pointList, excludePoints]);

  useEffect(() => {
    showRoute();
  }, [showRoute])

  useEffect(() => {
    if (pointList) {

      const locationFeatures = pointList.map((point) => {
        return ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude]
          }
        })
      });
      setLocationGeoJSON({
        type: 'FeatureCollection',
        features: locationFeatures
      })
    }
  }, [pointList])

  return(
    <>
    { routeGeoJSON
      ? <Source key="route-source" id="route-source" type="geojson" data={routeGeoJSON}>
          <Layer {...lineLayerStyle} id="route-layer" source="route-source"/>
        </Source>
      : null
    }
    { locationGeoJSON
      ? <Source key="location-source" id="location-source" type="geojson" data={locationGeoJSON}>
          <Layer {...locationLayerStyle} id="location-layer" source="location-source"/>
        </Source>
      : null
    }
    </>
  );
};
