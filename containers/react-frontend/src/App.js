import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './App.css';
import { fetchReports, /* add_pulsing_dot_features */ } from './map_features'
import { getUserCoordinates} from './location'


function App() {
  const mapRef = useRef(null);
  const canvasRef = UseRef(null

  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);

  const geolocationAPI = navigator.geolocation;
  getUserCoordinates(geolocationAPI, setLat, setLong)

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaXVsaWFubWFwcGVycyIsImEiOiJjbTJheWNnamUwa2NkMmpzZnUxaGxmczUxIn0.B5l5tnryyuACvaCdQ_tGdQ'
    mapRef.current = new mapboxgl.Map({
      container: 'map-container',
      center: [long, lat],
      zoom: 15
    });
  }, [long, lat]);

  let features = useRef()
  let latest_reports = useRef()

  const latestReportResponse = fetchReports()
  features.current = latestReportResponse.features
  latest_reports.current = latestReportResponse['data']

  const size = 200;

  const handleMapOnLoad = () => {
    const map = mapRef.current?.getMap();
    if (map) {
      // This implements `StyleImageInterface`
      // to draw a pulsing dot icon on the map.
      const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),

        // Call once before every frame where the icon will be used.
        render() {
          const duration = 1000;
          const t = (performance.now() % duration) / duration;

          const radius = (size / 2) * 0.3;
          const outerRadius = (size / 2) * 0.7 * t + radius;
          const context = canvasRef.current.getContext("2d");

          // Draw the outer circle.
          context.clearRect(0, 0, this.width, this.height);
          context.beginPath();
          context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
          );
          context.fillStyle = `rgba(255, 200, 200, ${1 - t})`;
          context.fill();

          // Draw the inner circle.
          context.beginPath();
          context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
          context.fillStyle = "rgba(255, 100, 100, 1)";
          context.strokeStyle = "white";
          context.lineWidth = 2 + 4 * (1 - t);
          context.fill();
          context.stroke();

          // Update this image's data with data from the canvas.
          this.data = context.getImageData(0, 0, this.width, this.height).data;

          // Continuously repaint the map, resulting
          // in the smooth animation of the dot.
          map.triggerRepaint();

          // Return `true` to let the map know that the image was updated.
          return true;
        }
      };

      map.addImage("pulsing-dot", pulsingDot, {
        pixelRatio: 2
      });
    }
  };


  return (
    <>

    return <Map
    //<div id='map-container' ref={mapContainerRef}/>
    </>
  );
}

export default App;
