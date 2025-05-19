import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import StoreSearch from './StoreSearch';
import ProductSearchPage from './ProductSearchPage';
import ProductListPage from './ProductListPage';
import TopBar from './components/TopBar';
import useStoreApi from './StoreApi';
import Home from './Home';
import Admin from './Admin';
import AdminStoreSearch from './AdminStoreSearch';
import useProductApi from './ProductApi';

function App() {
  const { stores, loading: loadingStores, error: errorStores } = useStoreApi();
  const { allProducts, loading: loadingProducts, error: errorProducts } = useProductApi();
  const [selectedStore, setSelectedStore] = useState('');
  const websiteName = "Check 'n' Go";
  const logo = "/images/logo.png";

  const handleStoreSelect = (storeName) => {
    setSelectedStore(storeName);
  };

  const handleProductSearch = (searchTerm) => {
    // Handled in TopBar
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

  const handleAdminLoginSuccess = () => {
    console.log("handleAdminLoginSuccess called");
    navigate('/admin/stores');
    console.log("navigate('/admin/stores') called from handler");
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route
        path="/admin"
        element={
          <>
            <TopBar websiteName={websiteName} logo={logo} />
            <Admin onLoginSuccess={handleAdminLoginSuccess} />
          </>
        }
      />
      <Route
        path="/admin/stores"
        element={<AdminStoreSearch websiteName={websiteName} logo={logo} stores={stores} />}
      />
      <Route
        path="/customer/stores"
        element={
          <>
            <TopBar
              websiteName={websiteName}
              logo={logo}
              stores={stores}
              onStoreSelect={onStoreSelect}
              onSearch={onSearch}
              allProducts={allProducts}
            />
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
            <TopBar
              websiteName={websiteName}
              logo={logo}
              stores={stores}
              onStoreSelect={onStoreSelect}
              onSearch={onSearch}
              allProducts={allProducts}
            />
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
            <TopBar
              websiteName={websiteName}
              logo={logo}
              stores={stores}
              onStoreSelect={onStoreSelect}
              onSearch={onSearch}
              allProducts={allProducts}
            />
            <div className="container mt-3">
              <ProductListPage selectedStore={selectedStore} />
            </div>
          </>
        }
      />
    </Routes>
  );
}

export default App;