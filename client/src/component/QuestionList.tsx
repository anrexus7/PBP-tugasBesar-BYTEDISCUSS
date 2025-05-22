import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: { id: string }[];
  tags?: string[];
}

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch questions.');
      setLoading(false);
    }
  };

  const handleClickQuestion = (id: string) => {
    navigate(`/questions/${id}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-error">{error}</div>;

  return (
    <div>
      {questions.map(q => (
        <div
          key={q.id}
          className="card"
          onClick={() => handleClickQuestion(q.id)}
          style={{ cursor: 'pointer' }}
        >
          <h3 className="card-title">{q.title}</h3>
          <p className="mb-3">{q.content.length > 150 ? `${q.content.substring(0, 150)}...` : q.content}</p>
          
          {q.tags && q.tags.length > 0 && (
            <div className="mb-3">
              {q.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
          
          <div className="stats">
            <span className="stat">{q.answers?.length || 0} answers</span>
            <span className="stat">{q.viewCount} views</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;