import * as React from 'react';

import {MapProvider} from 'react-map-gl';


import { MapView, UserLocation } from './map'
import { Controls } from './map-controls'


export default function App() {
  return (
  <MapProvider>
    <Controls />
    <UserLocation />
  </MapProvider>
  )

}

// const root = createRoot(document.body.appendChild(document.createElement('div')));
// root.render(<Root />);
