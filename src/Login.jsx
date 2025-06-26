import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { connectWallet } from "./services/api/authApiService.js";
import { useAuth } from "./context/AuthContext.jsx";
function Login() {
  const { login } = useAuth(); // from AuthContext
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0 && localStorage.getItem("access_token")) {
            console.log("already connected")

        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const openLogin = async () => {
    if (!window.ethereum) {
      alert("No MetaMask Detected");
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const message = "Welcome to the game!\n\nClick to sign in.";
      const signature = await signer.signMessage(message);

      await login({ walletAddress, signature, message });

       console.log("connected")
    } catch (error) {
      console.error("Login failed:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h2>Connect Your Wallet</h2>
      <p>Please connect your MetaMask wallet to continue</p>

      <button
        onClick={openLogin}
        disabled={isConnecting}
        style={{
          backgroundColor: isConnecting ? '#666' : '#3F8F3F',
          color: 'white',
          border: 'none',
          padding: '18px 24px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
          minWidth: '200px'
        }}
      >
        {isConnecting ? '🔄 Connecting...' : '🔗 Connect Wallet'}
      </button>
    </div>
  );
}

export default Login;
