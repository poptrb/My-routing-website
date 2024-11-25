import {useRef} from 'react';
import { Sheet } from 'react-modal-sheet';

import { TripInfo} from './TripInfo'

export const MenuSheet = (props) => {

  const ref = useRef();
  // const snapTo = (i) => ref.current?.snapTo(i);
  return (
    <>
      <Sheet
        ref={ref}
        isOpen={true}
        onClose={() => null}
        snapPoints={[0.20,0.15]}
        initialSnap={1}
        onSnap={(snapIndex) =>
          console.log('> Current snap point index:', snapIndex)
        }
      >
        <Sheet.Container>
          <Sheet.Header disableDrag={false}/>
          <Sheet.Content className="sheet-content"
            style={{ paddingBottom: ref.current?.y }}
          >
            <Sheet.Scroller draggableAt={"both"}
            >
              {
                  <>
                  <TripInfo />
                  </>
              }
            </Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  );
};

