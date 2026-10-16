# Nós Dois

Webapp para dois: sorteio de dates, sítios com mapa, momentos com fotos e notas, e a distância entre vocês (também num widget no ecrã bloqueado do iPhone).

Cada pessoa tem a sua cor: azul de azulejo ou rosa da Rua Cor-de-Rosa. A app inteira muda de tema conforme quem entra; o amarelo do elétrico é a cor partilhada. O sorteio funciona como um letreiro de elétrico que folheia até parar no destino, os momentos aparecem como fotografias impressas e a distância é uma linha de elétrico entre os dois.

**Stack:** React 19 + Vite + TypeScript, Firebase (Auth + Firestore), Framer Motion, Leaflet. Fontes Big Shoulders Display e Schibsted Grotesk, empacotadas com a app (funcionam offline). Tudo cabe no plano grátis do Firebase.

---

## 1. Criar o projeto Firebase (10 min)

1. Vai a [console.firebase.google.com](https://console.firebase.google.com) e cria um projeto `nos-dois` (podes desligar o Analytics).
2. **Authentication** > *Get started* > *Sign-in method* > ativa **Email/Password**.
3. **Authentication** > *Users* > *Add user*: cria a tua conta e a da Marta. Copia o **User UID** de cada um.
4. **Firestore Database** > *Create database* > localização `europe-southwest1 (Madrid)` > modo produção.
5. **Firestore** > separador *Rules*: cola o conteúdo de `firestore.rules`, troca `UID_DO_ALEX` e `UID_DA_MARTA` pelos UIDs do passo 3 e carrega em *Publish*.
6. **Definições do projeto** (roda dentada) > *As tuas apps* > ícone `</>` > regista a app web. Copia os valores de `firebaseConfig`.

## 2. Correr no computador

```powershell
copy .env.example .env.local
# preenche o .env.local com apiKey, authDomain, projectId e appId
npm install
npm run dev
```

Abre o endereço que aparece no terminal.

## 3. Publicar no Vercel

1. Faz push do projeto para um repositório no GitHub (o `.env.local` fica de fora pelo `.gitignore`).
2. No Vercel: *Add New Project* > importa o repositório. O Vite é detetado sozinho.
3. Em *Environment Variables* adiciona as variáveis `VITE_FIREBASE_...` (ver `.env.example`) com os mesmos valores do `.env.local`.
4. *Deploy*.
5. No Firebase: **Authentication** > *Settings* > *Authorized domains* > adiciona o domínio do Vercel.

## 4. Instalar nos iPhones

1. Abre o link do Vercel no **Safari**.
2. Botão Partilhar > **Adicionar ao ecrã principal**. Fica com ícone e abre em ecrã inteiro, como uma app.
3. Entra com o teu email e password, escreve o nome e escolhe a cor.
4. No separador **Sorteio**, carrega em *Carregar ideias* (49 ideias de Lisboa e arredores).
5. No separador **Nós**, liga *Partilhar a minha localização* e aceita o pedido do iPhone.

## 5. Widget no ecrã bloqueado

Uma webapp não consegue criar widgets no iOS, por isso o widget usa a app grátis **Scriptable**, que lê os mesmos dados do Firebase.

1. Instala o **Scriptable** da App Store.
2. No Safari do iPhone, abre `https://snug-six.vercel.app/widget.txt`. É o script já preenchido com os dados do Firebase e o link da app: a Vercel gera-o em cada deploy a partir das variáveis de ambiente, por isso as chaves não ficam no GitHub.
3. Seleciona tudo, copia, e no Scriptable toca em `+`, cola e dá-lhe o nome `Nós Dois`.
4. Corre o script uma vez (botão play). Pede o email e a password (ficam guardados no Keychain do iPhone, não no script).
5. Quando pedir localização, escolhe **Ao usar a app ou widgets**.
6. Ecrã bloqueado: mantém pressionado > *Personalizar* > *Ecrã bloqueado* > toca na zona dos widgets > **Scriptable** > escolhe o formato (retangular é o que mostra mais) > toca no widget > *Script*: `Nós Dois`.

O widget mostra "A nossa distância" e os vossos bonecos (macaco e suricata) ligados por corações. No ecrã bloqueado o iOS pinta-o no tom do teu fundo; no ecrã principal aparece a cores, como um pequeno letreiro de elétrico.

Cada um faz isto no seu iPhone, com a sua própria conta.

### Como a distância se mantém atualizada

- Com a app aberta: atualiza ao abrir e de 5 em 5 minutos.
- Com o widget: o próprio widget envia a tua localização sempre que o iOS o atualiza (normalmente a cada 15 a 30 minutos; o iOS decide, não dá para forçar).
- Se alguém desligar a partilha na app, o widget também deixa de enviar.

## Estrutura

```
src/
  App.tsx                 navegação entre separadores e ecrãs de entrada
  sessao.tsx              utilizador, perfis, tema e celebração
  ecras/                  Sorteio, Sitios, Momentos, Nos, Entrar, Configurar
  componentes/            folhas, mapa, formulários, controlos animados
  lib/                    filtros do sorteio, geo, fotos, localização
  data/                   ideias de Lisboa (seed) e coordenadas
widget/distancia-scriptable.js
firestore.rules
```

### Dados no Firestore

| Coleção | O que guarda |
|---|---|
| `perfis/{uid}` | nome e cor de cada um |
| `ideias/{id}` | sítios e ideias do sorteio, estado (por fazer, planeado, feito), favorito, estrelas de cada um |
| `momentos/{id}` | dates feitos, data, notas de cada um |
| `fotos/{id}` | fotos comprimidas no browser (até ~750 KB cada) |
| `localizacoes/{uid}` | última posição de cada um e se a partilha está em pausa |

As fotos vão para o Firestore em vez do Firebase Storage porque o Storage agora obriga ao plano pago.

## Pré-visualização sem Firebase

Para mexer no design sem ligar nada, com `npm run dev` abre:

```
/preview.html?ecra=sorteio&tema=rosa
```

`ecra` pode ser `sorteio`, `sitios`, `momentos`, `nos` ou `entrar`; `tema` pode ser `azul` ou `rosa`. Usa dados de exemplo e não grava nada.
