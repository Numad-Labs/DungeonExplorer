import React, { createContext, useContext, useState, useEffect } from "react";
import { connectWallet } from "../services/api/authApiService.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setUser({ username: "Player", token });
    }
    setIsLoading(false);
  }, []);

  const login = async ({ walletAddress, signature, message }) => {
    try {
      const res = await connectWallet({ walletAddress, signature, message });
      console.log(res.data.token);

      if (res?.data.token && res?.data.user) {
        localStorage.setItem("access_token", res.data.token);
        setUser(res.data.user);
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
    setUser(null);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
