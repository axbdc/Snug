export function hojeISO() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function paraData(v: any): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  if (typeof v.toDate === 'function') return v.toDate();
  if (typeof v === 'string' || typeof v === 'number') return new Date(v);
  return null;
}

export function haQuanto(v: any) {
  const d = paraData(v);
  if (!d) return 'sem dados';
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'agora mesmo';
  const m = Math.round(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.round(h / 24);
  return dias === 1 ? 'ontem' : `há ${dias} dias`;
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function dataBonita(iso: string) {
  const [a, m, d] = iso.split('-').map(Number);
  return { dia: String(d), mes: MESES[m - 1], ano: String(a) };
}
