import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

interface Comment {
  id: string;
  content: string;
  userId: string;
  questionId?: string | null;
  answerId?: string | null;
}

const CommentPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');
  const [questionId, setQuestionId] = useState('');
  const [answerId, setAnswerId] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/comments') // Pastikan route ini tersedia di backend
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!content || !userId || (!questionId && !answerId)) {
      setError("Isi, userId, dan salah satu dari questionId/answerId wajib diisi.");
      return;
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          userId,
          questionId: questionId || null,
          answerId: answerId || null
        }),
      });

      if (res.ok) {
        setSuccess("Komentar berhasil ditambahkan.");
        setContent('');
        setQuestionId('');
        setAnswerId('');
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal menambahkan komentar.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim komentar.");
    }
  };

  return (
    <div className="center-container">
      <div className="form-box">
        <h2>Tambah Komentar</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Isi komentar"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Question ID (opsional)"
            value={questionId}
            onChange={(e) => setQuestionId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Answer ID (opsional)"
            value={answerId}
            onChange={(e) => setAnswerId(e.target.value)}
          />
          <button type="submit">Kirim Komentar</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>

      <div style={{ marginTop: '40px', width: '100%', maxWidth: '600px' }}>
        <h3>Daftar Komentar</h3>
        {comments.length === 0 ? (
          <p>Belum ada komentar.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="card" style={{ textAlign: 'left' }}>
              <p><strong>Isi:</strong> {comment.content}</p>
              <p><strong>User ID:</strong> {comment.userId}</p>
              {comment.questionId && <p><strong>Untuk Pertanyaan:</strong> {comment.questionId}</p>}
              {comment.answerId && <p><strong>Untuk Jawaban:</strong> {comment.answerId}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentPage;
