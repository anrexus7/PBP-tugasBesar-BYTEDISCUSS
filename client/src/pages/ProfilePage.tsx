import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import styles from '../components/ProfilePage/ProfilePage.module.css';
import { User, Question, Answer } from '../components/ProfilePage/types';

const API_BASE_URL = 'http://localhost:5000/api';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/auth/login');
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (err: any) {
        setMessage(err.response?.data?.message || 'Failed to fetch user profile');
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/auth/login');
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* <button
          className={styles.logoutButton}
          onClick={() => {
            localStorage.removeItem('token');
            navigate('/auth/login');
          }}
        >
          Logout
        </button> */}

        <div className={styles.profileCard}>
          <div className={styles.pictureContainer}>
            <div
              className={styles.picture}
              style={{
                backgroundImage: user.profilePicture
                  ? `url(${API_BASE_URL.replace('/api', '')}/uploads/${user.profilePicture})`
                  : 'url(https://via.placeholder.com/150)',
              }}
            />
            <button 
              className={styles.editButton}
              onClick={() => navigate('/editProfile')}
            >
              Edit Profile
            </button>
          </div>

          <div className={styles.info}>
            <h2 className={styles.username}>{user.username}</h2>
            <p className={styles.email}>{user.email}</p>
            <div className={styles.bioSection}>
              <h4>About Me</h4>
              <p className={styles.bio}>{user.bio || 'No bio yet.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.activitySection}>
          <div className={styles.questionsSection}>
            <h3 className={styles.sectionTitle}>My Questions ({user.questions.length})</h3>
            {user.questions.length > 0 ? (
              <div className={styles.questionsList}>
                {user.questions.map((question: Question) => (
                  <div 
                    key={question.id} 
                    className={styles.questionItem}
                    onClick={() => navigate(`/questions/${question.id}`)}
                  >
                    <h4 className={styles.questionTitle}>{question.title}</h4>
                    <p className={styles.questionContent}>{question.content}...</p>
                    <div className={styles.meta}>
                      <span className={styles.date}>Asked on {formatDate(question.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>You haven't asked any questions yet.</p>
                <button 
                  className={styles.primaryButton}
                  onClick={() => navigate('/questions/new')}
                >
                  Ask Your First Question
                </button>
              </div>
            )}
          </div>

          <div className={styles.answersSection}>
            <h3 className={styles.sectionTitle}>My Answers ({user.answers.length})</h3>
            {user.answers.length > 0 ? (
              <div className={styles.answersList}>
                {user.answers.map((answer: Answer) => (
                  <div 
                    key={answer.id} 
                    className={styles.answerItem}
                    onClick={() => navigate(`/questions/${answer.questionId}`)}
                  >
                    <h4 className={styles.answerQuestionTitle}>Question: {answer.questionTitle}</h4>
                    <p className={styles.answerContent}>{answer.content.substring(0, 150)}...</p>
                    <div className={styles.meta}>
                      <span className={styles.date}>Answered on {formatDate(answer.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>You haven't answered any questions yet.</p>
                <button 
                  className={styles.primaryButton}
                  onClick={() => navigate('/mainPage')}
                >
                  Browse Questions to Answer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className={styles.messageContainer}>
          <p className={styles.errorMessage}>{message}</p>
        </div>
      )}
      
      <Outlet />
    </div>
  );
};

export default ProfilePage;