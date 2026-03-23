import { create } from "zustand";
import { User } from "@/models/auth.model";
import { AuthService } from "@/services/auth.service";
import { supabase } from "@/lib/supabase";

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isChecked: boolean; // true once initial session check is complete
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (redirectTo?: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string, redirectTo?: string) => Promise<void>;
  exchangeCodeForSession: (code: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  clearError: () => void;
}

let hasInitialized = false;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isChecked: false,
  isLoading: false,
  error: null,

  initialize: () => {
    if (hasInitialized) return;
    hasInitialized = true;

    // Get current session (fast — reads from storage cache)
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        user: session?.user ? { id: session.user.id, email: session.user.email! } : null,
        isAuthenticated: !!session?.user,
        isChecked: true,
      });
    });

    // Keep state in sync when user signs in/out in another tab
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user ? { id: session.user.id, email: session.user.email! } : null,
        isAuthenticated: !!session?.user,
        isChecked: true,
      });
    });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.login({ email, password });
      // onAuthStateChange will update user + isAuthenticated
      set({ isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Login failed", isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async (redirectTo) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.loginWithGoogle(redirectTo);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Google login failed", isLoading: false });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.register({ email, password });
      set({ isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Registration failed", isLoading: false });
      throw err;
    }
  },

  resetPassword: async (email, redirectTo) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.resetPassword(email, redirectTo);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Password reset failed", isLoading: false });
      throw err;
    }
  },

  exchangeCodeForSession: async (code) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.exchangeCodeForSession(code);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Session exchange failed", isLoading: false });
      throw err;
    }
  },

  updatePassword: async (password) => {
    set({ isLoading: true, error: null });
    try {
      await AuthService.updatePassword(password);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Update password failed", isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await AuthService.logout();
    set({ user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),
}));
