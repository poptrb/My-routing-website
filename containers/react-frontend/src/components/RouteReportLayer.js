import {useEffect, useState, useMemo, useCallback} from 'react';
import {Layer, Source, Popup, Marker} from 'react-map-gl';
import { v4 as uuidv4 } from 'uuid';

const pointLayerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 14,
    'circle-color': ' #3333ff',
    'cirle-opacity-transition': {duration: 500},
  }
};

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

function formatDateTime(dateTime) {
    let datetime = new Date(dateTime);
    console.log(dateTime);
    const options = { hour: 'numeric', minute: 'numeric', hour12: false };

    if ( dateTime ){
        return datetime.toLocaleTimeString();
    } else {
        return datetime.toLocaleDateString(
          'ro-RO',
          { month: 'short', day: 'numeric' })
          + ' '
          + dateTime.toLocaleTimeString('ro-RO', options
        );
    }
}

 // Example usage
 const dateTime = new Date(); // Your JavaScript datetime object
 console.log(formatDateTime(dateTime));

export const RouteReportLayer = ({routeReportGeoJSON}) => {


  const [popupState, setPopupState] = useState([])

  useEffect(() => {
    setPopupState(
      routeReportGeoJSON?.features?.map(() => {return false})
    );
  } ,[routeReportGeoJSON])

  const popup = useMemo(() => {
      if ( popupState && popupState.indexOf(true) !== -1) {
        console.log(`Clicked marker ${popupState.indexOf(true)}`);
        const elem = routeReportGeoJSON?.features && routeReportGeoJSON.features?.length > 0
          ? routeReportGeoJSON?.features[popupState.indexOf(true)]
          : undefined;
        console.log(`GeoJSON for popup` ,elem);
        if (elem){
          return(
            <Popup
              longitude={elem.geometry?.coordinates[0]}
              latitude={elem.geometry?.coordinates[1]}
              key={`popup-${elem.properties?.id}`}
              anchor="bottom"
              onClick={(e) => {
                // If we let the click event propagates to the map, it will immediately close the popup
                // with `closeOnClick: true`
                setPopupState(popupState.map((v) => false));
              }}
            >
              <div>
                <div className="report-popup-header">
                {toTitleCase(elem.properties.type)}
                </div>
                <div className="report-popup-container">
                  {formatDateTime(elem.properties.lastSeenDate)}
                  <br />
                  {elem.properties.street}
                </div>
              </div>
            </Popup>
          );
        }
      }
  }
  , [routeReportGeoJSON, popupState])

  const markers = useMemo(() => {
    return routeReportGeoJSON?.features?.map((x,i) =>
      <Marker
        longitude={x.geometry.coordinates[0]}
        latitude={x.geometry.coordinates[1]}
        key={`marker-${x.properties.id}`}
        offset={[0.1,0.1]}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          console.log(popupState?.map((v, p_i) => i === p_i));
          setPopupState(popupState?.map((v, p_i) => i === p_i));
        }}
        >
      </Marker>
    );
  }, [routeReportGeoJSON, popupState]);

  useEffect(() => {
    if (routeReportGeoJSON) {
      console.log(routeReportGeoJSON);
    };
  }, [routeReportGeoJSON, markers]);

  return (
    <>
    {
      routeReportGeoJSON?.features
      ? <>
          <Source
            key="report-source"
            id="report-source"
            type="geojson"
            data={routeReportGeoJSON}>
            <Layer
              {...pointLayerStyle}
               id="report-layer"/>
          </Source>
           {
             popup
             ? popup
             : null
           }
          {
            markers && markers.length > 0
            ? markers
            : null
          }
        </>
      : null
    }
    </>
  )
}
