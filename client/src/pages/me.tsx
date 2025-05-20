import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import '../css/ProfilePage.css';

interface Question {
  id: number;
  title: string;
  createdAt: string;
}

interface Answer {
  id: number;
  content: string;
  createdAt: string;
}

interface User {
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
            'x-auth-token': token,
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

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setMessage(err.message);
        navigate('/auth/login');
      }
    };

    fetchUser();
  }, [navigate]);

  if (!user) {
    return (
      <div className="center-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="center-container">
      <button
        className="logout-button"
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/auth/login');
        }}
      >
        LOG OUT
      </button>

      <div className="profile-box">
        <div className="profile-header">
          <div className="profile-info">
            <p><strong>Bio:</strong> {user.bio || 'No bio yet.'}</p>
            <p><strong>Reputation:</strong> {user.reputation}</p>
          </div>
          <div className="profile-picture-section">
            <div
              className="profile-picture"
              style={{
                backgroundImage: user.profilePicture
                  ? `url(http://localhost:5000/uploads/${user.profilePicture})`
                  : 'none',
              }}
            />
            <div className="username">{user.username}</div>
            <button onClick={() => navigate('/editProfile')}>Edit</button>
            <Outlet />
          </div>
        </div>

        <div className="qa-section">
          <h3>Questions</h3>
          {user.questions.length > 0 ? (
            user.questions.map((q) => (
              <div key={q.id} className="qa-item">
                {q.title}
              </div>
            ))
          ) : (
            <p>No questions yet.</p>
          )}
        </div>

        <div className="qa-section">
          <h3>Answers</h3>
          {user.answers.length > 0 ? (
            user.answers.map((a) => (
              <div key={a.id} className="qa-item">
                {a.content}
              </div>
            ))
          ) : (
            <p>No answers yet.</p>
          )}
        </div>

        {message && (
          <p className="error-message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
