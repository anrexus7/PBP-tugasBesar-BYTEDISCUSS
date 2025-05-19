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

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/questions',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log(res);
      const data = await res.json();
      console.log(data);
      setQuestions(data);
    } catch (err) {
      setError('Gagal mengambil data pertanyaan.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      console.log('Token:', token);
      const res = await fetch('http://localhost:5000/api/questions', {
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
      fetchQuestions();
    } catch (err) {
      setError('Gagal menambahkan question.');
    }
  };

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
