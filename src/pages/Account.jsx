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
    username: "Temuujin",
    email: "cuntwithego@gmail.com",
    x: "https://x.com/miakhalifa",
    discord: "https://discord.com/miakhalifa",
    referralCode: "blx3...38q8",
    gold: 33124,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingDiscord, setEditingDiscord] = useState(false);
  const [editingX, setEditingX] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [discordUrl, setDiscordUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [emailValue, setEmailValue] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await getCurrentUserProfile();
        setProfileData({
          username: data.username || data.name || "Temuujin",
          email: data.email || "cuntwithego@gmail.com",
          x:
            data.x ||
            data.twitter ||
            data.socials?.x ||
            data.socials?.twitter ||
            "https://x.com/miakhalifa",
          discord:
            data.discord ||
            data.socials?.discord ||
            "https://discord.com/miakhalifa",
          referralCode:
            data.referralCode || data.referral?.code || "blx3...38q8",
          gold: data.gold || data.currency?.gold || 33124,
        });
        setDiscordUrl(
          data.discord ||
            data.socials?.discord ||
            "https://discord.com/miakhalifa"
        );
        setXUrl(
          data.x ||
            data.twitter ||
            data.socials?.x ||
            data.socials?.twitter ||
            "https://x.com/miakhalifa"
        );
        setEmailValue(data.email || "cuntwithego@gmail.com");
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

  const handleUpdateProfile = async () => {
    try {
      console.log("=== PROFILE UPDATE START ===");
      console.log("Current profileData:", profileData);

      // Create complete profile structure with all fields
      const completeProfileData = {
        username: profileData.username,
        email: emailValue || profileData.email,
        socials: {
          x: xUrl || profileData.x,
          discord: discordUrl || profileData.discord,
        },
      };

      console.log("Sending complete profile data:", completeProfileData);
      console.log("Calling updateProfile API...");
      await updateProfile(completeProfileData);
      console.log("API call successful, updating local state...");

      setProfileData((prev) => {
        const newData = {
          ...prev,
          email: emailValue || prev.email,
          x: xUrl || prev.x,
          discord: discordUrl || prev.discord,
        };
        console.log("New profile data:", newData);
        return newData;
      });

      // Reset edit states
      setEditingDiscord(false);
      setEditingX(false);
      setEditingEmail(false);

      alert("Profile updated successfully!");
      console.log("=== PROFILE UPDATE SUCCESS ===");
    } catch (error) {
      console.error("=== PROFILE UPDATE ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#170908] pl-6 pr-6">
        <div className="bg-[#24110F] border border-[#392423] rounded-lg p-6 max-w-md">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-600 rounded w-32 mb-6 animate-pulse"></div>
            <div className="space-y-3 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[#2F1A18] border border-[#392423] rounded-lg p-3 h-12 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-[700px] items-center justify-center text-white bg-[#170908] pl-6 pr-6">
      {/* Profile Section */}
      <div className="bg-[#24110F] border border-[#392423] rounded-lg p-6 max-w-md">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {profileData.username}
          </h2>
        </div>
        <div className="space-y-3">
          <div className="bg-[#2F1A18] border border-[#392423] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">
                {profileData.referralCode}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(profileData.referralCode)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Update className="w-4 h-4" />
            </button>
          </div>
          {/* Discord */}
          <div className="bg-[#2F1A18] border border-[#392423] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Discord className="w-5 h-5 text-blue-500" />
              {editingDiscord ? (
                <input
                  type="text"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  className="bg-[#392423] border border-[#4A2D2A] rounded px-2 py-1 text-white text-sm flex-1"
                  placeholder="Enter Discord URL"
                />
              ) : (
                <span className="text-white font-medium">
                  {profileData.discord}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {editingDiscord ? (
                <>
                  <button
                    onClick={() => {
                      console.log("✓ DISCORD SAVE BUTTON CLICKED");
                      handleUpdateProfile();
                    }}
                    className="text-green-400 hover:text-green-300 transition-colors text-sm"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingDiscord(false);
                      setDiscordUrl(profileData.discord);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingDiscord(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    <Update className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(profileData.discord)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Update className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* X/Twitter */}
          <div className="bg-[#2F1A18] border border-[#392423] rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <X className="w-5 h-5 text-blue-400" />
              {editingX ? (
                <input
                  type="text"
                  value={xUrl}
                  onChange={(e) => setXUrl(e.target.value)}
                  className="bg-[#392423] border border-[#4A2D2A] rounded px-2 py-1 text-white text-sm flex-1"
                  placeholder="Enter X URL"
                />
              ) : (
                <span className="text-white font-medium">{profileData.x}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {editingX ? (
                <>
                  <button
                    onClick={() => {
                      console.log("✓ X SAVE BUTTON CLICKED");
                      handleUpdateProfile();
                    }}
                    className="text-green-400 hover:text-green-300 transition-colors text-sm"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => {
                      setEditingX(false);
                      setXUrl(profileData.x);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingX(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    <Update className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(profileData.x)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Update className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="bg-[#2F1A18] border border-[#392423] rounded-lg p-3 flex items-center justify-between">
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
                      console.log("✓ EMAIL SAVE BUTTON CLICKED");
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
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    <Update className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(profileData.email)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Update className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        <button className="w-full mt-6 bg-transparent border-2 border-red-600 text-red-600 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-600 hover:text-white transition-colors">
          <Connection className="w-6 h-6" />
          <span>Referral Link</span>
        </button>
      </div>
    </div>
  );
};

export default Account;
