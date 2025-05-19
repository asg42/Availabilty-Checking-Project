import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function Home() {
  const navigate = useNavigate();

  const goToCustomer = () => {
    navigate('/customer/stores');
  };

  const goToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          <h2>Welcome to Check 'n' Go</h2>
          <p className="lead">Are you a customer or an administrator?</p>
          <div className="d-grid gap-2">
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