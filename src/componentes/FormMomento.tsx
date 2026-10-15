import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, X } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { addDoc, collection, doc, increment, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { corDe, useSessao } from '../sessao';
import { comprimirFoto } from '../lib/imagem';
import { hojeISO } from '../lib/tempo';
import type { Ideia } from '../tipos';
import { Folha } from './Folha';
import { Estrelas, Interruptor } from './Controlos';

const MAX_FOTOS = 6;

/** Regista um momento (date feito), opcionalmente ligado a uma ideia do sorteio. */
export function FormMomento({
  aberta,
  onFechar,
  ideia,
}: {
  aberta: boolean;
  onFechar: () => void;
  ideia?: Ideia | null;
}) {
  const { user, eu, celebrar } = useSessao();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(hojeISO());
  const [nota, setNota] = useState('');
  const [rating, setRating] = useState(0);
  const [fotos, setFotos] = useState<string[]>([]);
  const [repetir, setRepetir] = useState(false);
  const [aProcessar, setAProcessar] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!aberta) return;
    setTitulo(ideia?.titulo ?? '');
    setData(hojeISO());
    setNota('');
    setRating(ideia?.ratings?.[user?.uid ?? ''] ?? 0);
    setFotos([]);
    setRepetir(ideia?.categoria === 'casa');
    setErro('');
    setAGuardar(false);
  }, [aberta, ideia, user?.uid]);

  const escolherFotos = async (e: ChangeEvent<HTMLInputElement>) => {
    const ficheiros = Array.from(e.target.files ?? []).slice(0, MAX_FOTOS - fotos.length);
    e.target.value = '';
    if (!ficheiros.length) return;
    setAProcessar(true);
    try {
      const novas = await Promise.all(ficheiros.map((f) => comprimirFoto(f)));
      setFotos((f) => [...f, ...novas]);
    } catch {
      setErro('Não deu para processar uma das fotos.');
    } finally {
      setAProcessar(false);
    }
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !titulo.trim()) return;
    setAGuardar(true);
    setErro('');
    try {
      const ref = await addDoc(collection(db, 'momentos'), {
        titulo: titulo.trim(),
        data,
        ideiaId: ideia?.id ?? null,
        zona: ideia?.zona ?? '',
        notas: nota.trim() ? { [user.uid]: nota.trim() } : {},
        nFotos: fotos.length,
        criadoPor: user.uid,
        criadoEm: serverTimestamp(),
      });
      await Promise.all(
        fotos.map((f, ordem) => addDoc(collection(db, 'fotos'), { momentoId: ref.id, data: f, ordem })),
      );
      if (ideia) {
        await updateDoc(doc(db, 'ideias', ideia.id), {
          estado: repetir ? 'por-fazer' : 'feito',
          vezes: increment(1),
          [`ratings.${user.uid}`]: rating,
        });
      }
      celebrar();
      onFechar();
    } catch (err) {
      console.error(err);
      setErro('Não foi possível guardar. Tenta outra vez.');
      setAGuardar(false);
    }
  };

  return (
    <Folha aberta={aberta} onFechar={onFechar}>
      <h2>{ideia ? 'Como correu?' : 'Novo momento'}</h2>
      <form onSubmit={guardar}>
        <div className="campo">
          <label htmlFor="m-titulo">Título</label>
          <input
            id="m-titulo"
            className="input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Jantar em Alfama"
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="m-data">Data</label>
          <input id="m-data" className="input" type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>

        {ideia && (
          <div className="campo">
            <span className="rotulo">A tua nota</span>
            <Estrelas valor={rating} cor={corDe(eu)} onChange={setRating} tam={30} />
          </div>
        )}

        <div className="campo">
          <span className="rotulo">Fotos ({fotos.length}/{MAX_FOTOS})</span>
          <div className="miniaturas">
            <AnimatePresence>
              {fotos.map((f, i) => (
                <motion.div
                  key={f.slice(-40) + i}
                  className="miniatura"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <img src={f} alt="" />
                  <button type="button" aria-label="Remover" onClick={() => setFotos((x) => x.filter((_, k) => k !== i))}>
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {fotos.length < MAX_FOTOS && (
              <label className="adicionar-foto" style={{ cursor: 'pointer' }}>
                {aProcessar ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <ImagePlus size={24} />
                  </motion.div>
                ) : (
                  <ImagePlus size={24} />
                )}
                <input type="file" accept="image/*" multiple hidden onChange={escolherFotos} />
              </label>
            )}
          </div>
        </div>

        <div className="campo">
          <label htmlFor="m-nota">Uma nota tua</label>
          <textarea
            id="m-nota"
            className="input"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="O que queres lembrar deste dia?"
          />
        </div>

        {ideia && (
          <div className="linha-opcao" style={{ marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 700 }}>Voltar ao sorteio</div>
              <div className="linha-meta">Para ideias que dá para repetir</div>
            </div>
            <Interruptor ligado={repetir} onChange={setRepetir} />
          </div>
        )}

        <motion.button className="btn btn-largo" disabled={aGuardar || aProcessar} whileTap={{ scale: 0.97 }}>
          {aGuardar ? 'A guardar...' : 'Guardar momento'}
        </motion.button>
        {erro && <p className="erro">{erro}</p>}
      </form>
    </Folha>
  );
}
