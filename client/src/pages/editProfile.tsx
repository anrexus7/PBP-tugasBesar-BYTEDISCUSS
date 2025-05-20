import React, { useState, useEffect } from 'react';
import '../css/app.css';
import { useNavigate } from 'react-router-dom';
import ProfilePictureUploadModal from './editProfilePicture';

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    profilePicture: '', // Add profile picture field
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No token found. Please log in.');
        setIsError(true);
        navigate('/auth/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/me', {
          method: 'GET',
          headers: {
            'x-auth-token': token,
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
          profilePicture: data.profilePicture || '', // Set profile picture
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
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found. Please log in.');
      setIsError(true);
      navigate('/auth/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/me', {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
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
      navigate('/me');
    } catch (err: any) {
      setMessage(err.message);
      setIsError(true);
    }
  };

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
          'x-auth-token': token,
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

  const handleProfilePictureUpdate = (newProfilePicture: string) => {
    setFormData(prevData => ({
      ...prevData,
      profilePicture: newProfilePicture
    }));
  };

  return (
    <div className="center-container">
      <button className="logout-button" onClick={handleDelete}>
        EXTERMINATE
      </button>
      <div className="profile-picture-container" onClick={openModal}>
        <img
          src={formData.profilePicture ? 
            `http://localhost:5000/uploads/${formData.profilePicture}` : 
            '/default-avatar.png'}
          alt="Profile"
          className="profile-picture"
        />
        <p>Click to change profile picture</p>
      </div>

      <ProfilePictureUploadModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onUploadSuccess={(message, profilePicture) => {
          setMessage(message);
          setIsError(false);
          handleProfilePictureUpdate(profilePicture);
        }}
      />

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