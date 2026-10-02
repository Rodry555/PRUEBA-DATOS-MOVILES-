'use client';
import { useState } from 'react';
import { medirPing, medirDescarga, MAX_BLOQUES } from '@/lib/medidor';

const USOS = [
  { nombre: 'WhatsApp y navegación web', mbps: 0.5 },
  { nombre: 'YouTube calidad SD',        mbps: 1.5 },
  { nombre: 'Videollamada (Zoom/Meet)',  mbps: 3 },
  { nombre: 'YouTube / Netflix en HD',   mbps: 5 },
  { nombre: 'Netflix en 4K',             mbps: 25 },
];

const TEXTO_ESTADO = {
  inactivo: 'Listo para medir',
  ping: 'Midiendo latencia…',
  descarga: 'Midiendo descarga…',
  listo: 'Prueba completada',
  error: 'Error de conexión. Intenta de nuevo.',
};

export default function Pagina() {
  const [estado, setEstado] = useState('inactivo');
  const [ping, setPing] = useState(null);
  const [rangoPing, setRangoPing] = useState(null);
  const [mbps, setMbps] = useState(null);
  const [consumo, setConsumo] = useState(null);
  const [bloques, setBloques] = useState(0);
  const [enVivo, setEnVivo] = useState(false);

  const ocupado = estado === 'ping' || estado === 'descarga';
  const usosAlcanzados =
    mbps !== null && !enVivo ? USOS.filter((u) => u.mbps <= mbps) : null;

  async function iniciar() {
    setPing(null); setRangoPing(null); setMbps(null);
    setConsumo(null); setBloques(0);
    try {
      setEstado('ping');
      const { ping: p, min, max } = await medirPing(5);
      setPing(p);
      setRangoPing({ min, max });

      setEstado('descarga');
      setEnVivo(true);
      const r = await medirDescarga((info) => {
        if (info.fase === 'medicion') {
          setBloques(info.bloques);
          setMbps(info.mbpsEnVivo);
        }
      });
      setMbps(r.mbps);
      setConsumo(r.megasConsumidos);
      setEstado('listo');
    } catch {
      setEstado('error');
    } finally {
      setEnVivo(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-zinc-950 py-8 border-b-2 border-zinc-800 shadow-xl text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          Universidad Pública de El Alto
        </p>
        <h1 className="text-4xl font-[var(--font-playfair)] font-medium mt-2 tracking-tight text-blue-200">
          Test de Velocidad
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Mide tu internet móvil y descubre para qué te alcanza
        </p>
      </header>

      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent w-full max-w-2xl mx-auto" />

      <main className="flex-1 flex flex-col items-center justify-start gap-6 p-6 pt-16">
        <p className="text-zinc-400">{TEXTO_ESTADO[estado]}</p>

      <p className="text-7xl font-bold tabular-nums">
        {mbps === null ? '--' : mbps.toFixed(1)}
        <span className="text-2xl font-normal text-zinc-400"> Mbps</span>
      </p>

      <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all"
          style={{ width: `${(bloques / MAX_BLOQUES) * 100}%` }}
        />
      </div>

      <div className="flex gap-4">
        <Tarjeta
          titulo="Ping"
          valor={ping === null ? '--' : Math.round(ping)}
          unidad="ms"
          detalle={rangoPing ? `entre ${Math.round(rangoPing.min)} y ${Math.round(rangoPing.max)} ms` : null}
        />
        <Tarjeta titulo="Descarga" valor={mbps === null ? '--' : mbps.toFixed(1)} unidad="Mbps" />
        <Tarjeta titulo="Archivos" valor={mbps === null ? '--' : (mbps / 8).toFixed(2)} unidad="MB/s" />
      </div>

      <button
        onClick={iniciar}
        disabled={ocupado}
        className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-medium"
      >
        {ocupado ? 'Midiendo…' : 'Iniciar prueba'}
      </button>

      {consumo !== null && (
        <p className="text-xs text-zinc-500">
          Esta prueba consumió ~{consumo.toFixed(1)} MB de datos
        </p>
      )}

{usosAlcanzados && usosAlcanzados.length > 0 && (
          <section className="w-full max-w-sm">
            <h2 className="text-sm text-zinc-500 mb-2">Tu velocidad alcanza para:</h2>
            <ul className="text-sm text-zinc-300 space-y-1">
              {usosAlcanzados.map((u) => (
                <li key={u.nombre}>✓ {u.nombre}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function Tarjeta({ titulo, valor, unidad, detalle }) {
  return (
    <div className="bg-zinc-900 rounded-xl px-6 py-4 text-center">
      <p className="text-xs uppercase text-zinc-400">{titulo}</p>
      <p className="text-2xl font-semibold tabular-nums">
        {valor} <span className="text-sm text-zinc-400">{unidad}</span>
      </p>
      {detalle && <p className="text-xs text-zinc-500 mt-1">{detalle}</p>}
    </div>
  );
}