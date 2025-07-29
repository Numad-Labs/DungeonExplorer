import React from "react";

const Leaderboard = () => {
  const leaderboardData = [
    { rank: 1, player: "DragonSlayer", level: 25, score: 15420 },
    { rank: 2, player: "ShadowHunter", level: 23, score: 14890 },
    { rank: 3, player: "MysticWizard", level: 22, score: 13760 },
    { rank: 4, player: "IronKnight", level: 21, score: 12540 },
    { rank: 5, player: "StealthRogue", level: 20, score: 11230 },
    { rank: 6, player: "FireMage", level: 19, score: 10890 },
    { rank: 7, player: "BeastTamer", level: 18, score: 9870 },
    { rank: 8, player: "LightPaladin", level: 17, score: 8940 },
    { rank: 9, player: "DarkAssassin", level: 16, score: 7820 },
    { rank: 10, player: "You", level: 15, score: 6750 },
  ];

  return (
    <div className="p-8 text-white">
      <h1 className="text-display-1-alagard-bold mb-6">Leaderboard</h1>
      
      <div className="bg-dark-secondary border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-translucent-light-8 px-6 py-4">
          <h2 className="text-heading-1-pixelify-bold">Top Players</h2>
        </div>
        
        <div className="divide-y divide-gray-700">
          {leaderboardData.map((player) => (
            <div 
              key={player.rank} 
              className={`px-6 py-4 flex items-center justify-between hover:bg-translucent-light-4 transition-colors ${
                player.player === "You" ? "bg-translucent-light-8" : ""
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-button-48-pixelify ${
                  player.rank <= 3 ? "bg-yellow-600" : "bg-gray-600"
                }`}>
                  {player.rank}
                </div>
                <div>
                  <p className="text-body-1-alagard font-bold">{player.player}</p>
                  <p className="text-body-2-pixelify-bold text-gray-400">Level {player.level}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-body-1-alagard font-bold">{player.score.toLocaleString()} pts</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
          <h3 className="text-heading-1-pixelify-bold mb-3">Your Rank</h3>
          <p className="text-display-1-alagard-bold text-yellow-400">#10</p>
        </div>
        
        <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
          <h3 className="text-heading-1-pixelify-bold mb-3">Your Score</h3>
          <p className="text-display-1-alagard-bold text-blue-400">6,750</p>
        </div>
        
        <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
          <h3 className="text-heading-1-pixelify-bold mb-3">Points to Next</h3>
          <p className="text-display-1-alagard-bold text-green-400">1,070</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;