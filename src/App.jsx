import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StoreSearch from './StoreSearch';
import ProductSearchPage from './ProductSearchPage';
import ProductListPage from './ProductListPage';

function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (query) => {
    setSearchTerm(query);
  };

  return (
    <Router>
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/customer/stores" />} />
          <Route path="/customer/stores" element={<StoreSearch />} />
          <Route
            path="/customer/stores/:storeName/search"
            element={<ProductSearchPage onSearch={handleSearch} searchTerm={searchTerm} />}
          />
          <Route
            path="/customer/stores/:storeName/products/:searchTerm"
            element={<ProductListPage searchTerm={searchTerm} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;