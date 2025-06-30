// frontend/availability-app/src/components/TopBar.jsx

import React from 'react'; // Removed useState, useEffect, useRef as they are no longer needed here
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx'; // Ensure path is correct

// Props stores, onStoreSelect, allProducts are no longer directly used by TopBar for its own UI elements like search/store-select
function TopBar({ websiteName, logo }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { isAuthenticated, isAdmin, logout } = useAuth();

  // Handler for navigating to home (Logo and Home link)
  const goToHome = () => {
    // e.preventDefault(); // No longer needed if Link component handles primary navigation
    navigate('/');
    // onStoreSelect(''); // This prop is no longer passed or used by TopBar for its own state
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center" onClick={goToHome}>
          {logo && <img src={logo} alt="Logo" className="me-2" style={{ height: '30px' }} />}
          {websiteName}
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topBarNav" aria-controls="topBarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="topBarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/" className="nav-link" onClick={goToHome}>Home</Link>
            </li>
            {/* Store selector and product search removed from TopBar */}
          </ul>

          {/* Admin Logout Button - remains on the right */}
          {isAdminRoute && isAuthenticated && isAdmin && (
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0"> {/* ms-auto pushes to the right */}
              <li className="nav-item">
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}

export default TopBar;
