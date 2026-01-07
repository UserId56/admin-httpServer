export interface Role {
  ID?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  deletedAt?: string | null;
  name: string;
  permission: string[];
}

export default Role;
