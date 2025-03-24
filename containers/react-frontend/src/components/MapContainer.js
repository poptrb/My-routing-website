// src/components/map/MapContainer.js - Main wrapper component
import React from 'react';
import { MapProvider } from 'react-map-gl';
import { MapInfoProvider } from '../context/UserLocationProvider';
import { MapView } from './MapView';
import { MenuSheet } from './MenuSheet';

export const MapContainer = () => {
  return (
    <MapProvider>
      <MapInfoProvider>
        <MapView />
        <MenuSheet />
      </MapInfoProvider>
    </MapProvider>
  );
};
