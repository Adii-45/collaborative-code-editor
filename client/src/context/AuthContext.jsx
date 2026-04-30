import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

/**
 * AuthContext provides user state and auth methods to the entire app.
 * 
 * State:
 *   - user: { _id, username, email, token } | null
 *   - loading: boolean (true while checking localStorage on mount)
 * 
 * Methods:
 *   - login(email, password): Authenticates and stores token
 *   - signup(username, email, password): Registers and stores token
 *   - logout(): Clears stored credentials
 */
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if user data exists in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted storage — clean up
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const signup = async (username, email, password) => {
    const { data } = await api.post('/auth/signup', { username, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const githubLogin = async (token) => {
    localStorage.setItem('token', token);
    
    try {
      // Need to configure the token in the API client header
      // It might already be handled by an interceptor reading from localStorage
      const { data } = await api.get('/auth/me');
      
      const userData = { ...data, token };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, githubLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
