import * as React from 'react';
import { useEffect, useState, useRef, useMemo } from 'react';
import Map, {Source, Layer} from 'react-map-gl';

import {FlexboxComponent} from './map_controls_flexbox'
import {MapLine} from './map_line'
import {Locator} from './user_locator'

// import {getUserCoordinates, getUserLocation} from './location.js'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXVsaWFubWFwcGVycyIsImEiOiJjbTJheWNnamUwa2NkMmpzZnUxaGxmczUxIn0.B5l5tnryyuACvaCdQ_tGdQ'; // Set your mapbox token here

export function AppContext() {
  const [userLocationLog, setUserLocationLog] = useState('Checking location permissions.')
  const [userLocation, setUserLocation] = useState({})
  const [clickedPoints, setClickedPoints] = useState([]);
  const [routeGeoJSON, setRouteGeoJSON] = useState();
  const [controlBox, setControlBox] = useState();


  // setControlBox({...controlBox, test: 'test-value'})

  const updateUserLocation = (value) => {
    setUserLocation(value)
  }

  const updateUserLocationLog = (value) => {
    setUserLocationLog(value)
  }

  const updateClickedPoints = (value) => {
    setClickedPoints(value)
  }

  const updateRouteGeoJSON = (value) => {
    setRouteGeoJSON(value)
  }

  const updateControlBox = (value) => {
    setControlBox(value)
  }

  //if (!userLocation.longitude) {
  //  return(
  //    <div>
  //    {userLocationLog}
  //    </div>
  //  )
  //} else {
    return(
      <div>
        {`Latitude: ${userLocation.latitude}; Longitude: ${userLocation.longitude}`}
        <Locator
          updateUserLocation={updateUserLocation}
          updateUserLocationLog={updateUserLocationLog}
        />
        <FlexboxComponent
          clickedPoints={clickedPoints}
          controlBox={controlBox}
          updateClickedPoints={updateClickedPoints}
          updateRouteGeoJSON={updateRouteGeoJSON}
          updteControlBox={updateControlBox}
        />
        { userLocation.longitude
          ? <MapView
              userCoords={userLocation}
              controlBox={controlBox}
              clickedPoints={clickedPoints}
              setClickedPoints={updateClickedPoints}
              routeGeoJSON={routeGeoJSON}
              updateRouteGeoJSON={updateRouteGeoJSON}
            />
          : null
        }
      </div>
    )
  //}
};

export function MapView({userCoords, clickedPoints, setClickedPoints, routeGeoJSON, updateRouteGeoJSON}) {
  const mapRef = useRef()
  const pointLayerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 8,
      'circle-color': '#007cbf'
    }
  };

  const [reportGeoJSON, setReportGeoJSON] = useState([]);

  const [viewState, setViewState] = useState({
    longitude: userCoords.longitude,
    latitude: userCoords.latitude,
    zoom: 13
  });


  const onMapClick = (evt) => {
    // console.log(evt)
    setClickedPoints([...clickedPoints, {
      longitude: evt.lngLat.lng,
      latitude: evt.lngLat.lat
    }]);
    console.log(evt)
  };

  const onMapMove = (evt) => {
    setViewState(evt.viewState);

  };

  const onMapDblClick = (evt) => {
    if (mapRef.current) {
      //const bbox = mapRef.current.getBounds()
    }
    console.log(evt)
  }


  const fetchReports = useMemo(() => async() => {

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

      // ref={mapRef}
  return (
      <Map
      {...viewState}
      reuseMaps
      ref={mapRef}
      id="report-map"
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={MAPBOX_TOKEN}
      onDblClick={onMapDblClick}
      onClick={onMapClick}
      onMove={onMapMove}>

      { reportGeoJSON
        ?
        <Source key="report-source" id="report-source" type="geojson" data={reportGeoJSON}>
          <Layer {...pointLayerStyle} id="report-layer"/>
        </Source>
        : null
      }
      <MapLine
        pointList={clickedPoints}
        excludePoints={reportGeoJSON}
        routeGeoJSON={routeGeoJSON}
        updateRouteGeoJSON={updateRouteGeoJSON}/>
      </Map>
  );
}
