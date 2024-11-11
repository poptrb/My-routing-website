import {createContext, useContext, useCallback, useState} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  //useState(localStorage.getItem("jwt_token"));

  const updateAuth = (newAuth) => {
    setAuth(newAuth)
  };

  return (
    <AuthContext.Provider
      value={{
        auth: auth,
        setAuth: setAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => {
  const auth = useContext(AuthContext);
  return auth;
};

export default useAuthContext
