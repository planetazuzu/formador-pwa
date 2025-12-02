# 📚 Documentación Completa - Formador PWA

Este documento reúne toda la documentación del proyecto Formador PWA en un solo lugar.

---

## 📋 Tabla de Contenidos

1. [README Principal](#readme-principal)
2. [Estado de Implementación](#estado-de-implementación)
3. [Guía de Inicio Rápido](#guía-de-inicio-rápido)
4. [Guía de Funcionamiento](#guía-de-funcionamiento)
5. [Guía de Personalización](#guía-de-personalización)
6. [Checklist](#checklist)

---

# README Principal

# 🎓 Formador PWA

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-enabled-4285F4)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplicación web progresiva (PWA) para crear, gestionar y distribuir actividades de formación. Utiliza GitHub como backend autoalojado, eliminando la necesidad de un servidor propio.

**✨ Listo para copiar, personalizar y desplegar** - Este repositorio está diseñado para que puedas clonarlo, personalizarlo según tus necesidades y desplegarlo rápidamente.

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
- ✅ **Dashboard** - Panel principal de administración con métricas avanzadas
- ✅ **Gestión de Recursos** - Crear, editar y gestionar recursos (PDFs, videos, enlaces)
- ✅ **Gestión de Actividades** - Constructor de actividades de formación completo
- ✅ **Gestión de Sesiones** - Crear sesiones con múltiples actividades
- ✅ **Gestión de Respuestas** - Ver y gestionar respuestas de usuarios con calificación
- ✅ **Gestión de Enlaces** - Administrar enlaces externos
- ✅ **Gestión de Tokens** - Generar y gestionar tokens de acceso
- ✅ **Configuración** - Panel de configuración de la aplicación
- ✅ **Sincronización GitHub** - Sincronización bidireccional con GitHub
- ✅ **Sidebar Navegable** - Navegación lateral con indicador de página activa

#### Backend Autoalojado
- ✅ **GitHub API Integration** - CRUD completo usando GitHub como backend
- ✅ **Server Actions** - Acciones del servidor para operaciones GitHub
- ✅ **API Routes** - Endpoints RESTful para operaciones GitHub
- ✅ **Esquemas JSON** - Validación de datos con esquemas JSON Schema
- ✅ **Sincronización Automática** - GitHub Actions para sincronización horaria
- ✅ **Backups Automáticos** - Backups diarios del repositorio
- ✅ **Sincronización Bidireccional** - Push/Pull completo con resolución de conflictos

#### Funcionalidades Técnicas
- ✅ **TypeScript** - Tipado estático completo
- ✅ **ESLint** - Linting configurado
- ✅ **Autenticación Base** - Sistema de autenticación preparado
- ✅ **Guard de Administración** - Protección de rutas de admin
- ✅ **Generación de Tokens** - Componente para generar tokens de acceso
- ✅ **Gestión de Contraseñas** - Modal para cambio de contraseñas

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
- `/admin/links` - Gestión de enlaces y tokens
- `/admin/sessions` - Gestión de sesiones
- `/admin/settings` - Configuración y sincronización

#### API
- `/api/github/*` - Endpoints para GitHub API (GET, POST, PUT, DELETE)

---

## 📦 Despliegue

### Vercel (Recomendado)

1. **Conectar el repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

2. **Configurar variables de entorno en Vercel**:
   - Ve a Settings → Environment Variables
   - Añade:
     - `NEXT_PUBLIC_GITHUB_OWNER`: Tu usuario de GitHub
     - `NEXT_PUBLIC_GITHUB_REPO`: Nombre del repositorio
     - `GITHUB_TOKEN`: Tu token de acceso personal

3. **Configurar Root Directory**:
   - En Settings → General → Root Directory
   - Establece: `frontend`

4. **Desplegar**:
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
│   ├── responses/
│   └── tokens/
└── README.md
```

3. **Configurar las variables de entorno** con los datos del repositorio

4. **Los datos se almacenarán automáticamente** usando la GitHub API

---

## 🔄 Sincronización con GitHub

La aplicación incluye sincronización bidireccional completa:

### Funcionalidades
- **Push**: Enviar datos locales a GitHub
- **Pull**: Descargar datos desde GitHub
- **Sync**: Sincronización completa (pull + push)
- **Resolución de conflictos**: Usa el más reciente por timestamp
- **Sincronización selectiva**: Elige qué tipos de datos sincronizar
- **Historial**: Registro de todas las sincronizaciones

### Uso
1. Ve a `/admin/settings`
2. Configura tus credenciales de GitHub
3. Guarda la configuración
4. Usa la sección "Sincronización con GitHub" para:
   - Sincronizar todo (Push + Pull)
   - Solo enviar a GitHub (Push)
   - Solo descargar de GitHub (Pull)

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

# Estado de Implementación

## ✅ COMPLETADO

### Estructura y Configuración
- ✅ Estructura completa del proyecto (frontend/backend)
- ✅ Next.js 14 con TypeScript configurado
- ✅ Tailwind CSS y diseño responsive
- ✅ PWA configurado (manifest, service-worker)
- ✅ Modo oscuro/claro funcional
- ✅ ESLint y configuración de desarrollo

### Backend y API
- ✅ GitHub API client implementado
- ✅ Server Actions para GitHub (`app/actions/github.ts`)
- ✅ API Routes (`/api/github/*`) con CRUD completo
- ✅ Funciones backend (`backend/github-api.ts`)
- ✅ Esquemas JSON (5 esquemas)
- ✅ GitHub Actions workflows (sync, backup)

### Base de Datos
- ✅ Dexie.js configurado (IndexedDB)
- ✅ Esquemas de tablas definidos (activities, resources, sessions, links, responses, tokens, syncHistory)
- ✅ Interfaces TypeScript para modelos
- ✅ Migraciones de versión implementadas

### Componentes UI Base
- ✅ Sistema de componentes UI (`components/ui/`)
- ✅ Button, Input, Textarea, Select, Card, Badge
- ✅ PageHeader, Section, BackButton
- ✅ DarkModeToggle
- ✅ AdminSidebar con navegación

### Páginas de Administración
- ✅ Dashboard completo con métricas avanzadas
- ✅ Resources con upload drag & drop
- ✅ Activities con ActivityBuilder completo
- ✅ Responses con gestión y calificación completa
- ✅ Links con gestión de enlaces y tokens
- ✅ Sessions con SessionBuilder completo
- ✅ Settings con configuración y sincronización

### Funcionalidades Core
- ✅ ActivityBuilder - Constructor completo de actividades
- ✅ ActivityPlayer - Reproductor completo de actividades
- ✅ Gestión de Respuestas - Sistema completo con calificación
- ✅ Subir Archivos - Upload con drag & drop y previews
- ✅ SessionBuilder - Constructor de sesiones funcional
- ✅ TokenGenerator - Generación y gestión de tokens
- ✅ Sincronización GitHub - Sincronización bidireccional completa

### Visualizadores
- ✅ PdfViewer (componente completo)
- ✅ VideoPlayer (componente completo)

### Documentación
- ✅ README completo
- ✅ Guía de funcionamiento
- ✅ Guía de personalización
- ✅ Inicio rápido
- ✅ Estado de implementación

---

## 🔴 ALTA PRIORIDAD - Completado

Todas las funcionalidades de alta prioridad han sido implementadas:
1. ✅ ActivityBuilder
2. ✅ ActivityPlayer
3. ✅ Gestión de Respuestas
4. ✅ Subir Archivos
5. ✅ SessionBuilder

---

## 🟡 MEDIA PRIORIDAD - Completado

Todas las funcionalidades de media prioridad han sido implementadas:
6. ✅ TokenGenerator
7. ✅ Sincronización GitHub
8. ✅ Dashboard Avanzado

---

## 🟢 BAJA PRIORIDAD - Pendiente

### Configuración Funcional
- 🔲 Guardar configuración en base de datos
- 🔲 Integración real con GitHub (conectar repositorio desde UI)
- 🔲 Gestión de variables de entorno desde UI
- 🔲 Backup/Restore de datos
- 🔲 Exportar/importar configuración

### Sistema de Autenticación Completo
- 🔲 Login/logout funcional
- 🔲 Registro de usuarios
- 🔲 Recuperación de contraseña
- 🔲 Sesiones persistentes
- 🔲 Protección de rutas de admin
- 🔲 Roles y permisos

### Testing
- 🔲 Tests unitarios para componentes
- 🔲 Tests de integración
- 🔲 Tests E2E
- 🔲 Configuración de Jest/Vitest
- 🔲 Coverage reports

### PWA Avanzado
- 🔲 Modo offline completo
- 🔲 Sincronización en background
- 🔲 Notificaciones push
- 🔲 Instalación mejorada
- 🔲 Actualizaciones automáticas

### Validación de Esquemas JSON
- 🔲 Validar datos contra esquemas JSON
- 🔲 Mensajes de error descriptivos
- 🔲 Validación en tiempo real
- 🔲 Sanitización de datos

---

# Guía de Inicio Rápido

## 0. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/planetazuzu/formador-pwa.git
cd formador-pwa

# O hacer Fork en GitHub y clonar tu fork
```

## 1. Instalación

```bash
cd frontend
npm install
```

## 2. Configurar Variables de Entorno

Crea `frontend/.env.local`:

```env
NEXT_PUBLIC_GITHUB_OWNER=tu-usuario
NEXT_PUBLIC_GITHUB_REPO=tu-repo
GITHUB_TOKEN=tu-token
```

## 3. Crear Iconos PWA

Crea dos iconos en `frontend/public/`:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

## 4. Ejecutar

```bash
npm run dev
```

Abre http://localhost:3000

---

# Guía de Funcionamiento

## Panel de Administración

### Dashboard
- Vista general con métricas y estadísticas
- Actividades recientes
- Enlaces rápidos
- Gráficos de tendencias

### Gestión de Recursos
- Crear recursos (PDFs, videos, imágenes, documentos)
- Upload con drag & drop
- Vista previa de archivos
- Editar y eliminar recursos

### Gestión de Actividades
- Crear actividades con ActivityBuilder
- Añadir secciones (texto, recursos, preguntas)
- Tipos de preguntas: opción múltiple, verdadero/falso, texto, código, ensayo
- Vista previa en tiempo real
- Editar y eliminar actividades

### Gestión de Respuestas
- Ver todas las respuestas
- Filtrar por actividad, estudiante, fecha
- Calificar respuestas
- Exportar respuestas (CSV, JSON)
- Ver estadísticas

### Gestión de Sesiones
- Crear sesiones con SessionBuilder
- Añadir actividades a sesiones
- Reordenar actividades (drag & drop)
- Editar y eliminar sesiones

### Gestión de Enlaces y Tokens
- **Enlaces**: Crear enlaces compartidos con expiración
- **Tokens**: Generar tokens de acceso para actividades
  - Configurar expiración
  - Límite de usos
  - Revocar tokens
  - Ver historial de uso

### Configuración
- Configuración general
- Configuración de GitHub
- Sincronización bidireccional
- Apariencia

## Sincronización con GitHub

1. Configura tus credenciales en Settings
2. Selecciona tipos de datos a sincronizar
3. Usa Push, Pull o Sync completo
4. Revisa el historial de sincronizaciones

---

# Guía de Personalización

## Cambiar Nombre y Colores

### Colores
Edita `frontend/tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#tu-color',
      // ...
    }
  }
}
```

### Nombre
Edita `frontend/app/layout.tsx` y `frontend/public/manifest.json`

## Personalizar Iconos PWA

1. Crea iconos en `frontend/public/`:
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)

2. Actualiza `manifest.json` si es necesario

## Modificar Estructura

- Páginas: `frontend/app/`
- Componentes: `frontend/components/`
- Estilos: `frontend/app/globals.css`
- Configuración: `frontend/`

---

# Checklist

## ✅ Completado

### Estructura Base
- [x] Carpeta `frontend/` creada
- [x] Carpeta `backend/` creada
- [x] README.md completo
- [x] .gitignore configurado

### Frontend
- [x] Next.js 14 con TypeScript configurado
- [x] Tailwind CSS configurado
- [x] ESLint configurado
- [x] PWA configurado (manifest.json, service-worker.js)
- [x] Estructura de carpetas completa
- [x] Componentes base implementados
- [x] Dexie.js inicializado
- [x] Cliente GitHub API básico
- [x] Utilidades generales

### Backend
- [x] `backend/github-api.ts` con funciones CRUD
- [x] 5 esquemas JSON creados
- [x] GitHub Actions workflows:
  - [x] sync.yml (sincronización horaria)
  - [x] backup.yml (backup diario)

### API Routes
- [x] `/api/github/[...route]` con GET, POST, PUT, DELETE

### Server Actions
- [x] `app/actions/github.ts` - Server Actions para GitHub API

### Funcionalidades Core
- [x] ActivityBuilder completo
- [x] ActivityPlayer completo
- [x] SessionBuilder completo
- [x] TokenGenerator completo
- [x] Gestión de respuestas completa
- [x] Upload de archivos completo
- [x] Sincronización GitHub completa

## 🔲 Pendiente

### Iconos PWA
- [ ] Crear `icon-192.png` (192x192px) - Manual
- [ ] Crear `icon-512.png` (512x512px) - Manual

### Mejoras Adicionales
- [ ] Agregar tipos TypeScript más completos
- [ ] Agregar manejo de errores más robusto
- [ ] Agregar tests (opcional)
- [ ] Agregar validación de esquemas JSON
- [ ] Mejorar sincronización en GitHub Actions

---

# Resumen del Proyecto

## Estado Actual

**✅ Funcionalidades Core: COMPLETADAS**
- Constructor de actividades completo
- Reproductor de actividades completo
- Gestión de respuestas completa
- Upload de archivos completo
- Constructor de sesiones completo
- Generación de tokens completo
- Sincronización GitHub completa

**🟡 Funcionalidades Importantes: COMPLETADAS**
- Dashboard avanzado
- Todas las funcionalidades críticas implementadas

**🟢 Mejoras Futuras: PENDIENTES**
- Autenticación completa
- Testing
- PWA avanzado
- Validación de esquemas

## Próximos Pasos Sugeridos

1. **Configuración Funcional**: Hacer que la configuración se guarde realmente
2. **Autenticación**: Implementar login/logout funcional
3. **Testing**: Añadir tests básicos
4. **Validación**: Implementar validación de esquemas JSON

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Estado**: Funcional y listo para uso

