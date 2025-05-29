import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import styles from '../components/EditProfile/EditProfile.module.css';
import { EditProfileFormData, OriginalData } from '../components/EditProfile/types';

const API_BASE_URL = 'http://localhost:5000/api';

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState<EditProfileFormData>({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
  });

  const [profilePicture, setProfilePicture] = useState('defaultPic.png');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<OriginalData>({
    email: '',
    pass: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('No token found. Please log in.');
      setIsError(true);
      navigate('/auth/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const { username, email, bio, profilePicture: picture } = response.data;
      setFormData({
        username: username || '',
        email: email || '',
        bio: bio || '',
        currentPassword: '',
        newPassword: '',
      });

      const pictureUrl = picture || 'defaultPic.png';
      setProfilePicture(pictureUrl);
      setPreviewUrl(`${API_BASE_URL.replace('/api', '')}/uploads/${pictureUrl}`);

      setOriginalData({
        email: email || '',
        pass: response.data.password || '',
      });
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to fetch user data');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
      setIsLoading(true);

      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);

        const uploadResponse = await axios.put(`${API_BASE_URL}/me/avatar`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        const { profilePicture: newPicture } = uploadResponse.data;
        setProfilePicture(newPicture);
        setPreviewUrl(`${API_BASE_URL.replace('/api', '')}/uploads/${newPicture}`);
      }

      await axios.put(`${API_BASE_URL}/me`, {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setMessage('Profile updated successfully!');
      setIsError(false);

      if ((formData.email && formData.email !== originalData.email) || 
          (formData.newPassword && formData.newPassword !== originalData.pass)) {
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/auth/login');
        }, 2000);
      } else {
        setSelectedFile(null);
        fileInputRef.current && (fileInputRef.current.value = '');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found. Please log in.');
      setIsError(true);
      navigate('/auth/login');
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setMessage('Account deleted successfully!');
      setIsError(false);

      setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/auth/login');
      }, 2000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to delete account');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Edit Profile</h2>
        
        <div className={styles.pictureSection}>
          <div className={styles.avatarContainer} onClick={triggerFileInput}>
            <img 
              src={previewUrl || `${API_BASE_URL.replace('/api', '')}/uploads/defaultPic.png`}
              alt="Profile" 
              className={styles.avatar}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${API_BASE_URL.replace('/api', '')}/uploads/defaultPic.png`;
              }}
            />
            <div className={styles.avatarOverlay}>
              <span>Change Photo</span>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio" className={styles.label}>Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={styles.textarea}
              placeholder='Tell us about yourself...'
              rows={3}
            />
          </div>

          <div className={styles.passwordSection}>
            <h3 className={styles.passwordTitle}>Change Password</h3>
            
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.label}>Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.currentPassword}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.label}>New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.newPassword}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>

            <button 
              type="button" 
              onClick={handleDelete}
              className={styles.deleteButton}
              disabled={isLoading}
            >
              Delete Account
            </button>
          </div>
        </form>

        {message && (
          <div className={`${styles.message} ${isError ? styles.error : styles.success}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;