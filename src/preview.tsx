// Pré-visualização só para desenvolvimento (não entra no build). Abre /preview.html?ecra=sorteio&tema=rosa
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import '@fontsource/big-shoulders-display/latin-700';
import '@fontsource/big-shoulders-display/latin-800';
import '@fontsource/schibsted-grotesk/latin-400';
import '@fontsource/schibsted-grotesk/latin-500';
import '@fontsource/schibsted-grotesk/latin-600';
import '@fontsource/schibsted-grotesk/latin-700';
import '@fontsource/schibsted-grotesk/latin-400-italic';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import { Ctx } from './sessao';
import dados from './data/dates-lisboa.json';
import { COORDS } from './data/seed';
import { BarraNav, Separador } from './componentes/BarraNav';
import { Festa } from './componentes/Coracoes';
import { Sorteio } from './ecras/Sorteio';
import { Sitios } from './ecras/Sitios';
import { Momentos } from './ecras/Momentos';
import { Nos } from './ecras/Nos';
import { Entrar } from './ecras/Entrar';
import { Configurar } from './ecras/Configurar';

const p = new URLSearchParams(location.search);
const tema = (p.get('tema') as any) || 'azul';
document.documentElement.dataset.tema = tema;
const eu = { id: 'a', nome: tema === 'rosa' ? 'Marta' : 'Alex', cor: tema };
const par = { id: 'b', nome: tema === 'rosa' ? 'Alex' : 'Marta', cor: tema === 'rosa' ? 'azul' : 'rosa' };
(window as any).__docsDemo = {
  'localizacoes/a': { id: 'a', lat: 38.7223, lng: -9.1393, pausado: false, atualizadoEm: new Date(Date.now() - 2 * 60000) },
  'localizacoes/b': { id: 'b', lat: 38.7963, lng: -9.3961, pausado: false, atualizadoEm: new Date(Date.now() - 14 * 60000) },
};
function fotoFalsa(c1: string, c2: string) {
  const cv = document.createElement('canvas');
  cv.width = 800;
  cv.height = 600;
  const g = cv.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 800, 600);
  gr.addColorStop(0, c1);
  gr.addColorStop(1, c2);
  g.fillStyle = gr;
  g.fillRect(0, 0, 800, 600);
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.beginPath();
  g.arc(560, 200, 90, 0, 7);
  g.fill();
  return cv.toDataURL('image/jpeg', 0.8);
}
(window as any).__colecoesDemo = {
  momentos: [
    { id: 'm1', titulo: 'Pôr do sol na Senhora do Monte', data: '2026-10-11', zona: 'Lisboa', nFotos: 3, notas: { a: 'Ficámos até as luzes da cidade acenderem todas.', b: 'O melhor sábado do mês. Repetimos no inverno.' } },
    { id: 'm2', titulo: 'Noite de jogos', data: '2026-10-03', zona: 'Casa', nFotos: 0, notas: { b: 'Ganhei três vezes seguidas, fica registado.' } },
    { id: 'm3', titulo: 'Sintra: Quinta da Regaleira', data: '2026-09-20', zona: 'Sintra', nFotos: 1, notas: {} },
  ],
  fotos: [
    { id: 'f1', momentoId: 'm1', ordem: 0, data: fotoFalsa('#f6a65b', '#7a4b9c') },
    { id: 'f2', momentoId: 'm1', ordem: 1, data: fotoFalsa('#2b3f73', '#e2875c') },
    { id: 'f3', momentoId: 'm1', ordem: 2, data: fotoFalsa('#f2c14e', '#d1495b') },
    { id: 'f4', momentoId: 'm3', ordem: 0, data: fotoFalsa('#3f6b4f', '#a7c4a0') },
  ],
};
const ideias = (dados.ideias as any[]).map((i, k) => ({
  ...i,
  lat: COORDS[i.id]?.[0],
  lng: COORDS[i.id]?.[1],
  estado: k === 3 || k === 26 ? 'planeado' : k % 7 === 0 ? 'feito' : 'por-fazer',
  favorito: k % 9 === 0,
  ratings: k % 5 === 0 ? { a: 4, b: 5 } : {},
}));

function Demo() {
  const [sep, setSep] = useState<Separador>((p.get('ecra') as any) || 'sorteio');
  const [festa, setFesta] = useState(0);
  const valor = { user: { uid: 'a' } as any, eu, parceiro: par, perfisCarregados: true, festa, celebrar: () => setFesta((f) => f + 1) };
  return (
    <Ctx.Provider value={valor as any}>
      <div className="app">
        {sep === ('configurar' as any) ? <Configurar /> : sep === ('entrar' as any) ? <Entrar /> : (
          <main className="pagina">
            {sep === 'sorteio' && <Sorteio ideias={ideias} carregado irPara={setSep} />}
            {sep === 'sitios' && <Sitios ideias={ideias} />}
            {sep === 'momentos' && <Momentos ideias={ideias} />}
            {sep === 'nos' && <Nos ideias={ideias} carregado />}
          </main>
        )}
      </div>
      {sep !== ('entrar' as any) && sep !== ('configurar' as any) && <BarraNav atual={sep} onMudar={setSep} />}
      <Festa />
    </Ctx.Provider>
  );
}
createRoot(document.getElementById('root')!).render(<Demo />);
