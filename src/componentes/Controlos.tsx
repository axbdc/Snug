import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useId } from 'react';

interface Opcao<T> {
  valor: T;
  rotulo: string;
}

/** Fila de chips com o fundo ativo a deslizar entre opções. */
export function Chips<T extends string | number>({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: Opcao<NoInfer<T>>[];
  valor: T;
  onChange: (v: NoInfer<T>) => void;
}) {
  const id = useId();
  return (
    <div className="chips">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <motion.button
            key={String(o.valor)}
            className="chip"
            data-ativo={ativo}
            onClick={() => onChange(o.valor)}
            whileTap={{ scale: 0.94 }}
          >
            {ativo && (
              <motion.div
                layoutId={`chip-${id}`}
                className="chip-fundo"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span>{o.rotulo}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/** Controlo segmentado estilo iOS. */
export function Segmentos<T extends string | number>({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: Opcao<NoInfer<T>>[];
  valor: T;
  onChange: (v: NoInfer<T>) => void;
}) {
  const id = useId();
  return (
    <div className="segmentos">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            type="button"
            key={String(o.valor)}
            className="segmento"
            data-ativo={ativo}
            onClick={() => onChange(o.valor)}
          >
            {ativo && (
              <motion.div
                layoutId={`seg-${id}`}
                className="segmento-fundo"
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
              />
            )}
            <span>{o.rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Estrelas({
  valor = 0,
  cor,
  onChange,
  tam = 22,
}: {
  valor?: number;
  cor: string;
  onChange?: (v: number) => void;
  tam?: number;
}) {
  return (
    <div className="estrelas" role={onChange ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => {
        const cheia = n <= valor;
        return (
          <motion.button
            type="button"
            key={n}
            className="estrela"
            disabled={!onChange}
            aria-label={`${n} estrelas`}
            onClick={() => onChange?.(n === valor ? 0 : n)}
            whileTap={onChange ? { scale: 1.35 } : undefined}
            animate={cheia ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.25, delay: n * 0.03 }}
            style={{ cursor: onChange ? 'pointer' : 'default' }}
          >
            <Star size={tam} strokeWidth={2} color={cor} fill={cheia ? cor : 'transparent'} />
          </motion.button>
        );
      })}
    </div>
  );
}

export function Interruptor({ ligado, onChange }: { ligado: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className="interruptor"
      data-ligado={ligado}
      role="switch"
      aria-checked={ligado}
      onClick={() => onChange(!ligado)}
    >
      <motion.div
        className="interruptor-bola"
        animate={{ x: ligado ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
