import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import '../css/mainPage.css';

interface Question {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: Answer[];
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

const QuestionPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState({ title: '', content: '' });
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
        body: JSON.stringify(newQuestion),
      });

      if (!res.ok) throw new Error('Failed to add question');

      setSuccess('Question added successfully');
      setNewQuestion({ title: '', content: '' });
      fetchQuestions();
    } catch (err) {
      setError('Failed to add question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({ title: question.title, content: question.content });
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
        body: JSON.stringify(editedQuestion),
      });

      if (!res.ok) throw new Error('Failed to update question');

      setEditingQuestionId(null);
      setEditedQuestion({ title: '', content: '' });
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

  useEffect(() => {
    fetchQuestions();
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