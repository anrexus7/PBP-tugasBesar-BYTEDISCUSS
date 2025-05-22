import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaSignInAlt, FaUserPlus, FaThumbsUp, FaThumbsDown, FaComment, FaUser, FaEdit, FaSignOutAlt } from 'react-icons/fa';
import '../css/mainPage.css';

interface Question {
  id: string;
  title: string;
  content: string;
  tags: { id: string; name: string }[];
  viewCount: number;
  answerCount: number;
  voteCount: number;
  createdAt: string;
  hasAcceptedAnswer?: boolean;
  User: {
    username: string;
    profilePicture?: string;
  };
  votes?: {
    value: number;
    userId: string;
  }[];
}

const MainPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/questions', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setQuestions(data);
        setFilteredQuestions(data);
        
        const allTags = data.flatMap((q: Question) => q.tags || []);
        const uniqueTags = Array.from(new Set(allTags.map(tag => tag.id)))
          .map(id => allTags.find(tag => tag.id === id));
        setTags(uniqueTags);

        if (token) {
          const voteRes = await fetch('http://localhost:5000/api/votes', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          const votesData = await voteRes.json();
          
          const votesMap: Record<string, number> = {};
          data.forEach((q: Question) => {
            const userVote = votesData.votes?.find((v: any) => v.questionId === q.id);
            if (userVote) {
              votesMap[q.id] = userVote.value;
            }
          });
          setUserVotes(votesMap);
        }
      } catch (err) {
        setError('Failed to fetch questions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let results = questions;
    
    if (searchTerm) {
      results = results.filter(q => 
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTag) {
      results = results.filter(q => 
        q.tags && q.tags.some(tag => tag.id === selectedTag)
      );
    }
    
    setFilteredQuestions(results);
  }, [searchTerm, selectedTag, questions]);

  const handleVote = async (questionId: string, value: number) => {
    if (!isLoggedIn) {
      navigate('/auth/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/questions/${questionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });

      if (res.ok) {
        const updatedQuestion = await res.json();
        
        setQuestions(questions.map(q => 
          q.id === questionId ? updatedQuestion : q
        ));
        
        setUserVotes(prev => {
          if (prev[questionId] === value) {
            const newVotes = {...prev};
            delete newVotes[questionId];
            return newVotes;
          }
          return {...prev, [questionId]: value};
        });
      }
    } catch (err) {
      console.error('Failed to vote', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  if (isLoading) return (
    <div className="home-container">
      <div className="loading">Loading questions...</div>
    </div>
  );
  
  if (error) return (
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
                  src="/default-profile.png" 
                  alt="Profile" 
                  className="profile-picture"
                />
              </div>
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <Link to="/me" className="dropdown-item">
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
                tags.map(tag => (
                  <button
                    key={tag.id}
                    className={`tag ${selectedTag === tag.id ? 'active' : ''}`}
                    onClick={() => setSelectedTag(selectedTag === tag.id ? '' : tag.id)}
                  >
                    {tag.name}
                  </button>
                ))
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
            <h1>{selectedTag ? `Questions tagged [${tags.find(t => t.id === selectedTag)?.name}]` : 'All Questions'}</h1>
            <p>{filteredQuestions.length} {filteredQuestions.length === 1 ? 'question' : 'questions'}</p>
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
            filteredQuestions.map(question => (
              <div key={question.id} className="question-card">
                <div className="question-stats">
                  <div className="vote-container">
                    <button 
                      className={`vote-button ${userVotes[question.id] === 1 ? 'active upvote' : 'upvote'}`}
                      onClick={() => handleVote(question.id, 1)}
                      aria-label="Upvote"
                    >
                      <FaThumbsUp />
                      <span>Upvote</span>
                    </button>
                    <span className="vote-count">{question.voteCount}</span>
                    <button 
                      className={`vote-button ${userVotes[question.id] === -1 ? 'active downvote' : 'downvote'}`}
                      onClick={() => handleVote(question.id, -1)}
                      aria-label="Downvote"
                    >
                      <FaThumbsDown />
                      <span>Downvote</span>
                    </button>
                  </div>
                  <div className={`stat ${question.answerCount > 0 ? question.hasAcceptedAnswer ? 'has-accepted' : 'has-answers' : ''}`}>
                    <span>{question.answerCount}</span>
                    <span>answers</span>
                  </div>
                  <div className="stat">
                    <span>{question.viewCount}</span>
                    <span>views</span>
                  </div>
                </div>
                
                <div className="question-content">
                  <h3>
                    <Link to={`/questions/${question.id}`}>{question.title}</Link>
                  </h3>
                  <p className="question-excerpt">
                    {question.content.length > 200 
                      ? `${question.content.substring(0, 200)}...` 
                      : question.content}
                  </p>
                  
                  <div className="question-footer">
                    <div className="tags">
                      {question.tags?.map(tag => (
                        <span key={tag.id} className="tag" onClick={() => setSelectedTag(tag.id)}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    
                    <div className="question-meta">
                      <span className="username">
                        {question.User?.username || 'Anonymous'}
                      </span>
                      <span className="date">
                        asked {formatDate(question.createdAt)}
                      </span>
                    </div>
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