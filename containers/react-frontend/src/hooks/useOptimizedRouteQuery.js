import * as polyline from '@mapbox/polyline'
import {circle} from '@turf/circle'
import {useMemo, useCallback} from 'react'
import {useQuery} from 'react-query'

import useBackend from '../hooks/useBackend'


export const decodeRouteGeoJSON = (data) => {
  // Decodes polyline6 route data to GeoJSON FeatureCollection

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
  // return
};


const buildExcludedPolygonsFromGeoJSON = (excludeLocations, radius) => {
  // Returns an array of arrays of [lon,lat] pairs
  // for each GeoJSON point around radius

  const options = {
    steps: 12,
    units: "metres"
  }
  const excludePolygons = excludeLocations.features.map((f) => {
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


const fetchOptimizedRoute = async(backend, locations, excludeLocations) => {
  // Returns an /optimized_route JSON response from Valhalla

  if (locations.length < 2) {
    return null
  }

  const parsedLocations = locations.map((x) => {
    return {
      lat: x.latitude,
      lon: x.longitude
    };
  });

  const response = await backend.post("/geo/optimized_route?json=", {
    costing: 'auto',
    direction_options: {
      units: 'kilometres'
    },
    locations: parsedLocations,
    exclude_polygons: buildExcludedPolygonsFromGeoJSON(
        excludeLocations, 30
    ),
  });

  return response
}


const replacePolylineGeoJSON = (data) => {
  if (data?.trip.legs) {
    const decoded = decodeRouteGeoJSON(data)
    console.log('Decode GeoJSON for route', decoded);
    data.trip.geoJSONshape = decoded
  }
  return data
}


export const useOptimizedRouteQuery = (state) => {

  const backend = useBackend();
  const query = useQuery({
    queryKey: ['route', state.excludeLocations, state.locations],
    queryFn: () => fetchOptimizedRoute(backend, state.locations, state.excludeLocations),
    throwOnError: true,
    select: useCallback((data) =>
      data.data
    , []),
    staleTime: 60 * 1000,
    // initialData: () => {
    //   const initialRoute = queryClient.getQueryData([
    //     'browse-reports', null, null
    //   ])
    // },
  })

  // BUG: this re-renders infintely
  // console.log(query)
  return {
    ...query,
    routeData: useMemo(
      () => replacePolylineGeoJSON(query.data),
      [query.data]
    ),
  };
}
