'use server';

/**
 * Server Actions para operaciones con GitHub API
 * Estas acciones se ejecutan en el servidor y pueden ser llamadas directamente desde componentes
 */

import { GitHubAPI } from '@/lib/github/api';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

/**
 * Leer archivo desde GitHub
 */
export async function readGitHubFile(
  config: GitHubConfig,
  path: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const github = new GitHubAPI(config.token, config.owner, config.repo);
    const content = await github.readFile(path);
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error reading file' };
  }
}

/**
 * Crear archivo en GitHub
 */
export async function createGitHubFile(
  config: GitHubConfig,
  path: string,
  content: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const github = new GitHubAPI(config.token, config.owner, config.repo);
    await github.createFile(path, content, message);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error creating file' };
  }
}

/**
 * Actualizar archivo en GitHub
 */
export async function updateGitHubFile(
  config: GitHubConfig,
  path: string,
  content: string,
  message: string,
  sha: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const github = new GitHubAPI(config.token, config.owner, config.repo);
    await github.updateFile(path, content, message, sha);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error updating file' };
  }
}

/**
 * Borrar archivo de GitHub
 */
export async function deleteGitHubFile(
  config: GitHubConfig,
  path: string,
  message: string,
  sha: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const github = new GitHubAPI(config.token, config.owner, config.repo);
    await github.deleteFile(path, message, sha);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error deleting file' };
  }
}

/**
 * Listar archivos en un directorio de GitHub
 */
export async function listGitHubFiles(
  config: GitHubConfig,
  path: string
): Promise<{ success: boolean; files?: any[]; error?: string }> {
  try {
    const github = new GitHubAPI(config.token, config.owner, config.repo);
    const files = await github.listFiles(path);
    return { success: true, files };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error listing files' };
  }
}




