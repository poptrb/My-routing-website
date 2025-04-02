import { useCallback } from 'react';
import * as turf from '@turf/turf';

/**
 * Hook providing utilities to compare paths and detect route deviation.
 */
export const usePathComparison = () => {
  /**
   * Determines if a user has deviated from the planned route.
   * @param {Object} matchedPath - GeoJSON LineString of the map-matched user path
   * @param {Object} routePath - GeoJSON LineString of the planned route
   * @param {Object} options - Configuration options
   * @returns {boolean} - True if user has deviated from the planned route
   */
  const hasDeviatedFromRoute = useCallback((matchedPath, routePath, options = {}) => {
    // Default options
    const {
      bufferDistance = 50, // Buffer distance in meters
      minimumDeviationLength = 30, // Minimum length of deviation to trigger (meters)
    } = options;

    if (!matchedPath || !routePath) {
      return false;
    }

    try {
      // Create a buffer around the planned route
      // Buffer distance is converted from meters to degrees (approximate)
      // This conversion varies based on latitude, but 0.00001 is roughly 1 meter at the equator
      const bufferDistanceDegrees = bufferDistance * 0.00001;
      const routeBuffer = turf.buffer(routePath, bufferDistanceDegrees, { units: 'degrees' });

      // Check if the matched path is within the buffer
      let isWithinBuffer = true;

      // Convert matched path to points for checking
      const matchedPoints = matchedPath.coordinates.map(coord =>
        turf.point([coord[0], coord[1]]));

      // Count points outside the buffer to determine deviation
      let pointsOutsideBuffer = 0;
      let consecutivePointsOutside = 0;
      let maxConsecutiveOutside = 0;

      for (const point of matchedPoints) {
        if (!turf.booleanPointInPolygon(point, routeBuffer)) {
          pointsOutsideBuffer++;
          consecutivePointsOutside++;
          maxConsecutiveOutside = Math.max(maxConsecutiveOutside, consecutivePointsOutside);
        } else {
          consecutivePointsOutside = 0;
        }
      }

      // Calculate percentage of points outside buffer
      const percentOutside = (pointsOutsideBuffer / matchedPoints.length) * 100;

      // Determine if the deviation is significant enough
      // We consider it a deviation if:
      // 1. More than 30% of points are outside the buffer, or
      // 2. We have a consecutive sequence of 5+ points outside the buffer
      isWithinBuffer = percentOutside < 30 && maxConsecutiveOutside < 5;

      return !isWithinBuffer;
    } catch (error) {
      console.error("Error comparing paths:", error);
      return false;
    }
  }, []);

  /**
   * Estimates where a user is on the planned route.
   * @param {Object} userLocation - Current user location
   * @param {Object} routePath - GeoJSON LineString of the planned route
   * @returns {Object} - Information about the user's position on the route
   */
  const getPositionOnRoute = useCallback((userLocation, routePath) => {
    if (!userLocation || !routePath) {
      return null;
    }

    try {
      // Create a point from user's location
      const point = turf.point([userLocation.coords.longitude, userLocation.coords.latitude]);

      // Find the nearest point on the route
      const nearestPoint = turf.nearestPointOnLine(routePath, point);

      return {
        location: nearestPoint.geometry.coordinates,
        distanceToRoute: nearestPoint.properties.dist * 1000, // Convert to meters
        alongPathDistance: nearestPoint.properties.location * 1000, // Convert to meters
        index: nearestPoint.properties.index,
        isOnRoute: nearestPoint.properties.dist < 0.0001, // Roughly 10m
      };
    } catch (error) {
      console.error("Error finding position on route:", error);
      return null;
    }
  }, []);

  return {
    hasDeviatedFromRoute,
    getPositionOnRoute
  };
};
