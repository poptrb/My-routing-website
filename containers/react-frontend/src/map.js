import * as React from 'react';
import { useCallback, useRef, useEffect, useState } from 'react';
import Map, {useMap, Source, Layer} from 'react-map-gl';

import {MapLine} from './map_line'
import {getRouteGeoJSON, decodeRouteGeoJSON} from './map_line'

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

  const pointLayerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#007cbf'
    }
  };

  const lineLayerStyle = {
    id: "route",
    type: "line",
    paint: {
      'line-color': '#007cbf',
      'line-width': 8
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  }

  const [viewState, setViewState] = useState({
    longitude: userCoords.longitude,
    latitude: userCoords.latitude,
    zoom: 13
  });

  const [reportGeoJSON, setReportGeoJSON] = useState([]);
  const [clickedPoints, setClickedPoints] = useState([]);
  const [routeGeoJSON, setRouteGeoJSON] = useState();

  const onMapClick = (evt) => {
    setClickedPoints([...clickedPoints, {
      longitude: evt.lngLat.lng,
      latitude: evt.lngLat.lat
    }]);
  };

  const onMapSourceData = (evt) => {
    console.log(evt)
  };
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


  const showRoute = useCallback(async() => {
    const data = await getRouteGeoJSON(clickedPoints);
    const geoJSON = decodeRouteGeoJSON(data);
    if (geoJSON) {
      setRouteGeoJSON(geoJSON);
    };
  }, [clickedPoints]);

  useEffect(() => {
    showRoute();
  }, [showRoute])

      //<MapLine pointList={clickedPoints}/>
  routeGeoJSON && console.log(routeGeoJSON);
  return (
      <Map
      {...viewState}
      reuseMaps
      id="report-map"
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={onMapClick}
      onSourceData={onMapSourceData}
      onMove={onMapMove}>

      { reportGeoJSON
        ?
        <Source key="report-source" id="report-source" type="geojson" data={reportGeoJSON}>
          <Layer {...pointLayerStyle} id="report-layer"/>
        </Source>
        : null
      }
      { routeGeoJSON
        ?
        <Source key="route-source" id="route-source" type="geojson" data={routeGeoJSON}>
          <Layer {...lineLayerStyle} id="route-layer" source="route-source"/>
        </Source>
        : null
      }
      </Map>
  );
}
