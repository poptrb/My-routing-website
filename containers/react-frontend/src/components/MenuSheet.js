import { useRef, useState, useEffect } from 'react';
import { Sheet } from 'react-modal-sheet';
import { useMapInfo } from '../context/UserLocationProvider';
import { TripInfo } from './TripInfo';

export const MenuSheet = () => {
  const mapInfo = useMapInfo();
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const [snapPoints, setSnapPoints] = useState([0.4, 0.2]);
  const [disableDrag, setDisableDrag] = useState(true);
  const [initialSnap, setInitialSnap] = useState(0);

  // Update sheet behavior based on mapInfo changes
  useEffect(() => {
    // Case 1: No destination - hide the sheet
    if (!mapInfo.destinationLocation && mapInfo.tripMenu.state === 'browsing') {
      setOpen(false);
      return;
    }

    // Case 2: Has destination but not driving - show at 40% and disable drag
    if (mapInfo.destinationLocation &&
        (mapInfo.tripMenu.state === 'browsing' || mapInfo.tripMenu.state === 'previewing-route')) {
      setOpen(true);
      setSnapPoints([0.3, 0.2]);
      setDisableDrag(true);
      setInitialSnap(0);
      return;
    }

    // Case 3: Driving mode - show at 30% and enable drag
    if (mapInfo.tripMenu.state === 'driving' || mapInfo.tripMenu.state === 'driving-browsing') {
      setOpen(true);
      setSnapPoints([0.5, 0.25, 0.2]);
      setDisableDrag(false);
      setInitialSnap(1); // Start at 30% (index 1)
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
    } else {
      setOpen(false);
    }
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
          <Sheet.Scroller draggableAt={"both"}>
            <TripInfo />
          </Sheet.Scroller>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
};
