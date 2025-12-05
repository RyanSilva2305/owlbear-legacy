import { useState, useEffect } from "react";
import { IconButton } from "theme-ui";
import ExitIcon from "../icons/ExitIcon";
import ExitSessionModal from "../modals/ExitSessionModal";

function SettingsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMestre, setIsMestre] = useState(false);
  const [statusSessao, setStatusSessao] = useState<string>("ativa");
  
  const userId = localStorage.getItem('owlbear_user_id') || '';
  const sessionId = localStorage.getItem('owlbear_session_id') || '';

  useEffect(() => {
    async function checkMestre() {
      try {
        const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
        const response = await fetch(`${apiBase}/sessoes/${sessionId}/status`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const criadorId = String(data.criador_id);
          const currentUserId = String(userId);
          

          setStatusSessao(data.status);
          setIsMestre(criadorId === currentUserId);
          
          console.log('🔄 Status atual:', data.status);
        }
      } catch (error) {
        console.error('Erro ao verificar mestre:', error);
      }
    }

    if (sessionId && userId) {
      checkMestre();
      const interval = setInterval(checkMestre, 2000);
      return () => clearInterval(interval);
    }
  }, [sessionId, userId]);



async function voltarParaSala() {
  try {
    const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
    const response = await fetch(`${apiBase}/sessoes/${sessionId}/status`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Se estiver em iframe, manda mensagem para o pai
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'OWLBEAR_EXIT',
          salaId: data.sala_id
        }, '*');
        return;
      }
      
      // Caso não esteja em iframe (desenvolvimento)
      window.location.replace(`/salas/${data.sala_id || ''}`);
      return;
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  // Fallback
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'OWLBEAR_EXIT', salaId: null }, '*');
  } else {
    window.location.replace('/salas');
  }
}

async function handleExit() {
  if (isMestre) {
    setIsModalOpen(true);
  } else {
    voltarParaSala(); // Remove await
  }
}

async function handleSair() {
  setIsModalOpen(false);
  voltarParaSala(); // Remove await
}

async function handleFinalizar() {
  setIsModalOpen(false);
  try {
    const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
    await fetch(`${apiBase}/sessoes/${sessionId}/finalizar`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro:', error);
  }
  voltarParaSala(); // Remove await e setTimeout
}

  async function handlePausarOuIniciar() {
    try {
      const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
      
      if (statusSessao === 'pausada') {
        console.log('▶️ Iniciando sessão');
        const response = await fetch(`${apiBase}/sessoes/${sessionId}/iniciar`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          setStatusSessao('ativa');
          console.log('✅ Sessão iniciada');
        }
      } else {
        console.log('⏸️ Pausando sessão');
        const response = await fetch(`${apiBase}/sessoes/${sessionId}/pausar`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          setStatusSessao('pausada');
          console.log('✅ Sessão pausada');
        }
      }
    } catch (error) {
      console.error('Erro ao pausar/iniciar:', error);
    }
    setIsModalOpen(false);
  }

  

  return (
    <>
      <IconButton
        m={1}
        aria-label="Exit"
        title="Exit"
        onClick={handleExit}
      >
        <ExitIcon />
      </IconButton>
      {isMestre && (
        <ExitSessionModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onSair={handleSair}
          onPausarOuIniciar={handlePausarOuIniciar}
          onFinalizar={handleFinalizar}
          isPausada={statusSessao === 'pausada'}
        />
      )}
    </>
  );
}

export default SettingsButton;