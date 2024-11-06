import React, { useRef, useState } from 'react';
import Map, {GeolocateControl, Source, Layer, useMap} from 'react-map-gl';

import {FlexboxComponent} from './map_controls_flexbox'
import {MapLine} from './map_line'
import {useExternalContext} from './ReportsProvider'
import {GeocoderControl} from './GeocoderControl'

import {bbox, center, lineString, bboxPolygon} from '@turf/turf'

// import {getUserCoordinates, getUserLocation} from './location.js'

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaXVsaWFubWFwcGVycyIsImEiOiJjbTJheWNnamUwa2NkMmpzZnUxaGxmczUxIn0.B5l5tnryyuACvaCdQ_tGdQ'; // Set your mapbox token here

export function CustomMap() {

  const [clickedPoints, setClickedPoints] = useState([]);
  const [routeStops, setRouteStops] = useState([])

  const updateClickedPoints = (value) => {
    setClickedPoints(value)
  }

  const updateRouteStops = (value) => {
    setRouteStops(value)
  }


  return(
    <>
      <FlexboxComponent
        clickedPoints={clickedPoints}
        updateClickedPoints={updateClickedPoints}
      />
      <MapView
        clickedPoints={clickedPoints}
        setClickedPoints={updateClickedPoints}
        routeStops={routeStops}
        updateRouteStops={updateRouteStops}
      />
    </>
  );
};

export function MapView({clickedPoints, setClickedPoints, routeStops, updateRouteStops}) {

  const mapRef = useRef()
  const geoControlRef = useRef()
  const geocoderControlRef = useRef()
  const externalContext = useExternalContext()
  const pointLayerStyle = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#007cbf'
    }
  };


   const [viewState, setViewState] = useState({
     longitude: 26.1025,
     latitude: 44.4268,
     zoom: 3
  });


  const onMapLoad = (evt) => {
    geoControlRef.current.trigger()
  }

  const onMapClick = (evt) => {
    setClickedPoints([...clickedPoints, {
      longitude: evt.lngLat.lng,
      latitude: evt.lngLat.lat
    }]);
  };

  const onMapMove = (evt) => {
    setViewState(evt.viewState);

  };


  const userLocationRef = useRef()
  const destinationRef = useRef()

  const onGeolocate = (evt) => {
    userLocationRef.current = {
      longitude: evt.coords.longitude,
      latitude: evt.coords.latitude
    }
  };

  const onGeocoderResult = (evt) => {
    destinationRef.current =  {
      longitude: evt.result.center[0],
      latitude: evt.result.center[1]
    }

    if (userLocationRef.current) {

    const line = lineString([
      [destinationRef.current.longitude, destinationRef.current.latitude],
      [userLocationRef.current.longitude, userLocationRef.current.latitude]
    ])


    const bbox_center = center(bboxPolygon(bbox(line)))
    mapRef.current.flyTo({
      center: bbox_center.geometry.coordinates,
      zoom: 14
    })
    }
  };


  return (
      <Map
      {...viewState}
      ref={mapRef}
      reuseMaps={true}
      id="report-map"
      style={{height: "100vh"}}
      mapStyle="mapbox://styles/mapbox/navigation-night-v1"
      mapboxAccessToken={MAPBOX_TOKEN}
      onClick={onMapClick}
      onLoad={onMapLoad}
      onMove={onMapMove}>

      { externalContext
        ?
        <Source
          key="report-source"
          id="report-source"
          type="geojson"
          data={externalContext}>
          <Layer {...pointLayerStyle} id="report-layer"/>
        </Source>
        : null
      }
      <GeocoderControl
        ref={geocoderControlRef}
        mapboxAccessToken={MAPBOX_TOKEN} position="top-left"
        flyTo={false}
        onResult={onGeocoderResult}
      />
      <GeolocateControl
        ref={geoControlRef}
        onGeolocate={onGeolocate}
        trackUserLocation={true}
        showUserHeading={true}
      />
      {
        destinationRef.current && userLocationRef.current
        ? <MapLine
            pointList={[userLocationRef.current, destinationRef.current]}
            excludePoints={externalContext}
          />
        : null
      }
      </Map>
  );
}
