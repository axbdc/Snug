// Nós Dois - widget de distância para o Scriptable (iPhone)
// Funciona no ecrã bloqueado (circular, retangular, em linha) e no ecrã principal.
//
// 1. Preenche as duas constantes abaixo com os dados do teu projeto Firebase.
// 2. Corre o script uma vez dentro da app Scriptable para guardar o email e a password.
// 3. Adiciona o widget Scriptable ao ecrã bloqueado e escolhe este script.

const FIREBASE_API_KEY = 'COLA_AQUI_A_API_KEY';
const FIREBASE_PROJECT_ID = 'COLA_AQUI_O_PROJECT_ID';
const LINK_DA_APP = 'https://COLA_AQUI_O_LINK_DA_APP.vercel.app'; // abre a app ao tocar no widget

// ---------------------------------------------------------------------------

const CHAVE = 'nosdois-credenciais';
const BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;
const AZUL = new Color('#1e4fbf');
const ROSA = new Color('#d2416c');
const LETREIRO = new Color('#141a24');
const AMARELO = new Color('#f4c23a');

async function pedirCredenciais() {
  const a = new Alert();
  a.title = 'Nós Dois';
  a.message = 'Entra com a mesma conta da app.';
  a.addTextField('Email');
  a.addSecureTextField('Password');
  a.addAction('Guardar');
  a.addCancelAction('Cancelar');
  const r = await a.presentAlert();
  if (r === -1) return null;
  const cred = { email: a.textFieldValue(0).trim(), password: a.textFieldValue(1) };
  Keychain.set(CHAVE, JSON.stringify(cred));
  return cred;
}

async function credenciais() {
  if (Keychain.contains(CHAVE)) return JSON.parse(Keychain.get(CHAVE));
  if (config.runsInApp) return pedirCredenciais();
  return null;
}

async function entrar(cred) {
  const req = new Request(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
  );
  req.method = 'POST';
  req.headers = { 'Content-Type': 'application/json' };
  req.body = JSON.stringify({ ...cred, returnSecureToken: true });
  const r = await req.loadJSON();
  if (!r.idToken) throw new Error('Login falhou');
  return { token: r.idToken, uid: r.localId };
}

async function lerDoc(caminho, token) {
  const req = new Request(`${BASE}/${caminho}`);
  req.headers = { Authorization: `Bearer ${token}` };
  const r = await req.loadJSON();
  return r && r.fields ? r : null;
}

async function listar(colecao, token) {
  const req = new Request(`${BASE}/${colecao}`);
  req.headers = { Authorization: `Bearer ${token}` };
  const r = await req.loadJSON();
  return (r && r.documents) || [];
}

async function gravarLocalizacao(uid, token, loc) {
  const campos = ['lat', 'lng', 'precisao', 'atualizadoEm'];
  const mask = campos.map((c) => `updateMask.fieldPaths=${c}`).join('&');
  const req = new Request(`${BASE}/localizacoes/${uid}?${mask}`);
  req.method = 'PATCH';
  req.headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  req.body = JSON.stringify({
    fields: {
      lat: { doubleValue: loc.latitude },
      lng: { doubleValue: loc.longitude },
      precisao: { integerValue: String(Math.round(loc.horizontalAccuracy || 0)) },
      atualizadoEm: { timestampValue: new Date().toISOString() },
    },
  });
  await req.loadJSON();
}

const num = (f) => (f ? Number(f.doubleValue ?? f.integerValue) : null);

function distancia(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const rad = (g) => (g * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatar(m) {
  if (m < 150) return 'juntos';
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  if (m < 10000) return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
  return `${Math.round(m / 1000)} km`;
}

function haQuanto(iso) {
  if (!iso) return '';
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  return h < 24 ? `há ${h} h` : `há ${Math.round(h / 24)} d`;
}

async function obterDados() {
  const cred = await credenciais();
  if (!cred) return { erro: 'Abre o script no Scriptable' };
  const { token, uid } = await entrar(cred);

  // 1. Atualiza a minha localização, se a partilha estiver ligada na app
  const minha = await lerDoc(`localizacoes/${uid}`, token);
  const pausado = !minha || minha.fields.pausado?.booleanValue === true;
  let eu = minha;
  if (!pausado) {
    try {
      Location.setAccuracyToHundredMeters();
      const loc = await Location.current();
      await gravarLocalizacao(uid, token, loc);
      eu = { fields: { lat: { doubleValue: loc.latitude }, lng: { doubleValue: loc.longitude } } };
    } catch (e) {
      console.log('Sem localização agora: ' + e);
    }
  }

  // 2. Descobre a outra pessoa e a localização dela
  const perfis = await listar('perfis', token);
  const outro = perfis.find((p) => !p.name.endsWith(`/${uid}`));
  if (!outro) return { erro: 'Falta a outra pessoa' };
  const outroUid = outro.name.split('/').pop();
  const nome = outro.fields.nome?.stringValue ?? 'Par';
  const cor = outro.fields.cor?.stringValue === 'azul' ? AZUL : ROSA;
  const dela = await lerDoc(`localizacoes/${outroUid}`, token);

  if (pausado) return { nome, cor, erro: 'Partilha desligada' };
  if (!dela || dela.fields.pausado?.booleanValue) return { nome, cor, erro: `${nome} em pausa` };

  const m = distancia(
    num(eu.fields.lat),
    num(eu.fields.lng),
    num(dela.fields.lat),
    num(dela.fields.lng),
  );
  return { nome, cor, texto: formatar(m), quando: haQuanto(dela.fields.atualizadoEm?.timestampValue) };
}

function coracao(w, tam) {
  const img = w.addImage(SFSymbol.named('heart.fill').image);
  img.imageSize = new Size(tam, tam);
  img.tintColor = Color.white();
  return img;
}

function construir(d) {
  const familia = config.widgetFamily || 'small';
  const w = new ListWidget();
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  w.url = LINK_DA_APP;

  const principal = d.erro ? '...' : d.texto;

  if (familia === 'accessoryInline') {
    w.addText(d.erro ? d.erro : `${d.nome} · ${d.texto}`);
    return w;
  }

  if (familia === 'accessoryCircular') {
    w.addAccessoryWidgetBackground = true;
    const s = w.addStack();
    s.layoutVertically();
    s.centerAlignContent();
    const l1 = s.addStack();
    l1.addSpacer();
    coracao(l1, 14);
    l1.addSpacer();
    s.addSpacer(2);
    const l2 = s.addStack();
    l2.addSpacer();
    const t = l2.addText(d.erro ? '...' : d.texto.replace(' ', ''));
    t.font = Font.boldRoundedSystemFont(13);
    t.minimumScaleFactor = 0.6;
    t.lineLimit = 1;
    l2.addSpacer();
    return w;
  }

  if (familia === 'accessoryRectangular') {
    const topo = w.addStack();
    topo.centerAlignContent();
    coracao(topo, 12);
    topo.addSpacer(4);
    const n = topo.addText(d.nome ?? 'Nós Dois');
    n.font = Font.semiboldRoundedSystemFont(13);
    const t = w.addText(principal);
    t.font = Font.boldRoundedSystemFont(22);
    t.minimumScaleFactor = 0.6;
    const q = w.addText(d.erro ?? d.quando ?? '');
    q.font = Font.systemFont(11);
    q.textOpacity = 0.7;
    return w;
  }

  // Ecrã principal: um pequeno letreiro de elétrico
  w.backgroundColor = LETREIRO;
  w.setPadding(14, 14, 14, 14);
  const topo = w.addStack();
  topo.centerAlignContent();
  const ponto = topo.addImage(SFSymbol.named('circle.fill').image);
  ponto.imageSize = new Size(10, 10);
  ponto.tintColor = d.cor ?? AMARELO;
  topo.addSpacer(6);
  const quem = topo.addText(d.nome ?? 'Nós Dois');
  quem.font = Font.semiboldRoundedSystemFont(13);
  quem.textColor = Color.white();
  quem.textOpacity = 0.85;
  w.addSpacer();
  const t = w.addText(principal);
  t.font = Font.heavySystemFont(34);
  t.textColor = AMARELO;
  t.minimumScaleFactor = 0.5;
  t.lineLimit = 1;
  const q = w.addText(d.erro ?? d.quando ?? '');
  q.font = Font.systemFont(11);
  q.textColor = Color.white();
  q.textOpacity = 0.6;
  return w;
}

let dados;
try {
  dados = await obterDados();
} catch (e) {
  console.error(e);
  dados = { erro: 'Sem ligação' };
}

const widget = construir(dados);
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Dentro da app: permite trocar de conta e mostra a pré-visualização
  if (Keychain.contains(CHAVE)) {
    const a = new Alert();
    a.title = 'Nós Dois';
    a.message = dados.erro ? dados.erro : `Estão a ${dados.texto}`;
    a.addAction('Ver widget');
    a.addDestructiveAction('Trocar de conta');
    a.addCancelAction('Fechar');
    const r = await a.presentAlert();
    if (r === 1) {
      Keychain.remove(CHAVE);
      await pedirCredenciais();
    } else if (r === 0) {
      await widget.presentSmall();
    }
  }
}
Script.complete();
