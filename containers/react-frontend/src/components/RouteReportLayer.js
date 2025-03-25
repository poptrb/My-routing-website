import {useEffect, useState, useMemo, useCallback} from 'react';
import {Layer, Source, Popup, Marker} from 'react-map-gl';

const pointLayerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 14,
    'circle-color': ' #3333ff',
    'cirle-opacity-transition': {duration: 500},
  }
};

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

const formatDateTime = (dateTime) => {
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

export const RouteReportLayer = ({routeReportGeoJSON}) => {

  const [popupState, setPopupState] = useState([]);
  const [latLngSha, setLatLngSha] = useState('');

  const updateLatLngSha = useCallback(async () => {
    if (routeReportGeoJSON?.features?.length > 0) {
      const elems = routeReportGeoJSON?.features?.map((x) =>{
        return x.geometry.coordinates[1] + x.geometry.coordinates[0]
      });

      const hashHex = digestMessage(JSON.stringify(elems));

      setLatLngSha(hashHex);
    }
  }, [routeReportGeoJSON]);

  useEffect(() => {
    setPopupState(
      routeReportGeoJSON?.features?.map(() => {return false})
    );
    updateLatLngSha();

  }, [routeReportGeoJSON, updateLatLngSha])

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
                  {formatDateTime(elem.properties.firstSeenDate)}
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
        id={`marker-${i}`}
        key={`marker-${i}`}
        offset={[0.1,0.1]}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setPopupState(popupState?.map((v, p_i) => i === p_i));
        }}
        style={{
          opacity: 0
        }}
        >
      </Marker>
    );
  }, [routeReportGeoJSON, popupState]);

  useEffect(() => {
    if (routeReportGeoJSON && routeReportGeoJSON.features?.length > 0) {

      console.log(routeReportGeoJSON);
    };
  }, [routeReportGeoJSON, markers]);

  return (
    <>
    {
      routeReportGeoJSON?.features?.length > 0
      ? <>
          <Source
            key={`report-source-${latLngSha}`}
            id={`report-source-${latLngSha}`}
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
