import {bbox} from '@turf/turf'
import * as polyline from '@mapbox/polyline'
import {useState, useEffect, useCallback,  memo, forwardRef} from 'react';
import {Layer, Source, useMap} from 'react-map-gl';

import {useOptimizedRouteQuery} from '../hooks/useOptimizedRouteQuery'
import {useMapInfo} from '../context/UserLocationProvider'


const lineLayerStyle = {
  id: "route",
  type: "line",
  paint: {
    'line-color': '#00b300',
    'line-width': 5
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

export const decodeRouteGeoJSON = (data) => {
  // Decodes polyline6 route data to GeoJSON FeatureCollection

  if (!data) {
    return
  };

  if (data.trip && data.trip.legs) {
    const routeFeatures = data.trip.legs.map((leg) => {
      return ({
        type: 'Feature',
        geometry: polyline.toGeoJSON(leg.shape, 6)
      })
    });

    return ({
      type: 'FeatureCollection',
      features: routeFeatures
    });
  }
  // return
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


export const RouteLineLayer = forwardRef(({locations, excludeLocations}) => {

  const [locationGeoJSON, setLocationGeoJSON]= useState();
  const [routeFeatures, setRouteFeatures] = useState();
  const [geoJSONShape, setGeoJSONShape] = useState();

  const mapInfo = useMapInfo();

  const { routeData, isError, isPending }  = useOptimizedRouteQuery({
    locations: locations,
    excludeLocations: excludeLocations
  });

  const {onlyMap} = useMap();

  useEffect(() => {
    if (routeData?.trip && routeData.trip.legs) {
      const decoded = decodeRouteGeoJSON(routeData)
      setGeoJSONShape(decoded)
      onlyMap.fitBounds(bbox(decoded))
    }
  }, [onlyMap, routeData]);

  return(
    <>
    {
      (! isError && ! isPending ) || geoJSONShape
        ? <Source
            key="route-source"
            id="route-source"
            type="geojson"
            data={geoJSONShape}
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
});

export const RouteLineLayerMemo = memo(RouteLineLayer)
