import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaCheck, FaEdit, FaTrash, FaReply, FaComment } from 'react-icons/fa';
import '../css/answer.css';

type User = {
  id: string;
  username: string;
  profilePicture?: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: User;
};

type Answer = {
  id: string;
  content: string;
  user?: User;
  isAccepted: boolean;
  voteCount?: number;
  createdAt: string;
  comments?: Comment[];
  votes?: { value: number; user: User }[];
};

type Question = {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  voteCount?: number;
  answers: Answer[];
  user?: User;
  createdAt: string;
  votes?: { value: number; user: User }[];
};

const AnswerPage: React.FC = () => {
  const { id } = useParams();
const [question, setQuestion] = useState<Question | null>({
  id: '',
  title: '',
  content: '',
  viewCount: 0,
  voteCount: 0,
  answers: [],
  user: undefined,
  createdAt: new Date().toISOString(),
  votes: []
});
  const [newAnswer, setNewAnswer] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});

  const token = localStorage.getItem('token');

  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) return;

    try {
      console.log("calling fourth : 4");
      const res = await fetch(`http://localhost:5000/api/questions/${id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newAnswer }) 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to post answer');
      }

      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: [...(prev.answers || []), data]
        };
      });

      setNewAnswer("");
    } catch (err) {
      console.error('Error posting answer:', err);
      setError('Failed to post answer');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/answers/${answerId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete answer');
      }

      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.filter(a => a.id !== answerId),
        };
      });
    } catch (err) {
      console.error('Error deleting answer:', err);
      setError('Failed to delete answer');
    }
  };

  const handleUpdateAnswer = async (answerId: string) => {
    if (!editedContent.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/answers/${answerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editedContent })
      });

      const updated = await res.json();

      if (!res.ok) {
        throw new Error('Failed to update answer');
      }

      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.map(a => (a.id === answerId ? updated : a)),
        };
      });
      
      setEditingAnswerId(null);
      setEditedContent('');
    } catch (err) {
      console.error('Error updating answer:', err);
      setError('Failed to update answer');
    }
  };

// --- Old upvote/downvote logic (commented out for reference) ---
const handleQuestionVote = async (value: number) => {
  if (!token) {
    alert('Please login to vote');
    return;
  }
  try {
    console.log('calling fifth : 5');
    const res = await fetch(`http://localhost:5000/api/questions/${id}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ value })
    });
    const updatedQuestion = await res.json();
    if (!res.ok) {
      throw new Error(updatedQuestion.error || 'Failed to process vote');
    }
    setUserVotes(prev => {
      const key = `q-${id}`;
      // If clicking same vote, remove it
      if (prev[key] === value) {
        const newVotes = {...prev};
        delete newVotes[key];
        return newVotes;
      }
      // Otherwise update/add the vote
      return {...prev, [key]: value};
    });
    setQuestion(prev => ({
      ...prev!,
      voteCount: updatedQuestion.voteCount || 0
    }));
  } catch (err) {
    console.error('Error voting:', err);
    setError('Failed to process vote');
  }
};

const handleAnswerVote = async (answerId: string, value: number) => {
  if (!token) {
    alert('Please login to vote');
    return;
  }
  try {
    const res = await fetch(`http://localhost:5000/api/answers/${answerId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ value })
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to process vote');
    }
    const updatedAnswer = await res.json();
    setUserVotes(prev => {
      const key = `a-${answerId}`;
      // If clicking same vote, remove it
      if (prev[key] === value) {
        const newVotes = {...prev};
        delete newVotes[key];
        return newVotes;
      }
      // Otherwise update/add the vote
      return {...prev, [key]: value};
    });
    setQuestion(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: prev.answers.map(answer => 
          answer.id === answerId 
            ? { 
                ...answer, 
                voteCount: updatedAnswer.voteCount 
              } 
            : answer
        )
      };
    });
  } catch (err:any) {
    console.error('Error voting on answer:', err);
    setError(err.message || 'Failed to process vote');
  }
};
// --- End old logic ---

  // --- New upvote/downvote logic (active) ---
  // const handleQuestionVote = async (value: number) => {
  //   if (!token) {
  //     alert('Please login to vote');
  //     return;
  //   }
  //   try {
  //     // Toggle logic: if already voted with this value, remove vote (set to 0)
  //     const currentVote = userVotes[`q-${question?.id}`];
  //     const sendValue = currentVote === value ? 0 : value;
  //     const res = await fetch(`http://localhost:5000/api/questions/${id}/vote`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify({ value: sendValue })
  //     });
  //     const updatedQuestion = await res.json();
  //     if (!res.ok) {
  //       throw new Error(updatedQuestion.error || 'Failed to process vote');
  //     }
  //     setUserVotes(prev => {
  //       const key = `q-${id}`;
  //       if (sendValue === 0) {
  //         const newVotes = { ...prev };
  //         delete newVotes[key];
  //         return newVotes;
  //       }
  //       return { ...prev, [key]: sendValue };
  //     });
  //     setQuestion(prev => ({
  //       ...prev!,
  //       voteCount: updatedQuestion.voteCount || 0
  //     }));
  //   } catch (err) {
  //     console.error('Error voting:', err);
  //     setError('Failed to process vote');
  //   }
  // };

  // const handleAnswerVote = async (answerId: string, value: number) => {
  //   if (!token) {
  //     alert('Please login to vote');
  //     return;
  //   }
  //   try {
  //     const currentVote = userVotes[`a-${answerId}`];
  //     const sendValue = currentVote === value ? 0 : value;
  //     const res = await fetch(`http://localhost:5000/api/answers/${answerId}/vote`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`
  //       },
  //       body: JSON.stringify({ value: sendValue })
  //     });
  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData.message || 'Failed to process vote');
  //     }
  //     const updatedAnswer = await res.json();
  //     setUserVotes(prev => {
  //       const key = `a-${answerId}`;
  //       if (sendValue === 0) {
  //         const newVotes = { ...prev };
  //         delete newVotes[key];
  //         return newVotes;
  //       }
  //       return { ...prev, [key]: sendValue };
  //     });
  //     setQuestion(prev => {
  //       if (!prev) return prev;
  //       return {
  //         ...prev,
  //         answers: prev.answers.map(answer =>
  //           answer.id === answerId
  //             ? { ...answer, voteCount: updatedAnswer.voteCount }
  //             : answer
  //         )
  //       };
  //     });
  //   } catch (err: any) {
  //     console.error('Error voting on answer:', err);
  //     setError(err.message || 'Failed to process vote');
  //   }
  // };
  // --- End new logic ---


  const reloadComments = async (answerId: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api?answerId=${answerId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error('Failed to load comments');
    }
    
    const comments = await res.json();
    
    setQuestion(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: prev.answers.map(answer => 
          answer.id === answerId 
            ? { ...answer, comments }
            : answer
        )
      };
    });
  } catch (err) {
    console.error('Error loading comments:', err);
  }
};

// Panggil fungsi ini setelah berhasil post comment
const handlePostComment = async (answerId: string) => {
  const content = commentInputs[answerId];
  if (!content?.trim()) {
    setCommentErrors(prev => ({ ...prev, [answerId]: 'Comment cannot be empty' }));
    return;
  }

  try {
    setCommentErrors(prev => ({ ...prev, [answerId]: '' }));
    
    const res = await fetch(`http://localhost:5000/api/answers/${answerId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to post comment');
    }

    // Refresh comments after successful post
    await fetchCommentsForAnswer(answerId);
    setCommentInputs(prev => ({ ...prev, [answerId]: '' }));
  } catch (err) {
    console.error('Error posting comment:', err);
    setCommentErrors(prev => ({ 
      ...prev, 
      [answerId]: err instanceof Error ? err.message : 'Failed to post comment' 
    }));
  }
};

const fetchCommentsForAnswer = async (answerId: string) => {
  try {
    const res = await fetch(`http://localhost:5000/api?answerId=${answerId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!res.ok) throw new Error('Failed to load comments');
    
    const comments = await res.json();
    
    setQuestion(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: prev.answers.map(answer => 
          answer.id === answerId 
            ? { ...answer, comments }
            : answer
        )
      };
    });
  } catch (err) {
    console.error('Error loading comments:', err);
    setCommentErrors(prev => ({ 
      ...prev, 
      [answerId]: 'Failed to load comments' 
    }));
  }
};


const reloadAllData = async () => {
  try {
    setIsLoading(true);
    // Fetch question data
    const questionRes = await fetch(`http://localhost:5000/api/questions/${id}`, {
      headers: { 
        Authorization: `Bearer ${token}`
      }
    });
    
    if (!questionRes.ok) throw new Error('Failed to fetch question');
    
    const questionData = await questionRes.json();
    setQuestion(questionData);

    // Fetch votes if logged in
    if (token) {
      const votesRes = await fetch('http://localhost:5000/api/votes/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (votesRes.ok) {
        const votesData = await votesRes.json();
        const votesMap = votesData.votes.reduce((acc: Record<string, number>, vote: any) => {
          if (vote.questionId) acc[`q-${vote.questionId}`] = vote.value;
          if (vote.answerId) acc[`a-${vote.answerId}`] = vote.value;
          return acc;
        }, {});
        setUserVotes(votesMap);
      }
    }
  } catch (err) {
    console.error('Error reloading data:', err);
    setError('Failed to reload data');
  } finally {
    setIsLoading(false);
  }
};

// Commented out to prevent double-fetching and double-incrementing viewCount:
// useEffect(() => {
//   const fetchQuestionWithComments = async () => {
//     try {
//       const res = await fetch(`http://localhost:5000/api/questions/${id}`, {
//         headers: { 
//           Authorization: `Bearer ${token}`
//         }
//       });
      
//       if (!res.ok) throw new Error('Failed to fetch question');
      
//       const questionData = await res.json();
//       setQuestion(questionData);
//     } catch (err) {
//       console.error('Error fetching question:', err);
//       setError('Failed to load question');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   fetchQuestionWithComments();
// }, [id, token]);



  useEffect(() => {
    reloadAllData();
  }, [id, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) return <div className="loading">Loading question...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!question) return <div className="error">Question not found</div>;

  return (
    <div className="question-detail-container">
      <div className="question-header">
        <h1>{question.title}</h1>
        
        <div className="question-meta">
          <div className="user-info">
            <img 
              src={question.user?.profilePicture 
                ? `http://localhost:5000/uploads/${question.user.profilePicture}`
                : 'http://localhost:5000/uploads/defaultPic.png'}
              alt={question.user?.username || 'Anonymous'}
              className="user-avatar"
            />
            <span>{question.user?.username || 'Anonymous'}</span>
            <span className="timestamp">asked {formatDate(question.createdAt)}</span>
          </div>
          <span className="view-count">{question.viewCount} views</span>
        </div>
      </div>

      <div className="question-content-container">
        <div className="vote-section">
          <button 
            className={`vote-btn upvote ${userVotes[`q-${question.id}`] === 1 ? 'active' : ''}`}
            onClick={() => handleQuestionVote(1)}
          >
            <FaThumbsUp />
          </button>
          <span className="vote-count">{question.voteCount ?? 0}</span>
          <button 
            className={`vote-btn downvote ${userVotes[`q-${question.id}`] === -1 ? 'active' : ''}`}
            onClick={() => handleQuestionVote(-1)}
          >
            <FaThumbsDown />
          </button>
        </div>

        <div className="question-content">
          <p>{question.content}</p>
        </div>
      </div>

      <div className="answers-section">
        <h2>{question.answers?.length || 0} Answers</h2>

        {question.answers?.length === 0 ? (
          <p className="no-answers">No answers yet. Be the first to answer!</p>
        ) : (
          <div className="answers-list">
            {question.answers?.map(answer => (
              <div key={answer.id} className={`answer-card ${answer.isAccepted ? 'accepted' : ''}`}>
                {answer.isAccepted && (
                  <div className="accepted-badge">
                    <FaCheck /> Accepted Answer
                  </div>
                )}
                
                <div className="answer-content">
                  {editingAnswerId === answer.id ? (
                    <div className="edit-answer-form">
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={6}
                      />
                      <div className="edit-actions">
                        <button 
                          className="save-btn"
                          onClick={() => handleUpdateAnswer(answer.id)}
                        >
                          Save
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={() => setEditingAnswerId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="vote-section">
                        <button 
                          className={`vote-btn upvote ${userVotes[`a-${answer.id}`] === 1 ? 'active' : ''}`}
                          onClick={() => handleAnswerVote(answer.id, 1)}
                        >
                          <FaThumbsUp />
                        </button>
                        <span className="vote-count">{answer.voteCount ?? 0}</span>
                        <button 
                          className={`vote-btn downvote ${userVotes[`a-${answer.id}`] === -1 ? 'active' : ''}`}
                          onClick={() => handleAnswerVote(answer.id, -1)}
                        >
                          <FaThumbsDown />
                        </button>
                      </div>
                      
                      <div className="answer-text">
                        <p>{answer.content}</p>
                        <div className="answer-footer">
                          <div className="user-info">
                            <img 
                              src={answer.user?.profilePicture 
                                ? `http://localhost:5000/uploads/${answer.user.profilePicture}`
                                : 'http://localhost:5000/uploads/defaultPic.png'}
                              alt={answer.user?.username || 'Anonymous'}
                              className="user-avatar"
                            />
                            <span>{answer.user?.username || 'Anonymous'}</span>
                            <span className="timestamp">answered {formatDate(answer.createdAt)}</span>
                          </div>
                          {token && (
                            <div className="answer-actions">
                              <button 
                                className="edit-btn"
                                onClick={() => {
                                  setEditingAnswerId(answer.id);
                                  setEditedContent(answer.content);
                                }}
                              >
                                <FaEdit /> Edit
                              </button>
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteAnswer(answer.id)}
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Comments Section */}
                  <div className="comments-section">
                    {isLoading ? (
  <div className="loading-comments">Loading comments...</div>
) : (
  answer.comments?.map(comment => (
    <div key={comment.id} className="comment">
      <p className="comment-content">{comment.content}</p>
      <div className="comment-meta">
        <img 
          src={comment.user?.profilePicture 
            ? `http://localhost:5000/uploads/${comment.user.profilePicture}`
            : 'http://localhost:5000/uploads/defaultPic.png'}
          alt={comment.user?.username || 'Anonymous'}
          className="user-avatar small"
        />
        <span className="comment-user">
          {comment.user?.username || 'Anonymous'}
        </span>
        <span className="timestamp">
          {formatDate(comment.createdAt)}
        </span>
      </div>
    </div>
  ))
)}

                    {token && (
                      <div className="new-comment-form">
                        <textarea
                          value={commentInputs[answer.id] || ''}
                          onChange={(e) => 
                            setCommentInputs(prev => ({ 
                              ...prev, 
                              [answer.id]: e.target.value 
                            }))
                          }
                          placeholder="Add a comment..."
                          rows={2}
                        />
                        <button 
                          className="post-comment-btn"
                          onClick={() => handlePostComment(answer.id)}
                        >
                          <FaComment /> Add Comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {token && (
          <div className="new-answer-form">
            <h3>Your Answer</h3>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer here..."
              rows={8}
            />
            <button 
              className="submit-answer-btn"
              onClick={handlePostAnswer}
            >
              <FaReply /> Post Your Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerPage;