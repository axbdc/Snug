import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import dados from './dates-lisboa.json';

/** Coordenadas aproximadas para mostrar no mapa (ideias "em casa" ficam sem pin). */
export const COORDS: Record<string, [number, number]> = {
  'pordosol-miradouro': [38.7193, -9.1327],
  'castelo-sjorge': [38.7139, -9.1334],
  planetario: [38.697, -9.209],
  cinemateca: [38.721, -9.148],
  oceanario: [38.7635, -9.0937],
  'teleferico-pn': [38.765, -9.095],
  'gulbenkian-jardim': [38.7375, -9.154],
  'museu-azulejo': [38.7247, -9.1137],
  'maat-belem': [38.6956, -9.194],
  'pasteis-belem': [38.6975, -9.2032],
  'lx-factory': [38.7034, -9.1785],
  'fado-alfama': [38.7115, -9.13],
  'eletrico-28': [38.7105, -9.1398],
  'piquenique-monsanto': [38.729, -9.188],
  'piquenique-estrela': [38.7145, -9.16],
  'cacilhas-ferry': [38.687, -9.148],
  'cristo-rei': [38.6785, -9.1715],
  'passeio-barco-tejo': [38.7062, -9.1452],
  zoo: [38.744, -9.17],
  'bicicleta-ribeirinha': [38.7006, -9.1736],
  'sintra-pena': [38.7876, -9.3906],
  'sintra-regaleira': [38.7963, -9.3961],
  monserrate: [38.794, -9.421],
  'cabo-roca': [38.7804, -9.4989],
  'comboio-cascais': [38.697, -9.4215],
  'boca-inferno': [38.6913, -9.431],
  'arrabida-praias': [38.48, -8.981],
  'setubal-choco': [38.5244, -8.8882],
  'golfinhos-sado': [38.52, -8.89],
  sesimbra: [38.444, -9.101],
  'cabo-espichel': [38.415, -9.216],
  'tapada-mafra': [38.975, -9.3],
  'ericeira-sunset': [38.963, -9.417],
  obidos: [39.36, -9.157],
  'costa-caparica': [38.64, -9.24],
  'ev-alphaville': [38.7425, -9.146],
  'ev-games-week': [38.769, -9.095],
};

export const NUM_IDEIAS_SEED = dados.ideias.length;

/** Adiciona as ideias de Lisboa que ainda não existem (não mexe nas que já lá estão). */
export async function carregarIdeiasLisboa(uid: string, existentes: Set<string>) {
  const lote = writeBatch(db);
  let n = 0;
  for (const i of dados.ideias as any[]) {
    if (existentes.has(i.id)) continue;
    n++;
    const c = COORDS[i.id];
    lote.set(
      doc(db, 'ideias', i.id),
      {
        titulo: i.titulo,
        categoria: i.categoria,
        zona: i.zona,
        custo: i.custo,
        duracao: i.duracao,
        ambiente: i.ambiente,
        temporario: i.temporario ?? null,
        lat: c ? c[0] : null,
        lng: c ? c[1] : null,
        estado: 'por-fazer',
        favorito: false,
        ratings: {},
        vezes: 0,
        criadoPor: uid,
        criadoEm: serverTimestamp(),
      },
      { merge: true },
    );
  }
  if (n) await lote.commit();
  return n;
}
