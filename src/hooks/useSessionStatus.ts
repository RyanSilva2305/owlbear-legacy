import { useEffect, useRef } from "react";

export function useSessionStatus(sessionId: string, userId: string, salaId: string) {
  const pollingRef = useRef<NodeJS.Timeout>();
  const lastStatusRef = useRef<string>("");
  const isMestreRef = useRef<boolean>(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        if (!sessionId || !salaId) return;

        const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
        const response = await fetch(`${apiBase}/sessoes/${sessionId}/status`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const currentStatus = data.status;
          const criadorId = String(data.criador_id);
          const currentUserId = String(userId);
          const isMestre = criadorId === currentUserId;
          
          isMestreRef.current = isMestre;

          // Se mudou o status
          if (lastStatusRef.current && lastStatusRef.current !== currentStatus) {
            console.log('📊 Status mudou:', {
              anterior: lastStatusRef.current,
              novo: currentStatus,
              isMestre,
              userId: currentUserId,
              criadorId
            });
            
            // FINALIZADA → TODOS saem
            if (currentStatus === 'finalizada') {
              console.log('🔴 Sessão finalizada - redirecionando TODOS');
              window.location.href = `/salas/${salaId}`;
              return;
            }
            
            // PAUSADA → APENAS PLAYERS saem (mestre fica)
            if (currentStatus === 'pausada') {
              if (!isMestre) {
                console.log('⏸️ Sessão pausada - redirecionando PLAYER');
                window.location.href = `/salas/${salaId}`;
              } else {
                console.log('⏸️ Sessão pausada - MESTRE permanece');
              }
              return;
            }
          }

          lastStatusRef.current = currentStatus;
        }
      } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
      }
    }

    if (sessionId && userId && salaId) {
      console.log('🎮 Iniciando monitoramento:', { sessionId, userId, salaId });
      checkStatus();
      pollingRef.current = setInterval(checkStatus, 2000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [sessionId, userId, salaId]);
}