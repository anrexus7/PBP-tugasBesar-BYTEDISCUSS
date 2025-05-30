import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

interface Tag {
  id: string;
  name: string;
}

const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get("http://localhost:5000/api/questions", config);      const safeQuestions = Array.isArray(response.data) ? response.data : [];
      setQuestions(safeQuestions);
      setSearchResults(safeQuestions);
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
          const votesResponse = await axios.get("http://localhost:5000/api/votes/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const votesMap: Record<string, number> = {};
          (votesResponse.data.votes || []).forEach((vote: any) => {
            if (vote?.questionId && vote?.value) {
              votesMap[vote.questionId] = vote.value;
            }
          });

          setUserVotes(votesMap);
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
  }, [isLoggedIn]);  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(questions);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await axios.get("http://localhost:5000/api/search", { 
          params: { q: searchTerm } 
        });
        setSearchResults(response.data);
      } catch (error) {
        setError("Failed to fetch search results.");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, questions]);

  // Combined filtering effect for search results and tags
  useEffect(() => {
    let filtered = searchResults;

    if (selectedTags.length > 0) {
      filtered = searchResults.filter(question => 
        question.tags && selectedTags.every(tagId => question.tags!.includes(tagId))
      );
    }

    setFilteredQuestions(filtered);
  }, [searchResults, selectedTags]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  const handleVote = async (questionId: string, value: number) => {
    if (!isLoggedIn) {
      navigate("/auth/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/questions/${questionId}/vote`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedQuestion = response.data;
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
    } catch (err) {
      console.error("Failed to vote:", err);
    }  };

  return {
    questions,
    filteredQuestions,
    searchTerm,
    setSearchTerm,
    tags,
    selectedTags,
    toggleTag,
    clearTags,
    isLoading,
    error,
    userVotes,
    handleVote,
  };
};

export default useQuestions;