import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchQuestions = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/questions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchTags = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/tags`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createQuestion = async (questionData: { title: string; content: string; tags: string[] }, token: string) => {
  const response = await axios.post(`${API_BASE_URL}/questions/new`, questionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateQuestion = async (id: string, questionData: { title: string; content: string; tags: string[] }, token: string) => {
  const response = await axios.put(`${API_BASE_URL}/questions/${id}`, questionData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteQuestion = async (id: string, token: string) => {
  await axios.delete(`${API_BASE_URL}/questions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const createTag = async (tagName: string, token: string) => {
  const response = await axios.post(`${API_BASE_URL}/tags/new`, { name: [tagName.trim().toLowerCase()] }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};