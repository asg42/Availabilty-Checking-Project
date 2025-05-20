import React, { useState, useEffect } from 'react'; // Import useEffect
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import visibleIcon from '../public/images/visible.png';
import invisibleIcon from '../public/images/invisible.png';
import { checkCredentials } from './UsersApi'; // Keep your existing UsersApi check
import { useAuth } from './contexts/AuthContext.jsx'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Remove the onLoginSuccess prop as we'll use context directly
function Admin() {
  const [usernameEmail, setUsernameEmail] = useState('');
  const [password, setPassword] = useState(''); // Initialize with empty string, not null
  const [loginStatus, setLoginStatus] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { isAuthenticated, isAdmin, login } = useAuth(); // Get auth state and login function
  const navigate = useNavigate();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/stores', { replace: true }); // Redirect to protected admin area
    }
  }, [isAuthenticated, isAdmin, navigate]); // Dependencies for useEffect

  const handleUsernameEmailChange = (event) => {
    setUsernameEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    // Clear previous status
    setLoginStatus(null);
    if (!usernameEmail || !password) {
      setLoginStatus("Please enter both username/email and password.");
      return;
    }

    // Call your existing checkCredentials, assuming it returns true/false
    const isValid = await checkCredentials(usernameEmail, password);

    if (isValid) {
      // Assuming checkCredentials also gives you the role (or you can derive it)
      // For now, hardcode 'admin' for simplicity, but in a real app,
      // your backend would return the user's role.
      // Replace 'some_token' with a real token from your backend if available.
      login('some_token_from_backend', 'admin'); // Call AuthContext's login function
      setLoginStatus("Correct");
      // The useEffect above will handle navigation, no need to navigate here
    } else {
      setLoginStatus("Incorrect");
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (document.activeElement === document.getElementById('usernameEmail')) {
        document.getElementById('password')?.focus();
      } else if (document.activeElement === document.getElementById('password')) { // password is now guaranteed not null
        handleLogin();
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // If authenticated as admin, don't render the login form; the useEffect redirects.
  if (isAuthenticated && isAdmin) {
    return null; // Or a loading spinner if navigation takes a moment
  }

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
                  value={password} // Now correctly initialized as empty string
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