import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getCurrentUserProfile,
  updateProfile,
} from "../services/api/gameApiService";
import Mail from "../components/icons/Mail.jsx";
import Connection from "../components/icons/Connection.jsx";
import Discord from "../components/icons/Discord.jsx";
import Wallet from "../components/icons/Wallet.jsx";
import X from "../components/icons/X.jsx";
import Update from "../components/icons/Update.jsx";

const Account = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    x: "",
    discord: "",
    referralCode: "",
    gold: 0,
    xp: 0,
    walletAddress: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingDiscord, setEditingDiscord] = useState(false);
  const [editingX, setEditingX] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [discordUrl, setDiscordUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [usernameValue, setUsernameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getCurrentUserProfile();
        const data = response.data || response; // Handle nested data structure

        setProfileData({
          username: data.username || "Unknown User",
          email: data.email || "",
          x: data.socials?.x || "",
          discord: data.socials?.discord || "",
          referralCode: data.referralCode || data.id || "",
          gold: data.gold || 0,
          xp: data.xp || 0,
          walletAddress: data.walletAddress || "",
        });

        // Initialize input values
        setDiscordUrl(data.socials?.discord || "");
        setXUrl(data.socials?.x || "");
        setEmailValue(data.email || "");
        setUsernameValue(data.username || "");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const refreshProfile = async () => {
    try {
      const response = await getCurrentUserProfile();
      const data = response.data || response; // Handle nested data structure

      setProfileData({
        username: data.username || "Unknown User",
        email: data.email || "",
        x: data.socials?.x || "",
        discord: data.socials?.discord || "",
        referralCode: data.referralCode || data.id || "",
        gold: data.gold || 0,
        xp: data.xp || 0,
        walletAddress: data.walletAddress || "",
      });

      // Update input values to match fetched data
      setUsernameValue(data.username || "");
      setEmailValue(data.email || "");
      setDiscordUrl(data.socials?.discord || "");
      setXUrl(data.socials?.x || "");
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const completeProfileData = {
        username: usernameValue || profileData.username,
        email: emailValue || profileData.email,
        socials: {
          x: xUrl || profileData.x,
          discord: discordUrl || profileData.discord,
        },
      };
      await updateProfile(completeProfileData);

      // Refresh profile data from server to ensure we have the latest
      await refreshProfile();

      setEditingDiscord(false);
      setEditingX(false);
      setEditingEmail(false);
      setEditingUsername(false);
      setErrorMessage(""); // Clear any previous errors
    } catch (error) {
      // Handle specific error cases
      let errorMsg = "Failed to update profile. Please try again.";

      if (error.response?.status === 409) {
        errorMsg =
          "Username already exists. Please choose a different username.";
      } else if (error.response?.status === 400) {
        errorMsg = "Invalid data provided. Please check your input.";
      } else if (error.response?.status === 401) {
        errorMsg = "Authentication required. Please log in again.";
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }

      setErrorMessage(errorMsg);

      // Reset editing state to show the original value
      setEditingUsername(false);
      setUsernameValue(profileData.username);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#170908] pl-6 pr-6">
        <div className="w-[500px] bg-[#24110F] border border-[#392423]  p-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-600 rounded w-32 mb-6 animate-pulse"></div>
            <div className="space-y-3 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[#2F1A18] border border-[#392423]  p-3 h-12 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full h-full flex text-white bg-[#170908]">
      <div className="flex flex-row w-full h-full justify-center  bg-[#24110F] border border-[#392423] p-8 gap-8">
        <div className="flex flex-col gap-6 basis-1/3 max-w-[420px] min-w-[320px] flex-shrink-0">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-900 text-red-300 rounded text-center font-bold border border-red-600">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-col items-center mb-6 bg-[#2F1A18] border border-[#392423]  p-6">
            <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <div className="flex items-center space-x-2">
              {editingUsername ? (
                <>
                  <input
                    type="text"
                    value={usernameValue}
                    onChange={(e) => setUsernameValue(e.target.value)}
                    className="bg-[#392423] border border-[#4A2D2A] rounded px-3 py-1 text-white text-xl font-bold text-center"
                    placeholder="Enter username"
                  />
                  <button
                    onClick={() => {
                      handleUpdateProfile();
                    }}
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingUsername(false);
                      setUsernameValue(profileData.username);
                      setErrorMessage("");
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">
                    {profileData.username}
                  </h2>
                  <button
                    onClick={() => setEditingUsername(true)}
                    className="text-white hover:text-red-600 text-sm"
                  >
                    <Update className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-[#2F1A18] border border-[#392423]  p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-white font-medium block">
                    {profileData.walletAddress
                      ? `${profileData.walletAddress.slice(
                          0,
                          6
                        )}...${profileData.walletAddress.slice(-4)}`
                      : "No wallet"}
                  </span>
                  <span className="text-gray-400 text-sm">Wallet Address</span>
                </div>
              </div>
            </div>
            <div className="bg-[#2F1A18] border border-[#392423]  p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                {editingEmail ? (
                  <input
                    type="text"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="bg-[#392423] border border-[#4A2D2A] rounded px-2 py-1 text-white text-sm flex-1"
                    placeholder="Enter Email"
                  />
                ) : (
                  <span className="text-white font-medium">
                    {profileData.email}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {editingEmail ? (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateProfile();
                      }}
                      className="text-green-400 hover:text-green-300 transition-colors text-sm"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingEmail(false);
                        setEmailValue(profileData.email);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingEmail(true)}
                      className="text-white hover:text-red-600 text-sm"
                    >
                      <Update className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Right: Items and Achievements */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Items Section */}
          <div>
            <h2 className="text-2xl font-bold text-[#FFAE0B] mb-2">Items</h2>
            <div className="grid grid-cols-3 grid-rows-2 gap-6 max-h-[300px] max-w-[400px]">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="relative flex items-center justify-center w-full h-full aspect-square   overflow-hidden"
                >
                  {/* Frame background for Items */}
                  <img
                    src="/Frame-7.png"
                    alt="frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    style={{ zIndex: 0 }}
                  />
                  <img
                    src="/Frame-8.png"
                    alt="frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    style={{ zIndex: 0 }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Achievements Section */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-[#FFAE0B] mb-2">
              Achievement
            </h2>
            <div className="grid grid-cols-3 grid-rows-2 gap-6 max-h-[300px] max-w-[400px]">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="relative flex items-center justify-center w-full h-full aspect-square   overflow-hidden"
                >
                  {/* Frame background for Items */}
                  <img
                    src="/Frame-7.png"
                    alt="frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    style={{ zIndex: 0 }}
                  />
                  <img
                    src="/Frame-8.png"
                    alt="frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    style={{ zIndex: 0 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
