import React, { useEffect } from "react";
import StatCard from "../components/cards/StatCard";
import UpgradeCard from "../components/cards/UpgradeCard";
import {
  getAllMaps,
  getUserById,
  getUserStatistics,
  getUpgrades,
  buyUpgrade,
} from "../services/api/gameApiService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { EventBus } from "../game/EventBus";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUserById(user.id),
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

  const upgradeMutation = useMutation({
    mutationFn: buyUpgrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-upgrades"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      
      // Notify GameManager about the upgrade purchase
      EventBus.emit('upgrade-purchased');
      console.log('Dashboard: Upgrade purchased, notified GameManager');
    },
    onError: (error) => {
      console.error("Failed to upgrade:", error);
    },
  });

  const handleUpgrade = (upgradeId) => {
    upgradeMutation.mutate(upgradeId);
  };

  // Listen for dashboard data invalidation after game session ends
  useEffect(() => {
    const handleDashboardInvalidation = () => {
      console.log('Dashboard: Invalidating queries after game session ended');
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-upgrades"] });
      queryClient.invalidateQueries({ queryKey: ["user-maps"] });
    };

    EventBus.on('invalidate-dashboard-data', handleDashboardInvalidation);

    return () => {
      EventBus.removeListener('invalidate-dashboard-data', handleDashboardInvalidation);
    };
  }, [queryClient]);

  console.log("userStats", userStats);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user data</div>;

  return (
    <div className="bg-dark-secondary flex flex-col">
      {/* Stats part */}
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-heading-3-alagard" style={{ color: "#ffae0b" }}>
          Statistics
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard title={"Total Runs"} value={userStats?.totalRuns || 0} />
          <StatCard
            title={"Highest level"}
            value={userStats?.maxSkillLevel || 0}
          />
          <StatCard
            title={"Total Gold Earned"}
            value={userStats?.totalGoldEarned?.toLocaleString() || 0}
          />
          <StatCard
            title={"Enemies Killed"}
            value={userStats?.totalKillPoints || 0}
          />
          <StatCard
            title={"Average survival"}
            value={userStats?.averageSurvival || "00:00"}
          />
          <StatCard
            title={"Longest Survival"}
            value={userStats?.longestSurvival || "00:00"}
          />
        </div>
      </div>
      {/* Upgrade */}
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-heading-3-alagard" style={{ color: "#ffae0b" }}>
          Upgrade
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
            />
          )) || (
            <>
              <UpgradeCard title={"Weapon"} value={"Sword"} />
              <UpgradeCard title={"Armor"} value={"Leather"} />
              <UpgradeCard title={"Shield"} value={"Wooden"} />
              <UpgradeCard title={"Potion"} value={"Health"} />
              <UpgradeCard title={"Spell"} value={"Fireball"} />
              <UpgradeCard title={"Pet"} value={"Wolf"} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
