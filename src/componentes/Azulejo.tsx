import { motion } from 'framer-motion';
import { useId } from 'react';

/**
 * Padrão de azulejo português desenhado em SVG (usa currentColor).
 * Os quartos de círculo nos cantos fecham-se em flores quando os azulejos se juntam.
 */
export function Azulejo({ tam = 72, animar = false }: { tam?: number; animar?: boolean }) {
  const id = useId().replace(/:/g, '');
  const m = tam / 2;
  const r = tam * 0.2;
  return (
    <svg aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`az-${id}`} width={tam} height={tam} patternUnits="userSpaceOnUse">
          {/* cantos */}
          {[
            [0, 0],
            [tam, 0],
            [0, tam],
            [tam, tam],
          ].map(([x, y], k) => (
            <g key={k}>
              <circle cx={x} cy={y} r={r} fill="currentColor" />
              <circle cx={x} cy={y} r={r * 0.45} fill="var(--papel)" />
              <circle cx={x} cy={y} r={r * 0.18} fill="currentColor" />
            </g>
          ))}
          {/* losango */}
          <path
            d={`M${m} ${tam * 0.06} L${tam * 0.94} ${m} L${m} ${tam * 0.94} L${tam * 0.06} ${m} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth={tam * 0.022}
          />
          {/* flor central */}
          {[0, 90, 45, 135].map((rot, k) => (
            <ellipse
              key={rot}
              cx={m}
              cy={m}
              rx={tam * (k < 2 ? 0.07 : 0.045)}
              ry={tam * (k < 2 ? 0.2 : 0.14)}
              fill="currentColor"
              transform={`rotate(${rot} ${m} ${m})`}
            />
          ))}
          <circle cx={m} cy={m} r={tam * 0.055} fill="var(--papel)" />
          <circle cx={m} cy={m} r={tam * 0.025} fill="currentColor" />
          {/* pontos a meio das arestas */}
          {[
            [m, 0],
            [m, tam],
            [0, m],
            [tam, m],
          ].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={tam * 0.035} fill="currentColor" />
          ))}
        </pattern>
      </defs>
      {animar ? (
        <motion.rect
          width="100%"
          height="100%"
          fill={`url(#az-${id})`}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
        />
      ) : (
        <rect width="100%" height="100%" fill={`url(#az-${id})`} />
      )}
    </svg>
  );
}
