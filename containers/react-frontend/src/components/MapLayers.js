// src/components/map/MapLayers.js - Layers rendered on the map
import React from 'react';
import { RouteLineLayer } from './RouteLineLayer';
import { RouteNearbyReportLayer } from './RouteNearbyReportLayer';

export const MapLayers = ({ mapInfo }) => {
  const hasRoutingData = mapInfo.userLocation && mapInfo.destinationLocation;
  if (mapInfo.userLocation && ! mapInfo.destinationLocation) {
    return (
      <RouteNearbyReportLayer/>
    )
  }

  if (hasRoutingData) {
    return (
      <RouteLineLayer
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
    );
  }
};
