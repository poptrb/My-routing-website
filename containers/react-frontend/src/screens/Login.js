import {useRef, useState, useEffect} from 'react';
import useAuthContext from '../context/AuthProvider';
import {Link, useNavigate, useLocation} from 'react-router-dom';

import privateRoute from '../api/backend';

const Login = () => {
    const auth = useAuthContext();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/explore"

    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {

        const loginData = {
          'username': user,
          'password': pwd,
          'grant_type': 'password',
        }

        let loginFormData = new FormData();
        for (const key in loginData) {
          loginFormData.append(key, loginData[key]);
        }

        const response = await privateRoute.post('/auth/jwt/login', {
          username: user,
          password: pwd
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
        });

        console.log(JSON.stringify(response?.data));
        //console.log(JSON.stringify(response));


        auth.setAuth({ user });
        setUser('');
        setPwd('');

        navigate(from, { replace: true })

      } catch (err) {
          if (!err?.response) {
              setErrMsg('No error response');
              console.log(err)
          } else if (err.response?.status === 400) {
              setErrMsg('Bad credentials');
          } else if (err.response?.status === 401) {
              setErrMsg('Credentials do not match any account');
          } else {
              setErrMsg('Unable to login');
              console.log(err)
          }
          errRef.current.focus();
      }
    }

    return (
        <div className="user-actions-container">
        <div className="login-container">
          <h2 className="form-title">Sign In</h2>
          <p className="separator">
          { errMsg ? errMsg : null }
          </p>
          <form
            onSubmit={handleSubmit}
            className="login-form">
              <div className="input-wrapper">
                <input
                  type="email"
                  id="username"
                  ref={userRef}
                  autoComplete="on"
                  onChange={(e) => setUser(e.target.value)}
                  value={user}
                  placeholder="email@something.com"
                  required
                />
                <i
                  className="material-symbols-outlined">
                  contact_mail
                </i>
              </div>

              <div className="input-wrapper">
                <input
                    type="password"
                    id="password"
                    autoComplete="on"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required/>
                <i
                  className="material-symbols-outlined">
                  password
                </i>
              </div>
                <button>
                  Sign in
                </button>
        </form>

        <p className="signup-text">
            Create an account instead:
            <br />
            <span className="line">
              <Link to="/register">Sign Up</Link>
            </span>
          </p>
      </div>
     </div>
    )
}

export {Login}
