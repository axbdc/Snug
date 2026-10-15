import { Bike, Footprints, Home, Landmark, Sparkles, Ticket, Trees, UtensilsCrossed } from 'lucide-react';

const ICONES: Record<string, any> = {
  passeio: Footprints,
  cultura: Landmark,
  comida: UtensilsCrossed,
  natureza: Trees,
  experiencia: Sparkles,
  desporto: Bike,
  casa: Home,
  evento: Ticket,
};

export function IconeCategoria({ categoria, tam = 22 }: { categoria: string; tam?: number }) {
  const Icone = ICONES[categoria] ?? Sparkles;
  return <Icone size={tam} strokeWidth={2} />;
}
