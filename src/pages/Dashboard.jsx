import React from "react";

const Dashboard = () => {
  return (
    <div className="p-8 text-white">
      <h1 className="text-display-1-alagard-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
          <h2 className="text-heading-1-pixelify-bold mb-4">Player Stats</h2>
          <div className="space-y-2">
            <p className="text-body-1-alagard">Level: 15</p>
            <p className="text-body-1-alagard">Experience: 2,450 XP</p>
            <p className="text-body-1-alagard">Gold: 1,250</p>
            <p className="text-body-1-alagard">Health: 100/100</p>
          </div>
        </div>
        
        <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
          <h2 className="text-heading-1-pixelify-bold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            <p className="text-body-2-pixelify-bold">Completed Quest: Dragon's Lair</p>
            <p className="text-body-2-pixelify-bold">Earned 500 XP</p>
            <p className="text-body-2-pixelify-bold">Found Legendary Sword</p>
            <p className="text-body-2-pixelify-bold">Defeated 3 enemies</p>
          </div>
        </div>
        
        <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
          <h2 className="text-heading-1-pixelify-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-translucent-light-8 hover:bg-translucent-light-12 text-light-primary py-2 px-4 rounded transition-colors text-button-48-pixelify">
              Continue Adventure
            </button>
            <button className="w-full bg-translucent-light-8 hover:bg-translucent-light-12 text-light-primary py-2 px-4 rounded transition-colors text-button-48-pixelify">
              View Inventory
            </button>
            <button className="w-full bg-translucent-light-8 hover:bg-translucent-light-12 text-light-primary py-2 px-4 rounded transition-colors text-button-48-pixelify">
              Check Quests
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;