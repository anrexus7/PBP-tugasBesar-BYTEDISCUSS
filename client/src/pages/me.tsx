import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import '../css/me.css';

interface Question {
  id: number;
  title: string;
  createdAt: string;
  content: string;
}

interface Answer {
  id: number;
  content: string;
  createdAt: string;
  questionId: number;
  questionTitle: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  bio: string | null;
  reputation: number;
  questions: Question[];
  answers: Answer[];
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/auth/login');
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            navigate('/auth/login');
            return;
          }

          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch user profile');
        }

        const user = await res.json();
        setUser(user);
        console.log('User data:', user);
      } catch (err: any) {
        setMessage(err.message);
        navigate('/auth/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) {
    return (
      <div className="center-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/auth/login');
          }}
        >
          Logout
        </button>

        <div className="profile-card">
          <div className="profile-picture-container">
            <div
              className="profile-picture"
              style={{
                backgroundImage: user.profilePicture
                  ? `url(http://localhost:5000/uploads/${user.profilePicture})`
                  : 'url(https://via.placeholder.com/150)',
              }}
            />
            <button 
              className="edit-profile-button"
              onClick={() => navigate('/editProfile')}
            >
              Edit Profile
            </button>
          </div>

          <div className="profile-info">
            <h2 className="username">{user.username}</h2>
            <p className="email">{user.email}</p>
            <div className="reputation-badge">
              <span>Reputation: </span>
              <span className="reputation-score">{user.reputation}</span>
            </div>
            <div className="bio-section">
              <h4>About Me</h4>
              <p className="bio">{user.bio || 'No bio yet.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="activity-section">
          <div className="questions-section">
            <h3 className="section-title">My Questions ({user.questions.length})</h3>
            {user.questions.length > 0 ? (
              <div className="questions-list">
                {user.questions.map((question) => (
                  <div 
                    key={question.id} 
                    className="question-item"
                    onClick={() => navigate(`/questions/${question.id}`)}
                  >
                    <h4 className="question-title">{question.title}</h4>
                    <p className="question-content">{question.content}...</p>
                    <div className="question-meta">
                      <span className="date">Asked on {formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't asked any questions yet.</p>
                <button 
                  className="primary-button"
                  onClick={() => navigate('/questions/new')}
                >
                  Ask Your First Question
                </button>
              </div>
            )}
          </div>

          <div className="answers-section">
            <h3 className="section-title">My Answers ({user.answers.length})</h3>
            {user.answers.length > 0 ? (
              <div className="answers-list">
                {user.answers.map((answer) => (
                  <div 
                    key={answer.id} 
                    className="answer-item"
                    onClick={() => navigate(`/questions/${answer.questionId}`)}
                  >
                    <h4 className="answer-question-title">Question: {answer.questionTitle}</h4>
                    <p className="answer-content">{answer.content.substring(0, 150)}...</p>
                    <div className="answer-meta">
                      <span className="date">Answered on {formatDate(answer.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't answered any questions yet.</p>
                <button 
                  className="primary-button"
                  onClick={() => navigate('/questions')}
                >
                  Browse Questions to Answer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className="message-container">
          <p className="error-message">{message}</p>
        </div>
      )}
      
      <Outlet />
    </div>
  );
};

export default ProfilePage;