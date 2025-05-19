import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import './App.css';

type Tag = {
  id: string;
  name: string;
};

const TagPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError('Gagal mengambil data tag.');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTag }),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Gagal menambahkan tag.');
      }

      const addedTag = await response.json();
      setTags([...tags, addedTag]);
      setSuccess('Tag berhasil ditambahkan!');
      setNewTag('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="center-container">
      <div className="form-box">
        <h2>Tag Manager</h2>

        <form onSubmit={handleAddTag}>
          <input
            type="text"
            placeholder="Nama tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            required
          />
          <button type="submit">Tambah Tag</button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <h3 style={{ marginTop: '20px' }}>Daftar Tag</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {tags.map((tag) => (
            <li key={tag.id} style={{
              margin: '8px 0',
              padding: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '6px'
            }}>
              {tag.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TagPage;
