import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import styles from '../../auth/Login/Login.module.css';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  error?: string;
  showPasswordToggle?: boolean;
  className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  showPasswordToggle = true,
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`${styles.inputContainer} ${className} ${error ? styles.error : ''}`}>
      <FaLock className={styles.inputIcon} />
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={styles.input}
      />
      {showPasswordToggle && (
        <button 
          type="button" 
          className={styles.passwordToggle}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default PasswordInput;