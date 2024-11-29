import React from 'react';
import {BrowserRouter} from 'react-router-dom'
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'

import {Router} from './Router';
import {AuthProvider} from './context/AuthProvider'

const queryClient = new QueryClient()

export default function App() {
  return (
  <>
    <head>
      <base href="/"/>
    </head>
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Router/>:
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  </>
  )
}
