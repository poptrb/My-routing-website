import { useState, useCallback, useEffect} from 'react';
import { useMapInfo } from '../context/UserLocationProvider'

export const TripInfo = () => {

    const [tripState, setTripState] = useState();
    const mapInfo = useMapInfo();

    const getTripData = useCallback(() => {
      const legTimes = mapInfo.trip?.legs.map((leg) => {
        const mTime = leg.maneuvers.reduce((a,b) => a + b.length, 0);
        return mTime;
      });

      const totalTime = legTimes.reduce((a,b) => a+b, 0);
    console.log(totalTime)
  }, [mapInfo.trip]);

    useEffect(() => {
      setTripState(mapInfo.trip)
    }, [mapInfo]);

    return(
      <>
        {
          (tripState)
          ?
          <>
            <div className='trip-container' key='trip-container'>
              <div className='trip-header' key='trip-header'>
                {`${mapInfo.trip.legs[0].summary.length} KM`}
                <br/>
                {
                  `${Math.floor(mapInfo.trip.legs[0].summary.time / 60)} min`
                }
              </div>
              <div className='trip-instructions'>
                {`${mapInfo.trip.legs[0].maneuvers[0].street_names[0]}`}
                <br/>
                {`${mapInfo.trip.legs[0].maneuvers[0].verbal_pre_transition_instruction}`}
                {getTripData()}
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

