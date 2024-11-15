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
      <section>
        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
        <h1>Sign In</h1>
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>
            <input
                type="text"
                id="username"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                value={user}
                required
            />

            <label htmlFor="password">Password:</label>
            <input
                type="password"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
            />
            <button>Sign In</button>
        </form>
        <p>
            Don't have an account?
            <br />
            <span className="line">
              <Link to="/register">Sign Up</Link>
            </span>
        </p>
      </section>
    )
}

export {Login}
