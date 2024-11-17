import React, { useRef, useState, useCallback, useMemo} from 'react';
import Map, {GeolocateControl, Source, Layer, MapProvider} from 'react-map-gl';

import {ExternalProvider, useExternalContext} from './context/ReportsProvider'
import {MenuSheet} from './components/MenuSheet'
import {RouteLineLayer} from './components/RouteLineLayer'
import {useMapInfo, MapInfoProvider} from './context/UserLocationProvider'
import {GeocoderControlMemo} from './control/GeocoderControl'


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
        <MapProvider >
          <MapInfoProvider>
            <MapView />
            <MenuSheet />
          </MapInfoProvider>
        </MapProvider>
      </ExternalProvider>
    </>
  );
};

export const MapView = () => {

  const geoControlRef = useRef();
  const mapRef = useRef();
  const externalContext = useExternalContext();
  const mapInfo = useMapInfo();

  //const [userLocation, setUserLocation] = useState();

   const [viewState, setViewState] = useState({
     longitude: 26.1025,
     latitude: 44.4268,
     zoom: 3
  });


  const onMapLoad = useCallback((evt) => {
    geoControlRef.current && geoControlRef.current.trigger()
  }, [])


  const onMapMove = useCallback((evt) => {
    setViewState(evt.viewState);
  }, []);

  const onGeolocate = useCallback((evt) => {
    console.log(`Geolocation result`, evt)
    mapInfo.setUserLocation(evt);
  }, [mapInfo]);

  const onMapIdle = useCallback((evt) => {
  }, []);

  const onGeocoderResult = useCallback((evt) => {
    mapInfo.setDestinationLocation(evt)
    console.log(`Geocoder result`, evt)
  }, [mapInfo])

  const geocoderControlProps = useMemo(() => {
    return {
      mapboxAccessToken: MAPBOX_TOKEN,
      position: 'top',
      flyTo: true,
      onResult: onGeocoderResult,
      addTo: "#geocoder-container",
      setPlaceholder: "Start typing to see destinations",
      language: 'en-EN',
    }
  }, [onGeocoderResult])

  // const pointList = useMemo(() =>
  //   [mapInfo.userLocation, mapInfo.destinationLocation]
  // , [mapInfo])


  return (
      <Map
      {...viewState}
      ref={mapRef}
      reuseMaps={true}
      id="onlyMap"
      style={{height: "88.5vh"}}
      mapStyle="mapbox://styles/mapbox/navigation-night-v1"
      mapboxAccessToken={MAPBOX_TOKEN}
      onLoad={onMapLoad}
      onMove={onMapMove}
      onIdle={onMapIdle}
    >

      <GeocoderControlMemo {...geocoderControlProps}
      />
      <GeolocateControl
        ref={geoControlRef}
        position={"bottom-left"}
        onGeolocate={onGeolocate}
        trackUserLocation={true}
        showUserHeading={true}
        enableHighAccuracy={true}
      />
      {
        mapInfo.userLocation && mapInfo.destinationLocation
        ? <RouteLineLayer
            locations={[
              {
                longitude: mapInfo.userLocation.coords.longitude,
                latitude: mapInfo.userLocation.coords.latitude,
              },
              {
                longitude: mapInfo.destinationLocation.result.center[0],
                latitude: mapInfo.destinationLocation.result.center[1],
              }
            ]}
            excludeLocations={externalContext}
          />
        : null
      }
      </Map>
  );
      // { externalContext
      //   ?
      //   <Source
      //     key="report-source"
      //     id="report-source"
      //     type="geojson"
      //     data={externalContext}>
      //     <Layer {...pointLayerStyle} id="report-layer"/>
      //   </Source>
      //   : null
      // }
};
