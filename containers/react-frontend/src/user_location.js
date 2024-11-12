import * as React from 'react'
import {use, useEffect} from 'react'

const fetchLocation = (updateUserLocation, updateUserLocationLog) => {
  if (navigator.geolocation) {
    navigator.permissions.query({ name: "geolocation" }).then((r) => {
      if (r.state === "granted" || r.state === "prompt") {
        return navigator.geolocation.getCurrentPosition(
          (pos) => {
            return({
              pos: {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
              },
              err: null
            })
          },
          (err) => {
            return({
              pos: null,
              err: err.message
            })
          }
        )
      } else if (r.state === "denied") {
        return({
          pos: null,
          err: 'Please allow location access'
        })
      }
    });
  };
}

export function UserLocation({updateUserLocation}) {

  const location = use(fetchLocation)

  useEffect(() => {
    updateUserLocation(location)
  }, [updateUserLocation])

  return(
    <>
    <ErrorBoundry>
    <Suspense fallback={{pos:null, err:"Checking location permissions"}} >
    </Suspense>
    </>
  );
}
