// frontend/availability-app/src/pages/ProductListPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Customer from './Customer.jsx'; // Corrected path based on earlier discussion

const PRODUCTS_PER_PAGE_CUSTOMER = 20;

// Props from App.jsx: allProducts (which is productInfo), loading, error
function ProductListPage({ allProducts, loading, error }) {
  const { storeName, searchTerm: initialSearchTermFromUrl } = useParams();

  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState([]); // Full list after filter/sort
  const [displayedProducts, setDisplayedProducts] = useState([]); // Products for current page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [pageTitle, setPageTitle] = useState('');
  const [localSearchTerm, setLocalSearchTerm] = useState(initialSearchTermFromUrl || '');

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (initialSearchTermFromUrl && localSearchTerm !== initialSearchTermFromUrl) {
      setLocalSearchTerm(initialSearchTermFromUrl);
    }
  }, [initialSearchTermFromUrl, localSearchTerm]);

  // Effect for filtering and sorting based on allProducts and localSearchTerm
  useEffect(() => {
    let title = 'Available Products';
    if (storeName) {
      title = `Products in ${storeName.replace(/-/g, ' ')}`;
    }
    setPageTitle(title);

    if (allProducts && allProducts.length > 0) {
      let productsToProcess = [...allProducts];

      if (localSearchTerm) {
        const lowerQuery = localSearchTerm.toLowerCase();
        productsToProcess = productsToProcess
          .filter(product => {
            const lowerTitle = (product.title || '').toLowerCase();
            const lowerCategory = (product.category || '').toLowerCase();
            const lowerBrand = (product.brand || '').toLowerCase();
            const lowerDescription = (product.description || '').toLowerCase();
            return lowerTitle.includes(lowerQuery) ||
                   lowerCategory.includes(lowerQuery) ||
                   lowerBrand.includes(lowerQuery) ||
                   lowerDescription.includes(lowerQuery);
          })
          .sort((a, b) => {
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            const categoryA = (a.category || '').toLowerCase();
            const categoryB = (b.category || '').toLowerCase();
            const brandA = (a.brand || '').toLowerCase();
            const brandB = (b.brand || '').toLowerCase();
            let indexA = titleA.indexOf(lowerQuery);
            let indexB = titleB.indexOf(lowerQuery);
            if (indexA === -1) indexA = categoryA.indexOf(lowerQuery);
            if (indexB === -1) indexB = categoryB.indexOf(lowerQuery);
            if (indexA === -1) indexA = brandA.indexOf(lowerQuery);
            if (indexB === -1) indexB = brandB.indexOf(lowerQuery);
            if (indexA === -1 && indexB !== -1) return 1;
            if (indexA !== -1 && indexB === -1) return -1;
            if (indexA === -1 && indexB === -1) return titleA.localeCompare(titleB);
            if (indexA !== indexB) return indexA - indexB;
            const aInTitle = titleA.includes(lowerQuery);
            const bInTitle = titleB.includes(lowerQuery);
            if (aInTitle && !bInTitle) return -1;
            if (!aInTitle && bInTitle) return 1;
            return titleA.localeCompare(titleB);
          });
      } else {
        productsToProcess.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      }
      setFilteredAndSortedProducts(productsToProcess);
      setCurrentPage(1); // Reset to first page on new filter/sort
    } else {
      setFilteredAndSortedProducts([]); // Clear if no base products
      setDisplayedProducts([]);
    }
  }, [allProducts, storeName, localSearchTerm]);

  // Effect for pagination
  useEffect(() => {
    const calculatedTotalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE_CUSTOMER);
    setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);

    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentPage(calculatedTotalPages);
    } else if (currentPage < 1) {
        setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE_CUSTOMER;
    const endIndex = startIndex + PRODUCTS_PER_PAGE_CUSTOMER;
    setDisplayedProducts(filteredAndSortedProducts.slice(startIndex, endIndex));
  }, [filteredAndSortedProducts, currentPage]);


  const handleLocalSearchChange = (event) => {
    setLocalSearchTerm(event.target.value);
    // setCurrentPage(1); // Reset to page 1 immediately on search change is also an option
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };

  if (loading && !allProducts.length) {
    return <div className="container mt-4 text-center"><p>Loading products...</p></div>;
  }

  if (error) {
    return <div className="container mt-4 alert alert-danger"><p>Error loading products: {error}</p></div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h2>{pageTitle}</h2>
        <div className="ms-md-auto" style={{ minWidth: '300px', maxWidth: '400px' }}>
           <input
            type="search"
            className="form-control"
            placeholder="Search within these products..."
            value={localSearchTerm}
            onChange={handleLocalSearchChange}
            ref={searchInputRef}
            aria-label="Search products"
          />
        </div>
      </div>

      {displayedProducts.length > 0 ? (
        <Customer products={displayedProducts} />
      ) : (
        <p className="mt-3 text-center">
          {localSearchTerm ? `No products found matching "${localSearchTerm}".` : "No products currently available for this selection."}
        </p>
      )}

      {/* Pagination Controls */}
      {filteredAndSortedProducts.length > PRODUCTS_PER_PAGE_CUSTOMER && (
        <nav aria-label="Product pagination" className="mt-4 d-flex justify-content-center">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            {/* Page numbers (simplified logic similar to AdminStock) */}
            {[...Array(totalPages).keys()].map(num => {
                const pageNum = num + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)) {
                    return (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(pageNum)}>{pageNum}</button>
                        </li>
                    );
                } else if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                    return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                }
                return null;
            })}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default ProductListPage;
