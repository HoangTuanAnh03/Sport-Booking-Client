export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  realmRole: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  phoneNumber: string;
  noPassword?: boolean;
}
