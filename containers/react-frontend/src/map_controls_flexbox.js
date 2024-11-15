import React from 'react';
import {useCallback} from 'react';



 export const FlexboxComponent = ({clickedPoints, updateClickedPoints}) => {
  const onResetButtonClick = useCallback(() => {
    updateClickedPoints([])
  }, [updateClickedPoints])

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div>"Ceva text plm"</div>
        <button id='reset-trip-button' onClick={onResetButtonClick}>Reset</button>
      </div>
    </div>
  );
 };

 //export default FlexboxComponent;

