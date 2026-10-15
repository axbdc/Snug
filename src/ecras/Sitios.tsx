import { AnimatePresence, motion } from 'framer-motion';
import { Heart, List, Map as IconeMapa, Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSessao } from '../sessao';
import { euros } from '../lib/filtros';
import { DURACOES, Ideia } from '../tipos';
import { Chips } from '../componentes/Controlos';
import { IconeCategoria } from '../componentes/IconeCategoria';
import { MapaSitios } from '../componentes/MapaSitios';
import { DetalheSitio } from '../componentes/DetalheSitio';
import { FormSitio } from '../componentes/FormSitio';
import { FormMomento } from '../componentes/FormMomento';
import { BotaoMais } from '../componentes/Portal';

type Vista = 'por-fazer' | 'planeado' | 'feito' | 'favoritos' | 'todos';

const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export function Sitios({ ideias }: { ideias: Ideia[] }) {
  const { user, parceiro } = useSessao();
  const [vista, setVista] = useState<Vista>('por-fazer');
  const [modo, setModo] = useState<'lista' | 'mapa'>('lista');
  const [pesquisa, setPesquisa] = useState('');
  const [aberto, setAberto] = useState<string | null>(null);
  const [aEditar, setAEditar] = useState<Ideia | null | undefined>(undefined);
  const [feitoDe, setFeitoDe] = useState<Ideia | null>(null);

  const filtradas = useMemo(() => {
    const q = normal(pesquisa.trim());
    return ideias
      .filter((i) => {
        if (vista === 'favoritos') return i.favorito;
        if (vista === 'todos') return true;
        return i.estado === vista;
      })
      .filter((i) => !q || normal(`${i.titulo} ${i.zona}`).includes(q))
      .sort((a, b) => Number(!!b.favorito) - Number(!!a.favorito) || a.titulo.localeCompare(b.titulo, 'pt'));
  }, [ideias, vista, pesquisa]);

  const ideiaAberta = ideias.find((i) => i.id === aberto) ?? null;

  const media = (i: Ideia) => {
    const vals = [i.ratings?.[user!.uid], parceiro ? i.ratings?.[parceiro.id] : undefined].filter((v) => v);
    return vals.length ? vals.reduce((a, b) => a + b!, 0) / vals.length : 0;
  };

  return (
    <>
      <header className="cabecalho">
        <div>
          <h1>Os nossos sítios</h1>
          <p>{ideias.length} guardados, {ideias.filter((i) => (i.vezes ?? 0) > 0).length} já visitados</p>
        </div>
        <button
          className="btn-quadrado"
          onClick={() => setModo((m) => (m === 'lista' ? 'mapa' : 'lista'))}
          aria-label={modo === 'lista' ? 'Ver mapa' : 'Ver lista'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={modo}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'grid' }}
            >
              {modo === 'lista' ? <IconeMapa size={20} /> : <List size={20} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </header>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search
          size={18}
          style={{ position: 'absolute', left: 14, top: 16, color: 'var(--tinta-2)', pointerEvents: 'none' }}
        />
        <input
          className="input"
          style={{ paddingLeft: 42 }}
          placeholder="Procurar por nome ou zona"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          aria-label="Procurar sítios"
        />
      </div>

      <Chips
        valor={vista}
        onChange={setVista}
        opcoes={[
          { valor: 'por-fazer', rotulo: 'Por fazer' },
          { valor: 'planeado', rotulo: 'Planeados' },
          { valor: 'feito', rotulo: 'Feitos' },
          { valor: 'favoritos', rotulo: 'Favoritos' },
          { valor: 'todos', rotulo: 'Todos' },
        ]}
      />

      <div style={{ marginTop: 6 }}>
        {modo === 'mapa' ? (
          <MapaSitios ideias={filtradas} onAbrir={(i) => setAberto(i.id)} />
        ) : filtradas.length === 0 ? (
          <div className="papel vazio">
            <h3>{pesquisa ? 'Nenhum sítio encontrado' : 'Lista vazia'}</h3>
            <p>{pesquisa ? 'Experimenta outro nome ou zona.' : 'Adiciona um sítio no botão de baixo.'}</p>
          </div>
        ) : (
          <div className="lista">
            {filtradas.map((i) => {
              const m = media(i);
              return (
                <button key={i.id} className="linha-item" onClick={() => setAberto(i.id)}>
                  <div className="marca">
                    <IconeCategoria categoria={i.categoria} tam={20} />
                  </div>
                  <div className="linha-corpo">
                    <div className="linha-titulo">{i.titulo}</div>
                    <div className="linha-meta">
                      {i.zona}, {euros(i.custo).toLowerCase()}, {DURACOES[i.duracao].toLowerCase()}
                    </div>
                  </div>
                  <div className="linha-fim">
                    {i.favorito && <Heart size={16} color="var(--cor)" fill="var(--cor)" aria-label="Favorito" />}
                    {m > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={13} fill="var(--amarelo)" color="var(--amarelo)" />
                        {m.toFixed(1).replace('.', ',')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BotaoMais onClick={() => setAEditar(null)} rotulo="Novo sítio" />

      <DetalheSitio
        ideia={ideiaAberta}
        onFechar={() => setAberto(null)}
        onEditar={(i) => {
          setAberto(null);
          setAEditar(i);
        }}
        onFeito={(i) => {
          setAberto(null);
          setFeitoDe(i);
        }}
      />
      <FormSitio aberta={aEditar !== undefined} ideia={aEditar} onFechar={() => setAEditar(undefined)} />
      <FormMomento aberta={!!feitoDe} ideia={feitoDe} onFechar={() => setFeitoDe(null)} />
    </>
  );
}
