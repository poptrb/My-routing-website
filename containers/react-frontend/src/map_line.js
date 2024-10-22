import * as polyline from '@mapbox/polyline'
import {useCallback, useEffect, useState} from 'react';
import {Layer, Source} from 'react-map-gl';

export const getRouteGeoJSON = async(pointList) => {
    if (pointList.length < 2) {
      return null
    }

    const locations = pointList.map((x) => {
      return {
        lat: x.latitude,
        lon: x.longitude
      };
    });

    const route_response = await fetch("http://localhost:8002/optimized_route?json=", {
      method: 'POST',
      body: JSON.stringify({
        locations: locations,
        costing: 'auto',
        direction_options: {
          units: 'kilometres'
        }
      })
    });

    const data = await route_response.json()
    return data
}


export const decodeRouteGeoJSON = (data) => {
    if (!data) {
      return
    };
    if (data.trip && data.trip.legs) {
      const routeLegs = data.trip.legs.map((leg) => {
        let lineString = polyline.toGeoJSON(leg.shape, 6)
        console.log(lineString)
        // const reversedCoordinates = lineString.geometry.coordinates.map((c) => {
        //   return [c[1], c[0]]
        // })
        // lineString.geometry.coordinates = reversedCoordinates;
        return lineString;
      });

      const routeFeatures = routeLegs.map(routeLeg => {
        return({
          type: 'Feature',
          geometry: routeLeg
        });
      });


      return ({
        type: 'FeatureCollection',
        features: routeFeatures
      });
    }
    return
};

export function MapLine({pointList}) {

  const [routeGeoJSON, setRouteGeoJSON] = useState();

  const showRoute = useCallback(async() => {
    const data = await getRouteGeoJSON(pointList);
    const geoJSON = decodeRouteGeoJSON(data);
    if (geoJSON) {
      setRouteGeoJSON(geoJSON);
    };
  }, [pointList]);

  useEffect(() => {
    showRoute();
  }, [showRoute])

  console.log(routeGeoJSON);
  if (routeGeoJSON) {
    console.log('Should draw MapLine');
    return (
      <Source key="route-data" id="route-data" type="geojson" data={routeGeoJSON}>
        <Layer
          key="route-layer"
          id="route"
          type="line"
          paint={{
            'line-color': '#ffff00',
            'line-width': 50
          }}
        >
        </Layer>
      </Source>
    )
  } else {
    return (
      <>
      </>
    );
  };
};
