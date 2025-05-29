export const getCurrentUserId = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch (err) {
    return null;
  }
};

export const isAnswerOwner = (answerUserId?: string): boolean => {
  const currentUserId = getCurrentUserId();
  return currentUserId !== null && answerUserId === currentUserId;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};