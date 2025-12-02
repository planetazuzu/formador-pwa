# Inicio Rápido

## 0. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/formador-pwa.git
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

## 5. Configurar GitHub Actions

Los workflows ya están configurados en `.github/workflows/`. Solo necesitas:
- Un repositorio GitHub
- Permisos de workflow habilitados

## 6. Personalizar (Opcional)

¿Quieres personalizar la aplicación? Consulta [PERSONALIZACION.md](./PERSONALIZACION.md) para:
- Cambiar nombre y colores
- Personalizar iconos
- Modificar estructura
- Y más...

¡Listo! 🚀

**Siguiente paso**: Personaliza la aplicación según tus necesidades o comienza a usarla directamente.

