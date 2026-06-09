import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (value: boolean) => void;
  syncSession: () => Promise<boolean>;
}

function toAuthUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string };
}): AuthUser {
  const email = user.email ?? "";
  return {
    id: user.id,
    email,
    name: user.user_metadata?.full_name || email.split("@")[0] || "Usuario",
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoading: false,
      isAuthenticated: false,
      hasHydrated: false,
      user: null,
        login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            set({ isLoading: false });
            throw error;
          }
          
          // Obtener datos del usuario
          // Si tienes una tabla profile, podrías hacer una consulta adicional aquí
          // Por ahora usamos los datos de la sesión de Supabase
          set({
            isLoading: false,
            isAuthenticated: true,
            user: toAuthUser(data.user),
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => {
        // Cerrar sesión en Supabase también
        supabase.auth.signOut();
        set({ isLoading: false, isAuthenticated: false, user: null });
      },
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      setHasHydrated: (value: boolean) => {
        set({ hasHydrated: value });
      },
      // Source of truth = Supabase cookie session (same as middleware).
      syncSession: async () => {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          set({ isAuthenticated: false, user: null });
          return false;
        }
        set({ isAuthenticated: true, user: toAuthUser(data.user) });
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);