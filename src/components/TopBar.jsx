import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

function TopBar({ websiteName, logo, stores, onStoreSelect, onSearch, allProducts }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith('/customer');
  const isAdminRoute = location.pathname.startsWith('/admin');

  const [selectedStore, setSelectedStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const { isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
        resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isCustomerRoute && searchTerm && selectedStore && allProducts && allProducts.length > 0) {
      const lowerQuery = searchTerm.toLowerCase();
      const storeProducts = allProducts.filter(product => {
        return true;
      });

      const filteredSuggestions = storeProducts
        .filter(product => product.title.toLowerCase().includes(lowerQuery))
        .sort((a, b) => a.title.localeCompare(b.title));

      setSuggestions(filteredSuggestions.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, selectedStore, allProducts, isCustomerRoute]);

  const handleStoreChange = (event) => {
    setSelectedStore(event.target.value);
    if (onStoreSelect) {
      onStoreSelect(event.target.value);
    }
    setSearchTerm('');
  };

  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    if (selectedStore && searchTerm) {
      const formattedStoreName = selectedStore.toLowerCase().replace(/ /g, '-');
      navigate(`/customer/stores/${formattedStoreName}/products/${searchTerm}`);
      setShowSuggestions(false); // Ensure suggestions are hidden after any search submit
    }
  };

  // MODIFIED handleSuggestionClick
  const handleSuggestionClick = (product) => {
    const formattedStoreName = selectedStore.toLowerCase().replace(/ /g, '-');
    // Directly navigate to the product list page with the selected product's title
    navigate(`/customer/stores/${formattedStoreName}/products/${product.title}`);
    setSearchTerm(product.title); // Update the input field with the chosen suggestion
    setShowSuggestions(false); // Immediately hide suggestions
  };

  const goToHome = () => {
    navigate('/home');
    setSelectedStore('');
    setSearchTerm('');
    if (onStoreSelect) {
      onStoreSelect('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" href="#" onClick={goToHome}>
          {logo && <img src={logo} alt="Logo" className="me-2" style={{ height: '30px' }} />}
          {websiteName}
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#topBarNav" aria-controls="topBarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="topBarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="#" onClick={goToHome}>Home</a>
            </li>
            {isCustomerRoute && stores && (
              <li className="nav-item">
                <select
                  className="form-select"
                  value={selectedStore}
                  onChange={handleStoreChange}
                  aria-label="Select Store"
                >
                  <option value="">Select a Store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.name}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </li>
            )}
          </ul>
          {isCustomerRoute && stores && (
            <div className="d-flex position-relative">
              <input
                ref={inputRef}
                className="form-control me-2"
                type="search"
                placeholder="Search products"
                aria-label="Search"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onKeyDown={(event) => event.key === 'Enter' && handleSearchSubmit()}
              />
              <button
                className="btn btn-outline-success"
                onClick={handleSearchSubmit}
                disabled={!selectedStore || !searchTerm}
              >
                Search
              </button>
              {showSuggestions && suggestions.length > 0 && (
                <ul
                  ref={resultsRef}
                  className="list-group position-absolute"
                  style={{
                    zIndex: 1000,
                    width: 'calc(100% - 85px)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    top: '100%',
                    left: '0',
                  }}
                >
                  {suggestions.map((product) => (
                    <li
                      key={product.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSuggestionClick(product)} // This calls the modified function
                      style={{ cursor: 'pointer' }}
                    >
                      {product.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {isAdminRoute && isAuthenticated && isAdmin && (
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
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