import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import visibleIcon from '../public/images/visible.png';
import invisibleIcon from '../public/images/invisible.png';
import { checkCredentials } from './UsersApi';

function Admin({ onLoginSuccess }) {
  const [usernameEmail, setUsernameEmail] = useState('');
  const [password, setPassword] = useState(null);
  const [loginStatus, setLoginStatus] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleUsernameEmailChange = (event) => {
    setUsernameEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    const isValid = await checkCredentials(usernameEmail, password);
    if (isValid) {
      setLoginStatus("Correct");
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } else {
      setLoginStatus("Incorrect");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (document.activeElement === document.getElementById('usernameEmail')) {
        document.getElementById('password')?.focus();
      } else if (document.activeElement === document.getElementById('password') && password !== null) {
        handleLogin();
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <h2 className="text-center mb-4">Admin Login</h2>
          <div className="mb-3">
            <label htmlFor="usernameEmail" className="form-label">Username/Email</label>
            <input
              type="text"
              className="form-control"
              id="usernameEmail"
              value={usernameEmail}
              onChange={handleUsernameEmailChange}
              onKeyDown={handleKeyDown}
              style={{ width: 'calc(100% + 2.5rem)' }}
            />
          </div>
          <div className="mb-3 position-relative">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="row g-0 align-items-center">
              <div className="col" style={{ position: 'relative' }}>
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  className="form-control"
                  id="password"
                  value={password || ''}
                  onChange={handlePasswordChange}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="btn btn-sm position-absolute end-0 top-50 translate-middle-y"
                  onClick={togglePasswordVisibility}
                  style={{
                    padding: 0,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '2.2rem',
                    width: '2.2rem',
                  }}
                >
                  <img
                    src={passwordVisible ? visibleIcon : invisibleIcon}
                    alt={passwordVisible ? 'Hide Password' : 'Show Password'}
                    style={{ height: '1.4rem', width: '1.4rem' }}
                  />
                </button>
              </div>
              <div className="col-auto">
                {/* Empty div for spacing control */}
              </div>
            </div>
          </div>
          <div className="d-grid">
            <button className="btn btn-primary" onClick={handleLogin}>
              Enter
            </button>
          </div>

          {loginStatus && (
            <div className="mt-3 text-center" style={{color:'red'}}>
              <strong>Login Status:</strong> {loginStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;