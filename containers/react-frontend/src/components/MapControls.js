import React, { useMemo } from 'react';
import { GeolocateControl } from 'react-map-gl';
import { GeocoderControlMemo } from '../control/GeocoderControl';

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
      {isInBrowsingMode && <GeocoderControlMemo {...geocoderControlProps} />}
      <GeolocateControl
        ref={geoControlRef}
        position={"bottom-left"}
        onGeolocate={onGeolocate}
        trackUserLocation={true}
        showUserHeading={true}
        enableHighAccuracy={true}
        marker={false}
      />
    </>
  );
};
