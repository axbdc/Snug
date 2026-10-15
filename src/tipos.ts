export type Cor = 'azul' | 'rosa';

export interface Perfil {
  id: string;
  nome: string;
  cor: Cor;
}

export type Estado = 'por-fazer' | 'planeado' | 'feito';
export type Duracao = 'curto' | 'meio-dia' | 'dia-inteiro';
export type Ambiente = 'dentro' | 'fora' | 'misto';

export interface Ideia {
  id: string;
  titulo: string;
  categoria: string;
  zona: string;
  custo: 0 | 1 | 2 | 3;
  duracao: Duracao;
  ambiente: Ambiente;
  temporario?: { de: string; ate: string } | null;
  lat?: number | null;
  lng?: number | null;
  link?: string;
  estado: Estado;
  favorito?: boolean;
  ratings?: Record<string, number>;
  vezes?: number;
  criadoPor?: string;
  criadoEm?: any;
}

export interface Momento {
  id: string;
  titulo: string;
  data: string;
  ideiaId?: string | null;
  zona?: string;
  notas?: Record<string, string>;
  nFotos?: number;
  criadoPor?: string;
  criadoEm?: any;
}

export interface Foto {
  id: string;
  momentoId: string;
  data: string;
  ordem: number;
}

export interface Localizacao {
  id: string;
  lat?: number;
  lng?: number;
  precisao?: number;
  atualizadoEm?: any;
  pausado?: boolean;
}

export const CATEGORIAS: Record<string, string> = {
  passeio: 'Passeio',
  cultura: 'Cultura',
  comida: 'Comida',
  natureza: 'Natureza',
  experiencia: 'Experiência',
  desporto: 'Desporto',
  casa: 'Em casa',
  evento: 'Evento',
};

export const DURACOES: Record<Duracao, string> = {
  curto: 'Até 2h',
  'meio-dia': 'Meio dia',
  'dia-inteiro': 'Dia inteiro',
};

export const AMBIENTES: Record<Ambiente, string> = {
  dentro: 'Dentro',
  fora: 'Ao ar livre',
  misto: 'Misto',
};
