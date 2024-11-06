import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ExternalContext = createContext();

export const ExternalProvider = ({ children }) => {
 const [reportGeoJSON, setReportGeoJSON] = useState([]);

 const fetchReports = useCallback(async () => {
   const response = await fetch("http://localhost:8001");
   const data = await response.json();

   const features = data.map((item) => ({
     type: 'Feature',
     geometry: {
       type: 'Point',
       coordinates: [item.location.lat, item.location.long]
     }
   }));

   setReportGeoJSON({
     type: 'FeatureCollection',
     features: features
   });
 }, []);

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

