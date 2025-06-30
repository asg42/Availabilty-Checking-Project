// frontend/availability-app/src/Customer.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Customer = ({ products }) => {
  if (!products || products.length === 0) {
    return <p className="text-center mt-3">No products to display at the moment.</p>;
  }

  const titleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="container py-3">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {products.map((product) => (
          <div key={product._id || product.id} className="col">
            <div className="card h-100 shadow-sm">
              <img
                src={product.thumbnail || (product.images && product.images[0]) || 'https://via.placeholder.com/300x200.png?text=No+Image'}
                className="card-img-top"
                alt={product.title || 'Product image'}
                style={{ height: '200px', objectFit: 'contain', paddingTop: '10px', paddingBottom: '10px' }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title" title={product.title}>
                  {(product.title || 'Untitled Product').length > 50 ? `${(product.title).substring(0, 47)}...` : product.title}
                </h5>
                <p className="card-text text-muted small flex-grow-1">
                  {(product.description || 'No description available.').length > 100 ? `${(product.description).substring(0, 97)}...` : product.description}
                </p>
                <div className="mt-auto">
                  <p className="card-text h5 mb-1">
                    ${product.price ? product.price.toFixed(2) : 'N/A'}
                  </p>
                  <p className="card-text small mb-1">
                    <strong>Stock:</strong> {product.stock !== undefined ? product.stock : 'N/A'}
                    {product.availabilityStatus && (
                      <span className={`badge ms-2 ${product.availabilityStatus === 'In Stock' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {product.availabilityStatus}
                      </span>
                    )}
                  </p>
                  {product.rating && (
                    <p className="card-text small mb-0">
                      <strong>Rating:</strong> {product.rating.toFixed(1)}/5
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customer;
