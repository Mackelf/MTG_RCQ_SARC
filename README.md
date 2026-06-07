# RCQ Reporter — Magic: The Gathering

Dashboard estático para reportes de torneos RCQ (Regional Championship Qualifier) de Magic: The Gathering. Seguimiento de resultados por tienda, fecha y formato, con análisis de metagame en tiempo real.

Desarrollado por Mario Canto — [PandaComboMtg](https://github.com/Mackelf) · 2026

🔗 **[Ver en vivo → mackelf.github.io/MTG_RCQ_SARC](https://mackelf.github.io/MTG_RCQ_SARC)**

---

## Tecnologías

- Vue 3 (CDN, sin build tools)
- Vue Router 4 (hash history)
- Bootstrap 5.3 + Bootstrap Icons 1.11
- Scryfall API (imágenes de cartas con caché en localStorage)
- JSON estático como fuente de datos

No requiere Node.js ni proceso de build. Se sirve directamente como HTML estático.

---

## Estructura de archivos

```
/
├── index.html                   # App completa (vistas + router + lógica)
├── styles.css                   # Estilos personalizados
├── JS/
│   └── archetypeMap.js          # Mapa arquetipo → carta Scryfall + función getScryfallImage
├── Data/
│   └── MAIN_RCQ_SC_JSON.json    # Fuente de datos de todos los torneos
└── assets/
    ├── LogoTodoFreak.jpg
    ├── LogoBloodMoon.jpg
    ├── LogoCasaDeJuegos.jpg
    ├── LogoPosadaDelDado.png
    ├── LogoCommandCenter.webp
    └── LogoOnPlay.jpg
```

---

## Estructura del JSON

Cada entrada representa un jugador en un torneo específico:

| Campo               | Descripción                                                           |
| ------------------- | --------------------------------------------------------------------- |
| `Puesto`            | Posición final                                                        |
| `Nombre`            | Nombre del jugador                                                    |
| `Puntos`            | Puntos totales                                                        |
| `V / D / E`         | Victorias / Derrotas / Empates                                        |
| `%VPO` `%JG` `%JGO` | Desempeño por oponentes                                               |
| `Arquetipo`         | Nombre del mazo con prefijo de formato (ej: `MOD-Boros Energy`)       |
| `Fecha`             | Fecha del torneo en formato ISO                                       |
| `Badge`             | Distinción: `1st`, `2nd`, `T4`, `T8`                                 |
| `STORE`             | Nombre de la tienda organizadora                                      |
| `REL`               | Nivel del evento: `Competitivo` o `Regular`                           |
| `URL Decklist`      | Enlace externo a la lista de mazo                                     |
| `FORMATO`           | Formato del torneo (`Modern`, `Standard`, etc.)                       |
| `ID`                | Identificador del tipo de evento (ej: `RCQ`)                         |

### Convención de prefijos en `Arquetipo`

Los arquetipos usan un prefijo de 4 caracteres para identificar el formato:

```
MOD-Boros Energy   →  prefijo: "MOD-"  →  se muestra: "Boros Energy"
STD-Azorius Tempo  →  prefijo: "STD-"  →  se muestra: "Azorius Tempo"
```

El prefijo se elimina automáticamente en todas las vistas mediante `stripPrefix()`.

---

## Vistas

### Home (`/`)

Pantalla de entrada. Lee el JSON y agrupa los torneos por tienda y fecha.

- Muestra cada tienda con logo y enlace a su Instagram
- Lista las fechas de eventos por tienda, ordenadas cronológicamente
- Al hacer click en una fecha navega directamente al Standing de ese evento

### TournamentLayout (`/tienda/:id`)

Layout compartido que envuelve las tres vistas de torneo:

- Muestra el logo de la tienda junto al nombre del torneo y formato activo
- Filtra jugadores por tienda usando la URL como identificador (slug normalizado)
- Detecta y preselecciona fechas disponibles (por query param `?fecha=` o la más reciente)
- Expone `filteredPlayers` a las vistas hijas mediante `Vue.provide`
- Selector de fecha para cambiar el evento visualizado

### Standing (`/tienda/:id/standing`)

Tabla de resultados del torneo seleccionado.

Columnas: `#`, `Nombre`, `Pts`, `%VPO`, `%JG`, `%JGO`, `V`, `D`, `E`, `Arquetipo`

- Badge de posición (1st, 2nd, T4, T8) por jugador
- Arquetipo hipervinculado a su decklist cuando disponible

### Metagame (`/tienda/:id/metagame`)

Vista de análisis del meta. Agrupa por arquetipo y calcula:

- Copias jugadas y porcentaje de representación
- Win Rate (partidas ganadas / total)
- Mejor badge obtenido por el arquetipo en el torneo

Cada arquetipo se presenta como una **card** con:

- Imagen `art_crop` desde Scryfall API (con caché en localStorage)
- Nombre sin prefijo, hipervinculado a la decklist
- Badges de posición

Debajo de las cards, una **tabla resumen** muestra:

- Lugar (mejor badge del arquetipo), Arquetipo, Copias, Winrate
- Dos cartas clave del arquetipo con imagen `normal` recortada al nombre de la carta

### Social (`/tienda/:id/social`)

Vista de difusión. Muestra al ganador con nombre, mazo, puntos y record.

---

## Integración con Scryfall API

Las imágenes de cartas se obtienen desde la [Scryfall API](https://scryfall.com/docs/api) en lugar de archivos locales.

### Archivo `JS/archetypeMap.js`

Contiene dos exports:

**`ARCHETYPE_CARD_MAP`** — diccionario que mapea cada arquetipo a dos cartas representativas:

```js
export const ARCHETYPE_CARD_MAP = {
  "MOD-Esper Blink": {
    main: "Phelia, Exuberant Shepherd",  // imagen principal (art_crop en cards)
    key:  "Overlord of the Haemtusk",   // segunda carta (normal recortada en tabla)
  },
  // ...
};
```

**`getScryfallImage(cardName)`** — función async que:

1. Busca la URL en `localStorage` (clave `scryfall_img::Nombre Carta`)
2. Si no existe, llama a `api.scryfall.com/cards/named?exact=...`
3. Guarda en localStorage como JSON con `{ art_crop, normal }`
4. Retorna el objeto con ambas URLs

### Caché en localStorage

Las imágenes se cachean por nombre de carta. En primera carga, el proceso completo toma ~1-2 segundos para todos los arquetipos. Las visitas posteriores son instantáneas.

Para forzar recarga de imágenes (útil al actualizar cartas en el mapa):

```js
// Ejecutar en la consola del browser
Object.keys(localStorage)
  .filter(k => k.startsWith('scryfall_img::'))
  .forEach(k => localStorage.removeItem(k));
```

### Agregar un arquetipo nuevo

1. Abrir `JS/archetypeMap.js`
2. Agregar entrada en el bloque del formato correspondiente:
   ```js
   "MOD-Nuevo Arquetipo": {
     main: "Nombre Exacto Carta Principal",
     key:  "Nombre Exacto Carta Secundaria",
   },
   ```
3. El nombre debe coincidir exactamente con Scryfall (verificar en [scryfall.com](https://scryfall.com))
4. Guardar → commit → push. La imagen se cachea automáticamente en la primera visita.

---

## Tiendas soportadas

| STORE (JSON)    | ID en URL         | Logo              |
| --------------- | ----------------- | ----------------- |
| Todo Freak      | `todo-freak`      | LogoTodoFreak.jpg |
| Blood Moon      | `blood-moon`      | LogoBloodMoon.jpg |
| Casa de Juegos  | `casa-de-juegos`  | LogoCasaDeJuegos.jpg |
| Posada del Dado | `posada-del-dado` | LogoPosadaDelDado.png |
| Command Center  | `command-center`  | LogoCommandCenter.webp |
| OnPlay          | `onplay`          | LogoOnPlay.jpg    |

> **Nota:** El ID se genera normalizando `STORE` a minúsculas con espacios reemplazados por guiones (`Casa de Juegos` → `casa-de-juegos`). Tiendas sin espacios como `OnPlay` generan IDs sin guión (`onplay`).

---

## Agregar un nuevo evento

1. Abrir `Data/MAIN_RCQ_SC_JSON.json`
2. Agregar los registros del torneo con los campos requeridos
3. Verificar que `STORE` coincida exactamente con una tienda existente
4. Si hay arquetipos nuevos, agregarlos en `JS/archetypeMap.js`

No se requiere ningún otro cambio. Home y selector de fechas se actualizan automáticamente.

---

## Navegación

```
/                               → Home
/tienda/:id/standing            → Standing del evento más reciente
/tienda/:id/standing?fecha=...  → Standing de una fecha específica
/tienda/:id/metagame            → Metagame del evento seleccionado
/tienda/:id/social              → Vista social del evento seleccionado
```

---

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/Mackelf/MTG_RCQ_SARC.git

# Servir con cualquier servidor estático
npx serve .
# o
python -m http.server 8080
```

Abrir `http://localhost:8080` en el navegador.

> El proyecto **no funciona** abriendo `index.html` directamente desde el explorador de archivos (`file://`) porque usa módulos ES (`type="module"`). Siempre usar un servidor HTTP local o GitHub Pages.

---

## Changelog

### [Unreleased] — Junio 2026

#### Añadido
- **Integración Scryfall API** — las imágenes de arquetipos se obtienen desde `api.scryfall.com/cards/named` en lugar de archivos locales en `/assets`
- **`JS/archetypeMap.js`** — módulo ES externo con `ARCHETYPE_CARD_MAP` (55 arquetipos mapeados a dos cartas cada uno: `main` y `key`) y función `getScryfallImage()`
- **Caché de imágenes en localStorage** — las URLs (`art_crop` y `normal`) se guardan por nombre de carta bajo la clave `scryfall_img::Nombre Carta` en formato JSON
- **Tabla resumen en Metagame** — debajo de las cards, tabla con columnas Lugar / Arquetipo / Copias / Winrate / Cartas Clave
- **Dos imágenes por arquetipo en tabla** — imagen `normal` recortada al nombre de la carta (`object-position: top`) para las dos cartas clave
- **`art_crop` en cards de Metagame** — reemplaza imágenes locales; altura fija con `object-fit: cover` para uniformidad entre artes verticales (sagas) y horizontales
- **Mejor badge por arquetipo** — función `bestBadge()` que determina el mejor resultado del arquetipo en el torneo (prioridad: `1st` > `2nd` > `T4` > `T8`)
- **Header de torneo en TournamentLayout** — nombre de tienda, formato e ID del evento aparecen junto al logo en todas las vistas (Standing, Metagame, Social)
- **Soporte tienda OnPlay** — agregada con logo, Instagram y normalización de ID (`onplay`)
- **Carga en paralelo por batches** — `Vue.watch` con `Promise.all` en grupos de 8 reemplaza el loop secuencial; reduce tiempo de primera carga de ~6s a ~1-2s

#### Corregido
- Bug donde `onMounted` ejecutaba con `archetypeStats` vacío al hacer F5 en la ruta `/metagame` — reemplazado por `Vue.watch` con `{ immediate: true }`
- Error de scope donde `ARCHETYPE_CARD_MAP` no era accesible desde el template — agregado al `return` del `setup()`
- ID de tienda `OnPlay` mapeado incorrectamente como `on-play` en `storeMeta` y `storeLogos` — corregido a `onplay`
- Orden de declaraciones en `setup()` de Metagame: `Vue.watch` referenciaba `archetypeStats` antes de su inicialización
- Badges `T4`/`T8` no aplicaban estilos — `inferBadge()` retornaba `"Top4"`/`"Top8"` pero `badgeClass()` esperaba `"T4"`/`"T8"`

#### Cambiado
- `<script>` principal cambiado a `type="module"` para soportar imports ES nativos
- `archetypeMap.js` movido a carpeta `JS/` (mayúscula) para consistencia con la ruta en GitHub Pages (Linux, case-sensitive)
- Formato de caché en localStorage cambiado de string (URL directa) a JSON con `{ art_crop, normal }`
- Campo `IMG URL` del JSON ya no se usa para imágenes de arquetipos; reemplazado completamente por `archetypeMap.js`

---

Desarrollado por Mario Canto — PandaComboMtg · 2026
