import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useSessao } from '../sessao';

export function Coracao({ cor, tam = 24 }: { cor: string; tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" aria-hidden>
      <path
        fill={cor}
        d="M12 21.2c-.3 0-.6-.1-.8-.3l-7.3-7.1C1.6 11.5 1.6 7.8 3.9 5.6c2.1-2.1 5.5-2.2 7.7-.2l.4.4.4-.4c2.2-2 5.6-1.9 7.7.2 2.3 2.2 2.3 5.9 0 8.2l-7.3 7.1c-.2.2-.5.3-.8.3z"
      />
    </svg>
  );
}

const CORES = ['var(--azul)', 'var(--rosa)', 'var(--amarelo)'];

/** Corações a subir sempre que alguém chama `celebrar()` (guardar um momento). */
export function Festa() {
  const { festa } = useSessao();
  const [ativa, setAtiva] = useState(0);

  useEffect(() => {
    if (!festa) return;
    setAtiva(festa);
    const t = setTimeout(() => setAtiva(0), 2400);
    return () => clearTimeout(t);
  }, [festa]);

  const particulas = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        cor: CORES[i % 3],
        x: (Math.random() - 0.5) * 340,
        y: -280 - Math.random() * 300,
        rot: (Math.random() - 0.5) * 90,
        tam: 14 + Math.random() * 20,
        atraso: Math.random() * 0.2,
      })),
    // nova chuva a cada celebração
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ativa],
  );

  return (
    <div className="festa" aria-hidden>
      <AnimatePresence>
        {ativa > 0 &&
          particulas.map((p) => (
            <motion.div
              key={`${ativa}-${p.id}`}
              className="coracao-voa"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{ x: p.x, y: p.y, scale: 1, opacity: [1, 1, 0], rotate: p.rot }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, delay: p.atraso, ease: [0.2, 0.8, 0.3, 1] }}
            >
              <Coracao cor={p.cor} tam={p.tam} />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
