# 📖 Guía de Funcionamiento - Formador PWA

Guía completa para entender y usar todas las funcionalidades de Formador PWA.

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Configuración Inicial](#configuración-inicial)
4. [Panel de Administración](#panel-de-administración)
5. [Gestión de Recursos](#gestión-de-recursos)
6. [Gestión de Actividades](#gestión-de-actividades)
7. [Gestión de Sesiones](#gestión-de-sesiones)
8. [Gestión de Respuestas](#gestión-de-respuestas)
9. [Gestión de Enlaces](#gestión-de-enlaces)
10. [Configuración](#configuración)
11. [Uso Público de Actividades](#uso-público-de-actividades)
12. [Backend y Sincronización](#backend-y-sincronización)
13. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 Introducción

Formador PWA es una aplicación web progresiva que te permite crear, gestionar y distribuir actividades de formación. Utiliza GitHub como backend, lo que significa que todos tus datos se almacenan en un repositorio de GitHub.

### Conceptos Clave

- **Recursos**: Archivos (PDFs, videos, enlaces) que puedes usar en tus actividades
- **Actividades**: Contenido de formación que los usuarios pueden completar
- **Sesiones**: Grupos de actividades organizadas
- **Respuestas**: Resultados y respuestas de los usuarios a las actividades
- **Enlaces**: Enlaces públicos con tokens para compartir actividades

---

## 🚀 Primeros Pasos

### 1. Acceder a la Aplicación

Una vez desplegada, accede a la URL de tu aplicación:
- Desarrollo: `http://localhost:3000`
- Producción: Tu URL de Vercel o el proveedor que uses

### 2. Navegación Principal

La aplicación tiene dos áreas principales:

- **Área Pública**: Página inicial y visualización de actividades
- **Panel de Administración**: Gestión completa del contenido (requiere autenticación)

### 3. Modo Oscuro/Claro

En la esquina superior derecha encontrarás un toggle para cambiar entre modo claro y oscuro. La preferencia se guarda automáticamente.

---

## ⚙️ Configuración Inicial

### Paso 1: Configurar Variables de Entorno

Antes de usar la aplicación, debes configurar las variables de entorno:

```env
# frontend/.env.local
NEXT_PUBLIC_GITHUB_OWNER=tu-usuario-github
NEXT_PUBLIC_GITHUB_REPO=tu-repositorio
GITHUB_TOKEN=tu-token-de-acceso
```

### Paso 2: Crear Token de GitHub

1. Ve a GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Selecciona permisos: `repo` y `workflow`
5. Copia el token y úsalo en `.env.local`

### Paso 3: Estructura del Repositorio de Datos

Tu repositorio de GitHub debe tener esta estructura:

```
tu-repositorio/
├── data/
│   ├── activities/     # Actividades (JSON)
│   ├── resources/     # Recursos (JSON)
│   ├── sessions/       # Sesiones (JSON)
│   └── responses/     # Respuestas (JSON)
└── README.md
```

La aplicación creará esta estructura automáticamente cuando empieces a crear contenido.

---

## 🎛️ Panel de Administración

### Acceso al Panel

Accede al panel de administración desde:
- URL: `/admin/dashboard`
- O usando el menú de navegación si está disponible

### Estructura del Panel

El panel tiene un **sidebar lateral** con las siguientes secciones:

1. **Dashboard** - Vista general y estadísticas
2. **Recursos** - Gestión de recursos (PDFs, videos, enlaces)
3. **Actividades** - Crear y gestionar actividades
4. **Respuestas** - Ver y gestionar respuestas de usuarios
5. **Enlaces** - Crear enlaces públicos con tokens
6. **Sesiones** - Organizar actividades en sesiones
7. **Configuración** - Configuración de la aplicación

---

## 📚 Gestión de Recursos

### ¿Qué son los Recursos?

Los recursos son archivos o enlaces que puedes usar en tus actividades:
- **PDFs**: Documentos para lectura
- **Videos**: Contenido multimedia
- **Enlaces**: URLs externas
- **Documentos**: Otros tipos de archivos

### Crear un Recurso

1. Ve a **Admin → Recursos**
2. Haz clic en **"Crear Nuevo Recurso"** (cuando esté implementado)
3. Completa el formulario:
   - **Título**: Nombre del recurso
   - **Tipo**: PDF, Video, Enlace, etc.
   - **URL**: Enlace al recurso
   - **Metadatos**: Información adicional (opcional)
4. Guarda el recurso

### Usar Recursos en Actividades

Los recursos se pueden asociar a actividades para que los usuarios los consulten mientras completan la actividad.

### Visualizar Recursos

- **PDFs**: Se abren en el visor PDF integrado
- **Videos**: Se reproducen en el reproductor de video integrado
- **Enlaces**: Se abren en nueva pestaña

---

## 📝 Gestión de Actividades

### ¿Qué son las Actividades?

Las actividades son el contenido principal de formación que los usuarios completan. Pueden incluir:
- Preguntas de opción múltiple
- Preguntas de texto libre
- Contenido educativo
- Recursos asociados

### Crear una Actividad

1. Ve a **Admin → Actividades**
2. Haz clic en **"Crear Nueva Actividad"** (cuando esté implementado)
3. Usa el **ActivityBuilder** para construir tu actividad:
   - Añade preguntas
   - Asocia recursos
   - Configura opciones
4. Guarda la actividad

### Estructura de una Actividad

```json
{
  "id": "actividad-123",
  "title": "Introducción a JavaScript",
  "content": {
    "questions": [...],
    "resources": [...]
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Editar una Actividad

1. Ve a **Admin → Actividades**
2. Selecciona la actividad que quieres editar
3. Modifica el contenido
4. Guarda los cambios

### Eliminar una Actividad

1. Ve a **Admin → Actividades**
2. Selecciona la actividad
3. Haz clic en **"Eliminar"**
4. Confirma la eliminación

---

## 📑 Gestión de Sesiones

### ¿Qué son las Sesiones?

Las sesiones son grupos de actividades organizadas. Permiten:
- Agrupar actividades relacionadas
- Crear itinerarios de formación
- Organizar contenido por temas

### Crear una Sesión

1. Ve a **Admin → Sesiones**
2. Haz clic en **"Crear Nueva Sesión"** (cuando esté implementado)
3. Usa el **SessionBuilder**:
   - Asigna un título
   - Añade actividades existentes
   - Organiza el orden
4. Guarda la sesión

### Estructura de una Sesión

```json
{
  "id": "sesion-123",
  "title": "Curso de React",
  "activities": [
    "actividad-1",
    "actividad-2",
    "actividad-3"
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Gestionar Actividades en una Sesión

- **Añadir**: Selecciona actividades de tu lista
- **Reordenar**: Arrastra y suelta para cambiar el orden
- **Eliminar**: Quita actividades de la sesión

---

## 📊 Gestión de Respuestas

### ¿Qué son las Respuestas?

Las respuestas son los resultados que los usuarios envían al completar actividades. Incluyen:
- Respuestas a preguntas
- Tiempo de completado
- Puntuación (si aplica)
- Estado (pendiente, completado, calificado)

### Ver Respuestas

1. Ve a **Admin → Respuestas**
2. Verás una lista de todas las respuestas
3. Filtra por:
   - Actividad
   - Usuario
   - Estado
   - Fecha

### Revisar una Respuesta

1. Selecciona una respuesta de la lista
2. Verás:
   - Información del usuario
   - Respuestas dadas
   - Puntuación (si aplica)
   - Fecha de envío

### Calificar Respuestas

1. Abre una respuesta
2. Revisa las respuestas del usuario
3. Asigna una calificación (si aplica)
4. Guarda la calificación

### Exportar Respuestas

(Próximamente) Podrás exportar respuestas en formato CSV o JSON.

---

## 🔗 Gestión de Enlaces

### ¿Qué son los Enlaces?

Los enlaces son URLs públicas con tokens que permiten compartir actividades sin necesidad de autenticación.

### Crear un Enlace

1. Ve a **Admin → Enlaces**
2. Haz clic en **"Crear Nuevo Enlace"** (cuando esté implementado)
3. Usa el **TokenGenerator**:
   - Selecciona la actividad a compartir
   - Genera un token único
   - Configura opciones (expiración, límite de usos)
4. Copia el enlace generado

### Formato de Enlace

```
https://tu-app.com/a/[activityId]?token=[token]
```

### Gestionar Enlaces

- **Ver todos los enlaces**: Lista de enlaces creados
- **Desactivar enlace**: Revoca el acceso
- **Ver estadísticas**: Número de accesos (próximamente)

---

## ⚙️ Configuración

### Acceso a Configuración

Ve a **Admin → Configuración** para acceder a:

### Configuración de GitHub

- **Owner**: Usuario/organización de GitHub
- **Repositorio**: Nombre del repositorio
- **Token**: Token de acceso (no se muestra por seguridad)

### Configuración de la Aplicación

- **Nombre**: Nombre de la aplicación
- **Descripción**: Descripción pública
- **Tema**: Preferencias de tema

### Configuración de Autenticación

- **Cambiar contraseña**: Usa el modal de cambio de contraseña
- **Configuración de sesión**: Tiempo de expiración, etc.

---

## 🌐 Uso Público de Actividades

### Acceder a una Actividad Pública

Los usuarios pueden acceder a actividades de dos formas:

1. **Con enlace directo y token**:
   ```
   https://tu-app.com/a/[activityId]?token=[token]
   ```

2. **Con enlace público** (si está habilitado):
   ```
   https://tu-app.com/a/[activityId]
   ```

### Completar una Actividad

1. El usuario accede al enlace
2. Ve el contenido de la actividad
3. Responde las preguntas
4. Envía sus respuestas
5. Recibe confirmación

### Visualización de Recursos

Durante la actividad, el usuario puede:
- Ver PDFs en el visor integrado
- Reproducir videos en el reproductor
- Acceder a enlaces externos

---

## 🔄 Backend y Sincronización

### Cómo Funciona el Backend

Formador PWA utiliza **GitHub como backend**:

1. **Almacenamiento**: Todos los datos se guardan como archivos JSON en GitHub
2. **API Routes**: Las operaciones CRUD usan la GitHub API
3. **Server Actions**: Operaciones del servidor para mejor UX
4. **Sincronización**: GitHub Actions sincroniza automáticamente

### Estructura de Datos en GitHub

```
data/
├── activities/
│   └── actividad-123.json
├── resources/
│   └── recurso-456.json
├── sessions/
│   └── sesion-789.json
└── responses/
    └── respuesta-012.json
```

### Sincronización Automática

El workflow `sync.yml` se ejecuta cada hora y:
1. Descarga datos del repositorio
2. Comprueba cambios
3. Actualiza si es necesario

### Backups Automáticos

El workflow `backup.yml` se ejecuta diariamente y:
1. Crea un backup del repositorio
2. Lo almacena como artefacto
3. Mantiene backups por 30 días

### Sincronización Manual

Puedes forzar la sincronización:
1. Ve a GitHub → Actions
2. Selecciona el workflow "Sincronización Automática"
3. Haz clic en "Run workflow"

---

## 💾 Almacenamiento Local (Offline)

### Base de Datos Local

Formador PWA usa **Dexie.js** (IndexedDB) para almacenamiento local:

- **Actividades**: Se guardan localmente para acceso offline
- **Recursos**: Metadatos almacenados localmente
- **Respuestas**: Se guardan localmente antes de sincronizar

### Funcionamiento Offline

1. La aplicación funciona offline usando datos locales
2. Los cambios se guardan localmente
3. Al volver online, se sincronizan automáticamente

### Limpiar Datos Locales

Si necesitas limpiar los datos locales:
1. Abre las herramientas de desarrollador (F12)
2. Ve a Application → IndexedDB
3. Elimina la base de datos "FormadorDB"

---

## 🔐 Autenticación y Seguridad

### Autenticación

(Próximamente) La aplicación incluirá:
- Login con usuario y contraseña
- Recuperación de contraseña
- Sesiones persistentes
- Protección de rutas de admin

### Seguridad de Tokens

- Los tokens de GitHub se almacenan solo en variables de entorno
- Nunca se exponen en el código del cliente
- Los tokens de acceso a actividades tienen expiración

### Protección de Rutas

- Las rutas `/admin/*` están protegidas
- Requieren autenticación
- El componente `AdminGuard` verifica el acceso

---

## 📱 Funcionalidades PWA

### Instalación

La aplicación es una PWA, lo que significa que puedes instalarla:

1. **En Chrome/Edge**:
   - Aparece un icono de instalación en la barra de direcciones
   - Haz clic para instalar

2. **En móviles**:
   - Menú del navegador → "Añadir a pantalla de inicio"

### Funcionamiento Offline

- La aplicación funciona offline
- Los datos se sincronizan al volver online
- El Service Worker gestiona el caché

### Notificaciones

(Próximamente) Podrás recibir notificaciones sobre:
- Nuevas actividades disponibles
- Recordatorios de sesiones
- Actualizaciones de contenido

---

## 🛠️ Solución de Problemas

### La aplicación no carga

1. Verifica las variables de entorno
2. Comprueba que el token de GitHub sea válido
3. Revisa la consola del navegador (F12) para errores

### No se guardan los datos

1. Verifica la conexión a GitHub
2. Comprueba los permisos del token
3. Revisa que el repositorio exista

### Error de sincronización

1. Ve a GitHub → Actions
2. Revisa los logs del workflow
3. Verifica que los permisos de workflow estén habilitados

### Problemas con PWA

1. Limpia el caché del navegador
2. Desregistra el Service Worker
3. Recarga la página

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar mi propio servidor en lugar de GitHub?

Actualmente, la aplicación está diseñada para usar GitHub como backend. Para usar otro backend, necesitarías modificar el código.

### ¿Cuánto cuesta usar GitHub como backend?

GitHub es gratuito para repositorios públicos. Para repositorios privados, hay planes gratuitos con límites generosos.

### ¿Los datos son privados?

Sí, si usas un repositorio privado de GitHub. Los datos se almacenan en tu repositorio y solo tú tienes acceso.

### ¿Puedo exportar mis datos?

Sí, todos los datos están en tu repositorio de GitHub. Puedes clonarlo o descargarlo en cualquier momento.

### ¿Funciona sin conexión a internet?

Sí, la aplicación funciona offline usando IndexedDB. Los cambios se sincronizan cuando vuelves a tener conexión.

### ¿Puedo personalizar la aplicación?

Sí, consulta [PERSONALIZACION.md](./PERSONALIZACION.md) para una guía completa.

### ¿Cómo actualizo la aplicación?

Si clonaste el repositorio:
```bash
git pull origin main
cd frontend
npm install
npm run build
```

Si usas Vercel, se actualiza automáticamente con cada push.

---

## 📚 Recursos Adicionales

- [README.md](./README.md) - Documentación general
- [QUICK_START.md](./QUICK_START.md) - Inicio rápido
- [PERSONALIZACION.md](./PERSONALIZACION.md) - Guía de personalización
- [GitHub Repository](https://github.com/planetazuzu/formador-pwa) - Código fuente

---

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa esta guía
2. Consulta los otros documentos del proyecto
3. Abre un [issue en GitHub](https://github.com/planetazuzu/formador-pwa/issues)
4. Revisa los [logs de GitHub Actions](https://github.com/planetazuzu/formador-pwa/actions)

---

**Última actualización**: Diciembre 2024

