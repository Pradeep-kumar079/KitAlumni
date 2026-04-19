import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import ChatLayout from "../Components/ChatLayout";
import API from "../api";

const ChatPage = () => {
  const [user, setUser] = useState(null);

  // ✅ Use Render backend (your actual URL)
  

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await API.get(`/account`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.user);
    } catch (err) {
      console.error("❌ Error fetching current user:", err);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  if (!user) return <div>Loading user details...</div>;

  return (
    <div>
      <Navbar />
      <ChatLayout userId={user._id} />
    </div>
  );
};

export default ChatPage;
