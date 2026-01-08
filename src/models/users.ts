export interface Users {
  id: number;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string | null;
  role_id: number;
  role: string;
  password?: string;
}

export default Users;
