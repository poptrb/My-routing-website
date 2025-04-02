import {createContext, useCallback, useContext, useState, useRef} from "react";

const MapInfoContext = createContext();

export const MapInfoProvider = ({ children }) => {
  // Store the current user location after map matching
  const [userLocation, setUserLocation] = useState();

  // Store raw location history from Geolocation API
  const [locationHistory, setLocationHistory] = useState([]);

  // Store the map-matched location data
  const [matchedLocation, setMatchedLocation] = useState();

  const [destinationLocation, setDestinationLocation] = useState();
  const [trip, setTrip] = useState();
  const [tripMenu, setTripMenu] = useState({state: 'browsing'});

  // Determine how many location points to keep based on speed
  const getHistorySize = useCallback((speed) => {
    if (speed === null || speed === undefined || isNaN(speed)) {
      return 20; // Default value if speed is not available
    }

    // Convert m/s to km/h
    const speedKmh = speed * 3.6;

    if (speedKmh < 30) {
      return 20; // Maximum points at low speeds
    } else if (speedKmh > 140) {
      return 5;  // Minimum points at high speeds
    } else {
      // Linear interpolation between 20 and 5 for speeds between 30 and 140 km/h
      return Math.round(20 - ((speedKmh - 30) / 110) * 15);
    }
  }, []);

  const removeHistoryOlderThan = useCallback((history, period=30, minEntries=3) => {
     // Get current timestamp
      const currentTime = Date.now();

      const MAX_ENTRY_AGE_MS = period * 1000;

      // Filter out entries older than 30 seconds, but keep at least the 3 most recent entries
      if (history.length > minEntries) {
        const filteredHistory = history.filter((entry, index) => {
          // Always keep the 3 most recent entries
          if (index >= history.length - minEntries) {
            return true;
          }

          // Filter out older entries
          const entryTimestamp = entry.timestamp || 0;
          return (currentTime - entryTimestamp) <= MAX_ENTRY_AGE_MS;
        });

        return filteredHistory;
    }

    return history
  },[]);

  // Add a new location to history and trim if necessary
  const updateLocationHistory = useCallback((newLocation) => {
    if (!newLocation) return;

    setLocationHistory(prevHistory => {
      // Create a new array with the new location at the end
      const updatedHistory = [...prevHistory, newLocation];

      // Determine how many locations to keep based on speed
      // const historySize = getHistorySize(newLocation.coords.speed);

      return removeHistoryOlderThan(updatedHistory)
    });
  }, [/*getHistorySize,*/ removeHistoryOlderThan]);

  // Update user location with complete position info
  const updateUserLocation = useCallback((position) => {
    if (!position) return;

    // Add the new position to our location history
    updateLocationHistory(position);

    // Set the current user location with all position attributes
    setUserLocation(position);
  }, [updateLocationHistory]);

  // Update the matched location from map matching results
  const updateMatchedLocation = useCallback((matchedData) => {
    if (!matchedData) return;

    setMatchedLocation(matchedData);
  }, []);

  const updateDestinationLocation = useCallback((destinationLocation) => {
    setDestinationLocation(destinationLocation);
  }, []);

  const updateTrip = useCallback((trip) => {
    setTrip(trip);
  }, []);

  const updateTripMenu = useCallback((tripMenu, value) => {
    setTripMenu({...value, ...tripMenu});
  }, []);

  // Check if user has deviated from the planned route
  const hasDeviatedFromRoute = useCallback((matchedPath, routePath) => {
    // Implementation will be added later
    if (!matchedPath || !routePath) return false;

    // Simple placeholder logic - will need to be enhanced
    return false;
  }, []);

  return (
    <MapInfoContext.Provider
      value={{
        userLocation,
        setUserLocation: updateUserLocation,
        locationHistory,
        matchedLocation,
        setMatchedLocation: updateMatchedLocation,
        destinationLocation,
        setDestinationLocation: updateDestinationLocation,
        trip,
        setTrip: updateTrip,
        tripMenu,
        setTripMenu: updateTripMenu,
        hasDeviatedFromRoute,
      }}
    >
      {children}
    </MapInfoContext.Provider>
  );
};

export const useMapInfo = () => {
  const mapInfo = useContext(MapInfoContext);
  return mapInfo;
};
