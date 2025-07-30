import React, { useState } from "react";

const Guide = () => {
  const [activeTab, setActiveTab] = useState("faq");

  const tabContent = {
    faq: {
      content: (
        <div className="space-y-8 bg-dark-secondary">
          <div>
            <h3 className="text-heading-1-pixelify-bold mb-4">How to Play?</h3>
            <p className="text-body-1-alagard text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>

          <div>
            <h3 className="text-heading-1-pixelify-bold mb-4">
              Is it free to play?
            </h3>
            <div className="mb-4">
              {/* Placeholder for pixel art image */}
              <div className="w-full h-48 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
                <span className="text-gray-400">
                  Pixel Art Image Placeholder
                </span>
              </div>
            </div>
            <p className="text-body-1-alagard text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </div>
      ),
    },
    skill: {
      content: (
        <div className="space-y-6 bg-dark-secondary">
          <h3 className="text-heading-1-pixelify-bold mb-4">Skill System</h3>
          <p className="text-body-1-alagard text-gray-300">
            Skills are essential abilities that enhance your character's combat
            effectiveness and survival capabilities.
          </p>
          {/* Add skill content here */}
        </div>
      ),
    },
    defense: {
      content: (
        <div className="space-y-6 bg-dark-secondary">
          <h3 className="text-heading-1-pixelify-bold mb-4">
            Defense Mechanics
          </h3>
          <p className="text-body-1-alagard text-gray-300">
            Understanding defense mechanics is crucial for surviving the
            dangerous dungeons and boss encounters.
          </p>
          {/* Add defense content here */}
        </div>
      ),
    },
    stats: {
      content: (
        <div className="space-y-6 bg-dark-secondary">
          <h3 className="text-heading-1-pixelify-bold mb-4">
            Character Statistics
          </h3>
          <p className="text-body-1-alagard text-gray-300">
            Your character's stats determine their effectiveness in combat and
            exploration.
          </p>
          {/* Add stats content here */}
        </div>
      ),
    },
  };

  const tabs = [
    { id: "faq", label: "FAQ" },
    { id: "skill", label: "Skill" },
  ];

  return (
    <div className="text-white flex flex-col absolute w-[1176px] h-[944px] top-20 left-64 bg-dark-secondary pt-12 pr-6 pb-12 pl-6 gap-6">
      <h1 className="text-display-1-alagard-bold text-left text-[#FFAE0B] pt-12 mt-12">
        Guide
      </h1>

      {/* Horizontal Tabs */}
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-md transition-colors text-button-48-pixelify ${
              activeTab === tab.id
                ? "bg-red-600 text-white"
                : "bg-transparent border border-red-600 text-white hover:bg-red-600/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="w-full flex-1 overflow-y-auto max-h-[600px]">
        {tabContent[activeTab].content}
      </div>
    </div>
  );
};

export default Guide;
