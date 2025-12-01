# 🎓 Formador PWA

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-enabled-4285F4)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplicación web progresiva (PWA) para crear, gestionar y distribuir actividades de formación. Utiliza GitHub como backend autoalojado, eliminando la necesidad de un servidor propio.

**✨ Listo para copiar, personalizar y desplegar** - Este repositorio está diseñado para que puedas clonarlo, personalizarlo según tus necesidades y desplegarlo rápidamente.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Características Futuras](#-características-futuras)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Despliegue](#-despliegue)
- [Personalización](#-personalización)
- [Tecnologías](#-tecnologías)
- [Contribuir](#-contribuir)

---

## ✨ Características

### 🎯 Características Actuales

#### Frontend
- ✅ **Next.js 14** con App Router y TypeScript
- ✅ **PWA Completo** - Instalable, funciona offline, Service Worker configurado
- ✅ **Tailwind CSS** - Diseño responsive y moderno
- ✅ **Modo Oscuro** - Tema claro/oscuro con persistencia
- ✅ **Base de Datos Local** - Dexie.js (IndexedDB) para almacenamiento offline
- ✅ **Componentes UI Reutilizables** - Sistema de componentes modular
- ✅ **Markdown Editor** - Editor de contenido con soporte Markdown
- ✅ **Visualizadores de Recursos** - PDF y Video players integrados

#### Panel de Administración
- ✅ **Dashboard** - Panel principal de administración
- ✅ **Gestión de Recursos** - Crear, editar y gestionar recursos (PDFs, videos, enlaces)
- ✅ **Gestión de Actividades** - Constructor de actividades de formación
- ✅ **Gestión de Sesiones** - Crear sesiones con múltiples actividades
- ✅ **Gestión de Respuestas** - Ver y gestionar respuestas de usuarios
- ✅ **Gestión de Enlaces** - Administrar enlaces externos
- ✅ **Configuración** - Panel de configuración de la aplicación
- ✅ **Sidebar Navegable** - Navegación lateral con indicador de página activa

#### Backend Autoalojado
- ✅ **GitHub API Integration** - CRUD completo usando GitHub como backend
- ✅ **Server Actions** - Acciones del servidor para operaciones GitHub
- ✅ **API Routes** - Endpoints RESTful para operaciones GitHub
- ✅ **Esquemas JSON** - Validación de datos con esquemas JSON Schema
- ✅ **Sincronización Automática** - GitHub Actions para sincronización horaria
- ✅ **Backups Automáticos** - Backups diarios del repositorio

#### Funcionalidades Técnicas
- ✅ **TypeScript** - Tipado estático completo
- ✅ **ESLint** - Linting configurado
- ✅ **Autenticación Base** - Sistema de autenticación preparado
- ✅ **Guard de Administración** - Protección de rutas de admin
- ✅ **Generación de Tokens** - Componente para generar tokens de acceso
- ✅ **Gestión de Contraseñas** - Modal para cambio de contraseñas

#### Componentes UI Disponibles
- ✅ **Button** - Botones con variantes y estados
- ✅ **Input** - Campos de entrada de texto
- ✅ **Textarea** - Áreas de texto multilínea
- ✅ **Select** - Selectores desplegables
- ✅ **Card** - Tarjetas de contenido
- ✅ **Badge** - Etiquetas y badges
- ✅ **PageHeader** - Encabezados de página estandarizados
- ✅ **Section** - Secciones de contenido
- ✅ **BackButton** - Botón de navegación hacia atrás
- ✅ **DarkModeToggle** - Toggle para modo oscuro

---

## 🚀 Características Futuras

### 📅 Roadmap

#### Fase 1: Funcionalidades Core (Próximamente)
- 🔲 **Constructor de Actividades Completo**
  - Editor visual drag-and-drop
  - Múltiples tipos de preguntas (opción múltiple, texto, código)
  - Preview en tiempo real
  - Plantillas predefinidas
  
- 🔲 **Sistema de Respuestas Avanzado**
  - Captura de respuestas de usuarios
  - Evaluación automática
  - Estadísticas y análisis
  - Exportación de resultados

- 🔲 **Reproductor de Actividades**
  - Interfaz de usuario para completar actividades
  - Navegación entre preguntas
  - Guardado automático de progreso
  - Temporizador opcional

#### Fase 2: Mejoras de UX/UI (Planificado)
- 🔲 **Editor WYSIWYG Mejorado**
  - Toolbar completo con formato
  - Inserción de imágenes
  - Tablas y listas
  - Sincronización en tiempo real

- 🔲 **Dashboard Interactivo**
  - Gráficos y estadísticas
  - Métricas de uso
  - Actividades más populares
  - Resumen de sesiones

- 🔲 **Búsqueda y Filtros**
  - Búsqueda global de contenido
  - Filtros avanzados
  - Ordenamiento personalizable
  - Tags y categorías

#### Fase 3: Colaboración (Futuro)
- 🔲 **Sistema de Colaboración**
  - Múltiples administradores
  - Permisos granulares
  - Historial de cambios
  - Comentarios y anotaciones

- 🔲 **Compartición de Actividades**
  - Enlaces públicos con tokens
  - Códigos QR para acceso rápido
  - Embeds en otras páginas
  - Estadísticas de acceso

#### Fase 4: Avanzado (Futuro)
- 🔲 **Sincronización Bidireccional**
  - Sincronización en tiempo real
  - Resolución de conflictos
  - Modo offline completo
  - Sincronización selectiva

- 🔲 **Analytics Avanzado**
  - Tracking de eventos
  - Heatmaps de interacción
  - Reportes personalizados
  - Exportación de datos

- 🔲 **Integraciones**
  - Webhooks para eventos
  - API REST pública
  - Integración con LMS
  - Importación/exportación masiva

- 🔲 **Gamificación**
  - Sistema de puntos
  - Logros y badges
  - Leaderboards
  - Progreso visual

#### Fase 5: Enterprise (Futuro)
- 🔲 **Multi-tenancy**
  - Múltiples organizaciones
  - Aislamiento de datos
  - Facturación por organización
  - Branding personalizado

- 🔲 **SSO y Autenticación Avanzada**
  - OAuth 2.0
  - SAML
  - LDAP/Active Directory
  - 2FA/MFA

- 🔲 **Compliance y Seguridad**
  - Encriptación end-to-end
  - Auditoría completa
  - GDPR compliance
  - Certificaciones de seguridad

---

## 🏗️ Arquitectura

### Frontend
- **Next.js 14** con App Router
- **TypeScript** para tipado estático
- **Tailwind CSS** para estilos
- **Dexie.js** para almacenamiento local (IndexedDB)
- **PWA** con Service Worker y Manifest
- **GitHub API** para operaciones CRUD
- **Server Actions** para operaciones del servidor

### Backend Autoalojado
- **GitHub API** para almacenamiento de archivos
- **GitHub Actions** para tareas automáticas:
  - Sincronización horaria
  - Backups diarios
- **Esquemas JSON** para validación de datos

### Estructura del Proyecto

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
│   │   ├── actions/        # Server Actions
│   │   │   └── github.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes UI base
│   │   ├── AdminSidebar.tsx
│   │   ├── ActivityBuilder.tsx
│   │   ├── ActivityPlayer.tsx
│   │   ├── ResourceCard.tsx
│   │   ├── SessionBuilder.tsx
│   │   ├── TokenGenerator.tsx
│   │   ├── PdfViewer.tsx
│   │   ├── VideoPlayer.tsx
│   │   └── ...
│   ├── lib/                # Utilidades y librerías
│   │   ├── db/            # Dexie (IndexedDB)
│   │   ├── github/        # Cliente GitHub API
│   │   ├── auth.ts        # Autenticación
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

---

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
git clone https://github.com/planetazuzu/formador-pwa.git
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

---

## 🔑 Crear Token de GitHub

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Haz clic en "Generate new token (classic)"
3. Selecciona los siguientes permisos:
   - `repo` (acceso completo a repositorios)
   - `workflow` (para GitHub Actions)
4. Copia el token generado y guárdalo de forma segura
5. Úsalo en la variable de entorno `GITHUB_TOKEN`

---

## 🏃 Uso

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

### Rutas Principales

#### Públicas
- `/` - Página inicial
- `/a/[activityId]` - Actividad pública

#### Administración
- `/admin/dashboard` - Panel principal
- `/admin/resources` - Gestión de recursos
- `/admin/activities` - Gestión de actividades
- `/admin/responses` - Gestión de respuestas
- `/admin/links` - Gestión de enlaces
- `/admin/sessions` - Gestión de sesiones
- `/admin/settings` - Configuración

#### API
- `/api/github/*` - Endpoints para GitHub API (GET, POST, PUT, DELETE)

---

## 📦 Despliegue

### Vercel (Recomendado)

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

### Otros Proveedores

La aplicación también puede desplegarse en:
- **Netlify** - Similar a Vercel
- **Railway** - Con configuración de Node.js
- **Render** - Con build command: `cd frontend && npm install && npm run build`

---

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

---

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

---

## 🎨 Personalización

¿Quieres personalizar la aplicación para tus necesidades? Consulta la [Guía de Personalización](./PERSONALIZACION.md) que incluye:

- Cambiar nombre y colores de la aplicación
- Personalizar iconos PWA
- Modificar estructura de páginas
- Ajustar esquemas de datos
- Configurar GitHub Actions
- Y mucho más...

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework CSS utility-first
- **Dexie.js** - Wrapper para IndexedDB
- **React Markdown** - Renderizado de Markdown
- **Lucide React** - Iconos

### Backend
- **GitHub API** - Almacenamiento de archivos
- **Octokit** - Cliente GitHub API
- **GitHub Actions** - Automatización y CI/CD

### Herramientas
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Prefijos CSS automáticos

---

## 📝 Licencia

MIT

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Añade tests si es posible
- Actualiza la documentación según sea necesario
- Asegúrate de que el código pase el linting

---

## 📧 Contacto y Soporte

- **Issues**: Para reportar bugs o solicitar features, abre un [issue](https://github.com/planetazuzu/formador-pwa/issues)
- **Discusiones**: Para preguntas y discusiones, usa [Discussions](https://github.com/planetazuzu/formador-pwa/discussions)

---

## 🚀 Inicio Rápido

Si solo quieres probar rápidamente, consulta [QUICK_START.md](./QUICK_START.md) para una guía de inicio rápido.

---

## 📊 Estado del Proyecto

### ✅ Completado
- Estructura base del proyecto
- Configuración PWA completa
- Cliente GitHub API funcional
- Base de datos local (Dexie)
- Componentes UI base
- Páginas de administración
- API Routes para GitHub
- Server Actions implementados
- GitHub Actions para sincronización y backup
- Sistema de autenticación base
- Modo oscuro
- Editor Markdown

### 🔄 En Desarrollo
- Constructor de actividades completo
- Sistema de respuestas avanzado
- Reproductor de actividades

### 📅 Planificado
- Ver [Características Futuras](#-características-futuras) para el roadmap completo

---

## ⚠️ Notas Importantes

- Este proyecto utiliza GitHub como backend. Asegúrate de tener los permisos adecuados y de mantener seguro tu token de acceso.
- Los iconos PWA deben crearse manualmente (ver `frontend/public/ICONS_README.md`)
- Las variables de entorno deben configurarse en `.env.local` (no se suben al repositorio por seguridad)

---

## 💡 Tips

- **Fork y Personaliza**: Este repositorio está listo para ser copiado (fork/clone) y desplegado. Solo necesitas configurar las variables de entorno y personalizar según tus necesidades.
- **Desarrollo Local**: Usa `npm run dev` para desarrollo con hot-reload
- **Build de Producción**: Siempre prueba el build de producción localmente antes de desplegar: `npm run build && npm start`
- **GitHub Actions**: Los workflows están configurados automáticamente, solo necesitas tener permisos de workflow habilitados en tu repositorio

---

**Hecho con ❤️ usando Next.js, TypeScript y GitHub**
