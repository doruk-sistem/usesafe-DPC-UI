export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (token: string) => void;
  signOut: () => void;
}