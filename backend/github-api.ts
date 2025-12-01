/**
 * Backend autoalojado - GitHub API
 * 
 * Funciones para interactuar con GitHub API como backend
 * Usa los endpoints de GitHub para CRUD de archivos
 */

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface FileContent {
  path: string;
  content: string;
  sha?: string;
}

/**
 * Crear archivo en el repositorio
 */
export async function createFile(
  config: GitHubConfig,
  path: string,
  content: string,
  message: string
): Promise<void> {
  const encodedContent = Buffer.from(content).toString('base64');

  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: encodedContent,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error creating file: ${error.message || response.statusText}`);
  }
}

/**
 * Leer archivo del repositorio
 */
export async function readFile(
  config: GitHubConfig,
  path: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error reading file: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (data.type !== 'file' || !data.content) {
    throw new Error('Invalid file response');
  }

  return Buffer.from(data.content, 'base64').toString('utf-8');
}

/**
 * Actualizar archivo en el repositorio
 */
export async function updateFile(
  config: GitHubConfig,
  path: string,
  content: string,
  message: string,
  sha: string
): Promise<void> {
  const encodedContent = Buffer.from(content).toString('base64');

  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: encodedContent,
        sha,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error updating file: ${error.message || response.statusText}`);
  }
}

/**
 * Borrar archivo del repositorio
 */
export async function deleteFile(
  config: GitHubConfig,
  path: string,
  message: string,
  sha: string
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sha,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error deleting file: ${error.message || response.statusText}`);
  }
}

/**
 * Listar archivos en un directorio
 */
export async function listFiles(
  config: GitHubConfig,
  path: string
): Promise<any[]> {
  const response = await fetch(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error listing files: ${error.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (Array.isArray(data)) {
    return data;
  }
  
  return [];
}

