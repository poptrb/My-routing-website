import {useEffect, useState } from 'react';


import {RouteReportLayer} from './RouteReportLayer'
import {useReportsInBboxQuery} from '../hooks/useReportsInBboxQuery'
import {useMapInfo} from '../context/UserLocationProvider'

const buildGeoJSON = (data) => {
    console.log('GeoJSON builder data: ', data);
    if (data) {
     const features = data.map((item) => ({
       type: 'Feature',
       geometry: {
         type: 'Point',
         coordinates: [item.location.lat, item.location.long]
       },
       properties: {
         id: item.uuid,
         type: item.d_type,
         nThumbsUp: item.nThumbsUp,
         reportRating: item.reportRating,
         reliability: item.reliability,
         street: item.street ? item.street : '' ,
         firstSeenDate: item.firstSeenDate,
         lastSeenDate: item.lastSeenDate,
       },
     }));

     return({
       type: 'FeatureCollection',
       features: features
   })
  }
}

export const RouteNearbyReportLayer = () => {

  const [routeReportGeoJSON, setRouteReportGeoJSON] = useState();
  const mapInfo = useMapInfo();

  const { routeReportData, isRouteReportError, isRouteReportPending }  = useReportsInBboxQuery({
    userCoords: [
      mapInfo.userLocation?.coords,
    ]
  });

  useEffect(() => {
    // if (routeReportData?.length > 0) {
    //   toast.success(`Found ${routeReportData.length} reports`)
    // }
    setRouteReportGeoJSON(buildGeoJSON(routeReportData))
  }, [routeReportData, mapInfo.userLocation, mapInfo.destinationLocation]);

  if (! routeReportGeoJSON) { return null; };
  return (
    <RouteReportLayer
      routeReportGeoJSON={routeReportGeoJSON}
    />
  )
}
