import useAuth from './context/AuthProvider.js'
import { Outlet, Navigate, useLocation } from 'react-router-dom';

const PrivateRoutes = () => {
  const { auth } = useAuth();
  const location = useLocation();

  // const jwt_token = localStorage.getItem('jwt_token');

  return (
    auth?.accessToken
      ? <Outlet />
      : <Navigate
          to='/login'
          state={{from: location}}
          replace
        />
  );
};

export default PrivateRoutes;
