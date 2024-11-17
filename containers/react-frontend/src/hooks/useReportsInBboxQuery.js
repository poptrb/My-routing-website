import {circle} from '@turf/turf';
import {useMemo, useCallback} from 'react';
import {useQuery} from 'react-query';
import useBackend from '../hooks/useBackend';

/**
 * Builds a bounding box around a given point.
 * @param {Array<number>} center - Center point as [lon, lat].
 * @param {number} diameter - Diameter of the bounding box in kilometers.
 * @returns {Array<Array<number>>} Bounding box as [[lon0, lat0], [lon1, lat1], [lon2, lat2], [lon3, lat3]].
 */

const buildBoundingBox = (center, diameter) => {
  const radius = diameter / 2; // Convert diameter to radius
  const options = {steps: 4, units: 'kilometers'}; // Use 4 steps for a square approximation
  const boundingCircle = circle(center, radius, options);
  return boundingCircle.geometry.coordinates[0];
};

/**
 * Fetches reports within a bounding box using the backend.
 * @param {Object} state - State object containing user coordinates.
 * @param {Array<number>} state.userCoords - User's coordinates as [lon, lat].
 * @returns {Object} Query object with fetched data and status.
 */
export const useReportsInBboxQuery = (state) => {
  const backend = useBackend();

  const userCoords = state.userCoords.map((x) => {
    return {
      lat: (x?.latitude? x.latitude : (x?.[1] ? x[1] : null)),
      long: (x?.longitude? x.longitude : (x?.[0] ? x[0] : null))
    }
  });

  const query = useQuery({
    queryKey: ['reports', state.userCoords],
    queryFn: async () => {
      const response = await backend.post('/reports_absolute_bbox', {
        user_coords: userCoords,
        newer_than: new Date().toISOString(),
      });
      return response;
    },
    throwOnError: true,
    select: useCallback((data) => data.data, []),
  });

  return {
    ...query,
    routeReportData: useMemo(() => query.data, [query.data]),
  };
};
