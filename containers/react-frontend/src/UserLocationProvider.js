import React, {createContext, useState, useCallback, useEffect, useContext} from 'react'


const UserLocationContext = createContext()

export const UserLocationProvider = ({children}) => {
  const [userLocationLog, setUserLocationLog] = useState('Checking location permissions.')
  const [userLocation, setUserLocation] = useState({})

  const fetchLocation = useCallback(() => {

    if (! navigator.geolocation) {
      setUserLocationLog('Your browser does not support location services.')
      console.warn('No GeoLocation support!')
    }

    navigator.permissions.query({ name: "geolocation" }).then((r) => {

      if (! r.state === "granted" && ! r.state === "prompt") {
        console.log('Please allow location access')
        setUserLocationLog('Please allow location access')
      }

      if (r.state === "denied") {
        setUserLocationLog('Acces to location is off. Make sure location access is enabled.')
      }

      return navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          })
        },

        (err) => {
          setUserLocationLog(err.message)
        }
      )
    });
  }, []);

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

 return (
   <UserLocationContext.Provider value={{
     userLocation: userLocation,
     userLocationLog: userLocationLog,
   }}>
     {children}
   </UserLocationContext.Provider>
 );
}

export const useUserLocationContext = () => useContext(UserLocationContext)
