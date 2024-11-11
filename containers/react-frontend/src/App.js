import React from 'react';
import {BrowserRouter} from 'react-router-dom'

import {Router} from './Router';
import {AuthProvider} from './context/AuthProvider'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router/>
      </AuthProvider>
    </BrowserRouter>
  )
}
