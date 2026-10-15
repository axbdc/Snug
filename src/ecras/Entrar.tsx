import { motion } from 'framer-motion';
import { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Azulejo } from '../componentes/Azulejo';

export function Entrar() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [aEntrar, setAEntrar] = useState(false);

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setAEntrar(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setErro('Email ou password errados. Confirma e tenta outra vez.');
      setAEntrar(false);
    }
  };

  return (
    <div className="entrada">
      <div className="entrada-azulejo">
        <Azulejo tam={86} animar />
      </div>
      <motion.form
        onSubmit={entrar}
        className="entrada-corpo"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <h1 className="marca-texto">Nós Dois</h1>
        <p>Os dates por fazer, os sítios de Lisboa e tudo o que já vivemos.</p>
        <div className="campo">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            className="input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-largo btn-tinta" disabled={aEntrar} style={{ marginTop: 6 }}>
          {aEntrar ? 'A entrar...' : 'Entrar'}
        </button>
        {erro && <p className="erro">{erro}</p>}
      </motion.form>
    </div>
  );
}
