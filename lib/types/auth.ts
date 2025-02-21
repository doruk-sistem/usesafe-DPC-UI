export interface User {
  id: string;
  name: string;
  email: string;
  role: any;
  user_metadata?: {
    company_id?: string;
    full_name?: string;
    role?: "admin" | "manufacturer";
    email_verified: boolean;
    email?: string;
    phone_verified?: boolean;
    sub?: any;
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
