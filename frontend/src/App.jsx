import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components
import TopBar from './components/TopBar.jsx';
import AdminStock from './pages/AdminStock.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Home from './Home.jsx';
import Admin from './Admin.jsx';
import AdminStoreSearch from './AdminStoreSearch.jsx';
import Billing from './Billing.jsx';
import StoreSearch from './StoreSearch.jsx';
import ProductListPage from './ProductListPage.jsx';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import useProductApi from './ProductApi.jsx';
import { fetchAllStores } from './StoreApi.jsx';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const logoPath = '/images/logo.png';

function AppContent() {
  const location = useLocation();
  const { isAuthenticated, isAdmin, login, logout } = useAuth();

  const {
    productInfo,
    loading: loadingProducts,
    error: productError,
    setProductInfo
  } = useProductApi();

  const [stores, setStores] = React.useState([]);
  const [loadingStores, setLoadingStores] = React.useState(true);
  const [storeError, setStoreError] = React.useState(null);

  React.useEffect(() => {
    const getStores = async () => {
      setLoadingStores(true);
      setStoreError(null);
      try {
        const storesData = await fetchAllStores();
        setStores(storesData || []);
      } catch (err) {
        setStoreError(err.message);
        setStores([]);
      } finally {
        setLoadingStores(false);
      }
    };
    getStores();
  }, []);

  return (
    <>
      <TopBar websiteName="Check 'n' Go" logo={logoPath} />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          {/* Customer Routes */}
          <Route path="/customer/stores" element={<StoreSearch stores={stores} />} />
          <Route
            path="/customer/stores/:storeName/products"
            element={<ProductListPage allProducts={productInfo} loading={loadingProducts} error={productError} />}
          />
          <Route
            path="/customer/stores/:storeName/products/:searchTerm"
            element={<ProductListPage allProducts={productInfo} loading={loadingProducts} error={productError} />}
          />
          <Route path="/customer" element={<StoreSearch stores={stores} />} />
          {/* Admin Login Route */}
          <Route
            path="/admin/login"
            element={
              isAuthenticated && isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Admin onLogin={login} />
              )
            }
          />
          {/* Protected Admin Routes */}
          {isAuthenticated && isAdmin ? (
            <>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route
                path="/admin/stock"
                element={
                  <AdminStock
                    stores={stores}
                    allProductsGlobal={productInfo}
                    setGlobalProducts={setProductInfo}
                  />
                }
              />
              <Route path="/admin/billing" element={<AdminStoreSearch stores={stores} websiteName="Check 'n' Go" logo={logoPath} />} />
              <Route path="/admin/stores/:storeName/billing" element={<Billing stores={stores} />} />
            </>
          ) : (
            <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />
          )}
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (<AuthProvider><AppContent /></AuthProvider>);
}

export default App;
