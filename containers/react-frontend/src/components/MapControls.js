import React, { useMemo } from 'react';
import GeolocateControl from '../control/GeolocationControlWrapper';

export const MapControls = ({ mapInfo, geoControlRef, onGeolocate }) => {
  const isInBrowsingMode = mapInfo.tripMenu.state === 'browsing' ||
                           mapInfo.tripMenu.state === 'previewing-route';

  const geocoderControlProps = useMemo(() => {
    return {
      mapboxAccessToken: process.env.REACT_APP_MAPBOX_TOKEN,
      position: 'top',
      flyTo: true,
      onResult: (evt) => {
        mapInfo.setDestinationLocation(evt);
        console.log(`Geocoder result`, evt);
      },
      placeholder: "Where to?",
      language: 'en-EN',
    };
  }, [mapInfo]);

  return (
    <>
      <GeolocateControl
        ref={geoControlRef}
        position={"left"}
        onGeolocate={onGeolocate}
        trackUserLocation={true}
        showUserHeading={true}
        enableHighAccuracy={true}
        marker={false}
        fitBoundsOptions={{
          essential: true,
          maxDuration: 1000,
          linear: true,
          maxZoom: 17,
          minZoom: 17,
        }}
      />
    </>
  );
};
