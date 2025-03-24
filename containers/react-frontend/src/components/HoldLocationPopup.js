// src/components/HoldLocationPopup.js
import React from 'react';
import { Popup, Marker } from 'react-map-gl';
import { useMapInfo } from '../context/UserLocationProvider';
import { useReverseGeocoderQuery } from '../hooks/useReverseGeocoderQuery';

export const HoldLocationPopup = ({ position, onClose, onDrive }) => {
  const mapInfo = useMapInfo();

  // Use the reverse geocoder hook to get street information
  const { reverseGeocoderData, isLoading, isError } = useReverseGeocoderQuery({
    evt: { lngLat: { lng: position.longitude, lat: position.latitude } },
    enabled: true
  });

  // Extract street name or address from geocoder results
  const getLocationName = () => {
    if (isLoading) return 'Loading...';
    if (isError) return 'Location';

    console.log(reverseGeocoderData);
    if (reverseGeocoderData?.features && reverseGeocoderData.features.length > 0) {
      const feature = reverseGeocoderData.features[0];
      // Try to get the street name, or fallback to place name
      return feature.properties?.name
        || feature.properties?.full_address.split(",")[0]
        || feature.properties?.place_formatted
        || 'Unknown road';
    }

    return 'Selected Location';
  };

  const handleDriveClick = () => {
    // Create a destination location object similar to what the geocoder would return
    const destinationObj = {
      result: {
        center: [position.longitude, position.latitude],
        place_name: getLocationName()
      }
    };

    // Call the onDrive handler with the created destination
    onDrive(destinationObj);
  };

  return (
    <>
      <Marker
        longitude={position.longitude}
        latitude={position.latitude}
        anchor="bottom"
        color="#FF0000"
      />
      <Popup
        longitude={position.longitude}
        latitude={position.latitude}
        anchor="bottom"
        closeOnClick={false}
        onClose={onClose}
        className="hold-location-popup"
      >
        <div className="hold-popup-container">
          <div className="hold-popup-title">{getLocationName()}</div>
          <button
            className="hold-popup-drive-btn"
            onClick={handleDriveClick}
          >
            Drive
          </button>
        </div>
      </Popup>
    </>
  );
};
