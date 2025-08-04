import React, { useEffect, useState } from "react";
import StatCard from "../components/cards/StatCard";
import UpgradeCard from "../components/cards/UpgradeCard";
import {
  getAllMaps,
  getUserById,
  getUserStatistics,
  getUpgrades,
  buyUpgrade,
  getGlobalScores,
} from "../services/api/gameApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { EventBus } from "../game/EventBus";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [responseMessage, setResponseMessage] = useState("");

  const scrollbarStyles = {
    scrollbarWidth: "thin",
    scrollbarColor: "#FFAE0B #2D3748",
  };

  const scrollbarClass = `
    scrollbar-thin 
    scrollbar-track-gray-800 
    scrollbar-thumb-[#FFAE0B] 
    scrollbar-thumb-rounded-full 
    hover:scrollbar-thumb-[#FFAE0B]/80
    [&::-webkit-scrollbar]:w-2
    [&::-webkit-scrollbar-track]:bg-gray-800
    [&::-webkit-scrollbar-thumb]:bg-[#FFAE0B]
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-[#FFAE0B]/80
  `;

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", user.id],
    queryFn: () => getUserById(user.id),
    enabled: !!user?.id,
  });

  const { data: maps } = useQuery({
    queryKey: ["user-maps"],
    queryFn: () => getAllMaps(),
  });

  const { data: userStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => getUserStatistics(),
  });

  const { data: upgrades } = useQuery({
    queryKey: ["user-upgrades"],
    queryFn: () => getUpgrades(),
  });

  const { data: globalRank } = useQuery({
    queryKey: ["user-global-rank"],
    queryFn: async () => {
      try {
        console.log("Fetching global scores...");
        const globalScores = await getGlobalScores();
        console.log("Global scores response:", globalScores);

        // Handle different response structures
        const scoresData = globalScores?.data || globalScores || [];
        console.log("Scores data:", scoresData);

        // Find user by ID or username
        const userRank = scoresData.findIndex(
          (player) =>
            player.userId === user?.id ||
            player.id === user?.id ||
            player.username === user?.data?.username ||
            player.username === user?.username
        );

        console.log("User rank found:", userRank);
        const rank = userRank !== -1 ? userRank + 1 : "N/A";
        console.log("Final rank:", rank);
        return rank;
      } catch (error) {
        console.error("Failed to get global rank:", error);
        return "N/A";
      }
    },
    enabled: !!user?.id,
  });

  const upgradeMutation = useMutation({
    mutationFn: buyUpgrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-upgrades"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });

      // Notify GameManager about the upgrade purchase
      EventBus.emit("upgrade-purchased");
      console.log("Dashboard: Upgrade purchased, notified GameManager");

      // Show success message
      setResponseMessage("Upgrade successful!");
      setTimeout(() => setResponseMessage(""), 3000);
    },
    onError: (error) => {
      console.error("Failed to upgrade:", error);

      // Show specific error message based on the response
      let errorMessage = "Failed to upgrade. Please try again.";

      if (error.response?.data?.error?.message) {
        // Show the specific error message from the server
        errorMessage = error.response.data.error.message;
      } else if (error.response?.status === 400) {
        // Common 400 error - likely insufficient gold
        errorMessage = "Insufficient gold to purchase this upgrade!";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.response?.status === 404) {
        errorMessage = "Upgrade not found.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      // Show error message
      setResponseMessage(errorMessage);
      setTimeout(() => setResponseMessage(""), 5000); // Show error for 5 seconds
    },
  });

  const handleUpgrade = (upgradeId) => {
    upgradeMutation.mutate(upgradeId);
  };

  console.log("globalRank", globalRank);

  // Listen for dashboard data invalidation after game session ends
  useEffect(() => {
    const handleDashboardInvalidation = () => {
      console.log("Dashboard: Invalidating queries after game session ended");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-upgrades"] });
      queryClient.invalidateQueries({ queryKey: ["user-maps"] });
    };

    EventBus.on("invalidate-dashboard-data", handleDashboardInvalidation);

    return () => {
      EventBus.removeListener(
        "invalidate-dashboard-data",
        handleDashboardInvalidation
      );
    };
  }, [queryClient]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user data</div>;

  return (
    <div className="min-h-screen flex flex-col text-white pl-6 pr-6">
      {/* Response message */}
      {responseMessage && (
        <div className="p-4 mb-4 bg-yellow-900 text-[#ffae0b] rounded text-center font-bold shadow border border-[#ffae0b]">
          {responseMessage}
        </div>
      )}

      {/* Stats part */}
      <div className="p-6 flex flex-col gap-6 border border-[#24110F] rounded-lg bg-dark-secondary mb-6">
        <h1 className="text-heading-3-alagard" style={{ color: "#ffae0b" }}>
          Statistics
        </h1>
        <div className="grid grid-cols-2 minh-screen md:grid-cols-3 gap-6">
          <StatCard
            title={"Current Gold"}
            value={userData?.data?.gold?.toLocaleString() || 0}
            titleStyle="text-body-2-pixelify text-[#ffae0b]"
          />
          <StatCard
            title={"Global Rank"}
            value={globalRank || "Loading..."}
            titleStyle="text-body-2-pixelify text-[#ffae0b]"
          />
          <StatCard
            title={"Total Runs"}
            value={userStats?.totalRuns || 0}
            titleStyle="text-body-2-pixelify text-[#ffae0b]"
          />
          <StatCard
            title={"Highest level"}
            value={userStats?.maxSkillLevel || 0}
            titleStyle="text-body-2-pixelify text-[#ffae0b]"
          />
          <StatCard
            title={"Total Gold Earned"}
            value={userStats?.totalGoldEarned?.toLocaleString() || 0}
            titleStyle="text-body-2-pixelify text-[#ffae0b]"
          />
          <StatCard
            title={"Enemies Killed"}
            value={userStats?.totalKillPoints || 0}
            titleStyle="text-body-2-pixelify text-[#ffae0b]"
          />
          <StatCard
            title={"Average survival"}
            value={userStats?.averageSurvival || "00:00"}
            titleStyle="text-body-2-pixelify text-[#ffae0b]"
          />
          <StatCard
            title={"Longest Survival"}
            value={userStats?.longestSurvival || "00:00"}
            titleStyle="text-body-2-pixelify text-[#ffae0b]"
          />
        </div>
      </div>

      {/* Upgrade */}
      <div className="bg-dark-secondary border border-[#24110F] rounded-lg overflow-hidden w-full">
        <div className="bg-[#24110F] border-b border-[#2F1A18]">
          <h2 className="text-heading-1-pixelify-bold text-[#FFAE0B]">
            Upgrades
          </h2>
        </div>
        <div
          className={`p-6 max-h-96 overflow-y-auto ${scrollbarClass}`}
          style={scrollbarStyles}
        >
          <div className="grid grid-cols-2 md:grid-cols-3  gap-6">
            {upgrades?.data?.map((upgrade) => (
              <UpgradeCard
                key={upgrade.id}
                title={upgrade.name}
                value={`Level ${upgrade.level}`}
                progress={upgrade.progress}
                description={upgrade.description}
                onUpgrade={handleUpgrade}
                isMaxed={upgrade.isMaxed}
                upgradeId={upgrade.id}
                upgradeCost={upgrade.cost || upgrade.upgradeCost || 0}
              />
            )) || (
              <>
                <UpgradeCard
                  title={"Weapon"}
                  value={"Sword"}
                  upgradeCost={100}
                />
                <UpgradeCard
                  title={"Armor"}
                  value={"Leather"}
                  upgradeCost={150}
                />
                <UpgradeCard
                  title={"Shield"}
                  value={"Wooden"}
                  upgradeCost={120}
                />
                <UpgradeCard
                  title={"Potion"}
                  value={"Health"}
                  upgradeCost={80}
                />
                <UpgradeCard
                  title={"Spell"}
                  value={"Fireball"}
                  upgradeCost={200}
                />
                <UpgradeCard title={"Pet"} value={"Wolf"} upgradeCost={300} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
