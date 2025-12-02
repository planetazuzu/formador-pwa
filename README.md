# 🎓 Formador PWA

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-enabled-4285F4)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Aplicación web progresiva (PWA) para crear, gestionar y distribuir actividades de formación. Utiliza GitHub como backend autoalojado, eliminando la necesidad de un servidor propio.

**✨ Listo para copiar, personalizar y desplegar** - Este repositorio está diseñado para que puedas clonarlo, personalizarlo según tus necesidades y desplegarlo rápidamente.

---

## 📋 Documentación

Toda la documentación está disponible en la carpeta [`docs/`](./docs/):

- **[Documentación Completa](./docs/DOCUMENTACION_COMPLETA.md)** - Toda la documentación en un solo archivo
- **[Estado de Implementación](./docs/ESTADO_IMPLEMENTACION.md)** - Estado actual del proyecto
- **[Guía de Funcionamiento](./docs/GUIA_FUNCIONAMIENTO.md)** - Cómo usar la aplicación
- **[Inicio Rápido](./docs/QUICK_START.md)** - Guía rápida de instalación
- **[Personalización](./docs/PERSONALIZACION.md)** - Cómo personalizar la aplicación
- **[Checklist](./docs/CHECKLIST.md)** - Lista de tareas

---

## ✨ Características Principales

- ✅ **Constructor de Actividades Completo** - Crea actividades con múltiples tipos de preguntas
- ✅ **Reproductor de Actividades** - Interfaz completa para completar actividades
- ✅ **Gestión de Respuestas** - Revisa y califica respuestas con estadísticas
- ✅ **Sincronización GitHub** - Sincronización bidireccional completa
- ✅ **Gestión de Tokens** - Genera tokens de acceso para compartir actividades
- ✅ **Backup y Restore** - Exporta e importa todos tus datos
- ✅ **Validación de Esquemas** - Validación JSON Schema completa
- ✅ **Configuración Completa** - Guarda y gestiona tu configuración

---

## 🚀 Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/planetazuzu/formador-pwa.git
cd formador-pwa

# Instalar dependencias
cd frontend
npm install

# Configurar variables de entorno
# Crear frontend/.env.local con:
# NEXT_PUBLIC_GITHUB_OWNER=tu-usuario
# NEXT_PUBLIC_GITHUB_REPO=tu-repo
# GITHUB_TOKEN=tu-token

# Ejecutar
npm run dev
```

Para más detalles, consulta la [Guía de Inicio Rápido](./docs/QUICK_START.md).

---

## 📦 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura el **Root Directory** como `frontend` en Settings → General
3. Añade las variables de entorno
4. ¡Listo! Vercel desplegará automáticamente

---

## 🛠️ Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Dexie.js** - Base de datos local (IndexedDB)
- **GitHub API** - Backend autoalojado

---

## 📝 Licencia

MIT

---

## 📚 Más Información

Consulta la [documentación completa](./docs/DOCUMENTACION_COMPLETA.md) para más detalles sobre:
- Instalación y configuración
- Uso de todas las funcionalidades
- Personalización
- Estado de implementación
- Y mucho más...

---

**Hecho con ❤️ usando Next.js, TypeScript y GitHub**
