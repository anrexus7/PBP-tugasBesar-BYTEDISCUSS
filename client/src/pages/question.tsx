import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEdit, FaTrash, FaCheck, FaTimes, FaTag } from 'react-icons/fa';
import '../css/mainPage.css';

interface Question {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: Answer[];
  tags: { id: string; name: string }[];
  User: {
    username: string;
  };
}

interface Answer {
  id: string;
  content: string;
  isAccepted: boolean;
  User: {
    username: string;
  };
}

interface Tag {
  id: string;
  name: string;
  description: string;
}

const QuestionPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', tags: [] as string[] });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState({ title: '', content: '', tags: [] as string[] });
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showTagForm, setShowTagForm] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const fetchQuestions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError('Failed to load questions');
    }
  };

  const fetchTags = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/tags', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAvailableTags(data);
    } catch (err) {
      console.error('Failed to load tags', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/questions/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newQuestion.title,
          content: newQuestion.content,
          tags: newQuestion.tags
        }),
      });

      if (!res.ok) throw new Error('Failed to add question');

      setSuccess('Question added successfully');
      setNewQuestion({ title: '', content: '', tags: [] });
      fetchQuestions();
    } catch (err) {
      setError('Failed to add question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({ 
      title: question.title, 
      content: question.content,
      tags: question.tags?.map(tag => tag.id) || []
    });
  };

  const handleUpdate = async () => {
    if (!editingQuestionId) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${editingQuestionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editedQuestion.title,
          content: editedQuestion.content,
          tags: editedQuestion.tags
        }),
      });

      if (!res.ok) throw new Error('Failed to update question');

      setEditingQuestionId(null);
      setEditedQuestion({ title: '', content: '', tags: [] });
      fetchQuestions();
    } catch (err) {
      console.error(err);
      setError('Failed to update question');
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete question');

      fetchQuestions();
    } catch (err) {
      console.error(err);
      setError('Failed to delete question');
    }
  };

  const handleTagToggle = (tagId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditedQuestion(prev => ({
        ...prev,
        tags: prev.tags.includes(tagId)
          ? prev.tags.filter(id => id !== tagId)
          : [...prev.tags, tagId]
      }));
    } else {
      setNewQuestion(prev => ({
        ...prev,
        tags: prev.tags.includes(tagId)
          ? prev.tags.filter(id => id !== tagId)
          : [...prev.tags, tagId]
      }));
    }
  };

  const handleCreateTag = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/tags/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newTagName,
        }),
      });

      if (!res.ok) throw new Error('Failed to create tag');

      setNewTagName('');
      setShowTagForm(false);
      fetchTags();
    } catch (err) {
      setError('Failed to create tag');
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchTags();
  }, []);

  return (
    <div className="home-container">
      <div className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div className="form-box" style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Ask a Question</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Title"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea
                placeholder="Your question..."
                value={newQuestion.content}
                onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '1rem'
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Tags</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id, false)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      border: '1px solid #ddd',
                      backgroundColor: newQuestion.tags.includes(tag.id) ? '#007bff' : '#f8f9fa',
                      color: newQuestion.tags.includes(tag.id) ? 'white' : '#212529',
                      cursor: 'pointer'
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => setShowTagForm(!showTagForm)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'black'
                }}
              >
                <FaTag /> Create New Tag
              </button>
              
              {showTagForm && (
                <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button"
                      onClick={handleCreateTag}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Create Tag
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowTagForm(false)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="register-button"
              style={{ padding: '0.7rem 1.5rem', fontSize: '1rem' }}
            >
              Post Question
            </button>
          </form>
          {error && <p className="error-message" style={{ color: '#d32f2f', marginTop: '1rem' }}>{error}</p>}
          {success && <p className="success-message" style={{ color: '#2e7d32', marginTop: '1rem' }}>{success}</p>}
        </div>

        <div className="questions-list">
          <h2 style={{ marginBottom: '1.5rem' }}>Questions</h2>
          
          {questions.length === 0 ? (
            <div className="no-questions">
              <p>No questions yet.</p>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="question-card" style={{ marginBottom: '1.5rem' }}>
                <div className="question-content">
                  {editingQuestionId === question.id ? (
                    <>
                      <input
                        type="text"
                        value={editedQuestion.title}
                        onChange={(e) => setEditedQuestion({ ...editedQuestion, title: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.8rem',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '1.2rem',
                          marginBottom: '1rem'
                        }}
                        required
                      />
                      <textarea
                        value={editedQuestion.content}
                        onChange={(e) => setEditedQuestion({ ...editedQuestion, content: e.target.value })}
                        rows={6}
                        style={{
                          width: '100%',
                          padding: '0.8rem',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '1rem',
                          marginBottom: '1rem'
                        }}
                        required
                      />
                      
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4>Tags</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {availableTags.map(tag => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleTagToggle(tag.id, true)}
                              style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #ddd',
                                backgroundColor: editedQuestion.tags.includes(tag.id) ? '#007bff' : '#f8f9fa',
                                color: editedQuestion.tags.includes(tag.id) ? 'white' : '#212529',
                                cursor: 'pointer'
                              }}
                            >
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="register-button"
                          onClick={handleUpdate}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          <FaCheck /> Save
                        </button>
                        <button 
                          className="login-button"
                          onClick={() => setEditingQuestionId(null)}
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 style={{ marginBottom: '0.5rem' }}>
                        {question.title}
                      </h3>
                      <p className="question-excerpt" style={{ marginBottom: '1rem' }}>
                        {question.content}
                      </p>
                      
                      {question.tags && question.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                          {question.tags.map(tag => (
                            <span 
                              key={tag.id}
                              style={{
                                padding: '0.3rem 0.8rem',
                                borderRadius: '20px',
                                backgroundColor: '#e1f5fe',
                                color: '#01579b',
                                fontSize: '0.8rem'
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="question-meta" style={{ marginBottom: '1rem' }}>
                        <span className="username">Asked by {question.User?.username || 'Anonymous'}</span>
                        <span> • {question.viewCount} views</span>
                        <span> • {question.answers?.length || 0} answers</span>
                      </div>
                      {isLoggedIn && (
                        <div className="question-actions">
                          <button 
                            className="vote-button"
                            onClick={() => handleEdit(question)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="vote-button"
                            onClick={() => handleDelete(question.id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;