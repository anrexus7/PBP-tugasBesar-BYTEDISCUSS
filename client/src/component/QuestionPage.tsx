import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface Question {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: Answer[];
  tags?: string[];
  userId: string;
}

interface Answer {
  id: string;
  content: string;
  isAccepted: boolean;
}

const QuestionPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newQuestion, setNewQuestion] = useState({ 
    title: '', 
    content: '',
    tags: '' 
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState({ title: '', content: '', tags: '' });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchQuestions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError('Failed to load questions.');
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const tagsArray = newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const res = await fetch('http://localhost:5000/api/questions/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newQuestion.title,
          content: newQuestion.content,
          tags: tagsArray
        }),
      });

      if (!res.ok) throw new Error('Failed to add question');

      setSuccess('Question added successfully!');
      setNewQuestion({ title: '', content: '', tags: '' });
      fetchQuestions();
    } catch (err) {
      setError('Failed to add question.');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({ 
      title: question.title, 
      content: question.content,
      tags: question.tags?.join(', ') || ''
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const tagsArray = editedQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const res = await fetch(`http://localhost:5000/api/questions/${editingQuestionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editedQuestion.title,
          content: editedQuestion.content,
          tags: tagsArray
        }),
      });

      if (!res.ok) throw new Error('Failed to update question');
      
      setEditingQuestionId(null);
      setEditedQuestion({ title: '', content: '', tags: '' });
      fetchQuestions();
    } catch (err) {
      setError('Failed to update question.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete question');
      fetchQuestions();
    } catch (err) {
      setError('Failed to delete question.');
    }
  };

  return (
    <div>
      <div className="card mb-3">
        <h2>Ask a Question</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="What's your question?"
              value={newQuestion.title}
              onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Details</label>
            <textarea
              className="form-control"
              placeholder="Provide more details..."
              value={newQuestion.content}
              onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
              rows={6}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-control"
              placeholder="javascript, react, node"
              value={newQuestion.tags}
              onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Post Question</button>
        </form>
        
        {error && <div className="text-error mt-3">{error}</div>}
        {success && <div className="text-success mt-3">{success}</div>}
      </div>

      <h2 className="mb-3">Your Questions</h2>
      
      {questions.filter(q => q.userId === user.id).length === 0 ? (
        <div className="card">
          <p>You haven't asked any questions yet.</p>
        </div>
      ) : (
        questions.filter(q => q.userId === user.id).map(q => (
          <div key={q.id} className="card mb-3">
            {editingQuestionId === q.id ? (
              <div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={editedQuestion.title}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <textarea
                    className="form-control mb-2"
                    value={editedQuestion.content}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, content: e.target.value })}
                    rows={6}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={editedQuestion.tags}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, tags: e.target.value })}
                    placeholder="Tags (comma separated)"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleUpdate}
                  >
                    Save
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setEditingQuestionId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="card-title">{q.title}</h3>
                <p className="mb-3">{q.content}</p>
                
                {q.tags && q.tags.length > 0 && (
                  <div className="mb-3">
                    {q.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="stats">
                    <span className="stat">{q.answers?.length || 0} answers</span>
                    <span className="stat">{q.viewCount} views</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => handleEdit(q)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(q.id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default QuestionPage;