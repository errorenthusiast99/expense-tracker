import { supabase } from "@/lib/supabase";
import { LoginPayload, RegisterPayload } from "@/models/auth.model";

export const AuthService = {
  async login(payload: LoginPayload) {
    const { error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });
    if (error) throw new Error(error.message);
  },

  async register(payload: RegisterPayload) {
    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
    });
    if (error) throw new Error(error.message);
  },

  async loginWithGoogle(redirectTo?: string) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    if (error) throw new Error(error.message);
  },

  async resetPassword(email: string, redirectTo?: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new Error(error.message);
  },

  async exchangeCodeForSession(code: string) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  },

  async logout() {
    await supabase.auth.signOut();
  },
} as const;
