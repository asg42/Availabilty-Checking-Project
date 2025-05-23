import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import StoreSearch from './StoreSearch';
import ProductSearchPage from './ProductSearchPage';
import ProductListPage from './ProductListPage';
import TopBar from './components/TopBar';
import useStoreApi from './StoreApi';
import Home from './Home';
import Admin from './Admin';
import AdminStoreSearch from './AdminStoreSearch';
import useProductApi from './ProductApi';
import Billing from './Billing';

import { useAuth } from './contexts/AuthContext.jsx';

function App() {
  const { stores, loading: loadingStores, error: errorStores } = useStoreApi();
  const { allProducts, loading: loadingProducts, error: errorProducts, handleSearch } = useProductApi();
  const [selectedStore, setSelectedStore] = useState('');
  const websiteName = "Check 'n' Go";
  const logo = "/images/logo.png";

  const handleStoreSelect = (storeName) => {
    setSelectedStore(storeName);
  };

  const handleProductSearch = (searchTerm) => {
    handleSearch(searchTerm);
  };

  if (loadingStores || loadingProducts) {
    return <div>Loading stores...</div>;
  }

  if (errorStores) {
    return <div>Error loading stores: {errorStores}</div>;
  }

  if (errorProducts) {
    return <div>Error loading products: {errorProducts}</div>;
  }

  return (
    <Router>
      <AppContent
        websiteName={websiteName}
        logo={logo}
        stores={stores}
        onStoreSelect={handleStoreSelect}
        onSearch={handleProductSearch}
        allProducts={allProducts}
        selectedStore={selectedStore}
      />
    </Router>
  );
}

function AppContent({ websiteName, logo, stores, onStoreSelect, onSearch, allProducts, selectedStore }) {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <>
      <TopBar
        websiteName={websiteName}
        logo={logo}
        stores={stores}
        onStoreSelect={onStoreSelect}
        onSearch={onSearch}
        allProducts={allProducts}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={logout}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />

        {/* ADMIN LOGIN/REDIRECT ROUTE - MODIFIED */}
        <Route
          path="/admin"
          element={
            isAuthenticated && isAdmin ? (
              <Navigate to="/admin/stores" replace />
            ) : (
              <Admin />
            )
          }
        />

        {/* PROTECTED ADMIN ROUTES */}
        {/* AdminStoreSearch */}
        <Route
          path="/admin/stores"
          element={
            isAuthenticated && isAdmin ? (
              <AdminStoreSearch websiteName={websiteName} logo={logo} stores={stores} />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
        {/* Billing */}
        <Route
          path="/admin/stores/:storeName/billing"
          element={
            isAuthenticated && isAdmin ? (
              <Billing />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        {/* CUSTOMER ROUTES (UNCHANGED PROTECTION) */}
        <Route
          path="/customer/stores"
          element={
            <>
              <div className="container mt-3">
                <StoreSearch onStoreSelect={onStoreSelect} />
              </div>
            </>
          }
        />
        <Route
          path="/customer/stores/:storeName/search"
          element={
            <>
              <div className="container mt-3">
                <ProductSearchPage selectedStore={selectedStore} />
              </div>
            </>
          }
        />
        <Route
          path="/customer/stores/:storeName/products/:searchTerm"
          element={
            <>
              <div className="container mt-3">
                <ProductListPage selectedStore={selectedStore} />
              </div>
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
