import {useMemo, useCallback} from 'react';
import {useQuery} from 'react-query';
import axios from 'axios';

export const useReverseGeocoderQuery = (state) => {

  const coords = {
    lat: state.evt?.lngLat?.lat,
    lon: state.evt?.lngLat?.lng
  };

  const params = new URLSearchParams({
    longitude: coords.lon,
    latitude: coords.lat,
    access_token: process.env.REACT_APP_MAPBOX_TOKEN,
  }).toString();

  const url =
    'https://api.mapbox.com/search/geocode/v6/reverse?' +
    params;

  const query = useQuery({
    queryKey: ['reverse-geocode', state.coords],
    queryFn: async () => {
      const response = await axios.get(
        url, {}, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/text'
          }
        }
      );
      return response;
    },
    throwOnError: true,
    select: useCallback((data) => data.data, []),
    enabled: state.enabled
  });

  return {
    ...query,
    reverseGeocoderData: useMemo(() => query.data, [query.data]),
  };
};
