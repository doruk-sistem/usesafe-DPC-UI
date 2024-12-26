export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manufacturer';
  user_metadata?: {
    company_id?: string;
    full_name?: string;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (token: string) => void;
  signOut: () => void;
  isAdmin: () => boolean;
}