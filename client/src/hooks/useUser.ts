import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  reputation?: number;
}

const useUser = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        return;
      }

      const response = await axios.get("http://localhost:5000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCurrentUser();
    } else {
      setCurrentUser(null);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/auth/login");
  };

  return {
    currentUser,
    isLoggedIn,
    showProfileDropdown,
    setShowProfileDropdown,
    handleLogout,
    fetchCurrentUser,
  };
};

export default useUser;