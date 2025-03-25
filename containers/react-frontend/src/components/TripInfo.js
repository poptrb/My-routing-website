import { useState, useCallback, useEffect, useMemo } from 'react';
import { useMapInfo } from '../context/UserLocationProvider';
import { useMap } from 'react-map-gl';
import { directionSvgs } from './directionSvg';

export const TripInfo = () => {
    const [tripState, setTripState] = useState();
    const mapInfo = useMapInfo();
    const { onlyMap } = useMap();

    const getTripData = useCallback(() => {
      const legTimes = mapInfo.trip?.legs.map((leg) => {
        const mTime = leg?.maneuvers.reduce((a,b) => a + b.length, 0);
        return mTime;
      });

      const totalTime = legTimes?.reduce((a,b) => a+b, 0);
      return totalTime;
    }, [mapInfo.trip]);

    useEffect(() => {
      setTripState(mapInfo.trip);
    }, [mapInfo]);

    const startDriving = useCallback(() => {
      onlyMap.flyTo({
        center: [mapInfo.userLocation.coords.longitude, mapInfo.userLocation.coords.latitude],
      });

      mapInfo.setTripMenu({
        state: 'driving',
        event: 'trigger-geolocate'
      });
    }, [onlyMap, mapInfo]);

    const stopDriving = useCallback(() => {
      mapInfo.setTripMenu({state: 'browsing'});
      mapInfo.setDestinationLocation();
      mapInfo.setTrip();

      // Reset the map view
      onlyMap.flyTo({
        center: [mapInfo.userLocation.coords.longitude, mapInfo.userLocation.coords.latitude],
      });
    }, [mapInfo, onlyMap]);

    const renderBannerInstructions = useMemo(() => {
      if (!mapInfo?.trip?.legs[0]?.steps[0]?.bannerInstructions[0]?.primary) {
        return null;
      }

      const bannerInstructions = mapInfo?.trip?.legs[0]?.steps[0]?.bannerInstructions[0]?.primary;
      const voiceInstructions = mapInfo?.trip?.legs[0]?.steps[0]?.voiceInstructions;
      const distance = Math.floor((mapInfo?.trip?.legs[0]?.steps[0]?.distance / 10)) * 10;

      const maneuverSvg = bannerInstructions.modifier
        ? `${bannerInstructions.type.split(" ").join("_")}_${bannerInstructions.modifier.split(" ").join("_")}`
        : `${bannerInstructions.type.split(" ").join("_")}`;

      return (
        <>
          <div className='trip-instructions-maneuvers'>
            {voiceInstructions[0].announcement}
          </div>
          <div className='trip-instructions-symbol'>
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
    }, [mapInfo.trip]);

    // If no trip data, return emptier view
    if (!mapInfo.trip) {
      return (
        <div className='trip-container'>
          <div className='trip-header'>
            {mapInfo.destinationLocation &&
              <div className='trip-calculating'>
                Calculating route...
              </div>
            }
          </div>
        </div>
      );
    }

    return (
      <div className='trip-container'>
        <div className='trip-left-menu'>
          <div className='trip-header'>
            {mapInfo.trip?.legs?.length > 0 ? (
              <>
                <div>
                  {`${Math.floor(mapInfo.trip.legs[0].distance / 1000)} KM`}
                </div>
                <div>
                  {`${Math.floor(mapInfo.trip.legs[0].duration / 60)} min`}
                </div>
              </>
            ) : null}
          </div>

          <div className='trip-controls'>
            {(mapInfo.userLocation?.coords &&
               mapInfo.destinationLocation?.result?.center &&
               mapInfo.tripMenu?.state === 'previewing-route') ? (
                <button
                  className="start-driving-button"
                  onClick={startDriving}
                >
                  Start driving
                </button>
              ) : null
            }

            {(mapInfo.tripMenu?.state === 'driving' ||
              mapInfo.tripMenu?.state === 'driving-browsing') ? (
                <button
                  className="stop-driving-button"
                  onClick={stopDriving}
                >
                  Stop driving
                </button>
              ) : null
            }
          </div>
        </div>

        {(mapInfo.trip.legs?.length > 0 &&
          mapInfo.tripMenu?.state &&
          (mapInfo.tripMenu.state === 'driving' ||
           mapInfo.tripMenu.state === 'driving-browsing')) && (
          <div className='trip-instructions'>
            {renderBannerInstructions}
          </div>
        )}
      </div>
    );
};
