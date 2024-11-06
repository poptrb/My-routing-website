import * as React from 'react';

import {MapProvider} from 'react-map-gl';

import { ExternalProvider } from './ReportsProvider'
import { CustomMap } from './Map'
import { Controls } from './map-controls'


export default function App() {
  return (
  <ExternalProvider>
    <MapProvider>
        <Controls />
        <CustomMap/>
    </MapProvider>
  </ExternalProvider>
  )

}
