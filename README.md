# Test de Velocidad

App web para medir la velocidad de internet móvil (ping + descarga) y mostrar para qué alcanza la conexión (WhatsApp, YouTube, Zoom, Netflix, etc.). Diseñado para ferias escolares: los visitantes prueban desde su celular con datos móviles.

## Stack
- Next.js (App Router) + JavaScript + Tailwind CSS
- Deploy en Vercel

## Desarrollo

```bash
npm install
npm run build
npm start          # probar en producción local (NO npm run dev para medir)
```

## Deploy

```bash
npx vercel
```

## Estructura del código (5 archivos)

| Archivo | Qué hace |
|---------|----------|
| `app/layout.jsx` | Metadata, fuentes, `<html lang="es">` |
| `app/page.jsx` | UI completa: estados, medición en vivo, resultados |
| `app/api/ping/route.js` | Endpoint ping (200 OK vacío, sin caché) |
| `app/api/download/route.js` | Endpoint 1 MB aleatorio (incompresible, sin caché) |
| `lib/medidor.js` | Algoritmos: ping (promedia 4 de 5), descarga adaptativa (~2.5s, máx 5 MB) |

## Documentación
- [`explicacion-codigo.md`](explicacion-codigo.md) — explicación línea por línea para cualquiera
- [`proyecto-estructurado.md`](proyecto-estructurado.md) — resumen técnico y flujo de trabajo