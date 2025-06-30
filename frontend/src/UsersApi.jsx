// UsersApi.jsx

// Check admin credentials (no JWT, no tokens)
export const checkCredentials = async (identifier, password) => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    const users = await response.json();
    const foundUser = users.find(
      user =>
        (user.username === identifier || user.email === identifier) &&
        user.role === 'admin'
    );
    if (foundUser && foundUser.password === password) {
      return { success: true, user: foundUser };
    }
    return { success: false, user: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Fetch products (no token needed)
export const fetchProducts = async () => {
  const response = await fetch('/api/products');
  if (!response.ok) throw new Error('Error fetching products');
  return await response.json();
};

// Create product (no token needed)
export const createProduct = async (productData) => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });
  if (!response.ok) throw new Error('Error creating product');
  return await response.json();
};

// Update product (no token needed)
export const updateProduct = async (productId, updateData) => {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  if (!response.ok) throw new Error('Error updating product');
  return await response.json();
};

// Delete product (no token needed)
export const deleteProduct = async (productId) => {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error deleting product');
  return await response.json();
};

// Dummy logout (no JWT)
export const logoutAdmin = () => {};
