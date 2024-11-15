import {useMemo, useCallback} from 'react'
import {useQuery, useQueryClient} from 'react-query'

import useBackend from '../hooks/useBackend'

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

  const response = await backend.post("/reports_latest", {

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

export const useBrowsingReportsQuery = (state) => {

  const backend = useBackend();
  const query = useQuery({
    queryKey: ['browse-reports', state.excludeLocations, state.locations],
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

  console.log(query)
  return {
    ...query,
    data: useMemo(
      () => decodeRouteGeoJSON(query.data),
      [query.data]
    ),
  };
}
