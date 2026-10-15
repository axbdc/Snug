import { motion } from 'framer-motion';
import { CalendarCheck, Heart, Map, Pencil, RotateCcw, Trash2, X } from 'lucide-react';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { corDe, useSessao } from '../sessao';
import { euros } from '../lib/filtros';
import { linkMapas } from '../lib/geo';
import { AMBIENTES, CATEGORIAS, DURACOES, Ideia } from '../tipos';
import { Folha } from './Folha';
import { Estrelas } from './Controlos';
import { IconeCategoria } from './IconeCategoria';

const ESTADOS = { 'por-fazer': 'Por fazer', planeado: 'Planeado', feito: 'Feito' };

export function DetalheSitio({
  ideia,
  onFechar,
  onEditar,
  onFeito,
}: {
  ideia: Ideia | null;
  onFechar: () => void;
  onEditar: (i: Ideia) => void;
  onFeito: (i: Ideia) => void;
}) {
  const { user, eu, parceiro, celebrar } = useSessao();
  const ref = ideia ? doc(db, 'ideias', ideia.id) : null;

  const avaliar = (v: number) => ref && user && updateDoc(ref, { [`ratings.${user.uid}`]: v });
  const favorito = () => ref && updateDoc(ref, { favorito: !ideia!.favorito });
  const estado = async (e: Ideia['estado']) => {
    if (!ref) return;
    updateDoc(ref, { estado: e }).catch(console.error);
    if (e === 'planeado') celebrar();
    onFechar();
  };
  const apagar = async () => {
    if (!ref || !confirm(`Apagar "${ideia!.titulo}"?`)) return;
    await deleteDoc(ref);
    onFechar();
  };

  return (
    <Folha aberta={!!ideia} onFechar={onFechar}>
      {ideia && (
        <>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
            <div className="marca" style={{ width: 52, height: 52, borderRadius: 13 }}>
              <IconeCategoria categoria={ideia.categoria} tam={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: 6, fontSize: 30 }}>{ideia.titulo}</h2>
              <p className="linha-meta">
                {ideia.zona}. {ESTADOS[ideia.estado]}
                {ideia.vezes ? `, já foram ${ideia.vezes} ${ideia.vezes === 1 ? 'vez' : 'vezes'}` : ''}.
              </p>
            </div>
            <motion.button
              className="btn-quadrado"
              onClick={favorito}
              whileTap={{ scale: 1.3 }}
              aria-label="Favorito"
              animate={ideia.favorito ? { scale: [1, 1.25, 1] } : {}}
            >
              <Heart size={20} color="var(--cor)" fill={ideia.favorito ? 'var(--cor)' : 'transparent'} />
            </motion.button>
          </div>

          <div className="etiquetas" style={{ marginBottom: 18 }}>
            <span className="etiqueta">{CATEGORIAS[ideia.categoria] ?? ideia.categoria}</span>
            <span className="etiqueta">{euros(ideia.custo)}</span>
            <span className="etiqueta">{DURACOES[ideia.duracao]}</span>
            <span className="etiqueta">{AMBIENTES[ideia.ambiente]}</span>
            {ideia.temporario && (
              <span className="etiqueta">Até {ideia.temporario.ate.split('-').reverse().slice(0, 2).join('/')}</span>
            )}
          </div>

          <div style={{ marginBottom: 14, borderTop: '1px solid var(--linha)', borderBottom: '1px solid var(--linha)' }}>
            <div className="linha-opcao">
              <span style={{ fontWeight: 700, color: corDe(eu) }}>{eu?.nome}</span>
              <Estrelas valor={ideia.ratings?.[user!.uid] ?? 0} cor={corDe(eu)} onChange={avaliar} />
            </div>
            <div className="linha-opcao">
              <span style={{ fontWeight: 700, color: corDe(parceiro) }}>{parceiro?.nome ?? 'Par'}</span>
              <Estrelas valor={parceiro ? ideia.ratings?.[parceiro.id] ?? 0 : 0} cor={corDe(parceiro)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ideia.estado === 'por-fazer' && (
              <button className="btn btn-largo" onClick={() => estado('planeado')}>
                <CalendarCheck size={18} /> Planear
              </button>
            )}
            {ideia.estado === 'planeado' && (
              <div className="acoes" style={{ marginTop: 0 }}>
                <button className="btn" onClick={() => onFeito(ideia)}>
                  Já fomos!
                </button>
                <button className="btn btn-suave" onClick={() => estado('por-fazer')}>
                  <X size={16} /> Desistir
                </button>
              </div>
            )}
            {ideia.estado === 'feito' && (
              <button className="btn btn-suave btn-largo" onClick={() => estado('por-fazer')}>
                <RotateCcw size={16} /> Voltar a pôr no sorteio
              </button>
            )}
            <div className="acoes" style={{ marginTop: 0 }}>
              <a
                className="btn btn-suave"
                href={linkMapas(ideia.titulo, ideia.lat, ideia.lng, ideia.link)}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Map size={16} /> Abrir
              </a>
              <button className="btn btn-suave" onClick={() => onEditar(ideia)}>
                <Pencil size={16} /> Editar
              </button>
            </div>
            <button className="btn btn-texto" onClick={apagar} style={{ color: 'var(--perigo)' }}>
              <Trash2 size={15} /> Apagar
            </button>
          </div>
        </>
      )}
    </Folha>
  );
}
