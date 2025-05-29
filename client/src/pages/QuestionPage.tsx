import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FaEdit, FaTrash, FaTag 
} from 'react-icons/fa';
import styles from '../components/QuestionPage/QuestionPage.module.css';
import { 
  Question, Tag, QuestionFormData 
} from '../components/QuestionPage/types';
import { 
  fetchQuestions, fetchTags, createQuestion, 
  updateQuestion, deleteQuestion, createTag 
} from '../components/QuestionPage/api';

const QuestionPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newQuestion, setNewQuestion] = useState<QuestionFormData>({ 
    title: '', content: '', tags: [] 
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState<QuestionFormData>({ 
    title: '', content: '', tags: [] 
  });
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showTagForm, setShowTagForm] = useState(false);
  const [tagError, setTagError] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1]))?.id : null;

  const loadData = async () => {
    try {
      const [questionsData, tagsData] = await Promise.all([
        fetchQuestions(token!),
        fetchTags(token!)
      ]);
      setQuestions(questionsData);
      setAvailableTags(tagsData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createQuestion(newQuestion, token!);
      setSuccess('Question added successfully');
      setNewQuestion({ title: '', content: '', tags: [] });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditedQuestion({
      title: question.title,
      content: question.content,
      tags: question.tags?.map(tag => tag.id) || [],
    });
  };

  const handleUpdate = async () => {
    if (!editingQuestionId) return;

    try {
      await updateQuestion(editingQuestionId, editedQuestion, token!);
      setEditingQuestionId(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update question');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id, token!);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleTagToggle = (tagName: string, isEditing: boolean) => {
    const setter = isEditing ? setEditedQuestion : setNewQuestion;
    setter(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(name => name !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const handleCreateTag = async () => {
    try {
      if (!newTagName.trim()) {
        setTagError('Tag name cannot be empty');
        return;
      }

      await createTag(newTagName, token!);
      setNewTagName('');
      setShowTagForm(false);
      loadData();
    } catch (err: any) {
      setTagError(err.response?.data?.message || 'Failed to create tag');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderTagButtons = (tags: string[], isEditing: boolean) => (
    <div className={styles.tagContainer}>
      {availableTags.map(tag => (
        <button
          key={`${isEditing ? 'edit' : 'new'}-tag-${tag.id}`}
          type="button"
          onClick={() => handleTagToggle(tag.name, isEditing)}
          className={`${styles.tagButton} ${
            tags.includes(tag.name) ? styles.tagButtonActive : ''
          }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );

  const renderQuestionForm = (isEditing: boolean) => {
    const formData = isEditing ? editedQuestion : newQuestion;
    const setter = isEditing ? setEditedQuestion : setNewQuestion;
    const handleSubmitForm = isEditing ? handleUpdate : handleSubmit;

    return (
      <form onSubmit={handleSubmitForm} className={styles.form}>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setter({ ...formData, title: e.target.value })}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <textarea
            placeholder="Your question..."
            value={formData.content}
            onChange={(e) => setter({ ...formData, content: e.target.value })}
            rows={6}
            className={styles.textarea}
            required
          />
        </div>

        <div className={styles.tagSection}>
          <h4 className={styles.sectionTitle}>Tags</h4>
          {renderTagButtons(formData.tags, isEditing)}
          
          <button
            type="button"
            onClick={() => setShowTagForm(!showTagForm)}
            className={styles.createTagButton}
          >
            <FaTag /> Create New Tag
          </button>

          {showTagForm && (
            <div className={styles.tagFormContainer}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    setTagError('');
                  }}
                  className={styles.input}
                  required
                />
              </div>
              {tagError && <p className={styles.errorMessage}>{tagError}</p>}
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className={styles.primaryButton}
                >
                  Create Tag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTagForm(false);
                    setTagError('');
                  }}
                  className={styles.secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            {isEditing ? 'Update Question' : 'Post Question'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => setEditingQuestionId(null)}
              className={styles.secondaryButton}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    );
  };

  const renderQuestionCard = (question: Question) => (
    <div key={`question-${question.id}`} className={styles.questionCard}>
      {currentUserId === question.userId && (
        <div className={styles.actionButtons}>
          <button onClick={() => handleEdit(question)} className={styles.editButton}>
            <FaEdit /> Edit
          </button>
          <button 
            onClick={() => handleDelete(question.id)} 
            className={styles.deleteButton}
          >
            <FaTrash /> Delete
          </button>
        </div>
      )}

      {editingQuestionId === question.id ? (
        <div className={styles.editForm}>
          {renderQuestionForm(true)}
        </div>
      ) : (
        <>
          <h3 className={styles.questionTitle}>{question.title}</h3>
          <p className={styles.questionContent}>{question.content}</p>

          {question.tags?.length > 0 && (
            <div className={styles.questionTags}>
              {question.tags.map(tag => {
                const tagData = availableTags.find(t => t.id === tag.id) || tag;
                return (
                  <span key={`question-tag-${tag.id}`} className={styles.tagBadge}>
                    {typeof tagData === "object" ? tagData.name : tagData}
                  </span>
                );
              })}
            </div>
          )}

          <div className={styles.questionMeta}>
            <span className={styles.metaItem}>
              Asked by {question.user?.username || "Anonymous"}
            </span>
            <span className={styles.metaItem}>
              • {new Date(question.createdAt).toLocaleDateString()}
            </span>
            <span className={styles.metaItem}>
              • {question.viewCount} views
            </span>
            <span className={styles.metaItem}>
              • {question.answers?.length || 0} answers
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className={styles.homeContainer}>
      <div className={styles.mainContent}>
        <div className={styles.formBox}>
          <h2 className={styles.formTitle}>Ask a Question</h2>
          {renderQuestionForm(false)}
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
        </div>

        <div className={styles.questionsList}>
          <h2 className={styles.listTitle}>Questions</h2>

          {questions.length === 0 ? (
            <div className={styles.noQuestions}>
              <p>No questions yet.</p>
            </div>
          ) : (
            questions.map(renderQuestionCard)
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;