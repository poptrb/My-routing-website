import { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl';
import { useMapInfo } from '../context/UserLocationProvider';

// Style for the map-matched path
const matchedPathStyle = {
  id: 'matched-path',
  type: 'line',
  paint: {
    'line-color': '#00ffff',
    'line-width': 4,
    'line-opacity': 0.7,
    'line-dasharray': [2, 1]
  }
};


export const MapMatchedLayer = ({matchedData}) => {
  const mapInfo = useMapInfo();
  const matchedPathGeoJSON = useMemo(() => {
    if (!matchedData || !matchedData.matchedPath) return null;

    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        properties: {},
        geometry: matchedData.matchedPath
      }]
    };
  }, [matchedData]);

  if (mapInfo.tripMenu?.state === 'driving' && matchedPathGeoJSON) {
    return(
      <Source
        id="matched-path-source"
        type="geojson"
        data={matchedPathGeoJSON}
      >
        <Layer {...matchedPathStyle} />
      </Source>
    );
  } else {
    return null;
  }
}
