import {useEffect, useCallback, useRef} from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom';

import axios from './api/backend';
import useAuth from './context/AuthProvider.js'

const PrivateRoutes = () => {
  const { auth } = useAuth();
  const location = useLocation();

  const loggedInUser = useRef(false);

  const getOwnUser = useCallback(() => {
    axios.get('/users/me')
      .then((response) => {
        // setLoggedIn(true)
        loggedInUser.current = true
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    getOwnUser()
  }, [getOwnUser]);

  return (
    auth?.user || loggedInUser
      ? <Outlet />
      : <Navigate
          to='/login'
          state={{from: location}}
          replace
        />
  );
};

export default PrivateRoutes;
