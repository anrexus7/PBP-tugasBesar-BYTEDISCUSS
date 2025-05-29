import React from "react";
import { Link } from "react-router-dom";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import styles from "./styles.module.css";

interface QuestionCardProps {
  question: any;
  userVotes: Record<string, number>;
  handleVote: (questionId: string, value: number) => void;
  isLoggedIn: boolean;
  toggleTag: (tagId: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  userVotes,
  handleVote,
  isLoggedIn,
  toggleTag,
}) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Invalid date:", dateString);
      return "Unknown date";
    }
  };

  return (
    <div className={styles.questionCard}>
      <h2 className={styles.questionTitle}>
        <Link to={`/questions/${question.id}`}>
          {question.title || "Untitled Question"}
        </Link>
      </h2>

      <div className={styles.questionMeta}>
        <img
          src={
            question.user?.profilePicture
              ? `http://localhost:5000/uploads/${question.user.profilePicture}`
              : "http://localhost:5000/uploads/defaultPic.png"
          }
          alt={question.user?.username || "Anonymous"}
          className={styles.userAvatar}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "http://localhost:5000/uploads/defaultPic.png";
          }}
        />
        <span className={styles.username}>
          {question.user?.username || "Anonymous"}
        </span>
        <span className={styles.timestamp}>
          asked {formatDate(question.createdAt)}
        </span>
      </div>

      <p className={styles.questionContent}>
        {question.content && question.content.length > 300
          ? `${question.content.substring(0, 300)}...`
          : question.content || "No content provided"}
      </p>

      {question.tags && question.tags.length > 0 && (
        <div className={styles.questionTags}>
          {question.tags.map((tag: string) => (
            <span
              key={tag}
              className={styles.tag}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className={styles.questionStats}>
        <div className={styles.stat}>
          <strong>{question.voteCount || 0}</strong> votes
        </div>
        <div
          className={`${styles.stat} ${
            question.answerCount
              ? question.hasAcceptedAnswer
                ? styles.accepted
                : styles.answered
              : ""
          }`}
        >
          <strong>{question.answerCount || 0}</strong> answers
        </div>
        <div className={styles.stat}>
          <strong>{question.viewCount || 0}</strong> views
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;