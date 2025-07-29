import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const Account = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "DragonSlayer",
    email: "player@dungeonexplorer.com",
    joinDate: "January 2024",
    level: 15,
    totalPlayTime: "42 hours",
    achievements: 23
  });

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
  };

  const achievements = [
    { id: 1, name: "First Steps", description: "Complete your first quest", earned: true, date: "Jan 15, 2024" },
    { id: 2, name: "Dragon Slayer", description: "Defeat your first dragon", earned: true, date: "Feb 3, 2024" },
    { id: 3, name: "Treasure Hunter", description: "Find 10 hidden treasures", earned: true, date: "Feb 10, 2024" },
    { id: 4, name: "Master Explorer", description: "Explore 50 different areas", earned: false, date: null },
    { id: 5, name: "Legendary Hero", description: "Reach level 50", earned: false, date: null }
  ];

  const settings = [
    { key: "sound", label: "Sound Effects", value: true },
    { key: "music", label: "Background Music", value: true },
    { key: "notifications", label: "Push Notifications", value: false },
    { key: "autoSave", label: "Auto Save", value: true }
  ];

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-heading-1-pixelify-bold">Profile Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors text-button-48-pixelify"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-body-2-pixelify-bold text-gray-400 mb-2">Username</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                className="w-full bg-translucent-light-8 border border-gray-600 rounded px-3 py-2 text-body-1-alagard text-white"
              />
            ) : (
              <p className="text-body-1-alagard">{profileData.username}</p>
            )}
          </div>
          
          <div>
            <label className="block text-body-2-pixelify-bold text-gray-400 mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full bg-translucent-light-8 border border-gray-600 rounded px-3 py-2 text-body-1-alagard text-white"
              />
            ) : (
              <p className="text-body-1-alagard">{profileData.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-body-2-pixelify-bold text-gray-400 mb-2">Member Since</label>
            <p className="text-body-1-alagard">{profileData.joinDate}</p>
          </div>
          
          <div>
            <label className="block text-body-2-pixelify-bold text-gray-400 mb-2">Current Level</label>
            <p className="text-body-1-alagard">{profileData.level}</p>
          </div>
          
          <div>
            <label className="block text-body-2-pixelify-bold text-gray-400 mb-2">Total Play Time</label>
            <p className="text-body-1-alagard">{profileData.totalPlayTime}</p>
          </div>
          
          <div>
            <label className="block text-body-2-pixelify-bold text-gray-400 mb-2">Achievements</label>
            <p className="text-body-1-alagard">{profileData.achievements} earned</p>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-6">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded transition-colors text-button-48-pixelify mr-3"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`bg-dark-secondary border rounded-lg p-6 ${
            achievement.earned ? "border-yellow-600" : "border-gray-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                achievement.earned ? "bg-yellow-600" : "bg-gray-600"
              }`}>
                {achievement.earned ? "🏆" : "🔒"}
              </div>
              <div>
                <h4 className="text-heading-1-pixelify-bold">{achievement.name}</h4>
                <p className="text-body-1-alagard text-gray-300">{achievement.description}</p>
                {achievement.earned && achievement.date && (
                  <p className="text-body-2-pixelify-bold text-yellow-400">Earned: {achievement.date}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="bg-dark-secondary border border-gray-700 rounded-lg p-6">
      <h3 className="text-heading-1-pixelify-bold mb-6">Game Settings</h3>
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.key} className="flex items-center justify-between">
            <label className="text-body-1-alagard">{setting.label}</label>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                setting.value ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  setting.value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h4 className="text-body-2-pixelify-bold mb-4">Account Actions</h4>
        <div className="space-y-3">
          <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors text-button-48-pixelify">
            Change Password
          </button>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors text-button-48-pixelify">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 text-white">
      <h1 className="text-display-1-alagard-bold mb-6">Account</h1>
      
      <div className="flex space-x-1 mb-6 bg-dark-secondary rounded-lg p-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "profile"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("achievements")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "achievements"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Achievements
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 px-4 rounded-md transition-colors text-button-48-pixelify ${
            activeTab === "settings"
              ? "bg-translucent-light-8 text-light-primary"
              : "text-gray-400 hover:text-light-primary"
          }`}
        >
          Settings
        </button>
      </div>
      
      <div>
        {activeTab === "profile" && renderProfile()}
        {activeTab === "achievements" && renderAchievements()}
        {activeTab === "settings" && renderSettings()}
      </div>
    </div>
  );
};

export default Account;