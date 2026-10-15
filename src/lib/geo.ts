/** Distância em metros entre dois pontos (fórmula de Haversine). */
export function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function formatarDistancia(m: number) {
  if (m < 1000) return { valor: String(Math.round(m / 10) * 10), unidade: 'm' };
  if (m < 10000) return { valor: (m / 1000).toFixed(1).replace('.', ','), unidade: 'km' };
  return { valor: String(Math.round(m / 1000)), unidade: 'km' };
}

/** Tenta tirar coordenadas de um link do Google Maps ou Apple Maps. */
export function coordsDoLink(link: string): { lat: number; lng: number } | null {
  if (!link) return null;
  const padroes = [
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&](?:q|ll|query|sll|daddr|destination)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
  ];
  for (const p of padroes) {
    const m = link.match(p);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

export function linkMapas(titulo: string, lat?: number | null, lng?: number | null, link?: string) {
  if (link) return link;
  if (lat != null && lng != null) {
    return `https://maps.apple.com/?q=${encodeURIComponent(titulo)}&ll=${lat},${lng}`;
  }
  return `https://maps.apple.com/?q=${encodeURIComponent(titulo)}`;
}

export function posicaoAtual(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Sem geolocalização'));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}
