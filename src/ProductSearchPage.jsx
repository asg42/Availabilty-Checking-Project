import React from 'react';
import { useParams } from 'react-router-dom';

function ProductSearchPage() {
  const { storeName } = useParams();

  return (
    <div className="container mt-4">
      <h2>Search Products for {storeName?.replace(/-/g, ' ')}</h2>
      {/* The search input is now in the TopBar */}
    </div>
  );
}

export default ProductSearchPage;