// src/components/map/MapView.js - Core map component
import React, { useRef, useState, useCallback, useEffect } from 'react';
import Map, { GeolocateControl } from 'react-map-gl';
import toast, { Toaster } from 'react-hot-toast';

import { useMapInfo } from '../context/UserLocationProvider';
import { MapControls } from './MapControls';
import { MapLayers } from './MapLayers';
import { useMapHandlers } from '../hooks/useMapHandlers';

export const MapView = () => {
  const mapRef = useRef();
  const geoControlRef = useRef();
  const mapInfo = useMapInfo();

  const [viewState, setViewState] = useState({
    longitude: 26.1025,
    latitude: 44.4268,
    zoom: 1
  });

  const {
    onMapLoad,
    onMapMove,
    onMapClick,
    onMapIdle,
    onMapDragStart,
    onMapDragEnd,
    onGeolocate
  } = useMapHandlers({
    mapRef,
    geoControlRef,
    mapInfo,
    setViewState
  });

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
        onDragEnd={onMapDragEnd}
      >
        <div className="map-toaster" />

        <MapControls
          mapInfo={mapInfo}
          geoControlRef={geoControlRef}
          onGeolocate={onGeolocate}
        />

        <MapLayers mapInfo={mapInfo} />
      </Map>
    </>
  );
};
