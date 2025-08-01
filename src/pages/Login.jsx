import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { connectWallet } from "../services/api/authApiService.js";
import { useAuth } from "../context/AuthContext.jsx";
import metamaskLogo from "../images/Metamask.png";
import vector from "../images/Vector.png";
import flame from "../images/Flame.png";
import flame1 from "../images/Flame-1.png";
import flame2 from "../images/Flame-2.png";
import cornerFrame1 from "../images/Corner-Frame-3 1.png";
import cornerFrame2 from "../images/Corner-Frame-3 2.png";
import cornerFrame3 from "../images/Corner-Frame-3 3.png";
import cornerFrame4 from "../images/Corner-Frame-3 4.png";
import "./Login.css";
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0 && localStorage.getItem("access_token")) {
          console.log("already connected");
          //qasdasdasdas
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

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      const message = "Welcome to the game!\n\nClick to sign in.";
      const signature = await signer.signMessage(message);

      await login({ walletAddress, signature, message });

      console.log("connected");

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  return (
    <div className="login-root">
      <img src={flame} className="flame-top" alt="Flame Top" />
      <img
        src={flame}
        className="flame-bottom"
        style={{ transform: "rotate(180deg)" }}
        alt="Flame Bottom"
      />
      <img src={flame2} className="flame-left" alt="Flame Left" />
      <img src={flame1} className="flame-right" alt="Flame Right" />
      <img
        src={cornerFrame3}
        className="corner-frame corner-tl"
        style={{ width: "129px", height: "129px" }}
        alt="Corner TL"
      />
      <img
        src={cornerFrame4}
        className="corner-frame corner-tr"
        style={{ width: "129px", height: "129px" }}
        alt="Corner TR"
      />
      <img
        src={cornerFrame1}
        className="corner-frame corner-bl"
        style={{ width: "129px", height: "129px" }}
        alt="Corner BL"
      />
      <img
        src={cornerFrame2}
        className="corner-frame corner-br"
        style={{ width: "129px", height: "129px" }}
        alt="Corner BR"
      />
      <div className="login-box">
        <img src={vector} alt="vector" className="login-vector" />
        <h2 className="login-title">Log In or Sign Up</h2>
        <button onClick={openLogin} className="login-metamask-btn">
          <img
            src={metamaskLogo}
            alt="MetaMask Logo"
            className="login-metamask-logo"
          />
          <p className="login-metamask-text">Connect Metamask</p>
        </button>
      </div>
    </div>
  );
}

export default Login;
