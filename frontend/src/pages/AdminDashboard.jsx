// frontend/availability-app/src/pages/AdminDashboard.jsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mt-5">
      <h1>Admin Dashboard</h1>

      <div className="row"> {/* Start a Bootstrap row */}
        <div className="col-md-6"> {/* Column for Admin Details - takes up half width on medium screens and up */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Admin Details</h3>
            </div>
            <div className="card-body">
              {user ? (
                <div>
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Phone:</strong> {user.phone}</p>
                  <p><strong>Department:</strong> {user.company?.department}</p>
                  <p><strong>Role (Company Title):</strong> {user.company?.title}</p>
                  <p><strong>Overall Role:</strong> {user.role}</p>
                </div>
              ) : (
                <p>User information not available. Please log in.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6"> {/* Column for Actions - takes up half width on medium screens and up */}
          <div className="card">
            <div className="card-header">
              <h3>Actions</h3>
            </div>
            <div className="card-body">
              <Link to="/admin/stock" className="btn btn-primary me-2">Manage Products</Link>
              <Link to="/admin/billing" className="btn btn-secondary">Billing Section</Link>
            </div>
          </div>
        </div>
      </div> {/* End the Bootstrap row */}
    </div>
  );
}

export default AdminDashboard;