import { AnimatePresence, motion } from 'framer-motion';
import { PenLine, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { corDe, useSessao } from '../sessao';
import { useColecao } from '../lib/useColecao';
import type { Foto, Ideia, Momento } from '../tipos';
import { Folha } from '../componentes/Folha';
import { FormMomento } from '../componentes/FormMomento';
import { BotaoMais, Portal } from '../componentes/Portal';

const fmtMes = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' });
const fmtDia = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
const dataLocal = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
};
const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Fotos({ momento, onAbrir }: { momento: Momento; onAbrir: (src: string) => void }) {
  const { dados } = useColecao<Foto>('fotos', [where('momentoId', '==', momento.id)], momento.id);
  if (!momento.nFotos) return null;
  const fotos = [...dados].sort((a, b) => a.ordem - b.ordem);
  const [capa, ...resto] = fotos;
  return (
    <>
      <button className="impressao-foto" onClick={() => capa && onAbrir(capa.data)} aria-label="Ver foto">
        {capa && (
          <motion.img src={capa.data} alt="" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
        )}
      </button>
      {resto.length > 0 && (
        <div className="impressao-mini">
          {resto.map((f) => (
            <button key={f.id} onClick={() => onAbrir(f.data)} aria-label="Ver foto">
              <img src={f.data} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function Momentos({ ideias }: { ideias: Ideia[] }) {
  const { user, eu, parceiro } = useSessao();
  const { dados, carregado } = useColecao<Momento>('momentos');
  const [novo, setNovo] = useState(false);
  const [foto, setFoto] = useState<string | null>(null);
  const [aEscrever, setAEscrever] = useState<Momento | null>(null);
  const [texto, setTexto] = useState('');

  const momentos = useMemo(
    () =>
      [...dados].sort(
        (a, b) => b.data.localeCompare(a.data) || (b.criadoEm?.seconds ?? 0) - (a.criadoEm?.seconds ?? 0),
      ),
    [dados],
  );

  const porMes = useMemo(() => {
    const grupos: { mes: string; itens: Momento[] }[] = [];
    for (const m of momentos) {
      const chave = maiuscula(fmtMes.format(dataLocal(m.data)));
      const ultimo = grupos[grupos.length - 1];
      if (ultimo?.mes === chave) ultimo.itens.push(m);
      else grupos.push({ mes: chave, itens: [m] });
    }
    return grupos;
  }, [momentos]);

  const anoAtual = String(new Date().getFullYear());
  const desteAno = momentos.filter((m) => m.data.startsWith(anoAtual)).length;
  const sitiosFeitos = ideias.filter((i) => (i.vezes ?? 0) > 0).length;

  const abrirNota = (m: Momento) => {
    setTexto(m.notas?.[user!.uid] ?? '');
    setAEscrever(m);
  };

  const guardarNota = async () => {
    if (!aEscrever || !user) return;
    await updateDoc(doc(db, 'momentos', aEscrever.id), { [`notas.${user.uid}`]: texto.trim() });
    setAEscrever(null);
  };

  const apagar = async (m: Momento) => {
    if (!confirm(`Apagar "${m.titulo}" e as fotos? Não dá para desfazer.`)) return;
    const fotos = await getDocs(query(collection(db, 'fotos'), where('momentoId', '==', m.id)));
    const lote = writeBatch(db);
    fotos.forEach((f) => lote.delete(f.ref));
    await lote.commit();
    await deleteDoc(doc(db, 'momentos', m.id));
    setAEscrever(null);
  };

  const pessoas = [eu, parceiro].filter(Boolean);
  let indice = 0;

  return (
    <>
      <header className="cabecalho">
        <h1>Momentos</h1>
      </header>

      {carregado && momentos.length === 0 ? (
        <div className="papel vazio">
          <h3>A primeira página está em branco</h3>
          <p>Quando marcarem um date como feito, fica aqui com as fotos e o que cada um escreveu.</p>
          <button className="btn" style={{ marginTop: 18 }} onClick={() => setNovo(true)}>
            Adicionar um momento
          </button>
        </div>
      ) : (
        <>
          <p className="resumo">
            <strong>{momentos.length}</strong> {momentos.length === 1 ? 'momento' : 'momentos'} juntos,{' '}
            <strong>{desteAno}</strong> em {anoAtual} e <strong>{sitiosFeitos}</strong>{' '}
            {sitiosFeitos === 1 ? 'sítio riscado' : 'sítios riscados'} da lista.
          </p>

          {porMes.map((g) => (
            <section key={g.mes}>
              <h2 className="mes">{g.mes}</h2>
              {g.itens.map((m) => {
                const k = indice++;
                const local = m.zona ? `, ${m.zona}` : '';
                return (
                  <motion.article
                    key={m.id}
                    className="impressao"
                    style={{ rotate: k % 2 ? 0.8 : -0.9 }}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
                  >
                    <Fotos momento={m} onAbrir={setFoto} />
                    <div className="impressao-legenda">
                      <h3>{m.titulo}</h3>
                      <p className="impressao-data">
                        {maiuscula(fmtDia.format(dataLocal(m.data)))}
                        {local}
                      </p>
                      {pessoas.map(
                        (p) =>
                          m.notas?.[p!.id] && (
                            <div key={p!.id} className="nota">
                              <div className="nota-autor" style={{ color: corDe(p) }}>
                                {p!.nome}
                              </div>
                              {m.notas[p!.id]}
                            </div>
                          ),
                      )}
                      <button
                        className="btn btn-texto"
                        style={{ marginTop: 6, marginLeft: -8 }}
                        onClick={() => abrirNota(m)}
                      >
                        <PenLine size={15} />
                        {m.notas?.[user!.uid] ? 'Editar a minha nota' : 'Escrever a minha nota'}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </section>
          ))}
        </>
      )}

      <BotaoMais onClick={() => setNovo(true)} rotulo="Novo momento" />

      <FormMomento aberta={novo} onFechar={() => setNovo(false)} />

      <Folha aberta={!!aEscrever} onFechar={() => setAEscrever(null)}>
        <h2>A tua nota</h2>
        <p className="linha-meta" style={{ marginTop: -10, marginBottom: 14 }}>
          {aEscrever?.titulo}
        </p>
        <textarea
          className="input"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="O que queres lembrar deste dia?"
          style={{ minHeight: 140, marginBottom: 14 }}
          aria-label="A tua nota"
        />
        <button className="btn btn-largo" onClick={guardarNota}>
          Guardar nota
        </button>
        <button
          className="btn btn-texto btn-largo"
          style={{ marginTop: 10, color: 'var(--perigo)' }}
          onClick={() => aEscrever && apagar(aEscrever)}
        >
          <Trash2 size={15} /> Apagar momento
        </button>
      </Folha>

      <Portal>
        <AnimatePresence>
          {foto && (
            <motion.div
              className="lightbox"
              onClick={() => setFoto(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.img
                src={foto}
                alt=""
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
