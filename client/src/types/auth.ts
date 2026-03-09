export interface User {
  name?: string;
  email: string;
  password?: string;
  role?: string;
  currency?: string;
  budgetLimit?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
