import {useState, memo} from 'react';
import {Layer, Source} from 'react-map-gl';
import {useOptimizedRouteQuery} from './hooks/useOptimizedRouteQuery'


const lineLayerStyle = {
  id: "route",
  type: "line",
  paint: {
    'line-color': '#00b300',
    'line-width': 6
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

  const [locationGeoJSON, setLocationGeoJSON]= useState();
  const { data, isError, isPending }  = useOptimizedRouteQuery({
    locations: locations,
    excludeLocations: excludeLocations
  });

  return(
    <>
    {
      ! isError || ! isPending
        ? <Source
            key="route-source"
            id="route-source"
            type="geojson"
            data={data}
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
