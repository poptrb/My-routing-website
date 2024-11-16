import {useState, useEffect, useCallback,  memo} from 'react';
import {Layer, Source} from 'react-map-gl';
import {useOptimizedRouteQuery} from '../hooks/useOptimizedRouteQuery'
import {useMapInfo} from '../context/UserLocationProvider'


const lineLayerStyle = {
  id: "route",
  type: "line",
  paint: {
    'line-color': '#00b300',
    'line-width': 4
  },
  layout: {
    'line-cap': 'round',
    'line-join': 'round'
  }
}

const locationLayerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 10,
    'circle-color': '#ffff66'
  }
};

export const latLngToGeoJSON = (points, setLocationGeoJSON) => {

    if (points) {
      const locationFeatures = points.map((point) => {
        return ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.longitude, point.latitude]
          }
        })
      });
      return({
        type: 'FeatureCollection',
        features: locationFeatures
    })
  }
}


export function RouteLineLayer({locations, excludeLocations}) {

  const [trip, setTrip] = useState();
  const [tripShape, setTripShape] = useState();
  const [locationGeoJSON, setLocationGeoJSON]= useState();
  const mapInfo = useMapInfo();

  const { routeData, isError, isPending }  = useOptimizedRouteQuery({
    locations: locations,
    excludeLocations: excludeLocations
  });

  const getTripShape = useCallback(() => {
    if (routeData?.trip.legs) {
      setTripShape(routeData.trip.legs[0].shape)
      mapInfo.setTrip(routeData.trip);
      console.log('From RouteLineLayer: ', routeData.trip);
    };
  }, [mapInfo, routeData]);

  useEffect(() => {
    getTripShape()
  }, [getTripShape])


  return(
    <>
    {
      (! isError || ! isPending)
        ? <Source
            key="route-source"
            id="route-source"
            type="geojson"
            data={tripShape}
          >
            <Layer
              {...lineLayerStyle}
              id="route-layer"
              source="route-source"
            />
          </Source>
        : null
    }
    {
      locationGeoJSON
        ? <Source
            key="location-source"
            id="location-source"
            type="geojson"
            data={locationGeoJSON}
          >
            <Layer
              {...locationLayerStyle}
              id="location-layer"
              source="location-source"
            />
          </Source>
        : null
    }
    </>
  );
};

export const RouteLineLayerMemo = memo(RouteLineLayer)
