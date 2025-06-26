import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserOwnProfile } from "./services/api/profileApiService.js";


const UserProfile=()=>{

  const [user, setUser] = useState(null);

  const fetchProfile = async ()=> {
      const data = await getUserOwnProfile()
      console.log(data)
      setUser(data)
  }
      useEffect(() => {
fetchProfile()
      }, []);

  
      return(
<div>
0
    </div>
      ) 
}
  
export default UserProfile