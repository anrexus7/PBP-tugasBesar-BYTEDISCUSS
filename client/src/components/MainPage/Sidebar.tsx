import React from "react";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import styles from "./styles.module.css";

interface SidebarProps {
  tags: any[];
  selectedTags: string[];
  toggleTag: (tagId: string) => void;
  clearTags: () => void;
  isLoggedIn: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  tags,
  selectedTags,
  toggleTag,
  clearTags,
  isLoggedIn,
}) => {
  return (
    <div className={styles.sidebarFixed}>
      <div className={styles.sidebarSection}>
        <h3>Browse Tags</h3>
        <div className={styles.tagsList}>
          {tags.length > 0 ? (
            <div className={styles.tagsContainer}>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className={`${styles.tag} ${
                    selectedTags.includes(tag.id) ? styles.active : ""
                  }`}
                  onClick={() => toggleTag(tag.id)}
                  title={tag.name}
                >
                  {tag.name.length > 15
                    ? `${tag.name.substring(0, 15)}...`
                    : tag.name}
                </button>
              ))}
            </div>
          ) : (
            <p>No tags available</p>
          )}
        </div>
        {selectedTags.length > 0 && (
          <div className={styles.selectedTags}>
            <h4>Selected Tags:</h4>
            <div className={styles.selectedTagsList}>
              {selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return (
                  <span key={tagId} className={styles.selectedTag}>
                    {tag?.name || tagId}
                    <button
                      onClick={() => toggleTag(tagId)}
                      className={styles.removeTag}
                    >
                      <FaTimes />
                    </button>
                  </span>
                );
              })}
            </div>
            <button onClick={clearTags} className={styles.clearTags}>
              Clear All
            </button>
          </div>
        )}
      </div>

      {isLoggedIn && (
        <div className={styles.sidebarSection}>
          <Link to="/questions/new" className={styles.askButton}>
            Ask Question
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;