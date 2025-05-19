import React, { useState } from 'react';
import TopBar from './components/TopBar';

function AdminStoreSearch({ websiteName, logo, stores }) {
  const [selectedAdminStore, setSelectedAdminStore] = useState('');

  const handleAdminStoreSelect = (storeName) => {
    setSelectedAdminStore(storeName);
  };

  return (
    <div>
      <TopBar
        websiteName={websiteName}
        logo={logo}
        stores={stores}
        onStoreSelect={handleAdminStoreSelect}
      />
      <div className="container mt-3">
        <h2>Admin Store Selection</h2>
        {selectedAdminStore && <p>Selected Store: {selectedAdminStore}</p>}
        {!selectedAdminStore && <p>No store selected.</p>}
      </div>
    </div>
  );
}

export default AdminStoreSearch;