import { Sheet } from 'react-modal-sheet';
import { useMap } from 'react-map-gl'
import { useState, useCallback, useRef} from 'react';

import { useMapInfo } from '../context/UserLocationProvider'

export const MenuSheet = (props) => {

  const [isOpen, setOpen] = useState(true);
  const ref = useRef();
  const {onlyMap} = useMap();
  const mapInfo = useMapInfo();

  const snapTo = (i) => ref.current?.snapTo(i);
  //const setViewPort

  const mapOperation = useCallback(() => {
    console.log(onlyMap)

    onlyMap.flyTo({
      zoom: 15,
      curve: 1,
      speed: 0.9,
      center: [
        mapInfo.userLocation?.coords.longitude,
        mapInfo.userLocation?.coords.latitude]
    });

    setTimeout(() => {
      onlyMap.setPitch(80);
    }, 2000);

  },[onlyMap, mapInfo]);

  const [isDriving, setIsDriving] = useState(false);
  const [lastAction, setLastAction]  = useState();
  const [currentState, setCurrentState] = useState('browsing');

  return (
    <>

      {/* Opens to 400 since initial index is 1 */}
      <Sheet
        ref={ref}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        snapPoints={[0.4, 0.15]}
        initialSnap={0}
        detent={"content-height"}
        onSnap={(snapIndex) =>
          console.log('> Current snap point index:', snapIndex)
        }
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content>
            <button onClick={() => snapTo(0)}>Snap to index 0</button>
            <button onClick={() => snapTo(1)}>Snap to index 1</button>
            <button onClick={() => mapOperation()}>Start driving</button>
            <div
              className="geocoder"
              id="geocoder-container"
              style={{height: 500}}
            >
            </div>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  );
};

