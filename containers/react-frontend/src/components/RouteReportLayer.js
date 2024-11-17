import {Layer, Source} from 'react-map-gl';


const pointLayerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 14,
    'circle-color': ' #3333ff'
  }
};

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
