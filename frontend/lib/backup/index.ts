/**
 * Servicio de backup y restore de datos
 * 
 * Permite exportar e importar todos los datos de la aplicación
 */

import { db, Activity, Resource, Session, Link, Response, Token, SyncHistory } from '@/lib/db';

export interface BackupData {
  version: string;
  timestamp: number;
  activities: Activity[];
  resources: Resource[];
  sessions: Session[];
  links: Link[];
  responses: Response[];
  tokens: Token[];
  syncHistory: SyncHistory[];
}

const BACKUP_VERSION = '1.0.0';

/**
 * Crear backup de todos los datos
 */
export async function createBackup(): Promise<BackupData> {
  try {
    const [activities, resources, sessions, links, responses, tokens, syncHistory] = await Promise.all([
      db.activities.toArray(),
      db.resources.toArray(),
      db.sessions.toArray(),
      db.links.toArray(),
      db.responses.toArray(),
      db.tokens.toArray(),
      db.syncHistory.toArray(),
    ]);

    return {
      version: BACKUP_VERSION,
      timestamp: Date.now(),
      activities,
      resources,
      sessions,
      links,
      responses,
      tokens,
      syncHistory,
    };
  } catch (error) {
    console.error('Error creando backup:', error);
    throw error;
  }
}

/**
 * Exportar backup a JSON
 */
export async function exportBackup(): Promise<string> {
  const backup = await createBackup();
  return JSON.stringify(backup, null, 2);
}

/**
 * Descargar backup como archivo
 */
export async function downloadBackup(): Promise<void> {
  const json = await exportBackup();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `formador-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Restaurar datos desde backup
 */
export async function restoreBackup(backupData: BackupData, options: {
  clearExisting?: boolean;
  merge?: boolean;
} = {}): Promise<{ imported: number; errors: number }> {
  const { clearExisting = false, merge = true } = options;
  let imported = 0;
  let errors = 0;

  try {
    // Limpiar datos existentes si se solicita
    if (clearExisting) {
      await Promise.all([
        db.activities.clear(),
        db.resources.clear(),
        db.sessions.clear(),
        db.links.clear(),
        db.responses.clear(),
        db.tokens.clear(),
        db.syncHistory.clear(),
      ]);
    }

    // Importar actividades
    if (backupData.activities) {
      for (const activity of backupData.activities) {
        try {
          if (clearExisting || merge) {
            const existing = await db.activities.where('activityId').equals(activity.activityId).first();
            if (existing) {
              await db.activities.update(existing.id!, activity);
            } else {
              await db.activities.add(activity);
            }
            imported++;
          }
        } catch (error) {
          console.error('Error importando actividad:', error);
          errors++;
        }
      }
    }

    // Importar recursos
    if (backupData.resources) {
      for (const resource of backupData.resources) {
        try {
          if (clearExisting || merge) {
            const existing = await db.resources.where('resourceId').equals(resource.resourceId).first();
            if (existing) {
              await db.resources.update(existing.id!, resource);
            } else {
              await db.resources.add(resource);
            }
            imported++;
          }
        } catch (error) {
          console.error('Error importando recurso:', error);
          errors++;
        }
      }
    }

    // Importar sesiones
    if (backupData.sessions) {
      for (const session of backupData.sessions) {
        try {
          if (clearExisting || merge) {
            const existing = await db.sessions.where('sessionId').equals(session.sessionId).first();
            if (existing) {
              await db.sessions.update(existing.id!, session);
            } else {
              await db.sessions.add(session);
            }
            imported++;
          }
        } catch (error) {
          console.error('Error importando sesión:', error);
          errors++;
        }
      }
    }

    // Importar enlaces
    if (backupData.links) {
      for (const link of backupData.links) {
        try {
          if (clearExisting || merge) {
            const existing = await db.links.where('linkId').equals(link.linkId).first();
            if (existing) {
              await db.links.update(existing.id!, link);
            } else {
              await db.links.add(link);
            }
            imported++;
          }
        } catch (error) {
          console.error('Error importando enlace:', error);
          errors++;
        }
      }
    }

    // Importar respuestas
    if (backupData.responses) {
      for (const response of backupData.responses) {
        try {
          if (clearExisting || merge) {
            const existing = await db.responses.where('responseId').equals(response.responseId).first();
            if (existing) {
              await db.responses.update(existing.id!, response);
            } else {
              await db.responses.add(response);
            }
            imported++;
          }
        } catch (error) {
          console.error('Error importando respuesta:', error);
          errors++;
        }
      }
    }

    // Importar tokens
    if (backupData.tokens) {
      for (const token of backupData.tokens) {
        try {
          if (clearExisting || merge) {
            const existing = await db.tokens.where('tokenId').equals(token.tokenId).first();
            if (existing) {
              await db.tokens.update(existing.id!, token);
            } else {
              await db.tokens.add(token);
            }
            imported++;
          }
        } catch (error) {
          console.error('Error importando token:', error);
          errors++;
        }
      }
    }

    // Importar historial de sincronización
    if (backupData.syncHistory) {
      for (const sync of backupData.syncHistory) {
        try {
          if (clearExisting || merge) {
            const existing = await db.syncHistory.where('syncId').equals(sync.syncId).first();
            if (existing) {
              await db.syncHistory.update(existing.id!, sync);
            } else {
              await db.syncHistory.add(sync);
            }
            imported++;
          }
        } catch (error) {
          console.error('Error importando historial:', error);
          errors++;
        }
      }
    }

    return { imported, errors };
  } catch (error) {
    console.error('Error restaurando backup:', error);
    throw error;
  }
}

/**
 * Restaurar desde archivo JSON
 */
export async function restoreFromFile(json: string, options?: {
  clearExisting?: boolean;
  merge?: boolean;
}): Promise<{ imported: number; errors: number }> {
  try {
    const backupData: BackupData = JSON.parse(json);
    return await restoreBackup(backupData, options);
  } catch (error) {
    throw new Error('Error al restaurar backup: JSON inválido');
  }
}



