import React, { useEffect, useState } from 'react';
import { FaTag, FaTrash } from 'react-icons/fa';

type Tag = {
  id: string;
  name: string;
  questionCount?: number;
};

const TagPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tags', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setTags(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tags.');
      setLoading(false);
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
      const response = await fetch('http://localhost:5000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newTag }),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Failed to add tag.');
      }

      const addedTag = await response.json();
      setTags([...tags, addedTag]);
      setSuccess('Tag added successfully!');
      setNewTag('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/tags/${tagId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete tag.');
      }

      setTags(tags.filter(tag => tag.id !== tagId));
      setSuccess('Tag deleted successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user.isAdmin && (
        <div className="card mb-3">
          <h2>Create New Tag</h2>
          <form onSubmit={handleAddTag}>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Create Tag
            </button>
          </form>
        </div>
      )}

      {error && <div className="text-error mb-3">{error}</div>}
      {success && <div className="text-success mb-3">{success}</div>}

      <div className="card">
        <h2>All Tags</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {tags.map((tag) => (
            <div key={tag.id} className="card" style={{ padding: '1rem' }}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <FaTag className="text-primary" />
                    <h3>{tag.name}</h3>
                  </div>
                  <p className="text-muted">{tag.questionCount || 0} questions</p>
                </div>
                {user.isAdmin && (
                  <button 
                    className="btn btn-sm btn-danger" 
                    onClick={() => handleDeleteTag(tag.id)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagPage;