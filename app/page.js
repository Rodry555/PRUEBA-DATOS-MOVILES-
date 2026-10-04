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

// Mínimo garantizado por tecnología (documento de contexto del proyecto)
const TECNOLOGIAS = [
  { id: '2g', nombre: '2G',     minimo: 0.01 },  // ~10 kbps
  { id: '3g', nombre: '3.5G',   minimo: 0.05 },  // ~50 kbps
  { id: '4g', nombre: '4G LTE', minimo: 0.1  },  // ~100 kbps
];

// Escalera de referencia: del papel contractual al estándar internacional
const PELDANOS = [
  { nombre: 'Mínimo contractual 4G (Bolivia)',  mbps: 0.1 },
  { nombre: 'Banda ancha móvil (ATT, Bolivia)', mbps: 4 },
  { nombre: 'Estándar internacional de referencia (FCC)', mbps: 25 },
  { nombre: 'Promedio mundial de internet móvil (Ookla)', mbps: 50 },
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
  const [tecnologia, setTecnologia] = useState('4g');
  const [openUsos, setOpenUsos] = useState(false);
  const [openEscalera, setOpenEscalera] = useState(false);

  const ocupado = estado === 'ping' || estado === 'descarga';
  const usosAlcanzados =
    mbps !== null && !enVivo ? USOS.filter((u) => u.mbps <= mbps) : null;

  const tec = TECNOLOGIAS.find((t) => t.id === tecnologia);
  const fmt = (v) => (v >= 1 ? `${v.toFixed(1)} Mbps` : `${Math.round(v * 1000)} kbps`);

  // Veredicto vs mínimo contractual de la tecnología elegida
  const veredicto =
    mbps !== null && !enVivo
      ? mbps >= tec.minimo
        ? {
            ok: true,
            texto: `✓ Cumple el mínimo garantizado de ${tec.nombre} (${fmt(tec.minimo)}) — lo supera ${Math.floor(mbps / tec.minimo)} veces`,
          }
        : {
            ok: false,
            texto: `✗ No cumple el mínimo garantizado de ${tec.nombre}: faltan ${fmt(tec.minimo - mbps)}`,
          }
      : null;

  // Semáforo de 3 zonas
  const nivel =
    mbps === null || enVivo
      ? null
      : mbps >= 25
      ? { color: 'text-emerald-400', texto: 'Supera el estándar internacional de referencia (25 Mbps, FCC)' }
      : mbps >= 4
      ? {
          color: 'text-amber-400',
          texto: 'Es banda ancha en Bolivia, pero queda por debajo del estándar internacional de referencia (25 Mbps, FCC)',
        }
      : { color: 'text-red-400', texto: 'No alcanza el umbral de banda ancha móvil (4 Mbps, ATT)' };

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

      <label htmlFor="tech-select" className="text-sm text-zinc-400 flex flex-col sm:flex-row items-center gap-2">
        Tecnología de tu señal:{' '}
        <select
          id="tech-select"
          value={tecnologia}
          onChange={(e) => setTecnologia(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5"
        >
          {TECNOLOGIAS.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </label>

      <button
        onClick={iniciar}
        disabled={ocupado}
        className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 font-medium"
      >
        {ocupado ? 'Midiendo…' : 'Iniciar prueba'}
      </button>

      {consumo !== null && !enVivo && (
        <p className="text-xs text-zinc-500 text-center w-full max-w-sm">
          Esta prueba consumió ~{consumo.toFixed(1)} MB de datos
        </p>
      )}

      {nivel && (
        <p className={`text-sm ${nivel.color} text-center`}>{nivel.texto}</p>
      )}

      {veredicto && (
        <p className={`text-sm ${veredicto.ok ? 'text-emerald-400' : 'text-red-400'} text-center`}>
          {veredicto.texto}
        </p>
      )}

      {usosAlcanzados && usosAlcanzados.length > 0 && (
        <Acordeon
          titulo={`Tu velocidad alcanza para: (${usosAlcanzados.length})`}
          estaAbierto={openUsos}
          alToggle={() => setOpenUsos(!openUsos)}
        >
          <ul className="text-sm text-zinc-300 space-y-1">
            {usosAlcanzados.map((u) => (
              <li key={u.nombre}>✓ {u.nombre}</li>
            ))}
          </ul>
        </Acordeon>
      )}

      {mbps !== null && !enVivo && (
        <Acordeon
          titulo="Cómo se compara tu velocidad:"
          estaAbierto={openEscalera}
          alToggle={() => setOpenEscalera(!openEscalera)}
        >
          <ul className="text-sm space-y-1">
            {PELDANOS.map((p) => (
              <li key={p.nombre} className={p.mbps <= mbps ? 'text-emerald-400' : 'text-red-400'}>
                {p.mbps <= mbps ? '✓' : '✗'} {p.nombre} — {fmt(p.mbps)}
              </li>
            ))}
          </ul>
        </Acordeon>
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

function Acordeon({ titulo, children, estaAbierto, alToggle }) {
  return (
    <div className="w-full max-w-sm border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
      <button
        onClick={alToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-zinc-800/50 transition-colors"
        aria-expanded={estaAbierto}
      >
        <h2 className="text-sm font-medium text-zinc-400">{titulo}</h2>
        <svg
          className="w-4 h-4 text-zinc-500 transition-transform duration-300 ease-out"
          style={{ transform: estaAbierto ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: estaAbierto ? '500px' : '0px', opacity: estaAbierto ? 1 : 0 }}
      >
        <div className="px-3 pb-3">{children}</div>
      </div>
    </div>
  );
}