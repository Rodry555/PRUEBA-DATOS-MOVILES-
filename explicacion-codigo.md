# Explicación de cada archivo — para cualquiera que lo lea

Este documento explica qué hace cada uno de los 5 archivos que son **tu código**

---

## 1. app/layout.js — "La plantilla maestra de toda la web"

**Qué es:** El esqueleto que envuelve a todas las páginas. Todo lo que pongas acá aparece en **cada** pantalla de la aplicación.

**Qué hace concretamente:**
- **Título de la pestaña del navegador:** "Test de Velocidad" — lo que ves arriba en la pestaña de Chrome/Safari
- **Descripción para Google/buscadores:** "Mide la velocidad de tu conexión móvil (ping y descarga) y descubre para qué te alcanza"
- **Idioma:** Fuerza que la página sea en español (`lang="es"`) — importante para lectores de pantalla y SEO
- **Fuentes (tipografías):** Carga dos fuentes de Google Fonts (Geist y Geist Mono) que se ven bien en pantallas chicas y grandes
- **Estilos globales:** Importa `globals.css` que trae Tailwind CSS (el sistema de estilos)

**Cuándo tocarlo:**
- Si querés cambiar el título que sale en la pestaña del navegador
- Si querés cambiar la descripción para buscadores
- Si querés usar otras fuentes

---

## 2. app/page.js — "La pantalla principal, lo que ve y toca la gente"

**Qué es:** La página de inicio. Es **el único archivo con interfaz visual** — botones, números, tarjetas, textos, barra de progreso.

**Qué hace concretamente (paso a paso):**

### Estados de la prueba 
La página tiene 5 "estados de ánimo":
1. **Inactivo** — recién entraste, todo quieto, dice "Listo para medir"
2. **Midiendo ping** — dice "Midiendo latencia…", la barra quieta
3. **Midiendo descarga** — el número grande sube en vivo, la barra avanza, dice "Midiendo descarga…"
4. **Listo** — prueba terminada, número fijo, muestra "Tu velocidad alcanza para:" con checks verdes
5. **Error** — algo falló (sin internet, servidor caído), dice "Error de conexión. Intenta de nuevo."

### Lo que ves en pantalla (de arriba a abajo)
1. **Encabezado fijo** (se queda arriba al hacer scroll):
   - "Universidad Pública de El Alto" en chiquito
   - "Test de Velocidad" grande en azul
   - "Mide tu internet móvil y descubre para qué te alcanza"

2. **Texto de estado** — dice en qué fase está la prueba

3. **NÚMERO GIGANTE** — el protagonista: los Mbps en vivo mientras mide, o el resultado final fijo
   - Ejemplo: `47.3 Mbps` (mide descarga)
   - Al lado chiquito: "Mbps"

4. **Barra de progreso** — una linea azul que se llena de a poco
   - Cada tramo = 1 bloque de 1 MB descargado
   - Máximo 5 tramos (5 MB de medición)

5. **3 Tarjetas con resultados:**
   - **Ping:** ej. `28 ms` + detalle "entre 24 y 32 ms"
   - **Descarga:** ej. `47.3 Mbps`
   - **Archivos:** ej. `5.91 MB/s` (es lo mismo que Mbps pero en megabytes/segundo, para bajar archivos)

6. **Botón "Iniciar prueba"** / "Midiendo…"
   - Se desactiva solo mientras mide (no podés apretar dos veces)
   - Vuelve a activar solo al terminar o si hay error

7. **Mensaje de consumo** — "Esta prueba consumió ~3.2 MB de datos" (para que el usuario sepa cuánto gastó de su plan)

8. **Lista "Tu velocidad alcanza para:"** — checks verdes según tu Mbps:
   - ✓ WhatsApp y navegación web (0.5 Mbps)
   - ✓ YouTube calidad SD (1.5 Mbps)
   - etc etc aqui hay q agregar lo que creas interesante para mostrar al que este usando este sitio web 

**Cómo funciona por debajo:**
- Cuando apretás "Iniciar prueba", llama a `medirPing()` (archivo `lib/medidor.js`)
- Después llama a `medirDescarga()` que le va pasando datos en vivo
- La página actualiza el número y la barra **mientras** baja los datos (no al final)
- Si algo falla en el medio, agarra el error y muestra pantalla de error

**Cuándo tocarlo:**
- Cambiar textos, colores, tamaños, fuentes (usá clases Tailwind como `text-blue-600`, `bg-zinc-900`)
- Agregar/sacar usos de la lista (el array `USOS` al principio del archivo)
- Cambiar la lógica de estados (pero ojo: si rompés los estados, la prueba no anda)
- Cambiar cómo se ve el número gigante, la barra, las tarjetas

---

## 3. app/api/ping/route.js "

**Qué es:** Una **URL interna** que la página llama para medir latencia (ping). No la visita el usuario directo, la llama el JavaScript de `page.js`.

**Qué hace concretamente:**
- Recibe un pedido (GET)
- Responde **inmediatamente** con un "200 OK" **sin cuerpo** (vacío, cero bytes)
- Headers importantes:
  - `Cache-Control: no-store` — **prohíbe** que guarde la respuesta en caché (ni el navegador, ni el CDN, ni el operador)
  - `dynamic = 'force-dynamic'` — le dice a Next.js: "nunca hagas esto estático, corré el código SIEMPRE"

**Por qué existe:**
Para medir ping hacés: "¿cuánto tarda en ir un pedido y volver la respuesta vacía?".
- El tiempo = latencia (ping)
- Si la respuesta pesara algo, sumaría tiempo de descarga y mentiría el ping
- Si se cacheara, la segunda vez respondería instantáneo (de memoria) y mentiría

**Cuándo tocarlo:**
- Casi **nunca**. dice exactamente cómo debe ser.
- Solo si el servidor donde desplegas (Vercel) necesita algo especial en headers.

---

## 4. app/api/download/route.js"

**Qué es:** Otra **URL interna** que la página llama repetidamente para bajar datos y medir velocidad de descarga.

**Qué hace concretamente:**
- Genera **1 MB (1,048,576 bytes) de datos ALEATORIOS** al arrancar el servidor (una sola vez, en memoria)
- Cuando le piden datos, suelta ese 1 MB completo
- Headers importantes:
  - `Content-Type: application/octet-stream` — "esto es datos binarios, no texto, no HTML"
  - `Content-Length: 1048576` — avisa exactamente cuántos bytes vienen
  - `Cache-Control: no-store` — **prohíbe caché** (crítico: si cachea, la 2da vez baja de memoria, no de internet)
  - `dynamic = 'force-dynamic'` — nunca estático, siempre código fresco

**Por qué los datos son ALEATORIOS (no ceros, no texto repetido):**
- Si mandaras ceros (`000000...`) o texto repetido (`AAAAAA...`), **cualquier capa intermedia** (servidor, CDN, operador, router) podría **comprimir** eso a casi nada
- Resultado: el usuario baja 1 MB "comprimido" en 0.1 MB reales → la medición dice 10x la velocidad real → **MENTIRA**
- Datos aleatorios **no se comprimen** (entropía máxima) → lo que baja = lo que viajó por la red → medición honesta

**Cuándo tocarlo:**
- Casi **nunca**.: 1 MB.
- Solo si necesitás cambiar el tamaño del bloque (pero entonces tenés que cambiar `lib/medidor.js` también).

---

## 5. lib/medidor.js — "El cerebro matemático (lógica pura, sin interfaz)"

**Qué es:** Un archivo **solo de funciones y números**. No tiene HTML, no tiene React, no sabe nada de botones ni pantallas. Solo matemática de red.

**Exporta 3 cosas:**
- `MAX_BLOQUES = 5` (constante: tope de bloques de 1 MB)
- `medirPing(intentos)` — función
- `medirDescarga(callbackProgreso)` — función

---

### `medirPing(intentos = 5)`"

**Qué hace:**
1. Hace `intentos` pedidos al endpoint `/api/ping` (por defecto 5)
2. Mide cuánto tarda cada uno con `performance.now()` (reloj de alta precisión del navegador)
3. **Descarta la PRIMERA muestra** — siempre tarda más porque incluye: abrir conexión TCP + handshake TLS (certificados, llaves)
4. Con las 4 restantes: calcula **promedio**, **mínimo**, **máximo**
5. Devuelve: `{ ping: promedio, min, max, muestras: [las 5 crudas] }`

**Por qué descartar la primera:**
- La 1ra vez que hablas con un servidor, hay que "presentarse" (TCP handshake + TLS handshake)
- Eso suma 1-2 rondas de ida-y-vuelta extra
- Las siguientes usan la **misma conexión** (keep-alive) → miden solo latencia pura
- Es estándar en mediciones de red serias

---

### `medirDescarga(callbackProgreso)` "

**La idea central:** **No fijamos cuántos MB bajar, fijamos CUÁNTO TIEMPO medir (~2.5 seg).**

**Por qué:** 
- Conexión lenta (2 Mbps): en 2.5 seg baja ~0.6 MB → medís 1 bloque y listo (gasta pocos datos del usuario)
- Conexión rápida (100 Mbps): en 2.5 seg baja ~30 MB → pero **cortamos a 5 bloques máx (5 MB)** → terminás en ~0.4 seg (rápido, gasta poco)
- Resultado: **siempre ~2.5 seg de medición real, máx 6 MB totales (1 calentamiento + 5 medición)**

**Pasos exactos:**

1. **Calentamiento (se descarta):**
   - Baja 1 bloque de 1 MB (`descargarBloque()`)
   - No mide tiempo, no avisa progreso
   - **Por qué:** TCP arranca lento ("slow start") — las primeras paquetes van con ventana chica. Si midieras acá, subestimarías la velocidad.

2. **Medición real (lo que cuenta):**
   - Arranca cronómetro (`tMedicion`)
   - Bucle `while`:
     - Condición: `bloques < 5` **Y** (`es el primer bloque` **O** `pasaron menos de 2.5 seg desde el INICIO TOTAL`)
     - Baja 1 bloque (`descargarBloque()`)
     - Suma bytes, incrementa contador de bloques
     - Calcula Mbps en vivo: `(bytes * 8) / 1_000_000 / segundos_transcurridos`
     - Llama al `callbackProgreso({ fase: 'medicion', bloques, mbpsEnVivo })` → `page.js` actualiza número y barra
   - El bucle para si: llegaron a 5 bloques **O** pasaron 2.5 seg desde el inicio total

3. **Cálculo final:**
   - Mbps = `(bytes_medidos * 8) / 1_000_000 / segundos_reales_de_medicion`
   - MB/s = Mbps / 8 (para bajar archivos)
   - Segundos = cuánto duró la fase de medición
   - MB consumidos = `(calentamiento + medidos) / (1024*1024)`

**Detalle clave — "la prueba se acorta sola en conexiones lentas":**
- La condición usa `t0` (inicio TOTAL, incluido calentamiento)
- Si la conexión es TAN lenta que el calentamiento ya tardó > 2.5 seg...
- El `while` ve: `bloques === 0` (es verdad) → entra **una vez**, mide 1 solo bloque, y sale
- **No es bug, es feature:** en conexiones muy malas no obligás al usuario a esperar 10 seg ni gastar 10 MB

---

### `descargarBloque()` — "Baja 1 MB y cuenta byte por byte"

**Qué hace:**
- Hace `fetch` a `/api/download?t=timestamp` (timestamp evita caché de navegador)
- Usa `response.body.getReader()` — **streaming** (lee de a pedacitos, no espera a bajar todo)
- Bucle `while`: lee chunks (`value`), suma `value.byteLength`
- Cuando `done: true`, devuelve total de bytes

**Por qué streaming:**
- Si bajaras todo de golpe (`await res.arrayBuffer()`), el navegador guarda todo en RAM antes de contarlo
- Con streaming, contás mientras llega → memoria constante, medís tiempo real de llegada


---

## Resumen de flujo completo (qué llama a qué)

```
Usuario aprieta "Iniciar prueba"
         │
         ▼
page.js llama medirPing(5)
         │
         ├──► /api/ping/route.js (5 veces, descarta 1ra)
         │
         ▼
page.js muestra ping promedio + rango
         │
         ▼
page.js llama medirDescarga(callback)
         │
         ├──► descargarBloque() → /api/download/route.js (calentamiento, 1 MB, se descarta)
         │
         ├──► bucle: descargarBloque() → /api/download/route.js (hasta 5 bloques o 2.5 seg)
         │         │
         │         └──► cada vuelta: callback(bloques, mbpsEnVivo) → page.js actualiza UI en vivo
         │
         ▼
page.js muestra resultado final + lista de usos + consumo MB
```

---


## Dónde meter mano si querés cambiar algo

| Qué querés cambiar | Archivo |
|--------------------|---------|
| Textos visibles, colores, tamaños, lista de usos | `app/page.js` |
| Título pestaña, descripción SEO, fuentes | `app/layout.js` |
| Lógica de cuántos pings, cómo promediar | `lib/medidor.js` → `medirPing` |
| Tiempo de medición (2.5 seg), máx bloques (5) | `lib/medidor.js` → constantes arriba |
| Tamaño del bloque (1 MB) | `app/api/download/route.js` + `lib/medidor.js` (ambos) |
| Headers de caché, force-dynamic | `app/api/ping/route.js` y `app/api/download/route.js` |

---
