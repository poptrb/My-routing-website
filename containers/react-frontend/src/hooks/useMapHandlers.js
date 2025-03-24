// src/hooks/useMapHandlers.js - Custom hook for map event handlers
import { useCallback } from 'react';
import { useReverseGeocoderQuery } from './useReverseGeocoderQuery';

export const useMapHandlers = ({ mapRef, geoControlRef, mapInfo, setViewState }) => {
  const onMapLoad = useCallback(async (evt) => {
    await new Promise(r => setTimeout(r, 1200));
    if (geoControlRef.current) {
      geoControlRef.current.trigger();
    }
  }, [geoControlRef]);

  const onMapMove = useCallback((evt) => {
    setViewState(evt.viewState);
  }, [setViewState]);

  const onMapClick = useCallback((evt) => {
    console.log(evt);
    // Additional click handling logic can go here
  }, []);

  const onMapDragStart = useCallback((evt) => {
    if (mapInfo.tripMenu.state === 'driving') {
      mapInfo.setTripMenu({state: 'driving-browsing'});
    }
  }, [mapInfo]);

  const onMapDragEnd = useCallback((evt) => {
    // Handle drag end if needed
  }, []);

  const onGeolocate = useCallback(async (evt) => {
    console.log(`Geolocation result`, evt);
    mapInfo.setUserLocation(evt);

    if (mapInfo.tripMenu.state === 'driving-browsing') {
      mapInfo.setTripMenu({state: 'driving'});
    }

    if (evt.target?._heading && mapInfo.tripMenu.state === 'driving') {
      await new Promise(r => setTimeout(r, 300));
      mapRef.current?.rotateTo(evt.target._heading);
    }
  }, [mapInfo, mapRef]);

  const onMapIdle = useCallback((evt) => {
    if (mapInfo.tripMenu.event === 'trigger-geolocate') {
      console.log('onMapIdle with trigger-geolocate');
      mapInfo.setTripMenu({event: null, state: 'driving'});
      geoControlRef.current?.trigger();
    }
  }, [mapInfo, geoControlRef]);

  return {
    onMapLoad,
    onMapMove,
    onMapClick,
    onMapIdle,
    onMapDragStart,
    onMapDragEnd,
    onGeolocate
  };
};
