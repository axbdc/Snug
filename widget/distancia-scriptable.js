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

// Bonecos (macaco = azul, suricata = rosa). Versão a cores para o ecrã principal e a traço
// branco para o ecrã bloqueado, onde o iOS pinta tudo num só tom. Não é preciso mexer.
const BONECOS = {
  macaco: { cor: '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', linha: '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' },
  suricata: { cor: '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', linha: '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' },
};

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
  if (m < 150) return 'lado a lado';
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  if (m < 10000) return `${(m / 1000).toFixed(1).replace('.', ',')} km`;
  return `${Math.round(m / 1000).toLocaleString('pt-PT')} km`;
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

  // 2. Descobre a outra pessoa, as cores (para os bonecos) e a localização dela
  const perfis = await listar('perfis', token);
  const meu = perfis.find((p) => p.name.endsWith(`/${uid}`));
  const outro = perfis.find((p) => !p.name.endsWith(`/${uid}`));
  const minhaCor = meu?.fields.cor?.stringValue ?? 'azul';
  if (!outro) return { minhaCor, outraCor: minhaCor === 'azul' ? 'rosa' : 'azul', erro: 'Falta a outra pessoa' };
  const outroUid = outro.name.split('/').pop();
  const nome = outro.fields.nome?.stringValue ?? 'Par';
  const outraCor = outro.fields.cor?.stringValue ?? (minhaCor === 'azul' ? 'rosa' : 'azul');
  const base = { nome, minhaCor, outraCor };
  const dela = await lerDoc(`localizacoes/${outroUid}`, token);

  if (pausado) return { ...base, erro: 'Partilha desligada' };
  if (!dela || dela.fields.pausado?.booleanValue) return { ...base, erro: `${nome} em pausa` };

  const m = distancia(
    num(eu.fields.lat),
    num(eu.fields.lng),
    num(dela.fields.lat),
    num(dela.fields.lng),
  );
  return { ...base, metros: m, texto: formatar(m), quando: haQuanto(dela.fields.atualizadoEm?.timestampValue) };
}

// ---------- Desenho: os dois bonecos ligados por um tracejado com corações ----------

function boneco(cor, paleta = 'cor') {
  const b = cor === 'rosa' ? BONECOS.suricata : BONECOS.macaco;
  return Image.fromData(Data.fromBase64String(paleta === 'bloqueado' ? b.linha : b.cor));
}

function desenharCoracao(dc, cx, cy, tam, cor) {
  const w = tam;
  const h = tam * 0.9;
  const p = new Path();
  p.move(new Point(cx, cy + h * 0.45));
  p.addCurve(new Point(cx - w * 0.5, cy - h * 0.05), new Point(cx - w * 0.18, cy + h * 0.28), new Point(cx - w * 0.5, cy + h * 0.12));
  p.addCurve(new Point(cx, cy - h * 0.28), new Point(cx - w * 0.5, cy - h * 0.42), new Point(cx - w * 0.06, cy - h * 0.5));
  p.addCurve(new Point(cx + w * 0.5, cy - h * 0.05), new Point(cx + w * 0.06, cy - h * 0.5), new Point(cx + w * 0.5, cy - h * 0.42));
  p.addCurve(new Point(cx, cy + h * 0.45), new Point(cx + w * 0.5, cy + h * 0.12), new Point(cx + w * 0.18, cy + h * 0.28));
  p.closeSubpath();
  dc.addPath(p);
  dc.setFillColor(cor);
  dc.fillPath();
}

// paleta 'bloqueado': o iOS pinta tudo num só tom, por isso traço e corações a branco
function linhaBonecos(d, paleta) {
  const larg = 300;
  const alt = 80;
  const dc = new DrawContext();
  dc.size = new Size(larg, alt);
  dc.opaque = false;
  dc.respectScreenScale = true;
  const juntos = d.metros != null && d.metros < 150;
  const xEu = juntos ? larg / 2 - alt + 6 : 0;
  const xOutro = juntos ? larg / 2 - 6 : larg - alt;
  const corTraco = paleta === 'bloqueado' ? Color.white() : new Color('#ffffff', 0.55);

  if (!juntos) {
    dc.setFillColor(corTraco);
    for (let x = alt + 4; x < larg - alt - 6; x += 12) {
      if (Math.abs(x + 3 - larg / 2) < 28) continue;
      dc.fillRect(new Rect(x, alt / 2 - 1.5, 6, 3));
    }
  }
  dc.drawImageInRect(boneco(d.minhaCor, paleta), new Rect(xEu, 0, alt, alt));
  dc.drawImageInRect(boneco(d.outraCor, paleta), new Rect(xOutro, 0, alt, alt));

  const cyCor = juntos ? 12 : alt / 2;
  const c1 = paleta === 'bloqueado' ? Color.white() : d.minhaCor === 'rosa' ? ROSA : AZUL;
  const c2 = paleta === 'bloqueado' ? new Color('#ffffff', 0.8) : d.outraCor === 'rosa' ? ROSA : AZUL;
  desenharCoracao(dc, larg / 2 - 7, cyCor + 2, 26, c1);
  desenharCoracao(dc, larg / 2 + 9, cyCor - 4, 20, c2);
  return dc.getImage();
}

function construir(d) {
  const familia = config.widgetFamily || 'small';
  const w = new ListWidget();
  w.refreshAfterDate = new Date(Date.now() + 15 * 60 * 1000);
  w.url = LINK_DA_APP;
  const frase = d.erro ? d.erro : `A nossa distância: ${d.texto}`;

  if (familia === 'accessoryInline') {
    w.addText(frase);
    return w;
  }

  if (familia === 'accessoryCircular') {
    w.addAccessoryWidgetBackground = true;
    const s = w.addStack();
    s.layoutVertically();
    const l1 = s.addStack();
    l1.addSpacer();
    const img = l1.addImage(boneco(d.outraCor, 'bloqueado'));
    img.imageSize = new Size(34, 34);
    l1.addSpacer();
    const l2 = s.addStack();
    l2.addSpacer();
    const t = l2.addText(d.erro ? '...' : d.texto);
    t.font = Font.boldRoundedSystemFont(12);
    t.minimumScaleFactor = 0.6;
    t.lineLimit = 1;
    l2.addSpacer();
    return w;
  }

  if (familia === 'accessoryRectangular') {
    const t = w.addText(frase);
    t.font = Font.semiboldRoundedSystemFont(13);
    t.minimumScaleFactor = 0.7;
    t.lineLimit = 1;
    w.addSpacer(4);
    const img = w.addImage(linhaBonecos(d, 'bloqueado'));
    img.imageSize = new Size(150, 40);
    return w;
  }

  // Ecrã principal: um pequeno letreiro de elétrico com os bonecos em baixo
  w.backgroundColor = LETREIRO;
  w.setPadding(14, 14, 12, 14);
  const rot = w.addText(d.erro ? d.erro : 'A nossa distância');
  rot.font = Font.semiboldRoundedSystemFont(13);
  rot.textColor = Color.white();
  rot.textOpacity = 0.85;
  const t = w.addText(d.erro ? '...' : d.texto);
  t.font = Font.heavySystemFont(32);
  t.textColor = AMARELO;
  t.minimumScaleFactor = 0.5;
  t.lineLimit = 1;
  w.addSpacer();
  const img = w.addImage(linhaBonecos(d, 'cor'));
  img.imageSize = new Size(130, 35);
  img.centerAlignImage();
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
