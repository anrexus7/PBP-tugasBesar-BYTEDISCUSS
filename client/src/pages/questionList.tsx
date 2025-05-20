import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: { id: string }[];
}

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/questions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError('Gagal mengambil pertanyaan.');
    }
  };

  const handleClickQuestion = (id: string) => {
    navigate(`/questions/${id}`); // menuju halaman detail question
  };

  return (
    <div className="center-container">
      <h2>Semua Pertanyaan</h2>
      {error && <p className="error-message">{error}</p>}
      {questions.map(q => (
        <div
          key={q.id}
          className="card"
          onClick={() => handleClickQuestion(q.id)}
          style={{ cursor: 'pointer', marginBottom: 16 }}
        >
          <h3>{q.title}</h3>
          <p>{q.content}</p>
          <p><strong>Jawaban:</strong> {q.answers?.length || 0}</p>
          <p><strong>View:</strong> {q.viewCount}</p>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
