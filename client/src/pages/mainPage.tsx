import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaSignInAlt,
  FaUserPlus,
  FaThumbsUp,
  FaThumbsDown,
  FaComment,
  FaUser,
  FaEdit,
  FaSignOutAlt,
} from "react-icons/fa";
import "../css/mainPage.css";

interface Question {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  viewCount?: number;
  answerCount?: number;
  voteCount?: number;
  createdAt: string;
  hasAcceptedAnswer?: boolean;
  user?: {
    username: string;
    profilePicture?: string;
  };
}

interface UserData {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  reputation?: number;
}

interface Tag {
  id: string;
  name: string;
}

interface ApiResponse {
  questions?: Question[];
  votes?: { questionId: string; value: number }[];
}

const MainPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:5000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const questionsRes = await fetch("http://localhost:5000/api/questions", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!questionsRes.ok) {
        throw new Error("Failed to fetch questions");
      }

      const questionsData = await questionsRes.json();
      const safeQuestions = Array.isArray(questionsData) ? questionsData : [];

      setQuestions(safeQuestions);
      console.log("Fetched safe questions:", safeQuestions);
      setFilteredQuestions(safeQuestions);

      const allTags: string[] = [];
      safeQuestions.forEach((q) => {
        if (q.tags && Array.isArray(q.tags)) {
          allTags.push(...q.tags);
        }
      });

      const uniqueTags = Array.from(new Set(allTags)).map((tagName) => ({
        id: tagName,
        name: tagName,
      }));

      setTags(uniqueTags);

      if (token) {
        try {
          const votesRes = await fetch("http://localhost:5000/api/votes/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (votesRes.ok) {
            const votesData: ApiResponse = await votesRes.json();
            const votesMap: Record<string, number> = {};

            (votesData.votes || []).forEach((vote) => {
              if (vote?.questionId && vote?.value) {
                votesMap[vote.questionId] = vote.value;
              }
            });

            setUserVotes(votesMap);
          }
        } catch (err) {
          console.error("Failed to fetch votes:", err);
        }
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to fetch questions. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    if (isLoggedIn) {
      fetchCurrentUser();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    let results = [...questions];

    if (searchTerm) {
      results = results.filter(
        (q) =>
          q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTag) {
      results = results.filter((q) => q.tags?.includes(selectedTag));
    }

    setFilteredQuestions(results);
  }, [searchTerm, selectedTag, questions]);

  const handleVote = async (questionId: string, value: number) => {
    if (!isLoggedIn) {
      navigate("/auth/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/questions/${questionId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ value }),
        }
      );

      if (res.ok) {
        const updatedQuestion = await res.json();

        setQuestions((prevQuestions) =>
          prevQuestions.map((q) => (q.id === questionId ? updatedQuestion : q))
        );

        setUserVotes((prev) => {
          if (prev[questionId] === value) {
            const newVotes = { ...prev };
            delete newVotes[questionId];
            return newVotes;
          }
          return { ...prev, [questionId]: value };
        });
      }
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Invalid date:", dateString);
      return "Unknown date";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/auth/login");
  };

  if (isLoading)
    return (
      <div className="home-container">
        <div className="loading">Loading questions...</div>
      </div>
    );

  if (error)
    return (
      <div className="home-container">
        <div className="error">{error}</div>
      </div>
    );

  return (
    <div className="home-container">
      <header className="header">
        <div className="logo">
          <Link to="/">DevForum</Link>
        </div>

        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="auth-buttons">
          {isLoggedIn ? (
            <div
              className="profile-dropdown-container"
              onMouseEnter={() => setShowProfileDropdown(true)}
              onMouseLeave={() => setShowProfileDropdown(false)}
            >
              <div className="profile-button">
                <img
                  src={
                    currentUser?.profilePicture
                      ? `http://localhost:5000/uploads/${currentUser.profilePicture}`
                      : "http://localhost:5000/uploads/defaultPic.png"
                  }
                  alt="Profile"
                  className="profile-picture"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "http://localhost:5000/uploads/defaultPic.png";
                  }}
                />
              </div>
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <Link to="/me" className="dropdown-item">
                    <FaUser /> My Profile
                  </Link>
                  <Link to="/me/edit" className="dropdown-item">
                    <FaEdit /> Edit Profile
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth/login" className="login-button">
                <FaSignInAlt /> Log In
              </Link>
              <Link to="/auth/register" className="register-button">
                <FaUserPlus /> Register
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="main-content">
        <div className="sidebar-fixed">
          <div className="sidebar-section">
            <h3>Browse Tags</h3>
            <div className="tags-list">
              {tags.length > 0 ? (
                <div className="tags-container">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      className={`tag ${
                        selectedTag === tag.id ? "active" : ""
                      }`}
                      onClick={() =>
                        setSelectedTag(selectedTag === tag.id ? "" : tag.id)
                      }
                      title={tag.name}
                    >
                      {tag.name.length > 15
                        ? `${tag.name.substring(0, 15)}...`
                        : tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p>No tags available</p>
              )}
            </div>
          </div>

          {isLoggedIn && (
            <div className="sidebar-section">
              <Link to="/questions/new" className="ask-button">
                Ask Question
              </Link>
            </div>
          )}
        </div>

        <div className="questions-list">
          <div className="questions-header">
            <h1>
              {selectedTag
                ? `Questions tagged [${
                    tags.find((t) => t.id === selectedTag)?.name
                  }]`
                : "All Questions"}
            </h1>
            <p>
              {filteredQuestions.length}{" "}
              {filteredQuestions.length === 1 ? "question" : "questions"}
            </p>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="no-questions">
              <p>No questions found matching your criteria.</p>
              {isLoggedIn && (
                <Link to="/questions/new" className="ask-button">
                  Ask the first question
                </Link>
              )}
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div key={question.id} className="question-card">
                <h2 className="question-title">
                  <Link to={`/questions/${question.id}`}>
                    {question.title || "Untitled Question"}
                  </Link>
                </h2>

                <div className="question-meta">
                  <img
                    src={
                      question.user?.profilePicture
                        ? `http://localhost:5000/uploads/${question.user.profilePicture}`
                        : "http://localhost:5000/uploads/defaultPic.png"
                    }
                    alt={question.user?.username || "Anonymous"}
                    className="user-avatar"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "http://localhost:5000/uploads/defaultPic.png";
                    }}
                  />
                  <span className="username">
                    {question.user?.username || "Anonymous"}
                  </span>
                  <span className="timestamp">
                    asked {formatDate(question.createdAt)}
                  </span>
                </div>

                <p className="question-content">
                  {question.content && question.content.length > 300
                    ? `${question.content.substring(0, 300)}...`
                    : question.content || "No content provided"}
                </p>

                <div className="question-stats">
                  <div className="stat">
                    <strong>{question.voteCount || 0}</strong> votes
                  </div>
                  <div
                    className={`stat ${
                      question.answerCount
                        ? question.hasAcceptedAnswer
                          ? "accepted"
                          : "answered"
                        : ""
                    }`}
                  >
                    <strong>{question.answerCount || 0}</strong> answers
                  </div>
                  <div className="stat">
                    <strong>{question.viewCount || 0}</strong> views
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
