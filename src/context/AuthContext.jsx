import React, { createContext, useContext, useState } from "react";
import { connectWallet } from "../services/api/authApiService.js";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async ({ walletAddress, signature, message }) => {
    const res = await connectWallet({ walletAddress, signature, message });
      console.log(res.data.token)

    if (res?.data.token && res?.data.user) {
      localStorage.setItem("access_token", res.data.token);
      setUser(res.user);
    } else {
      throw new Error("Invalid login response");
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
