import {circle} from '@turf/turf'
import {useMemo, useCallback} from 'react'
import {useQuery} from 'react-query'

import useBackend from '../hooks/useBackend'


const buildExcludedPolygonsFromGeoJSON = (excludeLocations, radius) => {
  // Returns an array of arrays of [lon,lat] pairs
  // for each GeoJSON point around radius

  if (!excludeLocations.features) {
    return
  };
  const options = {
    steps: 12,
    units: "metres"
  }
  const excludePolygons = excludeLocations.features.map((f) => {
    const circleCenter = [
      f.geometry.coordinates[0],
      f.geometry.coordinates[1]
    ];
    const circlePolygon = circle(circleCenter, radius, options)
    const circlePolygonVertices = circlePolygon.geometry.coordinates[0].map((x) => {
      return [
        x[0],
        x[1]
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
    units: 'kilometres',
    format: 'osrm',
    banner_instructions: true,
    voice_instructions: true,
    direction_options: {
      units: 'kilometres',
      format: 'osrm',
      banner_instructions: true,
      voice_instructions: true,
    },
    locations: parsedLocations,
    exclude_polygons: buildExcludedPolygonsFromGeoJSON(
        excludeLocations, 60
    ),
  });

  return response
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
    enabled: state.enabled,
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
      () => query.data,
      [query.data]
    ),
  };
}
