import React from "react";
import StatCard from "../components/cards/StatCard";
import { getUserById } from "../services/api/gameApiService";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  console.log(user);
  // const {
  //   data: userData,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ["user"],
  //   queryFn: () => getUserById(user.id),
  // });

  // if (isLoading) return <div>Loading...</div>;
  // if (error) return <div>Error loading user data</div>;

  return (
    <div className="bg-dark-secondary flex flex-col">
      {/* Stats part */}
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-heading-3-alagard" style={{ color: "#ffae0b" }}>
          Statistics
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard />
          <StatCard />
          <StatCard />
          <StatCard />
          <StatCard />
          <StatCard />
        </div>
      </div>
      {/* Upgrade */}
      <div className="p-6 flex flex-col gap-6">
        <h1 className="text-heading-3-alagard" style={{ color: "#ffae0b" }}>
          Upgrade
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <StatCard />
          <StatCard />
          <StatCard />
          <StatCard />
          <StatCard />
          <StatCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
