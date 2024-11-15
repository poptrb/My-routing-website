import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { privateRoute } from "../api/backend";
import useAuth from "../context/AuthProvider";

// import useRefreshToken from "./useRefreshToken";

const useBackend = () => {
    // const refresh = useRefreshToken();
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    // const requestIntercept = privateRoute.interceptors.request.use(
    //   config => {
    //     if (!config.headers['Authorization']) {
    //       config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
    //     }

    //     return config;
    //   }, (error) => Promise.reject(error)
    // );

    const responseIntercept = privateRoute.interceptors.response.use(
      response => response,
      async (error) => {
        console.log(error)
        if (error?.response?.status === 401) {
          //const newAccessToken = await refresh();
          navigate('/login', { replace: true})
        }
        return Promise.reject(error);
      }
    );

      return () => {
          // privateRoute.interceptors.request.eject(requestIntercept);
          privateRoute.interceptors.response.eject(responseIntercept);
      }
  }, [auth, navigate]) //refresh])

  return privateRoute;
}

export default useBackend;
