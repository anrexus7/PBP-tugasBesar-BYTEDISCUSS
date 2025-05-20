import React, { useState } from 'react';
import '../css/ProfilePictureUploadModal.css';

interface ProfilePictureUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (message: string, profilePicture: string) => void;
}

const ProfilePictureUploadModal: React.FC<ProfilePictureUploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
      setIsError(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      setIsError(true);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found. Please log in.');
      setIsError(true);
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('http://localhost:5000/api/me/avatar', {
        method: 'PUT',
        headers: {
          'x-auth-token': token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload profile picture');
      }

      const data = await response.json();
      onUploadSuccess(data.message, data.profilePicture);
      onClose(); // Close the modal after successful upload
    } catch (err: any) {
      setMessage(err.message);
      setIsError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Upload Profile Picture</h2>
        <div className="upload-controls">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button className="upload-button" onClick={handleUpload}>Upload</button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
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

export default ProfilePictureUploadModal;