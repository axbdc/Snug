import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { useColecao } from './lib/useColecao';
import type { Perfil } from './tipos';

interface Sessao {
  user: User | null | undefined;
  eu: Perfil | null;
  parceiro: Perfil | null;
  perfisCarregados: boolean;
  /** Dispara a chuva de corações. */
  celebrar: () => void;
  festa: number;
}

export const Ctx = createContext<Sessao>(null as any);

const CORES_TEMA = { azul: '#E8EEF9', rosa: '#FAE9ED' };

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [festa, setFesta] = useState(0);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const { dados: perfis, carregado } = useColecao<Perfil>(user ? 'perfis' : null, [], user?.uid);
  const eu = (user && perfis.find((p) => p.id === user.uid)) || null;
  const parceiro = (user && perfis.find((p) => p.id !== user.uid)) || null;

  useEffect(() => {
    const tema = eu?.cor ?? 'azul';
    document.documentElement.dataset.tema = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', CORES_TEMA[tema]);
  }, [eu?.cor]);

  const celebrar = useCallback(() => setFesta((f) => f + 1), []);

  return (
    <Ctx.Provider value={{ user, eu, parceiro, perfisCarregados: carregado, celebrar, festa }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSessao = () => useContext(Ctx);

/** Cor CSS de cada pessoa, para usar em notas, ratings e pins. */
export const corDe = (p?: Perfil | null) =>
  p?.cor === 'rosa' ? 'var(--rosa)' : p?.cor === 'azul' ? 'var(--azul)' : 'var(--tinta-2)';
