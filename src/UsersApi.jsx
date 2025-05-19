import { useState, useEffect } from 'react';

const fetchUsers = async () => {
  try {
    const response = await fetch('https://dummyjson.com/users');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.users; // The users are in the 'users' array
  } catch (error) {
    console.error("Could not fetch users:", error);
    return null;
  }
};

const checkCredentials = async (identifier, password) => {
  const users = await fetchUsers();
  if (users) {
    const foundUser = users.find(
      user => user.username === identifier || user.email === identifier
    );
    if (foundUser) {
      // In a real application, you would never store or send plain text passwords.
      // This is for demonstration with dummyjson.
      return foundUser.password === password;
    }
  }
  return false;
};

const UsersApi = () => {
  // This component doesn't need to render anything for now,
  // as it just provides utility functions.
  return null;
};

export { checkCredentials };
export default UsersApi;