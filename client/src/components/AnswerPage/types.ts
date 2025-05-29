export type User = {
  id: string;
  username: string;
  profilePicture?: string;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: User;
};

export type Answer = {
  id: string;
  content: string;
  user?: User;
  isAccepted: boolean;
  voteCount?: number;
  createdAt: string;
  comments?: Comment[];
  votes?: { value: number; user: User }[];
};

export type Question = {
  id: string;
  title: string;
  content: string;
  viewCount: number;
  voteCount?: number;
  answers: Answer[];
  user?: User;
  createdAt: string;
  votes?: { value: number; user: User }[];
};