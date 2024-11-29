import { useState, useCallback, useEffect, useMemo} from 'react';
import { useMapInfo } from '../context/UserLocationProvider'
import {useMap} from 'react-map-gl'
import {directionSvgs} from './directionSvg'

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

    const renderBannerInstructions = useMemo(() => {
      if (! mapInfo?.trip?.legs[0]?.steps[0]?.bannerInstructions[0]?.primary) {
	return null
      }

      const bannerInstructions = mapInfo?.trip?.legs[0]?.steps[0]?.bannerInstructions[0]?.primary;
      const maneuverInstructions = mapInfo?.trip?.legs[0]?.steps[0]?.maneuver.instruction;
      const voiceInstructions = mapInfo?.trip?.legs[0]?.steps[0]?.voiceInstructions;
      const distance = Math.floor((mapInfo?.trip?.legs[0]?.steps[0]?.distance / 10)) * 10;
	

      const maneuverSvg = bannerInstructions.modifier 
        ? `${bannerInstructions.type.split(" ").join("_")}_${bannerInstructions.modifier.split(" ").join("_")}`
	: `${bannerInstructions.type.split(" ").join("_")}`;

      return(
        <>
	<div className={'trip-instructions-maneuvers'}>
          {
            `${voiceInstructions[0].announcement}`
          }
	</div>
	<div className={'trip-instructions-symbol'}>
	  <img
	    src={directionSvgs.get(maneuverSvg)}
	    style={{
	      height: '75px',
	      width: '75px'
	    }}
	    alt="maneuver"
          />
          {
            distance < 1000 
	      ? `${distance} m`
	      : `${Math.round((distance / 1000) * 10) / 10} km`
          }
	</div>
        </>
      );
    }, [mapInfo.trip])

    return(
      <>
        {
          (mapInfo.trip)
          ?
          <>
            <div className='trip-container' key='trip-container'>
            <div className='trip-left-menu' key='trip-container'>
	  
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
                    (mapInfo.tripMenu?.state === 'driving' || 
		      mapInfo.tripMenu?.state === 'driving-browsing')
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
		      <div>
                      {
                        `${Math.floor(mapInfo.trip.legs[0].distance / 1000)} KM`
                      }
		      </div>
		      <div>
                      {
                        `${Math.floor(mapInfo.trip.legs[0].duration / 60)} min`
                      }
		      </div>
                      </>
                    : null
                }
              </div>
	      </div>
		<>
		{
                (mapInfo.trip.legs?.length > 0 && mapInfo.tripMenu?.state && 
	          ( mapInfo.tripMenu.state === 'driving'  || 
	            mapInfo.tripMenu.state === 'driving-browsing')) && (
		  
                  <div className='trip-instructions'>
		    {renderBannerInstructions}
                  </div> )
		}
		</>
            </div>
          </>
          : null
        }
      </>
              // {`${mapInfo.trip.data.trip.legs[0].summary.length} KM`}
              // {`${mapInfo.trip?.legs[0]?.summary.length}`}
    )
};

