// frontend/availability-app/src/pages/AdminStock.jsx

import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min'; // Only if you use Bootstrap JS components
import axios from 'axios';

const PRODUCTS_PER_PAGE = 20;

function AdminStock({ stores, allProductsGlobal, setGlobalProducts }) {
  const [selectedStoreName, setSelectedStoreName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filteredAndSortedProducts, setFilteredAndSortedProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [editedFields, setEditedFields] = useState({ images: [], thumbnail: '', tags: [] }); 
  
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);

  const searchInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let productsToProcess = allProductsGlobal || [];
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      productsToProcess = productsToProcess
        .filter(product => product.title && product.title.toLowerCase().includes(lowerSearchTerm))
        .sort((a, b) => {
          const titleA = (a.title || '').toLowerCase();
          const titleB = (b.title || '').toLowerCase();
          const indexA = titleA.indexOf(lowerSearchTerm);
          const indexB = titleB.indexOf(lowerSearchTerm);
          if (indexA === -1 && indexB !== -1) return 1;
          if (indexA !== -1 && indexB === -1) return -1;
          if (indexA === -1 && indexB === -1) return titleA.localeCompare(titleB);
          if (indexA !== indexB) return indexA - indexB;
          return titleA.localeCompare(titleB);
        });
    } else {
      productsToProcess.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    setFilteredAndSortedProducts(productsToProcess);
    setCurrentPage(1);
  }, [allProductsGlobal, searchTerm]);

  useEffect(() => {
    const calculatedTotalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);
    setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
    if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) setCurrentPage(calculatedTotalPages);
    else if (currentPage < 1) setCurrentPage(1);
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    setDisplayedProducts(filteredAndSortedProducts.slice(startIndex, endIndex));
  }, [filteredAndSortedProducts, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) { setCurrentPage(newPage); window.scrollTo(0, 0); }
  };
  const handleStoreSelect = (event) => { setSelectedStoreName(event.target.value); setSearchTerm(''); };
  const handleSearchInputChange = (event) => { setSearchTerm(event.target.value); };

  const resetImageStates = () => {
    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setSelectedImageFiles([]);
    setNewImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddModal = () => {
    setModalMode('add');
    const maxId = allProductsGlobal.length > 0 ? Math.max(...allProductsGlobal.map(p => p.id || 0).filter(id => typeof id === 'number')) : 0;
    const nextNumericId = maxId + 1;
    setEditedFields({
      id: nextNumericId, title: '', price: '', stock: '', description: '', category: '',
      rating: 0, tags: [], brand: '', sku: '', weight: 0,
      dimensions: { width: '', height: '', depth: '' },
      warrantyInformation: '', shippingInformation: '', availabilityStatus: 'In Stock',
      reviews: [], returnPolicy: '', minimumOrderQuantity: 1,
      meta: { barcode: '', qrCode: '' }, 
      images: [], thumbnail: ''
    });
    resetImageStates();
    setCurrentProduct(null);
    setIsModalOpen(true);
    setError(null); setModalError(null);
  };

  const openEditModal = (product) => {
    if (!product || !product._id) { alert("Error: Invalid product data."); return; }
    setModalMode('edit');
    setCurrentProduct(product);
    setEditedFields({
      ...product,
      dimensions: { ...(product.dimensions || { width: '', height: '', depth: '' }) },
      meta: { ...(product.meta || { barcode: '', qrCode: '' }) },
      tags: Array.isArray(product.tags) ? [...product.tags] : [],
      images: Array.isArray(product.images) ? [...product.images] : [], 
      reviews: Array.isArray(product.reviews) ? product.reviews.map(r => ({...r})) : [],
      thumbnail: product.thumbnail || '',
    });
    resetImageStates();
    setIsModalOpen(true);
    setError(null); setModalError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false); setCurrentProduct(null); 
    setEditedFields({ images: [], thumbnail: '', tags: [] }); 
    resetImageStates(); 
    setError(null); setModalError(null);
  };

  const handleModalInputChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    if (type === 'number') {
      processedValue = value === '' ? '' : (name === 'price' || name === 'weight' || name.startsWith('dimensions.') ? parseFloat(value) : parseInt(value, 10));
       if (isNaN(processedValue) && value !== '') processedValue = ''; // Keep empty if invalid, or revert/warn
    } else if (name === 'tags' || name === 'imagesManual') { // 'imagesManual' for the textarea
      processedValue = value.split(',').map(item => item.trim()).filter(item => item);
      if (name === 'imagesManual') {
          setEditedFields(prev => ({ ...prev, images: processedValue }));
          return;
      }
    } else if (name.startsWith('dimensions.')) {
        const dimensionKey = name.split('.')[1];
        const numValue = value === '' ? '' : parseFloat(value);
        setEditedFields(prev => ({ ...prev, dimensions: { ...(prev.dimensions || {}), [dimensionKey]: isNaN(numValue) && value !=='' ? prev.dimensions[dimensionKey] : numValue }}));
        return;
    } else if (name.startsWith('meta.')) {
        const metaKey = name.split('.')[1];
        setEditedFields(prev => ({ ...prev, meta: { ...(prev.meta || {}), [metaKey]: value }}));
        return;
    }
    setEditedFields(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setModalError(null);
    const currentStagedCount = selectedImageFiles.length;
    const newFilesToStage = [];
    const newPreviewsToStage = [];
    let localErrorMessages = [];

    files.forEach(file => {
      if ((currentStagedCount + newFilesToStage.length) >= 10) {
        localErrorMessages.push(`Cannot stage more than 10 new images.`); return;
      }
      if (file.size > 5 * 1024 * 1024) {
        localErrorMessages.push(`${file.name} is too large (max 5MB).`); return;
      }
      if (!file.type.startsWith('image/')) {
        localErrorMessages.push(`${file.name} is not an image file.`); return;
      }
      newFilesToStage.push(file);
      newPreviewsToStage.push(URL.createObjectURL(file));
    });
    if (localErrorMessages.length > 0) setModalError(localErrorMessages.join('\n'));
    setSelectedImageFiles(prev => [...prev, ...newFilesToStage]);
    setNewImagePreviews(prev => [...prev, ...newPreviewsToStage]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleRemoveNewImagePreview = (indexToRemove) => {
    URL.revokeObjectURL(newImagePreviews[indexToRemove]); 
    setSelectedImageFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setNewImagePreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleDeleteExistingImage = async (imageUrlToDelete, isThumbnail) => {
    if (!imageUrlToDelete || isLoading) return;
    setModalError(null); setIsLoading(true);
    try {
      const filename = imageUrlToDelete.substring(imageUrlToDelete.lastIndexOf('/') + 1);
      if (!filename || filename.includes('..') || filename.includes('/')) throw new Error("Invalid filename for deletion.");
      await axios.delete(`http://localhost:8000/api/upload/product-image/${filename}`);
      if (isThumbnail) {
        setEditedFields(prev => ({ ...prev, thumbnail: '' }));
      } else {
        setEditedFields(prev => ({ ...prev, images: prev.images.filter(imgUrl => imgUrl !== imageUrlToDelete) }));
      }
    } catch (err) {
      console.error("Error deleting existing image:", err);
      setModalError(`Failed to delete image: ${err.response?.data?.message || err.message}`);
    } finally { setIsLoading(false); }
  };

  const handleFormSubmit = async () => {
    if (!editedFields.title || editedFields.price === '' || editedFields.stock === '') {
        setModalError("Title, Price, and Stock are required fields."); return;
    }
    // Further validation for numeric fields
    if (isNaN(parseFloat(String(editedFields.price)))) { setModalError("Price must be a valid number."); return; }
    if (isNaN(parseInt(String(editedFields.stock), 10))) { setModalError("Stock must be a valid integer."); return; }
    if (modalMode === 'add' && (editedFields.id === '' || isNaN(parseInt(String(editedFields.id))))) {
        setModalError("A valid numeric ID is required for new products."); return;
    }


    setIsLoading(true); setModalError(null);
    let uploadedImageUrls = [];

    try {
      if (selectedImageFiles.length > 0) {
        const formData = new FormData();
        selectedImageFiles.forEach(file => formData.append('productImages', file));
        try {
          const uploadRes = await axios.post('http://localhost:8000/api/upload/product-images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data && Array.isArray(uploadRes.data.imageUrls)) {
            uploadedImageUrls = uploadRes.data.imageUrls;
          } else { throw new Error(uploadRes.data?.message || 'Image upload response invalid.'); }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setModalError(`Image upload failed: ${uploadError.response?.data?.message || uploadError.message}`);
          setIsLoading(false); return;
        }
      }

      let finalThumbnailUrl = editedFields.thumbnail || '';
      let finalImagesArray = (Array.isArray(editedFields.images) ? [...editedFields.images] : [])
                                .filter(url => url && typeof url === 'string'); // Start with valid existing images

      // Integrate newly uploaded URLs
      uploadedImageUrls.forEach(newUrl => {
        if (!finalThumbnailUrl) {
          finalThumbnailUrl = newUrl;
        } else if (newUrl !== finalThumbnailUrl && !finalImagesArray.includes(newUrl)) {
          finalImagesArray.push(newUrl);
        }
      });
      // If thumbnail was deleted and new images are available, promote one
      if (!finalThumbnailUrl && finalImagesArray.length > 0) {
          finalThumbnailUrl = finalImagesArray.shift();
      }


      const payload = {
        ...editedFields,
        thumbnail: finalThumbnailUrl,
        images: finalImagesArray.filter((url, index, self) => url && self.indexOf(url) === index), // Unique, valid URLs
        id: modalMode === 'add' ? parseInt(String(editedFields.id), 10) : currentProduct.id,
        price: parseFloat(String(editedFields.price)) || 0, 
        stock: parseInt(String(editedFields.stock), 10) || 0,
        rating: parseFloat(String(editedFields.rating)) || 0,
        weight: parseFloat(String(editedFields.weight)) || 0,
        minimumOrderQuantity: parseInt(String(editedFields.minimumOrderQuantity), 10) || 1,
        dimensions: {
            width: parseFloat(String(editedFields.dimensions?.width)) || 0,
            height: parseFloat(String(editedFields.dimensions?.height)) || 0,
            depth: parseFloat(String(editedFields.dimensions?.depth)) || 0,
        },
        tags: Array.isArray(editedFields.tags) ? editedFields.tags : [],
      };
      delete payload._id; 
      delete payload.currentProduct;
      // Ensure images array is an array even if empty, and thumbnail is string or empty string
      payload.images = Array.isArray(payload.images) ? payload.images : [];
      payload.thumbnail = payload.thumbnail || '';


      const requestUrl = modalMode === 'add' ? `http://localhost:8000/api/products` : `http://localhost:8000/api/products/${currentProduct._id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const productResponse = await fetch(requestUrl, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const responseData = await productResponse.json();
      if (!productResponse.ok) { throw new Error(responseData.message || `Product save error! Status: ${productResponse.status}`); }

      if (modalMode === 'edit') { setGlobalProducts(prev => prev.map(p => p._id === responseData._id ? responseData : p)); }
      else { setGlobalProducts(prev => [...prev, responseData]); }
      closeModal();
    } catch (err) {
      console.error('Error during form submission:', err);
      setModalError(err.message || 'An unexpected error occurred.');
    } finally { setIsLoading(false); }
  };
  
  useEffect(() => {
    return () => { newImagePreviews.forEach(url => URL.revokeObjectURL(url)); };
  }, [newImagePreviews]);

  const openDeleteConfirmModal = (product) => { setProductToDelete(product); setIsConfirmDeleteModalOpen(true); setModalError(null);};
  const closeDeleteConfirmModal = () => { setProductToDelete(null); setIsConfirmDeleteModalOpen(false); };
  const handleDeleteConfirmed = async () => {
    if (!productToDelete || !productToDelete._id) return;
    setIsLoading(true); setModalError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/products/${productToDelete._id}`, { method: 'DELETE' });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.message || `HTTP error! Status: ${response.status}`);
      setGlobalProducts(prev => prev.filter(p => p._id !== productToDelete._id));
      closeDeleteConfirmModal();
    } catch (err) { setModalError(err.message || "Failed to delete product."); } finally { setIsLoading(false); }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Admin Product Management</h1>
      {/* Search and Store Select UI */}
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="adminStockStoreSelect" className="form-label">Store Context (Display Only):</label>
          <select className="form-select" id="adminStockStoreSelect" value={selectedStoreName} onChange={handleStoreSelect}>
            <option value="">All Products</option>
            {stores && stores.map((store) => (<option key={store._id || store.id} value={store.name}>{store.name}</option>))}
          </select>
        </div>
        <div className="col-md-6">
          <label htmlFor="productSearchAdmin" className="form-label">Search Products by Title:</label>
          <input type="text" className="form-control" id="productSearchAdmin" ref={searchInputRef} value={searchTerm} onChange={handleSearchInputChange} placeholder="Enter product title..." />
        </div>
      </div>
      <button className="btn btn-success mb-3" onClick={openAddModal}>Add New Product</button>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Product Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead><tr><th>Title</th><th>Price</th><th>Stock</th><th>Category</th><th>Brand</th><th>Actions</th></tr></thead>
          <tbody>
            {displayedProducts.length > 0 ? displayedProducts.map(product => (
              <tr key={product._id}>
                <td>{product.title}</td><td>${product.price ? product.price.toFixed(2) : 'N/A'}</td><td>{product.stock}</td><td>{product.category}</td><td>{product.brand}</td>
                <td>
                  <button onClick={() => openEditModal(product)} className="btn btn-sm btn-primary me-2" disabled={isLoading}>Edit</button>
                  <button onClick={() => openDeleteConfirmModal(product)} className="btn btn-sm btn-danger" disabled={isLoading}>Delete</button>
                </td>
              </tr>)) : (<tr><td colSpan="6" className="text-center">{searchTerm ? 'No products match your search.' : 'No products available.'}</td></tr>)}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredAndSortedProducts.length > PRODUCTS_PER_PAGE && (
        <nav aria-label="Product pagination" className="mt-4 d-flex justify-content-center">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            {[...Array(totalPages).keys()].map(num => {
                const pageNum = num + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (<li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}><button className="page-link" onClick={() => handlePageChange(pageNum)}>{pageNum}</button></li>);
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                } return null;
            })}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalMode === 'add' ? 'Add New Product' : `Edit Product: ${currentProduct?.title || editedFields.title || ''}`}</h5>
                <button type="button" className="btn-close" onClick={closeModal} disabled={isLoading}></button>
              </div>
              <div className="modal-body">
                {modalError && <div className="alert alert-danger" role="alert">{modalError}</div>}
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* All your existing form fields for product details */}
                   <div className="row">
                    {modalMode === 'add' && (
                         <div className="col-md-3 mb-3">
                            <label htmlFor="idNumeric" className="form-label">Numeric ID*</label>
                            <input type="number" className="form-control" id="idNumeric" name="id" value={editedFields.id ?? ''} onChange={handleModalInputChange} required disabled={isLoading} />
                         </div>
                    )}
                    <div className={modalMode === 'add' ? "col-md-9 mb-3" : "col-md-12 mb-3"}>
                      <label htmlFor="title" className="form-label">Title*</label>
                      <input type="text" className="form-control" id="title" name="title" value={editedFields.title || ''} onChange={handleModalInputChange} required disabled={isLoading} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea className="form-control" id="description" name="description" rows="3" value={editedFields.description || ''} onChange={handleModalInputChange} disabled={isLoading}></textarea>
                  </div>
                  {/* ... Other fields like price, stock, category etc. ... */}

                  {/* --- Image Management Section --- */}
                  <fieldset className="mb-3 p-3 border rounded">
                    <legend className="w-auto px-2 h6">Product Images</legend>
                    {editedFields.thumbnail && (
                      <div className="mb-3 pb-2 border-bottom">
                        <h6>Current Thumbnail:</h6>
                        <div className="d-inline-block position-relative me-2" style={{border: '1px solid #ddd', padding: '2px'}}>
                          <img src={editedFields.thumbnail} alt="Thumbnail" style={{ width: '120px', height: '120px', objectFit: 'cover' }}/>
                          <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onClick={() => handleDeleteExistingImage(editedFields.thumbnail, true)} disabled={isLoading} title="Delete Thumbnail">&times;</button>
                        </div>
                      </div>
                    )}
                    {(editedFields.images && editedFields.images.length > 0) && (
                      <div className="mb-3 pb-2 border-bottom">
                        <h6>Additional Images:</h6>
                        {editedFields.images.map((imgUrl, index) => (
                          imgUrl && 
                          <div key={`existing-${index}-${imgUrl.substring(imgUrl.lastIndexOf('/')+1)}`} className="d-inline-block position-relative me-2 mb-2" style={{border: '1px solid #ddd', padding: '2px'}}>
                            <img src={imgUrl} alt={`Existing ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }}/>
                            <button type="button" className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" style={{lineHeight: '1', padding: '0.1rem 0.35rem'}} onClick={() => handleDeleteExistingImage(imgUrl, false)} disabled={isLoading} title="Delete Image">&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {newImagePreviews.length > 0 && (
                      <div className="mb-3">
                        <h6>New Images Staged for Upload:</h6>
                        {newImagePreviews.map((previewUrl, index) => (
                          <div key={`new-${index}`} className="d-inline-block position-relative me-2 mb-2" style={{border: '1px solid #0d6efd', padding: '2px'}}>
                            <img src={previewUrl} alt={`New ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }}/>
                            <button type="button" className="btn btn-sm btn-warning position-absolute top-0 end-0 m-1" style={{lineHeight: '1', padding: '0.1rem 0.35rem'}} onClick={() => handleRemoveNewImagePreview(index)} disabled={isLoading} title="Remove Staged Image">&times;</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mb-2">
                      <label htmlFor="productImageUpload" className="form-label">
                        {editedFields.thumbnail || (editedFields.images && editedFields.images.length > 0) || newImagePreviews.length > 0 ? 'Upload More Image(s):' : 'Upload Image(s):'}
                      </label>
                      <input type="file" multiple className="form-control" id="productImageUpload" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleImageFilesChange} disabled={isLoading} ref={fileInputRef}/>
                    </div>
                    {selectedImageFiles.length > 0 && (
                         <button type="button" className="btn btn-sm btn-outline-secondary" onClick={resetImageStates} disabled={isLoading}>
                            Clear All Staged Images ({selectedImageFiles.length})
                        </button>
                    )}
                  </fieldset>
                  {/* --- End Image Management Section --- */}
                  
                  <div className="mb-3">
                    <label htmlFor="tags" className="form-label">Tags (comma-separated)</label>
                    <input type="text" className="form-control" id="tags" name="tags" value={Array.isArray(editedFields.tags) ? editedFields.tags.join(', ') : ''} onChange={handleModalInputChange} disabled={isLoading} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="imagesManual" className="form-label">Manually Add/Edit Other Image URLs (comma-separated):</label>
                    <textarea className="form-control" id="imagesManual" name="imagesManual" rows="2" value={Array.isArray(editedFields.images) ? editedFields.images.join(', ') : ''} onChange={handleModalInputChange} disabled={isLoading} placeholder="e.g., http://server/uploads/img1.jpg"/>
                    <small className="form-text text-muted">Use this for direct URL entry. Uploaded images are handled above.</small>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={isLoading}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleFormSubmit} disabled={isLoading}>
                  {isLoading ? 'Saving...' : (modalMode === 'add' ? 'Create Product' : 'Save Changes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmDeleteModalOpen && productToDelete && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Confirm Deletion</h5><button type="button" className="btn-close" onClick={closeDeleteConfirmModal} disabled={isLoading}></button></div>
              <div className="modal-body">Are you sure you want to delete "{productToDelete.title}"? This action cannot be undone.{modalError && <div className="alert alert-danger mt-2">{modalError}</div>}</div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteConfirmModal} disabled={isLoading}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteConfirmed} disabled={isLoading}>{isLoading ? 'Deleting...' : 'Delete Product'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStock;
