import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

export const useLogin = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name as keyof LoginErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setIsError(false);
    setMessage('');

    try {
      // Axios implementation
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setMessage('Login successful! Redirecting...');
      setIsError(false);

      setTimeout(() => {
        navigate('/mainPage');
      }, 1500);

    } catch (err: any) {
      // Axios error handling
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Login failed';
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    errors,
    showPassword,
    isLoading,
    message,
    isError,
    handleChange,
    handleSubmit,
    setShowPassword,
  };
};