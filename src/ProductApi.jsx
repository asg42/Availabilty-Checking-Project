import { useState, useEffect } from 'react';

const useProductApi = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/products', {
          method: 'GET', // Explicitly specify the GET method
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (query) => {
    setSearchTerm(query);
    if (query) {
      const filtered = allProducts.filter(product => {
        const lowerTitle = product.title.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const titleWords = lowerTitle.split(' ');
        return lowerTitle.startsWith(lowerQuery) || titleWords.some(word => word.startsWith(lowerQuery));
      });

      const sortedResults = filtered.sort((a, b) => {
        const lowerTitleA = a.title.toLowerCase();
        const lowerTitleB = b.title.toLowerCase();
        const lowerQuery = query.toLowerCase();

        const indexA = lowerTitleA.startsWith(lowerQuery) ? 0 : lowerTitleA.indexOf(` ${lowerQuery}`);
        const indexB = lowerTitleB.startsWith(lowerQuery) ? 0 : lowerTitleB.indexOf(` ${lowerQuery}`);

        if (indexA === 0 && indexB !== 0) return -1;
        if (indexA !== 0 && indexB === 0) return 1;

        return indexA - indexB;
      });

      setSearchResults(sortedResults);
      setSelectedProduct(null);
    } else {
      setSearchResults([]);
      setSelectedProduct(null);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearchResults([]);
    setSearchTerm(product.title);
  };

  return {
    allProducts,
    loading,
    error,
    searchTerm,
    searchResults,
    selectedProduct,
    handleSearch,
    handleProductSelect,
  };
};

export default useProductApi;