import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import '../css/profile.css';

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

export const fetchUserProfile = async (): Promise<User | null> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
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
      throw new Error('Failed to fetch user profile');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

    useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUserProfile();
        if (!userData) {
          navigate('/auth/login');
          return;
        }
        setUser(userData);
      } catch (err: any) {
        setMessage(err.message);
        navigate('/auth/login');
      }
    };

    loadUser();
  }, [navigate]);

  if (!user) {
    return (
      <div className="center-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
  <div className="profile-container">
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-left">
          <div
            className="profile-avatar"
            style={{
              backgroundImage: user.profilePicture
                ? `url(http://localhost:5000/uploads/${user.profilePicture})`
                : `url(/default-avatar.png)`,
            }}
          />
          <div>
            <h2 className="username">{user.username}</h2>
            <button className="edit-button" onClick={() => navigate('/editProfile')}>
              Edit Profile
            </button>
          </div>
        </div>
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/home');
          }}
        >
          Log Out
        </button>
      </div>

      <div className="profile-info">
        <p><strong>Bio:</strong> {user.bio || 'No bio yet.'}</p>
        <p><strong>Reputation:</strong> {user.reputation}</p>
      </div>

      <div className="qa-section">
        <h3>Questions</h3>
        {user.questions.length > 0 ? (
          user.questions.map((q) => (
            <div key={q.id} className="qa-item">{q.title}</div>
          ))
        ) : (
          <p className="qa-empty">No questions yet.</p>
        )}
      </div>

      <div className="qa-section">
        <h3>Answers</h3>
        {user.answers.length > 0 ? (
          user.answers.map((a) => (
            <div key={a.id} className="qa-item">{a.content}</div>
          ))
        ) : (
          <p className="qa-empty">No answers yet.</p>
        )}
      </div>

      {message && <p className="error-message">{message}</p>}
      <Outlet />
    </div>
  </div>
);
};

export default ProfilePage;
