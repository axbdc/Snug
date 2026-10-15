import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import type { Ideia } from '../tipos';

const icones: Record<string, L.DivIcon> = {};
function icone(classe: string) {
  if (!icones[classe]) {
    icones[classe] = L.divIcon({
      className: '',
      html: `<div class="pin ${classe}"></div>`,
      iconSize: [22, 22],
      iconAnchor: [11, 22],
    });
  }
  return icones[classe];
}

function Enquadrar({ pontos }: { pontos: [number, number][] }) {
  const mapa = useMap();
  useEffect(() => {
    mapa.attributionControl.setPrefix(false);
    if (pontos.length > 1) mapa.fitBounds(pontos, { padding: [40, 40], maxZoom: 13 });
    else if (pontos.length === 1) mapa.setView(pontos[0], 13);
    // só ao montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function MapaSitios({ ideias, onAbrir }: { ideias: Ideia[]; onAbrir: (i: Ideia) => void }) {
  const comCoords = useMemo(() => ideias.filter((i) => i.lat != null && i.lng != null), [ideias]);
  const pontos = comCoords.map((i) => [i.lat!, i.lng!] as [number, number]);

  return (
    <>
      <div className="legenda">
        <span>
          <i style={{ background: 'var(--cor)' }} />
          Por fazer
        </span>
        <span>
          <i style={{ background: 'var(--amarelo)' }} />
          Planeado
        </span>
        <span>
          <i style={{ background: 'var(--verde)' }} />
          Feito
        </span>
        <span>
          <i style={{ background: 'var(--tinta)', boxShadow: 'inset 0 0 0 2px var(--amarelo)' }} />
          Favorito
        </span>
      </div>
      <div className="mapa">
        <MapContainer center={[38.72, -9.14]} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Enquadrar pontos={pontos} />
          {comCoords.map((i) => (
            <Marker
              key={i.id}
              position={[i.lat!, i.lng!]}
              icon={icone(i.favorito ? 'pin-favorito' : `pin-${i.estado}`)}
              eventHandlers={{ click: () => onAbrir(i) }}
            />
          ))}
        </MapContainer>
      </div>
    </>
  );
}
