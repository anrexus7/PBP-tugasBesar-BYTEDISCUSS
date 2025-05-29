export interface Question {
  id: number;
  title: string;
  createdAt: string;
  content: string;
}

export interface Answer {
  id: number;
  content: string;
  createdAt: string;
  questionId: number;
  questionTitle: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  bio: string | null;
  reputation: number;
  questions: Question[];
  answers: Answer[];
}