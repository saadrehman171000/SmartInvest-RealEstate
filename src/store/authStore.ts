import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = 'admin@investoriq.com';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  createUser: (email: string, password: string, name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    try {
      const { data: { user } } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!user) throw new Error('Invalid credentials');

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('User profile not found');

      const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const userData: User = {
        id: user.id,
        email: user.email!,
        name: profile.name || email.split('@')[0],
        role: isAdmin ? 'admin' : 'user',
        avatar: profile.avatar_url ?? undefined,
      };

      set({ user: userData });
      toast.success(`Welcome back, ${userData.name}!`);
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Invalid credentials');
      throw error;
    }
  },
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null });
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  },
  checkAuth: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const isAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const userData: User = {
          id: user.id,
          email: user.email!,
          name: profile?.name || user.email!.split('@')[0],
          role: isAdmin ? 'admin' : 'user',
          avatar: profile?.avatar_url ?? undefined,
        };

        set({ user: userData, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      set({ user: null, loading: false });
    }
  },
  createUser: async (email, password, name) => {
    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('Failed to create user');

      const { error: profileError } = await supabase.from('profiles').insert([{
        id: user.id,
        name,
        email: user.email,
        role: 'user'
      }]);

      if (profileError) throw profileError;

      toast.success('User created successfully!');
      
    } catch (error) {
      console.error('Create user error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(message);
      throw error;
    }
  },
}));