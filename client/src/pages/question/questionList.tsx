import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Question {
  id: string;
  title: string;
  content: string;
  user: {
    username: string;
  };
  createdAt: string;
  tags: Array<{
    name: string;
  }>;
  viewCount: number;
  answers: Array<{
    id: string;
  }>;
}

export const fetchQuestions = async (limit?: number): Promise<Question[]> => {
  const res = await fetch('http://localhost:5000/api/questions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch questions');
  }

  const data = await res.json();
  return limit ? data.slice(0, limit) : data;
};

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (err) {
        setError('Gagal mengambil pertanyaan.');
      }
    };
    
    loadQuestions();
  }, []);

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