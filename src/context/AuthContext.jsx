import React, { createContext, useContext, useState, useEffect } from "react";
import { connectWallet } from "../services/api/authApiService.js";
import { networkUtils } from "../config/networks.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('checking');

  // Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user_data");
    if (token && userData) {
      setUser({ ...JSON.parse(userData), token });
    }
    setIsLoading(false);
    checkNetworkStatus();
  }, []);

  // Check network status on wallet events
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = () => {
        checkNetworkStatus();
      };

      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          logout();
        } else {
          checkNetworkStatus();
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const checkNetworkStatus = async () => {
    try {
      const isCorrect = await networkUtils.isCorrectNetwork();
      setNetworkStatus(isCorrect ? 'correct' : 'wrong');
    } catch (error) {
      console.error('Error checking network:', error);
      setNetworkStatus('error');
    }
  };

  const login = async ({ walletAddress, signature, message }) => {
    try {
      const res = await connectWallet({ walletAddress, signature, message });
      console.log(res.data.token);

      if (res?.data.token && res?.data.user) {
        localStorage.setItem("access_token", res.data.token);
        localStorage.setItem("user_data", JSON.stringify(res.data.user));
        setUser({ ...res.data.user, token: res.data.token });
        return res.data;
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    setUser(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      networkStatus, 
      checkNetworkStatus,
      switchToCorrectNetwork: networkUtils.switchToCorrectNetwork
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
