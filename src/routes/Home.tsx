// Arquivo: owlbear-rodeo-legacy/src/routes/Home.tsx

import { useState, useEffect } from "react";
import { Flex, Button, Image, Text, IconButton, Link } from "theme-ui";
import { useHistory, useLocation } from "react-router-dom";

import Footer from "../components/Footer";

import StartModal from "../modals/StartModal";
import JoinModal from "../modals/JoinModal";
import GettingStartedModal from "../modals/GettingStartedModal";

import HelpIcon from "../icons/HelpIcon";

import { useAuth } from "../contexts/AuthContext";

import RedditIcon from "../icons/SocialRedditIcon";
import TwitterIcon from "../icons/SocialTwitterIcon";
import YouTubeIcon from "../icons/SocialYouTubeIcon";
import SocialPatreonIcon from "../icons/SocialPatreonIcon";

import owlington from "../images/Owlington.png";
import { api } from "../api/client";



function Home() {
  console.log("🟢 Home.tsx carregado!");
  
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isGettingStartedModalOpen, setIsGettingStartedModalOpen] =
    useState(false);
  const [isAutoStarting, setIsAutoStarting] = useState(false);
  
  const history = useHistory();
  const location = useLocation();

  // Reset password on visiting home
  const { setPassword } = useAuth();
  useEffect(() => {
    setPassword("");
  }, [setPassword]);

  // AUTO-START: Detecta se foi carregado via Laravel
  useEffect(() => {
    console.log("🔵 useEffect executado!");
    
    async function checkLaravelSession() {
      try {
        // PRIORIDADE 1: Ler da query string (mais confiável)
        const params = new URLSearchParams(location.search);
        let sessionId = params.get('laravelSession');
        let userId = params.get('laravelUser');
        let role = params.get('laravelRole');
        let userName = params.get('laravelName');
        
        console.log("🟡 Query params:", { sessionId, userId, role, userName });
        
        // PRIORIDADE 2: Fallback para window.OWLBEAR_CONFIG
        if (!sessionId) {
          const config = (window as any).OWLBEAR_CONFIG;
          console.log("🟣 Tentando OWLBEAR_CONFIG:", config);
          
          if (config) {
            sessionId = config.sessionId;
            userId = config.userId;
            role = config.role;
            userName = config.userName;
          }
        }
        
        if (sessionId) {
          console.log("🎯 Sessão detectada! Iniciando auto-start...", { sessionId, userId, role, userName });
          setIsAutoStarting(true);
          
          // Busca ou cria o game no Laravel
          console.log("⚡ Chamando API:", `http://127.0.0.1:8000/api/owlbear/session?sessionId=${sessionId}`);
          
          const session = await api.getSession(sessionId);
          
          console.log("✅ Sessão criada/encontrada:", session);

          // Salva dados no localStorage (será usado para identificação no MySQL)
          if (sessionId) {
            localStorage.setItem('owlbear_session_id', sessionId);
          }
          if (userId) {
            localStorage.setItem('owlbear_user_id', userId);
          }
          if (role) {
            localStorage.setItem('owlbear_role', role);
          }
          if (userName) {
            const decodedName = decodeURIComponent(userName);
            localStorage.setItem('owlbear_user_name', decodedName);
            console.log("💾 Nome salvo no localStorage:", decodedName);
          }

          console.log("🚀 Redirecionando para:", `/game/${session.id}`);
          
          // Redireciona imediatamente
          history.push(`/game/${session.id}`);
        } else {
          console.log("⚠️ Nenhuma sessão Laravel detectada - exibindo tela normal");
        }
      } catch (error) {
        console.error("❌ Erro no auto-start:", error);
        alert(`Erro ao conectar: ${error}`);
        setIsAutoStarting(false);
      }
    }

    checkLaravelSession();
  }, [history, location]);

  // Se está fazendo auto-start, mostra loading
  if (isAutoStarting) {
    console.log("⏳ Mostrando tela de loading...");
    return (
      <Flex
        sx={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100%",
          backgroundColor: "#222639",
        }}
      >
        <Text variant="heading" mb={3} sx={{ color: "white" }}>
          Iniciando sessão...
        </Text>
        <Image src={owlington} sx={{ width: "150px" }} />
        <Text variant="body" mt={3} sx={{ color: "white", opacity: 0.7 }}>
          Conectando ao servidor...
        </Text>
      </Flex>
    );
  }

  console.log("🏠 Renderizando Home normal");

  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100%",
        alignItems: "center",
      }}
    >
      <Flex
        sx={{
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "300px",
          flexGrow: 1,
        }}
        mb={2}
      >
        <Text variant="display" as="h1" sx={{ textAlign: "center" }}>
          Owlbear Rodeo
        </Text>
        <Image src={owlington} m={2} />
        <Button
          variant="secondary"
          m={2}
          onClick={() => setIsGettingStartedModalOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Getting Started <HelpIcon />
        </Button>
        <Button m={2} onClick={() => setIsStartModalOpen(true)}>
          Start Game
        </Button>
        <Button m={2} onClick={() => setIsJoinModalOpen(true)}>
          Join Game
        </Button>
        <Text variant="caption" as="p" sx={{ textAlign: "center" }}>
          Legacy v{process.env.REACT_APP_VERSION}
        </Text>
        <Button
          as="a"
          // @ts-ignore
          href="https://owlbear.rodeo/"
          mt={4}
          mx={2}
          mb={2}
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          Owlbear Rodeo 2.0
        </Button>
        <Flex mb={4} mt={0} sx={{ justifyContent: "center" }}>
          <Link href="https://www.reddit.com/r/OwlbearRodeo/">
            <IconButton title="Reddit" aria-label="Reddit">
              <RedditIcon />
            </IconButton>
          </Link>
          <Link href="https://twitter.com/OwlbearRodeo">
            <IconButton title="Twitter" aria-label="Twitter">
              <TwitterIcon />
            </IconButton>
          </Link>
          <Link href="https://www.youtube.com/channel/UCePe1wJC53_7fbBbSECG7YQ">
            <IconButton title="YouTube" aria-label="YouTube">
              <YouTubeIcon />
            </IconButton>
          </Link>
          <Link href="https://patreon.com/owlbearrodeo">
            <IconButton title="Patreon" aria-label="Patreon">
              <SocialPatreonIcon />
            </IconButton>
          </Link>
        </Flex>
        <JoinModal
          isOpen={isJoinModalOpen}
          onRequestClose={() => setIsJoinModalOpen(false)}
        />
        <StartModal
          isOpen={isStartModalOpen}
          onRequestClose={() => setIsStartModalOpen(false)}
        />
        <GettingStartedModal
          isOpen={isGettingStartedModalOpen}
          onRequestClose={() => setIsGettingStartedModalOpen(false)}
        />
      </Flex>
      <Footer />
    </Flex>
  );
}

export default Home;