import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface Permissoes {
  pode_criar_conteudo: boolean;
  pode_editar_grid: boolean;
  pode_iniciar_sessao: boolean;
  pode_moderar_chat: boolean;
  pode_convidar_usuarios: boolean;
}

interface PermissoesContextType {
  permissoes: Permissoes | null;
  loading: boolean;
  canAddToken: () => boolean;
  canEditGrid: () => boolean;
}

const PermissoesContext = createContext<PermissoesContextType>({
  permissoes: null,
  loading: true,
  canAddToken: () => false,
  canEditGrid: () => false,
});

export function usePermissoes() {
  return useContext(PermissoesContext);
}

interface PermissoesProviderProps {
  sessionId: string;
  userId: string;
  children: React.ReactNode;
}

export function PermissoesProvider({ sessionId, userId, children }: PermissoesProviderProps) {
  const [permissoes, setPermissoes] = useState<Permissoes | null>(null);
  const [loading, setLoading] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout>();

  async function fetchPermissoes() {
    try {
      const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
      const response = await fetch(`${apiBase}/permissoes/${sessionId}/${userId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPermissoes(data);
        console.log('🔄 Permissões atualizadas:', data);
      } else {
        setPermissoes({
          pode_criar_conteudo: false,
          pode_editar_grid: false,
          pode_iniciar_sessao: false,
          pode_moderar_chat: false,
          pode_convidar_usuarios: false
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar permissões:', error);
      setPermissoes({
        pode_criar_conteudo: false,
        pode_editar_grid: false,
        pode_iniciar_sessao: false,
        pode_moderar_chat: false,
        pode_convidar_usuarios: false
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (sessionId && userId) {
      // Carrega permissões imediatamente
      fetchPermissoes();

      // POLLING: Atualiza a cada 3 segundos
      pollingIntervalRef.current = setInterval(() => {
        fetchPermissoes();
      }, 3000);

      // Cleanup ao desmontar
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [sessionId, userId]);

  const canAddToken = () => {
    return permissoes?.pode_criar_conteudo ?? false;
  };

  const canEditGrid = () => {
    return permissoes?.pode_editar_grid ?? false;
  };

  return (
    <PermissoesContext.Provider value={{ permissoes, loading, canAddToken, canEditGrid }}>
      {children}
    </PermissoesContext.Provider>
  );
}