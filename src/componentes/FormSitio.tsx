import { motion } from 'framer-motion';
import { LocateFixed, MapPinCheck } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSessao } from '../sessao';
import { coordsDoLink, posicaoAtual } from '../lib/geo';
import { AMBIENTES, Ambiente, CATEGORIAS, Duracao, DURACOES, Ideia } from '../tipos';
import { Folha } from './Folha';
import { Segmentos } from './Controlos';

const ZONAS = ['Lisboa', 'Almada', 'Cascais', 'Sintra', 'Setúbal', 'Sesimbra', 'Mafra', 'Ericeira', 'Casa'];

/** Criar ou editar um sítio / ideia. */
export function FormSitio({
  aberta,
  onFechar,
  ideia,
}: {
  aberta: boolean;
  onFechar: () => void;
  ideia?: Ideia | null;
}) {
  const { user } = useSessao();
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('passeio');
  const [zona, setZona] = useState('Lisboa');
  const [custo, setCusto] = useState<0 | 1 | 2 | 3>(1);
  const [duracao, setDuracao] = useState<Duracao>('curto');
  const [ambiente, setAmbiente] = useState<Ambiente>('misto');
  const [link, setLink] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [aLocalizar, setALocalizar] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => {
    if (!aberta) return;
    setTitulo(ideia?.titulo ?? '');
    setCategoria(ideia?.categoria ?? 'passeio');
    setZona(ideia?.zona ?? 'Lisboa');
    setCusto(ideia?.custo ?? 1);
    setDuracao(ideia?.duracao ?? 'curto');
    setAmbiente(ideia?.ambiente ?? 'misto');
    setLink(ideia?.link ?? '');
    setCoords(ideia?.lat != null && ideia?.lng != null ? { lat: ideia.lat, lng: ideia.lng } : null);
    setAGuardar(false);
  }, [aberta, ideia]);

  const mudarLink = (v: string) => {
    setLink(v);
    const c = coordsDoLink(v);
    if (c) setCoords(c);
  };

  const ondeEstou = async () => {
    setALocalizar(true);
    try {
      const p = await posicaoAtual();
      setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
    } catch {
      alert('Não deu para saber onde estás. Confirma as permissões de localização.');
    } finally {
      setALocalizar(false);
    }
  };

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !titulo.trim()) return;
    setAGuardar(true);
    const dados = {
      titulo: titulo.trim(),
      categoria,
      zona: zona.trim() || 'Lisboa',
      custo,
      duracao,
      ambiente,
      link: link.trim(),
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    };
    if (ideia) {
      await updateDoc(doc(db, 'ideias', ideia.id), dados);
    } else {
      await addDoc(collection(db, 'ideias'), {
        ...dados,
        temporario: null,
        estado: 'por-fazer',
        favorito: false,
        ratings: {},
        vezes: 0,
        criadoPor: user.uid,
        criadoEm: serverTimestamp(),
      });
    }
    onFechar();
  };

  return (
    <Folha aberta={aberta} onFechar={onFechar}>
      <h2>{ideia ? 'Editar sítio' : 'Novo sítio'}</h2>
      <form onSubmit={guardar}>
        <div className="campo">
          <label htmlFor="s-titulo">O que é</label>
          <input
            id="s-titulo"
            className="input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Jantar no restaurante X"
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="s-cat">Categoria</label>
          <select id="s-cat" className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {Object.entries(CATEGORIAS).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="s-zona">Zona</label>
          <input id="s-zona" className="input" list="zonas" value={zona} onChange={(e) => setZona(e.target.value)} />
          <datalist id="zonas">
            {ZONAS.map((z) => (
              <option key={z} value={z} />
            ))}
          </datalist>
        </div>
        <div className="campo">
          <span className="rotulo">Preço</span>
          <Segmentos
            valor={custo}
            onChange={setCusto}
            opcoes={[
              { valor: 0, rotulo: 'Grátis' },
              { valor: 1, rotulo: '€' },
              { valor: 2, rotulo: '€€' },
              { valor: 3, rotulo: '€€€' },
            ]}
          />
        </div>
        <div className="campo">
          <span className="rotulo">Duração</span>
          <Segmentos
            valor={duracao}
            onChange={setDuracao}
            opcoes={(Object.keys(DURACOES) as Duracao[]).map((d) => ({ valor: d, rotulo: DURACOES[d] }))}
          />
        </div>
        <div className="campo">
          <span className="rotulo">Onde</span>
          <Segmentos
            valor={ambiente}
            onChange={setAmbiente}
            opcoes={(Object.keys(AMBIENTES) as Ambiente[]).map((a) => ({ valor: a, rotulo: AMBIENTES[a] }))}
          />
        </div>
        <div className="campo">
          <label htmlFor="s-link">Link (Google Maps, Instagram, site)</label>
          <input
            id="s-link"
            className="input"
            value={link}
            onChange={(e) => mudarLink(e.target.value)}
            placeholder="Cola aqui o link"
            inputMode="url"
          />
        </div>
        <div className="linha-opcao" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: coords ? 'var(--verde)' : 'var(--tinta-2)' }}>
            <MapPinCheck size={18} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>{coords ? 'Aparece no mapa' : 'Sem localização no mapa'}</span>
          </div>
          <button type="button" className="btn btn-suave btn-sm" onClick={ondeEstou} disabled={aLocalizar}>
            <LocateFixed size={16} /> {aLocalizar ? '...' : 'Estou aqui'}
          </button>
        </div>
        <motion.button className="btn btn-largo" disabled={aGuardar} whileTap={{ scale: 0.97 }}>
          {aGuardar ? 'A guardar...' : 'Guardar'}
        </motion.button>
      </form>
    </Folha>
  );
}
