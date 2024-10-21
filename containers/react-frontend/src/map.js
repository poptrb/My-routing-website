import * as React from 'react';
import { useCallback, useRef, useEffect, useState } from 'react';
import Map, {useMap, Source, Layer} from 'react-map-gl';


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
    };
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

  const layerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#007cbf'
    }
  };

  const [viewState, setViewState] = useState({
    longitude: userCoords.longitude,
    latitude: userCoords.latitude,
    zoom: 13
  });

  const [reportGeoJSON, setReportGeoJSON] = useState([])

  const onMapMove = (evt) => {
    setViewState(evt.viewState);
  };

  const fetchReports = useCallback(async() => {

    const response = await fetch("http://localhost:8001")
    const data = await response.json()

    const features = data.map((item) => {
      return ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [item.location.lat, item.location.long]
        }
      })
    });

    setReportGeoJSON({
      type: 'FeatureCollection',
      features: features
    })
  }, []);

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return (
      <Map
      {...viewState}
      reuseMaps
      id="report-map"
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      onMove={onMapMove}>
      <Source id="my-data" type="geojson" data={reportGeoJSON}>
        <Layer {...layerStyle} />
      </Source>
      </Map>
  );
}
