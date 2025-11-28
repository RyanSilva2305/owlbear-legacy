import { useEffect } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";

function LaravelGame() {
  const history = useHistory();
  const location = useLocation();
  const { sessaoId } = useParams<{ sessaoId: string }>();

  useEffect(() => {
    async function autoStart() {
      try {
        const params = new URLSearchParams(location.search);
        const userId = params.get('userId') || localStorage.getItem('owlbear_user_id');
        const userName = params.get('userName') || localStorage.getItem('owlbear_user_name');
        
        if (!sessaoId) {
          console.error("❌ sessaoId não encontrado");
          history.push("/");
          return;
        }

        // BUSCAR mestre_id da sessão via API
        const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
        
        const mestreResponse = await fetch(`${apiBase}/sessoes/${sessaoId}/mestre`, {
          credentials: 'include'
        });
        
        let mestreId: string = userId || ''; // Fallback com tipo
        if (mestreResponse.ok) {
          const mestreData = await mestreResponse.json();
          mestreId = mestreData.mestre_id || userId || '';
          console.log("🎭 Mestre da sessão:", mestreId);
        }

        console.log("✅ Iniciando sessão:", { sessaoId, userId, mestreId });

        // Salvar no localStorage
        localStorage.setItem('owlbear_session_id', sessaoId);
        if (userId) localStorage.setItem('owlbear_user_id', userId);
        if (userName) localStorage.setItem('owlbear_user_name', userName);
        if (mestreId) localStorage.setItem('owlbear_mestre_id', mestreId); // Só salva se tiver valor

        // Buscar/criar o game
        const response = await fetch(`${apiBase}/owlbear/session?sessionId=${sessaoId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar sessão');
        }

        const session = await response.json();
        console.log("✅ Game ID:", session.id);

        // Redireciona para a rota do jogo
        history.push(`/game/${session.id}`);
        
      } catch (error) {
        console.error("❌ Erro ao iniciar sessão:", error);
        alert(`Erro ao conectar: ${error}`);
        setTimeout(() => history.push("/"), 3000);
      }
    }

    autoStart();
  }, [history, location, sessaoId]);

  return <LoadingOverlay />;
}

export default LaravelGame;