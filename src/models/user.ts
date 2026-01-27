export interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  [key: string]: unknown;
}
