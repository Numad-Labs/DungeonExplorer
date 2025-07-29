import React, { useState } from "react";

const Quest = () => {
  const [activeTab, setActiveTab] = useState("available");

  const availableQuests = [
    {
      id: 1,
      title: "The Dragon's Treasure",
      description: "Defeat the ancient dragon and claim its legendary treasure hoard.",
      difficulty: "Hard",
      reward: "2,500 XP + 1,000 Gold",
      location: "Dragon's Lair",
      status: "available"
    },
    {
      id: 2,
      title: "Goblin Camp Raid",
      description: "Clear out the goblin encampment terrorizing nearby villages.",
      difficulty: "Medium",
      reward: "800 XP + 300 Gold",
      location: "Dark Forest",
      status: "available"
    },
    {
      id: 3,
      title: "Collect Mystic Herbs",
      description: "Gather rare herbs for the village alchemist's potion brewing.",
      difficulty: "Easy",
      reward: "400 XP + Healing Potion",
      location: "Enchanted Grove",
      status: "available"
    }
  ];

  const activeQuests = [
    {
      id: 4,
      title: "Rescue the Princess",
      description: "Save Princess Elena from the tower of the evil sorcerer.",
      difficulty: "Hard",
      reward: "3,000 XP + Royal Blessing",
      location: "Sorcerer's Tower",
      progress: "2/3 objectives completed",
      status: "active"
    }
  ];

  const completedQuests = [
    {
      id: 5,
      title: "Bandit Hideout",
      description: "Eliminated the bandit leader and recovered stolen goods.",
      difficulty: "Medium",
      reward: "1,200 XP + 500 Gold",
      location: "Mountain Pass",
      status: "completed"
    },
    {
      id: 6,
      title: "Spider Nest Cleanup",
      description: "Cleared the giant spider nest from the old mine.",
      difficulty: "Easy",
      reward: "600 XP + Spider Silk",
      location: "Abandoned Mine",
      status: "completed"
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "text-green-400";
      case "Medium": return "text-yellow-400";
      case "Hard": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const renderQuests = (quests) => {
    return quests.map((quest) => (
      <div key={quest.id} className="bg-dark-secondary border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-heading-1-pixelify-bold">{quest.title}</h3>
          <span className={`text-button-48-pixelify ${getDifficultyColor(quest.difficulty)}`}>
            {quest.difficulty}
          </span>
        </div>
        
        <p className="text-body-1-alagard text-gray-300 mb-4">{quest.description}</p>
        
        <div className="space-y-2 mb-4">
          <p className="text-body-2-pixelify-bold">
            <span className="text-gray-400">Location:</span> {quest.location}
          </p>
          <p className="text-body-2-pixelify-bold">
            <span className="text-gray-400">Reward:</span> {quest.reward}
          </p>
          {quest.progress && (
            <p className="text-body-2-pixelify-bold">
              <span className="text-gray-400">Progress:</span> {quest.progress}
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          {quest.status === "available" && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-button-48-pixelify">
              Accept Quest
            </button>
          )}
          {quest.status === "active" && (
            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors text-button-48-pixelify">
              Continue
            </button>
          )}
          {quest.status === "completed" && (
            <span className="text-green-400 text-button-48-pixelify">Completed ✓</span>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-display-1-alagard-bold mb-6">Quests</h1>
      
      <div className="flex space-x-1 mb-6 bg-dark-secondary rounded-lg p-1">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "available"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Available ({availableQuests.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "active"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Active ({activeQuests.length})
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "completed"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Completed ({completedQuests.length})
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === "available" && renderQuests(availableQuests)}
        {activeTab === "active" && renderQuests(activeQuests)}
        {activeTab === "completed" && renderQuests(completedQuests)}
      </div>
    </div>
  );
};

export default Quest;