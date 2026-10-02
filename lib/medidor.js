export const MAX_BLOQUES = 5;
const TIEMPO_OBJETIVO = 2500;

// ===== Ping =====
// 5 peticiones; la PRIMERA se descarta (incluye apertura de conexión TCP/TLS
// y dispara el promedio). Se devuelven promedio y min/max de las 4 útiles.
export async function medirPing(intentos = 5) {
  const muestras = [];
  for (let i = 0; i < intentos; i++) {
    const t0 = performance.now();
    await fetch(`/api/ping?t=${Date.now()}`, { cache: 'no-store' });
    muestras.push(performance.now() - t0);
  }
  const utiles = muestras.slice(1);
  return {
    ping: utiles.reduce((a, b) => a + b, 0) / utiles.length,
    min: Math.min(...utiles),
    max: Math.max(...utiles),
    muestras,
  };
}

// ===== Descarga adaptativa =====
// 1) Bloque de calentamiento: se descarta (TCP arranca lento — slow start).
// 2) Bloques de 1 MB hasta llenar la ventana de tiempo o llegar al tope.
//    Garantía: siempre se mide AL MENOS 1 bloque, aunque el calentamiento
//    ya haya consumido el tiempo objetivo (conexión muy lenta).
// La condición del while usa t0 (inicio total): en conexiones muy lentas la
// prueba SE ACORTA sola midiendo un solo bloque. Es intencional, no un bug.
export async function medirDescarga(enProgreso) {
  const t0 = performance.now();

  enProgreso?.({ fase: 'calentamiento', bloques: 0, mbpsEnVivo: null });
  const bytesCalentamiento = await descargarBloque();

  const tMedicion = performance.now();
  let bytesMedidos = 0;
  let bloques = 0;

  while (
    bloques < MAX_BLOQUES &&
    (bloques === 0 || performance.now() - t0 < TIEMPO_OBJETIVO)
  ) {
    bytesMedidos += await descargarBloque();
    bloques++;
    const seg = (performance.now() - tMedicion) / 1000;
    enProgreso?.({
      fase: 'medicion',
      bloques,
      mbpsEnVivo: (bytesMedidos * 8) / 1_000_000 / seg,
    });
  }

  const seg = (performance.now() - tMedicion) / 1000;
  const mbps = (bytesMedidos * 8) / 1_000_000 / seg;
  return {
    mbps,
    mbPorSeg: mbps / 8,
    segundos: seg,
    megasConsumidos: (bytesCalentamiento + bytesMedidos) / (1024 * 1024),
  };
}

async function descargarBloque() {
  const res = await fetch(`/api/download?t=${Date.now()}`, { cache: 'no-store' });
  const lector = res.body.getReader();
  let bytes = 0;
  while (true) {
    const { done, value } = await lector.read();
    if (done) break;
    bytes += value.byteLength;
  }
  return bytes;
}