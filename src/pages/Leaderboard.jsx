import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getGlobalScores,
  getGlobalKillCounts,
} from "../services/api/gameApiService";

const Leaderboard = () => {
  const { user } = useAuth();
  const [sortField, setSortField] = useState("experience");
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
    data: scoresData,
    isLoading: scoresLoading,
    isError: scoresError,
    error: scoresErrorData,
  } = useQuery({
    queryKey: ["globalScores"],
    queryFn: getGlobalScores,
  });
  const {
    data: killsData,
    isLoading: killsLoading,
    isError: killsError,
    error: killsErrorData,
  } = useQuery({
    queryKey: ["globalKillCounts"],
    queryFn: getGlobalKillCounts,
  });
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
  const sortedData = leaderboardData?.data
    ? [...leaderboardData.data].sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case "killCount":
            aValue = a.killPoints || 0;
            bValue = b.killPoints || 0;
            break;
          case "experience":
            aValue = a.experience || 0;
            bValue = b.experience || 0;
            break;
          case "gold":
            aValue = a.gold || 0;
            bValue = b.gold || 0;
            break;
          case "totalGames":
            aValue = a.totalGames || 0;
            bValue = b.totalGames || 0;
            break;
          default:
            aValue = a.experience || 0;
            bValue = b.experience || 0;
            break;
        }

        return aValue < bValue ? 1 : -1;
      })
    : [];

  const userRank =
    sortedData.findIndex((player) => {
      return (
        player.walletAddress === user?.walletAddress ||
        player.username === user?.username
      );
    }) + 1;

  const userPlayer = sortedData.find((player) => {
    return (
      player.walletAddress === user?.walletAddress ||
      player.username === user?.username
    );
  });

  // Show top 10 + user if user is not in top 10
  const displayData = userRank > 0 && userRank <= 10 
    ? sortedData.slice(0, 10) 
    : [...sortedData.slice(0, 10), userPlayer].filter(Boolean);

  return (
    <div className="h-full bg-dark-primary flex flex-col text-white px-4 sm:px-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-secondary-500 py-10 gap-4">
        <h1 className="text-heading-2-alagard">Leaderboard</h1>
        <div className="flex outline-none   bg-translucent-light-8 items-center">
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="bg-translucent-light-8 outline-none focus:outline-none active:outline-none rounded px-3 py-2 text-white appearance-none cursor-pointer pr-8 w-full h-full text-sm sm:text-base"
            >
              <option value="experience">Experience</option>
              <option value="killCount">Kill Points</option>
              <option value="gold">Gold</option>
              <option value="totalGames">Games Played</option>
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

      <div className="bg-dark-secondary border border-[#24110F] pb-10 rounded-lg overflow-hidden w-full flex flex-col flex-1">
        {/* Table Header */}
        <div className="bg-dark-secondary border-b border-[#2F1A18] px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="w-8 sm:w-12 flex justify-center">
              <span className="text-body-1-pixelify text-light-tertiary font-bold">
                #
              </span>
            </div>
            <div>
              <span className="text-body-1-pixelify text-light-tertiary font-bold">
                Player
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-body-1-pixelify text-light-tertiary">
              {sortField === "killCount"
                ? "Kill Points"
                : sortField === "experience"
                  ? "Experience"
                  : sortField === "gold"
                    ? "Gold"
                    : sortField === "totalGames"
                      ? "Games Played"
                      : "Experience"}
            </span>
          </div>
        </div>
        <div
          className={`divide-y divide-[#2F1A18] flex-1 overflow-y-auto ${scrollbarClass}`}
          style={scrollbarStyles}
        >
          {displayData.map((player, idx) => {
            const isCurrentUser =
              (player.walletAddress && user?.walletAddress && player.walletAddress === user.walletAddress) ||
              (player.username && user?.username && player.username === user.username);
            // Show actual rank, not just index + 1
            const playerRank = isCurrentUser && userRank > 10 ? userRank : idx + 1;
            const isUserOutsideTop10 = isCurrentUser && userRank > 10;
            return (
              <div key={`${player.id || idx}-${isCurrentUser ? 'user' : 'other'}`}>
                {/* Show separator if this is the user and they're outside top 10 */}
                {isUserOutsideTop10 && idx === 10 && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex-1 h-px bg-[#2F1A18]"></div>
                    <span className="px-4 text-sm text-light-tertiary">...</span>
                    <div className="flex-1 h-px bg-[#2F1A18]"></div>
                  </div>
                )}
                <div
                  className={` p-4 flex items-center justify-between transition-colors ${
                    isCurrentUser
                      ? "bg-gradient-to-r from-[#FFAE0B]/30 to-transparent border-2 border-[#FFAE0B] shadow-lg shadow-[#FFAE0B]/20"
                      : "hover:bg-translucent-light-4"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center border-2 border-[#392423] bg-dark-secondary p-1 w-12 h-9">
                      {playerRank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-body-1-alagard font-bold">
                          {player.username || player.name}
                        </p>
                        {isCurrentUser && (
                          <span className="bg-[#FFAE0B] text-black px-2 py-1 rounded text-xs font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body-1-alagard font-bold">
                      {sortField === "killCount"
                        ? `${(player.killPoints || 0).toLocaleString()} kills`
                        : sortField === "experience"
                          ? `${(player.experience || 0).toLocaleString()} XP`
                          : sortField === "gold"
                            ? `${(player.gold || 0).toLocaleString()} gold`
                            : sortField === "totalGames"
                              ? `${(player.totalGames || 0).toLocaleString()} games`
                              : `${(player.experience || 0).toLocaleString()} XP`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Leaderboard;
