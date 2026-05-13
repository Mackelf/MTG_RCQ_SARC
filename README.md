# Dashboard RCQ — Modern Season 3

Dashboard estático para reportes de torneos RCQ (Regional Championship Qualifier) de Magic: The Gathering, formato Modern. Desarrollado para seguimiento de resultados por tienda y fecha.

---

## Tecnologías

- Vue 3 (CDN, sin build tools)
- Vue Router 4 (hash history)
- Bootstrap 5.3
- Bootstrap Icons 1.11
- JSON estático como fuente de datos

No requiere Node.js ni proceso de build. Se sirve directamente como HTML estático.

---

## Estructura de archivos

```
/
├── index.html               # App completa (vistas + router + lógica)
├── styles.css               # Estilos personalizados
├── Data/
│   └── MAIN_RCQ_SC_JSON.json  # Fuente de datos de todos los torneos
└── assets/
    ├── LogoTodoFreak.jpg
    ├── LogoBloodMoon.jpg
    ├── LogoCasaDeJuegos.jpg
    └── MOD/                 # Imágenes de arquetipos
```

---

## Estructura del JSON

Cada entrada del JSON representa un jugador en un torneo específico:

| Campo | Descripción |
|---|---|
| `Puesto` | Posición final |
| `Nombre` | Nombre del jugador |
| `Puntos` | Puntos totales |
| `V / D / E` | Victorias / Derrotas / Empates |
| `%VPO` `%JG` `%JGO` | Desempeño por oponentes |
| `Arquetipo` | Nombre del mazo con prefijo de 4 caracteres (ej: `MOD-Boros Energy`) |
| `Fecha` | Fecha del torneo en formato ISO |
| `STORE` | Nombre de la tienda organizadora |
| `REL` | Nivel del evento: `Competitivo` o `Regular` |
| `Badge` | Distinción: `1st`, `2nd`, `Top4`, `Top8` |
| `IMG URL` | Ruta a la imagen representativa del arquetipo |
| `URL Decklist` | Enlace externo a la lista de mazo |
| `FORMATO` | Formato del torneo (ej: `Modern`) |

### Convención de prefijos en `Arquetipo`

Los arquetipos usan un prefijo de 4 caracteres para identificar variantes:

```
MOD-Boros Energy   →  prefijo: "MOD-"  →  se muestra: "Boros Energy"
REG-Boros Energy   →  prefijo: "REG-"  →  se muestra: "Boros Energy"
```

El prefijo se elimina automáticamente en todas las vistas mediante `stripPrefix()`.

---

## Vistas

### Home (`/`)

Pantalla de entrada. Lee el JSON y agrupa los torneos por tienda y fecha automáticamente.

- Muestra cada tienda con su nombre vinculado a su Instagram
- Bajo cada tienda lista las fechas de eventos registradas en el JSON
- Al hacer click en una fecha navega directamente al Standing de ese evento

Las tiendas y sus redes sociales están definidas en `storeMeta` dentro del componente `Home`.

### TournamentLayout (`/tienda/:id`)

Layout compartido que envuelve las tres vistas de torneo. Se encarga de:

- Mostrar el logo de la tienda
- Filtrar jugadores por tienda (`STORE`) usando la URL como identificador
- Detectar fechas disponibles para esa tienda
- Preseleccionar la fecha recibida como query param (`?fecha=...`) o la más reciente
- Exponer `filteredPlayers` a las vistas hijas mediante `Vue.provide`
- Ofrecer un selector de fecha para cambiar el evento visualizado

### Standing (`/tienda/:id/standing`)

Tabla de resultados del torneo seleccionado.

Columnas: `#`, `Nombre`, `Pts`, `%VPO`, `%JG`, `%JGO`, `V`, `D`, `E`, `Arquetipo`

- El arquetipo se muestra sin prefijo
- Si el jugador tiene URL Decklist, el arquetipo es un hipervínculo a su lista

### Metagame (`/tienda/:id/metagame`)

Vista de análisis del meta del torneo. Agrupa jugadores por arquetipo y calcula:

- Copias jugadas y porcentaje de representación en el meta
- Win Rate (partidas ganadas / partidas totales)
- Badges del Top 8 asociados a cada arquetipo

Cada arquetipo se muestra como una card con:
- Imagen representativa (o placeholder si no hay)
- Nombre sin prefijo, hipervinculado a la decklist del primer jugador registrado con ese arquetipo
- Badges de posición (1st, 2nd, Top4, Top8)
- Estadísticas de META % y WIN RATE

Las cards se ordenan de mayor a menor representación en el meta.

### Social (`/tienda/:id/social`)

Vista de difusión. Muestra al ganador del torneo con su nombre, mazo, puntos y record.

---

## Navegación

```
/                               → Home (selección de tienda y fecha)
/tienda/:id/standing            → Standing del último evento
/tienda/:id/standing?fecha=...  → Standing de una fecha específica
/tienda/:id/metagame            → Metagame del evento seleccionado
/tienda/:id/social              → Vista social del evento seleccionado
```

Los IDs de tienda son slugs generados desde el campo `STORE` del JSON:

| STORE (JSON) | ID en URL |
|---|---|
| Todo Freak | `todo-freak` |
| Blood Moon | `blood-moon` |
| Casa de Juegos | `casa-de-juegos` |

---

## Agregar un nuevo evento

1. Abrir `Data/MAIN_RCQ_SC_JSON.json`
2. Agregar los registros del nuevo torneo con los campos correspondientes
3. Asegurarse de que `STORE` coincida con una tienda existente (mismo nombre exacto)
4. Agregar imágenes de arquetipos nuevos en `assets/MOD/` si corresponde

No se requiere ningún otro cambio. La Home y el selector de fechas se actualizan automáticamente al leer el JSON.

---

## Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/Mackelf/<nombre-repo>.git

# Servir con cualquier servidor estático, por ejemplo:
npx serve .
# o
python -m http.server 8080
```

Abrir `http://localhost:8080` en el navegador.

---

Desarrollado por Mario Canto — PandaComboMtg · 2026
