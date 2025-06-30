import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminStoreSearch({ websiteName, logo, stores }) {
  const [selectedAdminStore, setSelectedAdminStore] = useState('');
  const navigate = useNavigate();

  const handleAdminStoreSelect = (event) => {
    const storeName = event.target.value;
    setSelectedAdminStore(storeName);
    if (storeName) {
      const formattedStoreName = storeName.toLowerCase().replace(/ /g, '-');
      navigate(`/admin/stores/${formattedStoreName}/billing`);
    }
  };

  return (
    <div>
      {/* TopBar will likely be rendered by a parent component */}
      <div className="container mt-4">
        <h2>Admin Store Selection</h2>
        <div className="mb-3">
          <label htmlFor="adminStoreSelect" className="form-label">Select a Store:</label>
          <select
            className="form-select"
            id="adminStoreSelect"
            value={selectedAdminStore}
            onChange={handleAdminStoreSelect}
          >
            <option value="">Select a store</option>
            {stores && stores.map((store) => (
              <option key={store.id} value={store.name}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
        {selectedAdminStore && <p>Selected Store: {selectedAdminStore}</p>}
      </div>
    </div>
  );
}

export default AdminStoreSearch;