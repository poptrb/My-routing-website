import * as polyline from '@mapbox/polyline'
import {useMemo, useEffect, useState} from 'react';
import {Layer, Source} from 'react-map-gl';
import {circle} from '@turf/circle'

const lineLayerStyle = {
  id: "route",
  type: "line",
  paint: {
    'line-color': '#00b300',
    'line-width': 6
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
    'circle-radius': 10,
    'circle-color': '#ffff66'
  }
};

const buildExcludedPolygonsFromGeoJSON = (excludePoints, radius) => {
  const options = {
    steps: 12,
    units: "metres"
  }

  const excludePolygons = excludePoints.features.map((f) => {

    const circleCenter = [
      f.geometry.coordinates[1],
      f.geometry.coordinates[0]
    ];

    const circlePolygon = circle(circleCenter, radius, options)
    const circlePolygonVertices = circlePolygon.geometry.coordinates[0].map((x) => {
      return [
        x[1],
        x[0]
      ];
    });
    return circlePolygonVertices

  });

  return excludePolygons
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

  const route_response = await fetch("http://localhost:8002/optimized_route?json=", {
    method: 'POST',
    body: JSON.stringify({
      locations: locations,
      exclude_polygons: buildExcludedPolygonsFromGeoJSON(excludePoints, 30),
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

export function MapLine({pointList, excludePoints, routeGeoJSON, updateRouteGeoJSON}) {

  const [locationGeoJSON, setLocationGeoJSON]= useState();

  const showRoute = useMemo(() => async() => {
    const data = await getRouteGeoJSON(pointList, excludePoints);
    const geoJSON = decodeRouteGeoJSON(data);
    if (geoJSON) {
      updateRouteGeoJSON(geoJSON);
    };
  }, [pointList, excludePoints, updateRouteGeoJSON]);

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
