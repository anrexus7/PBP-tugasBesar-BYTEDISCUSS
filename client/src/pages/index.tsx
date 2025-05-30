import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/MainPage/Header";
import Sidebar from "../components/MainPage/Sidebar";
import QuestionCard from "../components/MainPage/QuestionCard";
import styles from "../components/MainPage/styles.module.css";
import useQuestions from "../hooks/useQuestions";
import useUser from "../hooks/useUser";

const MainPage: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    showProfileDropdown,
    setShowProfileDropdown,
    handleLogout,
    userVotes,
  } = useUser();

  const {
    filteredQuestions,
    searchTerm,
    setSearchTerm,
    tags,
    selectedTags,
    toggleTag,
    clearTags,
    isLoading,
    error,
    handleVote,
  } = useQuestions(userVotes);

  if (isLoading) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.loading}>Loading questions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        handleLogout={handleLogout}
      />

      <div className={styles.mainContent}>
        <Sidebar
          tags={tags}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          clearTags={clearTags}
          isLoggedIn={isLoggedIn}
        />

        <div className={styles.questionsList}>
          <div className={styles.questionsHeader}>
            <h1>
              {selectedTags.length > 0
                ? `Questions tagged with: ${selectedTags
                    .map((tagId:any) => tags.find((t:any) => t.id === tagId)?.name || tagId)
                    .join(", ")}`
                : "All Questions"}
            </h1>
            <p>
              {filteredQuestions.length}{" "}
              {filteredQuestions.length === 1 ? "question" : "questions"}
            </p>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className={styles.noQuestions}>
              <p>No questions found matching your criteria.</p>
              {isLoggedIn && (
                <Link to="/questions/new" className={styles.askButton}>
                  Ask the first question
                </Link>
              )}
            </div>
          ) : (
            filteredQuestions.map((question) => {
              const hasAccepted = Array.isArray(question.answers)
                ? question.answers.some((a:any) => a.isAccepted)
                : !!question.hasAcceptedAnswer;
              return (
                <div key={question.id}>
                  {hasAccepted && (
                    <div className={styles.resolvedText}>Resolved</div>
                  )}
                  <QuestionCard
                    question={question}
                    userVotes={userVotes}
                    handleVote={handleVote}
                    isLoggedIn={isLoggedIn}
                    toggleTag={toggleTag}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;