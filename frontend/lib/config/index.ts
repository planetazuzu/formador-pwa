/**
 * Servicio de configuración de la aplicación
 * 
 * Gestiona la configuración de la aplicación en la base de datos
 */

import { db, AppConfig } from '@/lib/db';

const CONFIG_ID = 'app-config';

/**
 * Obtener configuración actual
 */
export async function getConfig(): Promise<AppConfig | null> {
  try {
    const config = await db.config.where('configId').equals(CONFIG_ID).first();
    return config || null;
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return null;
  }
}

/**
 * Guardar configuración
 */
export async function saveConfig(config: Partial<AppConfig>): Promise<AppConfig> {
  try {
    const existing = await db.config.where('configId').equals(CONFIG_ID).first();
    const now = Date.now();

    const configData: AppConfig = {
      configId: CONFIG_ID,
      appName: config.appName || 'Formador PWA',
      appDescription: config.appDescription,
      github: config.github,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    if (existing) {
      await db.config.update(existing.id!, configData);
      return { ...configData, id: existing.id };
    } else {
      const id = await db.config.add(configData);
      return { ...configData, id };
    }
  } catch (error) {
    console.error('Error guardando configuración:', error);
    throw error;
  }
}

/**
 * Obtener configuración de GitHub
 */
export async function getGitHubConfig(): Promise<{ owner?: string; repo?: string; token?: string }> {
  const config = await getConfig();
  return config?.github || {};
}

/**
 * Guardar configuración de GitHub
 */
export async function saveGitHubConfig(github: { owner?: string; repo?: string; token?: string }): Promise<void> {
  const currentConfig = await getConfig();
  await saveConfig({
    ...currentConfig,
    github,
  });
  
  // También guardar token en localStorage por compatibilidad
  if (github.token && typeof window !== 'undefined') {
    localStorage.setItem('github_token', github.token);
  }
}

/**
 * Exportar toda la configuración como JSON
 */
export async function exportConfig(): Promise<string> {
  const config = await getConfig();
  return JSON.stringify(config, null, 2);
}

/**
 * Importar configuración desde JSON
 */
export async function importConfig(json: string): Promise<void> {
  try {
    const imported = JSON.parse(json);
    await saveConfig(imported);
  } catch (error) {
    throw new Error('Error al importar configuración: JSON inválido');
  }
}

/**
 * Resetear configuración a valores por defecto
 */
export async function resetConfig(): Promise<void> {
  await saveConfig({
    appName: 'Formador PWA',
    appDescription: 'Aplicación de formación progresiva',
    github: {},
  });
}



