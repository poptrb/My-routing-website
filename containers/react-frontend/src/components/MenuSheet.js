import { Sheet } from 'react-modal-sheet';
import { useState, useRef} from 'react';

export const MenuSheet = (props) => {

  const [isOpen, setOpen] = useState(true);
  const ref = useRef();
  const snapTo = (i) => ref.current?.snapTo(i);

  return (
    <>

      {/* Opens to 400 since initial index is 1 */}
      <Sheet
        ref={ref}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
        snapPoints={[0.2, 0.15]}
        initialSnap={0}
        onSnap={(snapIndex) =>
          console.log('> Current snap point index:', snapIndex)
        }
      >
        <Sheet.Container>
          <Sheet.Content>
            <button onClick={() => snapTo(0)}>Snap to index 0</button>
            <button onClick={() => snapTo(1)}>Snap to index 1</button>
            <Sheet.Scroller>
              <div
                className="geocoder"
                id="geocoder-container"
              >
              </div>
            </Sheet.Scroller>
          </Sheet.Content>
        </Sheet.Container>
      </Sheet>
    </>
  );
};

