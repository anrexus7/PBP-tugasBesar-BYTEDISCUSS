import React, { useState } from 'react';
import '../css/app.css';
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false); 

  const navigate = useNavigate();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setIsError(true); 
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      setMessage(data.message || 'Registration successful!');
      setIsError(false);

      setFormData({
        username: '',
        email: '',
        password: '',
      });

      navigate('/auth/login'); // Redirect to login page after successful registration

    } catch (err: any) {
      setMessage(err.message);
      setIsError(true); // Set error state to true if there's an error
    }
  };

  return (
    <div className="center-container">
      <h2>Register</h2>
      <div className="form-box">
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            type="text"
            placeholder="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
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
          <button type="submit">Register</button>
          <p onClick={() => navigate(`/auth/login`)}>Already have an account? Login </p>
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

export default Register;