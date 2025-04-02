import { useState, useEffect, useCallback } from 'react';
import { useMapInfo } from '../context/UserLocationProvider';
import { useMapMatchingQuery } from './useMapMatchingQuery';
import { usePathComparison } from './usePathComparison';
import * as polyline from '@mapbox/polyline';
import * as turf from '@turf/turf';

/**
 * Hook to handle map matching and route deviation detection
 */
export const useMapMatching = () => {
  const mapInfo = useMapInfo();
  const { hasDeviatedFromRoute } = usePathComparison();
  const [deviationDetected, setDeviationDetected] = useState(false);

  // Configure map matching query
  const mapMatchingState = {
    locations: mapInfo.locationHistory,
    enabled: mapInfo.locationHistory &&
             mapInfo.locationHistory.length >= 2 &&
             mapInfo.tripMenu?.state === 'driving'
  };

  // Use the map matching query
  const {
    matchedData,
    isMapMatchingError,
    isMapMatchingPending
  } = useMapMatchingQuery(mapMatchingState);

  // Convert route to GeoJSON
  const routeToGeoJSON = useCallback((route) => {
    if (!route || !route.geometry) return null;

    try {
      // Decode the polyline
      const decodedLine = polyline.decode(route.geometry, 6);

      // Return as GeoJSON LineString
      return {
        type: 'LineString',
        coordinates: decodedLine.map(point => [point[1], point[0]]) // [lon, lat]
      };
    } catch (error) {
      console.error("Error converting route to GeoJSON:", error);
      return null;
    }
  }, []);

  // Check if user has deviated from the planned route
  const checkRouteDeviation = useCallback((matchedData) => {
    if (!matchedData || !mapInfo.trip) return;

    const routeGeoJSON = routeToGeoJSON(mapInfo.trip);

    if (!routeGeoJSON || !matchedData.matchedPath) return;

    // Determine if the user has deviated from the route
    const hasDeviated = hasDeviatedFromRoute(
      matchedData.matchedPath,
      routeGeoJSON,
      { bufferDistance: 50 } // 50 meters tolerance
    );

    if (hasDeviated && !deviationDetected) {
      console.log("Route deviation detected!");
      setDeviationDetected(true);

      // Trigger route recalculation
      if (mapInfo.userLocation && mapInfo.destinationLocation) {
        // Request a route recalculation by changing to browsing state temporarily
        mapInfo.setTripMenu({state: 'driving-browsing'});

        // After a short delay, switch back to driving state to trigger a recomputation
        setTimeout(() => {
          mapInfo.setTripMenu({state: 'driving'});
        }, 500);
      }
    } else if (!hasDeviated && deviationDetected) {
      setDeviationDetected(false);
    }
  }, [mapInfo, routeToGeoJSON, hasDeviatedFromRoute, deviationDetected]);

  // Update matched location when we get results
  useEffect(() => {
    if (matchedData) {
      // Update the matched location in the context
       mapInfo.setMatchedLocation(matchedData);

      // If we're in driving mode with a planned route, check for deviations
      if (mapInfo.tripMenu?.state === 'driving' && mapInfo.trip) {
        checkRouteDeviation(matchedData);
      }
    }
  }, [matchedData, mapInfo, checkRouteDeviation]);



  return {
    matchedData,
    isMapMatchingPending,
    isMapMatchingError,
    deviationDetected,
    resetDeviation: () => setDeviationDetected(false)
  };
};
