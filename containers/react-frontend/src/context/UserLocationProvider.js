import {createContext, useCallback, useContext, useState} from "react";

const MapInfoContext = createContext();

export const MapInfoProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState()
  const [destinationLocation, setDestinationLocation] = useState();
  const [trip, setTrip] = useState();
  const [tripMenu, setTripMenu] = useState({state: 'browsing'});

  const updateUserLocation = useCallback((userLocation) => {
    setUserLocation(userLocation)
  }, []);

  const updateDestinationLocation = useCallback((destinationLocation) => {
    setDestinationLocation(destinationLocation)
  }, []);

  const updateTrip = useCallback((trip) => {
    setTrip(trip)
  }, []);

  const updateTripMenu = useCallback((tripMenu, value) => {
    setTripMenu({...value, ...tripMenu})
  }, []);

  return (
    <MapInfoContext.Provider
      value={{
        userLocation: userLocation,
        setUserLocation: updateUserLocation,
        destinationLocation: destinationLocation,
        setDestinationLocation: updateDestinationLocation,
        trip: trip,
        setTrip: updateTrip,
        tripMenu: tripMenu,
        setTripMenu: updateTripMenu,
      }}
    >
      {children}
    </MapInfoContext.Provider>
  );
};

export const useMapInfo = () => {
  const x = useContext(MapInfoContext);
  return x;
};
