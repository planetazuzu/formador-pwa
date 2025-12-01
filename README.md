# Formador PWA

Aplicación de formación progresiva (PWA) con frontend Next.js 14 y backend autoalojado en GitHub.

## 📋 Descripción

Formador PWA es una aplicación web progresiva que permite crear, gestionar y distribuir actividades de formación. Utiliza GitHub como backend autoalojado, eliminando la necesidad de un servidor propio.

**✨ Listo para copiar, personalizar y desplegar** - Este repositorio está diseñado para que puedas clonarlo, personalizarlo según tus necesidades y desplegarlo rápidamente.

## 🏗️ Arquitectura

### Frontend
- **Next.js 14** con App Router
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **Dexie.js** para almacenamiento local (IndexedDB)
- **PWA** con Service Worker y Manifest
- **GitHub API** para operaciones CRUD

### Backend Autoalojado
- **GitHub API** para almacenamiento de archivos
- **GitHub Actions** para tareas automáticas:
  - Sincronización horaria
  - Backups diarios
- **Server Actions** en Next.js para operaciones del servidor

## 📁 Estructura del Proyecto

```
formador-pwa/
├── frontend/                 # Aplicación Next.js
│   ├── app/                 # App Router de Next.js
│   │   ├── admin/          # Panel de administración
│   │   │   ├── dashboard/
│   │   │   ├── resources/
│   │   │   ├── activities/
│   │   │   ├── responses/
│   │   │   ├── links/
│   │   │   ├── sessions/
│   │   │   └── settings/
│   │   ├── a/              # Actividades públicas
│   │   │   └── [activityId]/
│   │   ├── api/            # API Routes
│   │   │   └── github/     # Endpoints para GitHub API
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/          # Componentes React
│   │   ├── AdminSidebar.tsx
│   │   ├── ResourceCard.tsx
│   │   ├── ActivityBuilder.tsx
│   │   ├── ActivityPlayer.tsx
│   │   ├── TokenGenerator.tsx
│   │   ├── SessionBuilder.tsx
│   │   ├── PdfViewer.tsx
│   │   └── VideoPlayer.tsx
│   ├── lib/                # Utilidades y librerías
│   │   ├── db/            # Dexie (IndexedDB)
│   │   ├── github/        # Cliente GitHub API
│   │   └── utils/         # Utilidades generales
│   ├── public/            # Archivos estáticos
│   │   ├── manifest.json
│   │   └── service-worker.js
│   └── package.json
├── backend/                # Backend autoalojado
│   ├── github-api.ts      # Funciones GitHub API
│   └── schemas/           # Esquemas JSON
│       ├── activity.schema.json
│       ├── resource.schema.json
│       ├── response.schema.json
│       ├── session.schema.json
│       └── config.schema.json
├── .github/
│   └── workflows/          # GitHub Actions
│       ├── sync.yml       # Sincronización automática
│       └── backup.yml     # Backup diario
└── README.md
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 20 o superior
- npm o yarn
- Cuenta de GitHub
- Token de acceso personal de GitHub

### Pasos de Instalación

1. **Clonar o hacer Fork del repositorio**:
```bash
# Opción 1: Clonar directamente
git clone https://github.com/tu-usuario/formador-pwa.git
cd formador-pwa

# Opción 2: Hacer Fork en GitHub y luego clonar tu fork
git clone https://github.com/tu-usuario/formador-pwa.git
cd formador-pwa
```

2. **Instalar dependencias del frontend**:
```bash
cd frontend
npm install
```

3. **Configurar variables de entorno**:
Crea un archivo `.env.local` en la carpeta `frontend/`:
```env
NEXT_PUBLIC_GITHUB_OWNER=tu-usuario-github
NEXT_PUBLIC_GITHUB_REPO=tu-repositorio
GITHUB_TOKEN=tu-token-de-acceso
```

4. **Personalizar la aplicación** (opcional):
   - Consulta [PERSONALIZACION.md](./PERSONALIZACION.md) para una guía completa
   - Cambia el nombre, colores, iconos según tus necesidades

## 🔑 Crear Token de GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Haz clic en "Generate new token (classic)"
3. Selecciona los siguientes permisos:
   - `repo` (acceso completo a repositorios)
   - `workflow` (para GitHub Actions)
4. Copia el token generado y guárdalo de forma segura
5. Úsalo en la variable de entorno `GITHUB_TOKEN`

## 🏃 Ejecutar la Aplicación

### Modo Desarrollo

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Modo Producción

```bash
cd frontend
npm run build
npm start
```

## 📦 Desplegar en Vercel

1. **Conectar el repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Selecciona el directorio `frontend` como raíz

2. **Configurar variables de entorno en Vercel**:
   - Ve a Settings → Environment Variables
   - Añade:
     - `NEXT_PUBLIC_GITHUB_OWNER`: Tu usuario de GitHub
     - `NEXT_PUBLIC_GITHUB_REPO`: Nombre del repositorio
     - `GITHUB_TOKEN`: Tu token de acceso personal

3. **Desplegar**:
   - Vercel detectará automáticamente Next.js
   - El despliegue se realizará automáticamente en cada push

## 🔌 Conectar un Repositorio GitHub para Backend

1. **Crear un repositorio en GitHub** (puede ser el mismo o uno diferente)

2. **Estructura recomendada del repositorio**:
```
tu-repositorio/
├── data/
│   ├── activities/
│   ├── resources/
│   ├── sessions/
│   └── responses/
└── README.md
```

3. **Configurar las variables de entorno** con los datos del repositorio

4. **Los datos se almacenarán automáticamente** usando la GitHub API

## 🛣️ Rutas Principales

### Públicas
- `/` - Página inicial
- `/a/[activityId]` - Actividad pública

### Administración
- `/admin/dashboard` - Panel principal
- `/admin/resources` - Gestión de recursos
- `/admin/activities` - Gestión de actividades
- `/admin/responses` - Gestión de respuestas
- `/admin/links` - Gestión de enlaces
- `/admin/sessions` - Gestión de sesiones
- `/admin/settings` - Configuración

### API
- `/api/github/*` - Endpoints para GitHub API (GET, POST, PUT, DELETE)

## 🔄 GitHub Actions

### Sincronización Automática (`sync.yml`)
- Se ejecuta cada hora
- Descarga datos de `/data/` del repositorio
- Comprueba cambios
- Actualiza si es necesario

### Backup Diario (`backup.yml`)
- Se ejecuta diariamente a las 2:00 AM UTC
- Crea un backup del repositorio
- Almacena backups por 30 días

## 🧩 Funcionalidades

### Implementadas
- ✅ Estructura base del proyecto
- ✅ Configuración PWA
- ✅ Cliente GitHub API
- ✅ Base de datos local (Dexie)
- ✅ Componentes base
- ✅ Páginas de administración
- ✅ API Routes para GitHub
- ✅ GitHub Actions para sincronización y backup

### Pendientes de Implementar
- 🔲 Lógica de creación de actividades
- 🔲 Sistema de respuestas
- 🔲 Generación de tokens
- 🔲 Visualizadores de recursos (PDF, video)
- 🔲 Sincronización bidireccional
- 🔲 Autenticación y autorización

## 🛠️ Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Dexie.js** - IndexedDB wrapper
- **Octokit** - Cliente GitHub API
- **GitHub Actions** - Automatización

## 📝 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🎨 Personalización

¿Quieres personalizar la aplicación para tus necesidades? Consulta la [Guía de Personalización](./PERSONALIZACION.md) que incluye:

- Cambiar nombre y colores de la aplicación
- Personalizar iconos PWA
- Modificar estructura de páginas
- Ajustar esquemas de datos
- Configurar GitHub Actions
- Y mucho más...

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

## 🚀 Inicio Rápido

Si solo quieres probar rápidamente, consulta [QUICK_START.md](./QUICK_START.md) para una guía de inicio rápido.

---

**Nota**: Este proyecto utiliza GitHub como backend. Asegúrate de tener los permisos adecuados y de mantener seguro tu token de acceso.

**💡 Tip**: Este repositorio está listo para ser copiado (fork/clone) y desplegado. Solo necesitas configurar las variables de entorno y personalizar según tus necesidades.

