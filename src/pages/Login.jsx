import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { connectWallet } from "../services/api/authApiService.js";
import { useAuth } from "../context/AuthContext.jsx";
import metamaskLogo from "../images/Metamask.png";
import vector from "../images/Vector.png";
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
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-[#170908] overflow-hidden">
      <img
        src="/src/images/flame.png"
        className="absolute top-0 left-0 w-full h-10 object-cover"
        alt="Flame Top"
      />
      <img
        src="/src/images/flame.png"
        className="absolute bottom-0 left-0 w-full h-10 object-cover"
        style={{ transform: "rotate(180deg)" }}
        alt="Flame Bottom"
      />
      <img
        src="/src/images/flame-2.png"
        className="absolute left-0 top-0 h-full w-10 object-cover"
        alt="Flame Left"
      />
      <img
        src="/src/images/flame-1.png"
        className="absolute right-0 top-0 h-full w-10 object-cover"
        alt="Flame Right"
      />
      <img
        src="/src/images/corner-frame-3 3.png"
        className="absolute top-0 left-0"
        style={{ width: "129px", height: "129px" }}
        alt="Corner TL"
      />
      <img
        src="/src/images/corner-frame-3 4.png"
        className="absolute top-0 right-0"
        style={{ width: "129px", height: "129px" }}
        alt="Corner TR"
      />
      <img
        src="/src/images/corner-frame-3 1.png"
        className="absolute bottom-0 left-0"
        style={{ width: "129px", height: "129px" }}
        alt="Corner BL"
      />
      <img
        src="/src/images/corner-frame-3 2.png"
        className="absolute bottom-0 right-0"
        style={{ width: "129px", height: "129px" }}
        alt="Corner BR"
      />
      <div className="flex flex-col items-center  w-[872px] h-[794px] border-2 border-[#24110F] rounded-2xl bg-[#170908]">
        <img
          src={vector}
          alt="vector"
          className="w-[216px] h-[162px] block mx-auto mt-[121px]"
        />
        <h2 className="text-white text-center flex items-center justify-center m-0 font-medium text-[40px] leading-[48px] tracking-[0.01em] font-alagard mt-[50px]">
          Log In or Sign Up
        </h2>
        <button
          onClick={openLogin}
          className="flex flex-row items-center justify-center w-[282px] h-[56px] bg-[#24110F] text-white border-2 border-[#CC1508] rounded-lg text-[18px] font-bold pt-4 pr-8 pb-4 pl-6 gap-3 mt-[50px] focus:outline-none focus:ring-0 active:outline-none active:ring-0 cursor-pointer"
        >
          <img
            src={metamaskLogo}
            alt="MetaMask Logo"
            className="w-6 h-6 mb-0"
          />
          <p className="m-0">Connect Metamask</p>
        </button>
      </div>
    </div>
  );
}

export default Login;
