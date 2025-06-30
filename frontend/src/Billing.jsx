// frontend/availability-app/src/Billing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // <<< IMPORT useParams
import './App.css'; // Your CSS import

function Billing({ stores }) { // 'stores' prop is now received

    const { storeName: storeNameFromUrl } = useParams(); // <<< GET storeName from URL parameter

    // Initialize selectedStoreName from URL parameter if available
    const [selectedStoreName, setSelectedStoreName] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [totalBill, setTotalBill] = useState(0);
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);
    const [billDetails, setBillDetails] = useState(null);
    const [formErrors, setFormErrors] = useState([]);
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    // <<< EFFECT TO SET SELECTED STORE FROM URL
    useEffect(() => {
        if (storeNameFromUrl) {
            // Convert URL parameter (e.g., 'store-one') back to original store name ('Store One')
            // This assumes your store names don't contain hyphens that would conflict.
            // If store names can have hyphens, you might need a more robust lookup
            // or pass the original store name differently.
            // For now, a simple replace and title case.
            const formattedStoreName = (storeNameFromUrl || '').replace(/-/g, ' ');
            const foundStore = stores && stores.find(s => s.name.toLowerCase() === formattedStoreName.toLowerCase());
            if (foundStore) {
                 setSelectedStoreName(foundStore.name); // Set to the exact name from the stores array
            } else if (stores && stores.length > 0 && !storeNameFromUrl && selectedStoreName === '') {
                // If no URL param and no store selected, maybe default to first store or leave empty
                // setSelectedStoreName(stores[0].name); // Optional: default to first store
            } else if (!foundStore && storeNameFromUrl) {
                console.warn(`Store "${formattedStoreName}" from URL not found in stores list.`);
                // setSelectedStoreName(''); // Or handle as error/default
            }
        } else if (stores && stores.length > 0 && selectedStoreName === '') {
             // If no URL param, and no store selected, and stores are loaded, you might default here or leave it
        }
    }, [storeNameFromUrl, stores]); // Re-run if URL param or stores list changes

    const handleStoreSelect = (event) => {
        const store = event.target.value;
        setSelectedStoreName(store);
        // IMPORTANT: If changing the store here should also change the URL,
        // you would need to use navigate() to update the /admin/stores/:newStoreName/billing path.
        // For now, this just changes local state. If this page is strictly for the URL-defined store,
        // this dropdown might be better as read-only or disabled.
        setSelectedProducts([]);
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target) &&
                resultsRef.current && !resultsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);

    const handlePrint = () => { window.print(); };

    const handleSearchInputChange = async (event) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        // Suggestions logic from your paste.txt remains largely the same
        // but ensure it uses selectedStoreName state correctly
        if (newSearchTerm.length > 0 && selectedStoreName) {
            try {
                // The fetch URL for products should ideally use the selectedStoreName
                // IF your backend /api/products supports filtering by a 'store' query parameter.
                // If products are not store-specific, then `&store=${selectedStoreName}` might not be needed
                // or the backend needs to handle it gracefully.
                const response = await fetch(`/api/products?search=${newSearchTerm}`);
                // If your backend filters by store:
                // const response = await fetch(`/api/products?search=${newSearchTerm}&store=${selectedStoreName}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    const filtered = data.filter(product =>
                        product.title.toLowerCase().includes(newSearchTerm.toLowerCase())
                    );
                    const lowerCaseSearchTerm = newSearchTerm.toLowerCase();
                    const sortedSuggestions = filtered.sort((a, b) => {
                        const titleA = a.title.toLowerCase();
                        const titleB = b.title.toLowerCase();
                        const aStartsWithSearch = titleA.startsWith(lowerCaseSearchTerm);
                        const bStartsWithSearch = titleB.startsWith(lowerCaseSearchTerm);
                        if (aStartsWithSearch && !bStartsWithSearch) return -1;
                        if (!aStartsWithSearch && bStartsWithSearch) return 1;
                        return titleA.localeCompare(titleB); // Simpler secondary sort
                    });
                    setSuggestions(sortedSuggestions);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Error fetching products for billing:", error);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        } else {
             setSuggestions([]);
             setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (product) => {
        setSearchTerm(product.title); // Keep search term for a moment for user to see
        setSuggestions([]);
        setShowSuggestions(false);
        handleAddProduct(product);
        // setSearchTerm(''); // Clear search term after adding product
    };

    const handleAddProduct = (product) => {
        const existingProduct = selectedProducts.find(p => p.id === product.id); // Assuming product.id is unique numeric ID
        if (existingProduct) {
            const newQuantity = existingProduct.quantity + 1;
            if (newQuantity <= product.stock) {
                 setSelectedProducts(selectedProducts.map(p => p.id === product.id ? { ...p, quantity: newQuantity } : p));
            } else { alert(`Cannot add more "${product.title}". Only ${product.stock} in stock.`); }
        } else {
            if (product.stock > 0) { setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]); }
            else { alert(`"${product.title}" is out of stock.`); }
        }
        setSearchTerm(''); // Clear search term after product is added/updated
    };

    const handleQuantityChange = (productId, newQuantityStr) => {
        const newQuantity = parseInt(newQuantityStr, 10);
        setSelectedProducts(prevSelectedProducts => {
            return prevSelectedProducts.map(p => {
                if (p.id === productId) {
                    if (newQuantity >= 1 && newQuantity <= p.stock) {
                        return { ...p, quantity: newQuantity };
                    } else if (newQuantity > p.stock) {
                        alert(`Cannot set quantity for "${p.title}" to ${newQuantity}. Only ${p.stock} in stock.`);
                        return { ...p, quantity: p.stock }; // Set to max available stock
                    }
                    return { ...p, quantity: 1 }; // Default to 1 if input is invalid (e.g., < 1)
                }
                return p;
            });
        });
    };

    const handleIncrement = (productId) => {
        setSelectedProducts(prevSelectedProducts => {
            return prevSelectedProducts.map(p => {
                if (p.id === productId) {
                    if (p.quantity < p.stock) { return { ...p, quantity: p.quantity + 1 }; }
                    else { alert(`Cannot add more "${p.title}". Only ${p.stock} in stock.`); }
                }
                return p;
            });
        });
    };

    const handleDecrement = (productId) => {
        setSelectedProducts(selectedProducts.map(p => p.id === productId && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p));
    };

    const handleRemoveProduct = (productId) => { setSelectedProducts(selectedProducts.filter(p => p.id !== productId)); };
    const handlePaymentMethodChange = (event) => { setPaymentMethod(event.target.value); };
    const titleCase = (str) => { if (!str) return ''; return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); };
    const ceilToTwoDecimals = (num) => { return Math.ceil(num * 100) / 100; };
    const ceilToNextInteger = (num) => { return Math.ceil(num); };

    const handleSubmitBill = async () => {
        setFormErrors([]);
        const errors = [];
        if (!selectedStoreName) errors.push('Please select a store.');
        if (!customerName.trim()) errors.push('Customer name is required.');
        if (!customerPhone) errors.push('Customer phone number is required.');
        else if (!/^\d{10}$/.test(customerPhone)) errors.push('Phone number must be 10 digits.');
        if (selectedProducts.length === 0) errors.push('Please select at least one product.');

        const productsExceedingStock = selectedProducts.filter(p => p.quantity > p.stock);
        if (productsExceedingStock.length > 0) {
            const exceededProductsList = productsExceedingStock.map(p => `- ${p.title} (Req: ${p.quantity}, Avail: ${p.stock})`).join('\n');
            errors.push(`Quantity exceeds stock for:\n${exceededProductsList}`);
        }
        if (errors.length > 0) { setFormErrors(errors); return; }

        const billItems = selectedProducts.map(item => ({ productId: item.id, productMongoId: item._id, name: item.title, unitPrice: item.price, quantity: item.quantity, itemTotal: item.price * item.quantity, }));
        let calculatedTotalBill = billItems.reduce((sum, item) => sum + item.itemTotal, 0);
        if (paymentMethod === 'cash') calculatedTotalBill = ceilToNextInteger(calculatedTotalBill);
        else calculatedTotalBill = ceilToTwoDecimals(calculatedTotalBill);

        let stockUpdateSuccessful = true;
        for (const product of selectedProducts) {
            try {
                // Fetch current product data (using its MongoDB _id for the GET request)
                // Your GET /api/products/:_id should not require store context unless _id isn't globally unique.
                const response = await fetch(`/api/products/${product._id}`);
                if (!response.ok) throw new Error(`Failed to fetch product ${product.title}. Status: ${response.status}`);
                const currentProductData = await response.json();

                if (product.quantity > currentProductData.stock) { // Re-check stock before update
                    alert(`Error: Not enough stock for ${product.title} (just before update). Available: ${currentProductData.stock}, Requested: ${product.quantity}`);
                    stockUpdateSuccessful = false; break;
                }
                const newStock = currentProductData.stock - product.quantity;

                // Update product stock (using its MongoDB _id for the PUT request)
                // The payload for PUT should be just the fields to update, e.g., { stock: newStock }
                // or the full product object with the new stock value.
                const updateResponse = await fetch(`/api/products/${product._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...currentProductData, stock: newStock }), // Send full object or just {stock: newStock}
                });
                if (!updateResponse.ok) throw new Error(`Failed to update stock for ${product.title}. Status: ${updateResponse.status}`);
            } catch (error) {
                console.error("Error during stock update:", error);
                alert(`Failed to update stock for ${product.title}: ${error.message}`);
                stockUpdateSuccessful = false; break;
            }
        }
        if (!stockUpdateSuccessful) return;

        setBillDetails({ storeName: titleCase(selectedStoreName), customerName: titleCase(customerName), customerPhone, paymentMethod, items: billItems, totalAmount: calculatedTotalBill });
        setTotalBill(calculatedTotalBill); setIsBillModalOpen(true); setSelectedProducts([]); setCustomerName('');
        setCustomerPhone(''); setPaymentMethod('cash'); setFormErrors([]);
        // setSelectedStoreName(''); // Don't clear store name if the page context depends on it
    };

    const handleCloseModal = () => { setIsBillModalOpen(false); };

    useEffect(() => {
        let newTotal = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
        if (paymentMethod === 'cash') newTotal = ceilToNextInteger(newTotal);
        else newTotal = ceilToTwoDecimals(newTotal);
        setTotalBill(newTotal);
    }, [selectedProducts, paymentMethod]);

    return (
        <div className="container mt-4">
            <h2>Billing Section for {selectedStoreName ? titleCase(selectedStoreName) : "Selected Store"}</h2>

            <div className="mb-3">
                <label htmlFor="billingStoreSelect" className="form-label">Select a Store:</label>
                <select
                    className="form-select"
                    id="billingStoreSelect"
                    value={selectedStoreName} // Ensure this reflects the actual selected store name
                    onChange={handleStoreSelect}
                    required
                    // Consider disabling if store context is strictly from URL
                    // disabled={!!storeNameFromUrl}
                >
                    <option value="">Select a store</option>
                    {stores && stores.map((store) => (
                        // Use store._id for key if available, otherwise store.id
                        <option key={store._id || store.id} value={store.name}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>
            {/* Removed the redundant "Selected Store: {selectedStoreName}" paragraph */}

            {/* Rest of your Billing JSX from paste.txt */}
            <div className="row">
                <div className="col-md-6">
                    <div className="mb-3 position-relative">
                        <label htmlFor="productSearch" className="form-label">Search Product:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="productSearch"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            placeholder="Enter product name"
                            ref={searchInputRef}
                            disabled={!selectedStoreName}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="list-group position-absolute mt-1" style={{ zIndex: 1000, width: '100%', maxHeight: '200px', overflowY: 'auto' }} ref={resultsRef}>
                                {suggestions.map(product => (
                                    // Use product._id for key if available for MongoDB objects
                                    <li key={product._id || product.id} className="list-group-item list-group-item-action" onClick={() => handleSuggestionClick(product)} style={{ cursor: 'pointer' }}>
                                        {product.title} (${product.price}) (Stock: {product.stock})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <h3>Chosen Products:</h3>
                    {selectedProducts.length === 0 ? (<p>No products selected yet.</p>) : (
                        <ul className="list-group mb-3">
                            {selectedProducts.map(product => (
                                // Use product._id for key if available
                                <li key={product._id || product.id} className="list-group-item d-flex justify-content-between align-items-center flex-wrap">
                                    <div className="me-auto mb-1 mb-sm-0">
                                        {product.title} (${product.price}/unit) <span className="text-muted small">(Stock: {product.stock})</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => handleDecrement(product.id)}>-</button>
                                        <input type="number" className={`form-control form-control-sm me-1 ${product.quantity > product.stock ? 'is-invalid' : ''}`} value={product.quantity} min="1" max={product.stock} onChange={(e) => handleQuantityChange(product.id, e.target.value)} style={{ width: '70px' }} />
                                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleIncrement(product.id)}>+</button>
                                        <span className="me-3 fw-bold" style={{minWidth: '80px', textAlign: 'right'}}>Total: ${ceilToTwoDecimals(product.price * product.quantity).toFixed(2)}</span>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleRemoveProduct(product.id)}>&times;</button>
                                    </div>
                                    {product.quantity > product.stock && <small className="w-100 text-danger">Requested quantity exceeds stock.</small>}
                                </li>
                            ))}
                        </ul>
                    )}
                    <h4 className="mt-3">Total Bill Amount: ${totalBill.toFixed(2)}</h4>
                </div>

                <div className="col-md-6">
                    <h3>Customer Details</h3>
                    {formErrors.length > 0 && (
                        <div className="alert alert-danger" role="alert">
                            <p className="mb-1"><strong>Please fix the following issues:</strong></p>
                            <ul className="mb-0">
                                {formErrors.map((error, index) => (<li key={index}>{error}</li>))}
                            </ul>
                        </div>
                    )}
                    <div className="mb-3"><label htmlFor="customerName" className="form-label">Name:</label><input type="text" className="form-control" id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required /></div>
                    <div className="mb-3"><label htmlFor="customerPhone" className="form-label">Phone:</label><input type="tel" className="form-control" id="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required maxLength="10" pattern="\d{10}" title="Phone number must be 10 digits" /></div>
                    <div className="mb-3">
                        <label className="form-label">Payment Method:</label>
                        <div className="form-check"><input type="radio" className="form-check-input" name="paymentMethod" id="cash" value="cash" checked={paymentMethod === 'cash'} onChange={handlePaymentMethodChange} /><label className="form-check-label" htmlFor="cash">Cash</label></div>
                        <div className="form-check"><input type="radio" className="form-check-input" name="paymentMethod" id="upi" value="upi" checked={paymentMethod === 'upi'} onChange={handlePaymentMethodChange} /><label className="form-check-label" htmlFor="upi">UPI</label></div>
                        <div className="form-check"><input type="radio" className="form-check-input" name="paymentMethod" id="card" value="card" checked={paymentMethod === 'card'} onChange={handlePaymentMethodChange} /><label className="form-check-label" htmlFor="card">Card</label></div>
                    </div>
                </div>
            </div>
            <button className="btn btn-primary btn-lg mt-4 w-100" onClick={handleSubmitBill} disabled={!selectedStoreName || selectedProducts.length === 0}>
                Submit Bill & Generate Receipt
            </button>

            {isBillModalOpen && billDetails && (
                <div className="modal fade show" style={{ display: 'block', backdropFilter: 'blur(5px)' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"> {/* Made modal larger and scrollable */}
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Bill Receipt</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                           </div>
                            <div className="modal-body" id="bill-receipt-content"> {/* Added ID for printing specific content */}
                                <div className="text-center mb-3"><h4>{billDetails.storeName}</h4></div>
                                <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
                                <p><strong>Customer:</strong> {billDetails.customerName} {billDetails.customerPhone && `(${billDetails.customerPhone})`}</p>
                                <p><strong>Payment Method:</strong> {titleCase(billDetails.paymentMethod)}</p>
                                <hr />
                                <h5>Items Purchased:</h5>
                                <table className="table table-sm">
                                    <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                                    <tbody>
                                    {billDetails.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>${item.unitPrice.toFixed(2)}</td>
                                            <td>${ceilToTwoDecimals(item.itemTotal).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <hr />
                                <div className="text-end"><h4><strong>Total Amount:</strong> ${billDetails.totalAmount.toFixed(2)}</h4></div>
                                <p className="text-center small mt-3">Thank you for your purchase!</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handlePrint}>Print Bill</button>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Billing;
