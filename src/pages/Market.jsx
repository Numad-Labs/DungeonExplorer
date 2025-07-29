import React, { useState } from "react";

const Market = () => {
  const [activeTab, setActiveTab] = useState("weapons");

  const weapons = [
    {
      id: 1,
      name: "Legendary Sword",
      description: "A powerful blade forged by ancient masters. Increases attack by 50.",
      price: 2500,
      rarity: "Legendary",
      stats: "+50 Attack",
      image: "⚔️"
    },
    {
      id: 2,
      name: "Magic Staff",
      description: "Channel arcane energies with this mystical staff. Boosts magic power.",
      price: 1800,
      rarity: "Epic",
      stats: "+35 Magic Power",
      image: "🪄"
    },
    {
      id: 3,
      name: "Iron Dagger",
      description: "A simple but effective blade for quick strikes.",
      price: 500,
      rarity: "Common",
      stats: "+15 Attack, +5 Speed",
      image: "🗡️"
    }
  ];

  const armor = [
    {
      id: 4,
      name: "Dragon Scale Armor",
      description: "Armor crafted from ancient dragon scales. Provides excellent protection.",
      price: 3000,
      rarity: "Legendary",
      stats: "+60 Defense, +20 Fire Resistance",
      image: "🛡️"
    },
    {
      id: 5,
      name: "Leather Boots",
      description: "Comfortable boots that increase movement speed.",
      price: 300,
      rarity: "Common",
      stats: "+10 Speed",
      image: "👢"
    }
  ];

  const consumables = [
    {
      id: 6,
      name: "Health Potion",
      description: "Restores 100 HP instantly.",
      price: 50,
      rarity: "Common",
      stats: "Heal 100 HP",
      image: "🧪"
    },
    {
      id: 7,
      name: "Mana Elixir",
      description: "Restores magical energy for spellcasters.",
      price: 75,
      rarity: "Common",
      stats: "Restore 50 MP",
      image: "🧬"
    },
    {
      id: 8,
      name: "Phoenix Feather",
      description: "Rare item that grants temporary invincibility.",
      price: 1000,
      rarity: "Epic",
      stats: "5 seconds invincibility",
      image: "🪶"
    }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "Common": return "text-gray-400";
      case "Epic": return "text-purple-400";
      case "Legendary": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const renderItems = (items) => {
    return items.map((item) => (
      <div key={item.id} className="bg-dark-secondary border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
        <div className="flex items-start space-x-4">
          <div className="text-4xl">{item.image}</div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-heading-1-pixelify-bold">{item.name}</h3>
              <span className={`text-button-48-pixelify ${getRarityColor(item.rarity)}`}>
                {item.rarity}
              </span>
            </div>
            
            <p className="text-body-1-alagard text-gray-300 mb-3">{item.description}</p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-body-2-pixelify-bold text-green-400">{item.stats}</span>
              <span className="text-heading-1-pixelify-bold text-yellow-400">{item.price} Gold</span>
            </div>
            
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-button-48-pixelify">
              Buy Now
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-display-1-alagard-bold">Market</h1>
        <div className="bg-dark-secondary border border-gray-700 rounded-lg px-4 py-2">
          <span className="text-body-1-alagard text-yellow-400">💰 Your Gold: 1,250</span>
        </div>
      </div>
      
      <div className="flex space-x-1 mb-6 bg-dark-secondary rounded-lg p-1">
        <button
          onClick={() => setActiveTab("weapons")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "weapons"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Weapons
        </button>
        <button
          onClick={() => setActiveTab("armor")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "armor"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Armor
        </button>
        <button
          onClick={() => setActiveTab("consumables")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "consumables"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Consumables
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeTab === "weapons" && renderItems(weapons)}
        {activeTab === "armor" && renderItems(armor)}
        {activeTab === "consumables" && renderItems(consumables)}
      </div>
      
      <div className="mt-8 bg-dark-secondary border border-gray-700 rounded-lg p-6">
        <h2 className="text-heading-1-pixelify-bold mb-4">Sell Your Items</h2>
        <p className="text-body-1-alagard text-gray-300 mb-4">
          Got items cluttering your inventory? Sell them here for gold!
        </p>
        <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition-colors text-button-48-pixelify">
          Open Inventory
        </button>
      </div>
    </div>
  );
};

export default Market;