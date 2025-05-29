export interface Question {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  answers: Answer[];
  tags: { id: string; name: string }[];
  user: { 
    id: string;
    username: string;
    profilePicture?: string;
  };
  userId: string;
  createdAt: string;
}

export interface Answer {
  id: string;
  content: string;
  isAccepted: boolean;
  User: {
    username: string;
  };
}

export interface Tag {
  id: string;
  name: string;
  description: string;
}

export type QuestionFormData = {
  title: string;
  content: string;
  tags: string[];
};