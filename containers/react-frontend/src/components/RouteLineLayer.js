import {bbox} from '@turf/turf'
import * as polyline from '@mapbox/polyline'
import {useState, useEffect, memo} from 'react';
import {Layer, Source, useMap} from 'react-map-gl';

import {RouteReportLayer} from './RouteReportLayer'
import {useReportsInBboxQuery} from '../hooks/useReportsInBboxQuery'
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

const buildGeoJSON = (data) => {
    if (data) {
     const features = data.map((item) => ({
       type: 'Feature',
       geometry: {
         type: 'Point',
         coordinates: [item.location.lat, item.location.long]
       }
     }));

     return({
       type: 'FeatureCollection',
       features: features
   })
  }
}

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


export const RouteLineLayer = ({locations, excludeLocations}) => {

  const [locationGeoJSON, setLocationGeoJSON]= useState();
  const [routeFeatures, setRouteFeatures] = useState();
  const [routeReportGeoJSON, setRouteReportGeoJSON] = useState();
  const [geoJSONShape, setGeoJSONShape] = useState();

  const mapInfo = useMapInfo();
  const {onlyMap} = useMap();

  const { routeReportData, isRouteReportError, isRouteReportPending }  = useReportsInBboxQuery({
    userCoords: mapInfo.userLocation?.coords
  });

  useEffect(() => {
    setRouteReportGeoJSON(buildGeoJSON(routeReportData))
  }, [routeReportData]);

  const { routeData, isError, isPending }  = useOptimizedRouteQuery({
    locations: locations,
    excludeLocations: routeReportGeoJSON,
    enabled: (!routeReportGeoJSON  ? false : true),
  });



  useEffect(() => {
    if (routeReportData) {
      console.log(routeReportData)
      console.log(buildGeoJSON(routeReportData))
    }
    if (routeData?.trip && routeData.trip.legs) {
      const decoded = decodeRouteGeoJSON(routeData)
      setGeoJSONShape(decoded);
      mapInfo.setTrip(routeData.trip);

      onlyMap.fitBounds(bbox(decoded), {
        padding: 105

      })
    }
  }, [onlyMap, routeData, mapInfo, routeReportData]);

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
      (! isRouteReportError && ! isRouteReportPending) || routeReportGeoJSON
        ? <RouteReportLayer routeReportGeoJSON={routeReportGeoJSON}/>
        : null
    }
    </>
  );
};

    // {
    //   locationGeoJSON
    //     ? <Source
    //         key="location-source"
    //         id="location-source"
    //         type="geojson"
    //         data={locationGeoJSON}
    //       >
    //         <Layer
    //           {...locationLayerStyle}
    //           id="location-layer"
    //           source="location-source"
    //         />
    //       </Source>
    //     : null
    // }
export const RouteLineLayerMemo = memo(RouteLineLayer)
