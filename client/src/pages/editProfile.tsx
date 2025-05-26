import React, { useState, useEffect, useRef } from 'react';
import '../css/editProfile.css';
import { useNavigate } from "react-router-dom";

const EditProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
  });

  const [profilePicture, setProfilePicture] = useState('defaultPic.png');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState({
    email: '',
    pass: '',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch current user data
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
        setIsLoading(true);
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

        // Always set profile picture (default or user's)
        if (data.profilePicture) {
          setProfilePicture(data.profilePicture);
          // Immediately show the current profile picture
          setPreviewUrl(`http://localhost:5000/uploads/${data.profilePicture}`);
        } 
        else {
          setProfilePicture('defaultPic.png');
          setPreviewUrl(`http://localhost:5000/uploads/defaultPic.png`);
        }

        setOriginalData({
          email: data.email || '',
          pass: data.password || '',
        });
      } catch (err: any) {
        setMessage(err.message);
        setIsError(true);
      } finally {
        setIsLoading(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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

      // First upload profile picture if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);

        const uploadResponse = await fetch('http://localhost:5000/api/me/avatar', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Failed to upload profile picture');
        }

        const uploadData = await uploadResponse.json();
        setProfilePicture(uploadData.profilePicture);
        // Update preview with the new uploaded image
        setPreviewUrl(`http://localhost:5000/uploads/${uploadData.profilePicture}`);
      }

      // Then update other profile data
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
      setMessage('Profile updated successfully!');
      setIsError(false);

      if (
        (formData.email !== '' && formData.email !== originalData.email) ||
        (formData.newPassword !== '' && formData.newPassword !== originalData.pass)
      ) {
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/auth/login');
        }, 2000);
      } else {
        // Reset file selection after successful update
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err: any) {
      setMessage(err.message);
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
        localStorage.removeItem('token');
        navigate('/auth/login');
      }, 2000);
    } catch (err: any) {
      setMessage(err.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2 className="edit-profile-title">Edit Profile</h2>
        
        <div className="profile-picture-section">
          <div className="avatar-container" onClick={triggerFileInput}>
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="profile-avatar"
                onError={(e) => {
                  // Fallback to default image if the uploaded image fails to load
                  (e.target as HTMLImageElement).src = `http://localhost:5000/uploads/defaultPic.png`;
                }}
              />
            ) : (
              <img 
                src={`http://localhost:5000/uploads/defaultPic.png`} 
                alt="Default Profile" 
                className="profile-avatar"
              />
            )}
            <div className="avatar-overlay">
              <span>Change Photo</span>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="file-upload-input"
          />
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* ... (rest of the form remains the same) ... */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="password-section">
            <h3>Change Password</h3>
            
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>

            <button 
              type="button" 
              onClick={handleDelete}
              className="delete-button"
              disabled={isLoading}
            >
              Delete Account
            </button>
          </div>
        </form>

        {message && (
          <div className={`message ${isError ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;