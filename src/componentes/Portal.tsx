import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';

/**
 * Renderiza no <body>, fora do ecrã animado. Elementos `position: fixed` dentro de um
 * pai com transform ficariam presos a ele (e por baixo da barra de navegação).
 */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

export function BotaoMais({ onClick, rotulo }: { onClick: () => void; rotulo: string }) {
  return (
    <Portal>
      <motion.button
        className="fab"
        onClick={onClick}
        whileTap={{ scale: 0.9, rotate: 90 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.15 }}
        aria-label={rotulo}
      >
        <Plus size={28} />
      </motion.button>
    </Portal>
  );
}
