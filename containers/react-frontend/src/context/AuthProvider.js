import {createContext, useContext, useState} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(localStorage.getItem('auth') || {});
  //useState(localStorage.getItem("jwt_token"));

  const updateAuth = (newAuth) => {
    for (const key in newAuth) {
      localStorage.setItem(key, newAuth[key]);
    }

    localStorage.setItem('auth', auth)
    setAuth(newAuth)
  };

  return (
    <AuthContext.Provider
      value={{
        auth: auth,
        setAuth: updateAuth
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
