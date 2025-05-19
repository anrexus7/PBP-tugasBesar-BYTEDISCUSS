import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import '../ProfilePage.css';

interface User {
  username: string;
  email: string;
  profilePicture: string | null;
  bio: string | null;
  reputation: number;
  questions: string[];
  answers: string[];
  id: number; // penting agar bisa mengirim userId
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No token found. Please log in.');
        setIsError(true);
        return;
      }
  
      try {
        const res = await fetch('/api/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
  
        const data = await res.json();
        setUser(data);
        setIsError(false);
      } catch (err: any) {
        console.error(err);
        setIsError(true);
      }
    };
  
    fetchUser();
  }, []);
  
  useEffect(() => {
    if (isError) {
      navigate('/auth/login');
    }
  }, [isError]);
  

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login');
  };

  const handleEditProfile = () => {
    navigate('/editProfile');
  };

  const handleCreateQuestion = () => {
    if (user) {
      navigate('/questions', { state: { userId: user.id } }); // kirim userId ke halaman buat pertanyaan
    }
  };

  if (!user) {
    navigate('/auth/login');
    return (
      <div className="center-container">
        <p>Loading... Redirecting to login in 5 seconds.</p>
      </div>
    );
  }

  return (
    <div className="center-container">
      <button className='logout-button' onClick={handleLogout}> LOG OUT </button>
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
                backgroundImage: user.profilePicture ? `url(${user.profilePicture})` : 'none',
              }}
            />
            <div className="username">{user.username}</div>
            <button onClick={handleEditProfile}>Edit</button>
            <Outlet />
          </div>
        </div>

        <div className="qa-section">
          <h3>Questions</h3>
          {user.questions.length > 0 ? (
            user.questions.map((q, idx) => (
              <div key={idx} className="qa-item">{q}</div>
            ))
          ) : (
            <p>No questions yet.</p>
          )}
        </div>

        <div className="qa-section">
          <h3>Answers</h3>
          {user.answers.length > 0 ? (
            user.answers.map((a, idx) => (
              <div key={idx} className="qa-item">{a}</div>
            ))
          ) : (
            <p>No answers yet.</p>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <button onClick={handleCreateQuestion}>Buat Pertanyaan</button>
        </div>

        {message && (
          <p className={isError ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
