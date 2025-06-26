import api from "./axiosInstance.js";

export const getUserOwnProfile = async()=>{
    const response = await api.get("/me")
    return response.data
}
