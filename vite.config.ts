import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

/**
 * Gera /widget.txt no build: o script do widget (Scriptable) já preenchido com os dados
 * do Firebase e o link da app. Assim as chaves ficam só nas variáveis da Vercel, não no GitHub.
 * No iPhone basta abrir <link da app>/widget.txt, copiar tudo e colar no Scriptable.
 */
function widgetPreenchido(env: Record<string, string>): Plugin {
  return {
    name: 'widget-preenchido',
    apply: 'build',
    generateBundle() {
      const apiKey = env.VITE_FIREBASE_API_KEY || env.VITE_FB_API_KEY;
      const projectId = env.VITE_FIREBASE_PROJECT_ID || env.VITE_FB_PROJECT_ID;
      if (!apiKey || !projectId) return;
      const dominio = env.VERCEL_PROJECT_PRODUCTION_URL || 'snug-six.vercel.app';
      const script = readFileSync('widget/distancia-scriptable.js', 'utf8')
        .replace("'COLA_AQUI_A_API_KEY'", JSON.stringify(apiKey).replace(/"/g, "'"))
        .replace("'COLA_AQUI_O_PROJECT_ID'", JSON.stringify(projectId).replace(/"/g, "'"))
        .replace("'https://COLA_AQUI_O_LINK_DA_APP.vercel.app'", `'https://${dominio}'`);
      this.emitFile({ type: 'asset', fileName: 'widget.txt', source: script });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') } as Record<string, string>;
  return {
    plugins: [react(), widgetPreenchido(env)],
    build: {
      chunkSizeWarningLimit: 1500,
    },
  };
});
