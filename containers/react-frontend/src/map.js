import * as React from 'react';
import { useCallback, useRef, useEffect, useState } from 'react';
import Map, {useMap} from 'react-map-gl';


// import {getUserCoordinates, getUserLocation} from './location.js'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXVsaWFubWFwcGVycyIsImEiOiJjbTJheWNnamUwa2NkMmpzZnUxaGxmczUxIn0.B5l5tnryyuACvaCdQ_tGdQ'; // Set your mapbox token here

export function UserLocation() {
  const [userLocationLog, setUserLocationLog] = useState('Checking location permissions.')
  const [userLocation, setUserLocation] = useState({})

  const fetchLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.permissions.query({ name: "geolocation" }).then((r) => {
              if (r.state === "granted" || r.state === "prompt") {
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
              } else if (r.state === "denied") {
                setUserLocationLog('Please allow location access')
              }
      });
    }
  }, []);

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  if (!userLocation.longitude) {
    return(
      <div>
      {userLocationLog}
      </div>
    )
  } else {
    return(
      <div>
      {`Latitude: ${userLocation.latitude}; Longitude: ${userLocation.longitude}`}
      <MapView userCoords={userLocation} />
      </div>
    )
  }
};

export function MapView({userCoords}) {

  const [viewState, setViewState] = useState({
    longitude: userCoords.longitude,
    latitude: userCoords.latitude,
    zoom: 12
  });

  let userLocation = useRef(
    {
      latitude: null,
      longitude: null,
      accuracy: null
    }
  )

  // useEffect(() => {
  //   userLocation.current = getUserLocation()
  // }, [userLocation]);

  const onMapMove = (evt) => {
    console.log(evt.viewState);
    setViewState(evt.viewState);
  };
  // const onMapLoad = (evt) => {
  //   let userLocation = getUserLocation()
  //   setViewState({
  //     longitude: userLocation.longitude,
  //     latitude: userLocation.latitude,
  //     accuracy: userLocation.accuracy
  //   });
  // };

  // const onLoad = useCallback((evt) => {
  //   if (userCoords) {
  //     mymap.easeTo({
  //       center: [userCoords.longitude, userCoords.latitude],
  //       duration: 1000
  //     });
  //   }
  // }, [mymap, userCoords]);

  return (
      <Map
      {...viewState}
      reuseMaps
      id="report-map"
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
      onMove={onMapMove}
      //onLoad={onMapLoad}
    />
  );
}
