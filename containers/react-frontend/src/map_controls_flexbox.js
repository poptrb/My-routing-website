import React from 'react';
import {useCallback} from 'react';



 export const FlexboxComponent = ({clickedPoints, updateClickedPoints, updateRouteGeoJSON}) => {
  const onResetButtonClick = useCallback(() => {
    updateClickedPoints([])
    updateRouteGeoJSON(null)

  }, [updateClickedPoints, updateRouteGeoJSON])

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div>Resetare calatorie</div>
        <button id='reset-trip-button' onClick={onResetButtonClick}>Reset</button>
      </div>
    </div>
  );
 };

 export default FlexboxComponent;

