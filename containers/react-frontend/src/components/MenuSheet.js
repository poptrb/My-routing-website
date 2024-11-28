import {useRef, useState} from 'react';
import { Sheet } from 'react-modal-sheet';

import { TripInfo} from './TripInfo'

export const MenuSheet = (props) => {

  const [open, setOpen] = useState(true);
  const ref = useRef();
  const snapTo = (i) => ref.current?.snapTo(i);
  return (
    <>
      <Sheet
        ref={ref}
        isOpen={open}
        onClose={() => snapTo(1)}
        snapPoints={[0.25,0.05]}
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

