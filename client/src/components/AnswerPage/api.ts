import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchQuestionWithComments = async (id: string, token?: string) => {
  const response = await axios.get(`${API_BASE_URL}/questions/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchCommentsForAnswer = async (answerId: string, token?: string) => {
  const response = await axios.get(`${API_BASE_URL}`, {
    params: { answerId },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const fetchUserVotes = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/votes/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const postAnswer = async (questionId: string, content: string, token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/questions/${questionId}/answers`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updateAnswer = async (answerId: string, content: string, token: string) => {
  const response = await axios.put(
    `${API_BASE_URL}/answers/${answerId}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const deleteAnswer = async (answerId: string, token: string) => {
  await axios.delete(`${API_BASE_URL}/answers/${answerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const postComment = async (answerId: string, content: string, token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/answers/${answerId}/comments`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updateComment = async (commentId: string, content: string, token: string) => {
  const response = await axios.put(
    `${API_BASE_URL}/${commentId}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const deleteComment = async (commentId: string, token: string) => {
  await axios.delete(`${API_BASE_URL}/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const postVote = async (questionId: string, value: number, token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/questions/${questionId}/vote`,
    { value },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const acceptAnswer = async (answerId: string, token: string) => {
  const response = await fetch(`http://localhost:5000/api/answers/${answerId}/accept`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to accept answer');
  }
  return response.json();
};

export const unacceptAnswer = async (answerId: string, token: string) => {
  const response = await fetch(`http://localhost:5000/api/answers/${answerId}/unaccept`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to unaccept answer');
  }
  return response.json();
};