// Enhanced MapView with Map Matching
import React, { useRef, useState, useEffect } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import { Toaster } from 'react-hot-toast';

import { useMapInfo } from '../context/UserLocationProvider';
import { MapControls } from './MapControls';
import { MapLayers } from './MapLayers';
import { useMapHandlers } from '../hooks/useMapHandlers';
import { HoldLocationPopup } from './HoldLocationPopup';
import { MapMatchedLayer } from './MapMatchedLayer';


export const MapView = () => {
  const mapRef = useRef();
  const geoControlRef = useRef();
  const mapInfo = useMapInfo();

  const [viewState, setViewState] = useState({
    longitude: 26.1025,
    latitude: 44.4268,
    zoom: 3
  });

  const {
    onMapLoad,
    onMapMove,
    onMapClick,
    onMapMouseDown,
    onMapMouseUp,
    onMapTouchStart,
    onMapTouchEnd,
    onMapIdle,
    onMapDragStart,
    onMapDragEnd,
    onGeolocate,
    holdPopupVisible,
    holdPosition,
    onCloseHoldPopup,
    onDriveToHoldLocation,
    matchedData,
    deviationDetected
  } = useMapHandlers({
    mapRef,
    geoControlRef,
    mapInfo,
    setViewState
  });

  // Create a GeoJSON object for the map-matched path

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
        mapStyle="mapbox://styles/mapbox/standard"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onLoad={onMapLoad}
        onMove={onMapMove}
        onIdle={onMapIdle}
        onClick={onMapClick}
        onMouseDown={onMapMouseDown}
        onMouseUp={onMapMouseUp}
        onTouchStart={onMapTouchStart}
        onTouchEnd={onMapTouchEnd}
        onDragStart={onMapDragStart}
        onDragEnd={onMapDragEnd}
      >
        <div className="map-toaster" />

        <MapControls
          mapInfo={mapInfo}
          geoControlRef={geoControlRef}
          onGeolocate={onGeolocate}
        />

        <MapLayers />
        <MapMatchedLayer matchedData={matchedData} />


        {/* Render the hold popup when visible */}
        {holdPopupVisible && holdPosition && (
          <HoldLocationPopup
            position={holdPosition}
            onClose={onCloseHoldPopup}
            onDrive={onDriveToHoldLocation}
          />
        )}
      </Map>
    </>
  );
};
