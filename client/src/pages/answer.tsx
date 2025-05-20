import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './QuestionDetail.css';

type Answer = {
  id: string;
  content: string;
  User?: {
    name?: string;
  };
  isAccepted: boolean;
};

type Question = {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: Answer[];
};

const AnswerPage: React.FC = () => {
  const { id } = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const token = localStorage.getItem('token'); 

  useEffect(() => {
    fetch(`http://localhost:5000/api/questions/${id}/`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => res.json())
    .then(data => setQuestion(data));
  }, [id]);

  const handlePostAnswer = async () => {
  if (!newAnswer) return;

  const res = await fetch(`http://localhost:5000/api/questions/${id}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ content: newAnswer }) 
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || 'Gagal mengirim jawaban.');
    return;
  }

  setQuestion(prev => {
    if (!prev) return prev;
    return {
      ...prev,
      answers: [...(prev.answers || []), data]
    };
  });

  setNewAnswer(""); // reset input
};


  const handleDeleteAnswer = async (answerId: string) => {
    await fetch(`http://localhost:5000/api/answers/${answerId}`, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    setQuestion(prev => {
    if (!prev) return prev;
    return {
        ...prev,
        answers: prev.answers.filter(a => a.id !== answerId),
    };
    });

  };

  const handleUpdateAnswer = async (answerId: string) => {
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
  };

  if (!question) return <p>Memuat...</p>;

  return (
    <div className="container">
      <h1>{question.title}</h1>
      <p>{question.content}</p>

      <h2>Jawaban:</h2>
      <ul>
        {question.answers?.map(ans => (
          <li key={ans.id}>
            {editingAnswerId === ans.id ? (
              <>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
                <button onClick={() => handleUpdateAnswer(ans.id)}>Simpan</button>
                <button onClick={() => setEditingAnswerId(null)}>Batal</button>
              </>
            ) : (
              <>
                <p>{ans.content}</p>
                <small>oleh {ans.User?.name || 'Anonim'}</small>
                <div className="actions">
                  <button onClick={() => {
                    setEditingAnswerId(ans.id);
                    setEditedContent(ans.content);
                  }}>Edit</button>
                  <button onClick={() => handleDeleteAnswer(ans.id)}>Hapus</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      <h3>Kirim Jawaban:</h3>
      <textarea
        value={newAnswer}
        onChange={(e) => setNewAnswer(e.target.value)}
        rows={4}
        placeholder="Tulis jawaban kamu..."
      />
      <button onClick={handlePostAnswer}>Kirim</button>
    </div>
  );
}

export default AnswerPage;
