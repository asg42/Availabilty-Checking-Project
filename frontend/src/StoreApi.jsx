// StoreApi.jsx
import { useState, useEffect } from 'react';

const useStoreApi = () => {
const [stores, setStores] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
const fetchStores = async () => {
try {
// CHANGE THIS LINE TO YOUR NEW API ENDPOINT
const response = await fetch('https://dummyjson.com/c/f9bb-d03a-49ef-a9a9');
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();
setStores(data.stores);
setLoading(false);
} catch (err) {
setError(err.message);
setLoading(false);
}
};

fetchStores();
}, []);

return { stores, loading, error };
};

export const fetchAllStores = async () => { // ADD 'export' here for named export
try {
const response = await fetch('http://localhost:8000/api/stores', { // Assuming your stores API endpoint
method: 'GET',
});
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();
return data; // Return the fetched stores
} catch (error) {
console.error("Error fetching all stores:", error);
throw error; // Re-throw the error for the calling component to handle
}
};

export default useStoreApi;