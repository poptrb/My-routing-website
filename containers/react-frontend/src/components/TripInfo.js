import { useState, useCallback, useEffect} from 'react';
import { useMapInfo } from '../context/UserLocationProvider'

export const TripInfo = () => {

    const [tripState, setTripState] = useState();
    const mapInfo = useMapInfo();

    useEffect(() => {
      setTripState(mapInfo.trip)
    }, [mapInfo]);
    return(
      <>
        {
          (tripState)
          ?
            <div className='trip-header'>
              test
            </div>
          : null
        }
      </>
              // {`${mapInfo.trip.data.trip.legs[0].summary.length} KM`}
              // {`${mapInfo.trip?.legs[0]?.summary.length}`}
    )
};

