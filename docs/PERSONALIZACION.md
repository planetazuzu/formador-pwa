# 🎨 Guía de Personalización

Esta guía te ayudará a personalizar Formador PWA para tus necesidades específicas.

## 📋 Configuración Básica

### 1. Cambiar el Nombre de la Aplicación

**Frontend - Manifest PWA:**
```json
// frontend/public/manifest.json
{
  "name": "Tu Nombre de App",
  "short_name": "Tu App",
  "description": "Tu descripción personalizada"
}
```

**Frontend - Metadata:**
```typescript
// frontend/app/layout.tsx
export const metadata: Metadata = {
  title: "Tu Nombre de App",
  description: "Tu descripción personalizada",
  // ...
};
```

**Package.json:**
```json
// frontend/package.json
{
  "name": "tu-app-pwa-frontend",
  // ...
}
```

### 2. Personalizar Colores y Tema

**Tailwind CSS:**
```typescript
// frontend/tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: '#tu-color-primario',
        secondary: '#tu-color-secundario',
        // ...
      },
    },
  },
};
```

**Tema PWA:**
```json
// frontend/public/manifest.json
{
  "theme_color": "#tu-color-tema",
  "background_color": "#tu-color-fondo"
}
```

```typescript
// frontend/app/layout.tsx
export const viewport: Viewport = {
  themeColor: "#tu-color-tema",
  // ...
};
```

### 3. Configurar GitHub como Backend

**Variables de Entorno:**
```env
# frontend/.env.local
NEXT_PUBLIC_GITHUB_OWNER=tu-usuario-github
NEXT_PUBLIC_GITHUB_REPO=tu-repositorio
GITHUB_TOKEN=tu-token-de-acceso
```

**Estructura de Datos Recomendada:**
```
tu-repositorio/
├── data/
│   ├── activities/     # Actividades
│   ├── resources/      # Recursos
│   ├── sessions/       # Sesiones
│   └── responses/      # Respuestas
└── README.md
```

### 4. Personalizar Iconos PWA

1. Crea dos iconos:
   - `icon-192.png` (192x192 píxeles)
   - `icon-512.png` (512x512 píxeles)

2. Colócalos en `frontend/public/`

3. Herramientas recomendadas:
   - [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [Favicon.io](https://favicon.io/)

### 5. Personalizar Estructura de Páginas

**Agregar nuevas páginas de admin:**
```typescript
// frontend/app/admin/tu-pagina/page.tsx
export default function TuPagina() {
  return (
    <div>
      <h1>Tu Página Personalizada</h1>
    </div>
  );
}
```

**Actualizar el menú:**
```typescript
// frontend/components/AdminSidebar.tsx
const menuItems = [
  // ... items existentes
  { href: '/admin/tu-pagina', label: 'Tu Página' },
];
```

## 🎯 Personalización Avanzada

### 6. Modificar Esquemas de Datos

Los esquemas están en `backend/schemas/`. Puedes modificarlos según tus necesidades:

```json
// backend/schemas/activity.schema.json
{
  "properties": {
    "tu-campo-personalizado": {
      "type": "string",
      "description": "Tu campo personalizado"
    }
  }
}
```

### 7. Personalizar GitHub Actions

**Sincronización:**
```yaml
# .github/workflows/sync.yml
# Modifica la frecuencia o lógica de sincronización
on:
  schedule:
    - cron: '0 */2 * * *'  # Cada 2 horas
```

**Backup:**
```yaml
# .github/workflows/backup.yml
# Modifica la frecuencia de backups
on:
  schedule:
    - cron: '0 3 * * *'  # A las 3 AM UTC
```

### 8. Agregar Nuevos Componentes

```typescript
// frontend/components/TuComponente.tsx
'use client';

export default function TuComponente() {
  return (
    <div>
      {/* Tu componente personalizado */}
    </div>
  );
}
```

### 9. Personalizar Base de Datos Local

```typescript
// frontend/lib/db/index.ts
// Agrega nuevas tablas o modifica las existentes
this.version(1).stores({
  activities: '++id, activityId, title',
  tuTabla: '++id, campo1, campo2',  // Nueva tabla
});
```

### 10. Configurar Dominio Personalizado (Vercel)

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio personalizado
4. Sigue las instrucciones de DNS

## 📝 Checklist de Personalización

- [ ] Cambiar nombre de la aplicación
- [ ] Personalizar colores y tema
- [ ] Configurar variables de entorno
- [ ] Crear iconos PWA personalizados
- [ ] Modificar estructura de páginas (si es necesario)
- [ ] Ajustar esquemas de datos (si es necesario)
- [ ] Personalizar GitHub Actions (opcional)
- [ ] Agregar componentes personalizados
- [ ] Configurar dominio personalizado (opcional)

## 🔧 Configuración Rápida

Para una personalización rápida, modifica estos archivos en orden:

1. `frontend/public/manifest.json` - Nombre y colores PWA
2. `frontend/app/layout.tsx` - Metadata y título
3. `frontend/tailwind.config.ts` - Colores del tema
4. `frontend/.env.local` - Configuración de GitHub
5. `frontend/public/icon-*.png` - Iconos personalizados

## 💡 Consejos

- **Mantén una copia del original**: Haz un fork o clona antes de personalizar
- **Versiona tus cambios**: Usa git para mantener un historial
- **Prueba en desarrollo**: Usa `npm run dev` antes de desplegar
- **Documenta tus cambios**: Anota las personalizaciones que hagas

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas personalizando el proyecto:
1. Revisa la documentación de [Next.js](https://nextjs.org/docs)
2. Consulta la [documentación de Tailwind CSS](https://tailwindcss.com/docs)
3. Revisa los [esquemas JSON](https://json-schema.org/)

---

¡Disfruta personalizando tu Formador PWA! 🚀

