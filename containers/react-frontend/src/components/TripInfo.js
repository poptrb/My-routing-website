import { useState, useCallback, useEffect} from 'react';
import { useMapInfo } from '../context/UserLocationProvider'
import {useMap} from 'react-map-gl'

export const TripInfo = () => {

    const [tripState, setTripState] = useState();
    const mapInfo = useMapInfo();
    const {onlyMap} = useMap();

    const getTripData = useCallback(() => {
      const legTimes = mapInfo.trip?.legs.map((leg) => {
        const mTime = leg?.maneuvers.reduce((a,b) => a + b.length, 0);
        return mTime;
      });

      const totalTime = legTimes?.reduce((a,b) => a+b, 0);
    console.log(totalTime)
  }, [mapInfo.trip]);

    useEffect(() => {
      setTripState(mapInfo.trip)
    }, [mapInfo]);

    const startDriving = useCallback(() => {

      onlyMap.flyTo(mapInfo.userLocation.coords)
      mapInfo.setTripMenu({
        state: 'driving',
        event: 'trigger-geolocate'
      });
    },[onlyMap, mapInfo]);

    const stopDriving = useCallback(() => {
      mapInfo.setTripMenu({state: 'browsing'})
      mapInfo.setDestinationLocation();
      mapInfo.setTrip();
    }, [mapInfo]);

    return(
      <>
        {
          (mapInfo.trip)
          ?
          <>
            <div className='trip-container' key='trip-container'>
              <div className='trip-controls' key='trip-controls'>
                  {
                    (mapInfo.userLocation?.coords &&
                      mapInfo.destinationLocation?.result?.center &&
                      mapInfo.tripMenu?.state === 'previewing-route')
                    ? <button
                        onClick={() => startDriving()}
                      >
                      Start driving
                    </button>
                    : null
                  }
                  {
                    (mapInfo.tripMenu?.state === 'driving')
                    ? <button
                      onClick={
                        () => stopDriving()
                      }
                      >
                        Stop driving
                      </button>
                    : null
                  }
              </div>
              <div className='trip-header' key='trip-header'>
                {
                  mapInfo.trip?.legs?.length > 0
                    ? <>
                      {
                        `${Math.floor(mapInfo.trip.legs[0].summary.length)} KM`
                      }
                      <br/>
                      {
                        `${Math.floor(mapInfo.trip.legs[0].summary.time / 60)} min`
                      }
                      </>
                    : null
                }
              </div>
              <div className='trip-instructions'>
                {
                  mapInfo.trip?.legs?.length > 0 && mapInfo.tripMenu?.state && mapInfo.tripMenu.state === 'driving'
                    ?
                      <>
                      {
                        `${mapInfo?.trip?.legs[0]?.maneuvers[0].street_names[0]}`
                      }
                      <br/>
                      {
                        `${mapInfo?.trip?.legs[0]?.maneuvers[0].verbal_pre_transition_instruction}`
                      }
                      </>
                    : null
                }
              </div>
            </div>
          </>
          : null
        }
      </>
              // {`${mapInfo.trip.data.trip.legs[0].summary.length} KM`}
              // {`${mapInfo.trip?.legs[0]?.summary.length}`}
    )
};

