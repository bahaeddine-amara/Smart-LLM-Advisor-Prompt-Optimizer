import axiosInstance from '../lib/axiosInstance';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
}

export const authService = {
  register: (data: RegisterData) =>
    axiosInstance.post('/auth/register', data),

  login: (data: LoginData): Promise<{ data: AuthResponse }> =>
    axiosInstance.post('/auth/login', data),
};