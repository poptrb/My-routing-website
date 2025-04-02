import { useCallback, useState, useRef, useEffect } from 'react';
import { useMapInfo } from '../context/UserLocationProvider';
import { useMapMatching } from '../hooks/useMapMatching';
import toast from 'react-hot-toast';

export const useMapHandlers = ({ mapRef, geoControlRef, setViewState }) => {
  // Get the existing map handlers
  const [holdPopupVisible, setHoldPopupVisible] = useState(false);
  const [holdPosition, setHoldPosition] = useState(null);
  const mapInfo = useMapInfo();

  // Add map matching functionality
  const {
    matchedData,
    isMapMatchingPending,
    deviationDetected
  } = useMapMatching();

  const pressTimerRef = useRef(null);
  const isPressingRef = useRef(false);
  const isPressHoldRef = useRef(false);
  const lastGeolocateTimestampRef = useRef(null);

  // Notify user when route deviation is detected
  useEffect(() => {
    if (deviationDetected) {
      toast('Recalculating route...', {
        duration: 5000,
        position: 'top-center',
      });
    }
  }, [deviationDetected]);

  // Track the matched data for debugging
  useEffect(() => {
    if (matchedData && mapInfo.tripMenu?.state === 'driving') {
      console.log('Map matched data:', matchedData);
    }
  }, [matchedData, mapInfo.tripMenu?.state]);

  const onMapLoad = useCallback(async (evt) => {
    await new Promise(r => setTimeout(r, 1200));
    if (geoControlRef.current) {
      geoControlRef.current.trigger();
    }
  }, [geoControlRef]);

  const onMapMove = useCallback((evt) => {
    setViewState(evt.viewState);
  }, [setViewState]);

  // Enhanced onGeolocate handler that captures all position data
  const onGeolocate = useCallback(async (evt) => {
    console.log(`Geolocation result`, evt);

    // Only process if we have a valid position
    if (evt && evt.coords) {
      // Create an enhanced position object with all available data
      const enhancedPosition = {
        coords: {
          latitude: evt.coords.latitude,
          longitude: evt.coords.longitude,
          accuracy: evt.coords.accuracy || 0,
          altitude: evt.coords.altitude,
          altitudeAccuracy: evt.coords.altitudeAccuracy,
          heading: evt.coords.heading,
          speed: evt.coords.speed
        },
        timestamp: evt.timestamp || Date.now()
      };

      // Store the timestamp of this geolocation event
      lastGeolocateTimestampRef.current = Date.now();

      // Update the user location in our context
      mapInfo.setUserLocation(enhancedPosition);
    }

    // Adjust the map state based on current tripMenu state
    if (mapInfo.tripMenu?.state === 'driving-browsing') {
      mapInfo.setTripMenu({state: 'driving'});
    }
  }, [mapInfo]);

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
    }, 400);
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
      // Close any popups
      setHoldPopupVisible(false);
      setHoldPosition(null);
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
    onDriveToHoldLocation,
    // New props related to map matching
    matchedData,
    isMapMatchingPending,
    deviationDetected
  };
};
