import { Box, Flex, Text, Button } from "theme-ui";
import Modal from "../components/Modal";

type ExitSessionModalProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  onSair: () => void;
  onPausarOuIniciar: () => void;
  onFinalizar: () => void;
  isPausada: boolean;
};

function ExitSessionModal({
  isOpen,
  onRequestClose,
  onSair,
  onPausarOuIniciar,
  onFinalizar,
  isPausada,
}: ExitSessionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
    >
      <Box sx={{ 
        maxWidth: "320px",
        bg: "background",
        border: "2px solid",
        borderColor: "text",
        p: 3
      }}>
        <Text 
          as="h1" 
          variant="heading"
          sx={{ 
            fontSize: 3,
            mb: 3,
            textAlign: "center"
          }}
        >
          Sessao
        </Text>
        
        <Flex sx={{ flexDirection: "column", gap: 2 }}>
          <Button
            onClick={onSair}
            sx={{
              width: "100%",
              py: 2,
              cursor: "pointer",
              bg: "transparent",
              color: "text",
              border: "1px solid",
              borderColor: "text",
              "&:hover": { bg: "highlight" }
            }}
          >
            Sair
          </Button>
          
          <Button
            onClick={onPausarOuIniciar}
            sx={{
              width: "100%",
              py: 2,
              cursor: "pointer",
              bg: "transparent",
              color: "text",
              border: "1px solid",
              borderColor: "text",
              "&:hover": { bg: "highlight" }
            }}
          >
            {isPausada ? 'Iniciar' : 'Pausar'}
          </Button>
          
          <Button
            onClick={onFinalizar}
            sx={{
              width: "100%",
              py: 2,
              cursor: "pointer",
              bg: "transparent",
              color: "text",
              border: "1px solid",
              borderColor: "text",
              "&:hover": { bg: "highlight" }
            }}
          >
            Finalizar
          </Button>
        </Flex>
      </Box>
    </Modal>
  );
}

export default ExitSessionModal;