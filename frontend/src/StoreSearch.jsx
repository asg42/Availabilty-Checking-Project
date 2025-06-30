// frontend/availability-app/src/pages/StoreSearch.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Props received from App.jsx: stores (allProducts, loadingProducts, errorProducts are no longer needed here)
function StoreSearch({ stores }) {
  const navigate = useNavigate(); // Hook for navigation

  if (!stores || stores.length === 0) {
    return <p className="text-center mt-5">No stores available at the moment.</p>;
  }

  const formatStoreNameForUrl = (name) => {
    return name.toLowerCase().replace(/ /g, '-');
  };

  const handleStoreCardClick = (storeName) => {
    const formattedName = formatStoreNameForUrl(storeName);
    // Navigate to a page that will display all products (and have its own search bar)
    // This page will be ProductListPage, which needs to know which "store context" it's for.
    // We'll pass the store name; ProductListPage can use it for display/context
    // but will initially show all products since data isn't store-specific yet.
    navigate(`/customer/stores/${formattedName}/products`);
  };

  return (
    <div className="container mt-4">
      <div className="text-center mb-4">
        <h2>Our Stores</h2>
        <p className="lead">Select a store to view available products.</p>
      </div>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4"> {/* Responsive grid */}
        {stores.map(store => (
          <div key={store._id || store.id} className="col">
            <div
              className="card h-100 text-center shadow-sm store-card" // Added class for potential styling
              onClick={() => handleStoreCardClick(store.name)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s ease-in-out' }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {/* You could add a store logo/image here if available */}
              {/* <img src={store.logoUrl || 'https://via.placeholder.com/300x150.png?text='+store.name} className="card-img-top" alt={`${store.name} logo`} style={{maxHeight: '150px', objectFit: 'contain', marginTop: '10px'}}/> */}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mt-2">{store.name}</h5>
                {store.location && ( // Changed from store.locations
                  <p className="card-text text-muted small">
                    <i className="bi bi-geo-alt-fill me-1"></i> {/* Bootstrap Icon */}
                    {store.location}
                  </p>
                )}
                {/* Removed openTime/closeTime as it wasn't in your Store model */}
                {/* If you add other store details (e.g., a short description), display them here */}
                <div className="mt-auto">
                    <button
                        className="btn btn-primary btn-sm w-75" // Button is now part of card body
                    >
                        View Products
                    </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StoreSearch;
