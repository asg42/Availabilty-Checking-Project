import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function TopBar({ websiteName, logo, stores, onStoreSelect, onSearch, allProducts }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isCustomerRoute = location.pathname.startsWith('/customer');
  const isStoreAdminRoute = location.pathname === '/admin/stores';
  const [selectedStore, setSelectedStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

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
    if (searchTerm && selectedStore && allProducts && allProducts.length > 0) {
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
  }, [searchTerm, selectedStore, allProducts]);

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
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.title);
    setShowSuggestions(false);
    handleSearchSubmit();
  };

  const goToHome = () => {
    navigate('/home');
    setSelectedStore('');
    setSearchTerm('');
    if (onStoreSelect) {
      onStoreSelect('');
    }
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
            {(isCustomerRoute || isStoreAdminRoute) && stores && (
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
                  className="list-group position-absolute mt-1"
                  style={{
                    zIndex: 1000,
                    width: 'calc(100% - 85px)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {suggestions.map((product) => (
                    <li
                      key={product.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSuggestionClick(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default TopBar;