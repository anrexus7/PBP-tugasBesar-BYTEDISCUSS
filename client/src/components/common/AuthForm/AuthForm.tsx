import React from 'react';
import styles from './AuthForm.module.css';

interface AuthFormProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({ title, subtitle, children }) => {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBackground}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
            <div className={styles.logo}>
            <img src="/src/assetslogo.jpeg" alt="Company Logo" />
            </div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthForm;