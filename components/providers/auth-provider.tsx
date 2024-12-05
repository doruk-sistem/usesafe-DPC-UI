"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { verifyToken } from '@/lib/auth';
import { AuthContext } from '@/lib/context/auth-context';
import type { AuthState, User } from '@/lib/types/auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true
  });
  
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = document.cookie.replace(
          /(?:(?:^|.*;\s*)auth_token\s*=\s*([^;]*).*$)|^.*$/,
          "$1"
        );
        
        if (token) {
          const payload = await verifyToken(token);
          if (payload) {
            setState({
              user: {
                id: payload.sub as string,
                name: payload.name as string,
                email: payload.email as string,
                role: payload.role as string,
              },
              isLoading: false
            });
            return;
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
    };

    checkAuth();
  }, []);

  const signIn = async (token: string) => {
    try {
      const payload = await verifyToken(token);
      if (payload && payload.sub && payload.name && payload.email && payload.role) {
        const user: User = {
          id: payload.sub as string,
          name: payload.name as string,
          email: payload.email as string,
          role: payload.role as string,
        };
        setState({ user, isLoading: false });
        return;
      }
      throw new Error('Invalid token payload');
    } catch (error) {
      console.error('Sign in failed:', error);
      setState({ user: null, isLoading: false });
    }
  };

  const signOut = () => {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setState({ user: null, isLoading: false });
    router.push('/');
  };

  return (
    <AuthContext.Provider 
      value={{
        ...state,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}