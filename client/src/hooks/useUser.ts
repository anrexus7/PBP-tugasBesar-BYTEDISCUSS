import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  reputation?: number;
  votes?: { questionId?: string; answerId?: string; value: number }[];
}

const useUser = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCurrentUser(null);
        setUserVotes({});
        return;
      }

      const response = await axios.get("http://localhost:5000/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCurrentUser(response.data);

      // Map votes to { [q-<id>]: value, [a-<id>]: value }
      const votesMap: Record<string, number> = {};
      (response.data.votes || []).forEach((vote: any) => {
        if (vote.questionId) votesMap[`q-${vote.questionId}`] = vote.value;
        if (vote.answerId) votesMap[`a-${vote.answerId}`] = vote.value;
      });
      setUserVotes(votesMap);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setCurrentUser(null);
      setUserVotes({});
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
    localStorage.removeItem("user");
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
    userVotes,
  };
};

export default useUser;