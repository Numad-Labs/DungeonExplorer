import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getGlobalScores,
  getGlobalKillCounts,
} from "../services/api/gameApiService";

const Leaderboard = () => {
  const [sortOrder, setSortOrder] = useState("descending");
  const [sortField, setSortField] = useState("score");

  // Fetch global scores
  const {
    data: scoresData,
    isLoading: scoresLoading,
    isError: scoresError,
    error: scoresErrorData,
  } = useQuery({
    queryKey: ["globalScores"],
    queryFn: getGlobalScores,
  });

  // Fetch global kill counts
  const {
    data: killsData,
    isLoading: killsLoading,
    isError: killsError,
    error: killsErrorData,
  } = useQuery({
    queryKey: ["globalKillCounts"],
    queryFn: getGlobalKillCounts,
  });

  // Determine which data to use based on sortField
  const isLoading = sortField === "killCount" ? killsLoading : scoresLoading;
  const isError = sortField === "killCount" ? killsError : scoresError;
  const error = sortField === "killCount" ? killsErrorData : scoresErrorData;
  const leaderboardData = sortField === "killCount" ? killsData : scoresData;

  if (isLoading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-white">
        Failed to load leaderboard.
        <br />
        {JSON.stringify(error)}
      </div>
    );
  }

  console.log("Leaderboard data:", leaderboardData);

  // Sort the data based on selected field and order
  const sortedData = leaderboardData?.data
    ? [...leaderboardData.data].sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case "killCount":
            aValue = a.killCount || a.kills || 0;
            bValue = b.killCount || b.kills || 0;
            break;
          case "experience":
            aValue = a.experience || 0;
            bValue = b.experience || 0;
            break;
          case "gold":
            aValue = a.gold || 0;
            bValue = b.gold || 0;
            break;
          default: // score
            aValue = a.score || 0;
            bValue = b.score || 0;
            break;
        }

        if (sortOrder === "ascending") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col text-white pl-6 pr-6">
      <div className="flex items-center justify-between mb-6 px-8">
        <h1 className="font-alagard font-medium text-[#FFAE0B] text-3xl leading-10">
          Leaderboard
        </h1>
        <div className="flex items-center  space-x-4 pt-6">
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-dark-secondary rounded px-3 py-2 text-white appearance-none cursor-pointer pr-8 w-full h-full"
            >
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <div className="relative ">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-dark-secondary rounded px-3 py-2 text-white appearance-none cursor-pointer pr-8 w-full h-full"
            >
              <option value="score">Score</option>
              <option value="killCount">Kill Count</option>
              <option value="experience">Experience</option>
              <option value="gold">Gold</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-dark-secondary  border border-[#24110F] rounded-lg overflow-hidden w-full">
        <div className="bg-[#24110F] border-b border-[#2F1A18] px-6 py-4">
          <h2 className="text-heading-1-pixelify-bold text-[#FFAE0B]">
            Top Players
          </h2>
        </div>
        <div className="divide-y divide-[#2F1A18] min-h-screen max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[#392423] scrollbar-track-[#24110F] hover:scrollbar-thumb-[#4A2D2A]">
          {sortedData.map((player, idx) => (
            <div
              key={player.id || idx}
              className={`px-6 py-4 flex items-center justify-between hover:bg-translucent-light-4 transition-colors`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center border-2 border-[#392423] bg-[#2F1A18] p-1 w-12 h-9">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-body-1-alagard font-bold">
                    {player.username || player.name}
                  </p>
                  {/* Add more player info if available */}
                </div>
              </div>
              <div className="text-right">
                <p className="text-body-1-alagard font-bold">
                  {sortField === "killCount"
                    ? `${player.killCount || player.kills || 0} kills`
                    : sortField === "experience"
                    ? `${player.experience?.toLocaleString() || 0} XP`
                    : sortField === "gold"
                    ? `${player.gold?.toLocaleString() || 0} gold`
                    : `${player.score?.toLocaleString()} pts`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* ...rest of your summary cards... */}
    </div>
  );
};

export default Leaderboard;
