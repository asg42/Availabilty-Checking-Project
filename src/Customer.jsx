import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const Customer = ({ products }) => {
  console.log("products prop in Customer:", products);
  if (!products || products.length === 0) {
    return <p>Please search for products to view details.</p>;
  }

  return (
    <div className="container">
      <h2>Search Results</h2>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map((product) => (
          <div key={product.id} className="col">
            <div className="card h-100" style={{ maxWidth: '300px', margin: '0 auto' }}>
              <img
                src={product.images && product.images[0]}
                className="card-img-top"
                alt={product.title}
                style={{ height: '200px', objectFit: 'contain', width: '100%' }}
              />
              <div className="card-body">
                <h5 className="card-title">{product.title}</h5>
                <p className="card-text">{product.description}</p>
                <p className="card-text">Price: ${product.price}</p> {/* Changed from $ to $ */}
                <p className="card-text">Stock: {product.stock}</p>
                <p className="card-text">Rating: {product.rating}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customer;