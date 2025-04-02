import { useMemo, useCallback } from 'react';
import { useQuery } from 'react-query';
import * as polyline from '@mapbox/polyline';
import useBackend from './useBackend';

/**
 * Hook to perform map matching on a series of location points.
 * Uses Valhalla's map matching API to snap user locations to roads.
 */
export const useMapMatchingQuery = (state) => {
  const backend = useBackend();

  // Prepare locations for the API call
  const buildLocations = useCallback((locations) => {
    if (!locations || locations.length < 2) {
      return null;
    }

    // Format locations as expected by Valhalla
    return locations.map((loc) => ({
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
      // Include time in seconds since epoch, accuracy in meters, and heading if available
      time: loc.timestamp ? Math.floor(loc.timestamp / 1000) : undefined,
      accuracy: loc.coords.accuracy || undefined,
      heading: loc.coords.heading !== null ? loc.coords.heading : undefined,
      // Only include speed if it's available and valid
      speed: loc.coords.speed !== null && loc.coords.speed >= 0 ? loc.coords.speed : undefined
    }));
  }, []);

  const fetchMapMatching = async () => {
    if (!state.locations || state.locations.length < 2) {
      return null;
    }

    const formattedLocations = buildLocations(state.locations);

    if (!formattedLocations) {
      return null;
    }

    // Create the request body for map matching
    const body = {
      shape: formattedLocations,
      costing: 'auto',
      shape_match: 'map_snap', // For best matching to the road network
      // filters: {
      //   // attributes: ['edge.names', 'matched.point', 'matched.type', 'shape'],
      //   // action: 'include'
      // }
    };

    // Add optional parameters if available in state
    if (state.searchRadius) body.search_radius = state.searchRadius;
    if (state.turnPenalty) body.turn_penalty_factor = state.turnPenalty;

    try {
      const response = await backend.post('/geo/trace_attributes', body);
      return response.data;
    } catch (error) {
      console.error('Map matching error:', error);
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ['map-matching', state.locations],
    queryFn: fetchMapMatching,
    enabled: state.enabled && state.locations && state.locations.length >= 2,
    staleTime: 5000, // Result is valid for 5 seconds
    retry: 1, // Only retry once
    refetchOnWindowFocus: false
  });

  // Process results to be easily usable
  const processedResult = useMemo(() => {
    if (!query.data) return null;

    // Extract the matched path as a GeoJSON LineString
    let matchedPath = null;
    if (query.data.shape) {
      // Convert the encoded polyline to GeoJSON
      const decodedLine = polyline.decode(query.data.shape, 6);
      matchedPath = {
        type: 'LineString',
        coordinates: decodedLine.map(point => [point[1], point[0]]) // [lon, lat] for GeoJSON
      };
    }

    return {
      ...query.data,
      matchedPath,
      matchedPoints: query.data.matched_points || []
    };
  }, [query.data]);

  return {
    ...query,
    matchedData: processedResult,
    isMapMatchingError: query.isError,
    isMapMatchingPending: query.isPending,
  };
};
