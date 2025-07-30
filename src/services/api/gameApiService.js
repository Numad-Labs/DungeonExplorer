import api from "./axiosInstance.js";

export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Failed to get all users:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user by ID:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
};

// Maps Endpoints (Public)
export const getAllMaps = async () => {
  try {
    const response = await api.get("/maps");
    return response.data;
  } catch (error) {
    console.error("Failed to get maps:", error);
    throw error;
  }
};

export const getMapById = async (mapId) => {
  try {
    const response = await api.get(`/maps/${mapId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get map:", error);
    throw error;
  }
};

// Scores/Leaderboard Endpoints (Public)
export const getGlobalScores = async () => {
  try {
    const response = await api.get("/scores/global");
    return response.data;
  } catch (error) {
    console.error("Failed to get global scores:", error);
    throw error;
  }
};

export const getGlobalKillCounts = async () => {
  try {
    const response = await api.get("/scores/global");
    return response.data;
  } catch (error) {
    console.error("Failed to get global kill counts:", error);
    throw error;
  }
};

export const getMapLeaderboard = async (mapId) => {
  try {
    const response = await api.get(`/leaderboard/map/${mapId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get map leaderboard:", error);
    throw error;
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await api.get(`/scores/user/${userId}/stats`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user stats:", error);
    throw error;
  }
};

// User Data by ID (Public)
export const getUserAchievementsById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/achievements`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user achievements:", error);
    throw error;
  }
};

export const getUserSkillsById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/skills`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user skills:", error);
    throw error;
  }
};

export const getUserScoresById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/scores`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user scores:", error);
    throw error;
  }
};

// ============ AUTHENTICATED ENDPOINTS ============

// Profile Management
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    console.error("Failed to get current user:", error);
    throw error;
  }
};

export const getCurrentUserProfile = async () => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (error) {
    console.error("Failed to get user profile:", error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/profile/update", profileData);
    return response.data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};
// Current User Data
export const getUserAchievements = async () => {
  try {
    const response = await api.get("/my/achievements");
    return response.data;
  } catch (error) {
    console.error("Failed to get user achievements:", error);
    throw error;
  }
};

export const getUserSkills = async () => {
  try {
    const response = await api.get("/my/skills");
    return response.data;
  } catch (error) {
    console.error("Failed to get user skills:", error);
    throw error;
  }
};

export const getUserScores = async () => {
  try {
    const response = await api.get("/my/scores");
    return response.data;
  } catch (error) {
    console.error("Failed to get user scores:", error);
    throw error;
  }
};

// Portal Endpoints
export const spawnPortal = async (portalData) => {
  try {
    const response = await api.post("/portals/spawn", portalData);
    return response.data;
  } catch (error) {
    console.error("Failed to spawn portal:", error);
    throw error;
  }
};

export const travelThroughPortal = async (travelData) => {
  try {
    const response = await api.post("/portals/travel", travelData);
    return response.data;
  } catch (error) {
    console.error("Failed to travel through portal:", error);
    throw error;
  }
};

// Game Session Endpoints
export const startGameSession = async (sessionData) => {
  try {
    const response = await api.post("/session", sessionData);
    return response.data;
  } catch (error) {
    console.error("Failed to start game session:", error);
    throw error;
  }
};

export const saveCheckpoint = async (checkpointData) => {
  try {
    const response = await api.post("/session/checkpoint", checkpointData);
    return response.data;
  } catch (error) {
    console.error("Failed to save checkpoint:", error);
    throw error;
  }
};

export const endGameSession = async (sessionData) => {
  try {
    const response = await api.post("/session/end", sessionData);
    return response.data;
  } catch (error) {
    console.error("Failed to end game session:", error);
    throw error;
  }
};
