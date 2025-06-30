// frontend/availability-app/src/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx'; // Ensure this path is correct
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min'; // If you use Bootstrap's JS components

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const goToCustomer = () => {
    navigate('/customer/stores');
  };

  const goToAdmin = () => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin/dashboard'); // If admin is logged in, go to dashboard
    } else {
      navigate('/admin/login'); // Otherwise, go to the login page
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <h2>Welcome to Check 'n' Go</h2>
          {/* Original welcome text from your image reference or previous code */}
          <span>Going to buy at a store? What if they're ou of stock?
            Don't waste your time without knowing what they have!
            Use Check 'n' Go to see their stock at the comfort of your home!
          </span>
          <p className="lead mt-3">Are you a customer or an administrator?</p>
          <div className="d-grid gap-2"> {/* Changed gap back to 2 if that was the original */}
            <button className="btn btn-primary btn-lg" onClick={goToCustomer}>
              Customer
            </button>
            <button className="btn btn-secondary btn-lg" onClick={goToAdmin}>
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
