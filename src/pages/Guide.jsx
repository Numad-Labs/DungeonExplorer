import React, { useState } from "react";

const Guide = () => {
  const [activeSection, setActiveSection] = useState("getting-started");

  const guideContent = {
    "getting-started": {
      title: "Getting Started",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-heading-1-pixelify-bold mb-3">Welcome to Dungeon Explorer!</h3>
            <p className="text-body-1-alagard text-gray-300 mb-4">
              Embark on an epic adventure through mysterious dungeons filled with treasures, monsters, and ancient secrets.
            </p>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Basic Controls:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>WASD - Move your character</li>
              <li>Mouse - Look around</li>
              <li>E - Interact with objects</li>
              <li>Space - Jump</li>
              <li>Shift - Run</li>
              <li>ESC - Open menu</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Your First Quest:</h4>
            <p className="text-body-1-alagard text-gray-300">
              Start by visiting the Quest tab to accept your first mission. Begin with easier quests to gain experience and equipment.
            </p>
          </div>
        </div>
      )
    },
    "combat": {
      title: "Combat System",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-heading-1-pixelify-bold mb-3">Master the Art of Battle</h3>
            <p className="text-body-1-alagard text-gray-300 mb-4">
              Combat in Dungeon Explorer requires strategy, timing, and the right equipment.
            </p>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Combat Controls:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>Left Click - Primary attack</li>
              <li>Right Click - Block/Defend</li>
              <li>Q - Use equipped skill</li>
              <li>1-5 - Use items from hotbar</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Combat Tips:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>Study enemy attack patterns</li>
              <li>Use terrain to your advantage</li>
              <li>Keep health potions handy</li>
              <li>Don't fight multiple enemies at once</li>
            </ul>
          </div>
        </div>
      )
    },
    "items": {
      title: "Items & Equipment",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-heading-1-pixelify-bold mb-3">Gear Up for Adventure</h3>
            <p className="text-body-1-alagard text-gray-300 mb-4">
              Equipment and items are essential for surviving the dangerous dungeons ahead.
            </p>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Item Rarities:</h4>
            <ul className="text-body-1-alagard space-y-2">
              <li><span className="text-gray-400">Common</span> - Basic items found everywhere</li>
              <li><span className="text-purple-400">Epic</span> - Rare items with special properties</li>
              <li><span className="text-yellow-400">Legendary</span> - Extremely rare and powerful</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Equipment Types:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>Weapons - Swords, staffs, daggers</li>
              <li>Armor - Chest, legs, boots, gloves</li>
              <li>Accessories - Rings, amulets</li>
              <li>Consumables - Potions, scrolls</li>
            </ul>
          </div>
        </div>
      )
    },
    "progression": {
      title: "Character Progression",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-heading-1-pixelify-bold mb-3">Grow Stronger</h3>
            <p className="text-body-1-alagard text-gray-300 mb-4">
              Develop your character through experience, skills, and equipment upgrades.
            </p>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Experience & Levels:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>Gain XP by defeating enemies and completing quests</li>
              <li>Level up to increase base stats</li>
              <li>Unlock new abilities and equipment</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Skill Development:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>Practice skills to improve them</li>
              <li>Specialize in combat, magic, or stealth</li>
              <li>Unlock powerful abilities</li>
            </ul>
          </div>
        </div>
      )
    },
    "tips": {
      title: "Pro Tips",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-heading-1-pixelify-bold mb-3">Advanced Strategies</h3>
            <p className="text-body-1-alagard text-gray-300 mb-4">
              Master these techniques to become a legendary dungeon explorer.
            </p>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Resource Management:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>Always carry health potions</li>
              <li>Manage your inventory space wisely</li>
              <li>Save rare items for tough battles</li>
              <li>Sell unwanted equipment for gold</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Exploration Tips:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>Check every corner for hidden treasures</li>
              <li>Look for secret passages and switches</li>
              <li>Map out dungeon layouts mentally</li>
              <li>Return to town frequently to resupply</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-body-2-pixelify-bold mb-2">Social Features:</h4>
            <ul className="text-body-1-alagard text-gray-300 space-y-1 list-disc list-inside">
              <li>Check the leaderboard to see top players</li>
              <li>Learn from other players' strategies</li>
              <li>Share your achievements with friends</li>
            </ul>
          </div>
        </div>
      )
    }
  };

  const sections = [
    { id: "getting-started", label: "Getting Started", icon: "🎮" },
    { id: "combat", label: "Combat", icon: "⚔️" },
    { id: "items", label: "Items & Equipment", icon: "🎒" },
    { id: "progression", label: "Character Progression", icon: "📈" },
    { id: "tips", label: "Pro Tips", icon: "💡" }
  ];

  return (
    <div className="p-8 text-white">
      <h1 className="text-display-1-alagard-bold mb-6">Player Guide</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-dark-secondary border border-gray-700 rounded-lg p-4 sticky top-4">
            <h2 className="text-heading-1-pixelify-bold mb-4">Sections</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left flex items-center space-x-3 p-3 rounded-md transition-colors text-button-48-pixelify ${
                    activeSection === section.id
                      ? "bg-translucent-light-8 text-light-primary"
                      : "text-gray-400 hover:bg-translucent-light-4 hover:text-light-primary"
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-dark-secondary border border-gray-700 rounded-lg p-8">
            <h2 className="text-display-1-alagard-bold mb-6">
              {guideContent[activeSection].title}
            </h2>
            {guideContent[activeSection].content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;