import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './App.css'; // Your CSS import

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
    const [formErrors, setFormErrors] = useState([]);
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

    const handlePrint = () => {
        window.print();
    };

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

                    const lowerCaseSearchTerm = newSearchTerm.toLowerCase();
                    const sortedSuggestions = filtered.sort((a, b) => {
                        const titleA = a.title.toLowerCase();
                        const titleB = b.title.toLowerCase();

                        const aStartsWithSearch = titleA.startsWith(lowerCaseSearchTerm);
                        const bStartsWithSearch = titleB.startsWith(lowerCaseSearchTerm);

                        if (aStartsWithSearch && !bStartsWithSearch) {
                            return -1;
                        }
                        if (!aStartsWithSearch && bStartsWithSearch) {
                            return 1;
                        }

                        if (titleA < titleB) {
                            return -1;
                        }
                        if (titleA > titleB) {
                            return 1;
                        }
                        return 0;
                    });

                    setSuggestions(sortedSuggestions);
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
            const newQuantity = existingProduct.quantity + 1;
            if (newQuantity <= product.stock) {
                 setSelectedProducts(
                    selectedProducts.map(p =>
                        p.id === product.id ? { ...p, quantity: newQuantity } : p
                    )
                );
            } else {
                alert(`Cannot add more "${product.title}". Only ${product.stock} in stock.`);
            }
        } else {
            if (product.stock > 0) {
                setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
            } else {
                alert(`"${product.title}" is out of stock.`);
            }
        }
        setSearchTerm('');
    };

    const handleQuantityChange = (productId, newQuantity) => {
        newQuantity = parseInt(newQuantity);
        setSelectedProducts(prevSelectedProducts => {
            return prevSelectedProducts.map(p => {
                if (p.id === productId) {
                    return { ...p, quantity: newQuantity >= 1 ? newQuantity : 1 };
                }
                return p;
            });
        });
    };

    const handleIncrement = (productId) => {
        setSelectedProducts(prevSelectedProducts => {
            return prevSelectedProducts.map(p => {
                if (p.id === productId) {
                    if (p.quantity < p.stock) {
                        return { ...p, quantity: p.quantity + 1 };
                    } else {
                        alert(`Cannot add more "${p.title}". Only ${p.stock} in stock.`);
                    }
                }
                return p;
            });
        });
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

    const titleCase = (str) => {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    // Function to round up to two decimal places (for non-cash payments)
    const ceilToTwoDecimals = (num) => {
        return Math.ceil(num * 100) / 100;
    };

    // NEW: Function to round up to the next whole integer (for cash payments)
    const ceilToNextInteger = (num) => {
        return Math.ceil(num);
    };

    const handleSubmitBill = async () => {
        setFormErrors([]); // Clear previous errors

        const errors = [];

        if (!customerName.trim()) {
            errors.push('Customer name is required.');
        }

        if (!customerPhone) {
            errors.push('Customer phone number is required.');
        } else if (!/^\d{10}$/.test(customerPhone)) {
            errors.push('Phone number must be exactly 10 digits and contain only numbers.');
        }

        if (selectedProducts.length === 0) {
            errors.push('Please select at least one product.');
        }

        const productsExceedingStock = selectedProducts.filter(p => p.quantity > p.stock);
        if (productsExceedingStock.length > 0) {
            const exceededProductsList = productsExceedingStock.map(p =>
                `- ${p.title} (Requested: ${p.quantity}, Available: ${p.stock})`
            ).join('\n');
            errors.push(`The quantity for the following products exceeds available stock:\n${exceededProductsList}`);
        }

        if (errors.length > 0) {
            setFormErrors(errors);
            return;
        }

        const billItems = selectedProducts.map(item => ({
            name: item.title,
            unitPrice: item.price,
            quantity: item.quantity,
            itemTotal: item.price * item.quantity,
        }));

        let calculatedTotalBill = billItems.reduce((sum, item) => sum + item.itemTotal, 0);

        // NEW: Apply rounding based on payment method
        if (paymentMethod === 'cash') {
            calculatedTotalBill = ceilToNextInteger(calculatedTotalBill);
        } else {
            calculatedTotalBill = ceilToTwoDecimals(calculatedTotalBill);
        }

        let stockUpdateSuccessful = true;
        for (const product of selectedProducts) {
            try {
                const response = await fetch(`http://localhost:8000/api/products/${product.id}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch product ${product.title}. Status: ${response.status}`);
                }
                const currentProductData = await response.json();

                const newStock = currentProductData.stock - product.quantity;

                if (newStock < 0) {
                    alert(`Error: Not enough stock for ${product.title}. Available: ${currentProductData.stock}, Requested: ${product.quantity}`);
                    stockUpdateSuccessful = false;
                    break;
                }

                const updateResponse = await fetch(`http://localhost:8000/api/products/${product.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ...currentProductData, stock: newStock }),
                });

                if (!updateResponse.ok) {
                    throw new Error(`Failed to update stock for ${product.title}. Status: ${updateResponse.status}`);
                }
                console.log(`Stock for ${product.title} updated to ${newStock}`);

            } catch (error) {
                console.error("Error during stock update:", error);
                alert(`Failed to update stock for ${product.title}: ${error.message}`);
                stockUpdateSuccessful = false;
                break;
            }
        }

        if (!stockUpdateSuccessful) {
            return;
        }

        setBillDetails({
            storeName: storeName?.replace(/-/g, ' '),
            customerName: titleCase(customerName),
            customerPhone,
            paymentMethod,
            items: billItems,
            totalAmount: calculatedTotalBill,
        });
        setTotalBill(calculatedTotalBill);
        setIsBillModalOpen(true);
        setSelectedProducts([]);
        setCustomerName('');
        setCustomerPhone('');
        setPaymentMethod('cash');
        setFormErrors([]);
    };

    const handleCloseModal = () => {
        setIsBillModalOpen(false);
    };

    useEffect(() => {
        let newTotal = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
        // NEW: Apply rounding based on current paymentMethod for live update
        if (paymentMethod === 'cash') {
            newTotal = ceilToNextInteger(newTotal);
        } else {
            newTotal = ceilToTwoDecimals(newTotal);
        }
        setTotalBill(newTotal);
    }, [selectedProducts, paymentMethod]); // Added paymentMethod to dependency array

    return (
        <div className="container mt-4">
            <h2>{titleCase(storeName?.replace(/-/g, ' '))} - Billing</h2>
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
                                        {product.title} (${product.price}) (Stock: {product.stock})
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
                                        {product.title} (${product.price}/unit) (In stock: {product.stock})
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleDecrement(product.id)}>-</button>
                                        <input
                                            type="number"
                                            className={`form-control form-control-sm me-2 ${product.quantity > product.stock ? 'exceeds-stock' : ''}`}
                                            value={product.quantity}
                                            min="1"
                                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                            style={{ width: '60px' }}
                                        />
                                        <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => handleIncrement(product.id)}>+</button>
                                        <span className="me-2">Total: ${ceilToTwoDecimals(product.price * product.quantity).toFixed(2)}</span>
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
                    {formErrors.length > 0 && (
                        <div className="alert alert-danger" role="alert">
                            <p>Please fix the following issues:</p>
                            <ul>
                                {formErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
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
                        <label htmlFor="customerPhone" className="form-label">Phone:</label>
                        <input
                            type="tel"
                            className="form-control"
                            id="customerPhone"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            required
                            maxLength="10"
                            pattern="\d{10}"
                            title="Phone number must be exactly 10 digits"
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
                                <p><strong>Store:</strong> {titleCase(billDetails.storeName)}</p>
                                <p><strong>Customer Name:</strong> {billDetails.customerName}</p>
                                {billDetails.customerPhone && <p><strong>Phone:</strong> {billDetails.customerPhone}</p>}
                                <p><strong>Payment Method:</strong> {titleCase(billDetails.paymentMethod)}</p>
                                <hr />
                                <h5>Items:</h5>
                                <ul className="list-unstyled">
                                    {billDetails.items.map((item, index) => (
                                        <li key={index}>
                                            {item.name} - ${item.unitPrice} x {item.quantity} = ${ceilToTwoDecimals(item.itemTotal).toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                                <hr />
                                <h4><strong>Total Amount:</strong> ${billDetails.totalAmount.toFixed(2)}</h4>
                            </div>
                            <div className="modal-footer">
                                {/* Add the Print Button Here */}
                                <button type="button" className="btn btn-primary me-2" onClick={handlePrint}>Print Bill</button>
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
