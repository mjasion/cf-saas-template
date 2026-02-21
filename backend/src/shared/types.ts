export interface Session {
  userId: number;
  email: string;
  role: 'user' | 'admin';
}
