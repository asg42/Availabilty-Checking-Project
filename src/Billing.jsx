import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

function Billing() {
    const { storeName } = useParams();
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
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target) &&
                resultsRef.current && !resultsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchInputChange = async (event) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        setSuggestions([]);
        setShowSuggestions(false);

        if (newSearchTerm.length > 0) {
            try {
                const response = await fetch(`http://localhost:8000/api/products?search=${newSearchTerm}`, {
                    method: 'GET',
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    const filtered = data.filter(product =>
                        product.title.toLowerCase().includes(newSearchTerm.toLowerCase())
                    );
                    setSuggestions(filtered);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }
    };

    const handleSuggestionClick = (product) => {
        setSearchTerm(product.title);
        setSuggestions([]);
        setShowSuggestions(false);
        handleAddProduct(product);
    };

    const handleAddProduct = (product) => {
        const existingProduct = selectedProducts.find(p => p.id === product.id);
        if (existingProduct) {
            setSelectedProducts(
                selectedProducts.map(p =>
                    p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                )
            );
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
        setSearchTerm('');
    };

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity >= 1) {
            setSelectedProducts(
                selectedProducts.map(p =>
                    p.id === productId ? { ...p, quantity: parseInt(newQuantity) } : p
                )
            );
        }
    };

    const handleIncrement = (productId) => {
        setSelectedProducts(
            selectedProducts.map(p =>
                p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
            )
        );
    };

    const handleDecrement = (productId) => {
        setSelectedProducts(
            selectedProducts.map(p =>
                p.id === productId && p.quantity > 1 ? { ...p, quantity: p.quantity - 1 } : p
            )
        );
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    const handleSubmitBill = () => {
        if (!customerName) {
            alert('Please enter customer name.');
            return;
        }
        if (selectedProducts.length === 0) {
            alert('Please select at least one product.');
            return;
        }

        const billItems = selectedProducts.map(item => ({
            name: item.title,
            unitPrice: item.price,
            quantity: item.quantity,
            itemTotal: item.price * item.quantity,
        }));
        const calculatedTotalBill = billItems.reduce((sum, item) => sum + item.itemTotal, 0);

        setBillDetails({
            storeName: storeName?.replace(/-/g, ' '),
            customerName,
            customerPhone,
            paymentMethod,
            items: billItems,
            totalAmount: calculatedTotalBill,
        });
        setTotalBill(calculatedTotalBill);
        setIsBillModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsBillModalOpen(false);
    };

    useEffect(() => {
        const newTotal = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
        setTotalBill(newTotal);
    }, [selectedProducts]);

    return (
        <div className="container mt-4">
            <h2>{storeName?.replace(/-/g, ' ')} - Billing</h2>
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
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="list-group position-absolute mt-1" style={{ zIndex: 1000, width: '100%', maxHeight: '200px', overflowY: 'auto' }} ref={resultsRef}>
                                {suggestions.map(product => (
                                    <li
                                        key={product.id}
                                        className="list-group-item list-group-item-action"
                                        onClick={() => handleSuggestionClick(product)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {product.title} (${product.price})
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <h3>Chosen Products:</h3>
                    {selectedProducts.length === 0 ? (
                        <p>No products selected yet.</p>
                    ) : (
                        <ul className="list-group">
                            {selectedProducts.map(product => (
                                <li key={product.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        {product.title} (${product.price}/unit)
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleDecrement(product.id)}>-</button>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm me-2"
                                            value={product.quantity}
                                            min="1"
                                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                            style={{ width: '60px' }}
                                        />
                                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleIncrement(product.id)}>+</button>
                                        <span className="me-2">Total: ${product.price * product.quantity}</span>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleRemoveProduct(product.id)}>Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <h4 className="mt-3">Total Bill Amount: ${totalBill.toFixed(2)}</h4>
                </div>

                <div className="col-md-6">
                    <h3>Customer Details</h3>
                    <div className="mb-3">
                        <label htmlFor="customerName" className="form-label">Name:</label>
                        <input
                            type="text"
                            className="form-control"
                            id="customerName"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="customerPhone" className="form-label">Phone (Optional):</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="customerPhone"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Payment Method:</label>
                        <div className="form-check">
                            <input
                                type="radio"
                                className="form-check-input"
                                name="paymentMethod"
                                id="cash"
                                value="cash"
                                checked={paymentMethod === 'cash'}
                                onChange={handlePaymentMethodChange}
                            />
                            <label className="form-check-label" htmlFor="cash">Cash</label>
                        </div>
                        <div className="form-check">
                            <input
                                type="radio"
                                className="form-check-input"
                                name="paymentMethod"
                                id="upi"
                                value="upi"
                                checked={paymentMethod === 'upi'}
                                onChange={handlePaymentMethodChange}
                            />
                            <label className="form-check-label" htmlFor="upi">UPI</label>
                        </div>
                        <div className="form-check">
                            <input
                                type="radio"
                                className="form-check-input"
                                name="paymentMethod"
                                id="card"
                                value="card"
                                checked={paymentMethod === 'card'}
                                onChange={handlePaymentMethodChange}
                            />
                            <label className="form-check-label" htmlFor="card">Card</label>
                        </div>
                    </div>
                </div>
            </div>

            <button className="btn btn-primary btn-lg mt-3" onClick={handleSubmitBill}>
                Submit Bill
            </button>

            {isBillModalOpen && billDetails && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Bill Details</h5>
                                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Store:</strong> {billDetails.storeName}</p>
                                <p><strong>Customer Name:</strong> {billDetails.customerName}</p>
                                {billDetails.customerPhone && <p><strong>Phone:</strong> {billDetails.customerPhone}</p>}
                                <p><strong>Payment Method:</strong> {billDetails.paymentMethod}</p>
                                <hr />
                                <h5>Items:</h5>
                                <ul className="list-unstyled">
                                    {billDetails.items.map((item, index) => (
                                        <li key={index}>
                                            {item.name} - ${item.unitPrice} x {item.quantity} = ${item.itemTotal}
                                        </li>
                                    ))}
                                </ul>
                                <hr />
                                <h4><strong>Total Amount:</strong> ${billDetails.totalAmount.toFixed(2)}</h4>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                                {/* You might add a "Print" or "Save" button here */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;