import React, { useRef, useState, useCallback, useMemo, useEffect} from 'react';
import Map, {GeolocateControl, MapProvider} from 'react-map-gl';
import toast, {Toaster} from 'react-hot-toast';

import {MenuSheet} from './components/MenuSheet'
import {RouteLineLayer} from './components/RouteLineLayer'
import {useMapInfo, MapInfoProvider} from './context/UserLocationProvider'
import {GeocoderControlMemo} from './control/GeocoderControl'
import {useReverseGeocoderQuery} from './hooks/useReverseGeocoderQuery'


export function CustomMap() {
  return(
    <>
      <MapProvider >
        <MapInfoProvider>
          <MapView />
          <MenuSheet />
        </MapInfoProvider>
      </MapProvider>
    </>
  );
};

export const MapView = () => {

  const geoControlRef = useRef();
  const mapRef = useRef();
  const mapInfo = useMapInfo();
  const [userMarker, setUserMarker] = useState();

  //const [userLocation, setUserLocation] = useState();

   const [viewState, setViewState] = useState({
     longitude: 26.1025,
     latitude: 44.4268,
     zoom: 1
  });


  const reverseGeocoderQuery = useReverseGeocoderQuery({
    // enabled: userMarker ? true : false,
    enabled: false,
    evt: userMarker ? userMarker : null
  });

  const onMapLoad = useCallback( async (evt) => {
    await new Promise(r => setTimeout(r, 1200));
    if (geoControlRef.current) {
      geoControlRef.current.trigger()
    }
  }, [])

  useEffect(() => {
    if (reverseGeocoderQuery && reverseGeocoderQuery.data?.features && reverseGeocoderQuery.data.features.length > 0) {
      console.log(reverseGeocoderQuery.data.features[0].properties.full_address)
    }
  }, [reverseGeocoderQuery]);

  const onMapClick = useCallback((evt) => {
    console.log(evt);
    setUserMarker(evt)
  }, []);

  const onMapMove = useCallback((evt) => {
    setViewState(evt.viewState);
  }, []);

  const onMapDragStart = useCallback((evt) => {
    if (mapInfo.tripMenu.state === 'driving') {
      mapInfo.setTripMenu({state: 'driving-browsing'})
    }
  },[mapInfo]);

  const onMapDragEnd = useCallback((evt) => {
  },[]);

  const onGeolocate = useCallback( async (evt) => {
    console.log(`Geolocation result`, evt)
    mapInfo.setUserLocation(evt);
    mapInfo.tripMenu.state === 'driving-browsing' && mapInfo.setTripMenu({state: 'driving'});
    if (evt.target?._heading && mapInfo.tripMenu.state === 'driving') {
      await new Promise(r => setTimeout(r, 300));
      mapRef.current?.rotateTo(evt.target._heading)
    };
  }, [mapInfo]);

  const onMapIdle = useCallback((evt) => {
    if (mapInfo.tripMenu.event === 'trigger-geolocate') {
      console.log('onMapIdle with trigger-geolocate')
      mapInfo.setTripMenu({event: null, state: 'driving'})
      geoControlRef.current?.trigger()
    };
  }, [mapInfo]);

  const onGeocoderResult = useCallback((evt) => {
    mapInfo.setDestinationLocation(evt)
    console.log(`Geocoder result`, evt)
  }, [mapInfo])

  const geocoderControlProps = useMemo(() => {
    return {
      mapboxAccessToken: process.env.REACT_APP_MAPBOX_TOKEN,
      position: 'top',
      flyTo: true,
      onResult: onGeocoderResult,
      //addTo: "#geocoder-container",
      placeholder: "Where to?",
      language: 'en-EN',
    }
  }, [onGeocoderResult])

  // const pointList = useMemo(() =>
  //   [mapInfo.userLocation, mapInfo.destinationLocation]
  // , [mapInfo])


  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={true}
        containerClassName="map-toaster"
      />
      <Map
      {...viewState}
      ref={mapRef}
      reuseMaps={true}
      id="onlyMap"
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/navigation-night-v1"
      mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      onLoad={onMapLoad}
      onMove={onMapMove}
      onIdle={onMapIdle}
      onClick={onMapClick}
      onDragStart={onMapDragStart}
    >
      <div
        className="map-toaster"
      />

    {
      (mapInfo.tripMenu.state === 'browsing' ||
        mapInfo.tripMenu.state === 'previewing-route')
      ? <
          GeocoderControlMemo {...geocoderControlProps}
        />
      : null
    }
      <GeolocateControl
        ref={geoControlRef}
        position={"bottom-left"}
        onGeolocate={onGeolocate}
        trackUserLocation={true}
        showUserHeading={true}
        enableHighAccuracy={true}
        marker={false}
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
          />
        : null
      }
      </Map>
    </>
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
