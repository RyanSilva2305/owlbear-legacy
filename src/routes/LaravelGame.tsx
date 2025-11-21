// Arquivo: owlbear-rodeo-legacy/src/routes/LaravelGame.tsx

import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import { api } from "../api/client";

/**
 * Componente que automaticamente inicializa o jogo
 * quando carregado via Laravel
 */
function LaravelGame() {
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    async function autoStart() {
      try {
        // Tenta ler da query string primeiro
        const params = new URLSearchParams(location.search);
        let sessionId = params.get('sessionId');
        let userId = params.get('userId');
        let role = params.get('role');

        // Fallback para window.OWLBEAR_CONFIG
        if (!sessionId) {
          const config = (window as any).OWLBEAR_CONFIG;
          if (config) {
            sessionId = config.sessionId;
            userId = config.userId;
            role = config.role;
          }
        }
        
        if (!sessionId) {
          console.error("sessionId não encontrado, redirecionando para home");
          history.push("/");
          return;
        }

        console.log("Iniciando sessão automática:", { sessionId, userId, role });

        // Busca ou cria o game no Laravel
        const session = await api.getSession(sessionId);
        
        console.log("Sessão criada/encontrada:", session);

        // Salva os dados no localStorage para uso posterior
        if (userId) {
          localStorage.setItem('owlbear_user_id', userId);
        }
        if (role) {
          localStorage.setItem('owlbear_role', role);
        }

        // Redireciona para a rota do jogo com o UUID real
        history.push(`/game/${session.id}`);
        
      } catch (error) {
        console.error("Erro ao iniciar sessão:", error);
        // Em caso de erro, mostra na tela por 3 segundos antes de voltar
        alert(`Erro ao conectar: ${error}`);
        setTimeout(() => {
          history.push("/");
        }, 3000);
      }
    }

    autoStart();
  }, [history, location]);

  return <LoadingOverlay />;
}

export default LaravelGame;