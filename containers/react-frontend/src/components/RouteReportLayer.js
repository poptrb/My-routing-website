import {bbox} from '@turf/turf'
import * as polyline from '@mapbox/polyline'
import {useState, useEffect, useCallback,  memo, forwardRef} from 'react';
import {Layer, Source, useMap} from 'react-map-gl';

import {useReportsInBboxQuery} from '../hooks/useReportsInBboxQuery'
import {useMapInfo} from '../context/UserLocationProvider'

const pointLayerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 14,
    'circle-color': ' #3333ff'
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

export const RouteReportLayer = ({routeReportGeoJSON}) => {
  return (
    <>
    {
      routeReportGeoJSON
      ? <Source
          key="report-source"
          id="report-source"
          type="geojson"
          data={routeReportGeoJSON}>
          <Layer
            {...pointLayerStyle}
             id="report-layer"/>
        </Source>
      : null
    }
    </>
  )
}
