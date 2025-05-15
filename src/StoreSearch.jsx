// StoreSearch.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStoreApi from './StoreApi';
import 'bootstrap/dist/css/bootstrap.min.css';

function StoreSearch() {
  const { stores, loading, error } = useStoreApi();
  const [selectedStore, setSelectedStore] = useState('');
  const navigate = useNavigate();

  const handleStoreChange = (event) => {
    setSelectedStore(event.target.value);
  };

  const handleSearchNavigation = () => {
    if (selectedStore) {
      const formattedStoreName = selectedStore.toLowerCase().replace(/ /g, '-');
      console.log('Navigating to:', `/customer/stores/${formattedStoreName}/search`); // Changed URL generation
      navigate(`/customer/stores/${formattedStoreName}/search`); // Changed URL generation
    }
  };

  if (loading) {
    return <p>Loading store list...</p>;
  }

  if (error) {
    return <p>Error loading store list: {error}</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Select a Store</h2>
      <select className="form-select mb-3" value={selectedStore} onChange={handleStoreChange}>
        <option value="">-- Select a Store --</option>
        {stores.map((store) => (
          <option key={store.id} value={store.name}>
            {store.name}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" onClick={handleSearchNavigation} disabled={!selectedStore}>
        Go to Search
      </button>
    </div>
  );
}

export default StoreSearch;