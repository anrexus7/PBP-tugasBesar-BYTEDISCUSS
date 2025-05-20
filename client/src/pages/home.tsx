import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css';

interface Question {
  id: number;
  title: string;
  user: {
    username: string;
  };
  createdAt: string;
  tags: Array<{
    name: string;
  }>;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchQuestions = async () => {
  //     try {
  //       const response = await fetch('http://localhost:5000/api/questions', {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json'
  //         }
  //       });

  //       if (!response.ok) {
  //         throw new Error('Failed to fetch questions');
  //       }

  //       const data = await response.json();
  //       setQuestions(data.slice(0, 5)); // Limit to 5 questions
  //     } catch (error) {
  //       console.error('Error fetching questions:', error);
  //     }
  //   };

  //   fetchQuestions();
  // }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.questions || []);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
  <div className="layout">
    {/* Sidebar */}
    <aside className="sidebar">
      <div className="sidebar-buttons">
        <button className="btn">TAGS</button>
        <button className="btn">QUESTION</button>
      </div>
      <button className="btn login" onClick={() => navigate(`/auth/login`)}>LOG IN</button>
    </aside>

    <main className="main">
        <div className="profile-circle" onClick={() => navigate(`/me`)}>
          profile
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search questions..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

      <section className="questions-list">
          {searchQuery ? (
            searchResults.length > 0 ? (
              searchResults.map(question => (
                <div
                  key={question.id}
                  className="question-card"
                  onClick={() => navigate(`/questions/${question.id}`)}
                >
                  <h3>{question.title}</h3>
                  <p>By: {question.user.username}</p>
                  <div className="tags">
                    {question.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="question-card">
                No questions found matching your search.
              </div>
            )
          ) :  (
            questions.map(question => (
              <div
                key={question.id}
                className="question-card"
                onClick={() => navigate(`/questions/${question.id}`)}
              >
                <h3>{question.title}</h3>
                <p>By: {question.user.username}</p>
                <div className="tags">
                  {question.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}