import * as React from 'react';
import { useCallback, useRef, useEffect, useState } from 'react';
import Map, {useMap} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

import {getUserCoordinates} from './location.js'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXVsaWFubWFwcGVycyIsImEiOiJjbTJheWNnamUwa2NkMmpzZnUxaGxmczUxIn0.B5l5tnryyuACvaCdQ_tGdQ'; // Set your mapbox token here

export function UserLocation() {
  const [userCoords, setUserCoords] = useState()
  useEffect(() => {
    setUserCoords(getUserCoordinates())
    console.log(userCoords)
  }, [userCoords]);

  if (!userCoords) {
    return(
      <div>
      Loading...
      </div>
    );
  } else {
    return(
      <MapView userCoords={userCoords}/>
    );
  }
};

export function MapView({userCoords}) {

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
      id="mymap"
      initialViewState={{
        // Bucharest center
        longitude: userCoords.longitude,
        latitude: userCoords.latitude,
        zoom: 14
      }}
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
    />
  );
}
