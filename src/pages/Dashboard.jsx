import React from "react";
import StatCard from "../components/cards/StatCard";
import UpgradeCard from "../components/cards/UpgradeCard";
import { getUserById } from "../services/api/gameApiService";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUserById(user.id),
  });

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
          <StatCard title={"Total Runs"} value={24} />
          <StatCard title={"Highest level"} value={24} />
          <StatCard title={"Total Gold Earned"} value={"343’242"} />
          <StatCard title={"Enemies Killed"} value={24} />
          <StatCard title={"Average survival"} value={"0 : 45"} />
          <StatCard title={"Longest Survival"} value={"1 : 23"} />
        </div>
      </div>
      {/* Upgrade */}
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-heading-3-alagard" style={{ color: "#ffae0b" }}>
          Upgrade
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <UpgradeCard title={"Weapon"} value={"Sword"} />
          <UpgradeCard title={"Armor"} value={"Leather"} />
          <UpgradeCard title={"Shield"} value={"Wooden"} />
          <UpgradeCard title={"Potion"} value={"Health"} />
          <UpgradeCard title={"Spell"} value={"Fireball"} />
          <UpgradeCard title={"Pet"} value={"Wolf"} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
