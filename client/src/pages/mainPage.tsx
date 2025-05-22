import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaSignInAlt, FaUserPlus, FaThumbsUp, FaThumbsDown, FaComment } from 'react-icons/fa';
import '../css/mainPage.css';

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  viewCount: number;
  answerCount: number;
  voteCount: number;
  createdAt: string;
  hasAcceptedAnswer?: boolean;
  User: {
    username: string;
  };
}

const MainPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/questions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        setQuestions(data);
        setFilteredQuestions(data);
        
        // Extract unique tags from all questions
        const allTags = data.flatMap((q: Question) => q.tags || []);
        const uniqueTags = Array.from(new Set(allTags));
        setTags(uniqueTags as string[] || []);
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
        q.tags && q.tags.includes(selectedTag)
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
      const res = await fetch(`http://localhost:5000/api/questions/${questionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ value }),
      });

      if (res.ok) {
        const updatedQuestion = await res.json();
        setQuestions(questions.map(q => 
          q.id === questionId ? updatedQuestion : q
        ));
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
            <Link to="/me" className="profile-button">
              <FaUser /> Profile
            </Link>
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
        <div className="sidebar">
          <div className="sidebar-section">
            <h3>Browse Tags</h3>
            <div className="tags-list">
              {tags.length > 0 ? (
                tags.map(tag => (
                  <button
                    key={tag}
                    className={`tag ${selectedTag === tag ? 'active' : ''}`}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  >
                    {tag}
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
            <h1>{selectedTag ? `Questions tagged [${selectedTag}]` : 'All Questions'}</h1>
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
                  <div className="stat">
                    <span>{question.voteCount}</span>
                    <span>votes</span>
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
                        <span key={tag} className="tag" onClick={() => setSelectedTag(tag)}>
                          {tag}
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
                  
                  <div className="question-actions">
                    <button 
                      className="vote-button upvote"
                      onClick={() => handleVote(question.id, 1)}
                    >
                      <FaThumbsUp /> Upvote
                    </button>
                    <button 
                      className="vote-button downvote"
                      onClick={() => handleVote(question.id, -1)}
                    >
                      <FaThumbsDown /> Downvote
                    </button>
                    <Link 
                      to={`/questions/${question.id}`}
                      className="comment-button"
                    >
                      <FaComment /> {question.answerCount} {question.answerCount === 1 ? 'Answer' : 'Answers'}
                    </Link>
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