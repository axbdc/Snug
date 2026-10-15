import { motion } from 'framer-motion';
import { Camera, Dices, Heart, MapPin } from 'lucide-react';

export type Separador = 'sorteio' | 'sitios' | 'momentos' | 'nos';

export const SEPARADORES: { id: Separador; rotulo: string; Icone: any }[] = [
  { id: 'sorteio', rotulo: 'Sorteio', Icone: Dices },
  { id: 'sitios', rotulo: 'Sítios', Icone: MapPin },
  { id: 'momentos', rotulo: 'Momentos', Icone: Camera },
  { id: 'nos', rotulo: 'Nós', Icone: Heart },
];

export function BarraNav({ atual, onMudar }: { atual: Separador; onMudar: (s: Separador) => void }) {
  return (
    <nav className="nav">
      <div className="nav-dentro">
        {SEPARADORES.map(({ id, rotulo, Icone }) => {
          const ativo = id === atual;
          return (
            <button key={id} className="nav-item" data-ativo={ativo} onClick={() => onMudar(id)}>
              {ativo && (
                <motion.span
                  layoutId="nav-marca"
                  className="nav-marca"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <Icone size={22} strokeWidth={ativo ? 2.3 : 1.8} />
              {rotulo}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
