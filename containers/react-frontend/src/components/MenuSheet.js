import { useRef, useState, useEffect, useCallback } from 'react';
import { Sheet } from 'react-modal-sheet';
import { useMapInfo } from '../context/UserLocationProvider';
import { TripInfo } from './TripInfo';
import { APIProvider } from "@vis.gl/react-google-maps";

import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

export const MenuSheet = () => {
  const mapInfo = useMapInfo();
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const [snapPoints, setSnapPoints] = useState([0.25]);
  const [disableDrag, setDisableDrag] = useState(true);
  const [initialSnap, setInitialSnap] = useState(0);

  const onSuggestionInputClick = useCallback((evt) => {
      ref.current?.snapTo(snapPoints[0]);
  }, [snapPoints])

  const onPlaceSelect = useCallback((evt) => {
    console.log(evt.location);
    mapInfo.setDestinationLocation({
      result: {
        center: [
          evt.location.lng(),
          evt.location.lat()
        ]
      }
    })
  }, [mapInfo]);

  // Update sheet behavior based on mapInfo changes
  useEffect(() => {
    if (!mapInfo.destinationLocation && mapInfo.tripMenu.state === 'browsing') {
      setOpen(true); // Always show the sheet in browsing mode for search
      setSnapPoints([1, 0.35, 0.2]);
      setDisableDrag(false);
      setInitialSnap(1); // Start at 20% height
      return;
    }

    if (mapInfo.destinationLocation &&
        (mapInfo.tripMenu.state === 'browsing' || mapInfo.tripMenu.state === 'previewing-route')) {
      setOpen(true);
      setSnapPoints([0.35, 0.2]);
      setDisableDrag(true);
      setInitialSnap(0);
      return;
    }

    if (mapInfo.tripMenu.state === 'driving' || mapInfo.tripMenu.state === 'driving-browsing') {
      setOpen(true);
      setSnapPoints([0.5, 0.25, 0.2]);
      setDisableDrag(false);
      setInitialSnap(1); // Start at 25% (index 1)
      return;
    }
  }, [mapInfo.destinationLocation, mapInfo.tripMenu.state]);

  const onSnap = (index) => {
    console.log('> Current snap point index:', index);
  };

  // When in driving mode, prevent sheet from closing completely
  const handleClose = () => {
    if (mapInfo.tripMenu.state === 'driving' || mapInfo.tripMenu.state === 'driving-browsing') {
      ref.current?.snapTo(snapPoints.length - 1); // Snap to smallest point (20%)
    } else if (mapInfo.tripMenu.state === 'browsing') {
      ref.current?.snapTo(snapPoints.length - 1); // Just snap to smallest in browsing too
    } else {
      setOpen(false);
    }
  };

  const handleBack = () => {
    mapInfo.setDestinationLocation();
    mapInfo.setTripMenu({state: 'browsing'});
    ref.current?.snapTo(snapPoints.length - 1); // Snap to smallest point when going back to browsing
  };

  if (!open) return null;


  return (
    <Sheet
      ref={ref}
      isOpen={open}
      onClose={handleClose}
      snapPoints={snapPoints}
      initialSnap={initialSnap}
      onSnap={onSnap}
      disableDrag={disableDrag}
    >
      <Sheet.Container>
        <Sheet.Header disableDrag={disableDrag} />
        <Sheet.Content
          className="sheet-content"
          style={{ paddingBottom: ref.current?.y }}
        >
          {mapInfo.tripMenu.state === 'browsing' && !mapInfo.destinationLocation && mapInfo.userLocation && (
            <div className="search-container">
              <APIProvider
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                libraries={["places"]}
                authReferrerPolicy={"origin"}
                solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
              >
                <GooglePlacesAutocomplete
                  onPlaceSelect={onPlaceSelect}
                  onSuggestionInputClick={onSuggestionInputClick}
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
            <Sheet.Scroller draggableAt={"both"}>
              <TripInfo />
            </Sheet.Scroller>
          )}
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
};
