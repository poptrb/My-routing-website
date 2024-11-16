import { Sheet } from 'react-modal-sheet';
import { useMap } from 'react-map-gl'
import { useState, useCallback, useRef, useMemo} from 'react';

import { useMapInfo } from '../context/UserLocationProvider'
import { TripInfo} from './TripInfo'

export const MenuSheet = (props) => {

  const [currentState, setCurrentState] = useState('browsing');
  const [isOpen, setOpen] = useState(true);

  const ref = useRef();
  const {onlyMap} = useMap();
  const mapInfo = useMapInfo();

  const snapTo = (i) => ref.current?.snapTo(i);

  const mapOperation = useCallback(() => {

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
    }, 3000);

    // mapInfo.
    setCurrentState('driving')

  },[onlyMap, mapInfo]);

  return (
    <>

      {/* Opens to 400 since initial index is 1 */}
      <Sheet
        ref={ref}
        isOpen={isOpen}
        onClose={() => null}
        snapPoints={[350,0.12]}
        initialSnap={0}
        onSnap={(snapIndex) =>
          console.log('> Current snap point index:', snapIndex)
        }
      >
        <Sheet.Container>
          <Sheet.Header />
          <Sheet.Content
            style={{ paddingBottom: ref.current?.y }}
            disableDrag={true}
          >
            <Sheet.Scroller
              draggableAt='both'
            >
              {
                currentState === 'browsing'
                ?
                  <>
                    <div
                      className="geocoder"
                      id="geocoder-container"
                      style={{
                        width: "90%"
                      }}
                    />
                    <button
                      onClick={() => mapOperation()}
                    >
                      Start driving
                    </button>
                    <TripInfo />
                  </>
                :
                  <>
                    <button onClick={() => null}>Stop driving</button>
                    <div>
                    </div>
                </>
              }
            </Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  );
};

