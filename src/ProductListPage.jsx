import React from 'react';
import { useParams } from 'react-router-dom';
import useProductApi from './ProductApi';
import Customer from './Customer';

function ProductListPage({ searchTerm }) {
  const { storeName,  } = useParams();
  const { allProducts, loading, error } = useProductApi();

  const filteredProducts = allProducts.filter(product => {
    const lowerTitle = product.title.toLowerCase();
    const lowerQuery = searchTerm ? searchTerm.toLowerCase() : '';
    const titleWords = lowerTitle.split(' ');
    return lowerTitle.startsWith(lowerQuery) || titleWords.some(word => word.startsWith(lowerQuery));
  }).sort((a, b) => {
    const lowerTitleA = a.title.toLowerCase();
    const lowerTitleB = b.title.toLowerCase();
    const lowerQuery = searchTerm ? searchTerm.toLowerCase() : '';

    const indexA = lowerTitleA.startsWith(lowerQuery) ? 0 : lowerTitleA.indexOf(` ${lowerQuery}`);
    const indexB = lowerTitleB.startsWith(lowerQuery) ? 0 : lowerTitleB.indexOf(` ${lowerQuery}`);

    if (indexA === 0 && indexB !== 0) return -1;
    if (indexA !== 0 && indexB === 0) return 1;

    return indexA - indexB;
  });

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error loading products: {error}</p>;
  }

  return (
    <div className="mt-4">
      <h2>Products for {storeName?.replace(/-/g, ' ')} matching "{searchTerm}"</h2>
      <Customer products={filteredProducts} />
    </div>
  );
}

export default ProductListPage;