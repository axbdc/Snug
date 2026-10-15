import type { Ideia } from '../tipos';
import { hojeISO } from './tempo';

export type ZonaFiltro = 'todas' | 'lisboa' | 'arredores' | 'casa';

export interface Filtros {
  custoMax: 0 | 1 | 2 | 3;
  duracao: 'qualquer' | 'curto' | 'meio-dia' | 'dia-inteiro';
  ambiente: 'qualquer' | 'dentro' | 'fora';
  zona: ZonaFiltro;
}

export const FILTROS_INICIAIS: Filtros = {
  custoMax: 3,
  duracao: 'qualquer',
  ambiente: 'qualquer',
  zona: 'todas',
};

export function grupoZona(zona: string): Exclude<ZonaFiltro, 'todas'> {
  const z = (zona || '').toLowerCase();
  if (z === 'casa') return 'casa';
  if (z.startsWith('lisboa')) return 'lisboa';
  return 'arredores';
}

export function estaAtivaHoje(i: Ideia, hoje = hojeISO()) {
  if (!i.temporario) return true;
  return hoje >= i.temporario.de && hoje <= i.temporario.ate;
}

export function elegivel(i: Ideia, f: Filtros) {
  if (i.estado !== 'por-fazer') return false;
  if (!estaAtivaHoje(i)) return false;
  if (i.custo > f.custoMax) return false;
  if (f.duracao !== 'qualquer' && i.duracao !== f.duracao) return false;
  if (f.ambiente !== 'qualquer' && i.ambiente !== 'misto' && i.ambiente !== f.ambiente) return false;
  if (f.zona !== 'todas' && grupoZona(i.zona) !== f.zona) return false;
  return true;
}

/** Sorteio com peso: favoritos e eventos temporários contam a dobrar. */
export function sortear(lista: Ideia[], excluir: Set<string>): Ideia | null {
  const candidatas = lista.filter((i) => !excluir.has(i.id));
  if (!candidatas.length) return null;
  const pesos = candidatas.map((i) => (i.favorito ? 2 : 1) * (i.temporario ? 2 : 1));
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let k = 0; k < candidatas.length; k++) {
    r -= pesos[k];
    if (r <= 0) return candidatas[k];
  }
  return candidatas[candidatas.length - 1];
}

export const euros = (c: number) => (c === 0 ? 'Grátis' : '€'.repeat(c));
