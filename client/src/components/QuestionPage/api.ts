import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance for this module
const questionPageApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add response interceptor to handle 401 errors
questionPageApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchQuestions = async (token: string) => {
  const response = await questionPageApi.get('/questions', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchTags = async (token: string) => {
  const response = await questionPageApi.get('/tags', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createQuestion = async (questionData: { title: string; content: string; tags: string[] }, token: string) => {
  const response = await questionPageApi.post('/questions/new', questionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateQuestion = async (id: string, questionData: { title: string; content: string; tags: string[] }, token: string) => {
  const response = await questionPageApi.put(`/questions/${id}`, questionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteQuestion = async (id: string, token: string) => {
  await questionPageApi.delete(`/questions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createTag = async (tagName: string, token: string) => {
  const response = await questionPageApi.post('/tags/new', { name: [tagName.trim().toLowerCase()] }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};