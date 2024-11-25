import { useRef, useState, useEffect } from "react";
import axios from '../api/backend';
import { Link } from "react-router-dom";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}@[A-z0-9-_]{1,30}\.[A-z]{2,10}$/;
// const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const REGISTER_URL = 'https://localhost/api/auth/register';

const Register = () => {
    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [inviteCode, setInviteCode] = useState('');

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user])

    useEffect(() => {
        setValidMatch(pwd === matchPwd && pwd !== '');
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if button enabled with JS hack
        const v1 = USER_REGEX.test(user);
        // const v2 = PWD_REGEX.test(pwd);
        if (!v1) {
            setErrMsg("Invalid Entry");
            return;
        }
        try {
            const response = await axios.post(REGISTER_URL,
              {
                email: user,
                password: pwd,
                token_cleartext: inviteCode
              },
              {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            // TODO: remove console.logs before deployment
            console.log(JSON.stringify(response?.data));
            //console.log(JSON.stringify(response))
            setSuccess(true);
            //clear state and controlled inputs
            setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    return (
      <>
        {
          success
          ? <section>
              <h2>Success!</h2>
              <p>
                  <a href="/login">Sign In</a>
              </p>
            </section>
          :

          <div className="user-actions-container">
            <div className="login-container">
              <h2 className="form-title">Register</h2>
              <p className="separator">
                <span ref={errRef}>
                  { errMsg ? errMsg : null }
                </span>
              </p>
              <form
                onSubmit={handleSubmit}
                className="login-form">
                  <div className="input-wrapper">
                    <input
                        type="text"
                        id="invite-code"
                        autoComplete="off"
                        onChange={(e) => setInviteCode(e.target.value)}
                        value={inviteCode}
                        required
                        placeholder={'Invite code'}
                    />
                    <i
                      className="material-symbols-outlined">
                      key
                    </i>
                  </div>
                  <div className="input-wrapper">
                    <input
                      id="username"
                      ref={userRef}
                      type="email"
                      aria-invalid={validName ? "false" : "true"}
                      autoComplete="off"
                      onBlur={() => setUserFocus(false)}
                      onChange={(e) => setUser(e.target.value)}
                      onFocus={() => setUserFocus(true)}
                      placeholder="email@something.com"
                      required
                      value={user}
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
                      onChange={(e) => setPwd(e.target.value)}
                      value={pwd}
                      required
                      onFocus={() => setPwdFocus(true)}
                      onBlur={() => setPwdFocus(false)}
                      placeholder={'New password'}
                    />
                    <i
                      className="material-symbols-outlined">
                      password
                    </i>
                  </div>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="confirm_pwd"
                      onChange={(e) => setMatchPwd(e.target.value)}
                      value={matchPwd}
                      required
                      aria-invalid={validMatch ? "false" : "true"}
                      onFocus={() => setMatchFocus(true)}
                      onBlur={() => setMatchFocus(false)}
                      placeholder={'Confirm password'}
                  />
                  <i
                    className="material-symbols-outlined">
                    password
                  </i>
                </div>
                <button
                  disabled={
                    !validName || !validMatch ? true : false
                  }>
                    Sign Up
                </button>
              </form>
              <p>
                  Already have an account?<br />
                  <span className="line">
                      <Link to="/login">Sign In</Link>
                  </span>
              </p>
            </div>
          </div>
        }
      </>
    )
}

export {Register}
