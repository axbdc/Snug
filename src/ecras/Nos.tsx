import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, RefreshCw, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { corDe, useSessao } from '../sessao';
import { useDocumento } from '../lib/useColecao';
import { distanciaMetros, formatarDistancia } from '../lib/geo';
import { haQuanto } from '../lib/tempo';
import { definirPausa, enviarLocalizacao } from '../lib/localizacao';
import { carregarIdeiasLisboa, NUM_IDEIAS_SEED } from '../data/seed';
import type { Cor, Ideia, Localizacao, Perfil } from '../tipos';
import { Interruptor, Segmentos } from '../componentes/Controlos';

const JUNTOS_M = 150;

/** Anima um número de 0 (ou do valor anterior) até ao alvo. */
function useContagem(alvo: number | null) {
  const [valor, setValor] = useState(alvo ?? 0);
  const anterior = useRef(0);
  useEffect(() => {
    if (alvo == null) return;
    const de = anterior.current;
    const inicio = performance.now();
    const dur = 1100;
    let raf = 0;
    const passo = (t: number) => {
      const p = Math.min(1, (t - inicio) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setValor(de + (alvo - de) * e);
      if (p < 1) raf = requestAnimationFrame(passo);
      else anterior.current = alvo;
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo]);
  return valor;
}

/** Uma linha de elétrico entre os dois, com o elétrico a ir e vir. */
function Linha({ eu, parceiro, juntos }: { eu: Perfil; parceiro: Perfil | null; juntos: boolean }) {
  const xA = juntos ? 136 : 30;
  const xB = juntos ? 164 : 270;
  return (
    <svg viewBox="0 0 300 74" width="100%" height="74" aria-hidden style={{ display: 'block', marginBottom: 18 }}>
      <motion.line
        y1={26}
        y2={26}
        initial={false}
        animate={{ x1: xA, x2: xB }}
        transition={{ type: 'spring', stiffness: 70, damping: 15 }}
        stroke="var(--amarelo)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      {!juntos && (
        <motion.g
          animate={{ x: [xA + 22, xB - 46, xA + 22] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect y={17} width={24} height={14} rx={4} fill="var(--tinta)" />
          <rect x={4} y={20} width={6} height={5} rx={1} fill="var(--amarelo)" />
          <rect x={14} y={20} width={6} height={5} rx={1} fill="var(--amarelo)" />
        </motion.g>
      )}
      {[
        { p: eu, x: xA },
        { p: parceiro, x: xB },
      ].map(({ p, x }, k) => (
        <motion.g key={k} initial={false} animate={{ x }} transition={{ type: 'spring', stiffness: 70, damping: 15 }}>
          <circle cy={26} r={11} fill="var(--papel)" stroke={corDe(p)} strokeWidth={5} />
          {!juntos && (
            <text
              y={64}
              textAnchor={k ? 'end' : 'start'}
              x={k ? 12 : -12}
              fill="var(--tinta)"
              fontSize="14"
              fontWeight="600"
              fontFamily="Schibsted Grotesk, sans-serif"
            >
              {p?.nome ?? '...'}
            </text>
          )}
        </motion.g>
      ))}
    </svg>
  );
}

export function Nos({ ideias, carregado }: { ideias: Ideia[]; carregado: boolean }) {
  const { user, eu, parceiro } = useSessao();
  const minha = useDocumento<Localizacao>(user ? `localizacoes/${user.uid}` : null);
  const dela = useDocumento<Localizacao>(parceiro ? `localizacoes/${parceiro.id}` : null);
  const [aAtualizar, setAAtualizar] = useState(false);
  const [erroLoc, setErroLoc] = useState('');
  const [verWidget, setVerWidget] = useState(false);
  const [aCarregar, setACarregar] = useState(false);
  const [msgSeed, setMsgSeed] = useState('');

  const partilho = Boolean(minha && !minha.pausado);
  const temAmbos =
    minha?.lat != null && dela?.lat != null && !minha.pausado && !dela.pausado;
  const metros = temAmbos ? distanciaMetros(minha.lat!, minha.lng!, dela.lat!, dela.lng!) : null;
  const juntos = metros != null && metros < JUNTOS_M;
  const animado = useContagem(metros);
  const fmt = formatarDistancia(animado);

  const atualizar = async () => {
    if (!user) return;
    setAAtualizar(true);
    setErroLoc('');
    try {
      await enviarLocalizacao(user.uid);
    } catch {
      setErroLoc('Sem acesso à localização. Em Definições > Privacidade > Localização, dá acesso ao Safari.');
    } finally {
      setAAtualizar(false);
    }
  };

  const mudarPartilha = async (ligar: boolean) => {
    if (!user) return;
    if (ligar) await atualizar();
    else await definirPausa(user.uid, true);
  };

  const mudarCor = (cor: Cor) => user && updateDoc(doc(db, 'perfis', user.uid), { cor });

  const ids = new Set(ideias.map((i) => i.id));
  const carregarSeed = async () => {
    if (!user) return;
    setACarregar(true);
    const n = await carregarIdeiasLisboa(user.uid, ids);
    setMsgSeed(n ? `${n} ideias adicionadas ao sorteio.` : 'Já tinham todas as ideias.');
    setACarregar(false);
  };

  let legenda = '';
  if (!parceiro) legenda = 'Falta a outra pessoa entrar na app.';
  else if (!partilho) legenda = 'Liga a partilha de localização nas definições.';
  else if (dela?.pausado) legenda = `${parceiro.nome} pôs a partilha em pausa.`;
  else if (!dela?.lat) legenda = `À espera da posição de ${parceiro.nome}.`;
  else if (juntos) legenda = 'Estão no mesmo sítio.';
  else legenda = `Entre vocês os dois, em linha reta.`;

  const pessoas = [
    { p: eu, l: minha },
    { p: parceiro, l: dela },
  ];

  return (
    <>
      <header className="cabecalho">
        <div>
          <h1>Nós</h1>
          <p>Onde andam e as definições da app.</p>
        </div>
      </header>

      <section className="papel distancia">
        <Linha eu={eu!} parceiro={parceiro} juntos={juntos} />
        <AnimatePresence mode="wait" initial={false}>
          {metros != null && !juntos ? (
            <motion.div key="num" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="distancia-valor">
                {fmt.valor}
                <span className="distancia-unidade">{fmt.unidade}</span>
              </span>
            </motion.div>
          ) : (
            <motion.div key={juntos ? 'juntos' : 'nada'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="distancia-valor" style={{ fontSize: 64 }}>
                {juntos ? 'Lado a lado' : 'Sem sinal'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="distancia-legenda">{legenda}</p>
        {partilho && (
          <button className="btn btn-suave btn-sm" style={{ marginTop: 16 }} onClick={atualizar} disabled={aAtualizar}>
            <motion.span
              animate={aAtualizar ? { rotate: 360 } : { rotate: 0 }}
              transition={aAtualizar ? { repeat: Infinity, duration: 0.9, ease: 'linear' } : { duration: 0 }}
              style={{ display: 'grid' }}
            >
              <RefreshCw size={15} />
            </motion.span>
            Atualizar a minha posição
          </button>
        )}
        {erroLoc && <p className="erro">{erroLoc}</p>}
      </section>

      <div className="lista" style={{ marginTop: 12 }}>
        {pessoas.map(({ p, l }, k) => (
          <div key={k} className="linha-item">
            <div className="avatar" style={{ background: corDe(p) }}>
              {(p?.nome ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="linha-corpo">
              <div className="linha-titulo">{p?.nome ?? 'Ainda não entrou'}</div>
              <div className="linha-meta">
                {!l ? 'Não partilha a localização' : l.pausado ? 'Partilha em pausa' : `Atualizado ${haQuanto(l.atualizadoEm)}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="seccao-titulo">Definições</h2>
      <div className="papel" style={{ padding: '2px 18px' }}>
        <div className="linha-opcao">
          <div>
            <div style={{ fontWeight: 600 }}>Partilhar a minha localização</div>
            <div className="linha-meta">Só vocês os dois a veem. Podes pausar quando quiseres.</div>
          </div>
          <Interruptor ligado={partilho} onChange={mudarPartilha} />
        </div>
        <div className="linha-opcao" style={{ display: 'block' }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>A minha cor</div>
          <Segmentos
            valor={eu?.cor ?? 'azul'}
            onChange={mudarCor}
            opcoes={[
              { valor: 'azul', rotulo: 'Azulejo' },
              { valor: 'rosa', rotulo: 'Cor-de-rosa' },
            ]}
          />
        </div>
        <div className="linha-opcao">
          <div>
            <div style={{ fontWeight: 600 }}>Ideias de Lisboa</div>
            <div className="linha-meta">{msgSeed || `Repõe as ${NUM_IDEIAS_SEED} ideias originais que tenham apagado.`}</div>
          </div>
          <button className="btn btn-suave btn-sm" onClick={carregarSeed} disabled={aCarregar || !carregado}>
            {aCarregar ? 'A repor...' : 'Repor'}
          </button>
        </div>
      </div>

      <h2 className="seccao-titulo">Widget no ecrã bloqueado</h2>
      <div className="papel" style={{ padding: '2px 18px' }}>
        <button
          className="linha-opcao"
          style={{ width: '100%', textAlign: 'left', borderBottom: verWidget ? undefined : 'none' }}
          onClick={() => setVerWidget((v) => !v)}
          aria-expanded={verWidget}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="marca">
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Ver a distância sem abrir a app</div>
              <div className="linha-meta">Com a app grátis Scriptable</div>
            </div>
          </div>
          <motion.span animate={{ rotate: verWidget ? 180 : 0 }} style={{ display: 'grid' }}>
            <ChevronDown size={20} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {verWidget && (
            <motion.ol
              className="passos"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden', paddingTop: 12, paddingBottom: 12 }}
            >
              <li>Instala a app Scriptable da App Store.</li>
              <li>Cria um script novo e cola o conteúdo do ficheiro do widget que vem com a app.</li>
              <li>Corre o script uma vez dentro do Scriptable e entra com o teu email e password.</li>
              <li>Quando pedir localização, escolhe "Ao usar a app ou widgets".</li>
              <li>No ecrã bloqueado, mantém pressionado, toca em Personalizar e adiciona o widget Scriptable.</li>
              <li>Toca no widget e escolhe o script.</li>
            </motion.ol>
          )}
        </AnimatePresence>
      </div>

      <button className="btn btn-texto btn-largo" style={{ marginTop: 24 }} onClick={() => signOut(auth)}>
        <LogOut size={16} /> Terminar sessão
      </button>
    </>
  );
}
