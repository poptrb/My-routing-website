import React, { useRef, useState, useCallback, useMemo} from 'react';
import Map, {GeolocateControl, Source, Layer, MapProvider} from 'react-map-gl';

import {bbox, lineString} from '@turf/turf'

import {ExternalProvider, useExternalContext} from './context/ReportsProvider'
import {MenuSheet} from './components/MenuSheet'
//import {FlexboxComponent} from './map_controls_flexbox'
import {RouteLineLayer} from './map_line'
import {GeocoderControlMemo} from './GeocoderControl'
import {useMapInfo, MapInfoProvider} from './context/UserLocationProvider'


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
    geoControlRef.current.trigger()
  }, [])


  const onMapMove = useCallback((evt) => {
    setViewState(evt.viewState);
  }, []);

  const onGeolocate = (evt) => {
    console.log(`Geolocation result`, evt)
    mapInfo.setUserLocation(evt);
  };

  const onGeocoderResult = useCallback((evt) => {
    console.log(`Geocoder result`,  evt)
    mapInfo.setDestinationLocation(evt)

    if (mapInfo.userLocation) {

      console.log(mapInfo.userLocation)
      const line = lineString([
        [mapInfo.userLocation.coords.longitude, mapInfo.userLocation.coords.latitude],
        [mapInfo.destinationLocation.result.center[0], mapInfo.destinationLocation.result.center[1]],
      ])

      console.log(line)
      mapRef.current.fitBounds(bbox(line), {
        bearing: 0,
        linear: false,
        padding: 150,
        pitch: 0
      });
    }
  }, [mapInfo])

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
    [mapInfo.userLocation, mapInfo.destinationLocation]
  , [mapInfo])


  return (
      <Map
      {...viewState}
      ref={mapRef}
      reuseMaps={true}
      id="onlyMap"
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/navigation-night-v1"
      mapboxAccessToken={MAPBOX_TOKEN}
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
      <GeocoderControlMemo {...geocoderControlProps}
      />
      <GeolocateControl
        ref={geoControlRef}
        onGeolocate={onGeolocate}
        trackUserLocation={true}
        showUserHeading={true}
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
};
