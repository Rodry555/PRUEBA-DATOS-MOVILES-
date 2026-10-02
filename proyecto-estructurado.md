# Estructura del Proyecto — medidor-velocidad

## Stack tecnológico
- **Next.js 16.3.8** (App Router)
- **React 19.2.8**
- **Tailwind CSS v4**
- **ESLint 9** (flat config)
- **Node.js** (runtime)
- **Vercel** (deploy)

---

## 🎯 TU CÓDIGO — 5 archivos (lo que modificás)

| Archivo | Qué hace |
|---------|----------|
| `app/layout.js` | Metadata, fuentes Geist, `<html lang="es">`, importa globals.css |
| `app/page.js` | UI completa: estados, medición en vivo, tarjetas, lista de usos, botón |
| `app/api/ping/route.js` | Endpoint ping (200 OK, sin body, `force-dynamic`, `no-store`) |
| `app/api/download/route.js` | Endpoint 1MB aleatorio (`randomBytes`), `force-dynamic`, `no-store` |
| `lib/medidor.js` | Algoritmos: `medirPing()`, `medirDescarga()`, `descargarBloque()`, constantes |

**Total: ~260 líneas JavaScript puro** 

---

## ⚙️ INSTALACIÓN FRAMEWORK — Todo lo demás (no tocar) No es necesario explicar el codigo sobre estos archivos ya que son generados por instalaciones externas librerias etcs

Generados por `create-next-app` y `npm install`. Se regeneran solos.

```
package.json, package-lock.json
next.config.mjs, eslint.config.mjs
postcss.config.mjs, jsconfig.json
.gitignore, README.md
app/globals.css
node_modules/          ← 291 paquetes (~100MB)
.next/                 ← build compilado
.atl/                  ← cache externo
```

---

## Resumen rápido

```
medidor-velocidad/
├── 🎯 TU CÓDIGO (5 archivos)
│   ├── app/layout.js
│   ├── app/page.js
│   ├── app/api/ping/route.js
│   ├── app/api/download/route.js
│   └── lib/medidor.js
│
└── ⚙️ INSTALACIÓN FRAMEWORK (todo lo demás — no editar a mano)
```

---
