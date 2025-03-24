// src/hooks/useMapHandlers.js - Updated with hold functionality
import { useCallback, useState, useRef } from 'react';

export const useMapHandlers = ({ mapRef, geoControlRef, mapInfo, setViewState }) => {
  // State to track the hold popup visibility and position
  const [holdPopupVisible, setHoldPopupVisible] = useState(false);
  const [holdPosition, setHoldPosition] = useState(null);

  // Refs to track press timer and mouse state
  const pressTimerRef = useRef(null);
  const isPressingRef = useRef(false);
  const isPressHoldRef = useRef(false);

  const onMapLoad = useCallback(async (evt) => {
    await new Promise(r => setTimeout(r, 1200));
    if (geoControlRef.current) {
      geoControlRef.current.trigger();
    }
  }, [geoControlRef]);

  const onMapMove = useCallback((evt) => {
    setViewState(evt.viewState);
  }, [setViewState]);

  // Start timer for press and hold
  const startPressTimer = useCallback((evt) => {
    // Only allow in "browsing" state
    if (mapInfo.tripMenu.state !== 'browsing') return;

    isPressingRef.current = true;
    isPressHoldRef.current = false;

    // Clear any existing timer
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);

    // Set the timer for 500ms (0.5 seconds)
    pressTimerRef.current = setTimeout(() => {
      if (isPressingRef.current) {
        isPressHoldRef.current = true;

        // Show popup at click position
        setHoldPosition({
          longitude: evt.lngLat.lng,
          latitude: evt.lngLat.lat
        });
        setHoldPopupVisible(true);
      }
    }, 500);
  }, [mapInfo.tripMenu.state]);

  // Handle map click with press and hold logic
  const onMapClick = useCallback((evt) => {
    // Clear any existing timer
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    // If it wasn't a hold (meaning it was a regular click), don't do anything special
    if (!isPressHoldRef.current) {
      console.log('Regular click detected:', evt);
      // Do regular click handling here if needed
    }

    // Reset press tracking
    isPressingRef.current = false;
    isPressHoldRef.current = false;
  }, []);

  const onMapMouseDown = useCallback((evt) => {
    startPressTimer(evt);
  }, [startPressTimer]);

  const onMapMouseUp = useCallback(() => {
    // Clear press timer and reset flag
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    isPressingRef.current = false;
  }, []);

  const onMapTouchStart = useCallback((evt) => {
    // Extract touch event properties to make it compatible with our hold logic
    if (evt.originalEvent.touches && evt.originalEvent.touches.length > 0) {
      startPressTimer(evt);
    }
  }, [startPressTimer]);

  const onMapTouchEnd = useCallback(() => {
    // Clear press timer and reset flag
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    isPressingRef.current = false;
  }, []);

  // Handle close of hold popup
  const onCloseHoldPopup = useCallback(() => {
    setHoldPopupVisible(false);
    setHoldPosition(null);
  }, []);

  // Handle drive button click in popup
  const onDriveToHoldLocation = useCallback((destination) => {
    // Set the destination in mapInfo context
    mapInfo.setDestinationLocation(destination);

    // Close the popup
    setHoldPopupVisible(false);
    setHoldPosition(null);
  }, [mapInfo]);

  const onMapDragStart = useCallback((evt) => {
    // Cancel any hold operation if dragging starts
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    isPressingRef.current = false;

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
  }, [mapInfo]);

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
    onDriveToHoldLocation
  };
};
