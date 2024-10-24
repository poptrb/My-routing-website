import React from 'react';
import {useCallback} from 'react';



 export const FlexboxComponent = ({
   clickedPoints,
   controlBox,
   updateClickedPoints,
   updateRouteGeoJSON,
   updateControlBox
 }) => {

  const onResetButtonClick = useCallback(() => {
    updateClickedPoints([])
    updateRouteGeoJSON(null)
  }, [updateClickedPoints, updateRouteGeoJSON])

  const onInputGpsTrace = useCallback(() => {
    updateControlBox({state: 'input-gps'})
  }, [updateControlBox])

  const onInputDestinations = useCallback(() => {
    updateControlBox({state: 'input-destinations'})
  }, [updateControlBox])

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div>Resetare calatorie</div>
        <button id='reset-trip-button' onClick={onResetButtonClick}>Reset</button>
      </div>
      <div style={{ flex: 1 }}>
        <div>Add GPS traces</div>
        <button id='btn-input-gps-trace' onClick={onInputGpsTrace}>Reset</button>
      </div>
      <div style={{ flex: 1 }}>
        <div>Input destinations</div>
        <button id='btn-input-destinations' onClick={onInputDestinations}>Reset</button>
      </div>
    </div>
  );
 };

 export default FlexboxComponent;

