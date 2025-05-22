import React, { useState, useEffect } from 'react';
import '../app.css';
import { useNavigate } from "react-router-dom";

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
  });

  const [originalData, setOriginalData] = useState({
    email: '',
    pass: '',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage

      if (!token) {
        setMessage('No token found. Please log in.');
        setIsError(true);
        navigate('/auth/login'); // Redirect to login if no token
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user data');
        }

        const data = await response.json();
        setFormData({
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
          currentPassword: '',
          newPassword: '',
        });

        setOriginalData({
          email: data.email || '',
          pass: data.password || '',
        });
      } catch (err: any) {
        setMessage(err.message);
        setIsError(true);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token) {
      setMessage('No token found. Please log in.');
      setIsError(true);
      navigate('/auth/login'); // Redirect to login if no token
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          bio: formData.bio,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setIsError(true);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setMessage(data.message || 'Profile updated successfully!');
      setIsError(false);

      // Redirect to login if email or password was changed
      if (
        (formData.email !== '' && formData.email !== originalData.email) ||
        (formData.newPassword !== '' && formData.newPassword !== originalData.pass)
      ) {
        setTimeout(() => {
          localStorage.removeItem('token'); // Remove token from localStorage
          navigate('/auth/login'); // Redirect to login after a delay
        }, 2000); // Optional delay to show success message
      } else {
        navigate('/me'); // Redirect to profile page if no sensitive changes
      }
    } catch (err: any) {
      setMessage(err.message);
      setIsError(true);
    }
  };

  // Handle account deletion
  const handleDelete = async () => {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (!token) {
      setMessage('No token found. Please log in.');
      setIsError(true);
      navigate('/auth/login'); // Redirect to login if no token
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setIsError(true);
        throw new Error(errorData.message || 'Failed to delete account');
      }

      setMessage('Account deleted successfully!');
      setIsError(false);

      setTimeout(() => {
        localStorage.removeItem('token'); // Remove token from localStorage
        navigate('/auth/login'); // Redirect to login after account deletion
      }, 2000); // Optional delay to show success message
    } catch (err: any) {
      setMessage(err.message);
      setIsError(true);
    }
  };

  return (
    <div className="center-container">
      <button className="logout-button" onClick={handleDelete}>
        EXTERMINATE
      </button>
      <h2>Edit Profile</h2>
      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
          />
          <input
            name="currentPassword"
            type="password"
            placeholder="Current Password"
            value={formData.currentPassword}
            onChange={handleChange}
          />
          <input
            name="newPassword"
            type="password"
            placeholder="New Password"
            value={formData.newPassword}
            onChange={handleChange}
          />
          <button type="submit">Save Changes</button>
        </form>
        {message && (
          <p className={isError ? 'error-message' : 'success-message'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default EditProfile;