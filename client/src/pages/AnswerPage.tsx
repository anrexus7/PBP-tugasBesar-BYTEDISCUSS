import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaCheck, FaEdit, FaTrash, FaReply, FaComment } from 'react-icons/fa';
import styles from '../components/AnswerPage/AnswerPage.module.css';
import * as api from '../components/AnswerPage/api';
import { Question, Answer } from '../components/AnswerPage/types';

const AnswerPage = () => {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [newAnswer, setNewAnswer] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});
  const [commentErrors, setCommentErrors] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');

  const token = localStorage.getItem('token');

  // Helper functions
  const getCurrentUserId = (): string | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (err) {
      return null;
    }
  };

  const isAnswerOwner = (answer: Answer): boolean => {
    const currentUserId = getCurrentUserId();
    return currentUserId !== null && answer.user?.id === currentUserId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Data fetching
  const loadQuestionData = async () => {
    try {
      setIsLoading(true);
      const questionData = await api.fetchQuestionWithComments(id!, token || undefined);
      
      if (token) {
        const votesData = await api.fetchUserVotes(token);
        const votesMap = votesData.votes.reduce((acc: Record<string, number>, vote: any) => {
          if (vote.questionId) acc[`q-${vote.questionId}`] = vote.value;
          if (vote.answerId) acc[`a-${vote.answerId}`] = vote.value;
          return acc;
        }, {});
        setUserVotes(votesMap);
      }

      setQuestion(questionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load question data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestionData();
  }, [id, token]);

  // Answer handlers
  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) return;

    try {
      const data = await api.postAnswer(id!, newAnswer, token!);
      setQuestion(prev => prev ? { ...prev, answers: [...(prev.answers || []), data] } : prev);
      setNewAnswer('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post answer');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    
    try {
      await api.deleteAnswer(answerId, token!);
      setQuestion(prev => prev ? { ...prev, answers: prev.answers.filter(a => a.id !== answerId) } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete answer');
    }
  };

  const handleUpdateAnswer = async (answerId: string) => {
    if (!editedContent.trim()) return;

    try {
      const updated = await api.updateAnswer(answerId, editedContent, token!);
      setQuestion(prev => prev ? { ...prev, answers: prev.answers.map(a => (a.id === answerId ? updated : a)) } : prev);
      setEditingAnswerId(null);
      setEditedContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update answer');
    }
  };

  // Comment handlers
  const handlePostComment = async (answerId: string) => {
    const content = commentInputs[answerId];
    if (!content?.trim()) {
      setCommentErrors(prev => ({ ...prev, [answerId]: 'Comment cannot be empty' }));
      return;
    }

    try {
      setCommentErrors(prev => ({ ...prev, [answerId]: '' }));
      await api.postComment(answerId, content, token!);
      const comments = await api.fetchCommentsForAnswer(answerId, token || undefined);
      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.map(answer => 
            answer.id === answerId ? { ...answer, comments } : answer
          ),
        };
      });
      setCommentInputs(prev => ({ ...prev, [answerId]: '' }));
    } catch (err) {
      setCommentErrors(prev => ({ 
        ...prev, 
        [answerId]: err instanceof Error ? err.message : 'Failed to post comment' 
      }));
    }
  };

  const handleStartEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditedCommentContent(currentContent);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditedCommentContent('');
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editedCommentContent.trim()) return;

    try {
      await api.updateComment(commentId, editedCommentContent, token!);
      const answerId = question?.answers.find(a => a.comments?.some(c => c.id === commentId))?.id;
      if (answerId) {
        const comments = await api.fetchCommentsForAnswer(answerId, token || undefined);
        setQuestion(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            answers: prev.answers.map(answer => 
              answer.id === answerId ? { ...answer, comments } : answer
            ),
          };
        });
      }
      setEditingCommentId(null);
      setEditedCommentContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.deleteComment(commentId, token!);
      const answerId = question?.answers.find(a => a.comments?.some(c => c.id === commentId))?.id;
      if (answerId) {
        const comments = await api.fetchCommentsForAnswer(answerId, token || undefined);
        setQuestion(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            answers: prev.answers.map(answer => 
              answer.id === answerId ? { ...answer, comments } : answer
            ),
          };
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  // Vote handlers
  const handleQuestionVote = async (value: number) => {
    if (!token) {
      alert('Please login to vote');
      return;
    }

    try {
      const updatedQuestion = await api.postVote(id!, value, token);
      setUserVotes(prev => {
        const key = `q-${id}`;
        if (prev[key] === value) {
          const newVotes = { ...prev };
          delete newVotes[key];
          return newVotes;
        }
        return { ...prev, [key]: value };
      });
      setQuestion(updatedQuestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process vote');
    }
  };

  // Render loading or error states
  if (isLoading) return <div className={styles.loading}>Loading question...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!question) return <div className={styles.error}>Question not found</div>;

  return (
    <div className={styles.questionDetailContainer}>
      {/* Question Header */}
      <div className={styles.questionHeader}>
        <h1>{question.title}</h1>
        <div className={styles.questionMeta}>
          <div className={styles.userInfo}>
            <img 
              src={question.user?.profilePicture 
                ? `http://localhost:5000/uploads/${question.user.profilePicture}`
                : 'http://localhost:5000/uploads/defaultPic.png'}
              alt={question.user?.username || 'Anonymous'}
              className={styles.userAvatar}
            />
            <span>{question.user?.username || 'Anonymous'}</span>
            <span className={styles.timestamp}>asked {formatDate(question.createdAt)}</span>
          </div>
          <span className={styles.viewCount}>{question.viewCount} views</span>
        </div>
      </div>

      {/* Question Content */}
      <div className={styles.questionContentContainer}>
        <div className={styles.voteSection}>
          <button 
            className={`${styles.voteBtn} ${styles.upvote} ${userVotes[`q-${question.id}`] === 1 ? styles.active : ''}`}
            onClick={() => handleQuestionVote(1)}
          >
            <FaThumbsUp />
          </button>
          <span className={styles.voteCount}>{question.votes?.length || 0}</span>
          <button 
            className={`${styles.voteBtn} ${styles.downvote} ${userVotes[`q-${question.id}`] === -1 ? styles.active : ''}`}
            onClick={() => handleQuestionVote(-1)}
          >
            <FaThumbsDown />
          </button>
        </div>

        <div className={styles.questionContent}>
          <p>{question.content}</p>
        </div>
      </div>

      {/* Answers Section */}
      <div className={styles.answersSection}>
        <h2>{question.answers?.length || 0} Answers</h2>

        {question.answers?.length === 0 ? (
          <p className={styles.noAnswers}>No answers yet. Be the first to answer!</p>
        ) : (
          <div className={styles.answersList}>
            {question.answers?.map(answer => (
              <div key={answer.id} className={`${styles.answerCard} ${answer.isAccepted ? styles.accepted : ''}`}>
                {answer.isAccepted && (
                  <div className={styles.acceptedBadge}>
                    <FaCheck /> Accepted Answer
                  </div>
                )}
                
                <div className={styles.answerContent}>
                  {editingAnswerId === answer.id ? (
                    <div className={styles.editAnswerForm}>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={6}
                      />
                      <div className={styles.editActions}>
                        <button 
                          className={styles.saveBtn}
                          onClick={() => handleUpdateAnswer(answer.id)}
                        >
                          Save
                        </button>
                        <button 
                          className={styles.cancelBtn}
                          onClick={() => setEditingAnswerId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.answerText}>
                        <p>{answer.content}</p>
                        <div className={styles.answerFooter}>
                          <div className={styles.userInfo}>
                            <img 
                              src={answer.user?.profilePicture 
                                ? `http://localhost:5000/uploads/${answer.user.profilePicture}`
                                : 'http://localhost:5000/uploads/defaultPic.png'}
                              alt={answer.user?.username || 'Anonymous'}
                              className={styles.userAvatar}
                            />
                            <span>{answer.user?.username || 'Anonymous'}</span>
                            <span className={styles.timestamp}>answered {formatDate(answer.createdAt)}</span>
                          </div>
                          {token && isAnswerOwner(answer) && (
                            <div className={styles.answerActions}>
                              <button 
                                className={styles.editBtn}
                                onClick={() => {
                                  setEditingAnswerId(answer.id);
                                  setEditedContent(answer.content);
                                }}
                              >
                                <FaEdit /> Edit
                              </button>
                              <button 
                                className={styles.deleteBtn}
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
                  <div className={styles.commentsSection}>
                    {answer.comments?.map(comment => (
                      <div key={comment.id} className={styles.comment}>
                        {editingCommentId === comment.id ? (
                          <div className={styles.editCommentForm}>
                            <textarea
                              value={editedCommentContent}
                              onChange={(e) => setEditedCommentContent(e.target.value)}
                              rows={3}
                            />
                            <div className={styles.commentEditActions}>
                              <button 
                                className={styles.saveBtn}
                                onClick={() => handleUpdateComment(comment.id)}
                              >
                                Save
                              </button>
                              <button 
                                className={styles.cancelBtn}
                                onClick={handleCancelEditComment}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className={styles.commentContent}>{comment.content}</p>
                            <div className={styles.commentMeta}>
                              <img 
                                src={comment.user?.profilePicture 
                                  ? `http://localhost:5000/uploads/${comment.user.profilePicture}`
                                  : 'http://localhost:5000/uploads/defaultPic.png'}
                                alt={comment.user?.username || 'Anonymous'}
                                className={`${styles.userAvatar} ${styles.small}`}
                              />
                              <span className={styles.commentUser}>
                                {comment.user?.username || 'Anonymous'}
                              </span>
                              <span className={styles.timestamp}>
                                {formatDate(comment.createdAt)}
                              </span>
                              {token && comment.user?.id === getCurrentUserId() && (
                                <div className={styles.commentActions}>
                                  <button 
                                    className={styles.editBtn}
                                    onClick={() => handleStartEditComment(comment.id, comment.content)}
                                  >
                                    <FaEdit /> Edit
                                  </button>
                                  <button 
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteComment(comment.id)}
                                  >
                                    <FaTrash /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {token && (
                      <div className={styles.newCommentForm}>
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
                        {commentErrors[answer.id] && (
                          <div className={styles.errorMessage}>{commentErrors[answer.id]}</div>
                        )}
                        <button 
                          className={styles.postCommentBtn}
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
          <div className={styles.newAnswerForm}>
            <h3>Your Answer</h3>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer here..."
              rows={8}
            />
            <button 
              className={styles.submitAnswerBtn}
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