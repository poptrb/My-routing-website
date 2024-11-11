import { privateRoute } from "../api/axios";
import { useEffect } from "react";
// import useRefreshToken from "./useRefreshToken";
import useAuth from "./useAuth";

const useBackend = () => {
    // const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {

        const requestIntercept = privateRoute.interceptors.request.use(
            config => {
                console.log(`intercepted request with no Authorization header`);
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        const responseIntercept = privateRoute.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config;
                // assert JWT token is out of date because of 403
                if (error?.response?.status === 403 && !prevRequest?.sent) {
                    prevRequest.sent = true;
                    //const newAccessToken = await refresh();
                    prevRequest.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                    return privateRoute(prevRequest);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            privateRoute.interceptors.request.eject(requestIntercept);
            privateRoute.interceptors.response.eject(responseIntercept);
        }
    }, [auth]) //refresh])

    return privateRoute;
}

export default useBackend;
