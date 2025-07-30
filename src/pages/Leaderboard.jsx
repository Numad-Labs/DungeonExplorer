import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getGlobalScores } from "../services/api/gameApiService";

const Leaderboard = () => {
  // Fetch global scores
  const {
    data: leaderboardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["globalScores"],
    queryFn: getGlobalScores,
  });

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

  return (
    <div className="p-8 text-white">
      <h1
        className="font-alagard font-medium mb-6"
        style={{
          color: "#FFAE0B",
          fontSize: "32px",
          lineHeight: "40px",
        }}
      >
        Leaderboard
      </h1>
      <div className="bg-dark-secondary border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-translucent-light-8 px-6 py-4">
          <h2 className="text-heading-1-pixelify-bold">Top Players</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {leaderboardData?.data?.map((player, idx) => (
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
                  {player.score?.toLocaleString()} pts
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
