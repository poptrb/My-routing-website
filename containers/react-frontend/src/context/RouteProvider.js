import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import useQuery from 'react-query'
import useBackend from '../hooks/useBackend'


export const RouteProvider = ({ children }) => {



const fetchOptimizedRoute = async(backend, excludePoints, locations) => {


  let response_data = null;

  await backend.post("/geo/optimized_route?json=", {
    locations: locations,
    exclude_polygons: buildExcludedPolygonsFromGeoJSON(excludePoints, 30),
    costing: 'auto',
    direction_options: {
      units: 'kilometres'
    }
  }).then((response) => {
    response_data = response.data
  }).catch((err) => {
    console.error(err)
  })

  return response_data;
}

const RouteContext = createContext();
  const backend = useBackend()
  const { isPending, error, data } = useQuery(
      ["browse-reports", backend, excludePoints, locations],
      () => fetchOptimizedRoute(backend, excludePoints, locations),
    {
      keepPreviousData: true,
    },
  );

 return (
   <RouteContext.Provider value={null}>
     {children}
   </RouteContext.Provider>
 );
};
