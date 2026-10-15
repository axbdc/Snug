import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSessao } from '../sessao';
import { elegivel, euros, Filtros, FILTROS_INICIAIS, sortear } from '../lib/filtros';
import { carregarIdeiasLisboa, NUM_IDEIAS_SEED } from '../data/seed';
import { AMBIENTES, CATEGORIAS, DURACOES, Ideia } from '../tipos';
import { Chips } from '../componentes/Controlos';
import { IconeCategoria } from '../componentes/IconeCategoria';
import { FormMomento } from '../componentes/FormMomento';
import type { Separador } from '../componentes/BarraNav';

type Fase = 'parado' | 'a-rodar' | 'resultado' | 'carimbado' | 'vazio';

/** Letreiro de palhetas: cada texto novo dobra-se sobre o anterior. */
function Letreiro({ texto, chave, final, apagado }: { texto: string; chave: string; final: boolean; apagado: boolean }) {
  return (
    <div className="letreiro-janela" aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.p
          key={chave}
          className="letreiro-texto"
          data-apagado={apagado}
          style={{ fontSize: texto.length > 48 ? 25 : texto.length > 30 ? 29 : 34 }}
          initial={{ rotateX: -92, opacity: 0.4 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 92, opacity: 0 }}
          transition={final ? { type: 'spring', stiffness: 320, damping: 15 } : { duration: 0.075, ease: 'linear' }}
        >
          {texto}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

export function Sorteio({
  ideias,
  carregado,
}: {
  ideias: Ideia[];
  carregado: boolean;
  irPara: (s: Separador) => void;
}) {
  const { user, eu, parceiro } = useSessao();
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const [maisFiltros, setMaisFiltros] = useState(false);
  const [fase, setFase] = useState<Fase>('parado');
  const [atual, setAtual] = useState<Ideia | null>(null);
  const [giro, setGiro] = useState(0);
  const [bilhete, setBilhete] = useState(0);
  const [vetoUsado, setVetoUsado] = useState(false);
  const [vetadas, setVetadas] = useState<Set<string>>(new Set());
  const [feitoDe, setFeitoDe] = useState<Ideia | null>(null);
  const [aCarregar, setACarregar] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  const elegiveis = useMemo(() => ideias.filter((i) => elegivel(i, filtros)), [ideias, filtros]);
  const planeados = ideias.filter((i) => i.estado === 'planeado');

  const mudarFiltro = <K extends keyof Filtros>(k: K, v: Filtros[K]) => {
    setFiltros((f) => ({ ...f, [k]: v }));
    if (fase === 'resultado' || fase === 'vazio') setFase('parado');
  };

  const rodar = (excluir: Set<string>) => {
    const final = sortear(elegiveis, excluir);
    if (!final) {
      setFase('vazio');
      return;
    }
    clearTimeout(temporizador.current);
    setFase('a-rodar');
    let n = 0;
    const total = 20;
    const passo = () => {
      n++;
      setGiro((g) => g + 1);
      if (n >= total) {
        setAtual(final);
        setFase('resultado');
        return;
      }
      setAtual(elegiveis[Math.floor(Math.random() * elegiveis.length)]);
      temporizador.current = setTimeout(passo, 70 + n * n * 1.3);
    };
    passo();
  };

  const novoSorteio = () => {
    setBilhete((b) => b + 1);
    setVetoUsado(false);
    const v = new Set<string>();
    setVetadas(v);
    rodar(v);
  };

  const vetar = () => {
    if (!atual) return;
    const v = new Set(vetadas).add(atual.id);
    setVetadas(v);
    setVetoUsado(true);
    rodar(v);
  };

  const aceitar = () => {
    if (!atual) return;
    // Grava em segundo plano: o Firestore atualiza a cache local logo, o carimbo não espera pela rede
    updateDoc(doc(db, 'ideias', atual.id), { estado: 'planeado' }).catch(console.error);
    setFase('carimbado');
    temporizador.current = setTimeout(() => {
      setFase('parado');
      setAtual(null);
    }, 1700);
  };

  const desistir = (i: Ideia) => updateDoc(doc(db, 'ideias', i.id), { estado: 'por-fazer' });

  const carregarSeed = async () => {
    if (!user) return;
    setACarregar(true);
    await carregarIdeiasLisboa(user.uid, new Set(ideias.map((i) => i.id)));
    setACarregar(false);
  };

  const semIdeias = carregado && ideias.length === 0;
  const mostraIdeia = atual && (fase === 'a-rodar' || fase === 'resultado' || fase === 'carimbado');
  const textoLetreiro = mostraIdeia
    ? atual!.titulo
    : fase === 'vazio'
      ? 'Sem destinos com estes filtros'
      : 'Destino por sortear';
  const chaveLetreiro = mostraIdeia ? (fase === 'a-rodar' ? `g${giro}` : `f${atual!.id}`) : fase;
  const numero = String(bilhete).padStart(4, '0');

  return (
    <>
      <header className="cabecalho">
        <div>
          <h1>O que fazemos hoje?</h1>
          <p>
            {parceiro ? `${eu?.nome} e ${parceiro.nome}` : eu?.nome}, escolham os filtros e deixem a sorte decidir.
          </p>
        </div>
      </header>

      {semIdeias ? (
        <div className="papel vazio">
          <h3>Ainda não há destinos</h3>
          <p>Carrega as {NUM_IDEIAS_SEED} ideias de Lisboa e arredores para começar a sortear.</p>
          <button className="btn" style={{ marginTop: 18 }} onClick={carregarSeed} disabled={aCarregar}>
            {aCarregar ? 'A carregar...' : 'Carregar ideias'}
          </button>
        </div>
      ) : (
        <>
          <Chips
            valor={filtros.zona}
            onChange={(v) => mudarFiltro('zona', v)}
            opcoes={[
              { valor: 'todas', rotulo: 'Todas as zonas' },
              { valor: 'lisboa', rotulo: 'Lisboa' },
              { valor: 'arredores', rotulo: 'Arredores' },
              { valor: 'casa', rotulo: 'Em casa' },
            ]}
          />
          <Chips
            valor={filtros.custoMax}
            onChange={(v) => mudarFiltro('custoMax', v)}
            opcoes={[
              { valor: 3, rotulo: 'Qualquer preço' },
              { valor: 2, rotulo: 'Até €€' },
              { valor: 1, rotulo: 'Até €' },
              { valor: 0, rotulo: 'Grátis' },
            ]}
          />
          <button
            className="btn btn-texto"
            onClick={() => setMaisFiltros((m) => !m)}
            aria-expanded={maisFiltros}
            style={{ marginLeft: -8 }}
          >
            {maisFiltros ? 'Menos filtros' : 'Duração e sítio'}
            <motion.span animate={{ rotate: maisFiltros ? 180 : 0 }} style={{ display: 'grid' }}>
              <ChevronDown size={16} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {maisFiltros && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <Chips
                  valor={filtros.duracao}
                  onChange={(v) => mudarFiltro('duracao', v)}
                  opcoes={[
                    { valor: 'qualquer', rotulo: 'Qualquer duração' },
                    { valor: 'curto', rotulo: 'Até 2h' },
                    { valor: 'meio-dia', rotulo: 'Meio dia' },
                    { valor: 'dia-inteiro', rotulo: 'Dia inteiro' },
                  ]}
                />
                <Chips
                  valor={filtros.ambiente}
                  onChange={(v) => mudarFiltro('ambiente', v)}
                  opcoes={[
                    { valor: 'qualquer', rotulo: 'Dentro ou fora' },
                    { valor: 'dentro', rotulo: 'Dentro' },
                    { valor: 'fora', rotulo: 'Ao ar livre' },
                  ]}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bilhete">
            <div className="letreiro">
              <Letreiro
                texto={textoLetreiro}
                chave={chaveLetreiro}
                final={fase !== 'a-rodar'}
                apagado={!mostraIdeia}
              />
              <div className="letreiro-rodape">
                <span className="linha-eletrico">{bilhete || '–'}</span>
                <span>
                  {elegiveis.length} {elegiveis.length === 1 ? 'destino possível' : 'destinos possíveis'}
                </span>
              </div>
            </div>

            <div className="picote" />

            <div className="bilhete-corpo">
              <AnimatePresence mode="wait" initial={false}>
                {(fase === 'resultado' || fase === 'carimbado') && atual ? (
                  <motion.div
                    key="resultado"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, delay: 0.15 }}
                  >
                    <div className="bilhete-topo">
                      <span className="bilhete-zona">{atual.zona}</span>
                      <span className="bilhete-numero">Bilhete {numero}</span>
                    </div>
                    <div className="etiquetas">
                      <span className="etiqueta">{CATEGORIAS[atual.categoria] ?? atual.categoria}</span>
                      <span className="etiqueta">{euros(atual.custo)}</span>
                      <span className="etiqueta">{DURACOES[atual.duracao]}</span>
                      <span className="etiqueta">{AMBIENTES[atual.ambiente]}</span>
                    </div>
                    <div className="acoes">
                      <button className="btn" onClick={aceitar} disabled={fase === 'carimbado'}>
                        Vamos
                      </button>
                      <button className="btn btn-suave" onClick={vetar} disabled={vetoUsado || fase === 'carimbado'}>
                        {vetoUsado ? 'Veto usado' : 'Vetar'}
                      </button>
                    </div>
                    <button
                      className="btn btn-texto btn-largo"
                      style={{ marginTop: 6 }}
                      onClick={novoSorteio}
                      disabled={fase === 'carimbado'}
                    >
                      Tirar outro bilhete
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="sortear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <button
                      className="btn btn-largo"
                      onClick={novoSorteio}
                      disabled={fase === 'a-rodar' || !elegiveis.length}
                      style={{ height: 56, fontSize: 17 }}
                    >
                      {fase === 'a-rodar' ? 'A sortear...' : 'Sortear'}
                    </button>
                    {fase === 'vazio' && <p className="contador">Tira um filtro para haver por onde escolher.</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {fase === 'carimbado' && (
                  <motion.div
                    className="carimbo"
                    initial={{ scale: 2.4, opacity: 0, rotate: -4, x: '-50%', y: '-50%' }}
                    animate={{ scale: 1, opacity: 1, rotate: -11, x: '-50%', y: '-50%' }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                  >
                    Planeado
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {planeados.length > 0 && (
            <>
              <h2 className="seccao-titulo">Planeados</h2>
              <div className="lista">
                <AnimatePresence initial={false}>
                  {planeados.map((i) => (
                    <motion.div
                      key={i.id}
                      className="linha-item"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="marca">
                        <IconeCategoria categoria={i.categoria} tam={20} />
                      </div>
                      <div className="linha-corpo">
                        <div className="linha-titulo">{i.titulo}</div>
                        <div className="linha-meta">{i.zona}</div>
                      </div>
                      <button className="btn btn-sm" onClick={() => setFeitoDe(i)}>
                        Já fomos
                      </button>
                      <button
                        className="btn-quadrado"
                        style={{ boxShadow: 'none', width: 34 }}
                        aria-label={`Desistir de ${i.titulo}`}
                        onClick={() => desistir(i)}
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </>
      )}

      <FormMomento aberta={!!feitoDe} ideia={feitoDe} onFechar={() => setFeitoDe(null)} />
    </>
  );
}
