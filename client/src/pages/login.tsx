import React, { useState, useEffect } from 'react';
import '../app.css'
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/me');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setIsError(true);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);

      setIsError(false);
      setMessage(data.message || 'Login successful!');

      setFormData({
        username: '',
        email: '',
        password: '',
      });

      navigate('/me'); // Redirect to profile page after successful login

    } catch (err: any) {
      setMessage(err.message);
      setIsError(true); // Set error state to true if there's an error
    }
  };

  return (
    <div className="center-container">
      <h2>Login</h2>
      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
          <p>Don't have an account? <Link to='/auth/register'> Register </Link></p>
        </form>
        {message && (
        <p className={isError ? "error-message" : "success-message"}>
          {message}
        </p>
      )}
      </div>
    </div>
  );
};

export default Login;