import type { Cor } from '../tipos';
import { MACACO, SURICATA } from './avataresPaths';

/** Avatar de cada um: macaco (azul) ou suricata (rosa), dentro de um círculo. */
export function Avatar({ cor, tam = 56, anel = true }: { cor?: Cor | null; tam?: number; anel?: boolean }) {
  const desenho = cor === 'rosa' ? SURICATA : MACACO;
  const [, , w, h] = desenho.viewBox.split(' ').map(Number);
  const tinta = cor === 'rosa' ? 'var(--rosa)' : 'var(--azul)';
  const fundo = cor === 'rosa' ? '#fde9ef' : '#e6edfb';
  return (
    <span
      className="avatar-bicho"
      style={{
        width: tam,
        height: tam,
        background: fundo,
        color: tinta,
        boxShadow: anel ? `0 0 0 ${Math.max(2, tam * 0.045)}px ${tinta}` : undefined,
      }}
      aria-hidden
    >
      <svg viewBox={desenho.viewBox} style={{ width: '74%', height: '74%', marginTop: h > w * 1.2 ? '6%' : '4%' }}>
        <path d={desenho.d} fill="currentColor" />
      </svg>
    </span>
  );
}
