import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getCurrentUserProfile,
  updateProfile,
  checkMintEligible,
  mintAchievementNFT,
} from "../services/api/gameApiService";
import Mail from "../components/icons/Mail.jsx";
import Connection from "../components/icons/Connection.jsx";
import Discord from "../components/icons/Discord.jsx";
import Wallet from "../components/icons/Wallet.jsx";
import X from "../components/icons/X.jsx";
import Update from "../components/icons/Update.jsx";
import {
  getUserAchievements,
  getAllAchievements,
} from "../services/api/gameApiService";
import { useQuery } from "@tanstack/react-query";
import {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  getContract,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { somniaTestnet } from "viem/chains";
import ShapeTownAchievementsABI from "../../ShapeTownAchievementsABI.json";

const AchievementImage = ({ tokenId, title, useStarImage = false }) => {
  const { data: imageData, isLoading } = useQuery({
    queryKey: ["achievementImage", tokenId],
    queryFn: async () => {
      const response = await fetch(
        `https://insomnus-backend-production-8a4c3b46c656.herokuapp.com/api/nft/data/${tokenId}`,
      );
      return response.json();
    },
    enabled: !!tokenId && !useStarImage,
  });

  if (useStarImage) {
    return (
      <img
        src="/star.png"
        alt={title}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] object-contain z-10"
      />
    );
  }

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (imageData?.image) {
    return (
      <img
        src={imageData.image}
        alt={title}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] object-contain z-10"
        onError={(e) => {
          e.target.style.display = "none";
          e.target.nextElementSibling.style.display = "flex";
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
      <div className="text-xs font-bold text-yellow-400 mb-1 truncate w-full px-2">
        {title}
      </div>
      <div className="text-xs text-gray-300 opacity-60">No Image</div>
    </div>
  );
};

const Account = () => {
  const { user } = useAuth();
  
  // Add styles for subtle shiny border animation
  const shinyBorderStyle = `
    @keyframes subtle-glow {
      0%, 100% { box-shadow: 0 0 5px rgba(255, 215, 0, 0.3); }
      50% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.6), 0 0 25px rgba(255, 215, 0, 0.3); }
    }
    .shiny-border {
      animation: subtle-glow 3s ease-in-out infinite;
      border: 1px solid rgba(255, 215, 0, 0.4);
    }
  `;

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

  const {
    data: achievementsResponse,
    isLoading: achievementsLoading,
    error: achievementsError,
  } = useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: () => getUserAchievements(user.id),
    enabled: !!user?.id,
  });

  const { data: allAchievements, isLoading: allAchievementsLoading } = useQuery(
    {
      queryKey: ["allAchievements"],
      queryFn: () => getAllAchievements(),
    },
  );

  const { data: mintEligibleData } = useQuery({
    queryKey: ["mintableItems"],
    queryFn: async () => checkMintEligible(),
  });

  console.log(mintEligibleData, "mint");

  const achievements = achievementsResponse?.data || [];

  console.log(allAchievements, "all achievements");

  // Get mintable items from API (up to 6 items)
  const eligibleItems = mintEligibleData?.slice(0, 6) || [];
  const [editingDiscord, setEditingDiscord] = useState(false);
  const [editingX, setEditingX] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [discordUrl, setDiscordUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [usernameValue, setUsernameValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState("");
  const [mintedItems, setMintedItems] = useState(new Set());

  const CONTRACT_ADDRESS = "0x3A711d5E7e4d69eBef1B7e1b3715f463619A254c";

  const handleCloseModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setSelectedAchievement(null);
      setIsModalClosing(false);
      setMintStatus("");
    }, 200);
  };

  const mintAchievement = async (tokenId) => {
    try {
      setIsMinting(true);
      setMintStatus("Connecting to wallet...");

      if (!window.ethereum) {
        setMintStatus("Please install MetaMask to mint achievements");
        setTimeout(() => setMintStatus(""), 5000);
        return;
      }

      // Request account access - this shows MetaMask prompt
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAddress = accounts[0];

      setMintStatus("Please confirm transaction in MetaMask...");

      // Create viem clients using user's MetaMask
      const publicClient = createPublicClient({
        chain: somniaTestnet,
        transport: http(import.meta.env.VITE_RPC_URL),
      });

      // Use user's MetaMask for transaction - this will show MetaMask prompts
      const walletClient = createWalletClient({
        chain: somniaTestnet,
        transport: custom(window.ethereum),
      });

      const contract = getContract({
        address: CONTRACT_ADDRESS,
        abi: ShapeTownAchievementsABI,
        client: { public: publicClient, wallet: walletClient },
      });

      setMintStatus("Minting achievement...");
      const hash = await contract.write.mint([
        userAddress,
        BigInt(tokenId),
        BigInt(1),
        "0x",
      ], { account: userAddress });

      setMintStatus("Waiting for confirmation...");
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      setMintStatus("Notifying backend...");
      // Notify backend about successful mint
      await mintAchievementNFT(tokenId);

      // Add to minted items to remove shiny border
      setMintedItems(prev => new Set([...prev, tokenId]));

      setMintStatus("Achievement minted successfully!");
      console.log("Mint successful! TX:", receipt.transactionHash);
      setTimeout(() => setMintStatus(""), 3000);
    } catch (error) {
      console.error("Minting error:", error);
      if (error.code === 4001) {
        setMintStatus("Transaction rejected by user");
      } else if (error.reason) {
        setMintStatus(`Error: ${error.reason}`);
      } else if (error.message?.includes("insufficient funds")) {
        setMintStatus("Insufficient funds for gas");
      } else {
        setMintStatus("Failed to mint achievement");
      }
      setTimeout(() => setMintStatus(""), 5000);
    } finally {
      setIsMinting(false);
    }
  };

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
      <div className="min-h-screen w-full flex items-center justify-center text-white bg-[#170908]">
        <div className="w-[500px] bg-dark-primary border border-[#392423] p-6">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-600 rounded-full mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-600 rounded w-32 mb-6 animate-pulse"></div>
            <div className="space-y-3 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-dark-primary border border-[#392423]  p-3 h-12 animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col flex-1 text-heading-4-alagard bg-dark-primary">
      <style dangerouslySetInnerHTML={{ __html: shinyBorderStyle }} />
      <h1 className="text-heading-3-alagard p-8" style={{ color: "#ffae0b" }}>
        Profile
      </h1>
      <div className="flex flex-row w-full h-full justify-center p-8 gap-8">
        <div className="flex-1 flex flex-col gap-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-900 text-red-300 rounded text-center font-bold border border-red-600">
              {errorMessage}
            </div>
          )}
          <div className="flex flex-col items-center mb-6 bg-dark-secondary border border-dark-tertiary  p-6">
            <div className="w-30 h-30 rounded-full overflow-hidden">
              <img
                src="/portraits/1.png"
                alt="User Portrait"
                draggable="false"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <div className="flex items-center space-x-2 bg-dark-secondary">
              {editingUsername ? (
                <>
                  <input
                    type="text"
                    value={usernameValue}
                    onChange={(e) => setUsernameValue(e.target.value)}
                    className="bg-dark-primary border border-[#4A2D2A] rounded px-3 py-1 text-white text-xl font-bold text-center"
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
          <div className="space-y-3 bg-dark-secondary">
            <div className="bg-dark-secondary border border-dark-tertiary  p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Wallet className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-white font-medium block">
                    {profileData.walletAddress
                      ? `${profileData.walletAddress.slice(
                          0,
                          6,
                        )}...${profileData.walletAddress.slice(-4)}`
                      : "No wallet"}
                  </span>
                  <span className="text-gray-400 text-sm">Wallet Address</span>
                </div>
              </div>
            </div>
            <div className="bg-dark-secondary border border-dark-tertiary  p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                {editingEmail ? (
                  <input
                    type="text"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    className="bg-dark-primary border border-[#4A2D2A] rounded px-2 py-1 text-white text-sm flex-1"
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
        <div className="flex-1 flex flex-col gap-4 h-full">
          {/* Items Section */}
          <div className="h-1/2 flex flex-col">
            <h2 className="text-2xl font-bold mb-5">Items</h2>
            <div
              className="h-full overflow-y-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#392423 #24110F",
              }}
            >
              <div className="grid grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => {
                  const item = eligibleItems[i];
                  return (
                    <div
                      key={i}
                      className={`relative flex items-center justify-center w-full h-full aspect-square overflow-hidden group ${
                        item && !mintedItems.has(item.tokenId) ? 'shiny-border' : ''
                      }`}
                    >
                      {/* Frame background for Items */}
                      <img
                        src="/Frame-7.png"
                        alt="frame"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                        style={{ zIndex: 0 }}
                      />

                      {item ? (
                        <>
                          {/* Item image */}
                          <AchievementImage
                            tokenId={item.tokenId}
                            title={item.title}
                          />

                          {/* Mint button overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
                            <button
                              onClick={() => mintAchievement(item.tokenId)}
                              disabled={isMinting}
                              className={`px-3 py-1 text-xs font-bold rounded transition-colors ${
                                isMinting
                                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                  : "bg-yellow-600 hover:bg-yellow-700 text-white"
                              }`}
                            >
                              {isMinting ? "Minting..." : "Mint"}
                            </button>
                          </div>

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-30 max-w-48">
                            <div className="font-bold">{item.title}</div>
                            <div className="text-gray-300">
                              {item.description}
                            </div>
                            <div className="text-yellow-400">
                              Click to mint NFT
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Empty slot */
                        <img
                          src="/Frame-8.png"
                          alt="locked frame"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                          style={{ zIndex: 0 }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Achievements Section */}
          <div className="h-1/2 flex flex-col">
            <h2 className="text-2xl font-bold text-heading-4-alagard mb-5">
              Achievement
            </h2>
            <div
              className="h-full overflow-y-auto pr-2 pb-6"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#392423 #24110F",
              }}
            >
              <div className="grid grid-cols-3 gap-6">
                {allAchievementsLoading ? (
                  // Loading state
                  [...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="relative flex items-center justify-center w-full h-full aspect-square overflow-hidden animate-pulse"
                    >
                      <img
                        src="/Frame-7.png"
                        alt="frame"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-50"
                        style={{ zIndex: 0 }}
                      />
                      <img
                        src="/Frame-8.png"
                        alt="frame"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none opacity-50"
                        style={{ zIndex: 0 }}
                      />
                    </div>
                  ))
                ) : allAchievements && allAchievements.length > 0 ? (
                  // All achievements data
                  allAchievements.map((achievement, i) => {
                    // Check if user has earned this achievement
                    const userHasAchievement = achievements?.some(
                      (userAch) => userAch.achievement.id === achievement.id,
                    );

                    return (
                      <div
                        key={achievement.id || i}
                        className={`relative flex items-center justify-center w-full h-full aspect-square overflow-hidden group cursor-pointer ${
                          userHasAchievement ? "" : "opacity-50 grayscale"
                        }`}
                        title={`${achievement.title}: ${achievement.description} (${achievement.points} points) ${userHasAchievement ? "✓ Earned" : "✗ Not earned"}`}
                        onClick={() =>
                          setSelectedAchievement({
                            ...achievement,
                            earned: userHasAchievement,
                          })
                        }
                      >
                        {/* Base frame (background) */}
                        <img
                          src="/Frame-7.png"
                          alt="frame"
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                        />

                        <AchievementImage
                          tokenId={achievement.tokenId}
                          title={achievement.title}
                          useStarImage={true}
                        />

                        {/* Lock frame for unearned achievements */}
                        {!userHasAchievement && (
                          <img
                            src="/Frame-8.png"
                            alt="locked frame"
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
                          />
                        )}

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-30 max-w-48">
                          <div className="font-bold">{achievement.title}</div>
                          <div className="text-gray-300">
                            {achievement.description}
                          </div>
                          <div className="text-yellow-400">
                            {achievement.points} points
                          </div>
                          <div
                            className={
                              userHasAchievement
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {userHasAchievement ? "✓ Earned" : "✗ Not earned"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Empty state
                  <div className="col-span-3 text-center text-gray-400">
                    No achievements available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mint Status Global Display */}
        {mintStatus && (
          <div className="fixed bottom-4 right-4 z-50">
            <div
              className={`p-4 rounded-lg shadow-lg max-w-sm ${
                mintStatus.includes("successfully")
                  ? "bg-green-900/90 text-green-300 border border-green-600"
                  : mintStatus.includes("Error") ||
                      mintStatus.includes("Failed") ||
                      mintStatus.includes("rejected")
                    ? "bg-red-900/90 text-red-300 border border-red-600"
                    : "bg-blue-900/90 text-blue-300 border border-blue-600"
              }`}
            >
              <div className="text-sm font-medium">{mintStatus}</div>
            </div>
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedAchievement(null)}
        >
          <div
            className="bg-dark-primary border border-dark-tertiary p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-yellow-400">
                {selectedAchievement.title}
              </h3>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-24 h-24 flex-shrink-0">
                <img
                  src="/Frame-7.png"
                  alt="frame"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
                />
                <AchievementImage
                  tokenId={selectedAchievement.tokenId}
                  title={selectedAchievement.title}
                  useStarImage={true}
                />
                {!selectedAchievement.earned && (
                  <img
                    src="/Frame-8.png"
                    alt="locked frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="text-gray-300 mb-2">
                  {selectedAchievement.description}
                </div>
                <div className="text-yellow-400 font-bold mb-2">
                  {selectedAchievement.points} Points
                </div>
                <div
                  className={`font-bold ${selectedAchievement.earned ? "text-green-400" : "text-red-400"}`}
                >
                  {selectedAchievement.earned ? "✓ Earned" : "✗ Not Earned"}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-400 mb-4">
              <strong>Token ID:</strong> {selectedAchievement.tokenId}
            </div>

            {selectedAchievement.earned && (
              <div className="bg-green-900/20 border border-green-600/30 p-3 rounded text-green-300 text-sm">
                🎉 Congratulations! You've earned this achievement!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
