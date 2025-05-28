import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';

type Answer = {
  id: string;
  content: string;
  User?: {
    name?: string;
    userId?: string;
  };
  isAccepted: boolean;
  upvotes: number;
  downvotes: number;
};

type Question = {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: Answer[];
  tags?: string[];
  User?: {
    name?: string;
    userId?: string;
  };
};

const AnswerPage: React.FC = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        console.log('calling twice: 2');
        const res = await fetch(`http://localhost:5000/api/questions/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setQuestion(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load question');
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id, token]);

  const handlePostAnswer = async () => {
    if (!newAnswer) return;

    try {
      console.log('calling thrice : 3');
      const res = await fetch(`http://localhost:5000/api/questions/${id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newAnswer }) 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post answer');
      }

      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: [...(prev.answers || []), data]
        };
      });

      setNewAnswer("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    
    try {
      await fetch(`http://localhost:5000/api/answers/${answerId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.filter(a => a.id !== answerId),
        };
      });
    } catch (err) {
      setError('Failed to delete answer');
    }
  };

  const handleUpdateAnswer = async (answerId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/answers/${answerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editedContent })
      });
      
      const updated = await res.json();
      
      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.map(a => (a.id === answerId ? updated : a)),
        };
      });
      
      setEditingAnswerId(null);
      setEditedContent('');
    } catch (err) {
      setError('Failed to update answer');
    }
  };

  const handleVote = async (answerId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const res = await fetch(`http://localhost:5000/api/answers/${answerId}/${voteType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updated = await res.json();
      
      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.map(a => (a.id === answerId ? updated : a)),
        };
      });
    } catch (err) {
      setError('Failed to register vote');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await fetch(`http://localhost:5000/api/answers/${answerId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.map(a => 
            a.id === answerId ? 
              { ...a, isAccepted: true } : 
              { ...a, isAccepted: false }
          ),
        };
      });
    } catch (err) {
      setError('Failed to accept answer');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!question) return <div>{error || 'Question not found'}</div>;

  return (
    <div>
      <div className="card mb-3">
        <h1 className="card-title">{question.title}</h1>
        <p className="mb-3">{question.content}</p>
        
        {question.tags && question.tags.length > 0 && (
          <div className="mb-3">
            {question.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="stats">
          <span className="stat">{question.answers?.length || 0} answers</span>
          <span className="stat">{question.viewCount} views</span>
        </div>
      </div>

      <h2 className="mb-3">Answers</h2>
      
      {question.answers?.length === 0 ? (
        <div className="card">
          <p>No answers yet. Be the first to answer!</p>
        </div>
      ) : (
        question.answers?.map(answer => (
          <div key={answer.id} className={`answer ${answer.isAccepted ? 'accepted' : ''}`}>
            {editingAnswerId === answer.id ? (
              <div className="mb-3">
                <textarea
                  className="form-control mb-2"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={6}
                />
                <div className="flex gap-2">
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleUpdateAnswer(answer.id)}
                  >
                    Save
                  </button>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setEditingAnswerId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p>{answer.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => handleVote(answer.id, 'upvote')}
                    >
                      <FaThumbsUp /> {answer.upvotes || 0}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => handleVote(answer.id, 'downvote')}
                    >
                      <FaThumbsDown /> {answer.downvotes || 0}
                    </button>
                    {user.id === question.User?.userId && (
                      <button 
                        className={`btn btn-sm ${answer.isAccepted ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleAcceptAnswer(answer.id)}
                      >
                        <FaCheck /> {answer.isAccepted ? 'Accepted' : 'Accept'}
                      </button>
                    )}
                  </div>
                  <small className="text-muted">
                    answered by {answer.User?.name || 'Anonymous'}
                  </small>
                </div>
                
                {(user.id === answer.User?.userId || user.isAdmin) && (
                  <div className="flex gap-2 mt-2">
                    <button 
                      className="btn btn-sm btn-outline" 
                      onClick={() => {
                        setEditingAnswerId(answer.id);
                        setEditedContent(answer.content);
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDeleteAnswer(answer.id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}

      <div className="card mt-3">
        <h3 className="mb-3">Your Answer</h3>
        <textarea
          className="form-control mb-3"
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          rows={6}
          placeholder="Write your answer here..."
        />
        <button 
          className="btn btn-primary" 
          onClick={handlePostAnswer}
          disabled={!newAnswer.trim()}
        >
          Post Your Answer
        </button>
      </div>
      
      {error && <div className="text-error mt-3">{error}</div>}
    </div>
  );
};

export default AnswerPage;