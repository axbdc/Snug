import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase';

/** Ouve uma coleção em tempo real. Passa `nome = null` para não ouvir nada. */
export function useColecao<T>(nome: string | null, restricoes: QueryConstraint[] = [], chave = '') {
  const [dados, setDados] = useState<T[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    // Só a pré-visualização (preview.html) define isto, para ver ecrãs sem Firebase
    const demo = (window as any).__colecoesDemo;
    if (demo && nome && demo[nome]) {
      const lista = demo[nome] as any[];
      const filtro = restricoes.length ? chave : '';
      setDados((filtro ? lista.filter((d) => d.momentoId === filtro) : lista) as T[]);
      setCarregado(true);
      return;
    }
    if (!nome) {
      setDados([]);
      setCarregado(false);
      return;
    }
    const q = query(collection(db, nome), ...restricoes);
    return onSnapshot(
      q,
      (snap) => {
        setDados(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T));
        setCarregado(true);
      },
      (erro) => {
        console.error(`[${nome}]`, erro);
        setCarregado(true);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome, chave]);

  return { dados, carregado };
}

/** Ouve um documento em tempo real. */
export function useDocumento<T>(caminho: string | null) {
  const [dados, setDados] = useState<T | null>(null);
  useEffect(() => {
    // Só a pré-visualização (preview.html) define isto, para ver ecrãs sem Firebase
    const demo = (window as any).__docsDemo;
    if (demo && caminho && demo[caminho]) {
      setDados(demo[caminho]);
      return;
    }
    if (!caminho) {
      setDados(null);
      return;
    }
    return onSnapshot(
      doc(db, caminho),
      (snap) => setDados(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null),
      (erro) => console.error(`[${caminho}]`, erro),
    );
  }, [caminho]);
  return dados;
}
