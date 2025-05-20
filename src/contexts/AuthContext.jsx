import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

// 1. Create the Auth Context
const AuthContext = createContext(null);

// 2. Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userToken, setUserToken] = useState(null); // To store the JWT or session token
  const [isAdmin, setIsAdmin] = useState(false);     // To differentiate user roles (important for admin panel)

  // Function to check authentication status from localStorage on app load
  const checkAuthStatus = useCallback(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole'); // Assuming you store the user's role

    if (token) {
      // In a real application, you'd send this token to your backend
      // to validate it and get user details. For this example, we'll
      // assume its presence means authenticated.
      setIsAuthenticated(true);
      setUserToken(token);
      setIsAdmin(role === 'admin'); // Set isAdmin based on the stored role
    } else {
      setIsAuthenticated(false);
      setUserToken(null);
      setIsAdmin(false);
    }
  }, []); // useCallback memoizes the function, no dependencies needed

  // Run checkAuthStatus once on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Re-run if checkAuthStatus itself changes (it won't, due to useCallback)


  // Function to handle successful login
  const login = useCallback((token, role = 'user') => {
    localStorage.setItem('authToken', token); // Store token for persistence
    localStorage.setItem('userRole', role);   // Store role for persistence
    setIsAuthenticated(true);
    setUserToken(token);
    setIsAdmin(role === 'admin');
  }, []); // useCallback memoizes the function

  // Function to handle logout
  const logout = useCallback(() => {
    localStorage.removeItem('authToken'); // Remove token
    localStorage.removeItem('userRole');  // Remove role
    setIsAuthenticated(false);
    setUserToken(null);
    setIsAdmin(false);
  }, []); // useCallback memoizes the function

  // Value provided by the context to its consumers
  const value = {
    isAuthenticated,
    userToken,
    isAdmin,
    login,
    logout,
    checkAuthStatus, // Expose this if needed elsewhere, though useEffect handles initial load
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom Hook to consume the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};