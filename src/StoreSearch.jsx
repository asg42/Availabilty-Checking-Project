import React from 'react';
import { useNavigate } from 'react-router-dom';

function StoreSearch() {
  const navigate = useNavigate();

  // The store selection is now in the TopBar, so this component's UI is minimal.
  // We might still want to display a message or some other content here.

  return (
    <div className="container mt-4">
      <h2>Choose a Store from the Top Bar</h2>
      <p>Select a store from the dropdown menu at the top of the page to browse products.</p>
    </div>
  );
}

export default StoreSearch;