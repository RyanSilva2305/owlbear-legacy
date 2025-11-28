import { useState, useEffect } from "react";
import { IconButton } from "theme-ui";
import ExitIcon from "../icons/ExitIcon";
import ExitSessionModal from "../modals/ExitSessionModal";

function SettingsButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMestre, setIsMestre] = useState(false);
  const [salaId, setSalaId] = useState<string>("");
  
  const userId = localStorage.getItem('owlbear_user_id') || '';
  const sessionId = localStorage.getItem('owlbear_session_id') || '';

  useEffect(() => {
    async function checkMestre() {
      try {
        const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
        const response = await fetch(`${apiBase}/sessoes/${sessionId}/mestre`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const criadorId = String(data.criador_id);
          const currentUserId = String(userId);
          
          setSalaId(data.sala_id);
          setIsMestre(criadorId === currentUserId);
          
          console.log('🔍 Check mestre:', { criadorId, currentUserId, isMestre: criadorId === currentUserId });
        }
      } catch (error) {
        console.error('Erro ao verificar mestre:', error);
        setIsMestre(false);
      }
    }

    if (sessionId && userId) {
      checkMestre();
    }
  }, [sessionId, userId]);

  async function handleExit() {
    if (isMestre) {
      setIsModalOpen(true);
    } else {
      voltarParaSala();
    }
  }

  function voltarParaSala() {
    if (salaId) {
      console.log('🚪 Redirecionando para /salas/' + salaId);
      window.location.href = `/salas/${salaId}`;
    } else {
      console.log('🚪 Redirecionando para /salas');
      window.location.href = '/salas';
    }
  }

  async function handleSair() {
    setIsModalOpen(false);
    voltarParaSala();
  }

  async function handlePausar() {
    setIsModalOpen(false);
    try {
      const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
      console.log('⏸️ Pausando sessão:', sessionId);
      const response = await fetch(`${apiBase}/sessoes/${sessionId}/pausar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('⏸️ Resposta pausar:', response.ok);
    } catch (error) {
      console.error('Erro ao pausar:', error);
    }
    // Mestre NÃO sai ao pausar
  }

  async function handleFinalizar() {
    setIsModalOpen(false);
    try {
      const apiBase = (window as any).OWLBEAR_CONFIG?.apiBase || '/api';
      console.log('🔴 Finalizando sessão:', sessionId);
      const response = await fetch(`${apiBase}/sessoes/${sessionId}/finalizar`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('🔴 Resposta finalizar:', response.ok);
    } catch (error) {
      console.error('Erro ao finalizar:', error);
    }
    // Aguarda o hook detectar e redirecionar
    setTimeout(() => voltarParaSala(), 1000);
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
          onPausar={handlePausar}
          onFinalizar={handleFinalizar}
        />
      )}
    </>
  );
}

export default SettingsButton;