// frontend/availability-app/src/ProductApi.jsx
import { useState, useEffect } from 'react';

const useProductApi = () => {
  const [productInfo, setProductInfo] = useState([]); // Holds all products from MongoDB
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/products', {
          method: 'GET',
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProductInfo(data); // data should be an array of product objects with _id
      } catch (err) {
        console.error("ProductApi.jsx: Error fetching all products:", err); // Keep for debugging actual fetch errors
        setError(err.message);
        setProductInfo([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []); // Empty dependency array means this runs once on mount

  // Function to allow components to update productInfo (e.g., after an edit/create/delete by AdminStock)
  const updateProductInfo = (newProductInfo) => {
    // This could receive the full new list or a function to update the existing list
    if (typeof newProductInfo === 'function') {
        setProductInfo(newProductInfo); // Allows functional updates like setProductInfo(prev => ...)
    } else {
        setProductInfo(newProductInfo); // Replaces the list
    }
  };

  return {
    productInfo, // This is the array of all products from the backend
    loading,
    error,
    setProductInfo: updateProductInfo, // Provide a way to update the global list
    // Removed: searchTermGlobal, searchResultsGlobal, selectedProductGlobal,
    // Removed: handleSearchGlobal, handleProductSelectGlobal
  };
};

export default useProductApi;
