import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: Answer[];
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
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      console.log('Token:', token);
      const res = await fetch('http://localhost:5000/api/questions/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newQuestion),
      });

      if (!res.ok) throw new Error('Gagal menambahkan pertanyaan');

      setSuccess('Pertanyaan berhasil ditambahkan.');
      setNewQuestion({ title: '', content: '' });
      // fetchQuestions();
    } catch (err) {
      setError('Gagal menambahkan question.');
    }
  };

  const handleEdit = (question: Question) => {
  setEditingQuestionId(question.id);
  setEditedQuestion({ title: question.title, content: question.content });
};

const handleUpdate = async () => {
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

    if (!res.ok) throw new Error('Gagal update pertanyaan.');
    setEditingQuestionId(null);
    setEditedQuestion({ title: '', content: '' });
    fetchQuestions();
  } catch (err) {
    console.error(err);
    setError('Gagal mengedit pertanyaan.');
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

    if (!res.ok) throw new Error('Gagal hapus pertanyaan.');
    fetchQuestions();
  } catch (err) {
    console.error(err);
    setError('Gagal menghapus pertanyaan.');
  }
};

  const fetchQuestions = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:5000/api/questions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setQuestions(data);
  } catch (err) {
    setError('Gagal memuat pertanyaan.');
  }
};

useEffect(() => {
  fetchQuestions();
}, []);


  return (
    <div className="center-container">
      <div className="form-box">
        <h2>Tambah Pertanyaan</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Judul"
            value={newQuestion.title}
            onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
          
          />
          <input
            type="text"
            placeholder="Isi pertanyaan"
            value={newQuestion.content}
            onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
          
          />
          <button type="submit">Kirim</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </div>

      <div className="card">
        <h2>Daftar Pertanyaan</h2>
        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: '20px', textAlign: 'left' }}>
            <h3>{q.title}</h3>
            <p>{q.content}</p>
            <p><strong>Jawaban:</strong> {q.answers?.length || 0}</p>
            <p><strong>View:</strong> {q.viewCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionPage;