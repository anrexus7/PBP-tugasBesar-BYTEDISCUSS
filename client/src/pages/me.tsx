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
        const res = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          }, 
        });

        console.log(res);
  
        if (!res.ok) {
          const errorData = await res.json();
          setIsError(true);
          throw new Error(errorData.message || 'Failed to fetch user profile');
        }
  
        const data = await res.json();
        setUser(data);
        setIsError(false);
        setMessage('');
      } // In the error catch block
      catch (err: any) {
        setMessage(err.message);
        setIsError(true);
      
        // Optional: redirect to login on 401 or specific error
        if (err.message === 'Unauthorized' || err.message.includes('token')) {
          navigate('/auth/login');
        }
      }
    };
  
    fetchUser();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear the token
    navigate('/auth/login'); // Redirect to login page
  };

  // Edit profile handler
  const handleEditProfile = () => {
    navigate('/editProfile'); // Redirect to edit profile page
  };

  if (!user) {
    navigate('/auth/login');
    setTimeout(() => {
      
    }, 5000);

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
