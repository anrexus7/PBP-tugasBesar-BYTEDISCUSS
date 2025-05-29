import React from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import styles from "./styles.module.css";

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentUser: any;
  isLoggedIn: boolean;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (show: boolean) => void;
  handleLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({
  searchTerm,
  setSearchTerm,
  currentUser,
  isLoggedIn,
  showProfileDropdown,
  setShowProfileDropdown,
  handleLogout,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">DevForum</Link>
      </div>

      <div className={styles.searchBar}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.authButtons}>
        {isLoggedIn ? (
          <div
            className={styles.profileDropdownContainer}
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            <div className={styles.profileButton}>
              <img
                src={
                  currentUser?.profilePicture
                    ? `http://localhost:5000/uploads/${currentUser.profilePicture}`
                    : "http://localhost:5000/uploads/defaultPic.png"
                }
                alt="Profile"
                className={styles.profilePicture}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "http://localhost:5000/uploads/defaultPic.png";
                }}
              />
            </div>
            {showProfileDropdown && (
              <div className={styles.profileDropdown}>
                <Link to="/me" className={styles.dropdownItem}>
                  <span>My Profile</span>
                </Link>
                <Link to="/editProfile" className={styles.dropdownItem}>
                  <span>Edit Profile</span>
                </Link>
                <button onClick={handleLogout} className={styles.dropdownItem}>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/auth/login" className={styles.loginButton}>
              <span>Log In</span>
            </Link>
            <Link to="/auth/register" className={styles.registerButton}>
              <span>Register</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;