import {useEffect, useCallback} from 'react'

export const Locator = ({updateUserLocation, updateUserLocationLog, userLocation}) => {
  const fetchLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((r) => {
        if (r.state === "granted" || r.state === "prompt") {
          return navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.log(`called geolocation: ${pos}`)
              updateUserLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
              })
            },

            (err) => {
              updateUserLocationLog(err.message)
            }
          )
        } else if (r.state === "denied") {
          updateUserLocationLog('Please allow location access')
        }
      });
    };
  }, [updateUserLocationLog, updateUserLocation]);

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])
}
