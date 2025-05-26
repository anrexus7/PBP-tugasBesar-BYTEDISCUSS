import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEdit, FaTrash, FaCheck, FaTimes, FaTag } from 'react-icons/fa';
import '../css/mainPage.css';

interface Question {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: Answer[];
  tags: { id: string; name: string }[];
  user: { 
    id: string;
    username: string;
    profilePicture?: string;
  };
  userId: string;
  createdAt: string;
}

interface Answer {
  id: string;
  content: string;
  isAccepted: boolean;
  User: {
    username: string;
  };
}

interface Tag {
  id: string;
  name: string;
  description: string;
}

const QuestionPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '', tags: [] as string[] });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState({ title: '', content: '', tags: [] as string[] });
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagError, setTagError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1]))?.id : null;

  const fetchQuestions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/questions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQuestions(data);
      console.log('Fetched questions:', data);


    } catch (err) {
      setError('Failed to load questions');
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/tags', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAvailableTags(data);
    } catch (err) {
      console.error('Failed to load tags', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const selectedTags = availableTags
        .filter(tag => newQuestion.tags.includes(tag.id))
        .map(tag => tag.name);

      const res = await fetch('http://localhost:5000/api/questions/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newQuestion.title,
          content: newQuestion.content,
          tags: selectedTags
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add question');
      }

      const newQuestionData = await res.json();
      setSuccess('Question added successfully');
      setNewQuestion({ title: '', content: '', tags: [] });
      fetchQuestions();
    } catch (err:any) {
      setError(err.message || 'Failed to add question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({
      title: question.title,
      content: question.content,
      tags: question.tags?.map((tag) => tag.id) || [],
    });
  };

  const handleUpdate = async () => {
    if (!editingQuestionId) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/questions/${editingQuestionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editedQuestion.title,
            content: editedQuestion.content,
            tags: editedQuestion.tags,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update question");
      }

      setEditingQuestionId(null);
      setEditedQuestion({ title: "", content: "", tags: [] });
      fetchQuestions();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update question");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/questions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete question");
      }

      fetchQuestions();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete question");
    }
  };

  const handleTagToggle = (tagId: string, isEditing: boolean) => {
    if (isEditing) {
      setEditedQuestion((prev) => ({
        ...prev,
        tags: prev.tags.includes(tagId)
          ? prev.tags.filter((id) => id !== tagId)
          : [...prev.tags, tagId],
      }));
    } else {
      setNewQuestion((prev) => ({
        ...prev,
        tags: prev.tags.includes(tagId)
          ? prev.tags.filter((id) => id !== tagId)
          : [...prev.tags, tagId],
      }));
    }
  };

   const handleCreateTag = async () => {
    try {
      setTagError('');
      
      if (!newTagName.trim()) {
        setTagError('Tag name cannot be empty');
        return;
      }

      console.log("Tag trim: ", newTagName.trim());

      const res = await fetch('http://localhost:5000/api/tags/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: [newTagName.trim().toLowerCase()]
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create tag');
      }

      setNewTagName('');
      setShowTagForm(false);
      fetchTags();
    } catch (err:any) {
      console.error('Error creating tag:', err);
      setTagError(err.message || 'Failed to create tag');
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchTags();
  }, []);

  return (
    <div className="home-container" style={styles.homeContainer}>
      <div className="main-content" style={styles.mainContent}>
        <div className="form-box" style={styles.formBox}>
          <h2 style={styles.formTitle}>Ask a Question</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <input
                type="text"
                placeholder="Title"
                value={newQuestion.title}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, title: e.target.value })
                }
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <textarea
                placeholder="Your question..."
                value={newQuestion.content}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, content: e.target.value })
                }
                rows={6}
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.tagSection}>
              <h4 style={styles.sectionTitle}>Tags</h4>
              <div style={styles.tagContainer}>
                {availableTags.map((tag) => (
                  <button
                    key={`available-tag-${tag.id}`}
                    type="button"
                    onClick={() => handleTagToggle(tag.id, false)}
                    style={{
                      ...styles.tagButton,
                      backgroundColor: newQuestion.tags.includes(tag.id)
                        ? "#007bff"
                        : "#f8f9fa",
                      color: newQuestion.tags.includes(tag.id)
                        ? "white"
                        : "#212529",
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTagForm(!showTagForm)}
                style={styles.createTagButton}
              >
                <FaTag /> Create New Tag
              </button>

              {showTagForm && (
                <div style={styles.tagFormContainer}>
                  <div style={styles.formGroup}>
                    <input
                      type="text"
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => {
                        setNewTagName(e.target.value);
                        setTagError("");
                      }}
                      style={styles.input}
                      required
                    />
                  </div>
                  {tagError && <p style={styles.errorMessage}>{tagError}</p>}
                  <div style={styles.formActions}>
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      style={styles.primaryButton}
                    >
                      Create Tag
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTagForm(false);
                        setTagError("");
                      }}
                      style={styles.secondaryButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" style={styles.submitButton}>
              Post Question
            </button>
          </form>
          {error && <p style={styles.errorMessage}>{error}</p>}
          {success && <p style={styles.successMessage}>{success}</p>}
        </div>

        <div className="questions-list" style={styles.questionsList}>
          <h2 style={styles.listTitle}>Questions</h2>

          {questions.length === 0 ? (
            <div style={styles.noQuestions}>
              <p>No questions yet.</p>
            </div>
          ) : (
            questions.map((question) => (
              <div key={`question-${question.id}`} style={styles.questionCard}>
                {currentUserId === question.userId && (
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => handleEdit(question)}
                      style={styles.editButton}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      style={styles.deleteButton}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                )}

                {editingQuestionId === question.id ? (
                  <div style={styles.editForm}>
                    <input
                      type="text"
                      value={editedQuestion.title}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          title: e.target.value,
                        })
                      }
                      style={styles.editInput}
                      required
                    />
                    <textarea
                      value={editedQuestion.content}
                      onChange={(e) =>
                        setEditedQuestion({
                          ...editedQuestion,
                          content: e.target.value,
                        })
                      }
                      rows={6}
                      style={styles.editTextarea}
                      required
                    />

                    <div style={styles.editTagSection}>
                      <h4>Tags</h4>
                      <div style={styles.tagContainer}>
                        {availableTags.map((tag) => (
                          <button
                            key={`edit-tag-${tag.id}`}
                            type="button"
                            onClick={() => handleTagToggle(tag.id, true)}
                            style={{
                              ...styles.tagButton,
                              backgroundColor: editedQuestion.tags.includes(
                                tag.id
                              )
                                ? "#007bff"
                                : "#f8f9fa",
                              color: editedQuestion.tags.includes(tag.id)
                                ? "white"
                                : "#212529",
                            }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={styles.formActions}>
                      <button
                        onClick={handleUpdate}
                        style={styles.primaryButton}
                      >
                        <FaCheck /> Save
                      </button>
                      <button
                        onClick={() => setEditingQuestionId(null)}
                        style={styles.secondaryButton}
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={styles.questionTitle}>{question.title}</h3>
                    <p style={styles.questionContent}>{question.content}</p>

                    {question.tags && question.tags.length > 0 && (
                      <div style={styles.questionTags}>
                        {question.tags.map((tag) => {
                          const tagData =
                            availableTags.find((t) => t.id === tag.id) || tag;
                          return (
                            <span
                              key={`question-tag-${tag.id}`}
                              style={styles.tagBadge}
                            >
                              {typeof tagData === "object"
                                ? tagData.name
                                : tagData}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div style={styles.questionMeta}>
                      <span style={styles.metaItem}>
                        Asked by {question.user?.username  || "Anonymous"}
                      </span>
                      <span style={styles.metaItem}>
                        {" "}
                        • {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                      <span style={styles.metaItem}>
                        {" "}
                        • {question.viewCount} views
                      </span>
                      <span style={styles.metaItem}>
                        {" "}
                        • {question.answers?.length || 0} answers
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  homeContainer: {
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },
  mainContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem",
  },
  formBox: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "2rem",
  },
  formTitle: {
    marginBottom: "1.5rem",
    color: "#333",
    fontSize: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
  },
  formGroup: {
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  textarea: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    minHeight: "150px",
    resize: "vertical" as const,
  },
  tagSection: {
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    marginBottom: "0.5rem",
    color: "#333",
  },
  tagContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  tagButton: {
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    border: "1px solid #ddd",
    cursor: "pointer",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
  },
  createTagButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    color: "black",
    fontSize: "0.9rem",
  },
  tagFormContainer: {
    marginTop: "1rem",
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#f9f9f9",
  },
  formActions: {
    display: "flex",
    gap: "0.5rem",
  },
  primaryButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  secondaryButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  submitButton: {
    padding: "0.7rem 1.5rem",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "1rem",
    alignSelf: "flex-start",
  },
  errorMessage: {
    color: "#d32f2f",
    marginTop: "1rem",
    fontSize: "0.9rem",
  },
  successMessage: {
    color: "#2e7d32",
    marginTop: "1rem",
    fontSize: "0.9rem",
  },
  questionsList: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  listTitle: {
    marginBottom: "1.5rem",
    color: "#333",
  },
  noQuestions: {
    textAlign: "center" as const,
    padding: "2rem",
    color: "#666",
  },
  questionCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "1.5rem",
    border: "1px solid #eee",
  },
  actionButtons: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
    justifyContent: "flex-end",
  },
  editButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
  },
  deleteButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f8f9fa",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    color: "#dc3545",
  },
  editForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  editInput: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1.2rem",
  },
  editTextarea: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "1rem",
    minHeight: "200px",
    resize: "vertical" as const,
  },
  editTagSection: {
    marginBottom: "1rem",
  },
  questionTitle: {
    marginBottom: "0.5rem",
    color: "#333",
    fontSize: "1.3rem",
  },
  questionContent: {
    marginBottom: "1rem",
    color: "#444",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap" as const,
  },
  questionTags: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  tagBadge: {
    padding: "0.3rem 0.8rem",
    borderRadius: "20px",
    backgroundColor: "#e1f5fe",
    color: "#01579b",
    fontSize: "0.8rem",
  },
  questionMeta: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
    fontSize: "0.9rem",
    color: "#666",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
  },
};

export default QuestionPage;
