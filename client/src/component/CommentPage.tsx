import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaTrash } from 'react-icons/fa';

interface Comment {
  id: string;
  content: string;
  userId: string;
  user?: {
    name: string;
  };
  questionId?: string | null;
  answerId?: string | null;
  createdAt: string;
}

const CommentPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [answerId, setAnswerId] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/comments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        setComments(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch comments.");
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!content) {
      setError("Comment content is required.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content,
          questionId: questionId || null,
          answerId: answerId || null
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to add comment.");
      }

      setSuccess("Comment added successfully.");
      setContent('');
      setQuestionId('');
      setAnswerId('');
      const newComment = await res.json();
      setComments(prev => [...prev, newComment]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete comment.");
      }

      setComments(prev => prev.filter(c => c.id !== commentId));
      setSuccess("Comment deleted successfully.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: editedContent }),
      });

      if (!res.ok) {
        throw new Error("Failed to update comment.");
      }

      const updatedComment = await res.json();
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      setEditingCommentId(null);
      setEditedContent('');
      setSuccess("Comment updated successfully.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div>
      <div className="card mb-3">
        <h2>Add Comment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              className="form-control"
              placeholder="Your comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Question ID (optional)"
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              placeholder="Answer ID (optional)"
              value={answerId}
              onChange={(e) => setAnswerId(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Submit Comment</button>
        </form>
      </div>

      {error && <div className="text-error mb-3">{error}</div>}
      {success && <div className="text-success mb-3">{success}</div>}

      <div className="card">
        <h2>All Comments</h2>
        
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="card">
                {editingCommentId === comment.id ? (
                  <div>
                    <textarea
                      className="form-control mb-2"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleUpdateComment(comment.id)}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => setEditingCommentId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{comment.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2 text-muted">
                        <FaUser />
                        <small>{comment.user?.name || 'Anonymous'}</small>
                        <small>{new Date(comment.createdAt).toLocaleString()}</small>
                      </div>
                      
                      {(user.id === comment.userId || user.isAdmin) && (
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-sm btn-outline" 
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditedContent(comment.content);
                            }}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {comment.questionId && (
                      <div className="mt-2">
                        <small className="text-muted">On question: {comment.questionId}</small>
                      </div>
                    )}
                    {comment.answerId && (
                      <div className="mt-2">
                        <small className="text-muted">On answer: {comment.answerId}</small>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentPage;