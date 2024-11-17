import { Sheet } from 'react-modal-sheet';
import { useMap } from 'react-map-gl'
import { useState, useEffect, useCallback, useRef, useMemo} from 'react';

import { useMapInfo } from '../context/UserLocationProvider'
import { TripInfo} from './TripInfo'

export const MenuSheet = (props) => {

  const [currentState, setCurrentState] = useState('browsing');
  const [isOpen, setOpen] = useState(true);
  const [tripInfo, setTripInfo] = useState({});

  const ref = useRef();
  const {onlyMap} = useMap();
  const mapInfo = useMapInfo();

  const snapTo = (i) => ref.current?.snapTo(i);

  const startDriving = useCallback(() => {

    onlyMap.flyTo({
      zoom: 15,
      curve: 1,
      speed: 1.5,
      center: [
        mapInfo.userLocation?.coords.longitude,
        mapInfo.userLocation?.coords.latitude]
    });

    setTimeout(() => {
      onlyMap.setPitch(80);
    }, 3000);

    // mapInfo.
    snapTo(1);
    setCurrentState('driving')

  },[onlyMap, mapInfo]);




  const stopDriving = useCallback(() => {
    setCurrentState('browsing');
    mapInfo.setDestinationLocation();
  }, [mapInfo]);

  return (
    <>

      {/* Opens to 400 since initial index is 1 */}
      <Sheet
        ref={ref}
        isOpen={isOpen}
        onClose={() => null}
        snapPoints={[0.35,0.15]}
        initialSnap={1}
        onSnap={(snapIndex) =>
          console.log('> Current snap point index:', snapIndex)
        }
      >
        <Sheet.Container>
          <Sheet.Header disableDrag={true}/>
          <Sheet.Content
            style={{ paddingBottom: ref.current?.y }}
          >
            <Sheet.Scroller draggableAt={"top"}
            >
              {
                currentState === 'browsing'
                ?
                  <>
                    <button
                      onClick={() => startDriving()}
                    >
                      Start driving
                    </button>
                    <TripInfo />
                  </>
                :
                  <>
                    <button
                      onClick={
                        () => stopDriving()
                      }
                    >
                    Stop driving
                    <div>
                      {
                        tripInfo?.totalTime && `${tripInfo}`
                      }
                    </div>
                    </button>
                </>
              }
            </Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  );
                      // mapInfo?.trip?.map((leg) => {
                      //   <ul>
                      //     leg.maneuvers.map((m) => {
                      //     <li id={>
                      //     }
                      //   leg.maneuvera.time()
                      // }
};

