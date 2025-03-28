// src/components/MenuSheet.js
import React, { useRef, useState, useEffect } from 'react';
import { Sheet } from 'react-modal-sheet';
import { useMapInfo } from '../context/UserLocationProvider';
import { TripInfo } from './TripInfo';
import { APIProvider } from "@vis.gl/react-google-maps";
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

export const MenuSheet = () => {
  const mapInfo = useMapInfo();
  const sheetRef = useRef();
  const [open, setOpen] = useState(false);
  const [snapPoints, setSnapPoints] = useState([0.25]);
  const [disableDrag, setDisableDrag] = useState(true);
  const [initialSnap, setInitialSnap] = useState(0);

  // Update sheet configuration based on app state
  useEffect(() => {
    if (!mapInfo.destinationLocation && mapInfo.tripMenu.state === 'browsing') {
      setOpen(true);
      // Set snap points where 1 is 100% of screen height
      setSnapPoints([1, 0.3]);
      setDisableDrag(false);
      setInitialSnap(1); // Start small (at 0.2 height)
      return;
    }

    if (mapInfo.destinationLocation &&
        (mapInfo.tripMenu.state === 'browsing' || mapInfo.tripMenu.state === 'previewing-route')) {
      setOpen(true);
      setSnapPoints([0.25]);
      setDisableDrag(true);
      setInitialSnap(0);
      return;
    }

    if (mapInfo.tripMenu.state === 'driving' || mapInfo.tripMenu.state === 'driving-browsing') {
      setOpen(true);
      setSnapPoints([0.5, 0.25, 0.2]);
      setDisableDrag(false);
      setInitialSnap(1);
      return;
    }
  }, [mapInfo.destinationLocation, mapInfo.tripMenu.state]);

  // Simple onSnap handler
  const onSnap = (index) => {
    console.log('> Current snap point index:', index);
  };

  // Handle click on input - expand the sheet to its maximum size
  const handleInputClick = () => {
    if (sheetRef.current) {
      // Snap to the first snap point (0 index), which should be the largest size
      sheetRef.current.snapTo(0);

      console.log("Input clicked, expanding sheet to maximum size");
    }
  };

  // Handle place selection
  const handlePlaceSelect = (place) => {
    if (place && place.location) {
      mapInfo.setDestinationLocation({
        result: {
          center: [
            place.location.lng(),
            place.location.lat()
          ]
        }
      });
    }
  };

  // Handle sheet close
  const handleClose = () => {
    if (mapInfo.tripMenu.state === 'driving' ||
        mapInfo.tripMenu.state === 'driving-browsing' ||
        mapInfo.tripMenu.state === 'browsing') {
      if (sheetRef.current && snapPoints.length > 0) {
        sheetRef.current.snapTo(snapPoints.length - 1);
      }
    } else {
      setOpen(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    mapInfo.setDestinationLocation();
    mapInfo.setTripMenu({state: 'browsing'});

    if (sheetRef.current && snapPoints.length > 0) {
      sheetRef.current.snapTo(snapPoints.length - 1);
    }
  };

  if (!open) return null;

  return (
    <Sheet
      ref={sheetRef}
      isOpen={open}
      onClose={handleClose}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      onSnap={onSnap}
      disableDrag={disableDrag}
    >
      <Sheet.Container>
        <Sheet.Header disableDrag={disableDrag} />
        <Sheet.Content className="sheet-content">
          {mapInfo.tripMenu.state === 'browsing' && !mapInfo.destinationLocation && mapInfo.userLocation && (
            <div className="search-container">
              <APIProvider
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                libraries={["places"]}
                authReferrerPolicy={"origin"}
              >
                <GooglePlacesAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  onSuggestionInputClick={handleInputClick}
                />
              </APIProvider>
            </div>
          )}

          {mapInfo.tripMenu.state === 'previewing-route' && (
            <div className="menu-controls">
              <button
                className="back-button"
                onClick={handleBack}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <TripInfo />
            </div>
          )}

          {(mapInfo.tripMenu.state === 'driving' || mapInfo.tripMenu.state === 'driving-browsing') && (
            <Sheet.Scroller draggableAt="both">
              <TripInfo />
            </Sheet.Scroller>
          )}
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
};
