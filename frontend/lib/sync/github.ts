/**
 * Servicio de sincronización bidireccional con GitHub
 * 
 * Permite sincronizar datos entre IndexedDB (local) y GitHub (remoto)
 */

import { db, Activity, Resource, Session, Response, Token } from '@/lib/db';
import { GitHubAPI } from '@/lib/github/api';

export interface SyncConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
}

export interface SyncHistory {
  id?: number;
  syncId: string;
  type: 'push' | 'pull' | 'sync';
  status: 'success' | 'error' | 'partial';
  pushed: number;
  pulled: number;
  conflicts: number;
  errors: string[];
  timestamp: number;
}

// Estructura de archivos en GitHub
const DATA_PATHS = {
  activities: 'data/activities',
  resources: 'data/resources',
  sessions: 'data/sessions',
  responses: 'data/responses',
  tokens: 'data/tokens',
};

/**
 * Obtener SHA de un archivo si existe
 */
async function getFileSha(github: GitHubAPI, path: string): Promise<string | null> {
  try {
    const files = await github.listFiles(path.split('/').slice(0, -1).join('/'));
    const fileName = path.split('/').pop();
    const file = files.find((f: any) => f.name === fileName);
    return file?.sha || null;
  } catch (error) {
    return null;
  }
}

/**
 * Push: Enviar datos locales a GitHub
 */
export async function pushToGitHub(
  config: SyncConfig,
  types: ('activities' | 'resources' | 'sessions' | 'responses' | 'tokens')[] = ['activities', 'resources', 'sessions', 'tokens']
): Promise<SyncResult> {
  const github = new GitHubAPI(config.token, config.owner, config.repo);
  const result: SyncResult = {
    success: true,
    pushed: 0,
    pulled: 0,
    conflicts: 0,
    errors: [],
  };

  try {
    // Push Activities
    if (types.includes('activities')) {
      try {
        const activities = await db.activities.toArray();
        for (const activity of activities) {
          try {
            const path = `${DATA_PATHS.activities}/${activity.activityId}.json`;
            const content = JSON.stringify(activity, null, 2);
            const sha = await getFileSha(github, path);
            
            if (sha) {
              await github.updateFile(path, content, `Update activity: ${activity.title}`, sha);
            } else {
              await github.createFile(path, content, `Create activity: ${activity.title}`);
            }
            result.pushed++;
          } catch (error: any) {
            result.errors.push(`Activity ${activity.activityId}: ${error.message}`);
          }
        }
      } catch (error: any) {
        result.errors.push(`Activities: ${error.message}`);
      }
    }

    // Push Resources
    if (types.includes('resources')) {
      try {
        const resources = await db.resources.toArray();
        for (const resource of resources) {
          try {
            const path = `${DATA_PATHS.resources}/${resource.resourceId}.json`;
            const content = JSON.stringify(resource, null, 2);
            const sha = await getFileSha(github, path);
            
            if (sha) {
              await github.updateFile(path, content, `Update resource: ${resource.title}`, sha);
            } else {
              await github.createFile(path, content, `Create resource: ${resource.title}`);
            }
            result.pushed++;
          } catch (error: any) {
            result.errors.push(`Resource ${resource.resourceId}: ${error.message}`);
          }
        }
      } catch (error: any) {
        result.errors.push(`Resources: ${error.message}`);
      }
    }

    // Push Sessions
    if (types.includes('sessions')) {
      try {
        const sessions = await db.sessions.toArray();
        for (const session of sessions) {
          try {
            const path = `${DATA_PATHS.sessions}/${session.sessionId}.json`;
            const content = JSON.stringify(session, null, 2);
            const sha = await getFileSha(github, path);
            
            if (sha) {
              await github.updateFile(path, content, `Update session: ${session.title}`, sha);
            } else {
              await github.createFile(path, content, `Create session: ${session.title}`);
            }
            result.pushed++;
          } catch (error: any) {
            result.errors.push(`Session ${session.sessionId}: ${error.message}`);
          }
        }
      } catch (error: any) {
        result.errors.push(`Sessions: ${error.message}`);
      }
    }

    // Push Tokens
    if (types.includes('tokens')) {
      try {
        const tokens = await db.tokens.toArray();
        for (const token of tokens) {
          try {
            const path = `${DATA_PATHS.tokens}/${token.tokenId}.json`;
            const content = JSON.stringify(token, null, 2);
            const sha = await getFileSha(github, path);
            
            if (sha) {
              await github.updateFile(path, content, `Update token: ${token.tokenId}`, sha);
            } else {
              await github.createFile(path, content, `Create token: ${token.tokenId}`);
            }
            result.pushed++;
          } catch (error: any) {
            result.errors.push(`Token ${token.tokenId}: ${error.message}`);
          }
        }
      } catch (error: any) {
        result.errors.push(`Tokens: ${error.message}`);
      }
    }

    // No push responses por defecto (solo lectura local normalmente)
    if (types.includes('responses')) {
      try {
        const responses = await db.responses.toArray();
        for (const response of responses) {
          try {
            const path = `${DATA_PATHS.responses}/${response.responseId}.json`;
            const content = JSON.stringify(response, null, 2);
            const sha = await getFileSha(github, path);
            
            if (sha) {
              await github.updateFile(path, content, `Update response: ${response.responseId}`, sha);
            } else {
              await github.createFile(path, content, `Create response: ${response.responseId}`);
            }
            result.pushed++;
          } catch (error: any) {
            result.errors.push(`Response ${response.responseId}: ${error.message}`);
          }
        }
      } catch (error: any) {
        result.errors.push(`Responses: ${error.message}`);
      }
    }

    result.success = result.errors.length === 0;
  } catch (error: any) {
    result.success = false;
    result.errors.push(`General error: ${error.message}`);
  }

  return result;
}

/**
 * Pull: Descargar datos de GitHub a local
 */
export async function pullFromGitHub(
  config: SyncConfig,
  types: ('activities' | 'resources' | 'sessions' | 'responses' | 'tokens')[] = ['activities', 'resources', 'sessions', 'tokens']
): Promise<SyncResult> {
  const github = new GitHubAPI(config.token, config.owner, config.repo);
  const result: SyncResult = {
    success: true,
    pushed: 0,
    pulled: 0,
    conflicts: 0,
    errors: [],
  };

  try {
    // Pull Activities
    if (types.includes('activities')) {
      try {
        const files = await github.listFiles(DATA_PATHS.activities);
        for (const file of files) {
          if (file.type === 'file' && file.name.endsWith('.json')) {
            try {
              const path = `${DATA_PATHS.activities}/${file.name}`;
              const content = await github.readFile(path);
              const activity: Activity = JSON.parse(content);
              
              // Verificar si existe localmente
              const existing = await db.activities.where('activityId').equals(activity.activityId).first();
              
              if (existing) {
                // Resolver conflicto: usar el más reciente
                if (activity.updatedAt > existing.updatedAt) {
                  await db.activities.update(existing.id!, activity);
                  result.pulled++;
                } else {
                  result.conflicts++;
                }
              } else {
                await db.activities.add(activity);
                result.pulled++;
              }
            } catch (error: any) {
              result.errors.push(`Activity ${file.name}: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        // Si el directorio no existe, no es un error crítico
        if (!error.message.includes('404')) {
          result.errors.push(`Activities: ${error.message}`);
        }
      }
    }

    // Pull Resources
    if (types.includes('resources')) {
      try {
        const files = await github.listFiles(DATA_PATHS.resources);
        for (const file of files) {
          if (file.type === 'file' && file.name.endsWith('.json')) {
            try {
              const path = `${DATA_PATHS.resources}/${file.name}`;
              const content = await github.readFile(path);
              const resource: Resource = JSON.parse(content);
              
              const existing = await db.resources.where('resourceId').equals(resource.resourceId).first();
              
              if (existing) {
                if (resource.updatedAt > existing.updatedAt) {
                  await db.resources.update(existing.id!, resource);
                  result.pulled++;
                } else {
                  result.conflicts++;
                }
              } else {
                await db.resources.add(resource);
                result.pulled++;
              }
            } catch (error: any) {
              result.errors.push(`Resource ${file.name}: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        if (!error.message.includes('404')) {
          result.errors.push(`Resources: ${error.message}`);
        }
      }
    }

    // Pull Sessions
    if (types.includes('sessions')) {
      try {
        const files = await github.listFiles(DATA_PATHS.sessions);
        for (const file of files) {
          if (file.type === 'file' && file.name.endsWith('.json')) {
            try {
              const path = `${DATA_PATHS.sessions}/${file.name}`;
              const content = await github.readFile(path);
              const session: Session = JSON.parse(content);
              
              const existing = await db.sessions.where('sessionId').equals(session.sessionId).first();
              
              if (existing) {
                if (session.updatedAt > existing.updatedAt) {
                  await db.sessions.update(existing.id!, session);
                  result.pulled++;
                } else {
                  result.conflicts++;
                }
              } else {
                await db.sessions.add(session);
                result.pulled++;
              }
            } catch (error: any) {
              result.errors.push(`Session ${file.name}: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        if (!error.message.includes('404')) {
          result.errors.push(`Sessions: ${error.message}`);
        }
      }
    }

    // Pull Tokens
    if (types.includes('tokens')) {
      try {
        const files = await github.listFiles(DATA_PATHS.tokens);
        for (const file of files) {
          if (file.type === 'file' && file.name.endsWith('.json')) {
            try {
              const path = `${DATA_PATHS.tokens}/${file.name}`;
              const content = await github.readFile(path);
              const token: Token = JSON.parse(content);
              
              const existing = await db.tokens.where('tokenId').equals(token.tokenId).first();
              
              if (existing) {
                if (token.updatedAt > existing.updatedAt) {
                  await db.tokens.update(existing.id!, token);
                  result.pulled++;
                } else {
                  result.conflicts++;
                }
              } else {
                await db.tokens.add(token);
                result.pulled++;
              }
            } catch (error: any) {
              result.errors.push(`Token ${file.name}: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        if (!error.message.includes('404')) {
          result.errors.push(`Tokens: ${error.message}`);
        }
      }
    }

    result.success = result.errors.length === 0;
  } catch (error: any) {
    result.success = false;
    result.errors.push(`General error: ${error.message}`);
  }

  return result;
}

/**
 * Sync completo: Push y Pull
 */
export async function syncWithGitHub(
  config: SyncConfig,
  types: ('activities' | 'resources' | 'sessions' | 'responses' | 'tokens')[] = ['activities', 'resources', 'sessions', 'tokens']
): Promise<SyncResult> {
  // Primero pull para obtener cambios remotos
  const pullResult = await pullFromGitHub(config, types);
  
  // Luego push para enviar cambios locales
  const pushResult = await pushToGitHub(config, types);
  
  return {
    success: pullResult.success && pushResult.success,
    pushed: pushResult.pushed,
    pulled: pullResult.pulled,
    conflicts: pullResult.conflicts + pushResult.conflicts,
    errors: [...pullResult.errors, ...pushResult.errors],
  };
}

