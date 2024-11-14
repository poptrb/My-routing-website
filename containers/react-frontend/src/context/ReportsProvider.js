import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

import useBackend from '../hooks/useBackend'

const ExternalContext = createContext();

export const ExternalProvider = ({ children }) => {
  const [reportGeoJSON, setReportGeoJSON] = useState([]);
  const backend = useBackend();

  const data = useRef([])
  const fetchReports = useCallback(async () => {
    await backend.get("/reports_latest")
      .then((response) => {
        data.current = response.data
      })
      .catch((err) => {
        console.log(err)
      })


    if (data.current) {
     const features = data.current.map((item) => ({
       type: 'Feature',
       geometry: {
         type: 'Point',
         coordinates: [item.location.lat, item.location.long]
       }
     }));

     setReportGeoJSON({
       type: 'FeatureCollection',
       features: features
     })
    }
 }, [backend]);

 useEffect(() => {
   fetchReports();
 }, [fetchReports]);

 return (
   <ExternalContext.Provider value={reportGeoJSON}>
     {children}
   </ExternalContext.Provider>
 );
};

export const useExternalContext = () => useContext(ExternalContext);

