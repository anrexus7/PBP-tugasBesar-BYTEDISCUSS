import React from 'react';
import { Link } from "react-router-dom";
import { FaEnvelope } from 'react-icons/fa';
import styles from './Login.module.css';
import PasswordInput from '../../common/PasswordInput/PasswordInput';
import { useLogin } from './useLogin';

const Login: React.FC = () => {
  const {
    formData,
    errors,
    isLoading,
    message,
    isError,
    handleChange,
    handleSubmit,
  } = useLogin();

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src="../../../assets/logo.jpeg" alt="Company Logo" />
          </div>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Please enter your credentials to login</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={`${styles.formGroup} ${errors.email ? styles.formGroupError : ''}`}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <div className={styles.inputContainer}>
              <FaEnvelope className={styles.inputIcon} />
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
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              showPasswordToggle
            />
          </div>

          <div className={styles.formOptions}>
            <div className={styles.rememberMe}>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.spinner}></span>
            ) : (
              'Login'
            )}
          </button>

          {message && (
            <div className={`${styles.message} ${isError ? styles.messageError : styles.messageSuccess}`}>
              {message}
            </div>
          )}

          <div className={styles.footer}>
            <p>Don't have an account? <Link to="/auth/register">Sign up</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;