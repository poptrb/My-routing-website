// Copied from https://github.com/visgl/react-map-gl/blob/7.0-release/src/utils/apply-react-style.ts
import * as React from 'react';
import {forwardRef, useImperativeHandle, useRef, useEffect} from 'react';
import {useControl} from 'react-map-gl';
import {MyGeolocateControl} from './GeolocationControl'
// This is a simplified version of
// https://github.com/facebook/react/blob/4131af3e4bf52f3a003537ec95a1655147c81270/src/renderers/dom/shared/CSSPropertyOperations.js#L62
const unitlessNumber = /box|flex|grid|column|lineHeight|fontWeight|opacity|order|tabSize|zIndex/;

export function applyReactStyle(element, styles) {
  if (!element || !styles) {
    return;
  }
  const style = element.style;

  for (const key in styles) {
    const value = styles[key];
    if (Number.isFinite(value) && !unitlessNumber.test(key)) {
      style[key] = `${value}px`;
    } else {
      style[key] = value;
    }
  }
}


const GeolocateControl = forwardRef((props, ref) => {
  const thisRef = useRef({props});

  const ctrl = useControl(
    () => {
      const gc = new MyGeolocateControl(props);

      // Hack: fix GeolocateControl reuse
      // When using React strict mode, the component is mounted twice.
      // GeolocateControl's UI creation is asynchronous. Removing and adding it back causes the UI to be initialized twice.
      const setupUI = gc._setupUI;
      gc._setupUI = args => {
        if (!gc._container.hasChildNodes()) {
          setupUI(args);
        }
      };

      gc.on('geolocate', e => {
        thisRef.current.props.onGeolocate?.(e);
      });
      gc.on('error', e => {
        thisRef.current.props.onError?.(e);
      });
      gc.on('outofmaxbounds', e => {
        thisRef.current.props.onOutOfMaxBounds?.(e);
      });
      gc.on('trackuserlocationstart', e => {
        thisRef.current.props.onTrackUserLocationStart?.(e);
      });
      gc.on('trackuserlocationend', e => {
        thisRef.current.props.onTrackUserLocationEnd?.(e);
      });

      return gc;
    },
    {position: props.position}
  );

  thisRef.current.props = props;

  useImperativeHandle(
    ref,
    () => ({
      trigger: () => ctrl.trigger()
    }),
    [ctrl]
  );

  useEffect(() => {
    // @ts-ignore
    applyReactStyle(ctrl._container, props.style);
  }, [props.style, ctrl]);

  return null;
});

GeolocateControl.displayName = 'GeolocateControl';

export default React.memo(GeolocateControl);
