import React from 'react';
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope } from 'react-icons/fa';
import styles from '../components/auth/Login/Login.module.css';
import PasswordInput from '../components/common/PasswordInput/PasswordInput';
import { useRegister } from '../components/auth/Register/useRegister';

const Register: React.FC = () => {
  const {
    formData,
    errors,
    showPassword,
    isLoading,
    message,
    isError,
    handleChange,
    handleSubmit,
    setShowPassword,
  } = useRegister();

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src="logo.jpeg" alt="Forum Logo" />
          </div>
          <h1 className={styles.title}>Join Our Developer Community</h1>
          <p className={styles.subtitle}>Create an account to ask questions and contribute</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={`${styles.formGroup} ${errors.username ? styles.formGroupError : ''}`}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <div className={styles.inputContainer}>
              <div className={styles.inputIcon}>
                <FaUser />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            {errors.username && <span className={styles.errorMessage}>{errors.username}</span>}
          </div>

          <div className={`${styles.formGroup} ${errors.email ? styles.formGroupError : ''}`}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <div className={styles.inputContainer}>
              <div className={styles.inputIcon}>
                <FaEnvelope />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
          </div>

          <div className={`${styles.formGroup} ${errors.password ? styles.formGroupError : ''}`}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputContainer}>
              <div className={styles.inputIcon}>
                <FaEnvelope />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
              />
              <button 
                type="button" 
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              'Create Account'
            )}
          </button>

          {message && (
            <div className={`${styles.message} ${isError ? styles.messageError : styles.messageSuccess}`}>
              {message}
            </div>
          )}

          <div className={styles.footer}>
            <p>Already have an account? <Link to="/auth/login">Log in</Link></p>
            <p className={styles.termsNotice}>
              By registering, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;