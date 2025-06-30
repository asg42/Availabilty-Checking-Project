import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function SearchInput({ onSearch, products }) { // Added products prop
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const newQuery = event.target.value;
    setQuery(newQuery);

    if (newQuery.length > 0 && products) { // Check if products are available
      const lowerQuery = newQuery.toLowerCase();
      const filtered = products.filter(product => {
        const lowerTitle = product.title.toLowerCase();
        const titleWords = lowerTitle.split(' ');
        return lowerTitle.startsWith(lowerQuery) || titleWords.some(word => word.startsWith(lowerQuery));
      });

      const sortedSuggestions = filtered.sort((a, b) => {
        const lowerTitleA = a.title.toLowerCase();
        const lowerTitleB = b.title.toLowerCase();

        const indexA = lowerTitleA.startsWith(lowerQuery) ? 0 : lowerTitleA.indexOf(` ${lowerQuery}`);
        const indexB = lowerTitleB.startsWith(lowerQuery) ? 0 : lowerTitleB.indexOf(` ${lowerQuery}`);

        if (indexA === 0 && indexB !== 0) return -1;
        if (indexA !== 0 && indexB === 0) return 1;

        return indexA - indexB;
      });

      setSuggestions(sortedSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && onSearch) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (selectedProduct) => {
    setQuery(selectedProduct.title);
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(selectedProduct.title); // Navigate on click
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
        resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="mb-3 position-relative">
      <label htmlFor="search-input" className="form-label">Search Products:</label>
      <input
        ref={inputRef}
        type="text"
        className="form-control"
        id="search-input"
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type to search and press Enter"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul ref={resultsRef} className="list-group position-absolute mt-1" style={{ zIndex: 1000, width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
          {suggestions.map((product) => (
            <li
              key={product.id}
              className="list-group-item list-group-item-action"
              onClick={() => handleSuggestionClick(product)}
              style={{ cursor: 'pointer' }}
            >
              {product.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchInput;