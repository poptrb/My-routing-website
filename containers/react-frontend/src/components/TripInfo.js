import { useMap } from 'react-map-gl'
import { useState, useCallback, useRef, useMemo, useEffect} from 'react';
import { useMapInfo } from '../context/UserLocationProvider'

export const TripInfo = () => {

    const [tripState, setTripState] = useState();
    const mapInfo = useMapInfo();

    const readTrip = useCallback(() => {
      if (mapInfo.trip) {
        console.log(mapInfo.trip)
        setTripState(mapInfo.trip)
      };
    }, [mapInfo])

    useEffect(() => {
      readTrip()
    }, [mapInfo, readTrip])

    return(
      <>
        {
          (tripState?.data)
          ?
            <div className='trip-header'>
            </div>
          : null
        }
      </>
              // {`${mapInfo.trip.data.trip.legs[0].summary.length} KM`}
              // {`${mapInfo.trip?.legs[0]?.summary.length}`}
    )
};

