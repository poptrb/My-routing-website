import {createContext, useContext, useState} from "react";

const MapInfoContext = createContext();

export const MapInfoProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState()
  const [destinationLocation, setDestinationLocation] = useState();

  const updateUserLocation = (userLocation) => {
    setUserLocation(userLocation)
  };

  const updateDestinationLocation = (destinationLocation) => {
    setDestinationLocation(destinationLocation)
  };

  return (
    <MapInfoContext.Provider
      value={{
        userLocation: userLocation,
        setUserLocation: updateUserLocation,
        destinationLocation: destinationLocation,
        setDestinationLocation: updateDestinationLocation,
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
