import React, { useRef, useState, useCallback, useMemo, forwardRef } from 'react';
import Map, {GeolocateControl, Source, Layer} from 'react-map-gl';

import {ExternalProvider, useExternalContext} from './context/ReportsProvider'
import {MenuSheet} from './components/MenuSheet'
//import {FlexboxComponent} from './map_controls_flexbox'
import {RouteLineLayer} from './map_line'
import {GeocoderControlMemo} from './GeocoderControl'

import {bbox, lineString} from '@turf/turf'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXVsaWFubWFwcGVycyIsImEiOiJjbTJheWNnamUwa2NkMmpzZnUxaGxmczUxIn0.B5l5tnryyuACvaCdQ_tGdQ'; // Set your mapbox token here

const pointLayerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 10,
    'circle-color': '#007cbf'
  }
};

export function CustomMap() {
  return(
    <>
      <ExternalProvider>
        <MenuSheet />
        <MapView />
      </ExternalProvider>
    </>
  );
};

export const MapView = forwardRef((props, geocoderElementRef) => {

  const [clickedPoints, setClickedPoints] = useState([]);
  const [routeStops, setRouteStops] = useState([])
  const geoControlRef = useRef();

  const updateClickedPoints = (value) => {
    setClickedPoints(value)
  }

  const updateRouteStops = (value) => {
    setRouteStops(value)
  }

  const mapRef = useRef();
  const externalContext = useExternalContext();

  const [userLocation, setUserLocation] = useState();
  const [destinationLocation, setDestinationLocation] = useState();

   const [viewState, setViewState] = useState({
     longitude: 26.1025,
     latitude: 44.4268,
     zoom: 3
  });


  const onMapLoad = useCallback((evt) => {
    geoControlRef.current.trigger()
  }, [])

  const onMapClick = useCallback((evt) => {
    setClickedPoints([...clickedPoints, {
      longitude: evt.lngLat.lng,
      latitude: evt.lngLat.lat
    }]);
  }, [clickedPoints, setClickedPoints]);

  const onMapMove = useCallback((evt) => {
    setViewState(evt.viewState);
  }, []);



  const onGeolocate = useCallback((evt) => {
    console.log(`Geolocation result`, evt)
    setUserLocation({
      longitude: evt.coords.longitude,
      latitude: evt.coords.latitude
    })
  }, []);

  const onGeocoderResult = (evt) => {
    console.log(`Geocoder result`,  evt)
    setDestinationLocation({
      longitude: evt.result.center[0],
      latitude: evt.result.center[1]
    });

    if (userLocation) {

      console.log(userLocation)
      const line = lineString([
        [userLocation.coords.longitude, userLocation.coords.latitude],
        [destinationLocation.coords.longitude, destinationLocation.coords.latitude],
      ])

      console.log(line)
      mapRef.current.fitBounds(bbox(line), {
        bearing: 0,
        linear: false,
        padding: 150,
        pitch: 0
      });
    }
  }

  // using react query, create a
  const geocoderControlProps = useMemo(() => {
    return {
      mapboxAccessToken: MAPBOX_TOKEN,
      //position: 'top-left',
      flyTo: false,
      onResult: onGeocoderResult,
      addTo: "#geocoder-container"
    }
  }, [onGeocoderResult])
  const pointList = useMemo(() =>
    [userLocation, destinationLocation]
  , [userLocation, destinationLocation])


  return (
      <Map
      {...viewState}
      ref={mapRef}
      reuseMaps={true}
      id="report-map"
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/navigation-night-v1"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={onMapClick}
      onLoad={onMapLoad}
      onMove={onMapMove}>

      { externalContext
        ?
        <Source
          key="report-source"
          id="report-source"
          type="geojson"
          data={externalContext}>
          <Layer {...pointLayerStyle} id="report-layer"/>
        </Source>
        : null
      }
      <GeocoderControlMemo
        mapboxAccessToken={MAPBOX_TOKEN}
        position="top-left"
        flyTo={false}
        onResult={onGeocoderResult}
        addTo={"#geocoder-container"}
      />
      <GeolocateControl
        ref={geoControlRef}
        onGeolocate={onGeolocate}
        trackUserLocation={true}
        showUserHeading={true}
      />
      {
        destinationLocation && userLocation
        ? <RouteLineLayer
            locations={pointList}
            excludeLocations={externalContext}
          />
        : null
      }
      </Map>
  );
});
