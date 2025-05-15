import { useState, useEffect } from 'react';

const useStoreApi = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('https://dummyjson.com/c/92d7-cab9-494e-9a13');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStores(data.stores);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error };
};

export default useStoreApi;