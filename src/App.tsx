import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { configurado } from './firebase';
import { useSessao } from './sessao';
import { useColecao } from './lib/useColecao';
import { useAtualizarLocalizacao } from './lib/localizacao';
import type { Ideia } from './tipos';
import { BarraNav, SEPARADORES, Separador } from './componentes/BarraNav';
import { Festa } from './componentes/Coracoes';
import { Entrar } from './ecras/Entrar';
import { Configurar } from './ecras/Configurar';
import { Sorteio } from './ecras/Sorteio';
import { Sitios } from './ecras/Sitios';
import { Momentos } from './ecras/Momentos';
import { Nos } from './ecras/Nos';

const variantes = {
  entra: (dir: number) => ({ opacity: 0, x: dir * 12 }),
  centro: { opacity: 1, x: 0 },
  sai: { opacity: 0 },
};

function Principal() {
  const [separador, setSeparador] = useState<Separador>('sorteio');
  const [direcao, setDirecao] = useState(1);
  const { dados: ideias, carregado } = useColecao<Ideia>('ideias');
  const { user } = useSessao();
  useAtualizarLocalizacao(user?.uid);

  const mudar = (s: Separador) => {
    if (s === separador) return;
    const ordem = SEPARADORES.map((x) => x.id);
    setDirecao(ordem.indexOf(s) > ordem.indexOf(separador) ? 1 : -1);
    setSeparador(s);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <AnimatePresence mode="wait" custom={direcao} initial={false}>
        <motion.main
          key={separador}
          className="pagina"
          custom={direcao}
          variants={variantes}
          initial="entra"
          animate="centro"
          exit="sai"
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {separador === 'sorteio' && <Sorteio ideias={ideias} carregado={carregado} irPara={mudar} />}
          {separador === 'sitios' && <Sitios ideias={ideias} />}
          {separador === 'momentos' && <Momentos ideias={ideias} />}
          {separador === 'nos' && <Nos ideias={ideias} carregado={carregado} />}
        </motion.main>
      </AnimatePresence>
      <BarraNav atual={separador} onMudar={mudar} />
    </>
  );
}

function AvisoConfiguracao() {
  return (
    <div className="entrada-corpo" style={{ paddingTop: 'calc(var(--topo) + 60px)' }}>
      <h1 className="marca-texto">Falta ligar o Firebase</h1>
      <p className="texto-2" style={{ marginTop: 14 }}>
        Cria o ficheiro <code>.env.local</code> a partir do <code>.env.example</code> e volta a correr a app. Os
        passos estão no README.
      </p>
    </div>
  );
}

function ACarregar() {
  return (
    <div className="a-carregar">
      <motion.span
        className="marca-texto"
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        Nós Dois
      </motion.span>
    </div>
  );
}

export default function App() {
  const { user, eu, perfisCarregados } = useSessao();

  let ecra;
  if (!configurado) ecra = <AvisoConfiguracao />;
  else if (user === undefined || (user && !perfisCarregados)) ecra = <ACarregar />;
  else if (!user) ecra = <Entrar />;
  else if (!eu) ecra = <Configurar />;
  else ecra = <Principal />;

  return (
    <>
      <div className="app">{ecra}</div>
      <Festa />
    </>
  );
}
