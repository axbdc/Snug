import { FormEvent, useEffect, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSessao } from '../sessao';
import { Azulejo } from '../componentes/Azulejo';
import type { Cor } from '../tipos';

const OPCOES: { cor: Cor; nome: string }[] = [
  { cor: 'azul', nome: 'Azulejo' },
  { cor: 'rosa', nome: 'Cor-de-rosa' },
];

/** Primeira vez que cada um entra: nome e cor. */
export function Configurar() {
  const { user, parceiro } = useSessao();
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState<Cor>(parceiro?.cor === 'azul' ? 'rosa' : 'azul');
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.tema = cor;
  }, [cor]);

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !nome.trim()) return;
    setAGuardar(true);
    await setDoc(doc(db, 'perfis', user.uid), { nome: nome.trim(), cor });
  };

  return (
    <div className="entrada">
      <div className="entrada-azulejo" style={{ height: '22dvh', minHeight: 140 }}>
        <Azulejo tam={70} />
      </div>
      <form onSubmit={guardar} className="entrada-corpo">
        <h1 className="marca-texto" style={{ fontSize: 54 }}>
          Quem és tu?
        </h1>
        <p>A tua cor pinta a app quando entras com a tua conta.</p>
        <div className="campo">
          <label htmlFor="nome">Nome</label>
          <input
            id="nome"
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como te tratam"
            required
          />
        </div>
        <span className="rotulo" style={{ display: 'block', marginBottom: 8 }}>
          Cor
        </span>
        <div className="escolha-cor">
          {OPCOES.map((o) => (
            <button
              type="button"
              key={o.cor}
              className="opcao-cor"
              data-ativo={cor === o.cor}
              aria-pressed={cor === o.cor}
              style={{ background: `var(--${o.cor})` }}
              onClick={() => setCor(o.cor)}
            >
              <div className="opcao-cor-padrao">
                <Azulejo tam={44} />
              </div>
              <span>{o.nome}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-largo btn-tinta" disabled={aGuardar || !nome.trim()}>
          Começar
        </button>
      </form>
    </div>
  );
}
