import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SearchInput from './SearchInput';
import useProductApi from './ProductApi';

function ProductSearchPage({ onSearch, searchTerm }) {
  const params = useParams();
  const { storeName } = params;
  const navigate = useNavigate();
  const { allProducts } = useProductApi();

  const handleSearchInternal = (query) => {
    onSearch(query); // Update searchTerm in App.jsx
    navigate(`/customer/stores/${storeName}/products/${query}`);
  };

  return (
    <div>
      <h2>Search Products for {storeName?.replace(/-/g, ' ')}</h2>
      <SearchInput onSearch={handleSearchInternal} products={allProducts} />
    </div>
  );
}

export default ProductSearchPage;