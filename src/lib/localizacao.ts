import { useEffect } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { posicaoAtual } from './geo';
import { useDocumento } from './useColecao';
import type { Localizacao } from '../tipos';

export async function enviarLocalizacao(uid: string) {
  const p = await posicaoAtual();
  await setDoc(
    doc(db, 'localizacoes', uid),
    {
      lat: p.coords.latitude,
      lng: p.coords.longitude,
      precisao: Math.round(p.coords.accuracy),
      atualizadoEm: serverTimestamp(),
      pausado: false,
    },
    { merge: true },
  );
}

export async function definirPausa(uid: string, pausado: boolean) {
  await setDoc(doc(db, 'localizacoes', uid), { pausado }, { merge: true });
}

/**
 * Enquanto a app está aberta, atualiza a minha localização de 5 em 5 minutos.
 * Só corre se a partilha já tiver sido ligada no separador "Nós".
 */
export function useAtualizarLocalizacao(uid?: string) {
  const minha = useDocumento<Localizacao>(uid ? `localizacoes/${uid}` : null);
  const ativa = Boolean(minha && !minha.pausado);

  useEffect(() => {
    if (!uid || !ativa) return;
    const atualizar = () => enviarLocalizacao(uid).catch(() => {});
    atualizar();
    const t = setInterval(atualizar, 5 * 60 * 1000);
    const aoVoltar = () => document.visibilityState === 'visible' && atualizar();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [uid, ativa]);
}
