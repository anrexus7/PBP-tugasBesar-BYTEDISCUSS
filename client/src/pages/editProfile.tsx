import React, { useState, useEffect } from 'react';
import '../css/ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import ProfilePictureUploadModal from './editProfilePicture';

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    profilePicture: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return handleAuthError('Please login again.');

      try {
        const res = await fetch('http://localhost:5000/api/me', {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error((await res.json()).message || 'Fetch failed');

        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
          profilePicture: data.profilePicture || '',
        }));
      } catch (err: any) {
        setIsError(true);
        setFeedbackMessage(err.message);
      }
    };

    fetchData();
  }, []);

  const handleAuthError = (msg: string) => {
    setIsError(true);
    setFeedbackMessage(msg);
    navigate('/auth/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return handleAuthError('Please login again.');

    try {
      const res = await fetch('http://localhost:5000/api/me', {
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

      if (!res.ok) throw new Error((await res.json()).message || 'Update failed');

      setIsError(false);
      setFeedbackMessage('Profile updated successfully.');
      navigate('/me');
    } catch (err: any) {
      setIsError(true);
      setFeedbackMessage(err.message);
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return handleAuthError('Please login again.');

    try {
      const res = await fetch('http://localhost:5000/api/me', {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');

      localStorage.removeItem('token');
      navigate('/auth/login');
    } catch (err: any) {
      setIsError(true);
      setFeedbackMessage(err.message);
    }
  };

  const handleProfilePictureUpdate = (newPic: string) => {
    setFormData(prev => ({ ...prev, profilePicture: newPic }));
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        
        <button
          className="back-button"
          onClick={() => {
            navigate('/me');
          }}
        >
          Back
        </button>

        <div className="edit-header">
          <div className="avatar-wrapper" onClick={() => setIsModalOpen(true)}>
            <img
              src={
                formData.profilePicture
                  ? `http://localhost:5000/uploads/${formData.profilePicture}`
                  : '/default-avatar.png'
              }
              alt="Avatar"
              className="profile-avatar"
            />
            <p className="avatar-hint">Change</p>
          </div>
          <h2>Edit Profile</h2>
        </div> 

        <form className="edit-form" onSubmit={handleSubmit}>
          <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} />
          <input name="currentPassword" type="password" placeholder="Current Password" value={formData.currentPassword} onChange={handleChange} />
          <input name="newPassword" type="password" placeholder="New Password" value={formData.newPassword} onChange={handleChange} />
          <button type="submit" className="save-btn">Save</button>
        </form>

        {feedbackMessage && (
          <p className={isError ? 'error-text' : 'success-text'}>{feedbackMessage}</p>
        )}

        <div className="footer-actions">
          <button onClick={handleDeleteAccount} className="delete-btn">Delete Account</button>
        </div>
      </div>

      <ProfilePictureUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={(msg, pic) => {
          setFeedbackMessage(msg);
          setIsError(false);
          handleProfilePictureUpdate(pic);
        }}
      />
    </div>
  );
};

export default EditProfile;
