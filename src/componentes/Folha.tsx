import { AnimatePresence, motion, PanInfo, useDragControls } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { Portal } from './Portal';

/** Folha que sobe de baixo. Arrasta a pega para baixo para fechar. */
export function Folha({
  aberta,
  onFechar,
  children,
}: {
  aberta: boolean;
  onFechar: () => void;
  children: ReactNode;
}) {
  const controlos = useDragControls();

  useEffect(() => {
    if (!aberta) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberta]);

  const aoLargar = (_: any, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onFechar();
  };

  return (
    <Portal>
    <AnimatePresence>
      {aberta && (
        <>
          <motion.div
            className="veu"
            onClick={onFechar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="folha"
            role="dialog"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragListener={false}
            dragControls={controlos}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={aoLargar}
          >
            <div
              style={{ padding: '6px 0 4px', touchAction: 'none' }}
              onPointerDown={(e) => controlos.start(e)}
            >
              <div className="folha-pega" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </Portal>
  );
}
