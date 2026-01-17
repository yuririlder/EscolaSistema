import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'DIRETOR' | 'SECRETARIO' | 'COORDENADOR';
  ativo: boolean;
}

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, usuario: Usuario) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (token, usuario) => {
        set({
          token,
          usuario,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          token: null,
          usuario: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
